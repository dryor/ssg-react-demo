import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import type { RsbuildPlugin } from '@rsbuild/core';
import table from './routes.json' with { type: 'json' };

const EMPTY_ROOT = '<div id="root"></div>';

const prerenderPaths = table
  .filter((route) => route.prerender)
  .map(({ path }) => {
    if (!path.startsWith('/') || /[:*?]/.test(path)) {
      throw new Error(`routes.json: "${path}" no es una ruta estática pre-renderizable`);
    }
    return path;
  });

const outputFile = (path: string) => join(path, 'index.html');

export const pluginPrerender = (): RsbuildPlugin => ({
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
      for (const path of prerenderPaths) {
        const appHtml: string = await render(path);
        const file = join(webDist, outputFile(path));
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, template.replace(EMPTY_ROOT, () => `<div id="root">${appHtml}</div>`));
      }
    });
  },
});
