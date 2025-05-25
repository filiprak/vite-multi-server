import { defineConfig } from 'vite';
import federation from '@repo/compiler/federation-plugin';

export default defineConfig((env) => {
    const is_remote = !!process.env.REMOTE;

    return {
        build: {
            minify: false,
            cssMinify: false,
            emptyOutDir: !is_remote,
            rollupOptions: {
                input: is_remote ? './src/remote/app1/index.ts' : './index.html',
                output: {
                    hashCharacters: 'base36',
                    entryFileNames: is_remote ? `remote.js` : `host_[hash:6].js`,
                    chunkFileNames: is_remote ? `remote_[name]_[hash:6].js` : `host_[hash:6].js`,
                    assetFileNames: is_remote ? `remote_[name]_[hash:6].[ext]` : `host_[hash:6].[ext]`,
                },
            },
            // target: 'node22',
        },
        plugins: [
            federation({
                shared: {
                    '@repo/site/core': {
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