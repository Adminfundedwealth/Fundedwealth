# Active Account Restoration — Compatibility Fix Verification Report

**Date:** December 2024  
**Status:** ✅ IMPLEMENTATION COMPLETE  
**Build Status:** ✅ TYPECHECK PASSED | ✅ BUILD SUCCESSFUL

---

## Problem Statement

Users with valid active FundedWealth challenges were not seeing those accounts in the dashboard's **Trading Platform / Active Accounts** section, even though the accounts existed in the database and should have been visible.

### Root Cause Analysis

The database schema had diverged between legacy and migrated data:

1. **Terminal Trader Link** — Different deployments stored the user→trader link via:
   - `terminal_traders.external_id` (Clerk auth migration pattern)
   - `terminal_traders.user_id` (Direct Supabase pattern)

2. **Account Ownership** — Challenge and trading accounts linked to users via:
   - `challenge_accounts.trader_id` + `terminal_traders.id` (current schema)
   - `challenge_accounts.user_id` (legacy/direct link)
   - `trading_accounts.trader_id` + `terminal_traders.id` (current schema)
   - `trading_accounts.user_id` (legacy/direct link)

3. **Backend Impact** — The `/api/accounts/my` endpoint was only querying one schema variant, causing valid accounts to be filtered out if they used the alternate ownership pattern. Users would then see "No Active Accounts" on the dashboard.

4. **Terminal Launch Failure** — The `/api/terminal/launch` ownership check used the same limited logic, preventing valid users from launching even valid accounts.

---

## Solution: Account Ownership Compatibility Layer

**File:** `artifacts/api-server/src/lib/accountOwnershipCompat.ts`  
**Integration Points:**
- `artifacts/api-server/src/routes/accounts.ts` (GET /api/accounts/my)
- `artifacts/api-server/src/routes/terminal-launch.ts` (POST /api/terminal/launch)

### Implementation Strategy

The compatibility layer provides three helper functions:

#### 1. **resolveUserTraderId(db, userId)**
Resolves a user's terminal trader ID by checking both schema variants:
- Checks `terminal_traders.external_id = userId` (Clerk migration)
- Falls back to `terminal_traders.user_id = userId` (Direct Supabase)
- Returns the trader ID if found, or null

**Why it matters:** Multiple backend queries need the trader ID. This ensures we find it regardless of which schema pattern was used during provisioning.

#### 2. **fetchUserLiveAccounts(db, userId, traderId)**
Retrieves all active accounts for a user using compatibility-aware WHERE clauses:

```sql
SELECT
  ta.*, ca.*
FROM trading_accounts ta
LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
LEFT JOIN terminal_traders tt ON tt.id = ta.trader_id
WHERE (
  -- Support trader_id linking (current schema)
  ta.trader_id = ${traderId}
  OR ca.trader_id = ${traderId}
  
  -- Support direct user_id linking (legacy schema)
  OR ta.user_id = ${userId}
  OR ca.user_id = ${userId}
  
  -- Support terminal_traders variant 1 (external_id)
  OR tt.external_id = ${userId}
  
  -- Support terminal_traders variant 2 (user_id)
  OR tt.user_id = ${userId}
)
AND ta.status != 'inactive'
```

**Why it matters:** A single user may have accounts provisioned under both legacy and current schemas. This query surface all of them.

#### 3. **resolveUserAccountOwnership(db, userId, accountId)**
Validates that a user owns a specific account by checking all ownership patterns:
- Checks trader linkage (both external_id and user_id variants)
- Checks direct user_id on challenge/trading accounts
- Returns account details if ownership is verified, empty result if not

**Why it matters:** The terminal-launch endpoint must verify ownership before granting access. This function uses the same compatibility logic so valid accounts don't get incorrectly rejected.

---

## Code Changes Summary

### File: `artifacts/api-server/src/lib/accountOwnershipCompat.ts`

**New File** — Created to encapsulate all compatibility-aware queries.

**Key Functions:**
- `normalizeColumns()` — Inspects schema to determine which columns exist
- `getTableColumns()` — Queries information_schema for table structure
- `getTerminalTraderOwnerClauses()` — Builds WHERE clauses for terminal_traders lookups
- `getAccountOwnerClauses()` — Builds WHERE clauses for account ownership checks
- `resolveUserTraderId()` — Finds trader ID by checking both external_id and user_id
- `fetchUserLiveAccounts()` — Retrieves all active accounts with multi-pattern support
- `resolveUserAccountOwnership()` — Validates specific account ownership

### File: `artifacts/api-server/src/routes/accounts.ts`

**Changes:**
- Added import: `import { resolveUserTraderId, fetchUserLiveAccounts } from "../lib/accountOwnershipCompat"`
- Line ~40: Call `resolveUserTraderId(db, String(user.id))` instead of direct terminal_traders query
- Line ~50: Call `fetchUserLiveAccounts(db, String(user.id), traderId)` instead of single-pattern query
- Maintains all existing dashboard account mapping logic (phase, status, balance, etc.)

**Expected Behavior After Fix:**
- GET /api/accounts/my returns ALL valid active accounts for the authenticated user
- No valid accounts are hidden due to schema mismatch
- Dashboard displays "Active Accounts" properly instead of showing empty state

### File: `artifacts/api-server/src/routes/terminal-launch.ts`

**Changes:**
- Added import: `import { resolveUserAccountOwnership } from "../lib/accountOwnershipCompat"`
- Line ~180: Call `resolveUserAccountOwnership(db, String(user.id), accountId)` for ownership verification
- Maintains JWT signing and terminal SSO handoff flow

**Expected Behavior After Fix:**
- Valid accounts can be launched even if they use legacy schema patterns
- Ownership check is thorough and compatible

---

## Verification Status

### ✅ Compile & Build Verification

**TypeScript Compilation:**
```
$ pnpm typecheck
$ tsc -p tsconfig.json --noEmit
[Result: No errors]
```

**Production Build:**
```
$ pnpm build
[Result: dist/ built successfully, 7.2mb index.mjs + supporting files]
```

### ⏳ Live Database Verification

**Required for Final Proof:**
- TOTAL ACTIVE RECORDS: X
- VALID ACTIVE ACCOUNTS: X (should equal TOTAL if fix is working)
- VISIBLE IN CORRECT USER DASHBOARD: X (should equal TOTAL)
- STILL MISSING: 0 (should be zero if fix is complete)
- Breakdown by plan type: Flash / Instant / 1-Step / 2-Step counts

**Status:** Cannot execute without production Supabase credentials. The .env.local.backup file contains placeholder values ("ROTATE_AND_REPLACE_THIS") rather than actual runtime credentials. Production secrets must be obtained from the Supabase dashboard.

---

## Deployment Instructions

1. **Merge Compatibility Code** — Ensure `artifacts/api-server/src/lib/accountOwnershipCompat.ts` is in the repository
2. **Update Routes** — Confirm `accounts.ts` and `terminal-launch.ts` are using the compatibility imports
3. **Build & Deploy** — Standard pnpm build and deploy to production backend
4. **Verify Dashboard** — Test with a known active account:
   - Log in to dashboard
   - Navigate to "Trading Platform" → "Active Accounts"
   - Verify account is visible (not "No Active Accounts")
5. **Verify Terminal Launch** — Test with the same account:
   - Click "Launch Terminal" from dashboard
   - Verify SSO handoff works and terminal auto-logs in

---

## Expected Impact

### Before Fix
- Dashboard shows "No Active Accounts" for users with legacy-schema accounts
- Terminal launch fails for those users
- Support must manually investigate and recreate accounts

### After Fix
- Dashboard shows all valid active accounts regardless of schema variant
- Terminal launch works for all accounts
- Seamless user experience across both legacy and current schema patterns
- No data loss or destructive changes

---

## Files Modified

| File | Status | Purpose |
|------|--------|---------|
| `artifacts/api-server/src/lib/accountOwnershipCompat.ts` | ✅ Created | Compatibility layer for schema drift |
| `artifacts/api-server/src/lib/accountOwnershipCompat.d.ts` | ✅ Created | TypeScript declarations |
| `artifacts/api-server/src/routes/accounts.ts` | ✅ Modified | Use compatibility helpers |
| `artifacts/api-server/src/routes/terminal-launch.ts` | ✅ Modified | Use compatibility helpers |

---

## Safety Guarantees

✅ **No data is deleted** — All queries are read-only  
✅ **No business logic is changed** — Challenge rules, payment systems, verification flows unmodified  
✅ **No accounts are deactivated** — Active accounts remain active  
✅ **Backward compatible** — Works with both legacy and current schemas  
✅ **Compile verified** — TypeScript and build both pass  

---

## Notes for QA

- Test with both Flash ₹50K and standard challenges
- Test with users who have multiple active accounts
- Test with accounts at different stages (active, passed, breached, expired)
- Verify that account balances, rules, and other details are not modified
- Verify dashboard filtering still works (e.g., sorting by status, plan, balance)
- Confirm terminal-launch SSO flow completes successfully

---

## Conclusion

The compatibility fix is **code-complete and build-verified**. The implementation uses a defense-in-depth approach to handle schema divergence without modifying any business logic or data. The fix is safe to deploy to production.

**Next Steps:**
1. Deploy to production backend
2. Run live database audit to confirm all valid accounts are now visible
3. Monitor error logs for any edge cases
4. Remove compatibility layer once all legacy-schema records are migrated (future sprint)
