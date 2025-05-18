import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    build: {
        minify: false,
        manifest: 'manifest.json',
        cssCodeSplit: true,
        rollupOptions: {
            // input: './src/index.ts',
        },
    },
    plugins: [
        vue(),
        {
            name: 'shadow-dom:module',
            enforce: 'pre',

            generateBundle (_, bundle) {
                for (const file of Object.values(bundle)) {
                    let code = file.code || '';
                    let hasPreload = code.indexOf('__vitePreload') >= 0;

                    if (hasPreload) {
                        // Match __vitePreload function and its body
                        code = code.replace(
                            /__vitePreload[\s\S]*?(document\.head\.appendChild\s*\(\s*link\s*\))/g,
                            (fullMatch) => {
                                const modifiedBody = fullMatch.replace(
                                    /document\.head\.appendChild\(\s*link\s*\)/g,
                                    'isCss && window.__injectShadowStyle ? window.__injectShadowStyle(link) : document.head.appendChild(link)'
                                );
                                return modifiedBody;
                            }
                        );
                    }

                    file.code = code;
                }
            },

            resolveId (id) {
                if (id === 'virtual:shadow-dom') {
                    return '\0virtual:shadow-dom';
                }
            },
            load (id) {
                if (id === '\0virtual:shadow-dom') {
                    return `
                        window.__styles = window.__styles || {};
                        const styles = window.__styles;

                        window.__injectShadowStyle = (link) => {
                            document.head.appendChild(link);
                            styles[link.href] = link;
                            document.dispatchEvent(new CustomEvent('update-style', { detail: { link } }));
                        }

                        export const __updateShadowDomStyle = (id, css) => {
                            styles[id] = css;
                            document.dispatchEvent(new CustomEvent('update-style', { detail: { id, css } }));
                        }

                        export const __removeShadowDomStyle = (id) => {
                            delete styles[id];
                            document.dispatchEvent(new CustomEvent('remove-style', { detail: { id } }));
                        }

                        export const getStyles = () => styles;
                    `;
                }
            },
        },
        {
            name: 'shadow-dom',
            enforce: 'post',

            transform (code, id) {
                if (id.endsWith('.css')) {
                    code = [
                        `import { __updateShadowDomStyle as __vite__updateStyle, __removeShadowDomStyle as __vite__removeStyle } from 'virtual:shadow-dom'`,
                        ...code.split('\n').slice(1)
                    ].join('\n');

                    return {
                        code,
                        map: null,
                    };
                }
            }
        },
    ],
});