import { defineConfig } from 'vite';
import federation from '@repo/compiler/federation-plugin';

export default defineConfig((env) => {
    const is_remote = !!process.env.REMOTE;
    const is_ssr = !!process.env.SSR;

    console.log('Is remote', is_remote)
    console.log('Is ssr', is_ssr)

    return {
        build: {
            ssr: is_ssr,
            minify: false,
            cssMinify: false,
            emptyOutDir: !is_remote,
            rollupOptions: {
                input: is_remote ? './src/remote/app1/index.ts' : (is_ssr ? './src/index.ts' : './index.html'),
                output: {
                    hashCharacters: 'base36',
                    entryFileNames: is_remote ? `remote.js` : `host.js`,
                    chunkFileNames: is_remote ? `remote_[name]_[hash:6].js` : `host_[hash:6].js`,
                    assetFileNames: is_remote ? `remote_[name]_[hash:6].[ext]` : `host_[hash:6].[ext]`,
                },
            },
            target: is_ssr ? 'node22' : undefined,
        },
        plugins: [
            federation({
                shared: {
                    '@repo/site/core': {
                        eager: !is_remote,
                        virtual: is_remote,
                    },
                    '@repo/site/ui': {
                        virtual: is_remote,
                    },
                },
            }),
        ],
    };
});