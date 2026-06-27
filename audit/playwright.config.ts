import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'https://fundedwealth.com',
    screenshot: 'on',
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
  },
  reporter: [['list'], ['json', { outputFile: 'results.json' }]],
});
