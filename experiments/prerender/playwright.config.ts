import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  forbidOnly: !!process.env.CI,
  reporter: 'list',
  projects: [
    {
      name: 'static',
      testMatch: 'prerender.spec.ts',
      use: { baseURL: process.env.BASE_URL ?? 'http://localhost:8080' },
    },
    {
      name: 'dev',
      testMatch: 'dev.spec.ts',
      use: { baseURL: process.env.DEV_URL ?? 'http://localhost:3000' },
    },
  ],
});
