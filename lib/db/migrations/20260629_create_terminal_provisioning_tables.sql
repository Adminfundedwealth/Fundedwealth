-- ============================================================================
-- Migration: Create terminal provisioning tables if they don't exist
-- Date: 2026-06-29
-- Purpose: Ensure challenge_accounts, trading_accounts, and terminal_traders
--          tables exist for the provisioning worker to write into.
-- SAFETY: Uses IF NOT EXISTS guards. Safe to re-run.
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- terminal_traders — Maps main-site users to terminal trader identities
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS terminal_traders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Trader',
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS terminal_traders_user_id_idx ON terminal_traders(user_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- challenge_accounts — Stores challenge/evaluation account details
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS challenge_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'flash_challenge',
  plan TEXT NOT NULL,
  initial_balance NUMERIC(12, 2) NOT NULL,
  current_balance NUMERIC(12, 2) NOT NULL,
  peak_balance NUMERIC(12, 2) NOT NULL,
  profit_target_pct NUMERIC(5, 2) NOT NULL DEFAULT 10,
  daily_loss_limit_pct NUMERIC(5, 2) NOT NULL DEFAULT 3,
  max_drawdown_pct NUMERIC(5, 2) NOT NULL DEFAULT 6,
  min_trading_days INTEGER NOT NULL DEFAULT 5,
  status TEXT NOT NULL DEFAULT 'active',   -- active | passed | failed | breached | expired
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  passed_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  fail_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS challenge_accounts_user_id_idx ON challenge_accounts(user_id);
CREATE INDEX IF NOT EXISTS challenge_accounts_status_idx ON challenge_accounts(status);

-- ══════════════════════════════════════════════════════════════════════════════
-- trading_accounts — Virtual trading accounts with balance tracking
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS trading_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_code TEXT NOT NULL UNIQUE,
  broker_provider TEXT NOT NULL DEFAULT 'fundedwealth',
  balance NUMERIC(12, 2) NOT NULL,
  available_margin NUMERIC(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',   -- active | suspended | closed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS trading_accounts_account_code_idx ON trading_accounts(account_code);
CREATE INDEX IF NOT EXISTS trading_accounts_status_idx ON trading_accounts(status);
