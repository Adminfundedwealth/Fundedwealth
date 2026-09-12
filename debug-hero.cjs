const { chromium } = require("./node_modules/.pnpm/node_modules/playwright/index.js");
(async () => {
  const b = await chromium.launch({ headless: true });
  for (const [w, h] of [[1366, 768], [1280, 720]]) {
    const page = await b.newPage();
    await page.setViewportSize({ width: w, height: h });
    await page.goto("http://localhost:4173/", { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(1500);
    const d = await page.evaluate(function() {
      var section = document.getElementById("home");
      var contentDiv = section ? section.querySelector("[class*='hero-content-pad']") : null;
      var h1 = document.querySelector("h1");
      var h1r = h1 ? h1.getBoundingClientRect() : {};
      var badge = section ? section.querySelector("[class*='mb-2']") : null;
      var badgeR = badge ? badge.getBoundingClientRect() : {};
      var explore = Array.from(document.querySelectorAll("button,a")).find(function(e) { return e.textContent.includes("EXPLORE PLANS"); });
      var er = explore ? explore.getBoundingClientRect() : {};
      var free = Array.from(document.querySelectorAll("button,a")).find(function(e) { return e.textContent.includes("FREE TRIAL ACCOUNT"); });
      var fr = free ? free.getBoundingClientRect() : {};
      var cs = contentDiv ? window.getComputedStyle(contentDiv) : null;
      return {
        vh: window.innerHeight,
        paddingTop: cs ? cs.paddingTop : "no div",
        paddingBottom: cs ? cs.paddingBottom : "no div",
        contentDivClass: contentDiv ? contentDiv.className.substring(0,80) : "NOT FOUND",
        h1Top: Math.round(h1r.top || 0),
        h1Bottom: Math.round(h1r.bottom || 0),
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : "n/a",
        badgeTop: Math.round(badgeR.top || 0),
        exploreBottom: Math.round(er.bottom || 0),
        freeTrialBottom: Math.round(fr.bottom || 0),
      };
    });
    process.stdout.write(w + "x" + h + ": " + JSON.stringify(d, null, 0) + "\n");
    await page.close();
  }
  await b.close();
  setTimeout(function(){ process.exit(0); }, 300);
})().catch(function(e){ process.stderr.write(String(e)+"\n"); process.exit(1); });
