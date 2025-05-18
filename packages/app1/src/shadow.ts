import { getCurrentInstance, ref } from 'vue';
import { onBeforeUnmount, onMounted, shallowRef } from 'vue';
import { getStyles } from 'virtual:shadow-dom';

const shadow_doms = shallowRef<ShadowRoot[]>([]);

export function useShadowDom() {
    function extractShadowRoot() {
        return getCurrentInstance()?.proxy?.$el.parentNode as ShadowRoot;
    }

    function onStyleUpdated(evt: CustomEvent) {
        shadow_doms.value.forEach(shadow => {
            const el = shadow.getElementById(evt.detail.id);
            if (el) {
                el.innerHTML = evt.detail.css || '';
            } else {
                const style = document.createElement('style');

                style.id = evt.detail.id;
                style.innerHTML = evt.detail.css as string;

                shadow.prepend(style);
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
            let el = shadow_root.getElementById(id);

            if (!el) {
                const style = document.createElement('style');

                style.id = id;
                style.innerHTML = css as string;

                el = style;
            }

            shadow_root.prepend(el);

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