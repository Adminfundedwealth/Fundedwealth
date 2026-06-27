/**
 * FundedWealth.com Production Reality Audit
 * Uses Playwright to test the actual live site
 */
import { chromium } from "@playwright/test";

const BASE_URL = "https://fundedwealth.com";
const API_URL = "https://fundedwealth-api-mwj6.onrender.com";

async function main() {
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("  FUNDEDWEALTH.COM — PRODUCTION REALITY AUDIT");
  console.log("  Date:", new Date().toISOString());
  console.log("═══════════════════════════════════════════════════════════════\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
  });

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 1: FRONTEND AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PHASE 1: FRONTEND AUDIT                                    ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const pages = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Mission", path: "/mission" },
    { name: "Impact", path: "/impact" },
    { name: "Championship", path: "/championship" },
    { name: "Leaderboard", path: "/leaderboard" },
    { name: "Scaling", path: "/scaling" },
    { name: "Payouts", path: "/payouts" },
    { name: "Blog", path: "/blog" },
    { name: "Rules", path: "/rules" },
    { name: "FAQ", path: "/faq" },
    { name: "Community", path: "/community" },
    { name: "Success Stories", path: "/success-stories" },
    { name: "Terms", path: "/terms" },
    { name: "Privacy", path: "/privacy" },
    { name: "Refund", path: "/refund" },
    { name: "Sign In", path: "/sign-in" },
    { name: "Sign Up", path: "/sign-up" },
    { name: "Checkout", path: "/checkout" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "KYC", path: "/kyc" },
    { name: "Admin", path: "/admin" },
    { name: "Economic Calendar", path: "/economic-calendar" },
    { name: "Payment Pending", path: "/payment-pending" },
  ];

  const pageResults: any[] = [];

  for (const pageInfo of pages) {
    const page = await context.newPage();
    const jsErrors: string[] = [];
    const consoleErrors: string[] = [];
    const networkFailures: string[] = [];

    page.on("pageerror", (err) => jsErrors.push(err.message.slice(0, 200)));
    page.on("console", (msg) => { if (msg.type() === "error") consoleErrors.push(msg.text().slice(0, 200)); });
    page.on("requestfailed", (req) => networkFailures.push(`${req.method()} ${req.url().slice(0, 100)}`));

    let status: number | null = null;
    let loaded = false;
    let hasContent = false;
    let title = "";
    let finalUrl = "";

    try {
      const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 20000,
      });
      status = response?.status() ?? null;
      loaded = response !== null;
      title = await page.title().catch(() => "");
      finalUrl = page.url();

      // Wait for React render
      await page.waitForTimeout(2000);
      const bodyText = await page.locator("body").textContent().catch(() => "");
      hasContent = (bodyText?.trim().length ?? 0) > 100;
    } catch (e: any) {
      console.log(`  ❌ ${pageInfo.name}: FAILED TO LOAD — ${e.message.slice(0, 80)}`);
    }

    const result = {
      name: pageInfo.name,
      path: pageInfo.path,
      status,
      loaded,
      hasContent,
      title,
      finalUrl,
      jsErrors: jsErrors.length,
      consoleErrors: consoleErrors.length,
      networkFailures: networkFailures.length,
      jsErrorDetails: jsErrors.slice(0, 3),
      verdict: loaded && hasContent ? "WORKING" : loaded && !hasContent ? "PARTIAL" : "BROKEN",
    };

    pageResults.push(result);

    const icon = result.verdict === "WORKING" ? "✅" : result.verdict === "PARTIAL" ? "⚠️" : "❌";
    console.log(`  ${icon} ${pageInfo.name.padEnd(20)} ${result.verdict.padEnd(10)} Status:${status} JS-Errors:${jsErrors.length} Net-Fail:${networkFailures.length}`);
    if (jsErrors.length > 0) console.log(`     JS: ${jsErrors[0].slice(0, 100)}`);
    if (finalUrl !== `${BASE_URL}${pageInfo.path}` && !finalUrl.endsWith(pageInfo.path)) {
      console.log(`     Redirected → ${finalUrl}`);
    }

    await page.close();
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 3: API AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PHASE 3: API AUDIT                                         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const apiTests = [
    { endpoint: "/api/health", method: "GET" },
    { endpoint: "/api/razorpay/payment-methods", method: "GET" },
    { endpoint: "/api/blog", method: "GET" },
    { endpoint: "/api/community/posts", method: "GET" },
    { endpoint: "/api/economic-events", method: "GET" },
    { endpoint: "/api/auth/me", method: "GET" },
    { endpoint: "/api/users/profile", method: "GET" },
    { endpoint: "/api/accounts", method: "GET" },
    { endpoint: "/api/kyc/status", method: "GET" },
    { endpoint: "/api/payouts", method: "GET" },
    { endpoint: "/api/admin/users", method: "GET" },
    { endpoint: "/api/affiliate/stats", method: "GET" },
    { endpoint: "/api/championship", method: "GET" },
    { endpoint: "/api/notifications", method: "GET" },
    { endpoint: "/api/impact", method: "GET" },
    { endpoint: "/api/trades", method: "GET" },
  ];

  const apiResults: any[] = [];

  for (const api of apiTests) {
    const start = Date.now();
    try {
      const response = await fetch(`${API_URL}${api.endpoint}`, {
        method: api.method,
        headers: { "Content-Type": "application/json" },
      });
      const elapsed = Date.now() - start;
      const status = response.status;
      let body: any = null;
      try {
        body = await response.json();
      } catch {
        body = await response.text().catch(() => "");
      }

      const isAuth401 = status === 401;
      const isReal = status === 200 && body && (Array.isArray(body) ? body.length >= 0 : typeof body === "object");
      const isMock = false; // We'll determine this from response content

      apiResults.push({
        endpoint: api.endpoint,
        method: api.method,
        status,
        elapsed,
        body: JSON.stringify(body).slice(0, 200),
        verdict: status === 200 ? "REAL" : isAuth401 ? "AUTH_REQUIRED" : status >= 500 ? "FAILED" : "ERROR",
      });

      const icon = status === 200 ? "✅" : status === 401 ? "🔒" : status === 404 ? "❌" : "⚠️";
      console.log(`  ${icon} ${api.method.padEnd(5)} ${api.endpoint.padEnd(35)} → ${status} (${elapsed}ms)`);
      if (status !== 200 && status !== 401) {
        console.log(`     Response: ${JSON.stringify(body).slice(0, 100)}`);
      }
    } catch (e: any) {
      console.log(`  ❌ ${api.method.padEnd(5)} ${api.endpoint.padEnd(35)} → NETWORK ERROR: ${e.message.slice(0, 60)}`);
      apiResults.push({
        endpoint: api.endpoint,
        method: api.method,
        status: 0,
        elapsed: Date.now() - start,
        body: e.message,
        verdict: "FAILED",
      });
    }
  }

  // Test POST endpoints
  console.log("\n  --- POST Endpoints ---");
  const postTests = [
    { endpoint: "/api/contact", body: { name: "Audit", email: "a@b.com", message: "test" } },
    { endpoint: "/api/razorpay/create-order", body: { amount: 999, planType: "flash", sizeIndex: 0 } },
    { endpoint: "/api/payments/create-crypto-payment", body: { paymentMethod: "oxapay-usdt-trc20", planType: "flash", sizeIndex: 0 } },
  ];

  for (const api of postTests) {
    const start = Date.now();
    try {
      const response = await fetch(`${API_URL}${api.endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(api.body),
      });
      const elapsed = Date.now() - start;
      const status = response.status;
      const body = await response.json().catch(() => ({}));

      const icon = status === 200 ? "✅" : status === 401 ? "🔒" : status === 403 ? "🔒" : "⚠️";
      console.log(`  ${icon} POST  ${api.endpoint.padEnd(40)} → ${status} (${elapsed}ms)`);
      console.log(`     ${JSON.stringify(body).slice(0, 150)}`);
    } catch (e: any) {
      console.log(`  ❌ POST  ${api.endpoint.padEnd(40)} → NETWORK: ${e.message.slice(0, 60)}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 5: AUTH AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PHASE 5: AUTH AUDIT                                        ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const authPage = await context.newPage();
  // Test dashboard redirect
  await authPage.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => null);
  await authPage.waitForTimeout(3000);
  const dashUrl = authPage.url();
  console.log(`  Dashboard (unauth): ${dashUrl.includes("sign-in") ? "✅ REDIRECTS TO LOGIN" : "❌ NO REDIRECT — " + dashUrl}`);

  // Test admin redirect
  await authPage.goto(`${BASE_URL}/admin`, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => null);
  await authPage.waitForTimeout(3000);
  const adminUrl = authPage.url();
  console.log(`  Admin (unauth):     ${adminUrl.includes("sign-in") ? "✅ REDIRECTS TO LOGIN" : "⚠️ " + adminUrl}`);

  // Test sign-in page exists
  await authPage.goto(`${BASE_URL}/sign-in`, { waitUntil: "domcontentloaded", timeout: 15000 }).catch(() => null);
  await authPage.waitForTimeout(2000);
  const signInContent = await authPage.locator("body").textContent().catch(() => "");
  const hasAuthForm = signInContent?.includes("email") || signInContent?.includes("Email") || signInContent?.includes("Sign in") || signInContent?.includes("Log in");
  console.log(`  Sign-In page:       ${hasAuthForm ? "✅ AUTH FORM EXISTS" : "❌ NO AUTH FORM"}`);
  await authPage.close();

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 6: PAYMENT AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PHASE 6: PAYMENT AUDIT                                     ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const payPage = await context.newPage();
  const payApiCalls: { url: string; method: string; status: number }[] = [];
  payPage.on("response", (r) => {
    if (r.url().includes("/api/") || r.url().includes("razorpay") || r.url().includes("supabase")) {
      payApiCalls.push({ url: r.url(), method: r.request().method(), status: r.status() });
    }
  });

  await payPage.goto(`${BASE_URL}/checkout`, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => null);
  await payPage.waitForTimeout(3000);

  const checkoutText = await payPage.locator("body").textContent().catch(() => "");
  console.log(`  Checkout loaded:    ${checkoutText && checkoutText.length > 200 ? "✅ YES" : "❌ NO / EMPTY"}`);
  console.log(`  Has plan options:   ${checkoutText?.includes("Flash") ? "✅" : "❌"}`);
  console.log(`  Has UPI:            ${checkoutText?.includes("UPI") ? "✅" : "❌"}`);
  console.log(`  Has Razorpay:       ${checkoutText?.includes("Razorpay") || checkoutText?.includes("Card") ? "✅" : "❌"}`);
  console.log(`  Has Crypto:         ${checkoutText?.includes("Crypto") || checkoutText?.includes("USDT") ? "✅" : "❌"}`);
  console.log(`  API calls on checkout: ${payApiCalls.length}`);
  for (const c of payApiCalls) {
    console.log(`    ${c.method} ${c.url.split("?")[0].slice(0, 80)} → ${c.status}`);
  }

  // Test Razorpay key availability
  const rzpScript = await payPage.locator("script[src*='razorpay']").count();
  console.log(`  Razorpay SDK loaded: ${rzpScript > 0 ? "✅" : "❌ Not loaded (loaded on demand)"}`);
  await payPage.close();

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 9: SEO AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PHASE 9: SEO AUDIT                                         ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  // robots.txt
  try {
    const robotsResp = await fetch(`${BASE_URL}/robots.txt`);
    const robotsBody = await robotsResp.text();
    console.log(`  robots.txt:         Status ${robotsResp.status} — ${robotsBody.length > 10 ? "✅ EXISTS" : "❌ EMPTY"}`);
    if (robotsBody.length > 0) console.log(`    Content: ${robotsBody.slice(0, 200)}`);
  } catch { console.log(`  robots.txt:         ❌ FETCH FAILED`); }

  // sitemap.xml
  try {
    const sitemapResp = await fetch(`${BASE_URL}/sitemap.xml`);
    const sitemapBody = await sitemapResp.text();
    const isXml = sitemapBody.includes("<?xml") || sitemapBody.includes("<urlset") || sitemapBody.includes("<url>");
    console.log(`  sitemap.xml:        Status ${sitemapResp.status} — ${isXml ? "✅ VALID XML" : "❌ NOT XML / SPA FALLBACK"}`);
    if (isXml) console.log(`    URLs found: ${(sitemapBody.match(/<url>/g) || []).length}`);
    else console.log(`    Preview: ${sitemapBody.slice(0, 100)}`);
  } catch { console.log(`  sitemap.xml:        ❌ FETCH FAILED`); }

  // Home page SEO
  const seoPage = await context.newPage();
  await seoPage.goto(BASE_URL, { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => null);
  await seoPage.waitForTimeout(2000);

  const seoTitle = await seoPage.title();
  const metaDesc = await seoPage.locator('meta[name="description"]').getAttribute("content").catch(() => null);
  const canonical = await seoPage.locator('link[rel="canonical"]').getAttribute("href").catch(() => null);
  const ogTitle = await seoPage.locator('meta[property="og:title"]').getAttribute("content").catch(() => null);
  const ogImage = await seoPage.locator('meta[property="og:image"]').getAttribute("content").catch(() => null);
  const structuredData = await seoPage.locator('script[type="application/ld+json"]').count();
  const viewport = await seoPage.locator('meta[name="viewport"]').getAttribute("content").catch(() => null);

  console.log(`\n  Home Page SEO:`);
  console.log(`    Title:            ${seoTitle ? `✅ "${seoTitle}"` : "❌ MISSING"}`);
  console.log(`    Meta Description: ${metaDesc ? "✅" : "❌ MISSING"}`);
  console.log(`    Canonical:        ${canonical ? `✅ ${canonical}` : "❌ MISSING"}`);
  console.log(`    OG Title:         ${ogTitle ? "✅" : "❌ MISSING"}`);
  console.log(`    OG Image:         ${ogImage ? "✅" : "❌ MISSING"}`);
  console.log(`    Structured Data:  ${structuredData > 0 ? `✅ ${structuredData} block(s)` : "❌ NONE"}`);
  console.log(`    Viewport:         ${viewport ? "✅" : "❌ MISSING"}`);
  await seoPage.close();

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 10: NETWORK INSPECTION
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  PHASE 10: NETWORK INSPECTION (Home)                        ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const netPage = await context.newPage();
  const allRequests: { url: string; method: string; status: number }[] = [];
  const netFailures: string[] = [];

  netPage.on("response", (r) => allRequests.push({ url: r.url(), method: r.request().method(), status: r.status() }));
  netPage.on("requestfailed", (r) => netFailures.push(`${r.method()} ${r.url().slice(0, 100)}`));

  await netPage.goto(BASE_URL, { waitUntil: "networkidle", timeout: 25000 }).catch(() => null);

  const apiReqs = allRequests.filter((r) => r.url.includes("/api/") || r.url.includes("supabase"));
  const failedReqs = allRequests.filter((r) => r.status >= 400);
  const assetReqs = allRequests.filter((r) => r.url.includes("/assets/"));

  console.log(`  Total requests:     ${allRequests.length}`);
  console.log(`  API/Service calls:  ${apiReqs.length}`);
  console.log(`  Asset loads:        ${assetReqs.length}`);
  console.log(`  Failed (4xx/5xx):   ${failedReqs.length}`);
  console.log(`  Network failures:   ${netFailures.length}`);

  if (apiReqs.length > 0) {
    console.log(`\n  API Calls:`);
    for (const r of apiReqs) {
      const icon = r.status < 400 ? "✅" : "❌";
      console.log(`    ${icon} ${r.method} ${r.url.split("?")[0].replace(API_URL, "").slice(0, 70)} → ${r.status}`);
    }
  }

  if (failedReqs.length > 0) {
    console.log(`\n  Failed Requests:`);
    for (const r of failedReqs.slice(0, 10)) {
      console.log(`    ❌ ${r.method} ${r.url.slice(0, 80)} → ${r.status}`);
    }
  }

  if (netFailures.length > 0) {
    console.log(`\n  Network Failures:`);
    for (const f of netFailures.slice(0, 5)) {
      console.log(`    ❌ ${f}`);
    }
  }
  await netPage.close();

  // ══════════════════════════════════════════════════════════════════════════
  // FINAL SCORE
  // ══════════════════════════════════════════════════════════════════════════
  console.log("\n╔══════════════════════════════════════════════════════════════╗");
  console.log("║  FINAL PRODUCTION READINESS SCORE                           ║");
  console.log("╚══════════════════════════════════════════════════════════════╝\n");

  const workingPages = pageResults.filter((p) => p.verdict === "WORKING").length;
  const partialPages = pageResults.filter((p) => p.verdict === "PARTIAL").length;
  const brokenPages = pageResults.filter((p) => p.verdict === "BROKEN").length;
  const workingApis = apiResults.filter((a) => a.verdict === "REAL").length;
  const authApis = apiResults.filter((a) => a.verdict === "AUTH_REQUIRED").length;
  const failedApis = apiResults.filter((a) => a.verdict === "FAILED" || a.verdict === "ERROR").length;

  console.log(`  Frontend:    ${workingPages}/${pages.length} pages WORKING, ${partialPages} PARTIAL, ${brokenPages} BROKEN`);
  console.log(`  APIs:        ${workingApis} REAL, ${authApis} AUTH-GATED, ${failedApis} FAILED`);
  console.log(`  Auth:        ${dashUrl.includes("sign-in") ? "WORKING" : "BROKEN"}`);
  console.log(`  Payments:    Checkout page: ${checkoutText && checkoutText.length > 200 ? "WORKING" : "BROKEN"}`);
  console.log(`  SEO:         ${seoTitle ? "PARTIAL" : "BROKEN"} (title: ${!!seoTitle}, meta: ${!!metaDesc}, canonical: ${!!canonical}, og: ${!!ogTitle})`);

  console.log(`\n  ═══════════════════════════════════════════════════════`);
  const isReady = workingPages >= 18 && failedApis <= 2 && dashUrl.includes("sign-in");
  console.log(`  IS FUNDEDWEALTH.COM PRODUCTION READY?`);
  console.log(`  Answer: ${isReady ? "PARTIAL — Usable but NOT fully production-ready" : "NO"}`);
  console.log(`  ═══════════════════════════════════════════════════════\n`);

  await browser.close();
}

main().catch(console.error);
