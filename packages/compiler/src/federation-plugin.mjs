import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

export default ({ exposes = {}, shared = {} } = {}) => {
    const virtualModuleId = 'virtual:federation';
    const resolvedVirtualModuleId = '\0' + virtualModuleId;

    /** @type {import('vite').Plugin} */
    const plugin = {
        name: 'repo:federation',

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
    return plugin;
}