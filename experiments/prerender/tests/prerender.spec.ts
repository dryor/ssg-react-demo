import routes from '../routes.json' with { type: 'json' };
import { expect, test } from './fixtures';

const EMPTY_ROOT = '<div id="root"></div>';

test.describe('El visitante ve el home de inmediato al entrar', () => {
  test('Visitante abre "/", ve el home y puede interactuar', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();

    await page.getByRole('button', { name: 'Clics: 0' }).click();
    await expect(page.getByRole('button', { name: 'Clics: 1' })).toBeVisible();
  });
});

test.describe('El home llega pre-renderizado', () => {
  test.use({ javaScriptEnabled: false });

  test('Ingeniera solicita "/" y el documento ya contiene el home', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();
  });
});

test.describe('Página 2 se renderiza en el cliente', () => {
  test('el documento recibido no contiene página 2', async ({ request }) => {
    const html = await (await request.get('/pagina-2')).text();
    expect(html).toContain(EMPTY_ROOT);
    expect(html).not.toContain('Página 2');
  });

  test('al cargar la aplicación, ve página 2', async ({ page }) => {
    await page.goto('/pagina-2');
    await expect(page.getByRole('heading', { name: 'Página 2' })).toBeVisible();
  });
});

test.describe('Navegar entre páginas no solicita documentos nuevos', () => {
  test('Ingeniera abre "/", va a "/pagina-2" y vuelve a "/"', async ({ page }) => {
    const documents: string[] = [];
    page.on('request', (req) => {
      if (req.resourceType() === 'document') documents.push(req.url());
    });

    await page.goto('/');
    await page.getByRole('link', { name: 'Ir a página 2' }).click();
    await expect(page.getByRole('heading', { name: 'Página 2' })).toBeVisible();
    await expect(page).toHaveURL('/pagina-2');

    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page.getByRole('heading', { name: 'Inicio' })).toBeVisible();
    await expect(page).toHaveURL('/');

    expect(documents).toHaveLength(1);
  });
});

test.describe('Constraints', () => {
  const prerendered = routes.filter((r) => r.prerender).map((r) => r.path);
  const notConfigured = [...routes.filter((r) => !r.prerender).map((r) => r.path), '/ruta-no-configurada'];

  for (const path of prerendered) {
    test(`ruta pre-renderizada "${path}" llega con contenido en el root`, async ({ request }) => {
      const html = await (await request.get(path)).text();
      expect(html).toMatch(/<div id="root">.+<\/div>/s);
      expect(html).not.toContain(EMPTY_ROOT);
    });

    test(`ruta pre-renderizada "${path}" hidrata sin errores`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    });
  }

  for (const path of notConfigured) {
    test(`ruta no configurada "${path}" sirve el shell único con root vacío`, async ({ request }) => {
      const shell = await (await request.get('/spa.html')).text();
      const html = await (await request.get(path)).text();
      expect(shell).toContain(EMPTY_ROOT);
      expect(html).toBe(shell);
    });
  }
});
