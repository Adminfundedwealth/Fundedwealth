-- ═══════════════════════════════════════════════════════════════════════════════
-- REMOVE FAKE/TEST ACCOUNTS FROM PRODUCTION DATABASE
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- This script removes test accounts that were created during development.
-- 
-- BEFORE RUNNING:
-- 1. Backup your database
-- 2. Verify which accounts are fake by listing them first
-- 3. Replace 'YOUR_USER_EMAIL@example.com' with the actual user email
--
-- ═══════════════════════════════════════════════════════════════════════════════

-- STEP 1: List all accounts for a specific user (REVIEW BEFORE DELETING)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Find the user ID first
SELECT id, email, first_name, last_name, created_at
FROM users
WHERE email = 'YOUR_USER_EMAIL@example.com';
-- Copy the user ID from the result

-- List all terminal_traders for this user
SELECT 
    tt.id AS trader_id,
    tt.email,
    tt.display_name,
    tt.plan,
    tt.external_id,
    tt.created_at
FROM terminal_traders tt
WHERE tt.external_id = 'PASTE_USER_ID_HERE'::uuid;

-- List all challenge_accounts
SELECT 
    ca.id AS challenge_id,
    ca.trader_id,
    ca.type,
    ca.plan,
    ca.initial_balance,
    ca.status,
    ca.created_at
FROM challenge_accounts ca
JOIN terminal_traders tt ON tt.id = ca.trader_id
WHERE tt.external_id = 'PASTE_USER_ID_HERE'::uuid;

-- List all trading_accounts
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

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 2: DELETE FAKE ACCOUNTS (CAREFUL - THIS IS PERMANENT)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Option A: Delete ALL accounts for a specific user
-- ══════════════════════════════════════════════════════════════════════════════

-- Delete in correct order (respecting foreign keys):

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

-- 4. Delete orders (if you want to remove payment records too)
-- CAUTION: This removes payment history
DELETE FROM orders
WHERE user_id = 'PASTE_USER_ID_HERE'::uuid;

-- 5. Delete provisioning_logs
DELETE FROM provisioning_logs
WHERE order_id IN (
    SELECT id FROM orders
    WHERE user_id = 'PASTE_USER_ID_HERE'::uuid
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Option B: Delete specific fake accounts by account code
-- ══════════════════════════════════════════════════════════════════════════════

-- If you know the account codes of fake accounts (e.g., FW-HTA13WNQH9):

-- 1. Delete trading_account
DELETE FROM trading_accounts
WHERE account_code IN ('FW-HTA13WNQH9', 'FW-M403BVUWUF', 'FW-QYDFQ1NL41', 'FW-39EM9RTWOO');

-- 2. Delete associated challenge_accounts (find orphaned challenges)
DELETE FROM challenge_accounts
WHERE id NOT IN (SELECT DISTINCT challenge_id FROM trading_accounts WHERE challenge_id IS NOT NULL);

-- ═══════════════════════════════════════════════════════════════════════════════
-- Option C: Delete ALL test/fake accounts (NUCLEAR OPTION - USE WITH CAUTION)
-- ══════════════════════════════════════════════════════════════════════════════

-- Only run this if you want to wipe ALL trading accounts from the system:

-- Delete all trading_accounts
-- DELETE FROM trading_accounts;

-- Delete all challenge_accounts
-- DELETE FROM challenge_accounts;

-- Delete all terminal_traders
-- DELETE FROM terminal_traders;

-- Delete all orders
-- DELETE FROM orders;

-- Delete all provisioning_logs
-- DELETE FROM provisioning_logs;

-- ═══════════════════════════════════════════════════════════════════════════════
-- STEP 3: Verify deletion
-- ═══════════════════════════════════════════════════════════════════════════════

-- Check that accounts are gone
SELECT COUNT(*) AS remaining_accounts
FROM trading_accounts ta
JOIN challenge_accounts ca ON ca.id = ta.challenge_id
JOIN terminal_traders tt ON tt.id = ca.trader_id
WHERE tt.external_id = 'PASTE_USER_ID_HERE'::uuid;
-- Should return 0

-- ═══════════════════════════════════════════════════════════════════════════════
-- NOTES:
-- ═══════════════════════════════════════════════════════════════════════════════
-- 
-- - The accounts shown in your screenshots (FW-HTA13WNQH9, FW-M403BVUWUF, etc.) 
--   are REAL database records, not UI mock data.
-- 
-- - They were likely created during testing or from failed provisioning attempts.
-- 
-- - After deleting them, the dashboard will show "No Active Accounts" until a 
--   real purchase is made.
-- 
-- - To access Supabase database:
--   1. Go to https://supabase.com/dashboard
--   2. Select your project
--   3. Go to SQL Editor
--   4. Paste the queries above
--   5. Run them one by one
--
-- ═══════════════════════════════════════════════════════════════════════════════
