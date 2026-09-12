/**
 * Hero viewport screenshot test
 * Takes screenshots at 5 desktop/laptop viewport sizes and saves to /tmp/
 * Run: node hero-screenshot-test.mjs
 */
import { chromium } from "playwright";
import { mkdirSync } from "fs";

const VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900",  width: 1440, height: 900  },
  { name: "1366x768",  width: 1366, height: 768  },
  { name: "1280x720",  width: 1280, height: 720  },
  { name: "768x1024",  width: 768,  height: 1024 },  // tablet portrait
  { name: "390x844",   width: 390,  height: 844  },  // mobile
];

const URL = "http://localhost:4173/";
const OUT = "c:/tmp/hero-screenshots";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });

const results = [];
for (const vp of VIEWPORTS) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: vp.width, height: vp.height });
  await page.goto(URL, { waitUntil: "networkidle", timeout: 15000 });
  // Wait for animations to settle
  await page.waitForTimeout(1200);

  const screenshotPath = `${OUT}/${vp.name}.png`;
  await page.screenshot({ path: screenshotPath, fullPage: false }); // viewport only

  // Check if key elements are visible within the viewport
  const checks = {
    headline:      await page.isVisible("h1"),
    description:   await page.isVisible("text=Build your trading discipline"),
    niftyText:     await page.isVisible("text=NIFTY"),
    exploreBtn:    await page.isVisible("text=EXPLORE PLANS"),
    watchDemoBtn:  await page.isVisible("text=WATCH DEMO"),
    howItWorksBtn: await page.isVisible("text=HOW IT WORKS"),
    freeTrialBtn:  await page.isVisible("text=FREE TRIAL ACCOUNT"),
  };

  // Check if explore button is in the viewport (not below fold)
  const exploreBtnBox = await page.locator("text=EXPLORE PLANS").boundingBox().catch(() => null);
  const inViewport = exploreBtnBox
    ? exploreBtnBox.y + exploreBtnBox.height <= vp.height
    : false;

  results.push({
    viewport: vp.name,
    ...checks,
    exploreBtnInViewport: inViewport,
    exploreBtnY: exploreBtnBox ? Math.round(exploreBtnBox.y + exploreBtnBox.height) : "N/A",
    viewportHeight: vp.height,
    screenshot: screenshotPath,
  });

  await page.close();
}

await browser.close();

console.log("\n=== HERO VIEWPORT FIT TEST RESULTS ===\n");
for (const r of results) {
  const pass = r.headline && r.exploreBtn && r.watchDemoBtn && r.howItWorksBtn && r.freeTrialBtn && r.exploreBtnInViewport;
  console.log(`${pass ? "✅" : "❌"} ${r.viewport}`);
  console.log(`   headline=${r.headline}  description=${r.description}`);
  console.log(`   exploreBtn=${r.exploreBtn}  watchDemo=${r.watchDemoBtn}  howItWorks=${r.howItWorksBtn}  freeTrial=${r.freeTrialBtn}`);
  console.log(`   exploreBtnBottom=${r.exploreBtnY}px  viewportH=${r.viewportHeight}px  inViewport=${r.exploreBtnInViewport}`);
  console.log(`   screenshot: ${r.screenshot}`);
  console.log();
}

const allPass = results.filter(r => r.headline && r.exploreBtn && r.watchDemoBtn && r.howItWorksBtn && r.freeTrialBtn && r.exploreBtnInViewport);
console.log(`PASSED: ${allPass.length}/${results.length} viewports`);
