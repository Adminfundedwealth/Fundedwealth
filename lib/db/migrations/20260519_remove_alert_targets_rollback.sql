-- Rollback Migration: Remove Discord & WhatsApp notification targets from alert_rules
-- Date: 2026-05-19
-- This migration drops the JSONB columns added by 20260519_add_alert_targets.sql
-- Safe: uses IF EXISTS and runs inside a transaction to avoid partial changes.

BEGIN;

ALTER TABLE IF EXISTS alert_rules
  DROP COLUMN IF EXISTS notify_discord_webhooks,
  DROP COLUMN IF EXISTS notify_whatsapp_numbers;

COMMIT;

-- Notes:
-- 1) This permanently removes any data stored in these columns. Backup before running if you need preservation.
-- 2) No dependent indexes are dropped because none were created for these columns.
-- 3) If your application code still references these columns, deploy a code rollback before or at the same time as this migration.
