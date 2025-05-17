import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer, loadConfigFromFile } from 'vite'

const root = path.resolve(fileURLToPath(import.meta.url), '../../../..');

async function createServer () {
    const app = express()
    const server = http.createServer(app);

    const config1 = await loadConfigFromFile({ command: 'serve' }, path.resolve('../app1/vite.config.mjs'));
    const config2 = await loadConfigFromFile({ command: 'serve' }, path.resolve('../app2/vite.config.mjs'));

    const vite1 = await createViteServer({
        ...config1,
        root: '../app1/',
        base: '/',
        server: {
            middlewareMode: { server },
            hmr: {
                port: 8081
            },
        },
        appType: 'custom'
    })
    const vite2 = await createViteServer({
        ...config2,
        root: '../app2/',
        base: '/',
        server: {
            middlewareMode: { server },
            hmr: {
                port: 8082
            },
        },
        appType: 'custom'
    })

    app.use('/app1', vite1.middlewares)
    app.use('/app2', vite2.middlewares)

    app.get('/', (req, res) => {
        res.sendFile(path.resolve(root, 'index.html'));
    });

    const PORT = 5173;

    server.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`)
    })
}

createServer()
