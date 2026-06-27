import { chromium } from "playwright";
import fs from "fs";

const OUT = "e2e/debug-output";
fs.mkdirSync(OUT, { recursive: true });

(async () => {
    console.log("Launching browser...");
    let browser;
    try {
        browser = await chromium.launch({ headless: false, slowMo: 100 });
    } catch (err) {
        console.error("BROWSER LAUNCH FAILED:", err.message);
        process.exit(1);
    }

    const context = await browser.newContext({
        recordVideo: { dir: OUT },
        recordHar: { path: `${OUT}/trace.har` },
    });
    await context.tracing.start({ screenshots: true, snapshots: true });
    const page = await context.newPage();

    const failed = [];
    const wsUrls = [];
    const wsFrames = [];
    const responses = [];

    page.on("requestfailed", r => failed.push(`${r.method()} ${r.url()} → ${r.failure()?.errorText}`));
    page.on("response", r => responses.push(`${r.status()} ${r.request().method()} ${r.url()}`));
    page.on("websocket", ws => {
        wsUrls.push(ws.url());
        ws.on("framereceived", f => wsFrames.push(String(f.payload).slice(0, 200)));
        ws.on("close", () => wsFrames.push("WS_CLOSED"));
    });

    console.log("Navigating to https://www.fundedwealth.com/trade ...");
    try {
        await page.goto("https://www.fundedwealth.com/trade", { timeout: 60000, waitUntil: "domcontentloaded" });
    } catch (err) {
        console.error("NAVIGATION FAILED:", err.message);
        await page.screenshot({ path: `${OUT}/nav-error.png` });
    }

    console.log("Page URL:", page.url());
    console.log("Title:", await page.title());

    await page.screenshot({ path: `${OUT}/after-load.png` });
    console.log("Screenshot saved: after-load.png");

    // Wait 15s for REST/WS to fire
    await page.waitForTimeout(15000);
    await page.screenshot({ path: `${OUT}/after-15s.png` });

    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 1000) || "EMPTY");
    console.log("\n=== BODY TEXT (first 1000) ===");
    console.log(bodyText);

    console.log("\n=== FAILED REQUESTS ===");
    failed.forEach(f => console.log(f));

    console.log("\n=== WEBSOCKET URLS ===");
    wsUrls.forEach(u => console.log(u));

    console.log("\n=== WEBSOCKET FRAMES ===");
    wsFrames.slice(0, 5).forEach(f => console.log(f));

    console.log("\n=== RESPONSES (api/ws only) ===");
    responses.filter(r => r.includes("/api/") || r.includes("/ws/")).forEach(r => console.log(r));

    console.log("\n=== ALL RESPONSES ===");
    responses.slice(0, 20).forEach(r => console.log(r));

    await context.tracing.stop({ path: `${OUT}/trace.zip` });
    await context.close();
    await browser.close();

    console.log("\n=== OUTPUT FILES ===");
    console.log("Screenshot: " + OUT + "/after-load.png");
    console.log("Screenshot: " + OUT + "/after-15s.png");
    console.log("HAR: " + OUT + "/trace.har");
    console.log("Trace: " + OUT + "/trace.zip");
    console.log("Video: check " + OUT + "/ for .webm files");
    console.log("\nDONE.");
})();
