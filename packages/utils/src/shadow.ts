import { getCurrentInstance, ref } from 'vue';
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';

function getStyles() {
    return window.__styles || {};
}

const shadow_doms = shallowRef<ShadowRoot[]>([]);

export function useShadowDom() {
    function extractShadowRoot() {
        return getCurrentInstance()?.proxy?.$el.parentNode as ShadowRoot;
    }

    function appendLink(shadow: ShadowRoot, link: HTMLLinkElement) {
        const nodes = shadow.querySelectorAll('link');
        const new_link = link.cloneNode(true) as HTMLLinkElement;

        new_link.addEventListener('load', e => link.dispatchEvent(new Event('load')))
        new_link.addEventListener('error', e => link.dispatchEvent(new Event('error')))
        new_link.rel = 'stylesheet';

        if (nodes.length > 0) {
            nodes[nodes.length - 1].parentNode?.insertBefore(new_link, nodes[nodes.length - 1].nextSibling);
        } else {
            shadow.prepend(new_link);
        }
    }

    function onStyleUpdated(evt: CustomEvent) {
        shadow_doms.value.forEach(shadow => {
            if (evt.detail.link) {
                appendLink(shadow, evt.detail.link);
            } else {
                const el = shadow.getElementById(evt.detail.id);
                if (el) {
                    el.innerHTML = evt.detail.css || '';
                } else {
                    const style = document.createElement('style');

                    style.id = evt.detail.id;
                    style.innerHTML = evt.detail.css as string;

                    shadow.prepend(style);
                }
            }
        });
    }
    function onStyleRemoved(evt: CustomEvent) {
        shadow_doms.value.forEach(shadow => {
            shadow.getElementById(evt.detail.id)?.remove();
        });
    }

    onMounted(() => {
        const shadow_root = extractShadowRoot();

        document.addEventListener('update-style', onStyleUpdated);
        document.addEventListener('remove-style', onStyleRemoved);

        for (const [id, css] of Object.entries(getStyles())) {
            if (typeof css === 'string') {
                let el = shadow_root.getElementById(id);

                if (!el) {
                    const style = document.createElement('style');

                    style.id = id;
                    style.innerHTML = css as string;

                    el = style;
                }

                shadow_root.prepend(el);
            } else {
                appendLink(shadow_root, css as HTMLLinkElement);
            }
        }

        shadow_doms.value.push(shadow_root);
    });

    onBeforeUnmount(() => {
        const shadow_root = extractShadowRoot();

        document.removeEventListener('update-style', onStyleUpdated);
        document.removeEventListener('remove-style', onStyleRemoved);

        shadow_doms.value = shadow_doms.value.filter(el => el !== shadow_root);
    });
}