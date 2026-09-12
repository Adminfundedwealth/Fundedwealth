/**
 * Hero viewport screenshot check — CommonJS, uses workspace playwright.
 * node hero-viewport-check.cjs
 */
const { chromium } = require("./node_modules/.pnpm/node_modules/playwright/index.js");
const fs = require("fs");

const VIEWPORTS = [
  { name: "1920x1080", width: 1920, height: 1080 },
  { name: "1440x900",  width: 1440, height: 900  },
  { name: "1366x768",  width: 1366, height: 768  },
  { name: "1280x720",  width: 1280, height: 720  },
  { name: "768x1024",  width: 768,  height: 1024 },
  { name: "390x844",   width: 390,  height: 844  },
];

const URL = "http://localhost:4173/";
const OUT = "c:/tmp/hero-screenshots";
fs.mkdirSync(OUT, { recursive: true });

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: vp.width, height: vp.height });
    try {
      await page.goto(URL, { waitUntil: "load", timeout: 20000 });
    } catch {
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 20000 });
    }
    await page.waitForTimeout(3000);

    const screenshotPath = `${OUT}/${vp.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });

    // Check visibility of key elements
    const headline     = await page.isVisible("h1").catch(() => false);
    const exploreBtn   = await page.isVisible("text=EXPLORE PLANS").catch(() => false);
    const watchDemo    = await page.isVisible("text=WATCH DEMO").catch(() => false);
    const howItWorks   = await page.isVisible("text=HOW IT WORKS").catch(() => false);
    const freeTrial    = await page.isVisible("text=FREE TRIAL ACCOUNT").catch(() => false);
    const description  = await page.isVisible("text=Build your trading discipline").catch(() => false);
    const niftyText    = await page.isVisible("text=NIFTY").catch(() => false);

    // Is the EXPLORE PLANS button above the fold?
    const box = await page.locator("text=EXPLORE PLANS").first().boundingBox().catch(() => null);
    const inViewport = box ? (box.y + box.height) <= vp.height : false;
    const btnBottom  = box ? Math.round(box.y + box.height) : "N/A";

    // Is FREE TRIAL ACCOUNT above the fold?
    const freeBox = await page.locator("text=FREE TRIAL ACCOUNT").first().boundingBox().catch(() => null);
    const freeInViewport = freeBox ? (freeBox.y + freeBox.height) <= vp.height : false;

    results.push({ vp: vp.name, width: vp.width, height: vp.height,
      headline, description, niftyText, exploreBtn, watchDemo, howItWorks, freeTrial,
      exploreBtnInViewport: inViewport, freeTrialInViewport: freeInViewport,
      exploreBtnBottom: btnBottom, screenshot: screenshotPath });

    await page.close();
  }

  await browser.close();

  console.log("\n=== HERO VIEWPORT FIT TEST ===\n");
  let totalPass = 0;
  for (const r of results) {
    const allVisible = r.headline && r.exploreBtn && r.watchDemo && r.howItWorks && r.freeTrial;
    const allInViewport = r.exploreBtnInViewport && r.freeTrialInViewport;
    const pass = allVisible && allInViewport;
    if (pass) totalPass++;
    const icon = pass ? "PASS" : "FAIL";
    console.log(`[${icon}] ${r.vp}`);
    console.log(`  headline=${r.headline}  description=${r.description}  nifty=${r.niftyText}`);
    console.log(`  explore=${r.exploreBtn}  watchDemo=${r.watchDemo}  howItWorks=${r.howItWorks}  freeTrial=${r.freeTrial}`);
    console.log(`  exploreBtn bottom=${r.exploreBtnBottom}px / viewport ${r.height}px  inViewport=${r.exploreBtnInViewport}`);
    console.log(`  freeTrial inViewport=${r.freeTrialInViewport}`);
    console.log(`  screenshot => ${r.screenshot}`);
    console.log();
  }
  console.log(`TOTAL: ${totalPass}/${results.length} viewports PASS`);
}

run().catch(err => { console.error(err); process.exit(1); }).then(() => { setTimeout(() => process.exit(0), 300); });
