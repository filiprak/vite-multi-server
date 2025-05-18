import fg from 'fast-glob';
import fs from 'fs/promises';
import path from 'path';

export async function findPackagesWithDevServer (rootDir) {
    const packageJsonPaths = await fg('packages/*/package.json', {
        cwd: rootDir,
        ignore: ['**/node_modules/**', '**/dist/**'],
        absolute: true,
    });

    const result = {};

    for (const packageJsonPath of packageJsonPaths) {
        const content = await fs.readFile(packageJsonPath, 'utf8');
        const pkg = JSON.parse(content);

        if (pkg?.devServer?.serve) {
            const dir = path.dirname(packageJsonPath);
            const name = path.basename(dir);
            result[name] = { dir };
        }
    }

    return result;
}
