import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
    build: {
        manifest: 'manifest.json',
        cssCodeSplit: true,
        rollupOptions: {
            // input: './src/index.ts',
        },
    },
    plugins: [
        vue(),
        cssInjectedByJsPlugin({
            injectCode: (css, options) => {
                return `
                    window.__styles = window.__styles || {};
                    const styles = window.__styles;
                    const id = ${Math.floor(Math.random() * 100000)};
                    const css = ${css};

                    styles[id] = css;
                    document.dispatchEvent(new CustomEvent('update-style', { detail: { id, css } }));
                `;
            },
        }),
        {
            name: 'shadow-dom:module',
            enforce: 'pre',

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