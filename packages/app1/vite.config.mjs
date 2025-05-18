import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import shadowDom from '@repo/compiler/shadow-plugin';

export default defineConfig({
    build: {
        minify: true,
        manifest: 'manifest.json',
        cssCodeSplit: true,
        rollupOptions: {
            // input: [
            //     './src/el1/index.ts',
            //     './src/el2/index.ts',
            // ],
        },
    },
    plugins: [
        vue(),
        shadowDom(),
    ],
});