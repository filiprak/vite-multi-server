import { fileURLToPath } from 'url';
import { walk } from 'estree-walker';
import MagicString from 'magic-string';
import fs from 'fs';
import path from 'path';
import topLevelAwait from "vite-plugin-top-level-await";

export default ({ exposes = {}, shared = {} } = {}) => {
    const virtualModuleId = 'virtual:federation';
    const resolvedVirtualModuleId = '\0' + virtualModuleId;

    /** @type {import('vite').Plugin} */
    const plugin = {
        name: 'repo:federation',
        enforce: 'pre',

        resolveId (id) {
            if (id === virtualModuleId) {
                return resolvedVirtualModuleId;
            }
        },

        load (id) {
            if (id === resolvedVirtualModuleId) {
                const filePath = fileURLToPath(import.meta.resolve('./federation.mjs'));

                let sharedMap = Object
                    .entries(shared)
                    .map(([name, config]) => {
                        return `'${name}': { ...${JSON.stringify(config)}, load: () => import('${name}') }`
                    })
                    .join(',\n');
                sharedMap = `{ ${sharedMap} }`;

                let template = fs.readFileSync(filePath, 'utf-8');

                template = template.replace('\'[[_SHARED_MAP_]]\'', sharedMap);

                return template;
            }
        },

        async transform (code, id) {
            let ast = null;
            try {
                ast = this.parse(code);
            } catch (err) {

            }
            if (!ast) {
                return null;
            }

            const magicString = new MagicString(code);
            let hasImportShared = false;
            let modify = false;

            walk(ast, {
                enter (node) {
                    // handle share, eg. replace import {a} from b  -> const a = importShared('b')
                    if (node.type === 'ImportDeclaration') {
                        const moduleName = node.source.value

                        if (shared[moduleName] && !shared[moduleName].eager) {
                            const namedImportDeclaration = []
                            let defaultImportDeclaration = null

                            if (!node.specifiers?.length) {
                                // invalid import , like import './__federation_shared_lib.js' , and remove it
                                magicString.remove(node.start, node.end)
                                modify = true
                            } else {
                                node.specifiers.forEach((specify) => {
                                    if (specify.imported?.name) {
                                        namedImportDeclaration.push(
                                            `${specify.imported.name === specify.local.name
                                                ? specify.imported.name
                                                : `${specify.imported.name}:${specify.local.name}`
                                            }`
                                        )
                                    } else {
                                        defaultImportDeclaration = specify.local.name
                                    }
                                })

                                hasImportShared = true

                                if (
                                    defaultImportDeclaration &&
                                    namedImportDeclaration.length
                                ) {
                                    // import a, {b} from 'c' -> const a = await importShared('c'); const {b} = a;
                                    const imports = namedImportDeclaration.join(',')
                                    const line = `const ${defaultImportDeclaration} = await importShared('${moduleName}');\nconst {${imports}} = ${defaultImportDeclaration};\n`
                                    magicString.overwrite(node.start, node.end, line)
                                } else if (defaultImportDeclaration) {
                                    magicString.overwrite(
                                        node.start,
                                        node.end,
                                        `const ${defaultImportDeclaration} = await importShared('${moduleName}');\n`
                                    )
                                } else if (namedImportDeclaration.length) {
                                    magicString.overwrite(
                                        node.start,
                                        node.end,
                                        `const {${namedImportDeclaration.join(
                                            ','
                                        )}} = await importShared('${moduleName}');\n`
                                    )
                                }
                            }
                        }
                    }

                    // if (
                    //     node.type === 'ImportDeclaration' &&
                    //     node.source?.value === 'virtual:__federation__'
                    // ) {
                    //     manualRequired = node
                    // }
                },
            });
            if (hasImportShared) {
                magicString.prepend(
                    `import { importShared } from '${virtualModuleId}';\n`
                )
            }
            if (hasImportShared || modify) {
                return {
                    code: magicString.toString(),
                    map: null,
                }
            }
        },

        configureServer (server) {
            server.middlewares.use(async (req, res, next) => {
                next();
            });
        },

        generateBundle (_, bundle) {

        },

        transformIndexHtml (html) {

        }
    };
    return [
        topLevelAwait(),
        plugin,
    ];
}