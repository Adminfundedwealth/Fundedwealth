-- ============================================================================
-- Migration: Terminal Sync Infrastructure
-- Date: 2026-07-04
-- Purpose: Add tables and constraints required for terminal sync endpoint
-- SAFETY: Fully reversible. Includes rollback script at bottom.
-- ============================================================================

-- ══════════════════════════════════════════════════════════════════════════════
-- sync_events — Idempotency tracking for terminal sync requests
-- ══════════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sync_events (
  sync_id VARCHAR PRIMARY KEY,
  account_id UUID NOT NULL,
  terminal_id UUID NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS sync_events_account_id_idx ON sync_events(account_id);
CREATE INDEX IF NOT EXISTS sync_events_processed_at_idx ON sync_events(processed_at);

COMMENT ON TABLE sync_events IS 'Tracks processed sync events for idempotency (prevents duplicate syncs)';
COMMENT ON COLUMN sync_events.sync_id IS 'Unique identifier for each sync request (provided by terminal)';
COMMENT ON COLUMN sync_events.account_id IS 'trading_accounts.id that was synced';
COMMENT ON COLUMN sync_events.terminal_id IS 'terminal_traders.id that sent the sync';

-- ══════════════════════════════════════════════════════════════════════════════
-- session_analytics — Add unique constraint for upsert operation
-- ══════════════════════════════════════════════════════════════════════════════
-- Check if constraint already exists (safe to re-run)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'session_analytics_session_id_unique'
  ) THEN
    ALTER TABLE session_analytics 
    ADD CONSTRAINT session_analytics_session_id_unique 
    UNIQUE (session_id);
    
    RAISE NOTICE 'Added unique constraint on session_analytics.session_id';
  ELSE
    RAISE NOTICE 'Unique constraint on session_analytics.session_id already exists';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- Data retention policy for sync_events (keep 30 days)
-- ══════════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION cleanup_old_sync_events()
RETURNS void AS $$
BEGIN
  DELETE FROM sync_events 
  WHERE processed_at < NOW() - INTERVAL '30 days';
  
  RAISE NOTICE 'Cleaned up sync_events older than 30 days';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_old_sync_events IS 'Removes sync event records older than 30 days (run daily via cron)';

-- ══════════════════════════════════════════════════════════════════════════════
-- Verification: Check tables and constraints
-- ══════════════════════════════════════════════════════════════════════════════
DO $$
DECLARE
  sync_events_count INT;
  constraint_exists BOOLEAN;
BEGIN
  -- Check sync_events table
  SELECT COUNT(*) INTO sync_events_count 
  FROM information_schema.tables 
  WHERE table_name = 'sync_events';
  
  IF sync_events_count = 1 THEN
    RAISE NOTICE '✓ sync_events table created';
  ELSE
    RAISE WARNING '✗ sync_events table NOT created';
  END IF;
  
  -- Check unique constraint
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'session_analytics_session_id_unique'
  ) INTO constraint_exists;
  
  IF constraint_exists THEN
    RAISE NOTICE '✓ session_analytics.session_id unique constraint added';
  ELSE
    RAISE WARNING '✗ unique constraint NOT added';
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════════════════════
-- ROLLBACK SCRIPT (run if migration needs to be reverted)
-- ══════════════════════════════════════════════════════════════════════════════
-- DROP TABLE IF EXISTS sync_events CASCADE;
-- ALTER TABLE session_analytics DROP CONSTRAINT IF EXISTS session_analytics_session_id_unique;
-- DROP FUNCTION IF EXISTS cleanup_old_sync_events();
