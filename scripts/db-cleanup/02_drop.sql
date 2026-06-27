-- ============================================================================
-- DROP SQL — Legacy Challenge Engine Tables (FK-safe order)
-- ============================================================================
-- Generated: 2026-06-21
-- Purpose: Drop all 11 orphaned challenge engine tables.
-- Prerequisites: 01_backup.sql MUST have been executed successfully.
-- DO NOT EXECUTE WITHOUT EXPLICIT APPROVAL.
-- ============================================================================
--
-- FK DEPENDENCY ORDER (children first, parents last):
--   payout_reviews → payout_eligibility → challenge_accounts
--   account_states → challenge_accounts + funded_accounts
--   funding_events → challenge_accounts + funded_accounts
--   funded_accounts → challenge_accounts
--   breach_events → challenge_accounts
--   risk_events → challenge_accounts
--   account_locks → challenge_accounts
--   challenge_progress → challenge_accounts
--   challenge_accounts → challenge_rules (via challenge_rule_id)
--   challenge_rules → (leaf)
--
-- PROTECTED TABLES — These are NOT dropped:
--   trading_accounts, users, orders, payouts, payout_timeline_events,
--   kyc_submissions, kyc_profiles, kyc_documents, kyc_reviews,
--   referrals, community_posts, community_comments, community_likes,
--   manual_payments, notifications, webhook_logs, blog_posts,
--   contact_submissions, championship_registrations
-- ============================================================================

BEGIN;

-- ============================================================================
-- SAFETY CHECK: Abort if any table has unexpected data
-- (All tables should have 0 rows based on audit)
-- ============================================================================
DO $$
DECLARE
  row_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO row_count FROM payout_reviews;
  IF row_count > 0 THEN RAISE EXCEPTION 'payout_reviews has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM payout_eligibility;
  IF row_count > 0 THEN RAISE EXCEPTION 'payout_eligibility has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM account_states;
  IF row_count > 0 THEN RAISE EXCEPTION 'account_states has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM funding_events;
  IF row_count > 0 THEN RAISE EXCEPTION 'funding_events has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM funded_accounts;
  IF row_count > 0 THEN RAISE EXCEPTION 'funded_accounts has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM breach_events;
  IF row_count > 0 THEN RAISE EXCEPTION 'breach_events has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM risk_events;
  IF row_count > 0 THEN RAISE EXCEPTION 'risk_events has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM account_locks;
  IF row_count > 0 THEN RAISE EXCEPTION 'account_locks has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM challenge_progress;
  IF row_count > 0 THEN RAISE EXCEPTION 'challenge_progress has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM challenge_accounts;
  IF row_count > 0 THEN RAISE EXCEPTION 'challenge_accounts has % rows — aborting', row_count; END IF;

  SELECT COUNT(*) INTO row_count FROM challenge_rules;
  IF row_count > 0 THEN RAISE EXCEPTION 'challenge_rules has % rows — aborting', row_count; END IF;
END $$;

-- ============================================================================
-- STEP 1: Remove FK column from trading_orders that references challenge_accounts
-- (Added by phase6 migration: ALTER TABLE trading_orders ADD COLUMN challenge_account_id)
-- ============================================================================
ALTER TABLE trading_orders DROP COLUMN IF EXISTS challenge_account_id;
ALTER TABLE trading_orders DROP COLUMN IF EXISTS rule_check_result;

-- ============================================================================
-- STEP 2: Drop tables in FK-safe order (children → parents)
-- ============================================================================

-- Layer 1: Deepest children (no other table references these)
DROP TABLE IF EXISTS payout_reviews CASCADE;

-- Layer 2: Referenced only by payout_reviews (already dropped)
DROP TABLE IF EXISTS payout_eligibility CASCADE;

-- Layer 3: References both challenge_accounts and funded_accounts
DROP TABLE IF EXISTS account_states CASCADE;
DROP TABLE IF EXISTS funding_events CASCADE;

-- Layer 4: References challenge_accounts only
DROP TABLE IF EXISTS funded_accounts CASCADE;
DROP TABLE IF EXISTS breach_events CASCADE;
DROP TABLE IF EXISTS risk_events CASCADE;
DROP TABLE IF EXISTS account_locks CASCADE;
DROP TABLE IF EXISTS challenge_progress CASCADE;

-- Layer 5: Parent table (referenced by all above)
DROP TABLE IF EXISTS challenge_accounts CASCADE;

-- Layer 6: Root table (referenced by challenge_accounts.challenge_rule_id)
DROP TABLE IF EXISTS challenge_rules CASCADE;

COMMIT;

-- ============================================================================
-- POST-DROP VERIFICATION
-- ============================================================================
-- Run these to confirm tables are gone:
--
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN (
--   'challenge_accounts', 'challenge_rules', 'challenge_progress',
--   'funded_accounts', 'breach_events', 'risk_events', 'account_locks',
--   'payout_eligibility', 'payout_reviews', 'account_states', 'funding_events'
-- );
-- Expected result: 0 rows
--
-- Confirm protected tables still exist:
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN (
--   'trading_accounts', 'users', 'orders', 'payouts', 'payout_timeline_events',
--   'kyc_submissions', 'referrals', 'community_posts', 'notifications'
-- );
-- Expected result: 9 rows
