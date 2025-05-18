export default () => {
    /** @type {import('vite').Plugin} */
    const plugin = {
        name: 'repo:shadow-dom',
        enforce: 'post',

        renderChunk (code, chunk) {
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
            return {
                code,
                map: null,
            };
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

                        const static_links = document.querySelectorAll('link[rel=shadow-dom]');
                        for (const link of static_links) { styles[link.href] = link; link.remove();  }

                        window.__injectShadowStyle = (link) => {
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
        },
        transformIndexHtml (html) {
            return html.replace(
                /<link\s+([^>]*?)rel=["']stylesheet["']([^>]*?)>/gi,
                (_match, beforeRel, afterRel) =>
                    `<link ${beforeRel}rel="shadow-dom"${afterRel}>`
            );
        },
    };
    return plugin;
}