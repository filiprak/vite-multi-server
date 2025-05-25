export function getSharedMap () {
    return '[[_SHARED_MAP_]]';
}

export function getGlobal () {
    if (!globalThis.__federation__) {
        globalThis.__federation__ = {};
    }

    return globalThis.__federation__;
}

export function init () {
    const f = getGlobal();

    f.shared = getSharedMap();
    f.remotes = {};
}

export function addRemote (options) {
    const f = getGlobal();

    const config = {
        ...options,
        load () {
            return import(config.url);
        },
    };
    f.remotes[options.name] = config;
}

export async function loadRemote (name) {
    const f = getGlobal();

    return f.remotes[name].load();
}