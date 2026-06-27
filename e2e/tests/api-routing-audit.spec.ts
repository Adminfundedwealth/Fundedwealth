import { test, expect } from "@playwright/test";

/**
 * API ROUTING AUDIT
 * Traces every actual network request from the production frontend
 * to determine where the backend API lives.
 */

test.describe("API Routing Audit", () => {

    test("Trace ALL /api/ requests from /trade page", async ({ page }) => {
        const apiCalls: { method: string; url: string; status: number; contentType: string; bodyPreview: string }[] = [];

        page.on("response", async (res) => {
            const url = res.url();
            if (url.includes("/api/") || url.includes("/ws/")) {
                let body = "";
                try { body = (await res.text()).slice(0, 200); } catch { }
                apiCalls.push({
                    method: res.request().method(),
                    url,
                    status: res.status(),
                    contentType: res.headers()["content-type"] || "unknown",
                    bodyPreview: body,
                });
            }
        });

        await page.goto("https://www.fundedwealth.com/trade", { waitUntil: "networkidle", timeout: 30000 }).catch(() => { });
        await page.waitForTimeout(5000);

        console.log("═══════════════════════════════════════════════");
        console.log("ALL /api/ AND /ws/ REQUESTS FROM /trade PAGE");
        console.log("═══════════════════════════════════════════════");
        apiCalls.forEach((c, i) => {
            console.log(`[${i}] ${c.method} ${c.status} ${c.url}`);
            console.log(`    Content-Type: ${c.contentType}`);
            console.log(`    Body: ${c.bodyPreview.slice(0, 150)}`);
            console.log("");
        });
        console.log(`Total API calls: ${apiCalls.length}`);
        console.log("═══════════════════════════════════════════════");
    });

    test("Trace ALL /api/ requests from /checkout page", async ({ page }) => {
        const apiCalls: { method: string; url: string; status: number; contentType: string; bodyPreview: string }[] = [];

        page.on("response", async (res) => {
            const url = res.url();
            if (url.includes("/api/") || url.includes("razorpay") || url.includes("oxapay")) {
                let body = "";
                try { body = (await res.text()).slice(0, 200); } catch { }
                apiCalls.push({
                    method: res.request().method(),
                    url,
                    status: res.status(),
                    contentType: res.headers()["content-type"] || "unknown",
                    bodyPreview: body,
                });
            }
        });

        await page.goto("https://www.fundedwealth.com/checkout", { waitUntil: "networkidle", timeout: 20000 }).catch(() => { });
        await page.waitForTimeout(3000);

        console.log("═══════════════════════════════════════════════");
        console.log("ALL /api/ REQUESTS FROM /checkout PAGE");
        console.log("═══════════════════════════════════════════════");
        apiCalls.forEach((c, i) => {
            console.log(`[${i}] ${c.method} ${c.status} ${c.url}`);
            console.log(`    Content-Type: ${c.contentType}`);
            console.log(`    Body: ${c.bodyPreview.slice(0, 150)}`);
            console.log("");
        });
        console.log(`Total API calls: ${apiCalls.length}`);
        console.log("═══════════════════════════════════════════════");
    });

    test("Trace WebSocket connection details", async ({ page }) => {
        const wsInfo: { url: string; frames: string[]; closed: boolean; closeCode?: number }[] = [];

        page.on("websocket", (ws) => {
            const info = { url: ws.url(), frames: [] as string[], closed: false, closeCode: undefined as number | undefined };
            wsInfo.push(info);

            ws.on("framereceived", (frame) => {
                info.frames.push(`RECV: ${String(frame.payload).slice(0, 300)}`);
            });
            ws.on("framesent", (frame) => {
                info.frames.push(`SENT: ${String(frame.payload).slice(0, 300)}`);
            });
            ws.on("close", () => {
                info.closed = true;
            });
        });

        await page.goto("https://www.fundedwealth.com/trade", { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => { });
        await page.waitForTimeout(10000);

        console.log("═══════════════════════════════════════════════");
        console.log("WEBSOCKET CONNECTION DETAILS");
        console.log("═══════════════════════════════════════════════");
        wsInfo.forEach((ws, i) => {
            console.log(`WS[${i}] URL: ${ws.url}`);
            console.log(`  Closed: ${ws.closed}`);
            console.log(`  Frames: ${ws.frames.length}`);
            ws.frames.slice(0, 5).forEach((f, j) => {
                console.log(`  [${j}] ${f}`);
            });
        });
        if (wsInfo.length === 0) {
            console.log("NO WEBSOCKET CONNECTIONS DETECTED");
        }
        console.log("═══════════════════════════════════════════════");
    });

    test("Inspect production bundle for API_BASE_URL", async ({ page }) => {
        await page.goto("https://www.fundedwealth.com/trade", { waitUntil: "domcontentloaded", timeout: 30000 }).catch(() => { });

        // Extract the actual API base URL from the running app
        const apiBaseUrl = await page.evaluate(() => {
            // Check for any global or meta env vars
            const meta = (window as any).__VITE_META_ENV__ || {};
            return {
                VITE_API_URL: meta.VITE_API_URL || (import.meta as any)?.env?.VITE_API_URL || "not found in runtime",
                windowOrigin: window.location.origin,
                // Check if there's a proxy rewrite happening
                baseUrl: document.querySelector("base")?.href || "no base tag",
            };
        }).catch(() => ({ VITE_API_URL: "eval failed", windowOrigin: "unknown", baseUrl: "unknown" }));

        console.log("═══════════════════════════════════════════════");
        console.log("PRODUCTION BUNDLE API CONFIG");
        console.log("═══════════════════════════════════════════════");
        console.log(`VITE_API_URL (runtime): ${apiBaseUrl.VITE_API_URL}`);
        console.log(`window.location.origin: ${apiBaseUrl.windowOrigin}`);
        console.log(`<base> tag: ${apiBaseUrl.baseUrl}`);
        console.log("═══════════════════════════════════════════════");

        // Also fetch the main JS bundle and search for API URLs
        const scripts = await page.evaluate(() => {
            return Array.from(document.querySelectorAll("script[src]")).map(s => (s as HTMLScriptElement).src);
        });
        console.log("Loaded scripts:");
        scripts.forEach(s => console.log(`  ${s}`));
    });

    test("Direct HTTP request to fundedwealth.com/api/health", async ({ request }) => {
        const res = await request.get("https://www.fundedwealth.com/api/health");
        const body = await res.text();
        console.log("═══════════════════════════════════════════════");
        console.log("GET https://www.fundedwealth.com/api/health");
        console.log(`Status: ${res.status()}`);
        console.log(`Content-Type: ${res.headers()["content-type"]}`);
        console.log(`Body (first 300): ${body.slice(0, 300)}`);
        console.log("═══════════════════════════════════════════════");
    });

    test("Direct HTTP request to fundedwealth.com/api/positions", async ({ request }) => {
        const res = await request.get("https://www.fundedwealth.com/api/positions");
        const body = await res.text();
        console.log("═══════════════════════════════════════════════");
        console.log("GET https://www.fundedwealth.com/api/positions");
        console.log(`Status: ${res.status()}`);
        console.log(`Content-Type: ${res.headers()["content-type"]}`);
        console.log(`Body (first 300): ${body.slice(0, 300)}`);
        console.log("═══════════════════════════════════════════════");
    });

    test("Direct HTTP request to fundedwealth.com/api/market/providers", async ({ request }) => {
        const res = await request.get("https://www.fundedwealth.com/api/market/providers");
        const body = await res.text();
        console.log("═══════════════════════════════════════════════");
        console.log("GET https://www.fundedwealth.com/api/market/providers");
        console.log(`Status: ${res.status()}`);
        console.log(`Content-Type: ${res.headers()["content-type"]}`);
        console.log(`Body (first 500): ${body.slice(0, 500)}`);
        console.log("═══════════════════════════════════════════════");
    });
});
