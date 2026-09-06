const { chromium } = require('@playwright/test');

function eventFromRequest(request) {
  const url = request.url();
  if (!url.includes('/g/collect')) return null;
  const values = new URLSearchParams(url.includes('?') ? url.slice(url.indexOf('?') + 1) : '');
  const post = request.postData() || '';
  const body = new URLSearchParams(post);
  const get = (key) => values.get(key) || body.get(key) || undefined;
  return {
    name: get('en'),
    measurementId: get('tid'),
    pagePath: get('dp'),
    pageLocation: get('dl'),
    itemListId: get('ep.item_list_id'),
    itemListName: get('ep.item_list_name'),
    currency: get('ep.currency'),
    value: get('ep.value'),
    raw: url,
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  const events = [];
  page.on('request', request => {
    const event = eventFromRequest(request);
    if (event && event.name) events.push(event);
  });
  page.on('console', message => {
    if (message.type() === 'error') console.log('CONSOLE_ERROR', message.text());
  });

  const wait = () => page.waitForTimeout(4000);
  const count = name => events.filter(event => event.name === name).length;
  const delta = (before, name) => count(name) - before[name];
  const snapshot = () => ({
    page_view: count('page_view'),
    view_item_list: count('view_item_list'),
    view_item: count('view_item'),
    select_item: count('select_item'),
    cta_click: count('cta_click'),
  });
  const report = (label, before) => console.log(label, JSON.stringify({ url: page.url(), delta: Object.fromEntries(Object.keys(snapshot()).map(name => [name, delta(before, name)])), total: snapshot(), events: events.slice(-8) }));
  const dismissPopup = async () => {
    const close = page.locator('button[aria-label="Close Forex launch popup"]');
    if (await close.isVisible().catch(() => false)) {
      await close.click({ force: true });
      await page.locator('[role="dialog"]').waitFor({ state: 'hidden', timeout: 5000 }).catch(() => undefined);
    }
  };

  await page.goto('https://www.fundedwealth.com/?a3=cc622ab', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait();
  const homeBefore = snapshot();
  console.log('DEPLOYED_HOME', JSON.stringify({ url: page.url(), initial: snapshot() }));

  await dismissPopup();
  await wait();
  await page.getByRole('link', { name: 'Plans', exact: true }).click({ force: true });
  await wait();
  console.log('PLAN_LIST_VISIBLE', await page.locator('#plans').isVisible());
  report('FLOW_A_LIST', homeBefore);

  const selectionBefore = snapshot();
  await dismissPopup();
  const firstPlan = page.locator('#plans button').filter({ hasText: /Select Plan|Get Funded/ }).first();
  await firstPlan.click({ force: true });
  await wait();
  report('FLOW_B_SELECT', selectionBefore);

  const backBefore = snapshot();
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await wait();
  report('FLOW_E_BACK', backBefore);

  const secondBefore = snapshot();
  await dismissPopup();
  await page.locator('#plans button').filter({ hasText: /Select Plan|Get Funded/ }).nth(1).click({ force: true });
  await wait();
  report('FLOW_C_SECOND_SELECT', secondBefore);

  const refreshBefore = snapshot();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await wait();
  report('A2_REFRESH', refreshBefore);

  const directBefore = snapshot();
  await page.goto('https://www.fundedwealth.com/blog', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await wait();
  report('A2_DIRECT', directBefore);

  const forwardBackBefore = snapshot();
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await wait();
  report('A2_BACK', forwardBackBefore);
  const forwardBefore = snapshot();
  await page.goForward({ waitUntil: 'domcontentloaded' });
  await wait();
  report('A2_FORWARD', forwardBefore);

  console.log('FINAL_EVENTS', JSON.stringify(events, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
