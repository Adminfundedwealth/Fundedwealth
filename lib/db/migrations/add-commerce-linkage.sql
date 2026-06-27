-- Commerce Linkage Migration
-- Adds order→account linkage and persists account_size on orders
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

-- 1. Add account_size to orders table
-- Stores the actual challenge account size (e.g. 500000 for ₹5L challenge)
-- Distinct from orders.amount which stores the FEE PAID
ALTER TABLE orders ADD COLUMN IF NOT EXISTS account_size INTEGER;

-- 2. Add order_id to trading_accounts table  
-- Links each provisioned account back to the commercial order that created it
ALTER TABLE trading_accounts ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Optional: Add index for fast order→account lookups (used by admin)
CREATE INDEX IF NOT EXISTS idx_trading_accounts_order_id ON trading_accounts(order_id);

-- NOTE: Existing rows will have NULL for these columns.
-- New purchases from this point forward will populate both fields.
-- Historical backfill can be done later by matching:
--   trading_accounts.user_id = orders.user_id 
--   AND trading_accounts.plan = orders.plan_type
--   AND trading_accounts.created_at close to orders.created_at
-- But this is a manual admin task, not an automatic migration.
