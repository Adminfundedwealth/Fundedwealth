import { test, expect } from "@playwright/test";

/**
 * LIVE FEED VERIFICATION
 * Tests that real market ticks flow from backend to frontend via WebSocket.
 * Requires: DHAN_ACCESS_TOKEN + DHAN_CLIENT_ID configured on backend.
 */

test.describe("Live Market Feed Verification", () => {

    test("WebSocket receives snapshot and/or tick messages", async ({ page }) => {
        const wsMessages: { type: string; raw: string }[] = [];
        let wsUrl = "";
        let wsOpened = false;
        let wsClosed = false;
        let closeCode = 0;

        page.on("websocket", (ws) => {
            wsUrl = ws.url();
            wsOpened = true;

            ws.on("framereceived", (frame) => {
                const payload = String(frame.payload);
                try {
                    const parsed = JSON.parse(payload);
                    wsMessages.push({ type: parsed.type || "unknown", raw: payload.slice(0, 500) });
                } catch {
                    wsMessages.push({ type: "binary/unparseable", raw: payload.slice(0, 100) });
                }
            });

            ws.on("close", () => {
                wsClosed = true;
            });
        });

        await page.goto("/trade", { waitUntil: "domcontentloaded", timeout: 20000 });

        // Wait up to 15 seconds for ticks to arrive
        for (let i = 0; i < 15; i++) {
            await page.waitForTimeout(1000);
            if (wsMessages.length >= 2) break; // Got snapshot + at least 1 tick
        }

        console.log("═══════════════════════════════════════════════");
        console.log("LIVE FEED VERIFICATION RESULTS");
        console.log("═══════════════════════════════════════════════");
        console.log(`WS URL: ${wsUrl}`);
        console.log(`WS Opened: ${wsOpened}`);
        console.log(`WS Closed: ${wsClosed}`);
        console.log(`Total messages received: ${wsMessages.length}`);
        console.log("───────────────────────────────────────────────");

        wsMessages.forEach((msg, i) => {
            console.log(`MSG[${i}] type=${msg.type}`);
            console.log(`  ${msg.raw.slice(0, 300)}`);
        });

        console.log("───────────────────────────────────────────────");

        // ASSERTIONS
        expect(wsOpened, "WebSocket should open").toBeTruthy();
        expect(wsMessages.length, "Should receive at least 1 message (snapshot)").toBeGreaterThanOrEqual(1);

        // Check for snapshot message
        const hasSnapshot = wsMessages.some(m => m.type === "snapshot");
        console.log(`Has snapshot message: ${hasSnapshot}`);

        // Check for tick messages
        const ticks = wsMessages.filter(m => m.type === "tick");
        console.log(`Tick messages received: ${ticks.length}`);

        // Check if snapshot has actual price data (not empty)
        const snapshotMsg = wsMessages.find(m => m.type === "snapshot");
        if (snapshotMsg) {
            const parsed = JSON.parse(snapshotMsg.raw);
            const quoteCount = Array.isArray(parsed.payload) ? parsed.payload.length : 0;
            console.log(`Snapshot contains ${quoteCount} quotes`);
            if (quoteCount > 0) {
                const first = parsed.payload[0];
                console.log(`First quote: ${first.symbol} @ ${first.price} (provider: ${first.provider})`);
            }
            expect(quoteCount, "Snapshot should contain at least 1 quote").toBeGreaterThan(0);
        }

        // Check if any tick has a real provider (not "mock")
        if (ticks.length > 0) {
            const firstTick = JSON.parse(ticks[0].raw);
            console.log(`First tick provider: ${firstTick.payload?.provider || "unknown"}`);
            console.log(`First tick symbol: ${firstTick.payload?.symbol}`);
            console.log(`First tick price: ${firstTick.payload?.price}`);
        }

        console.log("═══════════════════════════════════════════════");
    });

    test("Prices update without page refresh (observed over 10 seconds)", async ({ page }) => {
        await page.goto("/trade", { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(3000); // Let initial render complete

        // Capture initial price text for NIFTY
        const getPriceText = async () => {
            // The big price display in the chart toolbar
            const priceEl = page.locator("[class*='font-extrabold'][class*='tabular-nums']").first();
            try {
                return await priceEl.textContent({ timeout: 2000 });
            } catch {
                return null;
            }
        };

        const initialPrice = await getPriceText();
        console.log(`Initial price display: ${initialPrice}`);

        // Wait 10 seconds and check if price changed
        const priceSnapshots: (string | null)[] = [initialPrice];
        for (let i = 0; i < 10; i++) {
            await page.waitForTimeout(1000);
            const p = await getPriceText();
            priceSnapshots.push(p);
        }

        console.log("Price snapshots over 10 seconds:");
        priceSnapshots.forEach((p, i) => console.log(`  t+${i}s: ${p}`));

        const uniquePrices = new Set(priceSnapshots.filter(Boolean));
        console.log(`Unique prices observed: ${uniquePrices.size}`);
        console.log(`Prices changed: ${uniquePrices.size > 1 ? "YES ✅" : "NO ❌"}`);

        // If prices change, live feed is working
        // If they don't change in 10 seconds, feed is dead
        expect(uniquePrices.size, "Price should change at least once in 10 seconds if live feed is active").toBeGreaterThan(1);
    });

    test("API /api/market/quotes returns price data", async ({ page }) => {
        const response = await page.request.get("https://www.fundedwealth.com/api/market/quotes");
        const status = response.status();
        const body = await response.json().catch(() => null);

        console.log(`GET /api/market/quotes → ${status}`);
        if (body?.quotes) {
            console.log(`Quotes count: ${body.quotes.length}`);
            if (body.quotes.length > 0) {
                const sample = body.quotes.slice(0, 3);
                sample.forEach((q: any) => {
                    console.log(`  ${q.symbol}: ₹${q.price} (provider: ${q.provider}, ts: ${new Date(q.ts).toISOString()})`);
                });
            }
        } else {
            console.log(`Response body: ${JSON.stringify(body).slice(0, 300)}`);
        }

        expect(status).toBe(200);
        expect(body?.quotes?.length, "Should have at least 1 quote").toBeGreaterThan(0);
    });

    test("API /api/market/providers shows provider status", async ({ page }) => {
        const response = await page.request.get("https://www.fundedwealth.com/api/market/providers");
        const status = response.status();
        const body = await response.json().catch(() => null);

        console.log(`GET /api/market/providers → ${status}`);
        console.log(JSON.stringify(body, null, 2));

        expect(status).toBe(200);

        // Check which providers are connected
        if (body?.providers) {
            for (const [key, info] of Object.entries(body.providers) as any) {
                console.log(`  Provider ${key}: available=${info.available}, connected=${info.connected}, selected=${info.selected}`);
            }
        }
    });
});
