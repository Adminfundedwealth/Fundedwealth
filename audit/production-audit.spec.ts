import { test, expect, type Page, type BrowserContext } from "@playwright/test";

const BASE_URL = "https://fundedwealth.com";
const API_URL = "https://fundedwealth-api-mwj6.onrender.com";

interface PageAuditResult {
  url: string;
  status: number | null;
  loaded: boolean;
  title: string;
  jsErrors: string[];
  consoleErrors: string[];
  networkFailures: string[];
  brokenLinks: string[];
  emptyContent: boolean;
  hasContent: boolean;
  screenshot: string;
}

interface ApiAuditResult {
  endpoint: string;
  method: string;
  status: number;
  responseTime: number;
  isReal: boolean;
  isMock: boolean;
  body: any;
}

const results: {
  pages: PageAuditResult[];
  apis: ApiAuditResult[];
  networkRequests: { url: string; method: string; status: number }[];
} = {
  pages: [],
  apis: [],
  networkRequests: [],
};

test.describe("PHASE 1 — FRONTEND AUDIT", () => {
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

  for (const pageInfo of pages) {
    test(`Page: ${pageInfo.name} (${pageInfo.path})`, async ({ page }) => {
      const jsErrors: string[] = [];
      const consoleErrors: string[] = [];
      const networkFailures: string[] = [];

      page.on("pageerror", (err) => {
        jsErrors.push(err.message);
      });

      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      page.on("requestfailed", (req) => {
        networkFailures.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
      });

      const response = await page.goto(`${BASE_URL}${pageInfo.path}`, {
        waitUntil: "networkidle",
        timeout: 30000,
      }).catch((e) => {
        console.log(`FAILED to load ${pageInfo.path}: ${e.message}`);
        return null;
      });

      const status = response?.status() ?? null;
      const title = await page.title().catch(() => "");

      // Check if page has actual content
      const bodyText = await page.locator("body").textContent().catch(() => "");
      const hasContent = (bodyText?.trim().length ?? 0) > 50;
      const emptyContent = !hasContent;

      // Take screenshot
      const screenshotPath = `audit/screenshots/${pageInfo.name.toLowerCase().replace(/\s+/g, "-")}.png`;
      await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

      console.log(`\n=== ${pageInfo.name} ===`);
      console.log(`  URL: ${BASE_URL}${pageInfo.path}`);
      console.log(`  Status: ${status}`);
      console.log(`  Loaded: ${response !== null}`);
      console.log(`  Has Content: ${hasContent}`);
      console.log(`  Title: ${title}`);
      console.log(`  JS Errors: ${jsErrors.length}`);
      if (jsErrors.length > 0) console.log(`    ${jsErrors.join("\n    ")}`);
      console.log(`  Console Errors: ${consoleErrors.length}`);
      if (consoleErrors.length > 0) console.log(`    ${consoleErrors.slice(0, 5).join("\n    ")}`);
      console.log(`  Network Failures: ${networkFailures.length}`);
      if (networkFailures.length > 0) console.log(`    ${networkFailures.slice(0, 5).join("\n    ")}`);

      expect(response).not.toBeNull();
      expect(status).toBe(200);
    });
  }
});

test.describe("PHASE 2 — USER FLOW AUDIT", () => {
  test("Landing page renders with CTA", async ({ page }) => {
    const jsErrors: string[] = [];
    page.on("pageerror", (err) => jsErrors.push(err.message));

    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });

    // Check hero section
    const heroVisible = await page.locator("h1, [class*='hero']").first().isVisible().catch(() => false);
    console.log(`\n=== USER FLOW: Landing ===`);
    console.log(`  Hero visible: ${heroVisible}`);
    console.log(`  JS Errors: ${jsErrors.length}`);

    // Check for CTA buttons
    const ctaButtons = await page.locator("a[href*='checkout'], a[href*='sign-up'], button:has-text('Start'), button:has-text('Get')").count();
    console.log(`  CTA Buttons found: ${ctaButtons}`);

    expect(heroVisible).toBe(true);
  });

  test("Register page functional", async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-up`, { waitUntil: "networkidle", timeout: 30000 });

    const hasForm = await page.locator("form, input[type='email'], [class*='auth'], [class*='sign']").first().isVisible().catch(() => false);
    const hasEmailInput = await page.locator("input[type='email'], input[name='email']").count();
    const hasPasswordInput = await page.locator("input[type='password'], input[name='password']").count();

    console.log(`\n=== USER FLOW: Register ===`);
    console.log(`  Form visible: ${hasForm}`);
    console.log(`  Email input: ${hasEmailInput > 0}`);
    console.log(`  Password input: ${hasPasswordInput > 0}`);
  });

  test("Login page functional", async ({ page }) => {
    await page.goto(`${BASE_URL}/sign-in`, { waitUntil: "networkidle", timeout: 30000 });

    const hasForm = await page.locator("form, input[type='email'], [class*='auth'], [class*='sign']").first().isVisible().catch(() => false);
    const hasEmailInput = await page.locator("input[type='email'], input[name='email']").count();

    console.log(`\n=== USER FLOW: Login ===`);
    console.log(`  Form visible: ${hasForm}`);
    console.log(`  Email input: ${hasEmailInput > 0}`);
  });

  test("Checkout page loads plan selector", async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle", timeout: 30000 });

    const hasPlans = await page.locator("text=Flash, text=Instant, text=1-Step, text=2-Step").first().isVisible().catch(() => false);
    const hasSizes = await page.locator("text=₹1,00,000, text=₹5,00,000, text=₹10,00,000").first().isVisible().catch(() => false);
    const hasPayButton = await page.locator("button:has-text('Proceed'), button:has-text('Pay'), button:has-text('Next')").first().isVisible().catch(() => false);

    console.log(`\n=== USER FLOW: Checkout ===`);
    console.log(`  Plans visible: ${hasPlans}`);
    console.log(`  Sizes visible: ${hasSizes}`);
    console.log(`  Pay button: ${hasPayButton}`);
  });

  test("Dashboard redirects unauthenticated users", async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/dashboard`, { waitUntil: "networkidle", timeout: 30000 });

    const currentUrl = page.url();
    const redirectedToLogin = currentUrl.includes("sign-in") || currentUrl.includes("login");

    console.log(`\n=== USER FLOW: Dashboard (unauthenticated) ===`);
    console.log(`  Current URL: ${currentUrl}`);
    console.log(`  Redirected to login: ${redirectedToLogin}`);
  });
});

test.describe("PHASE 3 — API AUDIT", () => {
  test("API Health Check", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/health`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Health ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Razorpay Payment Methods", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/razorpay/payment-methods`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Razorpay Payment Methods ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body).slice(0, 500)}`);
  });

  test("API - Blog Posts", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/blog`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Blog ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body preview: ${JSON.stringify(body).slice(0, 300)}`);
  });

  test("API - Community", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/community/posts`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Community ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body preview: ${JSON.stringify(body).slice(0, 300)}`);
  });

  test("API - Economic Events", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/economic-events`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Economic Events ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body preview: ${JSON.stringify(body).slice(0, 300)}`);
  });

  test("API - Auth (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/auth/me`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Auth Me (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Users Profile (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/users/profile`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Users Profile (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Accounts (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/accounts`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Accounts (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body).slice(0, 300)}`);
  });

  test("API - KYC (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/kyc/status`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: KYC Status (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Payouts (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/payouts`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Payouts (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Admin (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/admin/users`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Admin Users (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Contact (POST test)", async ({ request }) => {
    const response = await request.post(`${API_URL}/api/contact`, {
      data: { name: "Audit Test", email: "audit@test.com", message: "Production audit test" },
    }).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Contact POST ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Razorpay Create Order (no auth)", async ({ request }) => {
    const response = await request.post(`${API_URL}/api/razorpay/create-order`, {
      data: { amount: 999, planType: "flash", sizeIndex: 0 },
    }).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Razorpay Create Order (no auth) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Payment Create Crypto (no token)", async ({ request }) => {
    const response = await request.post(`${API_URL}/api/payments/create-crypto-payment`, {
      data: { paymentMethod: "oxapay-usdt-trc20", planType: "flash", sizeIndex: 0 },
    }).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Crypto Payment Create (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Affiliate (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/affiliate/stats`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Affiliate Stats (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - Championship (public)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/championship`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Championship ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body preview: ${JSON.stringify(body).slice(0, 300)}`);
  });

  test("API - Notifications (unauthenticated)", async ({ request }) => {
    const response = await request.get(`${API_URL}/api/notifications`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.json().catch(() => ({}));

    console.log(`\n=== API: Notifications (no token) ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Body: ${JSON.stringify(body)}`);
  });

  test("API - SEO sitemap", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/sitemap.xml`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.text().catch(() => "");

    console.log(`\n=== SEO: sitemap.xml ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Has content: ${body.length > 0}`);
    console.log(`  Is XML: ${body.includes("<?xml") || body.includes("<urlset")}`);
    console.log(`  Preview: ${body.slice(0, 300)}`);
  });

  test("API - SEO robots.txt", async ({ request }) => {
    const response = await request.get(`${BASE_URL}/robots.txt`).catch(() => null);
    const status = response?.status() ?? 0;
    const body = await response?.text().catch(() => "");

    console.log(`\n=== SEO: robots.txt ===`);
    console.log(`  Status: ${status}`);
    console.log(`  Has content: ${body.length > 0}`);
    console.log(`  Content: ${body.slice(0, 500)}`);
  });
});

test.describe("PHASE 5 — AUTH AUDIT", () => {
  test("Protected routes require auth", async ({ page }) => {
    const protectedPaths = ["/dashboard", "/admin", "/kyc"];
    console.log(`\n=== AUTH: Protected Routes ===`);

    for (const path of protectedPaths) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: "networkidle", timeout: 20000 }).catch(() => null);
      const currentUrl = page.url();
      const isProtected = currentUrl.includes("sign-in") || currentUrl.includes("login") || !currentUrl.includes(path);
      console.log(`  ${path}: ${isProtected ? "PROTECTED (redirects)" : "EXPOSED (no redirect)"} → ${currentUrl}`);
    }
  });
});

test.describe("PHASE 6 — PAYMENT AUDIT", () => {
  test("Checkout UPI flow accessible", async ({ page }) => {
    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle", timeout: 30000 });

    // Wait for content
    await page.waitForSelector("body", { timeout: 5000 }).catch(() => null);

    const bodyText = await page.locator("body").textContent().catch(() => "");
    const hasRazorpay = bodyText?.includes("Razorpay") ?? false;
    const hasUPI = bodyText?.includes("UPI") ?? false;
    const hasCrypto = bodyText?.includes("Crypto") || bodyText?.includes("USDT") || bodyText?.includes("BTC");
    const hasPlans = bodyText?.includes("Flash") || bodyText?.includes("Instant") || bodyText?.includes("1-Step");

    console.log(`\n=== PAYMENT: Checkout Page ===`);
    console.log(`  Plans visible: ${hasPlans}`);
    console.log(`  UPI option: ${hasUPI}`);
    console.log(`  Razorpay option: ${hasRazorpay}`);
    console.log(`  Crypto option: ${hasCrypto}`);
  });
});

test.describe("PHASE 9 — SEO AUDIT", () => {
  test("Home page SEO elements", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });

    const title = await page.title();
    const metaDesc = await page.locator('meta[name="description"]').getAttribute("content").catch(() => null);
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href").catch(() => null);
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute("content").catch(() => null);
    const ogDesc = await page.locator('meta[property="og:description"]').getAttribute("content").catch(() => null);
    const ogImage = await page.locator('meta[property="og:image"]').getAttribute("content").catch(() => null);
    const structuredData = await page.locator('script[type="application/ld+json"]').count();

    console.log(`\n=== SEO: Home Page ===`);
    console.log(`  Title: ${title}`);
    console.log(`  Meta Description: ${metaDesc ? "YES" : "MISSING"} — ${metaDesc?.slice(0, 80)}`);
    console.log(`  Canonical: ${canonical || "MISSING"}`);
    console.log(`  OG Title: ${ogTitle || "MISSING"}`);
    console.log(`  OG Description: ${ogDesc ? "YES" : "MISSING"}`);
    console.log(`  OG Image: ${ogImage || "MISSING"}`);
    console.log(`  Structured Data: ${structuredData} block(s)`);
  });
});

test.describe("PHASE 10 — NETWORK INSPECTION", () => {
  test("Capture all network requests on home page", async ({ page }) => {
    const requests: { url: string; method: string; status: number }[] = [];
    const failures: string[] = [];

    page.on("response", (response) => {
      requests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
      });
    });

    page.on("requestfailed", (req) => {
      failures.push(`${req.method()} ${req.url()} - ${req.failure()?.errorText}`);
    });

    await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 30000 });

    // Wait a bit for async requests
    await page.waitForTimeout(3000);

    const apiRequests = requests.filter((r) => r.url.includes("/api/") || r.url.includes("supabase"));
    const failedRequests = requests.filter((r) => r.status >= 400);

    console.log(`\n=== NETWORK: Home Page ===`);
    console.log(`  Total requests: ${requests.length}`);
    console.log(`  API requests: ${apiRequests.length}`);
    console.log(`  Failed requests (4xx/5xx): ${failedRequests.length}`);
    console.log(`  Network failures: ${failures.length}`);

    if (apiRequests.length > 0) {
      console.log(`\n  API Requests:`);
      for (const r of apiRequests.slice(0, 20)) {
        console.log(`    ${r.method} ${r.url.replace(API_URL, "")} → ${r.status}`);
      }
    }

    if (failedRequests.length > 0) {
      console.log(`\n  Failed Requests:`);
      for (const r of failedRequests.slice(0, 10)) {
        console.log(`    ${r.method} ${r.url} → ${r.status}`);
      }
    }

    if (failures.length > 0) {
      console.log(`\n  Network Failures:`);
      for (const f of failures.slice(0, 10)) {
        console.log(`    ${f}`);
      }
    }
  });

  test("Capture network on Checkout page", async ({ page }) => {
    const requests: { url: string; method: string; status: number }[] = [];

    page.on("response", (response) => {
      requests.push({
        url: response.url(),
        method: response.request().method(),
        status: response.status(),
      });
    });

    await page.goto(`${BASE_URL}/checkout`, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const apiRequests = requests.filter((r) => r.url.includes("/api/") || r.url.includes("supabase") || r.url.includes("razorpay"));

    console.log(`\n=== NETWORK: Checkout Page ===`);
    console.log(`  Total requests: ${requests.length}`);
    console.log(`  API/Service requests: ${apiRequests.length}`);
    if (apiRequests.length > 0) {
      for (const r of apiRequests.slice(0, 15)) {
        console.log(`    ${r.method} ${r.url.split("?")[0]} → ${r.status}`);
      }
    }
  });
});
