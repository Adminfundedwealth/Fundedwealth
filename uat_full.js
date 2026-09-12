/**
 * FundedWealth Production UAT
 * Full end-to-end: Register → Login → Buy Challenge → Admin → Terminal
 */
const { chromium } = require('@playwright/test');
const fs = require('fs');
const https = require('https');

const LOG = [];
function log(step, status, detail = '') {
  const e = { step, status, detail, ts: new Date().toISOString() };
  LOG.push(e);
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : status === 'STOP' ? '⛔' : 'ℹ';
  console.log(`${icon} [${status}] ${step}`);
  if (detail) console.log(`    ${detail}`);
}
function save() {
  fs.writeFileSync('uat_full_results.json', JSON.stringify(LOG, null, 2));
}

function httpGet(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'UAT-Bot/1.0' } }, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', (e) => resolve({ status: 0, body: e.message }));
  });
}

(async () => {
  const ts = Date.now();
  const TEST_EMAIL    = `fwuat${ts}@yopmail.com`;
  const TEST_PASSWORD = 'UATtest@123';
  const TEST_FIRST    = 'UAT';
  const TEST_LAST     = 'Tester';

  log('UAT_START', 'INFO', `Test email: ${TEST_EMAIL}`);

  // ── BROWSER SETUP ─────────────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({
    viewport: { width: 1400, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36'
  });
  const page = await context.newPage();

  // Capture ALL network traffic
  const NET = { requests: [], responses: {} };
  page.on('request', req => {
    NET.requests.push(`${req.method()} ${req.url().substring(0,150)}`);
  });
  page.on('response', async res => {
    const url = res.url();
    if (url.includes('supabase') || url.includes('/api/') || url.includes('railway')) {
      try {
        const body = await res.text();
        NET.responses[url.substring(0,150)] = { status: res.status(), body: body.substring(0,500) };
      } catch {}
    }
  });

  // Capture console
  page.on('console', msg => {
    if (['error','warn'].includes(msg.type())) {
      const t = msg.text();
      if (!t.includes('favicon') && !t.includes('GTM') && !t.includes('googletagmanager')) {
        log('BROWSER_CONSOLE', msg.type().toUpperCase(), t.substring(0,200));
      }
    }
  });

  // ── STEP 1: MAIN WEBSITE LOADS ────────────────────────────────────────────
  try {
    const r = await page.goto('https://www.fundedwealth.com', { waitUntil: 'networkidle', timeout: 30000 });
    log('STEP_1_MAIN_SITE_LOAD', r.status() === 200 ? 'PASS' : 'FAIL', `HTTP ${r.status()}`);
    await page.screenshot({ path: 'uat_s01_home.png' });
  } catch(e) { log('STEP_1_MAIN_SITE_LOAD', 'FAIL', e.message); }

  // ── STEP 2: SIGN-UP PAGE ─────────────────────────────────────────────────
  try {
    await page.goto('https://www.fundedwealth.com/sign-up', { waitUntil: 'networkidle', timeout: 20000 });
    const emailInput = await page.locator('input[type="email"]').first();
    const visible = await emailInput.isVisible();
    log('STEP_2_SIGNUP_PAGE_LOADS', visible ? 'PASS' : 'FAIL', `email input visible: ${visible}`);
    await page.screenshot({ path: 'uat_s02_signup.png' });
  } catch(e) { log('STEP_2_SIGNUP_PAGE_LOADS', 'FAIL', e.message); }

  // ── STEP 3: FILL REGISTRATION FORM ────────────────────────────────────────
  try {
    // Look for first name, last name fields
    const fields = await page.locator('input').all();
    log('STEP_3_FORM_FIELDS', 'INFO', `${fields.length} input fields found`);

    // Try to fill email field
    const emailField = page.locator('input[type="email"]').first();
    await emailField.fill(TEST_EMAIL);

    // Try to find password field
    const pwField = page.locator('input[type="password"]').first();
    const hasPw = await pwField.count() > 0;

    if (hasPw) {
      await pwField.fill(TEST_PASSWORD);
      log('STEP_3_FILL_FORM', 'PASS', 'email + password filled');
    } else {
      log('STEP_3_FILL_FORM', 'WARN', 'no password field found');
    }

    // Check for first name / last name fields
    const allInputs = await page.locator('input[type="text"], input[placeholder*="name" i], input[placeholder*="first" i]').all();
    log('STEP_3_NAME_FIELDS', 'INFO', `${allInputs.length} name-type fields`);

    await page.screenshot({ path: 'uat_s03_form_filled.png' });
  } catch(e) { log('STEP_3_FILL_FORM', 'FAIL', e.message); }

  // ── STEP 4: SUBMIT REGISTRATION ───────────────────────────────────────────
  let registrationSuccess = false;
  try {
    // Find submit button
    const submitBtn = page.locator('button[type="submit"], button:has-text("Sign up"), button:has-text("Register"), button:has-text("Create")').first();
    const btnText = await submitBtn.textContent().catch(() => 'unknown');
    log('STEP_4_SUBMIT_BTN', 'INFO', `Button: "${btnText.trim()}"`);

    // Intercept the auth response before clicking
    const responsePromise = page.waitForResponse(
      res => res.url().includes('supabase') && res.url().includes('signup'),
      { timeout: 15000 }
    );

    await submitBtn.click();
    log('STEP_4_SUBMIT_CLICKED', 'INFO', 'Submit clicked, waiting for response...');

    const authResponse = await responsePromise.catch(() => null);
    if (authResponse) {
      const authStatus = authResponse.status();
      const authBody = await authResponse.text().catch(() => '');
      log('STEP_4_SUPABASE_URL', 'INFO', authResponse.url().substring(0,100));
      log('STEP_4_AUTH_RESPONSE', authStatus === 200 ? 'PASS' : 'FAIL', `HTTP ${authStatus} | ${authBody.substring(0,200)}`);

      if (authStatus === 200) {
        registrationSuccess = true;
        const authData = JSON.parse(authBody);
        log('STEP_4_USER_CREATED', 'PASS', `User ID: ${authData.id || authData.user?.id}`);
        // Save the production Supabase URL
        const supabaseUrl = authResponse.url().match(/https:\/\/[^/]+\.supabase\.co/)?.[0] || '';
        log('STEP_4_PROD_SUPABASE_URL', 'INFO', supabaseUrl);
        global.__PROD_SUPABASE = supabaseUrl;
        global.__USER_ID = authData.id || authData.user?.id;
      }
    } else {
      log('STEP_4_NO_SUPABASE_CALL', 'FAIL', 'No supabase signup call intercepted');
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'uat_s04_after_submit.png' });
    const currentUrl = page.url();
    log('STEP_4_POST_SUBMIT_URL', 'INFO', currentUrl);
  } catch(e) { log('STEP_4_SUBMIT_REGISTRATION', 'FAIL', e.message); }

  // ── STEP 5: CHECK EMAIL CONFIRMATION STATE ────────────────────────────────
  try {
    await page.waitForTimeout(2000);
    const pageContent = await page.content();
    const hasConfirmMsg = pageContent.match(/confirm|verify|check.{0,20}email|verification/i);
    const currentUrl = page.url();
    log('STEP_5_POST_REGISTER_URL', 'INFO', currentUrl);
    log('STEP_5_EMAIL_CONFIRM_MSG', hasConfirmMsg ? 'PASS' : 'FAIL',
      hasConfirmMsg ? `Confirmation UI shown: "${hasConfirmMsg[0]}"` : 'No confirmation message found in page');
  } catch(e) { log('STEP_5_EMAIL_CONFIRM', 'FAIL', e.message); }

  // ── STEP 6: CHECK YOPMAIL FOR CONFIRMATION EMAIL ──────────────────────────
  try {
    const yopPage = await context.newPage();
    await yopPage.goto(`https://yopmail.com/en/?login=fwuat${ts}`, { waitUntil: 'domcontentloaded', timeout: 20000 });
    await yopPage.waitForTimeout(5000); // give mail time to arrive
    const yopContent = await yopPage.content();
    const hasEmail = yopContent.match(/fundedwealth|Confirm|Verify|supabase/i);
    log('STEP_6_YOPMAIL_CHECK', 'INFO', hasEmail ? `Email found: ${hasEmail[0]}` : 'No email yet (may take time)');
    await yopPage.screenshot({ path: 'uat_s06_yopmail.png' });
    await yopPage.close();
  } catch(e) { log('STEP_6_YOPMAIL', 'WARN', e.message); }

  // ── STEP 7: ATTEMPT LOGIN (may fail if email not confirmed) ───────────────
  try {
    await page.goto('https://www.fundedwealth.com/sign-in', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: 'uat_s07_signin.png' });

    const emailField = page.locator('input[type="email"]').first();
    const pwField    = page.locator('input[type="password"]').first();
    await emailField.fill(TEST_EMAIL);
    await pwField.fill(TEST_PASSWORD);

    const loginResponsePromise = page.waitForResponse(
      res => res.url().includes('supabase') && res.url().includes('token'),
      { timeout: 15000 }
    );
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();
    const loginResp = await loginResponsePromise.catch(() => null);

    if (loginResp) {
      const loginStatus = loginResp.status();
      const loginBody   = await loginResp.text().catch(() => '');
      log('STEP_7_LOGIN_ATTEMPT', loginStatus === 200 ? 'PASS' : 'FAIL',
        `HTTP ${loginStatus} | ${loginBody.substring(0,200)}`);

      if (loginStatus === 200) {
        const loginData = JSON.parse(loginBody);
        global.__ACCESS_TOKEN = loginData.access_token;
        log('STEP_7_ACCESS_TOKEN', 'PASS', `Token: ${loginData.access_token?.substring(0,30)}...`);
      } else {
        const err = JSON.parse(loginBody);
        log('STEP_7_LOGIN_ERROR', 'FAIL', `error_code: ${err.error_code} | msg: ${err.msg}`);
      }
    }

    await page.waitForTimeout(2000);
    await page.screenshot({ path: 'uat_s07_after_login.png' });
    log('STEP_7_POST_LOGIN_URL', 'INFO', page.url());
  } catch(e) { log('STEP_7_LOGIN', 'FAIL', e.message); }

  // ── STEP 8: CHECK API SERVER HEALTH + USER ENDPOINT ──────────────────────
  try {
    const apiBase = 'https://fundedwealth-api-production.up.railway.app';
    const health = await httpGet(`${apiBase}/api/health`);
    log('STEP_8_API_HEALTH', health.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${health.status} | ${health.body.substring(0,100)}`);

    // Check /api/users/leaderboard (public)
    const lb = await httpGet(`${apiBase}/api/users/leaderboard`);
    let lbData = [];
    try { lbData = JSON.parse(lb.body); } catch {}
    log('STEP_8_LEADERBOARD_API', lb.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${lb.status} | ${lbData.length} entries`);
  } catch(e) { log('STEP_8_API_HEALTH', 'FAIL', e.message); }

  // ── STEP 9: If logged in → navigate to dashboard ─────────────────────────
  const isLoggedIn = page.url().includes('/dashboard') || global.__ACCESS_TOKEN;
  log('STEP_9_LOGIN_STATUS', 'INFO', `Logged in: ${isLoggedIn} | URL: ${page.url()}`);

  if (isLoggedIn || page.url().includes('/dashboard')) {
    try {
      await page.goto('https://www.fundedwealth.com/dashboard', { waitUntil: 'networkidle', timeout: 30000 });
      await page.screenshot({ path: 'uat_s09_dashboard.png' });
      const dashContent = await page.content();
      const hasDash = dashContent.includes('Welcome') || dashContent.includes('Account') || dashContent.includes('Challenge');
      log('STEP_9_DASHBOARD', hasDash ? 'PASS' : 'FAIL', `Dashboard content: ${hasDash}`);
      log('STEP_9_DASHBOARD_URL', 'INFO', page.url());
    } catch(e) { log('STEP_9_DASHBOARD', 'FAIL', e.message); }
  }

  // ── STEP 10: CHECKOUT PAGE ────────────────────────────────────────────────
  try {
    await page.goto('https://www.fundedwealth.com/checkout', { waitUntil: 'networkidle', timeout: 20000 });
    await page.screenshot({ path: 'uat_s10_checkout.png' });
    const checkoutContent = await page.content();
    const hasChallengeOptions = checkoutContent.match(/flash|instant|1.step|2.step|challenge/i);
    const hasRazorpay = checkoutContent.includes('razorpay') || checkoutContent.includes('Razorpay');
    log('STEP_10_CHECKOUT_PAGE', 'INFO', page.url());
    log('STEP_10_CHALLENGE_OPTIONS', hasChallengeOptions ? 'PASS' : 'FAIL',
      `Plans present: ${hasChallengeOptions ? hasChallengeOptions[0] : 'none found'}`);
    log('STEP_10_RAZORPAY', hasRazorpay ? 'PASS' : 'FAIL', `Razorpay loaded: ${hasRazorpay}`);

    // Check plan prices are rendered
    const prices = await page.locator('[class*="price"], [class*="fee"], [class*="plan"]').count();
    log('STEP_10_PLAN_UI_ELEMENTS', prices > 0 ? 'PASS' : 'WARN', `${prices} plan-related elements`);
  } catch(e) { log('STEP_10_CHECKOUT', 'FAIL', e.message); }

  // ── STEP 11: ADMIN PANEL ─────────────────────────────────────────────────
  const adminPage = await context.newPage();
  try {
    const r = await adminPage.goto('https://admin.fundedwealth.com', { waitUntil: 'networkidle', timeout: 30000 });
    log('STEP_11_ADMIN_LOADS', r.status() === 200 ? 'PASS' : 'FAIL', `HTTP ${r.status()}`);
    await adminPage.screenshot({ path: 'uat_s11_admin_home.png' });
    const adminUrl = adminPage.url();
    log('STEP_11_ADMIN_URL', 'INFO', adminUrl);

    // Should redirect to login
    const isLoginPage = adminUrl.includes('/login') || (await adminPage.content()).match(/login|sign.in|password/i);
    log('STEP_11_ADMIN_AUTH_GATE', isLoginPage ? 'PASS' : 'FAIL',
      `Auth gate present: ${!!isLoginPage}`);
  } catch(e) { log('STEP_11_ADMIN_LOADS', 'FAIL', e.message); }

  // ── STEP 12: ADMIN LOGIN PAGE ─────────────────────────────────────────────
  try {
    const adminUrl = adminPage.url();
    if (!adminUrl.includes('/login')) {
      await adminPage.goto('https://admin.fundedwealth.com/login', { waitUntil: 'networkidle', timeout: 20000 });
    }
    await adminPage.screenshot({ path: 'uat_s12_admin_login.png' });
    const hasAdminLoginForm = await adminPage.locator('input[type="password"]').count() > 0;
    log('STEP_12_ADMIN_LOGIN_FORM', hasAdminLoginForm ? 'PASS' : 'FAIL',
      `Password field present: ${hasAdminLoginForm}`);
    const adminContent = await adminPage.content();
    const hasMFA = adminContent.match(/2fa|two.factor|totp|authenticator/i);
    log('STEP_12_ADMIN_MFA_REQUIRED', hasMFA ? 'PASS' : 'INFO',
      `MFA on login page: ${hasMFA ? hasMFA[0] : 'not shown (shown after pw)'}`);
  } catch(e) { log('STEP_12_ADMIN_LOGIN', 'FAIL', e.message); }

  // ── STEP 13: TERMINAL ────────────────────────────────────────────────────
  const termPage = await context.newPage();
  try {
    const r = await termPage.goto('https://terminal.fundedwealth.com', { waitUntil: 'networkidle', timeout: 30000 });
    log('STEP_13_TERMINAL_LOADS', r.status() === 200 ? 'PASS' : 'FAIL', `HTTP ${r.status()}`);
    await termPage.screenshot({ path: 'uat_s13_terminal.png' });
    const termUrl = termPage.url();
    const termContent = await termPage.content();
    log('STEP_13_TERMINAL_URL', 'INFO', termUrl);

    // Should show access denied without SSO token
    const isDenied = termContent.match(/access.denied|unauthorized|login|sso/i);
    log('STEP_13_TERMINAL_AUTH_GATE', isDenied ? 'PASS' : 'FAIL',
      `Auth gate shown: ${isDenied ? isDenied[0] : 'none - terminal open without auth'}`);
  } catch(e) { log('STEP_13_TERMINAL_LOADS', 'FAIL', e.message); }

  // ── STEP 14: TERMINAL SSO ENDPOINT CHECK ─────────────────────────────────
  try {
    const terminalApiResp = await httpGet('https://terminal.fundedwealth.com/auth/verify');
    log('STEP_14_TERMINAL_AUTH_VERIFY', 'INFO', `HTTP ${terminalApiResp.status} | ${terminalApiResp.body.substring(0,100)}`);

    const ssoResp = await httpGet('https://terminal.fundedwealth.com/auth/sso');
    log('STEP_14_TERMINAL_SSO_ENDPOINT', 'INFO', `HTTP ${ssoResp.status} | ${ssoResp.body.substring(0,100)}`);
  } catch(e) { log('STEP_14_TERMINAL_SSO', 'WARN', e.message); }

  // ── STEP 15: API SERVER PROVISIONING CATALOG ─────────────────────────────
  try {
    const catalogResp = await httpGet('https://fundedwealth-api-production.up.railway.app/api/provisioning/catalog');
    log('STEP_15_PROVISIONING_CATALOG', catalogResp.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${catalogResp.status} | ${catalogResp.body.substring(0,200)}`);
  } catch(e) { log('STEP_15_PROVISIONING_CATALOG', 'FAIL', e.message); }

  // ── STEP 16: RAZORPAY ENDPOINT CHECK ─────────────────────────────────────
  try {
    const rzpResp = await httpGet('https://fundedwealth-api-production.up.railway.app/api/razorpay/payment-methods');
    log('STEP_16_RAZORPAY_METHODS', rzpResp.status === 200 ? 'PASS' : 'FAIL',
      `HTTP ${rzpResp.status} | ${rzpResp.body.substring(0,150)}`);
  } catch(e) { log('STEP_16_RAZORPAY', 'FAIL', e.message); }

  // ── DONE ──────────────────────────────────────────────────────────────────
  await browser.close();
  save();

  console.log('\n══════════════════════════════════════════════');
  console.log('  UAT STEP RESULTS');
  console.log('══════════════════════════════════════════════');
  LOG.forEach(r => {
    const icon = r.status === 'PASS' ? '✓' : r.status === 'FAIL' ? '✗' : 'ℹ';
    console.log(`${icon} ${r.status.padEnd(5)} | ${r.step}`);
    if (r.status !== 'INFO' && r.detail) console.log(`          ${r.detail.substring(0,100)}`);
  });

  const passes = LOG.filter(r => r.status === 'PASS').length;
  const fails  = LOG.filter(r => r.status === 'FAIL').length;
  const total  = LOG.filter(r => ['PASS','FAIL'].includes(r.status)).length;
  console.log('\n══════════════════════════════════════════════');
  console.log(`  PASS: ${passes}  FAIL: ${fails}  TOTAL: ${total}`);
  console.log('══════════════════════════════════════════════');
})();
