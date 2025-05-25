import { defineConfig } from 'vite';
import federation from '@repo/compiler/federation-plugin';

export default defineConfig({
    build: {
        minify: false,
        cssMinify: false,
        rollupOptions: {
            input: './index.html',
        },
        target: 'node22',
    },
    plugins: [
        federation({
            shared: {
                '@repo/site/core': {

                },
                '@repo/site/ui': {
                    
                },
            },
        }),
    ],
});