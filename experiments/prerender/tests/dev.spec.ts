import { expect, test } from './fixtures';

test.describe('En desarrollo no hay pre-render', () => {
  test('"/" llega con el root vacío', async ({ request }) => {
    const html = await (await request.get('/')).text();
    expect(html).toContain('<div id="root"></div>');
  });

  test('al cargar la aplicación, ve "pre render"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('pre render', { exact: true })).toBeVisible();
  });
});
