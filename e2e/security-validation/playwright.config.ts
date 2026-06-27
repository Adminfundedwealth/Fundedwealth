import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: 'https://www.fundedwealth.com',
        screenshot: 'on',
        trace: 'on',
        video: 'on',
    },
    reporter: [['html', { open: 'never' }], ['list']],
});
