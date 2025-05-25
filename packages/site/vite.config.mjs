import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        minify: false,
        cssMinify: false,
        rollupOptions: {
            input: './index.html',
        },
    },
    plugins: [],
});