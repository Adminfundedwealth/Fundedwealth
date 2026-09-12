const { chromium } = require("./node_modules/.pnpm/node_modules/playwright/index.js");
(async () => {
  const b = await chromium.launch({ headless: true });
  const page = await b.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push("ERR: " + e.message));
  page.on("console", m => { if (m.type() === "error") errors.push("CON: " + m.text()); });
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("http://localhost:4173/", { waitUntil: "load", timeout: 20000 });
  await page.waitForTimeout(4000);
  const title = await page.title();
  const rootHTML = await page.evaluate(function(){ 
    var root = document.getElementById("root");
    return root ? root.innerHTML.substring(0, 300) : "NO ROOT";
  });
  process.stdout.write("Title: " + title + "\n");
  process.stdout.write("Root HTML: " + rootHTML + "\n");
  process.stdout.write("Errors: " + JSON.stringify(errors.slice(0,5)) + "\n");
  await b.close();
  setTimeout(function(){ process.exit(0); }, 200);
})().catch(function(e){ process.stderr.write(String(e)+"\n"); process.exit(1); });
