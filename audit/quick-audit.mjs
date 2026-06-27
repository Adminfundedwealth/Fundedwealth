// Quick Production Audit Script — uses Playwright for real browser testing
import { chromium } from '@playwright/test';
import { writeFileSync, mkdirSync } from 'fs';

const BASE = 'https://fundedwealth.com';
const API = 'https://fundedwealth-api-mwj6.onrender.com';

const results = {
  pages: [],
  apis: [],
  seo: {},
  network: [],
  errors: [],
};

async function auditPages(browser) {
  const pages = [
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

  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  
  for (const pg of pages) {
    const page = await context.newPage();
    const jsErrors = [];
    const networkFails = [];
    
    page.on('pageerror', err => jsErrors.push(err.message));
    page.on('requestfailed', req => networkFails.push(`${req.method()} ${req.url().slice(0, 80)} — ${req.failure()?.errorText}`));
    
    try {
      const resp = await page.goto(`${BASE}${pg.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      const status = resp?.status() || 0;
      const finalUrl = page.url();
      
      // Wait a bit for SPA to render
      await page.waitForTimeout(2000);
      
      const bodyText = await page.textContent('body').catch(() => '');
      const isEmpty = !bodyText || bodyText.trim().length < 50;
      
      await page.screenshot({ path: `screenshots/${pg.name.replace(/\s/g, '_')}.png` }).catch(() => {});
      
      let verdict = 'WORKING';
      if (status >= 500) verdict = 'BROKEN';
      else if (status >= 400) verdict = 'BROKEN';
      else if (isEmpty) verdict = 'PARTIAL';
      else if (jsErrors.length > 2) verdict = 'PARTIAL';
      
      results.pages.push({
        name: pg.name,
        path: pg.path,
        status,
        finalUrl,
        verdict,
        jsErrors: jsErrors.slice(0, 3),
        networkFails: networkFails.slice(0, 3),
        isEmpty,
      });
      
      console.log(`✓ ${pg.name} (${pg.path}) → ${status} [${verdict}]${jsErrors.length ? ' JS:' + jsErrors.length : ''}${networkFails.length ? ' Net:' + networkFails.length : ''}`);
    } catch (err) {
      results.pages.push({ name: pg.name, path: pg.path, status: 0, verdict: 'BROKEN', error: err.message });
      console.log(`✗ ${pg.name} (${pg.path}) → BROKEN: ${err.message.slice(0, 80)}`);
    }
    
    await page.close();
  }
  
  await context.close();
}

async function auditAPIs() {
  const endpoints = [
    { name: 'Health', method: 'GET', path: '/api/health' },
    { name: 'Auth Register', method: 'POST', path: '/api/auth/register', body: {} },
    { name: 'Auth Login', method: 'POST', path: '/api/auth/login', body: {} },
    { name: 'Blog', method: 'GET', path: '/api/blog' },
    { name: 'Users Me', method: 'GET', path: '/api/users/me' },
    { name: 'KYC Status', method: 'GET', path: '/api/kyc/status' },
    { name: 'Affiliate Stats', method: 'GET', path: '/api/affiliate/stats' },
    { name: 'Contact', method: 'POST', path: '/api/contact', body: { name: 'Test', email: 'audit@test.com', message: 'audit' } },
    { name: 'Payouts', method: 'GET', path: '/api/payouts' },
    { name: 'Notifications', method: 'GET', path: '/api/notifications' },
    { name: 'Razorpay Create Order', method: 'POST', path: '/api/razorpay/create-order', body: { amount: 999, planType: 'flash', sizeIndex: 0 } },
    { name: 'Manual Payment', method: 'POST', path: '/api/payments/manual-bank-transfer', body: {} },
    { name: 'Trading Accounts', method: 'GET', path: '/api/accounts' },
    { name: 'Orders (frozen)', method: 'GET', path: '/api/orders' },
    { name: 'Positions (frozen)', method: 'GET', path: '/api/positions' },
    { name: 'Market (frozen)', method: 'GET', path: '/api/market' },
    { name: 'Community', method: 'GET', path: '/api/community/posts' },
    { name: 'Championship', method: 'GET', path: '/api/championship' },
    { name: 'Admin Users', method: 'GET', path: '/api/admin/users' },
  ];

  for (const ep of endpoints) {
    try {
      const opts = { method: ep.method, headers: { 'Content-Type': 'application/json' } };
      if (ep.body) opts.body = JSON.stringify(ep.body);
      
      const resp = await fetch(`${API}${ep.path}`, opts);
      const text = await resp.text();
      let body;
      try { body = JSON.parse(text); } catch { body = text.slice(0, 200); }
      
      let verdict = 'REAL';
      if (resp.status === 404) verdict = 'NOT_FOUND';
      else if (resp.status === 410) verdict = 'FROZEN';
      else if (resp.status >= 500) verdict = 'FAILED';
      else if (resp.status === 401 || resp.status === 403) verdict = 'AUTH_REQUIRED';
      
      results.apis.push({ name: ep.name, method: ep.method, path: ep.path, status: resp.status, verdict, body: typeof body === 'string' ? body : JSON.stringify(body).slice(0, 200) });
      console.log(`  ${ep.method} ${ep.path} → ${resp.status} [${verdict}]`);
    } catch (err) {
      results.apis.push({ name: ep.name, method: ep.method, path: ep.path, status: 0, verdict: 'FAILED', error: err.message });
      console.log(`  ${ep.method} ${ep.path} → FAILED: ${err.message.slice(0, 60)}`);
    }
  }
}

async function auditSEO(browser) {
  // robots.txt
  try {
    const resp = await fetch(`${BASE}/robots.txt`);
    results.seo.robotsTxt = { status: resp.status, body: (await resp.text()).slice(0, 500) };
    console.log(`  robots.txt → ${resp.status}`);
  } catch (e) { results.seo.robotsTxt = { status: 0, error: e.message }; }
  
  // sitemap.xml
  try {
    const resp = await fetch(`${BASE}/sitemap.xml`);
    results.seo.sitemapXml = { status: resp.status, body: (await resp.text()).slice(0, 500) };
    console.log(`  sitemap.xml → ${resp.status}`);
  } catch (e) { results.seo.sitemapXml = { status: 0, error: e.message }; }
  
  // Meta tags on home page
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  
  results.seo.title = await page.title();
  results.seo.metaDescription = await page.locator('meta[name="description"]').getAttribute('content').catch(() => null);
  results.seo.ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content').catch(() => null);
  results.seo.ogImage = await page.locator('meta[property="og:image"]').getAttribute('content').catch(() => null);
  results.seo.canonical = await page.locator('link[rel="canonical"]').getAttribute('href').catch(() => null);
  
  const ldJson = await page.locator('script[type="application/ld+json"]').allTextContents();
  results.seo.structuredDataCount = ldJson.length;
  
  console.log(`  Title: ${results.seo.title}`);
  console.log(`  Meta Desc: ${results.seo.metaDescription?.slice(0, 80)}`);
  console.log(`  OG Title: ${results.seo.ogTitle}`);
  console.log(`  Structured Data: ${ldJson.length} blocks`);
  
  await context.close();
}

async function auditNetworkHomePage(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  const apiCalls = [];
  
  page.on('requestfinished', async req => {
    if (req.url().includes('/api/') || req.url().includes('supabase') || req.url().includes('render.com') || req.url().includes('razorpay')) {
      const resp = await req.response();
      apiCalls.push({ method: req.method(), url: req.url().slice(0, 120), status: resp?.status() || 0 });
    }
  });
  
  await page.goto(BASE, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  results.network = apiCalls;
  console.log(`  API calls from home page: ${apiCalls.length}`);
  apiCalls.forEach(c => console.log(`    ${c.method} ${c.url.slice(0, 80)} → ${c.status}`));
  
  await context.close();
}

async function main() {
  mkdirSync('screenshots', { recursive: true });
  
  console.log('\n═══════════════════════════════════════════════════');
  console.log(' FUNDEDWEALTH.COM — PRODUCTION REALITY AUDIT');
  console.log('═══════════════════════════════════════════════════\n');
  
  const browser = await chromium.launch({ headless: true });
  
  console.log('── PHASE 1: Frontend Page Audit ──');
  await auditPages(browser);
  
  console.log('\n── PHASE 3: API Audit ──');
  await auditAPIs();
  
  console.log('\n── PHASE 9: SEO Audit ──');
  await auditSEO(browser);
  
  console.log('\n── Network Inspection (Home) ──');
  await auditNetworkHomePage(browser);
  
  await browser.close();
  
  // Write results
  writeFileSync('audit-results.json', JSON.stringify(results, null, 2));
  console.log('\n✓ Results written to audit-results.json');
}

main().catch(err => {
  console.error('AUDIT FAILED:', err);
  process.exit(1);
});
