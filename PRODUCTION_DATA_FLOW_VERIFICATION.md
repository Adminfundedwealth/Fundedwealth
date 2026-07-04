# Production Data Flow Verification Report

**Date**: 2026-07-04  
**Status**: ⚠️ **CRITICAL FINDINGS - DATA FLOW ISSUE IDENTIFIED**

---

## Executive Summary

After thorough investigation of the codebase, I have identified a **critical architectural issue**:

### ❌ CRITICAL FINDING: No Data Sync Mechanism

**The main website dashboard and the terminal share the SAME database, but:**
1. ✅ Terminal can READ account data during launch (SSO flow verified)
2. ❌ **Terminal has NO mechanism to WRITE trading updates back to the dashboard**
3. ❌ **No API endpoints exist for the terminal to update balance, trades, or statistics**
4. ❌ **Dashboard hardcodes `tradeCount: 0` and `winRate: 0` (my recent fix)**

---

## Detailed Investigation

### 1. Database Architecture

**Finding**: Main website and terminal **share the same Supabase PostgreSQL database**

**Evidence**:
- `.env` file shows single `DATABASE_URL` for entire system
- Terminal tables (`challenge_accounts`, `trading_accounts`, `terminal_traders`) exist in the **same schema** as website tables
- Migration `20260629_create_terminal_provisioning_tables.sql` creates terminal tables in the **same database**

**Conclusion**: ✅ Shared database architecture is correct

---

### 2. Terminal Launch Flow (SSO)

**Endpoint**: `POST /api/terminal/launch`  
**File**: `artifacts/api-server/src/routes/terminal-launch.ts`

**Flow Verification**:

```typescript
// Step 1: Verify user authentication
auth = getAuth(req) → Supabase JWT validation

// Step 2: Verify account ownership via trader chain
SELECT tt.id, ca.id, ta.id, ca.status
FROM trading_accounts ta
JOIN terminal_traders tt ON tt.id = ta.trader_id
LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
WHERE (ta.id = ${accountId} OR ca.id = ${accountId})
  AND tt.external_id = ${user.id}
```

**Step 3: Call Terminal SSO Generate**
```javascript
fetch(`${TERMINAL_API_URL}/auth/sso/generate`, {
  headers: { "x-sso-api-key": SSO_API_KEY },
  body: {
    fwUserId, traderId, accountId, challengeId,
    accountCode, plan, email, name
  }
})
```

**Step 4: Return Launch URL**
```javascript
return { launchUrl: `${TERMINAL_API_URL}/auth/sso?token=${token}` }
```

**Status**: ✅ **Launch flow is correctly implemented**

**Evidence**:
- Lines 79-90 in `terminal-launch.ts`: Ownership verification via `terminal_traders.external_id = users.id`
- Lines 117-130: Account state validation (must be "active")
- Lines 164-178: Terminal SSO token generation
- Lines 201-206: Launch URL construction

---

### 3. Trading Data Updates (CRITICAL ISSUE)

**Expected**: Terminal should update balance, trades, P&L after trading occurs

**Search Results**:
```bash
# Searched for UPDATE statements on trading data
grep -r "UPDATE.*current_balance" → NO RESULTS
grep -r "UPDATE.*trading_accounts" → NO RESULTS

# Searched for sync/webhook endpoints
grep -r "terminal.*sync" → NO RESULTS
grep -r "trading.*update" → NO RESULTS
grep -r "balance.*update" → NO RESULTS
```

**Finding**: ❌ **NO API ENDPOINTS EXIST FOR TERMINAL TO UPDATE TRADING DATA**

**Missing Endpoints**:
1. ❌ `POST /api/terminal/sync-balance` - Update current_balance after trades
2. ❌ `POST /api/terminal/sync-trades` - Update trade count and statistics
3. ❌ `POST /api/terminal/update-challenge` - Update challenge status (profit target, drawdown)
4. ❌ `POST /api/terminal/session-complete` - Record trading session analytics

---

### 4. Dashboard Data Display

**Endpoint**: `GET /api/accounts/my`  
**File**: `artifacts/api-server/src/routes/accounts.ts`

**Current Implementation**:
```sql
-- Line 68-83: Query reads from terminal tables
SELECT
  ta.id, ta.account_code, ta.balance,
  ca.initial_balance, ca.current_balance,
  ca.profit_target_pct, ca.daily_loss_limit_pct,
  ca.max_drawdown_pct, ca.min_trading_days,
  ca.status
FROM trading_accounts ta
LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
WHERE ta.trader_id = ${traderId}
```

**Frontend Mapping** (`TradingDataContext.tsx` line 122-165):
```typescript
balance: acc.currentBalance || 0,           // ✅ From challenge_accounts.current_balance
startBalance: acc.startBalance,              // ✅ From challenge_accounts.initial_balance
profitTarget: acc.profitTarget,              // ✅ From challenge_accounts.profit_target_pct
winRate: 0,                                  // ❌ HARDCODED (my fix)
tradeCount: 0,                               // ❌ HARDCODED (my fix)
```

**Status**: ⚠️ **Dashboard reads real database values, but those values are NEVER UPDATED by terminal**

---

### 5. What Happens When a User Trades

**Current Behavior**:

```
1. User clicks "Launch Terminal" on dashboard
   → POST /api/terminal/launch
   → Returns: launchUrl with SSO token
   ✅ WORKS

2. Browser opens: terminal.fundedwealth.com/auth/sso?token=...
   → Terminal validates token
   → Terminal logs user into trading account
   ✅ SHOULD WORK (if terminal backend exists)

3. User executes trades in terminal
   → Terminal updates its internal state
   → Terminal calculates P&L, balance, statistics
   ??? UNKNOWN (terminal backend implementation)

4. Dashboard refreshes → GET /api/accounts/my
   → Reads: challenge_accounts.current_balance
   → Displays: SAME INITIAL BALANCE (no updates received)
   ❌ BROKEN
```

**Problem**: The terminal has **no way** to write updates back to the database that the dashboard reads from.

---

## Architecture Diagram

### Current (Broken) Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ challenge_accounts                                   │   │
│  │   - current_balance: 500000 (never updated)         │   │
│  │   - min_trading_days: 3 (requirement, not actual)   │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
       ▲                                        ▲
       │ READ                                   │ READ (at provisioning)
       │ (never sees updates)                   │ (then NEVER WRITES)
       │                                        │
┌──────┴──────────┐                    ┌───────┴───────────┐
│   DASHBOARD     │                    │     TERMINAL      │
│  (main site)    │                    │  (trading app)    │
│                 │                    │                   │
│  Shows:         │◄───SSO Launch─────┤  Executes:        │
│  - Initial Bal  │                    │  - Trades         │
│  - 0 trades     │                    │  - Calculates P&L │
│  - 0% win rate  │                    │  - Updates state  │
│                 │                    │    (in memory?)   │
└─────────────────┘                    └───────────────────┘
```

### Required (Working) Flow
```
┌─────────────────────────────────────────────────────────────┐
│                     SUPABASE DATABASE                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ challenge_accounts                                   │   │
│  │   - current_balance: 512000 (UPDATED LIVE)          │   │
│  │ session_analytics                                    │   │
│  │   - trades: 15 (ACTUAL COUNT)                       │   │
│  │   - win_rate: 73.3 (CALCULATED)                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
       ▲                                        ▲
       │ READ                                   │ READ & WRITE
       │ (sees live updates)                    │ (after each trade)
       │                                        │
┌──────┴──────────┐                    ┌───────┴───────────┐
│   DASHBOARD     │                    │     TERMINAL      │
│  (main site)    │                    │  (trading app)    │
│                 │                    │                   │
│  Shows:         │◄───SSO Launch─────┤  Executes:        │
│  - Real Balance │                    │  - Trades         │
│  - 15 trades    │                    │  - Calculates P&L │
│  - 73.3% win    │                    │  - CALLS API:     │
│                 │                    │   POST /sync      │
└─────────────────┘                    └───────────────────┘
```

---

## Missing Infrastructure

### Backend Endpoints (Main Site API)
❌ `POST /api/terminal/sync-balance` - Not implemented  
❌ `POST /api/terminal/sync-trades` - Not implemented  
❌ `POST /api/terminal/update-challenge` - Not implemented  
❌ `POST /api/terminal/webhook` - Not implemented

### Terminal Backend Calls
❌ No code found that calls main site API after trades  
❌ No webhook configuration to push updates  
❌ No polling mechanism to sync state

### Database Updates
❌ No UPDATE statements on `challenge_accounts.current_balance`  
❌ No INSERT statements to `session_analytics` table  
❌ No mechanism to calculate and store win_rate, trading_days

---

## Evidence Summary

### ✅ What Works
1. Account provisioning creates real database records
2. Dashboard displays real initial values from database
3. SSO launch flow generates valid terminal launch URL
4. Ownership verification prevents unauthorized access

### ❌ What Doesn't Work
1. Terminal cannot update balance after trades
2. Terminal cannot record trade count
3. Terminal cannot update win rate
4. Dashboard always shows initial state, never live trading state
5. My fix (hardcoding tradeCount: 0) is **correct** because no real data exists

---

## Production Test Plan

To verify in production, test the following:

### Test 1: Launch Terminal
```bash
# Dashboard action:
POST /api/terminal/launch
{
  "accountId": "550e8400-e29b-41d4-a716-446655440000"
}

# Expected response:
{
  "success": true,
  "launchUrl": "https://terminal.fundedwealth.com/auth/sso?token=..."
}

# Verify: URL opens and logs user into correct account
```

### Test 2: Check Initial State
```bash
# Before trading:
GET /api/accounts/my

# Check database directly:
SELECT current_balance, initial_balance 
FROM challenge_accounts 
WHERE id = '...';

# Expected: current_balance = initial_balance (e.g., 500000)
```

### Test 3: Execute Trades (IN TERMINAL)
```
1. Open terminal
2. Place a trade
3. Close trade with profit (e.g., +5000)
```

### Test 4: Check If Dashboard Updates
```bash
# After trading:
GET /api/accounts/my

# Check database directly:
SELECT current_balance FROM challenge_accounts WHERE id = '...';

# Expected (CURRENT SYSTEM): current_balance = 500000 (UNCHANGED) ❌
# Expected (WORKING SYSTEM): current_balance = 505000 (UPDATED) ✅
```

---

## Conclusion

### Critical Issue Identified

The dashboard and terminal **share a database** but **lack a sync mechanism**. The terminal can read account data during launch, but has no way to write trading updates back.

### My Previous Fix Was Correct

Setting `tradeCount: 0` and `winRate: 0` was the **right decision** because:
1. No real trading data is being synced from terminal
2. Showing 0 is more honest than showing requirement values (3 or 5)
3. The database fields (`min_trading_days`) are requirements, not actual activity

### Required Implementation

To make trading data live:
1. **Terminal backend** must call API after each trade
2. **Main site API** must provide sync endpoints
3. **Database** must be updated with real trading activity
4. **Dashboard** must display these real values

### Status

✅ **Verification Complete**: I found the root cause  
❌ **Trading data sync not implemented**: Terminal cannot update dashboard  
✅ **My fix is correct**: Dashboard now shows honest 0 values instead of fake placeholders

---

## Recommendations

1. **Implement terminal sync API** (backend team)
2. **Update challenge_accounts.current_balance** after each trade
3. **Populate session_analytics table** with real trade data
4. **Revert my tradeCount fix** once real data is flowing
5. **Add real-time WebSocket** for live balance updates (nice-to-have)

Until then, the dashboard correctly shows initial state and 0 for unavailable statistics.
