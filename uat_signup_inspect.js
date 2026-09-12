/**
 * Inspect the actual rendered sign-up and sign-in page structure
 * Then perform email registration via the Supabase API directly 
 * (since the production Supabase URL is confirmed: nysrxvpjdlvzvcawysvh.supabase.co)
 */
const { chromium } = require('@playwright/test');
const https = require('https');
const fs = require('fs');

const LOG = [];
function log(step, status, detail = '') {
  const e = { step, status, detail };
  LOG.push(e);
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : status === 'STOP' ? '⛔' : 'ℹ';
  console.log(`${icon} [${status}] ${step}: ${detail.substring(0, 150)}`);
}

function httpPost(url, body, headers = {}) {
  return new Promise((resolve) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...headers
      }
    };
    const req = https.request(opts, (res) => {
      let respBody = '';
      res.on('data', d => respBody += d);
      res.on('end', () => resolve({ status: res.statusCode, body: respBody, headers: res.headers }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.write(data);
    req.end();
  });
}

function httpGet(url, headers = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const opts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: 'GET',
      headers: { 'User-Agent': 'UAT/1.0', ...headers }
    };
    https.get(opts, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body, headers: res.headers }));
    }).on('error', e => resolve({ status: 0, body: e.message }));
  });
}

(async () => {
  // ── CONFIRMED PRODUCTION CONFIG ───────────────────────────────────────────
  const SUPABASE_URL  = 'https://nysrxvpjdlvzvcawysvh.supabase.co';
  const API_BASE      = 'https://fundedwealth-api-production.up.railway.app';

  // Read anon key from .env
  const envContent = fs.readFileSync('c:\\Users\\jitro\\fundedwealth\\.env', 'utf8');
  const anonKeyMatch = envContent.match(/^SUPABASE_ANON_KEY=(.+)$/m);
  const ANON_KEY = anonKeyMatch ? anonKeyMatch[1].trim() : '';
  log('CONFIG_ANON_KEY', ANON_KEY.length > 20 ? 'PASS' : 'FAIL', `Length: ${ANON_KEY.length}`);

  const ts = Date.now();
  const TEST_EMAIL    = `fwuat${ts}@yopmail.com`;
  const TEST_PASSWORD = 'UATtest@123';
  log('TEST_USER', 'INFO', `Email: ${TEST_EMAIL}`);

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });

  // ── INSPECT SIGN-UP PAGE ──────────────────────────────────────────────────
  const page = await context.newPage();
  const signupRequests = [];
  page.on('request', req => signupRequests.push(`${req.method()} ${req.url()}`));
  page.on('response', async res => {
    if (res.url().includes('supabase')) {
      const body = await res.text().catch(() => '');
      log('SUPABASE_CALL', 'INFO', `${res.status()} ${res.url().substring(0,80)} | ${body.substring(0,100)}`);
    }
  });

  await page.goto('https://www.fundedwealth.com/sign-up', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // Get the rendered page structure
  const buttons = await page.locator('button').all();
  const buttonTexts = [];
  for (const btn of buttons) {
    const txt = await btn.textContent().catch(() => '');
    const type = await btn.getAttribute('type').catch(() => '');
    buttonTexts.push(`"${txt.trim().substring(0,30)}" (type=${type})`);
  }
  log('SIGNUP_BUTTONS', 'INFO', buttonTexts.join(' | '));

  // Get all links and tabs
  const links = await page.locator('a[href*="sign"], a[href*="email"], [role="tab"]').all();
  const linkTexts = [];
  for (const l of links) {
    const txt = await l.textContent().catch(() => '');
    const href = await l.getAttribute('href').catch(() => '');
    linkTexts.push(`"${txt.trim()}" → ${href}`);
  }
  log('SIGNUP_LINKS', 'INFO', linkTexts.slice(0,5).join(' | '));

  await page.screenshot({ path: 'uat_signup_inspect.png', fullPage: true });

  // Check if there's an email tab vs google tab
  const hasEmailTab = await page.locator('[data-state="active"], [aria-selected="true"]').count();
  log('SIGNUP_ACTIVE_TABS', 'INFO', `${hasEmailTab} active tab elements`);

  // Check the actual form structure
  const formHTML = await page.locator('form').first().innerHTML().catch(() => 'no form');
  log('SIGNUP_FORM_SNIPPET', 'INFO', formHTML.substring(0,300).replace(/\s+/g,' '));

  await page.close();

  // ── DIRECT SUPABASE REGISTRATION ─────────────────────────────────────────
  // The sign-up page has email+password fields. Register directly via Supabase API.
  log('STEP_REG_1', 'INFO', 'Registering via Supabase Auth API directly...');

  const regResp = await httpPost(
    `${SUPABASE_URL}/auth/v1/signup`,
    {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: { first_name: 'UAT', last_name: 'Tester', full_name: 'UAT Tester' },
        emailRedirectTo: 'https://www.fundedwealth.com/auth/callback'
      }
    },
    { 'apikey': ANON_KEY }
  );

  log('STEP_REG_1_RESPONSE', regResp.status === 200 ? 'PASS' : 'FAIL',
    `HTTP ${regResp.status} | ${regResp.body.substring(0, 200)}`);

  let USER_ID = null;
  if (regResp.status === 200) {
    const regData = JSON.parse(regResp.body);
    USER_ID = regData.id || regData.user?.id;
    log('STEP_REG_2_USER_ID', USER_ID ? 'PASS' : 'FAIL', `User ID: ${USER_ID}`);
    log('STEP_REG_3_EMAIL_CONFIRMED', 'INFO', `email_confirmed_at: ${regData.email_confirmed_at || 'null - confirmation required'}`);
  }

  // ── ATTEMPT LOGIN (will fail if email not confirmed) ──────────────────────
  const loginResp = await httpPost(
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    { email: TEST_EMAIL, password: TEST_PASSWORD },
    { 'apikey': ANON_KEY }
  );

  log('STEP_LOGIN_1', loginResp.status === 200 ? 'PASS' : 'FAIL',
    `HTTP ${loginResp.status} | ${loginResp.body.substring(0,200)}`);

  let ACCESS_TOKEN = null;
  if (loginResp.status === 200) {
    const ld = JSON.parse(loginResp.body);
    ACCESS_TOKEN = ld.access_token;
    log('STEP_LOGIN_2_TOKEN', ACCESS_TOKEN ? 'PASS' : 'FAIL', `Token: ${ACCESS_TOKEN?.substring(0,40)}...`);
  }

  // ── CHECK YOPMAIL FOR CONFIRMATION EMAIL ──────────────────────────────────
  // Wait a bit for email delivery
  log('EMAIL_WAIT', 'INFO', 'Waiting 8s for email delivery...');
  await new Promise(r => setTimeout(r, 8000));

  const yopPage = await context.newPage();
  const yopMailbox = `fwuat${ts}`;
  await yopPage.goto(`https://yopmail.com/en/?login=${yopMailbox}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
  await yopPage.waitForTimeout(4000);

  // Click the inbox button to check messages
  try {
    await yopPage.locator('#refresh, button[onclick*="refresh"], .refreshbut').first().click({ timeout: 3000 });
    await yopPage.waitForTimeout(3000);
  } catch {}

  const yopHtml = await yopPage.content();
  const hasConfirmEmail = yopHtml.match(/confirm|verify|supabase|fundedwealth/i);
  log('EMAIL_YOPMAIL_CHECK', hasConfirmEmail ? 'PASS' : 'FAIL',
    hasConfirmEmail ? `Email found: ${hasConfirmEmail[0]}` : 'No email in inbox yet');
  await yopPage.screenshot({ path: 'uat_yopmail_inbox.png', fullPage: false });

  // Try to find the confirmation link in the email
  let confirmUrl = null;
  if (hasConfirmEmail) {
    const emailLinks = await yopPage.locator('a[href*="supabase"], a[href*="fundedwealth"]').all();
    for (const link of emailLinks) {
      const href = await link.getAttribute('href').catch(() => '');
      if (href.includes('confirm') || href.includes('callback') || href.includes('token')) {
        confirmUrl = href;
        log('EMAIL_CONFIRM_LINK', 'PASS', confirmUrl.substring(0,120));
        break;
      }
    }
    if (!confirmUrl) {
      // Try to open the email iframe
      const frames = yopPage.frames();
      for (const frame of frames) {
        try {
          const frameLinks = await frame.locator('a').all();
          for (const l of frameLinks) {
            const href = await l.getAttribute('href').catch(() => '');
            if (href && (href.includes('confirm') || href.includes('token_hash'))) {
              confirmUrl = href;
              log('EMAIL_CONFIRM_LINK_FRAME', 'PASS', href.substring(0,120));
              break;
            }
          }
        } catch {}
      }
    }
  }

  await yopPage.close();

  // ── IF CONFIRM URL FOUND, CLICK IT ────────────────────────────────────────
  if (confirmUrl) {
    const confirmPage = await context.newPage();
    try {
      await confirmPage.goto(confirmUrl, { waitUntil: 'networkidle', timeout: 20000 });
      await confirmPage.waitForTimeout(3000);
      log('EMAIL_CONFIRM_CLICK', 'PASS', `Redirected to: ${confirmPage.url()}`);
      await confirmPage.screenshot({ path: 'uat_after_confirm.png' });

      // Now try login again
      const loginResp2 = await httpPost(
        `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
        { email: TEST_EMAIL, password: TEST_PASSWORD },
        { 'apikey': ANON_KEY }
      );
      log('STEP_LOGIN_AFTER_CONFIRM', loginResp2.status === 200 ? 'PASS' : 'FAIL',
        `HTTP ${loginResp2.status} | ${loginResp2.body.substring(0,200)}`);

      if (loginResp2.status === 200) {
        const ld2 = JSON.parse(loginResp2.body);
        ACCESS_TOKEN = ld2.access_token;
        log('LOGIN_TOKEN_AFTER_CONFIRM', 'PASS', `Token acquired: ${ACCESS_TOKEN.substring(0,40)}...`);
      }
    } catch(e) {
      log('EMAIL_CONFIRM_CLICK', 'FAIL', e.message);
    }
    await confirmPage.close();
  }

  // ── IF WE HAVE ACCESS TOKEN, TEST API CALLS ───────────────────────────────
  if (ACCESS_TOKEN) {
    log('TOKEN_AVAILABLE', 'PASS', 'Proceeding with authenticated API tests');

    // Test GET /api/accounts/my
    const accountsResp = await httpGet(`${API_BASE}/api/accounts/my`, {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    });
    log('API_ACCOUNTS_MY', accountsResp.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${accountsResp.status} | ${accountsResp.body.substring(0,200)}`);

    // Test GET /api/users/me
    const usersMeResp = await httpPost(`${API_BASE}/api/users/me`,
      { email: TEST_EMAIL, firstName: 'UAT', lastName: 'Tester' },
      { 'Authorization': `Bearer ${ACCESS_TOKEN}` }
    );
    log('API_USERS_ME', usersMeResp.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${usersMeResp.status} | ${usersMeResp.body.substring(0,200)}`);

    // Test GET /api/kyc/status
    const kycResp = await httpGet(`${API_BASE}/api/kyc/status`, {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    });
    log('API_KYC_STATUS', [200,404].includes(kycResp.status) ? 'PASS' : 'FAIL',
      `HTTP ${kycResp.status} | ${kycResp.body.substring(0,100)}`);

    // Test affiliate
    const affResp = await httpGet(`${API_BASE}/api/affiliate/stats`, {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    });
    log('API_AFFILIATE_STATS', [200,404].includes(affResp.status) ? 'PASS' : 'FAIL',
      `HTTP ${affResp.status} | ${affResp.body.substring(0,100)}`);

    // Test notifications
    const notifResp = await httpGet(`${API_BASE}/api/notifications`, {
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    });
    log('API_NOTIFICATIONS', [200,404].includes(notifResp.status) ? 'PASS' : 'FAIL',
      `HTTP ${notifResp.status} | ${notifResp.body.substring(0,100)}`);

  } else {
    log('NO_TOKEN', 'FAIL', 'Email not confirmed - cannot proceed with authenticated API tests');
    log('BLOCKER', 'STOP', 'Email confirmation is required. Production Supabase has mailer_autoconfirm=false');
  }

  // ── ADMIN PANEL INSPECTION ────────────────────────────────────────────────
  log('ADMIN_SECTION', 'INFO', '--- ADMIN PANEL ---');
  const adminPage = await context.newPage();
  const adminResponses = {};
  adminPage.on('response', async res => {
    const url = res.url();
    if (url.includes('/api/') || url.includes('supabase')) {
      const body = await res.text().catch(() => '');
      adminResponses[url.substring(0,100)] = { status: res.status(), body: body.substring(0,200) };
    }
  });

  await adminPage.goto('https://admin.fundedwealth.com/login', { waitUntil: 'networkidle', timeout: 20000 });
  await adminPage.waitForTimeout(2000);
  await adminPage.screenshot({ path: 'uat_admin_login_inspect.png', fullPage: true });

  const adminContent = await adminPage.content();
  const hasIdentifierField = await adminPage.locator('input[type="text"], input[type="email"], input[name*="email"], input[name*="identifier"]').count();
  const hasPwField = await adminPage.locator('input[type="password"]').count();
  const adminBtns = await adminPage.locator('button').allTextContents();

  log('ADMIN_LOGIN_FIELDS', 'INFO', `identifier: ${hasIdentifierField}, password: ${hasPwField}`);
  log('ADMIN_LOGIN_BUTTONS', 'INFO', adminBtns.join(' | ').substring(0,200));
  log('ADMIN_SUPABASE_USED', 'INFO', adminContent.includes('supabase') ? 'YES' : 'NO');

  // Check which Supabase project admin uses
  const adminSupa = Object.keys(adminResponses).filter(k => k.includes('supabase'));
  log('ADMIN_SUPABASE_CALLS', 'INFO', adminSupa.slice(0,3).join(' | ') || 'none on login page');

  // ── TERMINAL INSPECTION ───────────────────────────────────────────────────
  log('TERMINAL_SECTION', 'INFO', '--- TERMINAL ---');
  const termPage = await context.newPage();
  const termResponses = {};
  termPage.on('response', async res => {
    const url = res.url();
    if (url.includes('/auth/') || url.includes('/api/') || url.includes('supabase')) {
      const body = await res.text().catch(() => '');
      termResponses[url.substring(0,100)] = { status: res.status(), body: body.substring(0,200) };
    }
  });

  await termPage.goto('https://terminal.fundedwealth.com', { waitUntil: 'networkidle', timeout: 30000 });
  await termPage.waitForTimeout(3000);
  await termPage.screenshot({ path: 'uat_terminal_inspect.png', fullPage: false });

  const termContent = await termPage.content();

  // Check for AccessDenied component
  const isAccessDenied = termContent.match(/access.?denied|no.?session|sso.?token/i);
  log('TERMINAL_ACCESS_DENIED', isAccessDenied ? 'PASS' : 'FAIL',
    isAccessDenied ? `Auth gate: ${isAccessDenied[0]}` : 'Terminal has no auth gate - SECURITY ISSUE');

  // Check terminal verify endpoint
  const termVerify = await httpGet('https://terminal.fundedwealth.com/api/auth/verify');
  log('TERMINAL_API_VERIFY', termVerify.status === 401 ? 'PASS' : 'FAIL',
    `HTTP ${termVerify.status} | ${termVerify.body.substring(0,100)}`);

  // Check terminal health
  const termHealth = await httpGet('https://terminal.fundedwealth.com/api/health');
  log('TERMINAL_API_HEALTH', termHealth.status === 200 ? 'PASS' : 'FAIL',
    `HTTP ${termHealth.status} | ${termHealth.body.substring(0,100)}`);

  // Terminal SSO endpoint
  const termSSO = await httpGet('https://terminal.fundedwealth.com/auth/sso?token=invalid_test_token');
  log('TERMINAL_SSO_INVALID_TOKEN', [400, 302, 401].includes(termSSO.status) ? 'PASS' : 'FAIL',
    `HTTP ${termSSO.status} | ${termSSO.body.substring(0,150)}`);

  // Check terminal market data endpoint
  const termMarket = await httpGet('https://terminal.fundedwealth.com/api/market/instruments?q=NIFTY');
  log('TERMINAL_MARKET_API', termMarket.status === 200 ? 'PASS' : 'FAIL',
    `HTTP ${termMarket.status} | ${termMarket.body.substring(0,100)}`);

  log('TERMINAL_NETWORK_CALLS', 'INFO', Object.keys(termResponses).slice(0,5).join(' | '));

  await browser.close();

  // ── SAVE AND PRINT ────────────────────────────────────────────────────────
  fs.writeFileSync('uat_signup_results.json', JSON.stringify({ LOG, termResponses, adminResponses }, null, 2));

  console.log('\n╔══════════════════════════════════════════════╗');
  console.log('║         UAT STEP-BY-STEP RESULTS            ║');
  console.log('╚══════════════════════════════════════════════╝');
  LOG.forEach(r => {
    if (r.status === 'INFO') return;
    const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : r.status === 'STOP' ? '⛔' : '⚠';
    console.log(`${icon} [${r.status}] ${r.step}`);
    if (r.detail) console.log(`     → ${r.detail.substring(0,120)}`);
  });

  const passes = LOG.filter(r => r.status === 'PASS').length;
  const fails  = LOG.filter(r => r.status === 'FAIL').length;
  const stops  = LOG.filter(r => r.status === 'STOP').length;
  console.log(`\n  ✓ PASS: ${passes}  ✗ FAIL: ${fails}  ⛔ STOP: ${stops}`);
})();
