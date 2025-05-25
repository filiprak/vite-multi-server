export function getSharedMap() {
    return '[[_SHARED_MAP_]]';
}

export async function init() {
    const f = globalThis.__federation__ = globalThis.__federation__ || {};

    f.shared = getSharedMap();
}