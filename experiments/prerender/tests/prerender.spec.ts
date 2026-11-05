import routes from '../routes.json' with { type: 'json' };
import { expect, test } from './fixtures';

const EMPTY_ROOT = '<div id="root"></div>';
const PRERENDER = 'pre render';
const CSR = 'no prerenderizado';
const NOT_FOUND = '404';

test.describe('El visitante ve el home de inmediato al entrar', () => {
  test('Visitante abre "/", ve "pre render" y sigue su link', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(PRERENDER, { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'Ir a página 2' }).click();
    await expect(page.getByText(CSR, { exact: true })).toBeVisible();
  });
});

test.describe('El home llega pre-renderizado', () => {
  test.use({ javaScriptEnabled: false });

  test('Ingeniera solicita "/" y el documento ya contiene "pre render"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText(PRERENDER, { exact: true })).toBeVisible();
  });
});

test.describe('Página 2 se renderiza en el cliente', () => {
  test('el documento recibido no contiene "no prerenderizado"', async ({ request }) => {
    const html = await (await request.get('/pagina-2')).text();
    expect(html).toContain(EMPTY_ROOT);
    expect(html).not.toContain(CSR);
  });

  test('al cargar la aplicación, ve "no prerenderizado"', async ({ page }) => {
    await page.goto('/pagina-2');
    await expect(page.getByText(CSR, { exact: true })).toBeVisible();
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
    await expect(page.getByText(CSR, { exact: true })).toBeVisible();
    await expect(page).toHaveURL('/pagina-2');

    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page.getByText(PRERENDER, { exact: true })).toBeVisible();
    await expect(page).toHaveURL('/');

    expect(documents).toHaveLength(1);
  });
});

test.describe('Una URL desconocida responde 404', () => {
  test('estado 404 y el documento ya contiene "404"', async ({ request }) => {
    const response = await request.get('/ruta-no-configurada');
    expect(response.status()).toBe(404);
    expect(await response.text()).toMatch(/<div id="root">.*>404<.*<\/div>/s);
  });

  test('hidrata sin errores y muestra "404"', async ({ page }) => {
    await page.goto('/ruta-no-configurada');
    await expect(page.getByText(NOT_FOUND, { exact: true })).toBeVisible();
    await page.waitForLoadState('networkidle');
  });
});

test.describe('La barra final redirige a la URL canónica', () => {
  test('"/pagina-2/" responde 301 a "/pagina-2"', async ({ request }) => {
    const response = await request.get('/pagina-2/', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers().location).toBe('/pagina-2');
  });

  test('Visitante abre "/pagina-2/" y ve "no prerenderizado"', async ({ page }) => {
    await page.goto('/pagina-2/');
    await expect(page).toHaveURL('/pagina-2');
    await expect(page.getByText(CSR, { exact: true })).toBeVisible();
  });
});

test.describe('Constraints', () => {
  const prerendered = routes.filter((r) => r.prerender).map((r) => r.path);
  const csr = routes.filter((r) => !r.prerender).map((r) => r.path);

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

  for (const path of csr) {
    test(`ruta CSR "${path}" sirve el shell único con root vacío`, async ({ request }) => {
      const shell = await (await request.get('/spa.html')).text();
      const response = await request.get(path);
      expect(response.status()).toBe(200);
      expect(shell).toContain(EMPTY_ROOT);
      expect(await response.text()).toBe(shell);
    });
  }

  test('el código de servidor no se publica', async ({ request }) => {
    expect((await request.get('/server/index.js')).status()).toBe(404);
  });
});
