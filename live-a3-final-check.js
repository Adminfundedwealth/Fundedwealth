const { chromium } = require('@playwright/test');

function parseGA(req) {
  const url = req.url();
  if (!url.includes('/g/collect')) return null;
  const raw = req.postData() || '';
  const params = new URLSearchParams(raw || (url.includes('?') ? url.slice(url.indexOf('?') + 1) : ''));
  return {
    en: params.get('en'),
    item_id: params.get('ep.item_id') || params.get('item_id') || params.get('pr1') || null,
    item_name: params.get('ep.item_name') || params.get('item_name') || params.get('nm1') || null,
    item_category: params.get('ep.item_category') || params.get('item_category') || params.get('ca1') || null,
    value: params.get('ep.value') || params.get('value') || null,
    currency: params.get('ep.currency') || params.get('currency') || null,
    cta_name: params.get('cta_name') || null,
    cta_location: params.get('cta_location') || null,
    cta_destination: params.get('cta_destination') || null,
    challenge_id: params.get('challenge_id') || null,
    challenge_name: params.get('challenge_name') || null,
    challenge_type: params.get('challenge_type') || null,
    list_id: params.get('ep.item_list_id') || null,
    list_name: params.get('ep.item_list_name') || null,
    dl: params.get('dl') || null,
    dp: params.get('dp') || null,
    raw: raw.slice(0, 2000),
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const events = [];
  page.on('request', (req) => {
    const ga = parseGA(req);
    if (ga && ga.en) events.push(ga);
  });

  const closePopup = async () => {
    const close = page.locator('button[aria-label="Close Forex launch popup"]');
    if (await close.isVisible().catch(() => false)) {
      await close.click({ force: true });
      await page.waitForTimeout(1000);
    }
  };

  await page.goto('https://www.fundedwealth.com/?a3=live-a3-final', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(5000);
  await closePopup();

  const homeBefore = events.filter((e) => e.en === 'page_view').length;
  console.log('HOME_PAGE_VIEW_BEFORE=' + homeBefore);

  const btn = page.locator('button').filter({ hasText: /Select Plan|Get Funded/ }).first();
  console.log('TARGET_VISIBLE=' + await btn.isVisible().catch(() => false));
  if (await btn.isVisible().catch(() => false)) {
    await btn.click({ force: true });
    await page.waitForTimeout(10000);
  }

  const counts = {};
  for (const event of events) {
    counts[event.en] = (counts[event.en] || 0) + 1;
  }

  console.log('COUNTS=' + JSON.stringify(counts, null, 2));
  console.log('EVENTS=' + JSON.stringify(events.slice(-30), null, 2));
  await browser.close();
})();
