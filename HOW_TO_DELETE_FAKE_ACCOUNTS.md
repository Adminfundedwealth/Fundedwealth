# How to Delete Fake Accounts from Production

The fake accounts you see in the dashboard are **REAL database records**, not UI placeholders.

Account codes visible in your screenshots:
- `FW-HTA13WNQH9`
- `FW-M403BVUWUF`
- `FW-QYDFQ1NL41`
- `FW-39EM9RTWOO`

These exist in the `trading_accounts` table in your Supabase database.

---

## Method 1: Delete via Supabase Dashboard (Recommended)

### Step 1: Access Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your FundedWealth project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Find Your User ID

Run this query (replace with your actual email):

```sql
SELECT id, email, first_name, last_name, created_at
FROM users
WHERE email = 'your_email@example.com';
```

Copy the `id` value.

### Step 3: List All Accounts for This User

Replace `PASTE_USER_ID_HERE` with the ID from Step 2:

```sql
SELECT 
    ta.id AS trading_account_id,
    ta.account_code,
    ta.broker_provider,
    ta.balance,
    ta.status,
    ta.created_at,
    ca.plan,
    ca.type
FROM trading_accounts ta
JOIN challenge_accounts ca ON ca.id = ta.challenge_id
JOIN terminal_traders tt ON tt.id = ca.trader_id
WHERE tt.external_id = 'PASTE_USER_ID_HERE'::uuid;
```

This shows all accounts that will be deleted.

### Step 4: Delete All Accounts for This User

**CAUTION: This is permanent. Backup first if needed.**

Run these queries **in order**:

```sql
-- 1. Delete trading_accounts
DELETE FROM trading_accounts
WHERE id IN (
    SELECT ta.id
    FROM trading_accounts ta
    JOIN challenge_accounts ca ON ca.id = ta.challenge_id
    JOIN terminal_traders tt ON tt.id = ca.trader_id
    WHERE tt.external_id = 'PASTE_USER_ID_HERE'::uuid
);

-- 2. Delete challenge_accounts
DELETE FROM challenge_accounts
WHERE trader_id IN (
    SELECT id FROM terminal_traders
    WHERE external_id = 'PASTE_USER_ID_HERE'::uuid
);

-- 3. Delete terminal_traders
DELETE FROM terminal_traders
WHERE external_id = 'PASTE_USER_ID_HERE'::uuid;

-- 4. (Optional) Delete orders - only if you want to remove payment history
DELETE FROM orders
WHERE user_id = 'PASTE_USER_ID_HERE'::uuid;

-- 5. (Optional) Delete provisioning logs
DELETE FROM provisioning_logs
WHERE order_id IN (
    SELECT id FROM orders
    WHERE user_id = 'PASTE_USER_ID_HERE'::uuid
);
```

### Step 5: Verify Deletion

```sql
SELECT COUNT(*) AS remaining_accounts
FROM trading_accounts ta
JOIN challenge_accounts ca ON ca.id = ta.challenge_id
JOIN terminal_traders tt ON tt.id = ca.trader_id
WHERE tt.external_id = 'PASTE_USER_ID_HERE'::uuid;
```

Should return `0`.

---

## Method 2: Delete Specific Accounts by Code

If you only want to remove specific fake accounts:

```sql
-- Delete by account codes
DELETE FROM trading_accounts
WHERE account_code IN (
    'FW-HTA13WNQH9',
    'FW-M403BVUWUF',
    'FW-QYDFQ1NL41',
    'FW-39EM9RTWOO'
);

-- Clean up orphaned challenge_accounts
DELETE FROM challenge_accounts
WHERE id NOT IN (
    SELECT DISTINCT challenge_id 
    FROM trading_accounts 
    WHERE challenge_id IS NOT NULL
);
```

---

## Method 3: Nuclear Option (Delete Everything)

**ONLY use this if you want to wipe ALL accounts from production:**

```sql
TRUNCATE TABLE trading_accounts CASCADE;
TRUNCATE TABLE challenge_accounts CASCADE;
TRUNCATE TABLE terminal_traders CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE provisioning_logs CASCADE;
```

This removes **ALL accounts for ALL users**. Use with extreme caution.

---

## After Deletion

1. **Refresh the dashboard** - you should see "No Active Accounts"
2. **Make a test purchase** - the new account should appear
3. **Verify correct product type** - Flash should show "Flash Funding" not "PHASE1"

---

## Why These Accounts Exist

These accounts were created by:
1. **Test purchases during development**
2. **Failed provisioning attempts that still created database records**
3. **Manual testing of the provisioning API**

They are **NOT** created by the frontend UI - they exist in the actual database.

---

## What Gets Displayed

The dashboard shows accounts from this query chain:

```
users.id 
  → terminal_traders.external_id 
  → challenge_accounts.trader_id 
  → trading_accounts.challenge_id 
  → Dashboard Card
```

If any records exist in this chain, they will appear on the dashboard.

---

## File Reference

Full SQL script: `REMOVE_FAKE_ACCOUNTS.sql`

This file contains all the queries above plus additional verification queries.
