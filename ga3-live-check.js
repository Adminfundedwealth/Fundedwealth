const { chromium } = require('@playwright/test');

function parseGARequest(req) {
  const url = req.url();
  if (!url.includes('/g/collect')) return null;
  const raw = req.postData() || '';
  const body = raw ? new URLSearchParams(raw) : new URLSearchParams((url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''));
  const out = {};
  for (const [k, v] of body.entries()) out[k] = v;
  return { url, body: out, raw };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const events = [];
  page.on('request', (req) => {
    const parsed = parseGARequest(req);
    if (!parsed) return;
    const en = parsed.body.en || new URLSearchParams(parsed.url.split('?')[1] || '').get('en');
    if (!en) return;
    events.push({
      en,
      item_id: parsed.body['ep.item_id'] || parsed.body.item_id || null,
      item_name: parsed.body['ep.item_name'] || parsed.body.item_name || null,
      item_category: parsed.body['ep.item_category'] || parsed.body.item_category || null,
      price: parsed.body['ep.value'] || parsed.body.value || null,
      currency: parsed.body['ep.currency'] || parsed.body.currency || null,
      cta_name: parsed.body.cta_name || null,
      cta_location: parsed.body.cta_location || null,
      cta_destination: parsed.body.cta_destination || null,
      challenge_id: parsed.body.challenge_id || null,
      challenge_name: parsed.body.challenge_name || null,
      challenge_type: parsed.body.challenge_type || null,
      dp: parsed.body.dp || null,
      dl: parsed.body.dl || null,
      raw: parsed.raw.slice(0, 1200),
    });
  });

  const closePopup = async () => {
    const btn = page.locator('button[aria-label="Close Forex launch popup"]');
    if (await btn.isVisible().catch(() => false)) {
      await btn.click({ force: true });
      await page.waitForTimeout(1000);
    }
  };

  await page.goto('https://www.fundedwealth.com/?a3=ga3-live-check', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  await closePopup();

  const firstPlanButton = page.locator('#plans button, #plans [role="button"]').filter({ hasText: /Select Plan|Get Funded/ }).first();
  console.log('PLAN_BUTTON_VISIBLE=' + await firstPlanButton.isVisible().catch(() => false));
  if (await firstPlanButton.isVisible().catch(() => false)) {
    await firstPlanButton.click({ force: true });
    await page.waitForTimeout(12000);
  }

  const counts = {};
  for (const ev of events) counts[ev.en] = (counts[ev.en] || 0) + 1;
  console.log('COUNTS=' + JSON.stringify(counts, null, 2));
  console.log('EVENTS=' + JSON.stringify(events.slice(-20), null, 2));
  await browser.close();
})();
