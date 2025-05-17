import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer } from 'vite'

const root = path.resolve(fileURLToPath(import.meta.url), '../../../..');

async function createServer () {
    const app = express()

    const vite1 = await createViteServer({
        root: '../app1/',
        base: '/',
        server: app,
        appType: 'custom'
    })
    const vite2 = await createViteServer({
        root: '../app2/',
        base: '/',
        server: app,
        appType: 'custom'
    })

    app.use('/app1', vite1.middlewares)
    app.use('/app2', vite2.middlewares)

    app.get('/', (req, res) => {
        res.sendFile(path.resolve(root, 'index.html'));
    });

    const PORT = 5173;

    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}`)
    })
}

createServer()
