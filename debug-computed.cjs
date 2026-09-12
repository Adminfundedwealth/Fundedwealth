const { chromium } = require("./node_modules/.pnpm/node_modules/playwright/index.js");
(async () => {
  const b = await chromium.launch({ headless: true });
  const page = await b.newPage();
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("http://localhost:4173/", { waitUntil: "domcontentloaded", timeout: 20000 });
  await page.waitForTimeout(2500);

  const d = await page.evaluate(function() {
    var h1 = document.querySelector("h1");
    var cs = window.getComputedStyle(h1);
    // Find the matching CSS rules via CSSOM
    var rules = [];
    for (var i = 0; i < document.styleSheets.length; i++) {
      try {
        var ss = document.styleSheets[i];
        for (var j = 0; j < ss.cssRules.length; j++) {
          var rule = ss.cssRules[j];
          if (rule.selectorText && rule.selectorText.includes("hero-headline")) {
            rules.push({ selector: rule.selectorText, css: rule.style.cssText.substring(0, 120), media: null });
          }
          if (rule.type === CSSRule.MEDIA_RULE) {
            var media = rule.conditionText || rule.media.mediaText;
            for (var k = 0; k < rule.cssRules.length; k++) {
              var mr = rule.cssRules[k];
              if (mr.selectorText && mr.selectorText.includes("hero-headline")) {
                var mq = window.matchMedia(media);
                rules.push({ selector: mr.selectorText, css: mr.style.cssText.substring(0, 120), media: media, mediaMatches: mq.matches });
              }
            }
          }
        }
      } catch(e) {}
    }
    return {
      vh: window.innerHeight,
      vw: window.innerWidth,
      h1FontSize: cs.fontSize,
      h1Class: h1 ? h1.className : "none",
      matchesMaxH800: window.matchMedia("(max-height: 800px)").matches,
      matchesMaxW768: window.matchMedia("(max-width: 768px)").matches,
      rules: rules
    };
  });

  process.stdout.write(JSON.stringify(d, null, 2) + "\n");
  await b.close();
  setTimeout(function(){ process.exit(0); }, 300);
})().catch(function(e){ process.stderr.write(String(e)+"\n"); process.exit(1); });
