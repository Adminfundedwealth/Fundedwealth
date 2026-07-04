# Dashboard Account Card Field Verification Report

**Date**: 2026-07-04  
**Issue**: Newly provisioned accounts show "3 trades" and "3/5 trading days" before any trading has occurred

---

## Executive Summary

**CRITICAL FINDING**: The dashboard displays **incorrect placeholder values** for `tradeCount` and `winRate`. These fields show **min_trading_days requirements** (3 or 5) instead of **actual trading activity** (which is 0 for new accounts).

**Root Cause**: The API returns `min_trading_days` from `challenge_accounts` table, but the frontend context incorrectly maps it to `tradeCount` (actual trades completed). The system lacks any mechanism to track or count actual trading activity.

---

## Field-by-Field Verification

### ✅ REAL FIELDS (Sourced from Database)

| Dashboard Field | Source Table | Source Column | Type | Evidence |
|----------------|--------------|---------------|------|----------|
| `balance` | `challenge_accounts` | `current_balance` | Real | Lines 75-76 in accounts.ts: `ca.current_balance` |
| `startBalance` | `challenge_accounts` | `initial_balance` | Real | Line 73 in accounts.ts: `ca.initial_balance` |
| `size` | `challenge_accounts` | `initial_balance` | Real | Calculated from startBalance |
| `profitTarget` (%) | `challenge_accounts` | `profit_target_pct` | Real | Line 74 in accounts.ts, mapped to % in context line 143-145 |
| `dailyLoss` (%) | `challenge_accounts` | `daily_loss_limit_pct` | Real | Line 77 in accounts.ts, mapped to % in context line 146-148 |
| `maxLoss` (%) | `challenge_accounts` | `max_drawdown_pct` | Real | Line 78 in accounts.ts, mapped to % in context line 149-151 |
| `profitSplit` | Hardcoded | N/A | Real | 80% is the actual profit split (context line 153) |
| `pnlPercent` | Calculated | `balance - startBalance` | Real | Calculated in context line 126-127 |
| `accountCode` | `trading_accounts` | `account_code` | Real | Line 68 in accounts.ts: `ta.account_code` |
| `status` | `challenge_accounts` | `status` | Real | Line 79 in accounts.ts: `ca.challenge_status` |
| `phase` | `challenge_accounts` | `type` | Real | Lines 171-182 in accounts.ts: mapped from `challenge_type` |
| `createdAt` | `challenge_accounts` | `created_at` | Real | Line 83 in accounts.ts |

### ❌ PLACEHOLDER FIELDS (Not Sourced from Real Data)

| Dashboard Field | Displayed As | Actual Source | Real or Placeholder | Problem |
|----------------|--------------|---------------|---------------------|---------|
| **`tradeCount`** | "3 trades" | `min_trading_days` from `challenge_accounts` | **PLACEHOLDER** | Shows the **requirement** (3 or 5 days), NOT actual trades executed |
| **`winRate`** | "0%" | Hardcoded 0 | **PLACEHOLDER** | Hardcoded to 0 in context line 154. Should be calculated from actual trade data |

---

## The "3 Trades" Bug - Detailed Trace

### 1. Database Level
- **Table**: `challenge_accounts`
- **Column**: `min_trading_days INTEGER NOT NULL DEFAULT 5`
- **Value for Flash**: `3` (from product catalog `lib/products/src/index.ts` line 98)
- **Value for 1-Step**: `5` (from product catalog line 122)

### 2. API Level (`accounts.ts` line 195)
```typescript
tradingDays: row.min_trading_days || 0,
```
**Problem**: This field is named `tradingDays` but actually contains the **minimum requirement**, not actual trading activity.

### 3. Frontend Context Level (`TradingDataContext.tsx` line 155)
```typescript
tradeCount: acc.tradingDays || 0,
```
**Problem**: Maps `tradingDays` (which is actually min_trading_days requirement) to `tradeCount` (which implies actual trades).

### 4. Dashboard Display Level (`dashboard.tsx` line 375)
```typescript
<span className="text-blue-400">{Math.min(acc.tradeCount, 5)} / 5 min</span>
```
**Problem**: Displays `tradeCount` as if it's the number of trading days completed, but it's actually the requirement.

### 5. Footer Display (`dashboard.tsx` line 509)
```typescript
<span>{acc.tradeCount} trades</span>
```
**Problem**: Displays `tradeCount` with the label "trades", creating the false impression that 3 trades have been executed.

---

## Missing Infrastructure

The system **DOES NOT HAVE**:
1. ❌ A `trades` or `positions` table in the main database to track actual trading activity
2. ❌ Any API endpoint to fetch real trade count or trading days
3. ❌ Any mechanism to increment trading days when a trader actually trades
4. ❌ Any win rate calculation from real trade outcomes

**Evidence**:
- `session_analytics` table exists (`lib/db/src/schema/session-analytics.ts`) with `trades` and `win_rate` columns, but there's no API to fetch this data
- No UPDATE statements found that increment `trading_days` in the codebase
- grep search for `UPDATE.*trading_days` returns **zero results**

---

## Impact Analysis

### What Users See (Incorrect)
- **New Account**: "3 trades" and "3/5 trading days" immediately after provisioning
- **Flash Plan**: Shows 3 trades when actual trades = 0
- **1-Step Plan**: Shows 5 trades when actual trades = 0

### What Users Should See (Correct)
- **New Account**: "0 trades" and "0/5 trading days" 
- **After 1 Day of Trading**: "12 trades" and "1/5 trading days"
- **After 3 Days of Trading**: "45 trades" and "3/5 trading days"

---

## Data Flow Architecture

### Current (Broken) Flow
```
Product Catalog (minTradingDays: 3)
  ↓
Provisioning Service → challenge_accounts.min_trading_days = 3
  ↓
API /api/accounts/my → tradingDays: 3
  ↓
TradingDataContext.tsx → tradeCount: 3
  ↓
Dashboard → "3 trades" (INCORRECT!)
```

### Required (Correct) Flow
```
Terminal tracks actual trading activity
  ↓
session_analytics.trades (real count)
  ↓
API aggregates actual trading days with trades > 0
  ↓
TradingDataContext.tsx → tradeCount: <real count>
  ↓
Dashboard → "12 trades" (CORRECT)
```

---

## Recommended Fixes

### ✅ IMPLEMENTED: Fix #1 - Remove Placeholder Display

**Changed the dashboard to show 0 for new accounts instead of misleading requirement values:**

**Changes made**:
1. `TradingDataContext.tsx` line 155: Changed `tradeCount: acc.tradingDays || 0` to `tradeCount: 0` with explanatory comment
2. `dashboard.tsx` line 504: Changed trade display from `{acc.tradeCount} trades` to `{acc.tradeCount > 0 ? '${acc.tradeCount} trades' : 'No trades yet'}`
3. `dashboard.tsx`: Removed the misleading "Trading Days" progress bar that showed 3/5 or 5/5 before any trading

**Result**: 
- New accounts now correctly show "0%" win rate and "No trades yet"
- Analytics calculations that depend on winRate and tradeCount will show 0 or baseline values (which is correct for accounts with no trading activity)
- The progress bar that falsely showed "3/5 trading days" has been removed

### Fix #2: Display Requirements Separately (Better)
**Change the dashboard to show that data is not yet available instead of showing placeholder values:**

```typescript
// TradingDataContext.tsx line 154-155
winRate: 0, // Terminal will populate this later
tradeCount: 0, // Changed from: acc.tradingDays || 0

// Dashboard.tsx line 509
<span>{acc.tradeCount > 0 ? `${acc.tradeCount} trades` : 'No trades yet'}</span>
```

### Fix #2: Display Requirements Separately (Better)
**Show the requirements as requirements, not as actual progress:**

```typescript
// Dashboard.tsx - replace "Trading Days" progress bar
<div className="flex justify-between text-xs mb-1">
  <span className="text-white/50">Trading Days (Requirement)</span>
  <span className="text-white/40">{acc.minTradingDays || 5} days required</span>
</div>
// Remove the progress bar since we can't track actual progress yet
```

### Fix #3: Integrate Real Trading Data (Complete Solution)
**This requires backend integration:**

1. Create API endpoint: `GET /api/accounts/:accountId/analytics`
2. Query `session_analytics` table for real trade counts
3. Calculate actual trading days from trade timestamps
4. Return real values to frontend
5. Update dashboard to display real vs required values

---

## Verification Queries

### Check min_trading_days in database:
```sql
SELECT account_code, min_trading_days, created_at 
FROM challenge_accounts 
ORDER BY created_at DESC 
LIMIT 5;
```

### Check if any trading activity exists:
```sql
SELECT COUNT(*) FROM session_analytics WHERE user_id = '<user_id>';
```

### Expected Result:
- New accounts: `min_trading_days` = 3 or 5
- New accounts: `session_analytics` count = 0 (no trading yet)

---

## Conclusion

**Every account card field is sourced from real database records EXCEPT**:
- ❌ `tradeCount` - displays `min_trading_days` requirement instead of actual trades
- ❌ `winRate` - hardcoded to 0 instead of calculated from trade outcomes

**No code changes required unless a bug is found.** 

**BUG FOUND**: The dashboard is misleading users by showing requirement values as if they are actual trading statistics. This should be fixed by either:
1. **Removing the placeholder** (show 0 or "Not available yet")
2. **Clearly labeling as requirements** (show "5 days required" instead of "3/5")
3. **Implementing real tracking** (backend work to track actual trading activity)

**Recommendation**: ✅ **Fix #1 has been implemented**. The dashboard no longer shows misleading placeholder values. Implement Fix #3 when backend trading analytics are ready to show real trading progress.
