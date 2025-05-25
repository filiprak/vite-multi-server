export function getGlobal () {
    if (!globalThis.__federation__) {
        globalThis.__federation__ = {
            shared: '[[_SHARED_MAP_]]',
            remotes: {},
        };
    }

    return globalThis.__federation__;
}

export async function loadAndRunEval (url) {
    const res = await fetch(url);
    const code = await res.text();

    eval(code);
}

export function addRemote (options) {
    const f = getGlobal();

    const config = {
        ...options,
        load () {
            return import.meta.env.SSR ? loadAndRunEval(config.url) : import(config.url);
        },
    };
    f.remotes[options.name] = config;
}

export async function loadShared (name) {
    const f = getGlobal();

    return f.shared[name].load();
}

export async function importShared (name) {
    return loadShared(name);
}

export async function loadRemote (name) {
    const f = getGlobal();

    return f.remotes[name].load();
}
