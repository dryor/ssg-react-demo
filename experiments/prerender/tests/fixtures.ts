import { test as base, expect } from '@playwright/test';

const isExpectedNotFoundDocument = (text: string, url: string, notFoundDocuments: Set<string>) =>
  text.startsWith('Failed to load resource: the server responded with a status of 404') &&
  notFoundDocuments.has(url);

export const test = base.extend<{ consoleErrors: string[] }>({
  consoleErrors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      const notFoundDocuments = new Set<string>();
      page.on('response', (res) => {
        if (res.request().resourceType() === 'document' && res.status() === 404) notFoundDocuments.add(res.url());
      });
      page.on('console', (msg) => {
        if (msg.type() !== 'error') return;
        if (isExpectedNotFoundDocument(msg.text(), msg.location().url, notFoundDocuments)) return;
        errors.push(msg.text());
      });
      page.on('pageerror', (err) => errors.push(err.message));
      await use(errors);
      expect(errors, 'sin errores en consola (incluye hydration mismatch)').toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };
