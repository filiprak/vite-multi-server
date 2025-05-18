import path from 'node:path'
import http from 'node:http'
import chalk from 'chalk'
import { fileURLToPath } from 'node:url'
import express from 'express'
import { createServer as createViteServer, loadConfigFromFile, version } from 'vite'
import { findPackagesWithDevServer } from './utils.mjs'

const root = path.resolve(fileURLToPath(import.meta.url), '../../../..');

async function createServer () {
    const app = express()
    const server = http.createServer(app);

    const packages = await findPackagesWithDevServer(root);
    const configs = {};
    let HMR_BASE_PORT = 8080;

    await Promise.all(
        Object
            .entries(packages)
            .map(async ([name, { dir }]) => {
                configs[name] = await loadConfigFromFile({ command: 'serve' }, path.resolve(dir, 'vite.config.mjs'));
            })
    );

    await Promise.all(
        Object
            .entries(packages)
            .map(async ([name, { dir }]) => {
                const vite = await createViteServer({
                    ...configs[name],
                    root: dir,
                    base: `/${name}/`,
                    server: {
                        middlewareMode: { server },
                        hmr: {
                            port: HMR_BASE_PORT++
                        },
                    },
                    appType: 'custom'
                });
                app.use(`/${name}`, vite.middlewares);
            })
    );

    app.get('/', (req, res) => {
        res.sendFile(path.resolve(root, 'index.html'));
    });

    const PORT = 5173;

    server.listen(PORT, () => {
        console.log(chalk.bold.green(`  VITE v${version} Multi-Dev Server`))
        console.log('')
        console.log(chalk.bold.white('  ➜  Local:    ') + chalk.cyan(`http://localhost:${PORT}/`))
        console.log('')
        console.log(chalk.bold.white(`  Serving ${Object.keys(packages).length} package(s):`))

        Object
            .entries(packages)
            .map(async ([name, { dir }]) => {
                console.log(chalk.dim(`  ➜  Package '${name}': `) + chalk.cyan(`http://localhost:${PORT}/${name}/`))
            })

    })
}

createServer()
