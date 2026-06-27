-- ============================================================================
-- Migration: Integration — provisioning_logs + admin_events
-- Date: 2026-06-27
-- Purpose: Create shared integration tables for Main Site ↔ Terminal ↔ Admin
-- Target: Shared Supabase project nysrxvpjdlvzvcawysvh
--
-- SAFETY: Uses IF NOT EXISTS guards. Safe to re-run.
-- OWNERSHIP:
--   provisioning_logs: Written by Main Site (INSERT pending), read/updated by Terminal
--   admin_events: Written by Main Site, read by Admin Panel
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- provisioning_logs — Bridge table between Main Site payments and Terminal
-- Main Site INSERTs 'pending' rows after payment confirmation.
-- Terminal polls/watches for pending rows, creates challenge_accounts + trading_accounts,
-- then updates status to 'completed' (or 'failed').
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS provisioning_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  plan TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  payment_ref TEXT,
  source TEXT NOT NULL DEFAULT 'website',
  status TEXT NOT NULL DEFAULT 'pending',       -- pending | processing | completed | failed
  error_message TEXT,
  -- Terminal populates these after provisioning
  trader_id UUID,                                -- terminal_traders.id
  challenge_account_id UUID,                     -- challenge_accounts.id
  trading_account_id UUID,                       -- trading_accounts.id
  -- Timestamps
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS provisioning_logs_order_id_idx ON provisioning_logs(order_id);
CREATE INDEX IF NOT EXISTS provisioning_logs_status_idx ON provisioning_logs(status);
CREATE INDEX IF NOT EXISTS provisioning_logs_created_at_idx ON provisioning_logs(created_at);
CREATE INDEX IF NOT EXISTS provisioning_logs_trading_account_id_idx ON provisioning_logs(trading_account_id);
CREATE INDEX IF NOT EXISTS provisioning_logs_challenge_account_id_idx ON provisioning_logs(challenge_account_id);

-- ══════════════════════════════════════════════════════════════════════════════
-- admin_events — Notification queue for Admin Panel
-- Main Site INSERTs events when actions require admin attention.
-- Admin Panel reads and acknowledges them.
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,                      -- payment_received, kyc_submitted, payout_requested, provisioning_failed
  order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount REAL,
  payment_method TEXT,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_events_event_type_idx ON admin_events(event_type);
CREATE INDEX IF NOT EXISTS admin_events_is_read_idx ON admin_events(is_read);
CREATE INDEX IF NOT EXISTS admin_events_user_id_idx ON admin_events(user_id);
CREATE INDEX IF NOT EXISTS admin_events_created_at_idx ON admin_events(created_at);
