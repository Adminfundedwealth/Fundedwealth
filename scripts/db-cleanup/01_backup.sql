-- ============================================================================
-- BACKUP SQL — Legacy Challenge Engine Tables
-- ============================================================================
-- Generated: 2026-06-21
-- Purpose: Create backup copies of all 11 tables before dropping.
-- Run this BEFORE executing 02_drop.sql.
-- DO NOT EXECUTE WITHOUT EXPLICIT APPROVAL.
-- ============================================================================

-- Verify these protected tables are NOT in our drop list:
-- ✓ trading_accounts — UNTOUCHED
-- ✓ users — UNTOUCHED
-- ✓ orders — UNTOUCHED
-- ✓ payouts — UNTOUCHED
-- ✓ payout_timeline_events — UNTOUCHED
-- ✓ kyc_submissions — UNTOUCHED
-- ✓ kyc_profiles — UNTOUCHED
-- ✓ kyc_documents — UNTOUCHED
-- ✓ kyc_reviews — UNTOUCHED
-- ✓ referrals — UNTOUCHED
-- ✓ community_posts — UNTOUCHED
-- ✓ community_comments — UNTOUCHED
-- ✓ community_likes — UNTOUCHED
-- ✓ manual_payments — UNTOUCHED
-- ✓ notifications — UNTOUCHED

BEGIN;

-- 1. payout_reviews (FK → payout_eligibility, challenge_accounts)
CREATE TABLE IF NOT EXISTS _backup_payout_reviews AS SELECT * FROM payout_reviews;

-- 2. payout_eligibility (FK → challenge_accounts)
CREATE TABLE IF NOT EXISTS _backup_payout_eligibility AS SELECT * FROM payout_eligibility;

-- 3. account_states (FK → challenge_accounts, funded_accounts)
CREATE TABLE IF NOT EXISTS _backup_account_states AS SELECT * FROM account_states;

-- 4. funding_events (FK → challenge_accounts, funded_accounts)
CREATE TABLE IF NOT EXISTS _backup_funding_events AS SELECT * FROM funding_events;

-- 5. funded_accounts (FK → challenge_accounts)
CREATE TABLE IF NOT EXISTS _backup_funded_accounts AS SELECT * FROM funded_accounts;

-- 6. breach_events (FK → challenge_accounts)
CREATE TABLE IF NOT EXISTS _backup_breach_events AS SELECT * FROM breach_events;

-- 7. risk_events (FK → challenge_accounts)
CREATE TABLE IF NOT EXISTS _backup_risk_events AS SELECT * FROM risk_events;

-- 8. account_locks (FK → challenge_accounts)
CREATE TABLE IF NOT EXISTS _backup_account_locks AS SELECT * FROM account_locks;

-- 9. challenge_progress (FK → challenge_accounts)
CREATE TABLE IF NOT EXISTS _backup_challenge_progress AS SELECT * FROM challenge_progress;

-- 10. challenge_accounts (FK → challenge_rules via challenge_rule_id)
CREATE TABLE IF NOT EXISTS _backup_challenge_accounts AS SELECT * FROM challenge_accounts;

-- 11. challenge_rules (leaf — no FK dependencies)
CREATE TABLE IF NOT EXISTS _backup_challenge_rules AS SELECT * FROM challenge_rules;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERY — Run after backup to confirm row counts match
-- ============================================================================
-- SELECT 'payout_reviews' AS tbl, (SELECT COUNT(*) FROM payout_reviews) AS original, (SELECT COUNT(*) FROM _backup_payout_reviews) AS backup
-- UNION ALL SELECT 'payout_eligibility', (SELECT COUNT(*) FROM payout_eligibility), (SELECT COUNT(*) FROM _backup_payout_eligibility)
-- UNION ALL SELECT 'account_states', (SELECT COUNT(*) FROM account_states), (SELECT COUNT(*) FROM _backup_account_states)
-- UNION ALL SELECT 'funding_events', (SELECT COUNT(*) FROM funding_events), (SELECT COUNT(*) FROM _backup_funding_events)
-- UNION ALL SELECT 'funded_accounts', (SELECT COUNT(*) FROM funded_accounts), (SELECT COUNT(*) FROM _backup_funded_accounts)
-- UNION ALL SELECT 'breach_events', (SELECT COUNT(*) FROM breach_events), (SELECT COUNT(*) FROM _backup_breach_events)
-- UNION ALL SELECT 'risk_events', (SELECT COUNT(*) FROM risk_events), (SELECT COUNT(*) FROM _backup_risk_events)
-- UNION ALL SELECT 'account_locks', (SELECT COUNT(*) FROM account_locks), (SELECT COUNT(*) FROM _backup_account_locks)
-- UNION ALL SELECT 'challenge_progress', (SELECT COUNT(*) FROM challenge_progress), (SELECT COUNT(*) FROM _backup_challenge_progress)
-- UNION ALL SELECT 'challenge_accounts', (SELECT COUNT(*) FROM challenge_accounts), (SELECT COUNT(*) FROM _backup_challenge_accounts)
-- UNION ALL SELECT 'challenge_rules', (SELECT COUNT(*) FROM challenge_rules), (SELECT COUNT(*) FROM _backup_challenge_rules);
