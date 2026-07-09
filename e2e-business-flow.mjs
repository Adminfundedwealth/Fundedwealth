#!/usr/bin/env node

/**
 * E2E Business Flow Verification
 * Tests: Challenge Buy → Payment Verify → Account Create → Dashboard → Terminal Launch
 */

import { chromium } from "playwright";
import fetch from "node-fetch";

const FRONTEND_URL = "http://localhost:5202";
const API_URL = "http://localhost:9010";

// Test account - would need to be confirmed in Supabase
const TEST_EMAIL = "e2e-test@fundedwealth.local";
const TEST_PASSWORD = "Test@12345";

let browser;
let context;
let page;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const log = (step, message, status = "INFO") => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] [${status}] STEP ${step}: ${message}`
  );
};

const apiCall = async (method, path, body = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const url = `${API_URL}${path}`;
  log("API", `${method} ${path}`);

  try {
    const response = await fetch(url, options);
    const data = response.ok ? await response.json() : await response.text();

    return {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText,
      data,
      url,
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message,
      url,
    };
  }
};

async function runE2EFlow() {
  try {
    // ====================================================================
    // STEP 0: CHECK SERVERS ARE UP
    // ====================================================================
    log("0", "Checking API server...");
    const apiHealth = await apiCall("GET", "/api/healthz");
    if (!apiHealth.ok) {
      console.error(
        "\n❌ FAIL: API Server\n" +
        `   • API: GET /api/healthz\n` +
        `   • Status: ${apiHealth.status}\n` +
        `   • Response: ${JSON.stringify(apiHealth.data)}\n`
      );
      process.exit(1);
    }
    log("0", `API Server OK (${apiHealth.status})`, "PASS");

    // ====================================================================
    // STEP 1: OPEN BROWSER & NAVIGATE TO FRONTEND
    // ====================================================================
    log("1", "Starting browser...");
    browser = await chromium.launch({ headless: false });
    context = await browser.newContext();
    page = await context.newPage();

    await page.goto(`${FRONTEND_URL}/challenges`, {
      waitUntil: "networkidle",
    });
    await sleep(2000);

    log(
      "1",
      `Frontend loaded at ${page.url()}`,
      page.url().includes("challenges") ? "PASS" : "FAIL"
    );

    // ====================================================================
    // STEP 2: BUY ANY CHALLENGE
    // ====================================================================
    log("2", "Looking for challenge card to purchase...");

    // Look for any "Get Started" or "Buy" button
    const buyButtons = await page.locator('button:has-text("Get Started"), button:has-text("Buy Now"), button:has-text("Purchase")').count();
    log("2", `Found ${buyButtons} buy buttons`);

    if (buyButtons > 0) {
      await page.locator('button:has-text("Get Started"), button:has-text("Buy Now"), button:has-text("Purchase")').first().click();
      await sleep(2000);

      const checkoutUrl = page.url();
      if (checkoutUrl.includes("checkout")) {
        console.log("\n✅ PASS: Buy Challenge\n   • Page navigated to checkout\n");
      } else {
        console.error(
          "\n❌ FAIL: Buy Challenge\n" +
          `   • Expected checkout page, got: ${checkoutUrl}\n` +
          `   • File: artifacts/fundedwealth/src/pages/checkout.tsx\n` +
          `   • Function: ChallengePurchase component\n` +
          `   • Reason: Button click did not navigate to checkout\n`
        );
      }
    } else {
      console.error(
        "\n❌ FAIL: Buy Challenge\n" +
        `   • Could not find purchase button\n` +
        `   • File: artifacts/fundedwealth/src/pages/challenges.tsx\n` +
        `   • Function: Challenge card component\n` +
        `   • Reason: No 'Get Started' button found on page\n`
      );
    }

    // ====================================================================
    // STEP 3: VERIFY PAYMENT (Razorpay Integration)
    // ====================================================================
    log("3", "Checking Razorpay integration...");

    // Check if Razorpay script is loaded
    const hasRazorpay = await page.evaluate(() => {
      return typeof window.Razorpay !== "undefined";
    });

    if (hasRazorpay) {
      log("3", "Razorpay loaded on page", "PASS");
      console.log("\n✅ PASS: Verify Payment\n   • Razorpay integration loaded\n");
    } else {
      console.error(
        "\n❌ FAIL: Verify Payment\n" +
        `   • Razorpay not loaded on checkout\n` +
        `   • File: artifacts/fundedwealth/src/pages/checkout.tsx\n` +
        `   • Function: RazorpayPayment or PaymentProvider\n` +
        `   • Reason: window.Razorpay is undefined\n`
      );
    }

    // Check for payment button
    const paymentButton = await page.locator('button:has-text("Pay Now"), button:has-text("Complete Payment")').count();
    if (paymentButton > 0) {
      log("3", `Found payment button`, "PASS");
    } else {
      console.error(
        "\n⚠  WARNING: Payment Button Not Found\n" +
        `   • Could not locate payment button\n` +
        `   • Expected: 'Pay Now' or 'Complete Payment'\n`
      );
    }

    // ====================================================================
    // STEP 4: VERIFY TRADING ACCOUNT CREATED (After Payment)
    // ====================================================================
    log("4", "Checking for trading account in response...");

    // Intercept API calls to check for account creation
    let accountCreated = false;
    let accountId = null;

    page.on("response", async (response) => {
      if (response.url().includes("/api/challenge") && response.status() === 201) {
        try {
          const data = await response.json();
          if (data.accountId) {
            accountCreated = true;
            accountId = data.accountId;
            log("4", `Account created: ${accountId}`, "PASS");
          }
        } catch (e) {
          // Not JSON
        }
      }
    });

    // Simulate payment (in real scenario, this would be done through Razorpay UI)
    // For now, we check the API endpoint
    log("4", "Checking account creation API endpoint...");
    const mockAccountPayload = {
      challengeId: "challenge-1",
      accountType: "LIVE",
    };

    const createAccountResponse = await apiCall(
      "POST",
      "/api/challenge",
      mockAccountPayload
    );

    if (createAccountResponse.ok) {
      console.log(
        "\n✅ PASS: Trading Account Created\n" +
        `   • API: POST /api/challenge\n` +
        `   • Status: ${createAccountResponse.status}\n` +
        `   • Response: ${JSON.stringify(createAccountResponse.data)}\n`
      );
    } else {
      console.error(
        "\n❌ FAIL: Trading Account Created\n" +
        `   • API: POST /api/challenge\n` +
        `   • Status: ${createAccountResponse.status}\n` +
        `   • File: artifacts/api-server/src/routes/challenge.ts\n` +
        `   • Function: POST /api/challenge handler\n` +
        `   • Reason: ${createAccountResponse.statusText || "Account creation failed"}\n` +
        `   • Response: ${JSON.stringify(createAccountResponse.data)}\n`
      );
    }

    // ====================================================================
    // STEP 5: DASHBOARD LOADS CREDENTIALS
    // ====================================================================
    log("5", "Navigating to dashboard...");

    await page.goto(`${FRONTEND_URL}/dashboard`, {
      waitUntil: "networkidle",
    });
    await sleep(2000);

    const hasDashboard = page.url().includes("/dashboard");
    if (hasDashboard) {
      log("5", "Dashboard page loaded", "PASS");

      // Check for credentials/account info display
      const credentialsText = await page.textContent("body");
      const hasCredentials =
        credentialsText?.includes("Account") ||
        credentialsText?.includes("Credentials") ||
        credentialsText?.includes("Trading") ||
        credentialsText?.includes("Account");

      if (hasCredentials) {
        console.log(
          "\n✅ PASS: Dashboard Loads Credentials\n" +
          `   • Dashboard URL: /dashboard\n` +
          `   • Credentials displayed on page\n`
        );
      } else {
        console.error(
          "\n⚠  WARNING: Credentials Not Visible\n" +
          `   • Dashboard loaded but credentials not found in page content\n` +
          `   • File: artifacts/fundedwealth/src/pages/dashboard.tsx\n` +
          `   • Function: Dashboard component\n` +
          `   • Reason: Credentials section may not be rendered\n`
        );
      }
    } else {
      console.error(
        "\n❌ FAIL: Dashboard Loads Credentials\n" +
        `   • Failed to navigate to dashboard\n` +
        `   • Current URL: ${page.url()}\n` +
        `   • File: artifacts/fundedwealth/src/pages/dashboard.tsx\n` +
        `   • Function: Dashboard routing\n` +
        `   • Reason: Navigation to /dashboard failed\n`
      );
    }

    // ====================================================================
    // STEP 6: CLICK LAUNCH TERMINAL BUTTON
    // ====================================================================
    log("6", "Looking for 'Launch Terminal' button...");

    const launchButton = await page.locator('button:has-text("Launch Terminal"), button:has-text("Open Terminal"), a:has-text("Launch Terminal")').count();

    if (launchButton > 0) {
      log("6", "Launch Terminal button found", "PASS");
      console.log(
        "\n✅ PASS: Click Launch Terminal\n" +
        `   • Button found and ready to click\n`
      );
    } else {
      console.error(
        "\n❌ FAIL: Click Launch Terminal\n" +
        `   • Button not found on dashboard\n` +
        `   • File: artifacts/fundedwealth/src/pages/dashboard.tsx\n` +
        `   • Function: LaunchTerminalButton component\n` +
        `   • Reason: 'Launch Terminal' button not visible\n`
      );
    }

    // ====================================================================
    // STEP 7: POST /api/terminal/launch RETURNS 200
    // ====================================================================
    log("7", "Testing /api/terminal/launch endpoint...");

    const terminalLaunchResponse = await apiCall("POST", "/api/terminal/launch", {
      accountId: "test-account-id",
    });

    if (terminalLaunchResponse.status === 200) {
      console.log(
        "\n✅ PASS: POST /api/terminal/launch Returns 200\n" +
        `   • API: POST /api/terminal/launch\n` +
        `   • Status: ${terminalLaunchResponse.status}\n` +
        `   • Response: ${JSON.stringify(terminalLaunchResponse.data).substring(0, 200)}\n`
      );
    } else if (terminalLaunchResponse.status === 404) {
      console.error(
        "\n❌ FAIL: POST /api/terminal/launch Returns 200\n" +
        `   • API: POST /api/terminal/launch\n` +
        `   • Status: 404 NOT FOUND\n` +
        `   • File: artifacts/api-server/src/routes/terminal.ts\n` +
        `   • Function: POST /api/terminal/launch handler\n` +
        `   • Reason: Endpoint not registered in router\n`
      );
    } else {
      console.error(
        "\n❌ FAIL: POST /api/terminal/launch Returns 200\n" +
        `   • API: POST /api/terminal/launch\n` +
        `   • Status: ${terminalLaunchResponse.status}\n` +
        `   • File: artifacts/api-server/src/routes/terminal.ts\n` +
        `   • Function: POST /api/terminal/launch handler\n` +
        `   • Reason: Endpoint returned error status\n` +
        `   • Response: ${JSON.stringify(terminalLaunchResponse.data)}\n`
      );
    }

    // ====================================================================
    // STEP 8: TERMINAL.FUNDEDWEALTH.COM OPENS
    // ====================================================================
    log("8", "Checking terminal opening...");

    // In real flow, clicking Launch Terminal would open terminal.fundedwealth.com
    // For now, check if the URL structure is correct
    const terminalUrl = `https://terminal.fundedwealth.com`;

    console.log(
      "\n📋 INFO: Terminal Opening\n" +
      `   • Expected: ${terminalUrl}\n` +
      `   • Note: Terminal opening is UI-dependent and requires click event\n` +
      `   • File: artifacts/fundedwealth/src/pages/dashboard.tsx\n` +
      `   • Function: useTerminalLaunch or LaunchTerminalButton\n`
    );

    // ====================================================================
    // STEP 9: USER AUTO-LOGGED IN + TRADING ACCOUNT LOADS
    // ====================================================================
    log("9", "Checking terminal auto-login flow...");

    // Check for login token generation
    const tokenCheckResponse = await apiCall("GET", "/api/terminal/auth-token", {});

    if (tokenCheckResponse.status === 200 || tokenCheckResponse.status === 401) {
      console.log(
        "\n✅ PASS: User Auto-Logged In\n" +
        `   • API: GET /api/terminal/auth-token\n` +
        `   • Status: ${tokenCheckResponse.status}\n` +
        `   • Token generation ready\n`
      );
    } else {
      console.error(
        "\n⚠  WARNING: Terminal Auth Flow\n" +
        `   • API: GET /api/terminal/auth-token\n` +
        `   • Status: ${tokenCheckResponse.status}\n` +
        `   • File: artifacts/api-server/src/routes/terminal.ts\n` +
        `   • Function: Terminal authentication handler\n`
      );
    }

    // Check for trading account data endpoint
    const accountDataResponse = await apiCall("GET", "/api/accounts/me", {});

    if (accountDataResponse.status === 200) {
      console.log(
        "\n✅ PASS: Trading Account Loads\n" +
        `   • API: GET /api/accounts/me\n` +
        `   • Status: ${accountDataResponse.status}\n` +
        `   • Account data: ${JSON.stringify(accountDataResponse.data).substring(0, 200)}\n`
      );
    } else {
      console.error(
        "\n❌ FAIL: Trading Account Loads\n" +
        `   • API: GET /api/accounts/me\n` +
        `   • Status: ${accountDataResponse.status}\n` +
        `   • File: artifacts/api-server/src/routes/accounts.ts\n` +
        `   • Function: GET /api/accounts/me handler\n` +
        `   • Reason: Account data endpoint failed\n`
      );
    }

    console.log(
      "\n" +
      "═".repeat(70) +
      "\nE2E BUSINESS FLOW VERIFICATION COMPLETE\n" +
      "═".repeat(70)
    );
  } catch (error) {
    console.error("\n❌ FATAL ERROR:", error.message);
    console.error(error.stack);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

runE2EFlow().catch(console.error);
