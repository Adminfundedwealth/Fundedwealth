-- ═══════════════════════════════════════════════════════════════════════════════
-- FUNDEDWEALTH CLEANUP: DROP TERMINAL & ADMIN TABLES
-- Run this against Supabase AFTER deploying the cleaned codebase.
-- WARNING: This is IRREVERSIBLE. Back up data if needed before executing.
-- ═══════════════════════════════════════════════════════════════════════════════

-- ── TERMINAL EXECUTION ENGINE TABLES ─────────────────────────────────────────
DROP TABLE IF EXISTS execution_audits CASCADE;
DROP TABLE IF EXISTS position_modifications CASCADE;
DROP TABLE IF EXISTS order_modifications CASCADE;
DROP TABLE IF EXISTS order_brackets CASCADE;
DROP TABLE IF EXISTS executions CASCADE;
DROP TABLE IF EXISTS positions CASCADE;
DROP TABLE IF EXISTS trade_logs CASCADE;
DROP TABLE IF EXISTS trading_orders CASCADE;

-- ── MARKET DATA TABLES ───────────────────────────────────────────────────────
DROP TABLE IF EXISTS market_snapshots CASCADE;
DROP TABLE IF EXISTS market_ticks CASCADE;
DROP TABLE IF EXISTS market_ohlc CASCADE;
DROP TABLE IF EXISTS options_snapshots CASCADE;
DROP TABLE IF EXISTS options_contracts CASCADE;
DROP TABLE IF EXISTS expiry_calendar CASCADE;
DROP TABLE IF EXISTS oi_analytics CASCADE;
DROP TABLE IF EXISTS heatmap_data CASCADE;
DROP TABLE IF EXISTS fii_dii_flow CASCADE;
DROP TABLE IF EXISTS market_breadth CASCADE;
DROP TABLE IF EXISTS greeks_cache CASCADE;

-- ── LEGACY CHALLENGE ENGINE TABLES (if not already dropped) ──────────────────
DROP TABLE IF EXISTS breach_events CASCADE;
DROP TABLE IF EXISTS risk_events CASCADE;
DROP TABLE IF EXISTS account_locks CASCADE;
DROP TABLE IF EXISTS challenge_progress CASCADE;
DROP TABLE IF EXISTS challenge_rules CASCADE;
DROP TABLE IF EXISTS challenge_accounts CASCADE;
DROP TABLE IF EXISTS payout_eligibility CASCADE;
DROP TABLE IF EXISTS payout_reviews CASCADE;
DROP TABLE IF EXISTS funded_accounts CASCADE;
DROP TABLE IF EXISTS account_states CASCADE;
DROP TABLE IF EXISTS funding_events CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;

-- ── ADMIN-ONLY TABLES ────────────────────────────────────────────────────────
DROP TABLE IF EXISTS permissions CASCADE;

-- ═══════════════════════════════════════════════════════════════════════════════
-- TOTAL: 32 tables marked for DROP
-- ═══════════════════════════════════════════════════════════════════════════════
