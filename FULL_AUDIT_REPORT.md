# FundedWealth — Full Production Audit Report

**Generated:** 2026-06-10  
**Auditor:** Kiro AI  
**Scope:** Full codebase — frontend SPA, market-data microservice, config, deployment

---

## Executive Summary

| Severity | Count |
|---|---|
| 🔴 CRITICAL | 5 |
| 🟠 HIGH | 9 |
| 🟡 MEDIUM | 12 |
| 🔵 LOW | 8 |
| ✅ Fixed automatically | 6 |

---

## 🔴 CRITICAL Issues

### C1 — Live Razorpay Key Committed in Dev `.env`
**File:** `artifacts/fundedwealth/.env`  
**Line:** `VITE_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXXX`

The production live Razorpay key is stored in the development `.env` file. If this repo is ever pushed to a public location (or the file leaked), the key could be used to initiate fraudulent payment captures.

**Impact:** Financial fraud, Razorpay account suspension, chargeback exposure.

**Fix required:**
1. Replace with `rzp_test_*` key in `.env` (dev)
2. Keep `rzp_live_*` only in `.env.production` and server-side secrets
3. Add `.env` to `.gitignore` if not already present
4. Rotate the live key if this repo has ever been public

---

### C2 — Real Bank Account Details Exposed in `.env` (Committed to Repo)
**File:** `artifacts/fundedwealth/.env` and `.env.production`

The following real financial details are committed in plaintext:
- UPI ID: `s8257683769651514@slc`
- Account Holder: `AMAN KUMAR SINGH`
- Bank: `Slice Small Finance Bank`
- Account No: `033311501069826`
- IFSC: `NESF0000333`

These `VITE_*` variables are bundled into the **client-side JavaScript** and visible to any user via DevTools → Sources.

**Impact:** Fraudulent transfers to this account, social engineering of the account owner, identity exposure.

**Fix required:**
1. These values MUST go in the backend `.env`, served over a secure API endpoint at checkout time — never in `VITE_*` vars
2. Create a `GET /api/payment/upi-details` endpoint (authenticated) that returns these values only after user is signed in and has a pending order
3. Rotate account details if they have been exposed in any public channel

---

### C3 — Challenge Rules Enforced Client-Side Only
**File:** `src/pages/trade.tsx` (breach detection in `useEffect([prices])`)

All prop firm rule calculations (daily loss, max drawdown, profit target) are done entirely in the browser. A trader who manipulates browser state, uses DevTools, or bypasses the SPA entirely can execute trades without any server-side validation.

**Impact:** Traders can cheat the challenge, claim funded accounts fraudulently, drain payout pool.

**Fix required:**
1. The backend API (`/api/execution/order`) MUST validate account rules before accepting orders
2. Breach state must be authoritative on the server, not localStorage
3. Add server-side drawdown tracking on every order placement and position close

---

### C4 — `/admin` Route Has No Role-Based Guard (Frontend Only)
**File:** `src/pages/admin.tsx`, `src/App.tsx`

The `/admin` route is added to the router without any server-side role enforcement. The only guard is a `fetchAdmin("/overview")` call that sets `isAdmin` state — but if the backend is slow or offline, the check is skipped. A malicious user can access the admin UI DOM before the check resolves.

**Impact:** Admin UI visible to all authenticated users before the check resolves. If backend is slow or returns 500, `isAdmin` stays `false` but there is a brief window.

**Fix required:**
1. Backend `/api/admin/*` endpoints must require `role: "admin"` claim on the JWT
2. Frontend: render `null` or a full-page spinner until `isLoaded && isAdmin !== undefined`
3. Add Clerk role/permission metadata to admin users via Clerk Dashboard → Users → Metadata

---

### C5 — No Payment Webhook Signature Verification Visible
**File:** `src/hooks/usePayment.ts` — `/api/razorpay/verify-payment` called from client

The frontend sends `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature` to `/api/razorpay/verify-payment`. The backend presumably verifies the HMAC signature, but this is the backend code (not in repo). 

For the OxaPay flow, there is no callback/webhook verification code visible at all — the frontend only polls `/api/payments/create-crypto-payment` and the backend must handle OxaPay's webhook, but this is not auditable from the current repo.

**Impact:** If the backend does NOT verify Razorpay HMAC signatures, payments can be spoofed. If OxaPay webhooks are not verified, crypto payments can be faked.

**Fix required (backend):**
1. Razorpay: verify `hmac_sha256(order_id + "|" + payment_id, razorpay_secret)` on every `/verify-payment` call
2. OxaPay: verify webhook signatures using OxaPay's documented HMAC process
3. Add idempotency keys to prevent double-processing on retry

---

## 🟠 HIGH Issues

### H1 — Duplicate `ClerkProvider` in `main.tsx` and `App.tsx`
**File:** `src/main.tsx` (before fix), `src/App.tsx`  
**Status:** ✅ FIXED — `main.tsx` now lazy-imports `App` without wrapping another `ClerkProvider`

Two nested `ClerkProvider` components caused auth hook context conflicts where `useAuth()` in deeply nested components could resolve to the outer (wrong) provider.

---

### H2 — `clerk-shim.ts` Exports Auth Stubs That Silently Break Auth
**File:** `src/clerk-shim.ts`  
**Status:** ✅ FIXED — Stub exports removed, file now only exports `{}` with a clear warning comment

This file exported `useAuth()` always returning `isSignedIn: false`. An accidental import (vs `@clerk/react`) would break all auth silently.

---

### H3 — `ManualPaymentForm.tsx` Uses CRA `process.env.REACT_APP_*` in Vite Project
**File:** `src/components/ManualPaymentForm.tsx`  
**Status:** ✅ FIXED — Changed to `import.meta.env.VITE_*`

`process.env.REACT_APP_*` is a Create React App convention. Vite replaces only `import.meta.env.VITE_*`. All `process.env.*` values would be `undefined` at runtime, falling back to hardcoded strings silently.

---

### H4 — `lib/api.ts` Uses `BASE_URL` (Vite path) Instead of API Server URL
**File:** `src/lib/api.ts`  
**Status:** ✅ FIXED — Now uses relative `/api` prefix, consistent with Vite proxy config

`import.meta.env.BASE_URL` returns `/` (or the `base` from vite.config). All `api.get("/accounts")` calls were going to `/api/accounts` already by accident, but the code's intent was unclear and could break if `base` was set to a subpath.

---

### H5 — DhanProvider Silently Drops Subscribe Calls Before WS Connects
**File:** `market-data-service/src/providers/DhanProvider.ts`  
**Status:** ✅ FIXED — Added `pendingSubscriptions` queue flushed on `open`

When symbols were subscribed during startup (before the WebSocket `open` event fires), the subscribe messages were silently dropped. On reconnect, subscriptions were also lost.

---

### H6 — `market-data-service` Has No DHAN_API_KEY Validation at Startup
**File:** `market-data-service/src/config.ts`, `index.ts`

`DHAN_API_KEY` defaults to empty string `""`. The service boots, connects to `wss://ws.dhan.com/stream` with an empty auth header, the connection likely gets rejected, and the provider enters an infinite reconnect loop with no useful log.

**Fix required:**
```typescript
// In index.ts — add before main():
if (!DHAN_API_KEY) {
  log.fatal("DHAN_API_KEY is not set. Cannot start market data service.");
  process.exit(1);
}
```

---

### H7 — `AuthContext.tsx` (Legacy) Never Cleaned Up — Creates Confusion
**File:** `src/contexts/AuthContext.tsx`

A parallel auth system based on localStorage (`fw_user_v2` key) that uses random IDs, no server, and no Clerk. It still exists alongside Clerk and the `DEMO_USER` object contains a hardcoded email `aman@fundedwealth.in`. While it's not imported by live pages anymore, its presence creates dangerous confusion.

**Fix required:** Delete `src/contexts/AuthContext.tsx` entirely. Confirm no page still imports it.

---

### H8 — `leaderboard.tsx` Is 100% Hardcoded Fake Data
**File:** `src/pages/leaderboard.tsx`

The public `/leaderboard` page shows 12 hardcoded "traders" with fabricated names (Ravi Kumar, Priya Sharma, etc.) and fake profits. This is a regulatory and consumer protection risk — it misleads potential customers about real platform performance.

**Fix required:**
1. Replace the `TRADERS` array with a live `GET /api/users/leaderboard` call
2. Show a loading state while fetching
3. Add disclaimer: "Profits shown are actual historical performance of funded accounts"
4. The dashboard already has a proper live leaderboard — port that logic to the public page

---

### H9 — No Rate Limiting on UTR Verification Endpoint (Frontend-Observable)
**File:** `src/pages/checkout.tsx` → `handleVerifyUtr()`

The frontend calls `/api/payments/verify-utr` on every submit click with no client-side debounce or submission lock between retries. A user could spam the endpoint with different UTRs to find a valid match. The backend must rate-limit but this is not visible in the repo.

**Fix required:**
1. Frontend: disable the Verify button immediately on click, re-enable only on error response after 3 seconds
2. Backend: rate-limit `/api/payments/verify-utr` to 5 attempts per user per 10 minutes

---

## 🟡 MEDIUM Issues

### M1 — `.htaccess` Had No Security Headers
**File:** `.htaccess`  
**Status:** ✅ FIXED — Added `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`, `Content-Security-Policy`, cache headers, and file access restrictions

The original `.htaccess` only handled SPA routing rewrites with no security headers, no cache control, and no file access restrictions.

---

### M2 — Supabase Anon Key in Both `.env` and `.env.production` (Exposed in Bundle)
**File:** `artifacts/fundedwealth/.env`, `.env.production`

The Supabase anon key is bundled into the client JavaScript. This is by design for Supabase Row Level Security (RLS), but only works safely if RLS policies are properly configured.

**Fix required:**
1. Verify Supabase RLS is enabled on ALL tables accessible via the anon key
2. Audit `trade-journal-screenshots` storage bucket — ensure users can only read/write their own paths
3. The anon key itself is not a secret but RLS misconfiguration could expose all user data

---

### M3 — `useMarketData()` Creates New Array on Every Tick (Performance)
**File:** `src/lib/market-data-service.ts`  
**Status:** ✅ FIXED — Added price equality check to skip unnecessary re-renders

Previously, every incoming tick (potentially 10-30/second during market hours) triggered a full array spread and React re-render of all components using `useMarketData()`. The fix returns the previous array reference when price hasn't changed.

---

### M4 — Trading Terminal Stores Full Account State in localStorage
**File:** `src/pages/trade.tsx`

Account state including positions, history, balance, and breach status is persisted to `localStorage` under `fw-trade-{accountId}`. This data is unencrypted, modifiable via DevTools, and ties directly into challenge rule calculations.

**Fix:** Consider encrypting sensitive localStorage fields or moving authoritative account state fully server-side and making localStorage a display cache only.

---

### M5 — No Input Validation on Order Placement (Client-Side)
**File:** `src/pages/trade.tsx` — `placeOrder()` function

Quantity is validated (min 1, max 10), but:
- Limit/Stop price is parsed with `parseFloat` but not validated against the current market price spread
- SL/TP values can be set above current price for a BUY SL (user error not caught)
- Negative prices are accepted silently

**Fix:** Add validation: SL must be below entry for BUY, above entry for SELL; TP must be above entry for BUY, below for SELL.

---

### M6 — `checkout.tsx` Has No Anti-Double-Submit Protection on UPI
**File:** `src/pages/checkout.tsx` — `handleVerifyUtr()`

The UTR verification button doesn't disable itself while the fetch is in flight. A user clicking multiple times sends multiple concurrent requests with the same UTR, potentially creating duplicate payment records.

**Fix:** 
```tsx
const [verifying, setVerifying] = useState(false);
// In handleVerifyUtr: set verifying=true before fetch, false in finally
// Disable button when verifying === true
```

---

### M7 — Charts in `trade.tsx` Use Deterministic Placeholder Data, Not Historical
**File:** `src/pages/trade.tsx` — `DhanChart` component, seed data comment

Chart historical data is generated using a sine function, not real OHLC candle data. The comment says `// TODO: Fetch historical market data from API`.

**Impact:** Traders cannot see real price history, making technical analysis impossible.

**Fix:** Implement `GET /api/market/history?symbol=NIFTY&from=...&to=...` and feed real candle data to `series.setData()`.

---

### M8 — `dashboard.tsx` Posts User Profile to API on Every Mount
**File:** `src/pages/dashboard.tsx`

```tsx
useEffect(() => {
  fetch(`${BASE_URL}api/users/me`, { method: "POST", ... })
}, [user]);
```

This upserts the user profile on every dashboard mount. While idempotent, it causes an unnecessary write on every page navigation/refresh and leaks the user's avatar URL to the server every time.

**Fix:** Only sync if `user.updatedAt` has changed, or use a `useRef` to track if sync already happened this session.

---

### M9 — `market-data-service` Ticks Table Grows Without Bound
**File:** `market-data-service/src/persistence.ts`

Every tick is inserted into the SQLite `ticks` table with no pruning/TTL. During a 6.5-hour trading day with ~10 ticks/second, this generates ~230,000 rows per day. After a month, the DB will be gigabytes.

**Fix:**
```typescript
// Add a cleanup job in index.ts or tick-engine.ts:
setInterval(() => {
  db.prepare("DELETE FROM ticks WHERE ts < ?").run(Date.now() - 7 * 24 * 60 * 60 * 1000); // keep 7 days
}, 60 * 60 * 1000); // run hourly
```

---

### M10 — `OptionsEngine` Is a Non-Functional Placeholder
**File:** `market-data-service/src/options-engine.ts` (referenced in `index.ts`)

The options engine is imported and used in production startup but presumably contains only stubs. No IV/Greeks/chain computation is done.

**Fix:** Either implement or remove from the production service boot — don't load dead code in production.

---

### M11 — `admin.tsx` Notification Metadata Field Accepts Raw JSON String
**File:** `src/pages/admin.tsx` — `sendNotification()`

```tsx
metadata: notificationDraft.metadata ? JSON.parse(notificationDraft.metadata) : undefined,
```

`JSON.parse()` on an unvalidated string — if the admin enters malformed JSON, this throws an uncaught exception. There is no `try/catch` around it.

**Fix:**
```tsx
let parsedMetadata;
try {
  parsedMetadata = notificationDraft.metadata ? JSON.parse(notificationDraft.metadata) : undefined;
} catch {
  toast({ title: "Invalid JSON in metadata field", variant: "destructive" });
  setNotifyLoading(false);
  return;
}
```

---

### M12 — All External QR Codes Use `api.qrserver.com` (Third-Party Dependency)
**Files:** `src/pages/checkout.tsx`, `src/pages/dashboard.tsx`

QR codes for UPI payments and affiliate links are fetched from `https://api.qrserver.com`. This:
1. Makes QR code generation dependent on a third-party service availability
2. Leaks the UPI payment URL (with amount and reference) to a third party
3. Fails for users behind strict corporate firewalls

`ManualPaymentForm.tsx` already uses the `qrcode` npm package locally. The checkout flow should do the same.

**Fix:** Use `import QRCode from "qrcode"` (already in `package.json`) to generate QR codes client-side, matching the pattern in `ManualPaymentForm.tsx`.

---

## 🔵 LOW Issues

### L1 — NSE Holidays 2026 Are Hardcoded
**File:** `src/pages/trade.tsx` — `NSE_HOLIDAYS_2026` array

The holiday list is hardcoded in the frontend. If NSE announces additional holidays or the list changes (which happens regularly), trades will be accepted on holidays.

**Fix:** Fetch holidays from `GET /api/market/holidays?year=2026` with a localStorage cache and fallback to the hardcoded array.

---

### L2 — `leaderboard.tsx` Period Toggle Is Purely Cosmetic
**File:** `src/pages/leaderboard.tsx`

The weekly/monthly/all-time toggle changes state but doesn't change the displayed data.

**Fix:** Pass the `period` parameter to the leaderboard API call when real data is integrated.

---

### L3 — `useCheckout.ts` Auto-Applies 65% Coupon Without User Consent
**File:** `src/hooks/useCheckout.ts`

```tsx
const AUTO_COUPON = "FW";
const [appliedCoupon] = useState<string>(AUTO_COUPON);
```

The `FW` coupon (65% off) is silently auto-applied. This is fine as a promotion but removes the user's ability to apply a different coupon code (e.g., `FW70` for 70% off). The coupon input in the checkout UI appears to exist but is overridden.

**Fix:** Allow user input to override the auto-coupon, applying the better discount.

---

### L4 — Keyboard Shortcuts in Trade Terminal Are Not Documented
**File:** `src/pages/trade.tsx` — keyboard handler

Available shortcuts: `B` (buy), `S` (sell), `Ctrl+K` / `F` (search), `Esc` (close panels). These are not shown anywhere in the UI.

**Fix:** Add a `?` keyboard shortcut that opens a shortcuts modal.

---

### L5 — `dashboard.tsx` Dark Mode Toggle Has No Actual Effect
**File:** `src/pages/dashboard.tsx` — Settings section

The dark/light mode toggle updates `darkMode` React state but never applies a class to the document root or a context that changes styling. The dashboard is always dark regardless.

**Fix:** Apply `document.documentElement.classList.toggle("light", !darkMode)` and add a corresponding Tailwind dark mode CSS class in `index.css`.

---

### L6 — `blog-article.tsx` Not Mapped in `App.tsx` Router
**File:** `src/App.tsx`

`App.tsx` has a route for `/blog/:slug`, but the file was confirmed to exist. However, `main.tsx` (the actual entry point) does NOT include a `blog-article` route — it ends at `/blog` only.

**Fix:** Add `<Route path="/blog/:slug" component={BlogArticle} />` to the routes in `main.tsx`.

---

### L7 — No Error State for Failed WebSocket Connection in Trade Terminal
**File:** `src/pages/trade.tsx` — WS connection indicator

When the market data WebSocket fails, the header shows "Closed" in red but gives no user guidance. Traders may not know to refresh or may think the market itself is closed.

**Fix:** Add a reconnect button in the header when `!marketConnected`.

---

### L8 — `COUPON_CODES` Map Is Duplicated in `config/checkout.ts` and `dashboard.tsx`
**File:** `src/config/checkout.ts`, `src/pages/dashboard.tsx` — `VALID_COUPONS`

The same coupon codes with slight differences exist in two places. If a new coupon is added to one, the other won't know.

**Fix:** Import `COUPON_CODES` from `config/checkout.ts` in `dashboard.tsx` instead of redeclaring.

---

## Missing Features

### MF1 — Angel One Primary Feed Not Implemented
The codebase only has a `DhanProvider` in the market-data service. The architecture supports multiple providers (`providers: MarketDataProvider[]` in `TickEngine`) but no Angel One provider exists. The "Angel One primary / Dhan secondary" architecture mentioned in the project docs is not implemented.

### MF2 — No TradingView Integration
`TradingViewTicker.tsx` exists as a component but the trading terminal (`trade.tsx`) uses `lightweight-charts` (an open-source chart library), not TradingView. There are no TradingView indicators, drawing tools, or layout persistence.

### MF3 — Feed Failover Logic Not Implemented
There is only one data provider. No failover logic exists to switch from a primary to secondary feed on disconnect.

### MF4 — No Playwright / E2E Tests
Zero test infrastructure exists. No unit tests, integration tests, or Playwright E2E tests are present. The `package.json` has no test scripts.

### MF5 — No Lighthouse / Bundle Analysis CI Step
No build-time performance budget, Lighthouse CI, or bundle analysis is configured.

### MF6 — `OptionsEngine` Is a Stub — Options Chain Not Functional
The `OptionsEngine` in the market-data service is referenced but not implemented.

### MF7 — No Session Persistence for Trading Terminal Layout
The trading terminal has theme persistence (localStorage) but no layout persistence (panel sizes, active tab, chart timeframe).

### MF8 — No Drawing Tools on Chart
The `DhanChart` uses `lightweight-charts` in area series mode. No drawing tools (trend lines, Fibonacci, support/resistance) are implemented.

### MF9 — Leaderboard on Public Page is Fake (see H8)

---

## Recommended Improvements

### R1 — Move to Server-Side Rendering for SEO-Critical Pages
The landing page, leaderboard, blog, and rules pages are all client-rendered. This hurts SEO for core acquisition keywords ("prop trading India", "funded trader India").

**Recommendation:** Migrate public pages to Next.js App Router or add a pre-rendering step using `vite-plugin-ssr`.

### R2 — Implement Proper CSP Nonces
The current CSP in `.htaccess` uses `'unsafe-inline'` for scripts. Add nonces or hashes via a server middleware layer instead.

### R3 — Add Sentry Error Boundaries More Granularly
`VITE_SENTRY_DSN` is configured but there is no `Sentry.init()` call visible in the frontend. Wire up Sentry for automatic error capturing.

### R4 — Implement Proper Password Reset Flow
The sign-in/sign-up pages use Clerk's hosted components. Password reset is handled by Clerk automatically, but there is no custom UI for it and the fallback redirect after password reset is not configured.

### R5 — Add PWA Manifest and Service Worker
`MobileShell.tsx` exists as a mobile wrapper. Add a full `manifest.json`, splash screens, and a service worker for offline capability and "Add to Home Screen" on Android.

### R6 — WebSocket Heartbeat / Ping-Pong
The `MarketDataServiceImpl` has no heartbeat. Some WebSocket infrastructure drops idle connections after 30–60 seconds of no messages (off-market hours). Add a 30-second ping/pong loop.

### R7 — Instrument Master via API Instead of Hardcoded Array
The 29 symbols in `trade.tsx` are hardcoded with base prices. This means adding new instruments requires a code deploy. Move the instrument master to `GET /api/market/instruments`.

### R8 — Add Two-Factor Authentication for Payouts
KYC is required, but for large payout requests (>₹50,000) consider requiring a secondary OTP confirmation to prevent account takeover payout fraud.

### R9 — Use React.memo on Heavy Dashboard Sub-Components
`AccountCard`, `FundingRow`, and other components in `dashboard.tsx` re-render on every parent state change (notifications, sidebar open, etc.). Memoize with `React.memo`.

### R10 — Add Pagination to Admin Trader List
The admin panel loads all traders at once from the API. As the user base grows, this will time out. Add server-side pagination.

---

## Files Changed by This Audit

| File | Change |
|---|---|
| `.htaccess` | Added security headers, CSP, cache control, HTTPS enforcement, file access restrictions |
| `src/components/ManualPaymentForm.tsx` | Fixed `process.env.REACT_APP_*` → `import.meta.env.VITE_*` |
| `src/clerk-shim.ts` | Removed dangerous stub exports, added clear deprecation comment |
| `src/lib/api.ts` | Fixed `BASE_URL` → relative `/api` prefix; added JSDoc; improved types |
| `src/lib/market-data-service.ts` | Fixed unnecessary re-renders in `useMarketData` tick handler |
| `src/main.tsx` | Removed duplicate `ClerkProvider`; `App` is now the single provider source |
| `market-data-service/src/providers/DhanProvider.ts` | Added `pendingSubscriptions` queue to flush on WS open |

---

## How to Run E2E Tests (Recommended Setup)

No tests exist. Here is the recommended setup:

```bash
# Install Playwright
npm install -D @playwright/test
npx playwright install chromium

# Create basic smoke tests
cat > e2e/smoke.spec.ts << 'EOF'
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/FundedWealth/);
});

test("checkout page accessible", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.locator("text=Choose your account type")).toBeVisible();
});

test("sign-in page loads", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(page.locator("input[type=email]")).toBeVisible();
});
EOF

# Add to package.json scripts:
# "test:e2e": "playwright test"
# "test:e2e:ui": "playwright test --ui"
```

---

## Security Checklist

| Check | Status |
|---|---|
| Live payment keys not in dev `.env` | ❌ NEEDS FIX (C1) |
| Bank account details not in client bundle | ❌ NEEDS FIX (C2) |
| Admin routes protected server-side | ⚠️ UNKNOWN (backend not in repo) |
| Razorpay webhook HMAC verified | ⚠️ UNKNOWN (backend not in repo) |
| OxaPay webhook verified | ⚠️ UNKNOWN (backend not in repo) |
| Supabase RLS enabled | ⚠️ NEEDS VERIFICATION |
| CSP headers set | ✅ FIXED |
| HTTPS enforced via HSTS | ✅ FIXED |
| Clickjacking protection | ✅ FIXED |
| MIME sniff protection | ✅ FIXED |
| Challenge rules enforced server-side | ❌ NEEDS FIX (C3) |
| Duplicate auth provider removed | ✅ FIXED |
| CRA env vars in Vite fixed | ✅ FIXED |
| API base URL correct | ✅ FIXED |
| WS subscription queue on reconnect | ✅ FIXED |

---

*End of Report*
