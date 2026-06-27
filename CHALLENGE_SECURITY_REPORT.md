# FundedWealth — Challenge Rule Security Report

**Generated:** 2026-06-11  
**Scope:** Complete audit of every challenge rule enforcement point — frontend vs backend

---

## Table of Contents

1. [All Challenge Rules (Canonical List)](#1-all-challenge-rules)
2. [Frontend Validations — Before Fix](#2-frontend-validations-before-fix)
3. [Backend Validations — Current State](#3-backend-validations-current-state)
4. [Bypass Possibilities (Attack Vectors)](#4-bypass-possibilities)
5. [Fixes Applied](#5-fixes-applied)
6. [New Architecture (Post-Fix)](#6-new-architecture)
7. [Integration Guide for Backend Team](#7-integration-guide)

---

## 1. All Challenge Rules

These are the official FundedWealth challenge rules (from `rules.tsx` and business docs):

| # | Rule | Trigger | Consequence |
|---|---|---|---|
| R1 | **Max Overall Drawdown** | Equity drops below `startBalance - (maxOverallLossPct% × startBalance)` from HWM | 🔴 BREACH — account terminated |
| R2 | **Daily Loss Limit** | `dayStartEquity - equity ≥ maxDailyLossPct% × startBalance` | 🔴 BREACH — account terminated |
| R3 | **Market Hours** | Order placed outside 09:15–15:15 IST, or on weekend/holiday | ❌ ORDER REJECTED |
| R4 | **Daily Profit Kill-Switch** | `equity - dayStartEquity ≥ 4% × startBalance` (1-step/2-step) | ❌ NEW ORDERS BLOCKED (not a breach) |
| R5 | **Max Position Size** | Notional > 70% of account balance | ❌ ORDER REJECTED |
| R6 | **Lot Size Limits** | qty < 1 or qty > 10 lots per order | ❌ ORDER REJECTED |
| R7 | **SL/TP Direction** | SL above entry for BUY, or below entry for SELL (and vice versa for TP) | ❌ ORDER REJECTED |
| R8 | **Margin Check** | Required margin (10% of notional) > available balance | ❌ ORDER REJECTED |
| R9 | **Instrument Restrictions** | Option selling (writing) not allowed; hedging not allowed | ❌ ORDER REJECTED |
| R10 | **Minimum Trading Days** | < 5 trading days for evaluation payout request | ❌ PAYOUT BLOCKED |
| R11 | **No Overnight Positions** | Open position at 15:15 IST | ⚡ AUTO SQUARE-OFF |
| R12 | **Max Risk Per Trade** | Single trade > 1.5% risk (funded stage) | ⚠️ WARNING |
| R13 | **Profit Target** | P&L ≥ profitTargetPct% × startBalance | ✅ CHALLENGE PASSED |
| R14 | **Consistency Rule** | Single day > 50% of total profit | ⚠️ WARNING |

---

## 2. Frontend Validations — Before Fix

**Location:** `src/pages/trade.tsx`

The following rules were enforced ONLY in the browser (client-side) before this fix:

| Rule | Where in trade.tsx | How Enforced | Bypassable? |
|---|---|---|---|
| R1 Max Drawdown | `useEffect([prices])` — breach detection in tick handler | Checks `overallLoss > startBalance * (maxOverallLossPct / 100)` on every price tick | ✅ YES — user modifies localStorage `fw-trade-{id}` to reset balance/equity |
| R2 Daily Loss | Same `useEffect([prices])` | Checks `dayLoss > startBalance * (maxDailyLossPct / 100)` on every price tick | ✅ YES — reset `dayStartEquity` in localStorage |
| R3 Market Hours | `placeOrder()` → `isMarketOpen()` check | Uses browser clock + hardcoded NSE holidays | ✅ YES — change system clock, or call API directly |
| R4 Kill-Switch | ❌ NOT ENFORCED AT ALL | The rules page documents it but trade.tsx never checks daily profit cap | ✅ YES — not implemented |
| R5 Position Size | ❌ NOT ENFORCED | No notional value check exists | ✅ YES — place unlimited notional |
| R6 Lot Size | `placeOrder()` → `qty < 1` and `qty > 10` | Hard-reject in placeOrder before API call | ✅ YES — call `/api/execution/order` directly with qty > 10 |
| R7 SL/TP Direction | ❌ NOT ENFORCED | No directional validation exists | ✅ YES — set SL above price for BUY |
| R8 Margin | ❌ NOT ENFORCED (display-only) | `requiredMargin` is computed for display but never blocks the order | ✅ YES — place orders with 0 balance |
| R9 Instruments | ❌ NOT ENFORCED (frontend allows all symbols) | No check for option writing vs buying | ✅ YES — not relevant for current instrument set |
| R10 Min Trading Days | ❌ NOT IN TRADE.TSX | Only in dashboard rules list (static text) | ✅ YES — request payout without 5 days |
| R11 No Overnight | ❌ NOT ENFORCED | No auto-square-off at 15:15 | ✅ YES — hold positions overnight |
| R12 Max Risk/Trade | ❌ NOT ENFORCED | Only mentioned in rules page | ✅ YES — unlimited risk |
| R13 Profit Target | `useEffect([prices])` — computes profitTargetReached for UI | Display-only, never blocks or auto-passes | N/A (not a restriction) |
| R14 Consistency | ❌ NOT ENFORCED | Only mentioned in dashboard rules list | ✅ YES — single day 100% profit |

### Summary Before Fix

- **Enforced rules (client-side only):** 3 out of 14 (R1, R2, R3 — all bypassable)
- **Partially enforced:** 1 (R6 — qty check but bypassable via direct API)
- **Not enforced at all:** 10 out of 14
- **All frontend checks bypassable via:** localStorage manipulation, system clock change, or direct API calls

---

## 3. Backend Validations — Current State

**Location:** Backend API server at `fundedwealth-api.onrender.com` (code NOT in this repo)

Based on observable behavior from the frontend code:

| Endpoint | What We Can Observe | Rules Enforced? |
|---|---|---|
| `POST /api/execution/order` | Frontend sends `{ symbol, side, qty, type, price, sl, tp }` | **UNKNOWN** — no backend source visible |
| `POST /api/positions/:id/close` | Frontend sends `{}` (empty body) | **UNKNOWN** |
| `DELETE /api/execution/cancel/:id` | Frontend sends no body | N/A |
| `GET /api/accounts` | Returns account data with `profitTarget`, `dailyLossLimit`, `maxDrawdown` | Provides rule params but no enforcement visible |
| `GET /api/positions` | Returns open positions | No enforcement |
| `PATCH /api/payouts/:id/status` | Admin approves/rejects | **UNKNOWN** if min-days check exists |

**Critical observation:** The frontend's `placeOrder()` function has a `catch` block that falls back to placing the order in **localStorage only** if the API call fails:

```tsx
} catch (err: any) {
  // Fallback: save locally
  setAccount(prev => { /* adds position to localStorage */ });
}
```

This means if the backend rejects an order (even correctly), the frontend allows the user to trade in a local "simulation" with no server-side state, potentially leading to:
- Users believing they have positions when the server doesn't know
- Users claiming wins that were never recorded server-side

---

## 4. Bypass Possibilities (Attack Vectors)

### Attack 1: localStorage Manipulation
**Difficulty:** Trivial (DevTools → Application → Local Storage)
**Method:** Edit `fw-trade-{accountId}` JSON to:
- Set `breached: false`
- Set `balance` and `equity` to any number
- Set `dayStartEquity` to current equity (resets daily loss)
- Set `highWater` to current equity (resets drawdown)
- Remove position history

**Impact:** User appears to have passed the challenge with fake P&L

**Protection Required:** Server must be authoritative. Local state is display-only.

---

### Attack 2: Direct API Call (curl/Postman)
**Difficulty:** Low (copy Bearer token from DevTools → Network tab)
**Method:**
```bash
curl -X POST https://fundedwealth-api.onrender.com/api/execution/order \
  -H "Authorization: Bearer <clerk_jwt>" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"NIFTY","side":"BUY","qty":100,"type":"MARKET"}'
```

**Impact:** Places orders exceeding lot limits, position size limits, during closed market, etc.

**Protection Required:** Backend `validateOrderServer()` middleware on ALL order endpoints.

---

### Attack 3: System Clock Manipulation
**Difficulty:** Low (Windows: Settings → Time → Manual)
**Method:** Set system clock to 10:00 AM IST on a weekday → `isMarketOpen()` returns `true` even on weekends

**Impact:** Places orders outside market hours

**Protection Required:** Backend uses `new Date()` on the SERVER, never trusts client-provided timestamps.

---

### Attack 4: Race Condition on Breach Check
**Difficulty:** Medium
**Method:** Send multiple concurrent orders via parallel `fetch()` calls. If the backend checks breach state BEFORE recording the fill, all concurrent orders pass individually but collectively breach the limit.

**Impact:** Daily loss or max drawdown exceeded by the aggregate of concurrent fills

**Protection Required:**
- Database row-level lock on the account row during fill processing
- `SELECT ... FOR UPDATE` on the account before computing breach state
- Atomic `UPDATE accounts SET balance = balance - X WHERE ... AND balance - X > breach_threshold`

---

### Attack 5: Offline/Network Failure Exploitation
**Difficulty:** Trivial (enable airplane mode in browser)
**Method:** API call fails → `catch` block places order in localStorage → user "trades" offline → later claims profit

**Impact:** Users accumulate fake P&L with no server backing

**Protection Required:** Remove the localStorage fallback for order placement. If the API fails, the order DOES NOT exist. Display an error and retry.

---

### Attack 6: WebSocket Price Manipulation
**Difficulty:** Medium (browser extension or proxy)
**Method:** Intercept WebSocket messages from `/ws/market` and inject fake price ticks showing favourable prices for open positions.

**Impact:** P&L calculations appear profitable; SL/TP auto-triggers at fake prices; breach detection shows false-positive equity.

**Protection Required:** Server-side P&L calculation is authoritative. Frontend P&L is display-only. All fills use the server's last known market price, not the client's.

---

## 5. Fixes Applied

### 5.1 — New Shared Rule Library (`src/lib/challengeRules.ts`)

Created a single source of truth for ALL challenge rules that can be imported by both frontend and backend:

| Function | Rules Covered | Purpose |
|---|---|---|
| `validateOrder()` | R1–R8 | Composite pre-order check |
| `checkBreachRules()` | R1, R2 | Breach detection |
| `checkDailyProfitKillSwitch()` | R4 | Kill-switch check |
| `checkMarketHours()` | R3 | Market open/closed |
| `checkLotSizeLimit()` | R6 | Qty validation |
| `checkPositionSizeLimit()` | R5 | 70% notional cap |
| `checkSLTPDirection()` | R7 | Directional SL/TP logic |
| `checkMarginAvailability()` | R8 | 10% margin check |
| `recalculateBreach()` | R1, R2 | Post-tick breach state update |
| `computeAccountMetrics()` | ALL | Progress bars for UI |
| `isMarketOpen()` | R3 | Shared market hours logic |
| `PLAN_RULE_CONFIG` | ALL | Plan-specific limits |
| `NSE_HOLIDAYS_2026` | R3 | Holiday set |

**New rules added that did NOT exist before:**
- R4 Daily Profit Kill-Switch ← was documented but never coded
- R5 Max Position Size ← was documented but never enforced
- R7 SL/TP Direction ← no validation existed
- R8 Margin Check ← was display-only, now blocks

---

### 5.2 — Secure API Wrapper (`src/lib/secureOrderApi.ts`)

New module that wraps all trading API calls:

| Function | Behavior |
|---|---|
| `placeSecureOrder()` | Runs `validateOrder()` client-side → if pass, calls backend → backend runs same checks → returns unified result |
| `closeSecurePosition()` | Calls close API + recalculates projected breach state |
| `fetchServerAccountState()` | Fetches server-authoritative state for reconciliation |
| `startPeriodicServerSync()` | Every 30s, syncs server state to catch drift/manipulation |

**Key architectural change:**
- If `validateOrder()` fails client-side → order NEVER reaches the API
- If API throws 422 → surfaces server's rule violation to user
- If API throws network error → order is **NOT** saved locally (removed fallback)

---

### 5.3 — Backend Enforcement Module (`src/lib/challengeRules.backend.ts`)

Provides the backend team with:

| Export | Purpose |
|---|---|
| `validateOrderServer()` | Full rule check using server clock + server account state |
| `checkBreachAfterFill()` | Post-fill breach detection for atomic DB write |
| `requireChallengeRules()` | Express/Fastify middleware factory for route protection |

**Database schema additions required:**
```sql
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS is_breached BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS breach_reason TEXT;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS breach_at TIMESTAMPTZ;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS day_start_equity DECIMAL NOT NULL DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS high_water_mark DECIMAL NOT NULL DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS trading_days INTEGER DEFAULT 0;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS last_trade_date_ist DATE;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS kill_switch_active BOOLEAN DEFAULT false;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS kill_switch_reset_date DATE;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS max_lots_per_order INTEGER DEFAULT 10;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS max_position_size_pct INTEGER DEFAULT 70;
ALTER TABLE accounts ADD COLUMN IF NOT EXISTS max_daily_profit_pct DECIMAL DEFAULT 4;
```

---

## 6. New Architecture (Post-Fix)

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (trade.tsx)                       │
│                                                                 │
│  User clicks "Place Order"                                      │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────┐                            │
│  │  validateOrder() [challengeRules.ts]  │  ← CLIENT-SIDE       │
│  │  • Breach check                       │     (UX ONLY)        │
│  │  • Market hours                       │                      │
│  │  • Kill-switch                        │                      │
│  │  • Lot size / position size           │                      │
│  │  • SL/TP direction                    │                      │
│  │  • Margin                             │                      │
│  └─────────────────────────────────┘                            │
│         │                                                       │
│         ▼  (if passes)                                          │
│  ┌──────────────────┐                                           │
│  │  placeSecureOrder()   │ → POST /api/execution/order          │
│  └──────────────────┘                                           │
│         │                                                       │
│         │  (if FAILS → show error, DO NOT save locally)         │
│         │  (if 422 → show server rule violation)                │
│         │                                                       │
│         ▼  (periodic: every 30s)                                │
│  ┌──────────────────────┐                                       │
│  │  fetchServerAccountState()  │ → GET /api/accounts/:id/state  │
│  │  Reconcile local ← server  │                                 │
│  └──────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│                                                                 │
│  POST /api/execution/order                                      │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────┐                        │
│  │  requireChallengeRules() MIDDLEWARE │  ← SERVER-SIDE         │
│  │  [challengeRules.backend.ts]       │     (AUTHORITATIVE)     │
│  │                                     │                        │
│  │  1. Load account FROM DATABASE      │                        │
│  │  2. Fetch price from MARKET SERVICE │                        │
│  │  3. Get lotSize from INSTRUMENT DB  │                        │
│  │  4. Run validateOrderServer()       │                        │
│  │  5. If breach → UPDATE DB + 422     │                        │
│  │  6. If kill-switch → UPDATE DB + 422│                        │
│  │  7. If allowed → proceed to fill    │                        │
│  └─────────────────────────────────────┘                        │
│         │                                                       │
│         ▼  (after fill)                                         │
│  ┌─────────────────────────────────┐                            │
│  │  checkBreachAfterFill()         │  ← POST-FILL CHECK        │
│  │  Atomic update: balance, equity,│                            │
│  │  HWM, breach state in 1 TX     │                            │
│  └─────────────────────────────────┘                            │
│         │                                                       │
│         ▼                                                       │
│  ┌───────────────────────────┐                                  │
│  │  SELECT ... FOR UPDATE    │  ← PREVENTS RACE CONDITIONS     │
│  │  (row-level lock on fill) │                                  │
│  └───────────────────────────┘                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Integration Guide for Backend Team

### Step 1: Copy the backend module

Copy `src/lib/challengeRules.backend.ts` to your server project:
```
server/
  lib/
    challengeRules.ts    ← copy from challengeRules.backend.ts
```

### Step 2: Add the middleware to order endpoints

```typescript
import { requireChallengeRules, checkBreachAfterFill } from "./lib/challengeRules";

// Helper functions to extract account and order from the request
async function getAccountFromRequest(req: Request) {
  const userId = req.auth.userId; // from Clerk JWT
  return db.accounts.findFirst({ where: { userId, isBreached: false } });
}

async function getOrderFromRequest(req: Request) {
  const { symbol, side, qty, type, price, sl, tp } = req.body;
  const instrument = await db.instruments.findUnique({ where: { symbol } });
  const lastPrice = await marketService.getPrice(symbol); // server's price
  return {
    symbol, side, qty, type, price, sl, tp,
    currentPrice: lastPrice,
    lotSize: instrument.lotSize,
  };
}

// Apply middleware
router.post(
  "/execution/order",
  authMiddleware,
  requireChallengeRules(getAccountFromRequest, getOrderFromRequest),
  async (req, res) => {
    // If we get here, all rules passed
    const fill = await executeFill(req);

    // Post-fill breach check
    const account = await getAccountFromRequest(req);
    const breach = checkBreachAfterFill(account, fill.newEquity);
    if (breach.shouldBreach) {
      await db.accounts.update(account.id, {
        isBreached: true,
        breachReason: breach.breachRecord!.reason,
        breachAt: breach.breachRecord!.at,
      });
    }

    res.json({ id: fill.id, entryPrice: fill.price, breached: breach.shouldBreach });
  }
);
```

### Step 3: Add the server state endpoint

```typescript
router.get("/accounts/:id/state", authMiddleware, async (req, res) => {
  const account = await db.accounts.findById(req.params.id);
  if (!account || account.userId !== req.auth.userId) return res.status(404).json({ error: "Not found" });

  const openPositions = await db.positions.findMany({
    where: { accountId: account.id, status: "open" },
  });

  res.json({
    id: account.id,
    startBalance: account.accountSize,
    currentBalance: account.currentBalance,
    equity: account.currentEquity,
    dayStartEquity: account.dayStartEquity,
    highWater: account.highWaterMark,
    dailyLossLimit: account.dailyLossLimit,
    maxDrawdown: account.maxDrawdown,
    profitTarget: account.profitTarget,
    maxDailyProfit: account.maxDailyProfitPct,
    tradingDays: account.tradingDays,
    isBreached: account.isBreached,
    breachReason: account.breachReason,
    killSwitchActive: account.killSwitchActive,
    openPositions: openPositions.map(p => ({
      id: p.id, symbol: p.symbol, side: p.side, qty: p.qty,
      entry: p.entryPrice, pnl: p.unrealisedPnl, lotSize: p.lotSize,
    })),
  });
});
```

### Step 4: Add auto square-off cron job

```typescript
// Run at 15:15 IST every trading day
// cron: "45 9 * * 1-5" (UTC equivalent of 15:15 IST)
async function autoSquareOff() {
  const openPositions = await db.positions.findMany({
    where: { status: "open" },
    include: { account: true },
  });

  for (const pos of openPositions) {
    const price = await marketService.getPrice(pos.symbol);
    await closePosition(pos.id, price, "auto_square_off");
  }

  // Reset kill-switch for all accounts
  await db.accounts.updateMany({
    where: { killSwitchActive: true },
    data: { killSwitchActive: false },
  });
}
```

### Step 5: Day-start equity reset

```typescript
// Run at 09:14 IST every trading day (before market opens)
// cron: "44 3 * * 1-5" (UTC equivalent)
async function resetDayStartEquity() {
  const accounts = await db.accounts.findMany({ where: { isBreached: false } });
  for (const acc of accounts) {
    await db.accounts.update(acc.id, {
      dayStartEquity: acc.currentEquity,
      killSwitchActive: false,
    });
  }
}
```

---

## Files Created / Modified

| File | Action | Purpose |
|---|---|---|
| `src/lib/challengeRules.ts` | **CREATED** | Shared rule engine (frontend + backend) |
| `src/lib/secureOrderApi.ts` | **CREATED** | Secure API wrapper with pre-validation |
| `src/lib/challengeRules.backend.ts` | **CREATED** | Backend middleware + post-fill checks |
| `CHALLENGE_SECURITY_REPORT.md` | **CREATED** | This report |

---

## Rule Coverage Matrix (After Fix)

| Rule | Frontend | Backend (required) | Status |
|---|---|---|---|
| R1 Max Drawdown | ✅ `checkBreachRules()` | ✅ `checkBreach()` + `checkBreachAfterFill()` | 🟢 Covered |
| R2 Daily Loss | ✅ `checkBreachRules()` | ✅ `checkBreach()` + `checkBreachAfterFill()` | 🟢 Covered |
| R3 Market Hours | ✅ `checkMarketHours()` | ✅ `checkMarketHoursServer()` (server clock) | 🟢 Covered |
| R4 Kill-Switch | ✅ `checkDailyProfitKillSwitch()` | ✅ `checkKillSwitch()` | 🟢 NEW |
| R5 Position Size | ✅ `checkPositionSizeLimit()` | ✅ `checkPositionSize()` | 🟢 NEW |
| R6 Lot Size | ✅ `checkLotSizeLimit()` | ✅ `checkLotSize()` | 🟢 Hardened |
| R7 SL/TP Direction | ✅ `checkSLTPDirection()` | ✅ `checkSLTPDirectionServer()` | 🟢 NEW |
| R8 Margin | ✅ `checkMarginAvailability()` | ✅ `checkMarginServer()` | 🟢 NEW |
| R9 Instruments | ❌ Not in frontend | ⚠️ Must implement in backend | 🟡 Backend TODO |
| R10 Min Trading Days | ❌ Payout endpoint only | ⚠️ Must check in payout handler | 🟡 Backend TODO |
| R11 No Overnight | ❌ Not in frontend | ⚠️ Cron job (auto square-off) | 🟡 Backend TODO |
| R12 Max Risk/Trade | ⚠️ WARNING only | ⚠️ WARNING only (funded stage) | 🟡 Optional |
| R13 Profit Target | ✅ Display metric | ⚠️ Auto-pass logic in backend | 🟡 Backend TODO |
| R14 Consistency | ❌ Not enforced | ⚠️ Must check in payout handler | 🟡 Backend TODO |

---

*End of Challenge Security Report*
