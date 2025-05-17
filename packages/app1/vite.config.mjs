import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'custom-css-inject',
            enforce: 'post',
            resolveId (id) {
                if (id === 'virtual:shadow-dom') {
                    return '\0virtual:shadow-dom';
                }
            },
            load (id) {
                if (id === '\0virtual:shadow-dom') {
                    return `
                        const styles = {};
                        const update_cb = [];
                        const remove_cb = [];
                        export const onStyleUpdated = (cb) => cb();
                        export const onStyleRemoved = (cb) => cb();

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
            transform (code, id) {
                if (id.endsWith('.css')) {
                    console.log(id)

                    code = [
                        `import { __updateShadowDomStyle as __vite__updateStyle, __removeShadowDomStyle as __vite__removeStyle } from 'virtual:shadow-dom'`,
                        ...code.split('\n').slice(1)
                    ].join('\n');

                    console.log(code)

                    return {
                        code,
                        map: null,
                    };
                }
            }
        },
    ],
});