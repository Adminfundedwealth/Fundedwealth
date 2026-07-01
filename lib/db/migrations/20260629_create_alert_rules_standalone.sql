-- ============================================================================
-- Migration: Create alert_rules table (standalone)
-- Date: 2026-06-29
-- Purpose: Standalone creation of alert_rules without INTEGER FK dependencies
-- Target: Shared Supabase project nysrxvpjdlvzvcawysvh
--
-- SAFETY: Uses IF NOT EXISTS. Safe to re-run.
-- SCOPE: Creates ONLY the alert_rules table. No FK references to users or
--        any Terminal-owned tables. No RLS. No triggers.
-- REASON: The original 002_observability_monitoring_system.sql is permanently
--         skipped due to INTEGER FK incompatibility with users(id) UUID.
--         This migration extracts ONLY the alert_rules table definition.
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_rules (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'SYSTEM_ERROR',
  condition JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  severity TEXT NOT NULL DEFAULT 'HIGH',
  notify_emails JSONB,
  notify_clerk_ids JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS alert_rules_event_type_idx ON alert_rules (event_type);
CREATE INDEX IF NOT EXISTS alert_rules_enabled_idx ON alert_rules (enabled);
CREATE INDEX IF NOT EXISTS alert_rules_created_at_idx ON alert_rules (created_at);
