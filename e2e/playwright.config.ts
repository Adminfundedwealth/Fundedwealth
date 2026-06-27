import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 30000,
    retries: 0,
    use: {
        baseURL: "https://www.fundedwealth.com",
        headless: true,
        screenshot: "only-on-failure",
        trace: "retain-on-failure",
    },
    reporter: [["list"], ["html", { open: "never" }]],
});
