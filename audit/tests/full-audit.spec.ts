import { test, expect, type Page, type BrowserContext } from '@playwright/test';

const BASE = 'https://fundedwealth.com';

// Collector for all findings
const findings: any[] = [];

function record(phase: string, item: string, status: string, detail?: string) {
  findings.push({ phase, item, status, detail: detail || '' });
}

// ============================================================================
// PHASE 1 — FRONTEND AUDIT: Visit every page
// ============================================================================
const PAGES = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Mission', path: '/mission' },
  { name: 'Impact', path: '/impact' },
  { name: 'Championship', path: '/championship' },
  { name: 'Leaderboard', path: '/leaderboard' },
  { name: 'Scaling', path: '/scaling' },
  { name: 'Payouts', path: '/payouts' },
  { name: 'Blog', path: '/blog' },
  { name: 'Rules', path: '/rules' },
  { name: 'FAQ', path: '/faq' },
  { name: 'Success Stories', path: '/success-stories' },
  { name: 'Community', path: '/community' },
  { name: 'Terms', path: '/terms' },
  { name: 'Privacy', path: '/privacy' },
  { name: 'Refund', path: '/refund' },
  { name: 'Economic Calendar', path: '/economic-calendar' },
  { name: 'Sign In', path: '/sign-in' },
  { name: 'Sign Up', path: '/sign-up' },
  { name: 'Checkout', path: '/checkout' },
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'KYC', path: '/kyc' },
  { name: 'Admin', path: '/admin' },
];

test.describe('PHASE 1 — Frontend Page Audit', () => {
  for (const pg of PAGES) {
    test(`Page loads: ${pg.name} (${pg.path})`, async ({ page }) => {
      const errors: string[] = [];
      const networkFailures: string[] = [];

      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', err => errors.push(err.message));
      page.on('requestfailed', req => {
        networkFailures.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
      });

      const response = await page.goto(`${BASE}${pg.path}`, { waitUntil: 'networkidle', timeout: 30000 });
      const status = response?.status() || 0;

      // Check page loaded
      expect(status).toBeLessThan(500);

      // Take screenshot
      await page.screenshot({ path: `screenshots/${pg.name.replace(/\s/g, '_')}.png`, fullPage: false });

      // Report findings
      const pageStatus = status >= 200 && status < 400 ? 'WORKING' : status >= 400 ? 'BROKEN' : 'PARTIAL';
      
      console.log(`[${pg.name}] Status: ${status} | JS Errors: ${errors.length} | Network Failures: ${networkFailures.length}`);
      if (errors.length > 0) console.log(`  JS Errors: ${errors.slice(0, 5).join(' | ')}`);
      if (networkFailures.length > 0) console.log(`  Network Failures: ${networkFailures.slice(0, 5).join(' | ')}`);
    });
  }
});

// ============================================================================
// PHASE 2 — USER FLOW AUDIT
// ============================================================================
test.describe('PHASE 2 — User Flow Audit', () => {
  test('Landing page has CTA buttons', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    
    // Check for main CTA
    const ctaButtons = await page.locator('a, button').filter({ hasText: /get funded|start|sign up|register|buy/i }).count();
    console.log(`[Landing CTA] Found ${ctaButtons} CTA buttons`);
    expect(ctaButtons).toBeGreaterThan(0);
  });

  test('Sign Up page renders form', async ({ page }) => {
    await page.goto(`${BASE}/sign-up`, { waitUntil: 'networkidle' });
    
    // Look for email/password fields
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    
    const hasEmail = await emailInput.count();
    const hasPassword = await passwordInput.count();
    
    console.log(`[Sign Up] Email fields: ${hasEmail} | Password fields: ${hasPassword}`);
    await page.screenshot({ path: 'screenshots/SignUp_Form.png' });
  });

  test('Sign In page renders form', async ({ page }) => {
    await page.goto(`${BASE}/sign-in`, { waitUntil: 'networkidle' });
    
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]');
    const passwordInput = page.locator('input[type="password"]');
    
    const hasEmail = await emailInput.count();
    const hasPassword = await passwordInput.count();
    
    console.log(`[Sign In] Email fields: ${hasEmail} | Password fields: ${hasPassword}`);
    await page.screenshot({ path: 'screenshots/SignIn_Form.png' });
  });

  test('Dashboard redirects unauthenticated user', async ({ page }) => {
    const response = await page.goto(`${BASE}/dashboard`, { waitUntil: 'networkidle' });
    
    // Should redirect to sign-in
    const url = page.url();
    console.log(`[Dashboard] Final URL: ${url}`);
    const redirectedToLogin = url.includes('sign-in') || url.includes('login');
    console.log(`[Dashboard] Redirected to login: ${redirectedToLogin}`);
    await page.screenshot({ path: 'screenshots/Dashboard_Unauthenticated.png' });
  });

  test('Checkout page renders', async ({ page }) => {
    await page.goto(`${BASE}/checkout`, { waitUntil: 'networkidle' });
    
    const body = await page.textContent('body');
    const hasPlans = body?.toLowerCase().includes('flash') || body?.toLowerCase().includes('instant') || body?.toLowerCase().includes('step');
    console.log(`[Checkout] Has plan options: ${hasPlans}`);
    await page.screenshot({ path: 'screenshots/Checkout_Page.png' });
  });
});

// ============================================================================
// PHASE 3 — API AUDIT
// ============================================================================
test.describe('PHASE 3 — API Audit', () => {
  const API_BASE = 'https://fundedwealth-api-mwj6.onrender.com';

  test('Health endpoint', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/api/health`, { timeout: 30000 });
      console.log(`[API Health] Status: ${res.status()} Body: ${await res.text()}`);
    } catch (e: any) {
      console.log(`[API Health] FAILED: ${e.message}`);
    }
  });

  test('Auth register endpoint exists', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/api/auth/register`, {
        data: {},
        timeout: 30000,
      });
      console.log(`[API Auth Register] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Auth Register] FAILED: ${e.message}`);
    }
  });

  test('Auth login endpoint exists', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/api/auth/login`, {
        data: {},
        timeout: 30000,
      });
      console.log(`[API Auth Login] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Auth Login] FAILED: ${e.message}`);
    }
  });

  test('Blog API', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/api/blog`, { timeout: 30000 });
      console.log(`[API Blog] Status: ${res.status()} Body: ${(await res.text()).slice(0, 300)}`);
    } catch (e: any) {
      console.log(`[API Blog] FAILED: ${e.message}`);
    }
  });

  test('Payments endpoint (no auth)', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/api/payments/manual-bank-transfer`, {
        data: {},
        timeout: 30000,
      });
      console.log(`[API Payments] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Payments] FAILED: ${e.message}`);
    }
  });

  test('Razorpay create-order endpoint', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/api/razorpay/create-order`, {
        data: { amount: 999, planType: 'flash', sizeIndex: 0 },
        timeout: 30000,
      });
      console.log(`[API Razorpay] Status: ${res.status()} Body: ${(await res.text()).slice(0, 300)}`);
    } catch (e: any) {
      console.log(`[API Razorpay] FAILED: ${e.message}`);
    }
  });

  test('Users endpoint (no auth)', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/api/users/me`, { timeout: 30000 });
      console.log(`[API Users Me] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Users Me] FAILED: ${e.message}`);
    }
  });

  test('KYC endpoint (no auth)', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/api/kyc/status`, { timeout: 30000 });
      console.log(`[API KYC] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API KYC] FAILED: ${e.message}`);
    }
  });

  test('Affiliate endpoint', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/api/affiliate/stats`, { timeout: 30000 });
      console.log(`[API Affiliate] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Affiliate] FAILED: ${e.message}`);
    }
  });

  test('Contact endpoint', async ({ request }) => {
    try {
      const res = await request.post(`${API_BASE}/api/contact`, {
        data: { name: 'Test', email: 'test@test.com', message: 'audit' },
        timeout: 30000,
      });
      console.log(`[API Contact] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Contact] FAILED: ${e.message}`);
    }
  });

  test('Frozen terminal endpoints return 410', async ({ request }) => {
    try {
      const res = await request.get(`${API_BASE}/api/orders`, { timeout: 30000 });
      console.log(`[API Orders (frozen)] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Orders] FAILED: ${e.message}`);
    }
    try {
      const res = await request.get(`${API_BASE}/api/positions`, { timeout: 30000 });
      console.log(`[API Positions (frozen)] Status: ${res.status()} Body: ${(await res.text()).slice(0, 200)}`);
    } catch (e: any) {
      console.log(`[API Positions] FAILED: ${e.message}`);
    }
  });
});

// ============================================================================
// PHASE 9 — SEO AUDIT
// ============================================================================
test.describe('PHASE 9 — SEO Audit', () => {
  test('robots.txt exists', async ({ request }) => {
    const res = await request.get(`${BASE}/robots.txt`, { timeout: 15000 });
    console.log(`[SEO robots.txt] Status: ${res.status()} Body: ${(await res.text()).slice(0, 500)}`);
  });

  test('sitemap.xml exists', async ({ request }) => {
    const res = await request.get(`${BASE}/sitemap.xml`, { timeout: 15000 });
    console.log(`[SEO sitemap.xml] Status: ${res.status()} Body: ${(await res.text()).slice(0, 500)}`);
  });

  test('Home page has meta tags', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    
    const title = await page.title();
    const metaDesc = await page.locator('meta[name="description"]').getAttribute('content');
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    
    console.log(`[SEO Home] Title: ${title}`);
    console.log(`[SEO Home] Meta Description: ${metaDesc?.slice(0, 100)}`);
    console.log(`[SEO Home] OG Title: ${ogTitle}`);
    console.log(`[SEO Home] OG Image: ${ogImage}`);
    console.log(`[SEO Home] Canonical: ${canonical}`);
  });

  test('Structured data exists', async ({ page }) => {
    await page.goto(BASE, { waitUntil: 'networkidle' });
    
    const ldJsonScripts = await page.locator('script[type="application/ld+json"]').allTextContents();
    console.log(`[SEO Structured Data] Found ${ldJsonScripts.length} LD+JSON blocks`);
    for (const ld of ldJsonScripts.slice(0, 3)) {
      console.log(`  ${ld.slice(0, 200)}`);
    }
  });
});

// ============================================================================
// PHASE 1 EXTRA — Network inspection on home page
// ============================================================================
test.describe('Network & Console Inspection', () => {
  test('Home page network and console audit', async ({ page }) => {
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];
    const networkFailures: string[] = [];
    const apiCalls: { method: string; url: string; status: number }[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => jsErrors.push(err.message));
    page.on('requestfailed', req => {
      networkFailures.push(`${req.method()} ${req.url()} — ${req.failure()?.errorText}`);
    });
    page.on('requestfinished', async req => {
      const url = req.url();
      if (url.includes('/api/') || url.includes('supabase') || url.includes('render.com')) {
        const resp = await req.response();
        apiCalls.push({ method: req.method(), url, status: resp?.status() || 0 });
      }
    });

    await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    console.log(`\n=== HOME PAGE NETWORK AUDIT ===`);
    console.log(`JS Errors: ${jsErrors.length}`);
    jsErrors.forEach(e => console.log(`  ❌ ${e.slice(0, 150)}`));
    console.log(`Console Errors: ${consoleErrors.length}`);
    consoleErrors.slice(0, 10).forEach(e => console.log(`  ⚠️ ${e.slice(0, 150)}`));
    console.log(`Network Failures: ${networkFailures.length}`);
    networkFailures.forEach(e => console.log(`  🔴 ${e.slice(0, 150)}`));
    console.log(`API Calls: ${apiCalls.length}`);
    apiCalls.forEach(c => console.log(`  ${c.method} ${c.url.slice(0, 80)} → ${c.status}`));
  });
});

// ============================================================================
// RESPONSIVE TEST
// ============================================================================
test.describe('Responsive Tests', () => {
  test('Home page mobile view', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 375, height: 812 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)',
    });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/Home_Mobile.png', fullPage: false });
    
    // Check mobile menu
    const hamburger = page.locator('button[aria-label*="menu" i], button[class*="mobile" i], [class*="hamburger" i], button svg');
    console.log(`[Mobile] Hamburger buttons: ${await hamburger.count()}`);
    await context.close();
  });

  test('Home page tablet view', async ({ browser }) => {
    const context = await browser.newContext({
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    await page.goto(BASE, { waitUntil: 'networkidle' });
    await page.screenshot({ path: 'screenshots/Home_Tablet.png', fullPage: false });
    await context.close();
  });
});
