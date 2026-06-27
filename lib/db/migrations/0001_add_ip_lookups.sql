-- Migration: Add ip_lookups table for full IPQS response storage
-- Date: 2026-06-15

CREATE TABLE IF NOT EXISTS ip_lookups (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  ip TEXT NOT NULL,
  trigger TEXT NOT NULL,
  vpn_detected BOOLEAN NOT NULL DEFAULT FALSE,
  proxy_detected BOOLEAN NOT NULL DEFAULT FALSE,
  tor_detected BOOLEAN NOT NULL DEFAULT FALSE,
  datacenter_detected BOOLEAN NOT NULL DEFAULT FALSE,
  fraud_score REAL NOT NULL DEFAULT 0,
  country TEXT,
  region TEXT,
  city TEXT,
  isp TEXT,
  asn INTEGER,
  organization TEXT,
  connection_type TEXT,
  abuse_velocity TEXT,
  recent_abuse BOOLEAN NOT NULL DEFAULT FALSE,
  is_crawler BOOLEAN NOT NULL DEFAULT FALSE,
  mobile BOOLEAN NOT NULL DEFAULT FALSE,
  lookup_success BOOLEAN NOT NULL DEFAULT TRUE,
  lookup_source TEXT NOT NULL,
  error_message TEXT,
  raw_response JSONB,
  vpn_proxy_risk_score REAL NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ip_lookups_user_id_idx ON ip_lookups(user_id);
CREATE INDEX IF NOT EXISTS ip_lookups_ip_idx ON ip_lookups(ip);
CREATE INDEX IF NOT EXISTS ip_lookups_trigger_idx ON ip_lookups(trigger);
CREATE INDEX IF NOT EXISTS ip_lookups_fraud_score_idx ON ip_lookups(fraud_score);
CREATE INDEX IF NOT EXISTS ip_lookups_vpn_detected_idx ON ip_lookups(vpn_detected);
CREATE INDEX IF NOT EXISTS ip_lookups_created_at_idx ON ip_lookups(created_at);
