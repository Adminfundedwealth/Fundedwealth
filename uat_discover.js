const { chromium } = require('@playwright/test');
const fs = require('fs');

const RESULTS = [];
function log(step, status, detail = '') {
  const entry = { step, status, detail, ts: new Date().toISOString() };
  RESULTS.push(entry);
  console.log(`[${status}] ${step}: ${detail}`);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') log('PAGE_CONSOLE_ERROR', 'WARN', msg.text().substring(0,200));
  });

  const apiRequests = [];
  page.on('request', req => {
    const u = req.url();
    if (u.includes('supabase') || u.includes('railway') || u.includes('/api/') || u.includes('fundedwealth')) {
      apiRequests.push(`${req.method()} ${u}`);
    }
  });
  const apiResponses = {};
  page.on('response', async res => {
    const u = res.url();
    if (u.includes('supabase') || u.includes('railway') || u.includes('/api/')) {
      try {
        const body = await res.text().catch(() => '');
        apiResponses[u] = { status: res.status(), body: body.substring(0, 300) };
      } catch {}
    }
  });

  // ── STEP 1: Main site loads ──────────────────────────────────────────────
  try {
    const r = await page.goto('https://www.fundedwealth.com', { waitUntil: 'networkidle', timeout: 30000 });
    log('STEP_1_MAIN_SITE', 'PASS', `HTTP ${r.status()} | title: ${(await page.title()).substring(0,50)}`);
  } catch(e) {
    log('STEP_1_MAIN_SITE', 'FAIL', e.message);
  }

  // ── STEP 2: Sign-up page ──────────────────────────────────────────────────
  try {
    await page.goto('https://www.fundedwealth.com/sign-up', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: 'uat_01_signup_page.png', fullPage: false });
    const hasEmailField = await page.locator('input[type="email"]').count() > 0;
    log('STEP_2_SIGNUP_PAGE', hasEmailField ? 'PASS' : 'FAIL', `email field present: ${hasEmailField}`);
  } catch(e) {
    log('STEP_2_SIGNUP_PAGE', 'FAIL', e.message);
  }

  // ── STEP 3: Discover production config from page ──────────────────────────
  await page.waitForTimeout(2000);
  const supabaseRequests = apiRequests.filter(r => r.includes('supabase'));
  log('STEP_3_SUPABASE_REQUESTS', 'INFO', supabaseRequests.slice(0,3).join(' || ') || 'none');

  // Extract supabase URL from network calls
  let prodSupabaseUrl = '';
  let prodAnonKey = '';
  for (const [url, data] of Object.entries(apiResponses)) {
    if (url.includes('supabase.co/auth')) {
      prodSupabaseUrl = url.match(/https:\/\/[^/]+\.supabase\.co/)?.[0] || '';
      break;
    }
  }
  log('STEP_3_PROD_SUPABASE_URL', 'INFO', prodSupabaseUrl || 'not captured yet');

  // Get the anon key from the request headers sent to supabase
  const anonKeyCapture = [];
  page.on('request', req => {
    if (req.url().includes('supabase.co')) {
      const apikey = req.headers()['apikey'];
      if (apikey) anonKeyCapture.push({ url: req.url(), key: apikey.substring(0,20) + '...' });
    }
  });

  // Trigger an auth call by navigating to sign-up again
  await page.goto('https://www.fundedwealth.com/sign-up', { waitUntil: 'domcontentloaded', timeout: 20000 });
  await page.waitForTimeout(3000);

  log('STEP_3_ANON_KEY_CAPTURES', 'INFO', JSON.stringify(anonKeyCapture.slice(0,2)));

  await browser.close();

  // Save all captured data
  fs.writeFileSync('uat_discover_results.json', JSON.stringify({
    results: RESULTS,
    apiRequests: apiRequests.slice(0,20),
    apiResponses: Object.fromEntries(
      Object.entries(apiResponses).slice(0,10).map(([k,v]) => [k.substring(0,100), v])
    )
  }, null, 2));

  console.log('\n=== DISCOVERY RESULTS ===');
  RESULTS.forEach(r => console.log(`  [${r.status}] ${r.step}: ${r.detail}`));
  console.log('\nAPI Requests captured:');
  apiRequests.slice(0,15).forEach(r => console.log(' ', r.substring(0,120)));
})();
