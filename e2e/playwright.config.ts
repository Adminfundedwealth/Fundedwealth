import { defineConfig } from "@playwright/test";

export default defineConfig({
    testDir: "./tests",
    timeout: 120000,  // Increased to 2 minutes for complete flow test
    retries: 0,
    use: {
        baseURL: "http://localhost:5201",
        headless: true,
        screenshot: "on",
        trace: "on",
        video: "on",
    },
    reporter: [["list"], ["html", { open: "never" }]],
});
