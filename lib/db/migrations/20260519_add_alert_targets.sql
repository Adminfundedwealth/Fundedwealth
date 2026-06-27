-- Migration: Add Discord & WhatsApp notification targets to alert_rules
-- Date: 2026-05-19
-- Adds JSONB columns for webhook URLs and phone numbers used by alert delivery

ALTER TABLE IF EXISTS alert_rules
  ADD COLUMN IF NOT EXISTS notify_discord_webhooks JSONB,
  ADD COLUMN IF NOT EXISTS notify_whatsapp_numbers JSONB;

-- No indexes required for these JSONB arrays; queries typically load rule rows by event_type/enabled

COMMENT ON COLUMN alert_rules.notify_discord_webhooks IS 'Array (JSONB) of Discord webhook URLs or objects';
COMMENT ON COLUMN alert_rules.notify_whatsapp_numbers IS 'Array (JSONB) of WhatsApp destination numbers or objects';
