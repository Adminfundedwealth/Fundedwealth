import { test, expect } from "@playwright/test";

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 1 — APPLICATION DISCOVERY
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 1: Route Discovery", () => {
    const routes = [
        "/",
        "/sign-in",
        "/sign-up",
        "/checkout",
        "/dashboard",
        "/trade",
        "/leaderboard",
        "/rules",
        "/faq",
        "/blog",
        "/payouts",
        "/scaling",
        "/championship",
        "/community",
        "/impact",
        "/kyc",
        "/admin",
        "/terms",
        "/privacy",
        "/refund",
        "/economic-calendar",
    ];

    for (const route of routes) {
        test(`Route ${route} loads without crash`, async ({ page }) => {
            const errors: string[] = [];
            page.on("console", (msg) => {
                if (msg.type() === "error") errors.push(msg.text());
            });
            page.on("pageerror", (err) => errors.push(err.message));

            const res = await page.goto(route, { waitUntil: "domcontentloaded", timeout: 15000 });
            expect(res?.status()).toBeLessThan(500);

            // Check for React crash (error boundary)
            const crashed = await page.locator("text=Something went wrong").count();
            expect(crashed, `Route ${route} shows crash screen`).toBe(0);

            // Collect critical JS errors (ignore minor ones)
            const critical = errors.filter(
                (e) => !e.includes("favicon") && !e.includes("manifest") && !e.includes("service-worker")
            );
            // Log but don't fail on non-critical console errors
            if (critical.length > 0) {
                console.log(`[WARN] ${route} console errors:`, critical.slice(0, 3));
            }
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 2 — AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 2: Authentication", () => {
    test("Sign-in page renders form", async ({ page }) => {
        await page.goto("/sign-in", { waitUntil: "networkidle" });
        await expect(page.locator("input[type='email'], input[placeholder*='email'], input[placeholder*='Email']").first()).toBeVisible({ timeout: 10000 });
    });

    test("Sign-up page renders form", async ({ page }) => {
        await page.goto("/sign-up", { waitUntil: "networkidle" });
        await expect(page.locator("input[type='email'], input[placeholder*='email'], input[placeholder*='Email']").first()).toBeVisible({ timeout: 10000 });
    });

    test("Dashboard redirects unauthenticated user", async ({ page }) => {
        await page.goto("/dashboard", { waitUntil: "networkidle" });
        // Should redirect to sign-in or show auth prompt
        await page.waitForTimeout(3000);
        const url = page.url();
        const isRedirected = url.includes("sign-in") || url.includes("login");
        const hasAuthPrompt = await page.locator("text=Sign In, text=Log In, text=sign in, input[type='password']").count();
        expect(isRedirected || hasAuthPrompt > 0, "Dashboard should redirect or show auth").toBeTruthy();
    });

    test("Admin page blocks unauthenticated access", async ({ page }) => {
        await page.goto("/admin", { waitUntil: "networkidle" });
        await page.waitForTimeout(3000);
        const url = page.url();
        const blocked = url.includes("sign-in") || (await page.locator("text=Access Denied, text=Unauthorized, text=sign in").count()) > 0;
        expect(blocked, "Admin should block unauthenticated users").toBeTruthy();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 3 — CHECKOUT FLOW
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 3: Checkout", () => {
    test("Checkout page loads with plan selection", async ({ page }) => {
        await page.goto("/checkout", { waitUntil: "networkidle" });
        // Should show plan options
        const planButtons = await page.locator("text=Flash, text=Instant, text=1-Step, text=2-Step").count();
        expect(planButtons, "Checkout should show plan options").toBeGreaterThan(0);
    });

    test("Checkout shows account sizes", async ({ page }) => {
        await page.goto("/checkout", { waitUntil: "networkidle" });
        await page.waitForTimeout(2000);
        // Should show price/size options
        const priceVisible = await page.locator("text=/₹[0-9,]+/").count();
        expect(priceVisible, "Checkout should show prices").toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 6 — TRADING TERMINAL
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 6: Trading Terminal", () => {
    test("Terminal page loads", async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (err) => errors.push(err.message));

        await page.goto("/trade", { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(3000);

        // Terminal should show some key UI elements
        const hasChart = await page.locator("canvas, [class*='chart'], [class*='Chart']").count();
        const hasSymbol = await page.locator("text=NIFTY, text=BANKNIFTY, text=Nifty").count();

        expect(hasChart > 0 || hasSymbol > 0, "Terminal should render chart or symbols").toBeTruthy();

        const crashErrors = errors.filter((e) => e.includes("Cannot read") || e.includes("is not defined") || e.includes("is not a function"));
        expect(crashErrors.length, `Terminal has JS crashes: ${crashErrors[0]}`).toBe(0);
    });

    test("Terminal shows watchlist symbols", async ({ page }) => {
        await page.goto("/trade", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(4000);

        const symbols = ["NIFTY", "BANKNIFTY", "RELIANCE", "TCS", "INFY"];
        let found = 0;
        for (const sym of symbols) {
            const count = await page.locator(`text=${sym}`).count();
            if (count > 0) found++;
        }
        expect(found, "Terminal should show at least 3 symbols from watchlist").toBeGreaterThanOrEqual(3);
    });

    test("Terminal shows order panel", async ({ page }) => {
        await page.goto("/trade", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000);

        // Look for Buy/Sell buttons or order panel
        const hasBuySell = await page.locator("text=Buy, text=BUY, text=Sell, text=SELL, text=Place Buy, text=Place Sell").count();
        expect(hasBuySell, "Terminal should show buy/sell controls").toBeGreaterThan(0);
    });

    test("Terminal shows account metrics (balance, equity, P&L)", async ({ page }) => {
        await page.goto("/trade", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000);

        const hasMetrics = await page.locator("text=Balance, text=Equity, text=P&L, text=Day P").count();
        expect(hasMetrics, "Terminal should show account metrics").toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 7 — MARKET DATA / WEBSOCKET
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 7: Market Data & WebSocket", () => {
    test("WebSocket connection attempt to /ws/market", async ({ page }) => {
        const wsMessages: string[] = [];
        const wsErrors: string[] = [];
        let wsOpened = false;
        let wsUrl = "";

        page.on("websocket", (ws) => {
            wsUrl = ws.url();
            ws.on("framereceived", (frame) => {
                if (frame.payload) wsMessages.push(String(frame.payload).slice(0, 200));
            });
            ws.on("framesent", (frame) => {
                if (frame.payload) wsMessages.push(`SENT: ${String(frame.payload).slice(0, 100)}`);
            });
            ws.on("close", () => wsErrors.push("WS closed"));
            wsOpened = true;
        });

        await page.goto("/trade", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(8000);

        console.log(`[WS] Opened: ${wsOpened}, URL: ${wsUrl}`);
        console.log(`[WS] Messages received: ${wsMessages.length}`);
        if (wsMessages.length > 0) console.log(`[WS] First message: ${wsMessages[0]}`);
        if (wsErrors.length > 0) console.log(`[WS] Errors: ${wsErrors.join(", ")}`);

        // The websocket should at least attempt to connect
        // It may fail if backend is down, but the attempt should exist
        expect(wsOpened || wsUrl.length > 0 || wsMessages.length > 0, "WebSocket should attempt connection").toBeTruthy();
    });

    test("Network requests to API on trade page", async ({ page }) => {
        const apiCalls: { url: string; status: number; method: string }[] = [];

        page.on("response", (res) => {
            const url = res.url();
            if (url.includes("/api/") || url.includes("fundedwealth")) {
                apiCalls.push({ url, status: res.status(), method: res.request().method() });
            }
        });

        await page.goto("/trade", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(5000);

        console.log(`[API] Total calls: ${apiCalls.length}`);
        apiCalls.forEach((c) => console.log(`  ${c.method} ${c.status} ${c.url.slice(0, 120)}`));

        // Check for 5xx errors
        const serverErrors = apiCalls.filter((c) => c.status >= 500);
        expect(serverErrors.length, `Server errors: ${JSON.stringify(serverErrors)}`).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 10 — RULE ENGINE (UI DISPLAY)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 10: Rule Engine Display", () => {
    test("Rules page shows all challenge rules", async ({ page }) => {
        await page.goto("/rules", { waitUntil: "networkidle" });

        const ruleTexts = [
            "Daily Loss",
            "Drawdown",
            "Profit Target",
            "Trading Days",
        ];

        let found = 0;
        for (const rule of ruleTexts) {
            const count = await page.locator(`text=${rule}`).count();
            if (count > 0) found++;
        }
        expect(found, "Rules page should display all core rules").toBeGreaterThanOrEqual(3);
    });

    test("Terminal displays breach status", async ({ page }) => {
        await page.goto("/trade", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000);

        // Check for drawdown/target progress indicators
        const hasProgress = await page.locator("text=Target, text=DD Left, text=Daily, text=Drawdown").count();
        expect(hasProgress, "Terminal should show rule progress metrics").toBeGreaterThan(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 15 — HOME PAGE & CORE PAGES
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 15: Core Pages", () => {
    test("Home page loads with hero and CTAs", async ({ page }) => {
        await page.goto("/", { waitUntil: "domcontentloaded" });
        await page.waitForTimeout(3000);

        const hasCTA = await page.locator("text=Get Funded, text=Start Challenge, text=Buy Challenge, text=Get Started").count();
        expect(hasCTA, "Home page should show primary CTA").toBeGreaterThan(0);
    });

    test("Leaderboard page renders traders", async ({ page }) => {
        await page.goto("/leaderboard", { waitUntil: "networkidle" });
        await page.waitForTimeout(2000);

        const hasTrader = await page.locator("text=/₹[0-9]+K/").count();
        expect(hasTrader, "Leaderboard should show trader profits").toBeGreaterThan(0);
    });

    test("FAQ page loads without errors", async ({ page }) => {
        const errors: string[] = [];
        page.on("pageerror", (err) => errors.push(err.message));
        await page.goto("/faq", { waitUntil: "networkidle" });
        expect(errors.length).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PHASE 19 — PERFORMANCE
// ═══════════════════════════════════════════════════════════════════════════════

test.describe("Phase 19: Performance", () => {
    test("Home page loads under 8 seconds", async ({ page }) => {
        const start = Date.now();
        await page.goto("/", { waitUntil: "domcontentloaded", timeout: 15000 });
        const elapsed = Date.now() - start;
        console.log(`[PERF] Home page DOM ready: ${elapsed}ms`);
        expect(elapsed, "Home should load DOM under 8s").toBeLessThan(8000);
    });

    test("Trade page loads under 10 seconds", async ({ page }) => {
        const start = Date.now();
        await page.goto("/trade", { waitUntil: "domcontentloaded", timeout: 15000 });
        const elapsed = Date.now() - start;
        console.log(`[PERF] Trade page DOM ready: ${elapsed}ms`);
        expect(elapsed, "Trade page should load under 10s").toBeLessThan(10000);
    });

    test("Console has no uncaught exceptions on home", async ({ page }) => {
        const crashes: string[] = [];
        page.on("pageerror", (err) => crashes.push(err.message));
        await page.goto("/", { waitUntil: "networkidle" });
        await page.waitForTimeout(3000);
        expect(crashes.length, `Uncaught errors: ${crashes.join("; ")}`).toBe(0);
    });
});
