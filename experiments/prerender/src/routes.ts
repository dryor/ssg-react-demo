import type { ComponentType } from 'react';
import table from '../routes.json';
import { Home } from './pages/Home';
import { Pagina2 } from './pages/Pagina2';

const pages = { home: Home, pagina2: Pagina2 } satisfies Record<string, ComponentType>;

type PageId = keyof typeof pages;

const isPageId = (id: string): id is PageId => Object.hasOwn(pages, id);

export const routes = table.map(({ path, page }) => {
  if (!isPageId(page)) throw new Error(`routes.json: página desconocida "${page}" en "${path}"`);
  return { path, component: pages[page] };
});
