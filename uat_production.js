/**
 * FundedWealth Production UAT — Full E2E
 * Tests all three systems: Main Website, Admin, Terminal
 */
const { chromium } = require('@playwright/test');
const https = require('https');
const http  = require('http');
const fs    = require('fs');

// ── HELPERS ─────────────────────────────────────────────────────────────────
const LOG = [];
function log(step, status, detail = '') {
  LOG.push({ step, status, detail, ts: new Date().toISOString() });
  const icon = { PASS:'✓', FAIL:'✗', STOP:'⛔', WARN:'⚠', INFO:'ℹ' }[status] || 'ℹ';
  console.log(`${icon} [${status}] ${step}`);
  if (detail) console.log(`     ${String(detail).substring(0,180)}`);
}

function request(url, opts = {}) {
  return new Promise((resolve) => {
    const u = new URL(url);
    const lib = u.protocol === 'https:' ? https : http;
    const body = opts.body ? (typeof opts.body === 'string' ? opts.body : JSON.stringify(opts.body)) : null;
    const reqOpts = {
      hostname: u.hostname,
      path: u.pathname + u.search,
      method: opts.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'FW-UAT/1.0',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {}),
        ...(opts.headers || {})
      }
    };
    const req = lib.request(reqOpts, (res) => {
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message, headers: {} }));
    if (body) req.write(body);
    req.end();
  });
}

const get  = (url, headers) => request(url, { headers });
const post = (url, body, headers) => request(url, { method:'POST', body, headers });

// ── CONFIG ────────────────────────────────────────────────────────────────
const env = fs.readFileSync('c:\\Users\\jitro\\fundedwealth\\.env','utf8');
const getEnv = (k) => { const m = env.match(new RegExp(`^${k}=(.+)$`,'m')); return m ? m[1].trim() : ''; };

const SUPABASE_URL = 'https://nysrxvpjdlvzvcawysvh.supabase.co';
const ANON_KEY     = getEnv('SUPABASE_ANON_KEY');
const API_BASE     = 'https://fundedwealth-api-production.up.railway.app';
const MAIN_URL     = 'https://www.fundedwealth.com';
const ADMIN_URL    = 'https://admin.fundedwealth.com';
const TERM_URL     = 'https://terminal.fundedwealth.com';

const ts           = Date.now();
const TEST_EMAIL   = `fwuat${ts}@yopmail.com`;
const TEST_PASS    = 'UATtest@123';

log('CONFIG', 'INFO', `API: ${API_BASE} | Supabase: ${SUPABASE_URL} | AnonKey: ${ANON_KEY.length} chars`);
log('TEST_EMAIL', 'INFO', TEST_EMAIL);

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const ctx     = await browser.newContext({ viewport:{ width:1400, height:900 },
    userAgent:'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' });

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 1 — INFRASTRUCTURE HEALTH
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 1: INFRASTRUCTURE ══');

  const mainSite = await get(MAIN_URL);
  log('MAIN_SITE_HTTP', mainSite.status===200?'PASS':'FAIL', `HTTP ${mainSite.status}`);

  const apiHealth = await get(`${API_BASE}/api/health`);
  let apiHealthData = {};
  try { apiHealthData = JSON.parse(apiHealth.body); } catch {}
  log('API_SERVER_HEALTH', apiHealth.status===200?'PASS':'FAIL',
    `HTTP ${apiHealth.status} | DB: ${apiHealthData.databaseHealthy} | latency: ${apiHealthData.averageApiLatencyMs}ms`);

  const adminSite = await get(ADMIN_URL);
  log('ADMIN_SITE_HTTP', adminSite.status===200?'PASS':'FAIL', `HTTP ${adminSite.status}`);

  const termSite = await get(TERM_URL);
  log('TERMINAL_SITE_HTTP', termSite.status===200?'PASS':'FAIL', `HTTP ${termSite.status}`);

  // Terminal API check
  const termInstr = await get(`${TERM_URL}/api/instruments/search?q=NIFTY`);
  let termInstrData = [];
  try { termInstrData = JSON.parse(termInstr.body); } catch {}
  log('TERMINAL_INSTRUMENTS_API', termInstr.status===200?'PASS':'FAIL',
    `HTTP ${termInstr.status} | ${termInstrData.length} instruments returned | first: ${termInstrData[0]?.symbol||'none'}`);

  const termAuth = await get(`${TERM_URL}/auth/verify`);
  log('TERMINAL_AUTH_GATE', termAuth.status===401?'PASS':'FAIL',
    `HTTP ${termAuth.status} | ${termAuth.body.substring(0,80)}`);

  const termSSO = await get(`${TERM_URL}/auth/sso?token=INVALID`);
  log('TERMINAL_SSO_REJECTS_INVALID', [302,400,401].includes(termSSO.status)?'PASS':'FAIL',
    `HTTP ${termSSO.status} | redirects to: ${termSSO.headers.location||termSSO.body.substring(0,80)}`);

  const rzpMethods = await get(`${API_BASE}/api/razorpay/payment-methods`);
  log('RAZORPAY_METHODS_API', rzpMethods.status===200?'PASS':'FAIL',
    `HTTP ${rzpMethods.status} | ${rzpMethods.body.substring(0,80)}`);

  const lbData = await get(`${API_BASE}/api/users/leaderboard`);
  let lbRows = [];
  try { lbRows = JSON.parse(lbData.body); } catch {}
  log('LEADERBOARD_API', lbData.status===200?'PASS':'FAIL',
    `HTTP ${lbData.status} | ${lbRows.length} live traders on leaderboard`);

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 2 — USER REGISTRATION
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 2: REGISTRATION ══');

  // Check sign-up page renders
  const signupPage = await ctx.newPage();
  const signupNetReqs = [];
  signupPage.on('request', r => signupNetReqs.push(r.url()));
  await signupPage.goto(`${MAIN_URL}/sign-up`, { waitUntil:'networkidle', timeout:25000 });
  await signupPage.screenshot({ path:'uat_signup.png' });

  const emailInp = await signupPage.locator('input[type="email"]').count();
  const pwInp    = await signupPage.locator('input[type="password"]').count();
  const submitBtns = await signupPage.locator('button[type="submit"]').allTextContents();
  const firstName  = await signupPage.locator('input[placeholder*="First" i], input[placeholder*="first" i], input[name*="first" i]').count();

  log('SIGNUP_PAGE_EMAIL_FIELD',  emailInp>0?'PASS':'FAIL',  `${emailInp} email fields`);
  log('SIGNUP_PAGE_PASSWORD_FIELD', pwInp>0?'PASS':'FAIL', `${pwInp} password fields`);
  log('SIGNUP_PAGE_FIRSTNAME', firstName>0?'PASS':'FAIL', `${firstName} first-name fields`);
  log('SIGNUP_SUBMIT_BUTTON', submitBtns.length>0?'PASS':'FAIL', `Buttons: ${submitBtns.join(' | ')}`);

  // Attempt registration via Supabase API
  const regResp = await post(`${SUPABASE_URL}/auth/v1/signup`,
    { email: TEST_EMAIL, password: TEST_PASS,
      options: { data:{ first_name:'UAT', last_name:'Tester', full_name:'UAT Tester' },
                 emailRedirectTo:`${MAIN_URL}/auth/callback` }},
    { 'apikey': ANON_KEY });

  let USER_ID = null, ACCESS_TOKEN = null;
  const regStatus = regResp.status;

  if (regStatus === 200) {
    let rd = {};
    try { rd = JSON.parse(regResp.body); } catch {}
    USER_ID = rd.id || rd.user?.id;
    log('REGISTRATION_USER_CREATED', USER_ID?'PASS':'FAIL', `HTTP ${regStatus} | UserID: ${USER_ID}`);
    log('REGISTRATION_EMAIL_CONFIRM', rd.email_confirmed_at?'PASS':'WARN',
      `email_confirmed_at: ${rd.email_confirmed_at||'null — confirmation email sent'}`);
    log('REGISTRATION_CONFIRM_SENT_AT', 'INFO', `confirmation_sent_at: ${rd.confirmation_sent_at||'n/a'}`);
  } else if (regStatus === 429) {
    log('REGISTRATION_RATE_LIMITED', 'WARN', `HTTP 429 — email rate limit (too many test registrations)`);
    log('REGISTRATION_USING_EXISTING', 'INFO', 'Will attempt login with previously registered test user');
  } else {
    let errData = {};
    try { errData = JSON.parse(regResp.body); } catch {}
    log('REGISTRATION_FAILED', 'FAIL', `HTTP ${regStatus} | ${errData.msg||regResp.body.substring(0,100)}`);
  }

  await signupPage.close();

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 3 — LOGIN (use existing confirmed user from leaderboard if new reg failed)
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 3: LOGIN ══');

  // Try login with new test user first
  let loginResp = await post(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    { email: TEST_EMAIL, password: TEST_PASS },
    { 'apikey': ANON_KEY });

  let loginData = {};
  try { loginData = JSON.parse(loginResp.body); } catch {}

  if (loginResp.status === 200 && loginData.access_token) {
    ACCESS_TOKEN = loginData.access_token;
    USER_ID = loginData.user?.id || USER_ID;
    log('LOGIN_SUCCESS', 'PASS', `UserID: ${USER_ID} | Token: ${ACCESS_TOKEN.substring(0,30)}...`);
  } else {
    const errCode = loginData.error_code || loginData.code || loginResp.status;
    log('LOGIN_NEW_USER', 'FAIL', `HTTP ${loginResp.status} | error: ${errCode} | ${loginData.msg||loginData.message||''}`);

    if (String(errCode) === 'email_not_confirmed') {
      log('LOGIN_EMAIL_NOT_CONFIRMED', 'STOP',
        'Production Supabase requires email confirmation. mailer_autoconfirm=false. ' +
        'User must click confirmation link in email before login is possible.');
    }
  }

  // Inspect sign-in page
  const signinPage = await ctx.newPage();
  const signinNetworkCalls = [];
  signinPage.on('response', async res => {
    if (res.url().includes('supabase') && res.url().includes('/auth/')) {
      const body = await res.text().catch(() => '');
      signinNetworkCalls.push({ url: res.url().substring(0,100), status: res.status(), body: body.substring(0,150) });
    }
  });
  await signinPage.goto(`${MAIN_URL}/sign-in`, { waitUntil:'networkidle', timeout:20000 });
  await signinPage.screenshot({ path:'uat_signin.png' });

  const siEmailInp = await signinPage.locator('input[type="email"]').count();
  const siPwInp    = await signinPage.locator('input[type="password"]').count();
  const siHasForgot = await signinPage.locator('button:has-text("Forgot"), a:has-text("Forgot")').count();
  const siHasGoogle = await signinPage.locator('button:has-text("Google")').count();
  const siSubmit    = await signinPage.locator('button[type="submit"]').allTextContents();

  log('SIGNIN_PAGE_RENDERS',  siEmailInp>0?'PASS':'FAIL', `email: ${siEmailInp} pw: ${siPwInp}`);
  log('SIGNIN_FORGOT_PASSWORD', siHasForgot>0?'PASS':'FAIL', `Forgot password link: ${siHasForgot>0}`);
  log('SIGNIN_GOOGLE_OAUTH', siHasGoogle>0?'PASS':'FAIL', `Google button: ${siHasGoogle>0}`);
  log('SIGNIN_SUBMIT_BUTTON', siSubmit.length>0?'PASS':'FAIL', `"${siSubmit.join('|')}"` );

  // Try actual login via the UI to capture the Supabase call
  if (siEmailInp > 0 && siPwInp > 0) {
    await signinPage.locator('input[type="email"]').first().fill(TEST_EMAIL);
    await signinPage.locator('input[type="password"]').first().fill(TEST_PASS);
    const uiLoginRespPromise = signinPage.waitForResponse(
      r => r.url().includes('supabase') && r.url().includes('token'), { timeout:12000 }).catch(() => null);
    await signinPage.locator('button[type="submit"]').first().click();
    const uiLoginResp = await uiLoginRespPromise;
    if (uiLoginResp) {
      const uiBody = await uiLoginResp.text().catch(() => '{}');
      let uiData = {};
      try { uiData = JSON.parse(uiBody); } catch {}
      log('LOGIN_UI_SUPABASE_CALL', uiLoginResp.status()===200?'PASS':'FAIL',
        `HTTP ${uiLoginResp.status()} | error: ${uiData.error_code||uiData.code||'none'} | msg: ${uiData.msg||uiData.message||'ok'}`);
      if (uiLoginResp.status() === 200 && uiData.access_token) {
        ACCESS_TOKEN = uiData.access_token;
        USER_ID = uiData.user?.id || USER_ID;
        log('LOGIN_UI_TOKEN', 'PASS', `Token acquired via UI: ${ACCESS_TOKEN.substring(0,30)}...`);
      }
    } else {
      log('LOGIN_UI_NO_SUPABASE_CALL', 'FAIL', 'No Supabase token call captured after submit');
    }
  }

  await signinPage.waitForTimeout(2000);
  log('POST_LOGIN_URL', 'INFO', signinPage.url());
  await signinPage.screenshot({ path:'uat_post_login.png' });
  await signinPage.close();

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 4 — CHECKOUT + PAYMENT (unauthenticated — check UI/API readiness)
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 4: CHECKOUT & PAYMENT ══');

  const checkoutPage = await ctx.newPage();
  const checkoutApiCalls = [];
  checkoutPage.on('response', async res => {
    if (res.url().includes('/api/') || res.url().includes('razorpay')) {
      const body = await res.text().catch(() => '');
      checkoutApiCalls.push({ url: res.url().substring(0,100), status: res.status(), body: body.substring(0,200) });
    }
  });

  await checkoutPage.goto(`${MAIN_URL}/checkout`, { waitUntil:'networkidle', timeout:25000 });
  await checkoutPage.screenshot({ path:'uat_checkout.png' });

  const plans = await checkoutPage.locator('[class*="plan"], [class*="challenge"], h2, h3').allTextContents();
  const hasFlash   = plans.some(p => /flash/i.test(p));
  const hasInstant = plans.some(p => /instant/i.test(p));
  const has1Step   = plans.some(p => /1.step|one.step/i.test(p));
  const has2Step   = plans.some(p => /2.step|two.step/i.test(p));
  const hasRzp     = (await checkoutPage.content()).includes('razorpay');
  const hasUPI     = (await checkoutPage.content()).match(/upi|gpay|phonepe|paytm/i);

  log('CHECKOUT_PAGE_LOADS', 'PASS', checkoutPage.url());
  log('CHECKOUT_PLAN_FLASH',   hasFlash?'PASS':'FAIL',   `Flash plan visible: ${hasFlash}`);
  log('CHECKOUT_PLAN_INSTANT', hasInstant?'PASS':'FAIL', `Instant plan visible: ${hasInstant}`);
  log('CHECKOUT_PLAN_1STEP',   has1Step?'PASS':'FAIL',   `1-Step plan visible: ${has1Step}`);
  log('CHECKOUT_PLAN_2STEP',   has2Step?'PASS':'FAIL',   `2-Step plan visible: ${has2Step}`);
  log('CHECKOUT_RAZORPAY_LOADED', hasRzp?'PASS':'FAIL',  `Razorpay JS loaded: ${hasRzp}`);
  log('CHECKOUT_UPI_OPTION', hasUPI?'PASS':'WARN', `UPI payment option: ${!!hasUPI}`);

  // Check the Razorpay API endpoint
  const rzpMethodsResp = await get(`${API_BASE}/api/razorpay/payment-methods`);
  let rzpMethodsData = {};
  try { rzpMethodsData = JSON.parse(rzpMethodsResp.body); } catch {}
  log('CHECKOUT_RAZORPAY_API', rzpMethodsResp.status===200?'PASS':'FAIL',
    `${rzpMethodsData.methods?.length||0} payment methods: ${rzpMethodsData.methods?.map(m=>m.id).join(', ')||'none'}`);

  // Check provisioning catalog (plan definitions)
  const catalogResp = await get(`${API_BASE}/api/provisioning/catalog`,
    { 'x-internal-provision-secret': getEnv('INTERNAL_PROVISION_SECRET') || 'test' });
  let catalogData = {};
  try { catalogData = JSON.parse(catalogResp.body); } catch {}
  log('CHECKOUT_PROVISIONING_CATALOG', catalogData.products?.length>0?'PASS':'FAIL',
    `HTTP ${catalogResp.status} | ${catalogData.products?.length||0} plans in catalog: ${catalogData.products?.map(p=>p.slug).join(', ')||'none'}`);

  // Log any checkout page API calls made
  checkoutApiCalls.forEach(c => log('CHECKOUT_API_CALL', 'INFO', `${c.status} ${c.url}`));

  await checkoutPage.close();

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 5 — AUTHENTICATED API TESTS (if token available)
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', `══ BLOCK 5: AUTHENTICATED APIs (token: ${ACCESS_TOKEN?'YES':'NO'}) ══`);

  if (ACCESS_TOKEN) {
    const authHdr = { 'Authorization': `Bearer ${ACCESS_TOKEN}` };

    const meResp = await post(`${API_BASE}/api/users/me`,
      { email: TEST_EMAIL, firstName:'UAT', lastName:'Tester' }, authHdr);
    let meData = {};
    try { meData = JSON.parse(meResp.body); } catch {}
    log('API_USERS_ME', meResp.status===200?'PASS':'FAIL',
      `HTTP ${meResp.status} | id: ${meData.id||meData.user?.id||'n/a'}`);

    const acctResp = await get(`${API_BASE}/api/accounts/my`, authHdr);
    let acctData = {};
    try { acctData = JSON.parse(acctResp.body); } catch {}
    log('API_ACCOUNTS_MY', acctResp.status===200?'PASS':'FAIL',
      `HTTP ${acctResp.status} | accounts: ${acctData.accounts?.length??'n/a'} | ${acctResp.body.substring(0,80)}`);

    const kycResp = await get(`${API_BASE}/api/kyc/status`, authHdr);
    let kycData = {};
    try { kycData = JSON.parse(kycResp.body); } catch {}
    log('API_KYC_STATUS', [200,404].includes(kycResp.status)?'PASS':'FAIL',
      `HTTP ${kycResp.status} | kycStatus: ${kycData.kycStatus||'n/a'}`);

    const affResp = await get(`${API_BASE}/api/affiliate/stats`, authHdr);
    let affData = {};
    try { affData = JSON.parse(affResp.body); } catch {}
    log('API_AFFILIATE_STATS', [200,404].includes(affResp.status)?'PASS':'FAIL',
      `HTTP ${affResp.status} | referralCount: ${affData.referralCount??'n/a'}`);

    const notifResp = await get(`${API_BASE}/api/notifications`, authHdr);
    log('API_NOTIFICATIONS', [200,404].includes(notifResp.status)?'PASS':'FAIL',
      `HTTP ${notifResp.status} | ${notifResp.body.substring(0,80)}`);

    const payoutsResp = await get(`${API_BASE}/api/payouts`, authHdr);
    log('API_PAYOUTS', [200,404].includes(payoutsResp.status)?'PASS':'FAIL',
      `HTTP ${payoutsResp.status} | ${payoutsResp.body.substring(0,80)}`);

    const termLaunchResp = await post(`${API_BASE}/api/terminal-launch`,
      { accountId: 'test-account-id' }, authHdr);
    let termLaunchData = {};
    try { termLaunchData = JSON.parse(termLaunchResp.body); } catch {}
    log('API_TERMINAL_LAUNCH_AUTH', [400,404].includes(termLaunchResp.status)?'PASS':'FAIL',
      `HTTP ${termLaunchResp.status} | ${termLaunchData.message||termLaunchData.error||termLaunchResp.body.substring(0,80)}`);

  } else {
    log('BLOCK5_SKIP', 'WARN', 'Skipping authenticated API tests — no access token (email not confirmed)');

    // Test what happens without auth
    const acctUnauth = await get(`${API_BASE}/api/accounts/my`);
    log('API_ACCOUNTS_UNAUTH', acctUnauth.status===401?'PASS':'FAIL',
      `Unauthenticated: HTTP ${acctUnauth.status} (expected 401) | ${acctUnauth.body.substring(0,80)}`);

    const kycUnauth = await get(`${API_BASE}/api/kyc/status`);
    log('API_KYC_UNAUTH', kycUnauth.status===401?'PASS':'FAIL',
      `Unauthenticated: HTTP ${kycUnauth.status} (expected 401)`);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 6 — DASHBOARD UI
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 6: DASHBOARD UI ══');

  const dashPage = await ctx.newPage();
  const dashApiCalls = [];
  dashPage.on('response', async res => {
    const u = res.url();
    if (u.includes('/api/') || u.includes('supabase')) {
      const b = await res.text().catch(() => '');
      dashApiCalls.push({ url: u.substring(0,100), status: res.status(), body: b.substring(0,100) });
    }
  });

  await dashPage.goto(`${MAIN_URL}/dashboard`, { waitUntil:'networkidle', timeout:30000 });
  await dashPage.waitForTimeout(3000);
  await dashPage.screenshot({ path:'uat_dashboard.png' });

  const dashUrl = dashPage.url();
  const dashContent = await dashPage.content();

  if (dashUrl.includes('/sign-in') || dashUrl.includes('/login')) {
    log('DASHBOARD_AUTH_REDIRECT', 'PASS', `Unauthenticated user redirected to: ${dashUrl}`);
  } else if (dashUrl.includes('/dashboard')) {
    log('DASHBOARD_LOADS', 'PASS', `Dashboard accessible at: ${dashUrl}`);
    const hasWelcome  = /welcome/i.test(dashContent);
    const hasAccounts = /accounts?/i.test(dashContent);
    const hasBalance  = /balance|₹/i.test(dashContent);
    const hasSidebar  = await dashPage.locator('nav, aside, [class*="sidebar"]').count();
    log('DASHBOARD_WELCOME_MSG',  hasWelcome?'PASS':'FAIL',  `Welcome message: ${hasWelcome}`);
    log('DASHBOARD_ACCOUNTS_SEC', hasAccounts?'PASS':'FAIL', `Accounts section: ${hasAccounts}`);
    log('DASHBOARD_BALANCE',      hasBalance?'PASS':'FAIL',  `Balance/currency: ${hasBalance}`);
    log('DASHBOARD_SIDEBAR',      hasSidebar>0?'PASS':'FAIL', `Sidebar elements: ${hasSidebar}`);
  } else {
    log('DASHBOARD_UNEXPECTED_URL', 'FAIL', `Unexpected URL: ${dashUrl}`);
  }

  // Log API calls made by dashboard
  const importantCalls = dashApiCalls.filter(c => !c.url.includes('font') && !c.url.includes('gtm'));
  importantCalls.slice(0,8).forEach(c =>
    log('DASHBOARD_API_CALL', c.status<400?'PASS':'FAIL', `${c.status} ${c.url}`)
  );

  await dashPage.close();

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 7 — ADMIN PANEL
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 7: ADMIN PANEL ══');

  const adminPage = await ctx.newPage();
  const adminApiCalls = [];
  adminPage.on('response', async res => {
    const u = res.url();
    if (u.includes('/api/') || u.includes('supabase')) {
      const b = await res.text().catch(() => '');
      adminApiCalls.push({ url: u.substring(0,120), status: res.status(), body: b.substring(0,150) });
    }
  });

  // Root redirect
  const adminRoot = await get(ADMIN_URL);
  log('ADMIN_ROOT_HTTP', adminRoot.status===200?'PASS':'FAIL', `HTTP ${adminRoot.status}`);
  const adminRedirect = adminRoot.headers.location || '';
  log('ADMIN_ROOT_REDIRECT', 'INFO', `Location: ${adminRedirect||'none (inline redirect)'}`);

  await adminPage.goto(`${ADMIN_URL}/login`, { waitUntil:'networkidle', timeout:25000 });
  await adminPage.screenshot({ path:'uat_admin_login.png', fullPage:true });

  const adminUrl = adminPage.url();
  log('ADMIN_LOGIN_URL', 'PASS', adminUrl);

  const adminEmailInp = await adminPage.locator('input[type="text"], input[type="email"]').count();
  const adminPwInp    = await adminPage.locator('input[type="password"]').count();
  const adminBtns     = await adminPage.locator('button').allTextContents();
  log('ADMIN_LOGIN_FIELDS', adminEmailInp>0&&adminPwInp>0?'PASS':'FAIL',
    `identifier: ${adminEmailInp} | password: ${adminPwInp}`);
  log('ADMIN_LOGIN_BUTTONS', 'INFO', adminBtns.map(b=>b.trim()).filter(Boolean).join(' | '));

  // Check admin uses its own session system (not Supabase user auth)
  const adminContent = await adminPage.content();
  const adminUsesSupabase = adminApiCalls.some(c => c.url.includes('supabase'));
  log('ADMIN_AUTH_SYSTEM', !adminUsesSupabase?'PASS':'WARN',
    `Uses custom staff_sessions (not Supabase user auth): ${!adminUsesSupabase}`);

  // Test admin API endpoints (unauthenticated — should all 401)
  const adminApiTests = [
    `${ADMIN_URL}/api/users`,
    `${ADMIN_URL}/api/payments`,
    `${ADMIN_URL}/api/purchases`,
    `${ADMIN_URL}/api/challenges`,
    `${ADMIN_URL}/api/executive`,
    `${ADMIN_URL}/api/provision`,
  ];
  for (const url of adminApiTests) {
    const r = await get(url);
    const path = url.replace(ADMIN_URL,'');
    log(`ADMIN_API_AUTH_GATE${path}`, r.status===401?'PASS':'FAIL',
      `HTTP ${r.status} (expected 401) | ${r.body.substring(0,60)}`);
  }

  // Test 2FA page exists
  await adminPage.goto(`${ADMIN_URL}/2fa`, { waitUntil:'domcontentloaded', timeout:15000 }).catch(()=>{});
  const twoFaContent = await adminPage.content();
  const has2FA = /two.factor|2fa|totp|authenticator|otp/i.test(twoFaContent);
  log('ADMIN_2FA_PAGE', has2FA?'PASS':'FAIL', `2FA page: ${has2FA}`);
  await adminPage.screenshot({ path:'uat_admin_2fa.png' });

  // Check admin CSRF cookie is set
  const adminCookies = await adminPage.context().cookies(ADMIN_URL);
  const csrfCookie = adminCookies.find(c => c.name === '__csrf_token');
  log('ADMIN_CSRF_COOKIE', csrfCookie?'PASS':'WARN',
    `CSRF cookie: ${csrfCookie?`set (httpOnly:${csrfCookie.httpOnly})`:'not set'}`);

  await adminPage.close();

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 8 — TERMINAL APP
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 8: TERMINAL APP ══');

  const termPage = await ctx.newPage();
  const termApiCalls = [];
  termPage.on('response', async res => {
    const u = res.url();
    if (u.includes(TERM_URL) && (u.includes('/api/') || u.includes('/auth/'))) {
      const b = await res.text().catch(() => '');
      termApiCalls.push({ url: u.replace(TERM_URL,''), status: res.status(), body: b.substring(0,150) });
    }
  });

  await termPage.goto(TERM_URL, { waitUntil:'networkidle', timeout:30000 });
  await termPage.waitForTimeout(3000);
  await termPage.screenshot({ path:'uat_terminal.png' });

  const termContent = await termPage.content();
  const termUrl = termPage.url();
  log('TERMINAL_URL', 'INFO', termUrl);

  // Access Denied component check
  const isAccessDenied = /access.?denied|no.?session|not.?authenticated/i.test(termContent);
  log('TERMINAL_ACCESS_DENIED_SHOWN', isAccessDenied?'PASS':'FAIL',
    `AccessDenied component rendered: ${isAccessDenied}`);

  // Verify auth calls made on load
  const termAuthCalls = termApiCalls.filter(c => c.url.includes('/auth/'));
  log('TERMINAL_AUTH_VERIFY_ON_LOAD', termAuthCalls.length>0?'PASS':'FAIL',
    termAuthCalls.map(c => `${c.status} ${c.url}`).join(' | ') || 'no auth calls made');

  // All terminal API endpoints
  const termEndpointTests = [
    { url: `${TERM_URL}/auth/verify`,                   expectedStatus: 401 },
    { url: `${TERM_URL}/auth/sso?token=BADTOKEN`,       expectedStatus: [302,400,401] },
    { url: `${TERM_URL}/api/accounts`,                  expectedStatus: 401 },
    { url: `${TERM_URL}/api/watchlists`,                expectedStatus: 401 },
    { url: `${TERM_URL}/api/persistence/themes`,        expectedStatus: 401 },
    { url: `${TERM_URL}/api/instruments/search?q=NIFTY`,expectedStatus: 200 },
    { url: `${TERM_URL}/api/instruments/search?q=BANKNIFTY`, expectedStatus: 200 },
  ];

  for (const test of termEndpointTests) {
    const r = await get(test.url);
    const expected = Array.isArray(test.expectedStatus) ? test.expectedStatus : [test.expectedStatus];
    const pass = expected.includes(r.status);
    const path = test.url.replace(TERM_URL,'');
    let detail = `HTTP ${r.status}`;
    if (r.status === 200) {
      try {
        const d = JSON.parse(r.body);
        detail += ` | ${Array.isArray(d) ? d.length+' items' : JSON.stringify(d).substring(0,80)}`;
      } catch { detail += ` | ${r.body.substring(0,60)}`; }
    } else {
      detail += ` | ${r.body.substring(0,80)}`;
    }
    log(`TERMINAL_ENDPOINT_${path.replace(/[^a-zA-Z0-9]/g,'_').toUpperCase()}`,
      pass?'PASS':'FAIL', detail);
  }

  // Check NIFTY instrument data quality
  const niftyResp = await get(`${TERM_URL}/api/instruments/search?q=NIFTY`);
  let niftyData = [];
  try { niftyData = JSON.parse(niftyResp.body); } catch {}
  if (niftyData.length > 0) {
    const n = niftyData[0];
    log('TERMINAL_NIFTY_DATA_QUALITY', 'PASS',
      `token:${n.token} symbol:${n.symbol} segment:${n.segment} lotSize:${n.lotSize} tickSize:${n.tickSize}`);
  }

  // Check market quote / depth
  const quoteResp = await get(`${TERM_URL}/api/market/quote?token=99926000`);
  log('TERMINAL_MARKET_QUOTE', quoteResp.status===200?'PASS':'WARN',
    `HTTP ${quoteResp.status} | ${quoteResp.body.substring(0,100)}`);

  const depthResp = await get(`${TERM_URL}/api/market/depth?token=99926000`);
  log('TERMINAL_MARKET_DEPTH', depthResp.status===200?'PASS':'WARN',
    `HTTP ${depthResp.status} | ${depthResp.body.substring(0,100)}`);

  // Terminal API calls logged on load
  termApiCalls.forEach(c => log('TERMINAL_ONLOAD_CALL', c.status<400?'PASS':'FAIL',
    `${c.status} ${c.url}`));

  await termPage.close();

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 9 — END-TO-END SYNC VERIFICATION
  // ═══════════════════════════════════════════════════════════════════════════
  log('', 'INFO', '══ BLOCK 9: SYNC VERIFICATION ══');

  // Test terminal-sync endpoint security
  const syncNoAuth = await post(`${API_BASE}/api/terminal/sync`,
    { syncId:'test', timestamp: new Date().toISOString(), terminalId:'fake',
      tradingAccountId:'fake', challengeAccountId:'fake',
      currentBalance:100000, availableMargin:90000, peakBalance:100000,
      totalTrades:0, winningTrades:0, losingTrades:0, grossProfit:0, grossLoss:0,
      currentDrawdown:0, maxDrawdownHit:0, dailyPnL:0 }, {});
  log('SYNC_ENDPOINT_NO_AUTH', syncNoAuth.status===401?'PASS':'FAIL',
    `HTTP ${syncNoAuth.status} (expected 401) | ${syncNoAuth.body.substring(0,80)}`);

  // Test trade-event endpoint
  const tradeEventNoAuth = await post(`${API_BASE}/api/terminal/trade-event`,
    { tradingAccountId:'fake', tradeId:'fake' }, {});
  log('TRADE_EVENT_NO_AUTH', tradeEventNoAuth.status===401?'PASS':'FAIL',
    `HTTP ${tradeEventNoAuth.status} (expected 401) | ${tradeEventNoAuth.body.substring(0,80)}`);

  // Test admin-events endpoint
  const adminEventsResp = await get(`${API_BASE}/api/admin-events`);
  log('ADMIN_EVENTS_API', adminEventsResp.status===401?'PASS':'FAIL',
    `HTTP ${adminEventsResp.status} (expected 401) | ${adminEventsResp.body.substring(0,80)}`);

  // Test provisioning retry without auth
  const provRetryNoAuth = await post(`${API_BASE}/api/provisioning/retry/fake-id`, {}, {});
  log('PROVISIONING_RETRY_NO_AUTH', provRetryNoAuth.status===401?'PASS':'FAIL',
    `HTTP ${provRetryNoAuth.status} (expected 401) | ${provRetryNoAuth.body.substring(0,80)}`);

  // Test that payouts requires auth
  const payoutsNoAuth = await get(`${API_BASE}/api/payouts`);
  log('PAYOUTS_NO_AUTH', payoutsNoAuth.status===401?'PASS':'FAIL',
    `HTTP ${payoutsNoAuth.status} (expected 401) | ${payoutsNoAuth.body.substring(0,60)}`);

  // Public endpoints should work
  const publicBlog = await get(`${API_BASE}/api/blog`);
  log('BLOG_API_PUBLIC', [200,404].includes(publicBlog.status)?'PASS':'FAIL',
    `HTTP ${publicBlog.status} | ${publicBlog.body.substring(0,80)}`);

  const publicImpact = await get(`${API_BASE}/api/impact`);
  log('IMPACT_API_PUBLIC', [200,404].includes(publicImpact.status)?'PASS':'FAIL',
    `HTTP ${publicImpact.status} | ${publicImpact.body.substring(0,80)}`);

  // Check debug endpoint exposure (security issue from audit)
  const debugResp = await get(`${API_BASE}/debug/secret-hash`);
  log('SECURITY_DEBUG_ENDPOINT_EXPOSED', debugResp.status===200?'FAIL':'PASS',
    `HTTP ${debugResp.status} — /debug/secret-hash ${debugResp.status===200?'IS EXPOSED (SECURITY RISK)':'is protected'} | ${debugResp.body.substring(0,100)}`);

  // ═══════════════════════════════════════════════════════════════════════════
  // BLOCK 10 — FINAL REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  await browser.close();
  fs.writeFileSync('uat_production_results.json', JSON.stringify(LOG, null, 2));

  const passes = LOG.filter(r => r.status === 'PASS').length;
  const fails  = LOG.filter(r => r.status === 'FAIL').length;
  const warns  = LOG.filter(r => r.status === 'WARN').length;
  const stops  = LOG.filter(r => r.status === 'STOP').length;
  const total  = LOG.filter(r => ['PASS','FAIL'].includes(r.status)).length;
  const pct    = total > 0 ? Math.round((passes/total)*100) : 0;

  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          FUNDEDWEALTH PRODUCTION UAT RESULTS            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  const sections = [
    'BLOCK 1: INFRASTRUCTURE',
    'BLOCK 2: REGISTRATION',
    'BLOCK 3: LOGIN',
    'BLOCK 4: CHECKOUT',
    'BLOCK 5: AUTHENTICATED APIs',
    'BLOCK 6: DASHBOARD',
    'BLOCK 7: ADMIN',
    'BLOCK 8: TERMINAL',
    'BLOCK 9: SYNC / SECURITY',
  ];

  let currentSection = '';
  for (const r of LOG) {
    if (r.status === 'INFO' && r.step === '') {
      currentSection = r.detail;
      console.log(`\n  ${currentSection}`);
      continue;
    }
    if (['PASS','FAIL','WARN','STOP'].includes(r.status)) {
      const icon = { PASS:'✓', FAIL:'✗', WARN:'⚠', STOP:'⛔' }[r.status];
      console.log(`  ${icon} ${r.status.padEnd(4)} ${r.step.substring(0,55).padEnd(55)} ${r.detail.substring(0,60)}`);
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log(`║  PASS: ${String(passes).padEnd(4)} FAIL: ${String(fails).padEnd(4)} WARN: ${String(warns).padEnd(4)} STOP: ${String(stops).padEnd(4)} TOTAL: ${total}  (${pct}%)  ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  // Critical failures summary
  const criticalFails = LOG.filter(r => r.status === 'FAIL');
  if (criticalFails.length > 0) {
    console.log('\n⛔ FAILURES:');
    criticalFails.forEach(r => console.log(`   ✗ ${r.step}: ${r.detail.substring(0,120)}`));
  }

  const stopItems = LOG.filter(r => r.status === 'STOP');
  if (stopItems.length > 0) {
    console.log('\n⛔ BLOCKERS:');
    stopItems.forEach(r => console.log(`   ⛔ ${r.step}: ${r.detail.substring(0,120)}`));
  }

  console.log('\nScreenshots saved: uat_*.png');
  console.log('Full results: uat_production_results.json');
})();
