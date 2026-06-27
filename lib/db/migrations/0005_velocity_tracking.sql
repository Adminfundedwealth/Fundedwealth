-- Migration: Velocity & Challenge Farming Detection
-- Date: 2026-06-16

CREATE TABLE IF NOT EXISTS velocity_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,         -- account_creation, challenge_purchase, payout_request, challenge_failure
  ip_address TEXT,
  device_fingerprint TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS velocity_events_user_idx ON velocity_events(user_id);
CREATE INDEX IF NOT EXISTS velocity_events_type_idx ON velocity_events(event_type);
CREATE INDEX IF NOT EXISTS velocity_events_ip_idx ON velocity_events(ip_address);
CREATE INDEX IF NOT EXISTS velocity_events_fp_idx ON velocity_events(device_fingerprint);
CREATE INDEX IF NOT EXISTS velocity_events_created_idx ON velocity_events(created_at);
CREATE INDEX IF NOT EXISTS velocity_events_type_created_idx ON velocity_events(event_type, created_at);
