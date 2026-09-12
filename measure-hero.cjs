const { chromium } = require("./node_modules/.pnpm/node_modules/playwright/index.js");
(async () => {
  const b = await chromium.launch({ headless: true });
  const viewports = [
    [1920, 1080], [1440, 900], [1366, 768], [1280, 720]
  ];
  for (const [w, h] of viewports) {
    const page = await b.newPage();
    await page.setViewportSize({ width: w, height: h });
    await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(800);
    const d = await page.evaluate(() => {
      const section = document.getElementById("home");
      const sr = section ? section.getBoundingClientRect() : {};
      const h1r = document.querySelector("h1") ? document.querySelector("h1").getBoundingClientRect() : {};
      const explore = Array.from(document.querySelectorAll("button,a")).find(function(e) { return e.textContent.includes("EXPLORE PLANS"); });
      const er = explore ? explore.getBoundingClientRect() : {};
      const free = Array.from(document.querySelectorAll("button,a")).find(function(e) { return e.textContent.includes("FREE TRIAL ACCOUNT"); });
      const fr = free ? free.getBoundingClientRect() : {};
      return {
        vh: window.innerHeight,
        sectionTop: Math.round(sr.top || 0),
        sectionH: Math.round(sr.height || 0),
        h1Top: Math.round(h1r.top || 0),
        h1Bottom: Math.round(h1r.bottom || 0),
        exploreBottom: Math.round(er.bottom || 0),
        freeTrialBottom: Math.round(fr.bottom || 0)
      };
    });
    process.stdout.write(w + "x" + h + ": " + JSON.stringify(d) + "\n");
    await page.close();
  }
  await b.close();
})().catch(function(e) { process.stderr.write(String(e) + "\n"); process.exit(1); });
