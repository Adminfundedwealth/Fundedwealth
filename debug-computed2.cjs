const { chromium } = require("./node_modules/.pnpm/node_modules/playwright/index.js");
(async () => {
  const b = await chromium.launch({ headless: true });
  const page = await b.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("http://localhost:4173/", { waitUntil: "load", timeout: 15000 });
  await page.waitForTimeout(3500);
  const d = await page.evaluate(function() {
    var h1 = document.querySelector("h1");
    if (!h1) return { error: "no h1" };
    var cs = window.getComputedStyle(h1);
    var rules = [];
    for (var i = 0; i < document.styleSheets.length; i++) {
      try {
        var ss = document.styleSheets[i];
        for (var j = 0; j < ss.cssRules.length; j++) {
          var rule = ss.cssRules[j];
          if (rule.selectorText && rule.selectorText.includes("hero-headline")) {
            rules.push("BASE: " + rule.selectorText + " { " + rule.style.cssText.substring(0,100) + " }");
          }
          if (rule.type === 4) { // CSSMediaRule
            var media = rule.conditionText || rule.media.mediaText;
            for (var k = 0; k < rule.cssRules.length; k++) {
              var mr = rule.cssRules[k];
              if (mr.selectorText && mr.selectorText.includes("hero-headline")) {
                rules.push("MEDIA(" + media + ") matches=" + window.matchMedia(media).matches + ": " + mr.style.cssText.substring(0,100));
              }
            }
          }
        }
      } catch(e2) {}
    }
    return {
      vh: window.innerHeight,
      vw: window.innerWidth,
      h1FontSize: cs.fontSize,
      matchesMaxH800: window.matchMedia("(max-height: 800px)").matches,
      rules: rules
    };
  });
  process.stdout.write(JSON.stringify(d, null, 2) + "\n");
  await b.close();
  setTimeout(function(){ process.exit(0); }, 200);
})().catch(function(e){ process.stderr.write(String(e)+"\n"); process.exit(1); });
