import { test, expect } from "@playwright/test";

test("Terminal live audit", async ({ page }) => {
    const logs: string[] = [];
    const errors: string[] = [];
    const netCalls: { url: string; status: number; type: string }[] = [];
    const wsList: { url: string; frames: string[] }[] = [];

    page.on("console", m => logs.push(`[${m.type()}] ${m.text()}`));
    page.on("pageerror", e => errors.push(e.message));
    page.on("response", r => {
        const u = r.url();
        if (u.includes("/api/") || u.includes("ohlc") || u.includes("quotes"))
            netCalls.push({ url: u, status: r.status(), type: r.headers()["content-type"] || "" });
    });
    page.on("websocket", ws => {
        const info = { url: ws.url(), frames: [] as string[] };
        wsList.push(info);
        ws.on("framereceived", f => info.frames.push(String(f.payload).slice(0, 100)));
    });

    await page.goto("https://www.fundedwealth.com/trade", { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(8000);

    console.log("=== NETWORK ===");
    netCalls.forEach(c => console.log(`${c.status} ${c.url.slice(0, 120)}`));
    console.log(`\n=== WEBSOCKETS (${wsList.length}) ===`);
    wsList.forEach(w => { console.log(`URL: ${w.url}`); console.log(`Frames: ${w.frames.length}`); w.frames.slice(0, 2).forEach(f => console.log(`  ${f}`)); });
    console.log(`\n=== CONSOLE LOGS (${logs.length}) ===`);
    logs.filter(l => l.includes("REST") || l.includes("poll") || l.includes("WebSocket") || l.includes("market") || l.includes("error")).slice(0, 10).forEach(l => console.log(l));
    console.log(`\n=== ERRORS (${errors.length}) ===`);
    errors.forEach(e => console.log(e));
    console.log("\n=== BUNDLE CHECK ===");
    const scripts = await page.evaluate(() => Array.from(document.querySelectorAll("script[src]")).map(s => (s as HTMLScriptElement).src).filter(s => s.includes("trade") || s.includes("index") || s.includes("App")));
    scripts.forEach(s => console.log(s));

    // Check for price display
    const priceText = await page.locator("[class*='tabular-nums'][class*='font-extrabold']").first().textContent().catch(() => "NOT FOUND");
    console.log(`\n=== PRICE DISPLAY: ${priceText} ===`);

    expect(true).toBe(true); // Always pass — we just want logs
});
