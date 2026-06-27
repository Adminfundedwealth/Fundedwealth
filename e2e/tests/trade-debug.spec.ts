import { test } from "@playwright/test";

test("Trade terminal debug - headed with trace", async ({ page }) => {
    const logs: string[] = [];
    const netCalls: string[] = [];
    const wsList: { url: string; frames: string[]; error?: string }[] = [];

    page.on("console", m => logs.push(`[${m.type()}] ${m.text()}`));
    page.on("pageerror", e => logs.push(`[CRASH] ${e.message}`));
    page.on("response", r => {
        const u = r.url();
        if (u.includes("/api/") || u.includes("ohlc") || u.includes("quotes") || u.includes("/ws/"))
            netCalls.push(`${r.status()} ${r.request().method()} ${u}`);
    });
    page.on("requestfailed", r => {
        netCalls.push(`FAILED ${r.method()} ${r.url()} reason=${r.failure()?.errorText}`);
    });
    page.on("websocket", ws => {
        const info = { url: ws.url(), frames: [] as string[], error: undefined as string | undefined };
        wsList.push(info);
        ws.on("framereceived", f => info.frames.push(String(f.payload).slice(0, 150)));
        ws.on("framesent", f => info.frames.push(`SENT:${String(f.payload).slice(0, 80)}`));
        ws.on("close", () => info.frames.push("CLOSED"));
    });

    await page.goto("https://www.fundedwealth.com/trade", { timeout: 60000, waitUntil: "commit" });

    // Take screenshots every 10s for 60s
    for (let i = 0; i < 6; i++) {
        await page.waitForTimeout(10000);
        await page.screenshot({ path: `e2e/screenshots/trade-${i * 10}s.png`, fullPage: false });
    }

    // Dump everything
    console.log("\n========== NETWORK CALLS ==========");
    netCalls.forEach(c => console.log(c));
    console.log(`\n========== WEBSOCKETS (${wsList.length}) ==========`);
    wsList.forEach(w => {
        console.log(`WS URL: ${w.url}`);
        console.log(`WS Frames: ${w.frames.length}`);
        w.frames.slice(0, 5).forEach(f => console.log(`  ${f.slice(0, 200)}`));
    });
    console.log(`\n========== CONSOLE (${logs.length}) ==========`);
    logs.slice(0, 30).forEach(l => console.log(l));
    console.log("\n========== END ==========");
});
