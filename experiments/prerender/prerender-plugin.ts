import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RsbuildPlugin } from '@rsbuild/core';
import table from './routes.json' with { type: 'json' };

const EMPTY_ROOT = '<div id="root"></div>';
const NOT_FOUND_URL = '/404.html';

const routes = table.map((route) => {
  if (!route.path.startsWith('/') || /[:*?]|.\/$/.test(route.path)) {
    throw new Error(`routes.json: "${route.path}" debe ser una ruta estática sin barra final`);
  }
  return route;
});

const outputFile = (path: string) => join(path, 'index.html');

const csrRoutesMap = () =>
  routes
    .filter((route) => !route.prerender)
    .map(({ path }) => `${path} 1;\n`)
    .join('');

export const pluginPrerender = ({ nginxDir }: { nginxDir: string }): RsbuildPlugin => ({
  name: 'prerender',
  setup(api) {
    api.onAfterBuild(async ({ environments }) => {
      const webDist = environments.web.distPath;
      const serverDist = environments.node.distPath;

      const template = await readFile(join(webDist, 'index.html'), 'utf8');
      if (template.split(EMPTY_ROOT).length !== 2) {
        throw new Error(`dist/index.html debe contener ${EMPTY_ROOT} exactamente una vez`);
      }
      await writeFile(join(webDist, 'spa.html'), template);

      const { render } = await import(pathToFileURL(join(serverDist, 'index.js')).href);
      const write = async (file: string, url: string) => {
        const appHtml: string = await render(url);
        const target = join(webDist, file);
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, template.replace(EMPTY_ROOT, () => `<div id="root">${appHtml}</div>`));
      };

      for (const { path } of routes.filter((route) => route.prerender)) await write(outputFile(path), path);
      await write(NOT_FOUND_URL, NOT_FOUND_URL);

      const mapFile = join(api.context.rootPath, nginxDir, 'csr-routes.map');
      await mkdir(dirname(mapFile), { recursive: true });
      await writeFile(mapFile, csrRoutesMap());
    });
  },
});
