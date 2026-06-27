import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './tests',
    timeout: 120000,
    reporter: 'list',
    use: {
        launchOptions: {
            args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process'],
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { browserName: 'chromium' },
        },
    ],
});
