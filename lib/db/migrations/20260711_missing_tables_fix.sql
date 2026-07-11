-- ============================================================================
-- Missing tables fix — run this in Supabase SQL Editor
-- Tables missing from DB causing 500 errors in production
-- Safe to re-run (IF NOT EXISTS guards)
-- ============================================================================

-- ── 1. economic_events ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS economic_events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  country TEXT NOT NULL,
  event_type TEXT NOT NULL,
  impact TEXT NOT NULL DEFAULT 'low',
  scheduled_at TIMESTAMPTZ NOT NULL,
  actual TEXT,
  forecast TEXT,
  previous TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  notified_24h BOOLEAN NOT NULL DEFAULT FALSE,
  notified_1h BOOLEAN NOT NULL DEFAULT FALSE,
  notified_15m BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS economic_events_scheduled_at_idx ON economic_events(scheduled_at);
CREATE INDEX IF NOT EXISTS economic_events_impact_idx ON economic_events(impact);
CREATE INDEX IF NOT EXISTS economic_events_country_idx ON economic_events(country);

-- ── 2. device_history ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  timezone TEXT,
  language TEXT,
  ip TEXT,
  country TEXT,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  seen_count INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS device_history_user_id_idx ON device_history(user_id);
CREATE INDEX IF NOT EXISTS device_history_fingerprint_idx ON device_history(device_fingerprint);
CREATE INDEX IF NOT EXISTS device_history_last_seen_idx ON device_history(last_seen);

-- ── 3. fraud_events (needed by fingerprint fraud detection) ─────────────────
CREATE TABLE IF NOT EXISTS fraud_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fraud_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  risk_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPEN',
  details JSONB,
  ip_address TEXT,
  device_fingerprint TEXT,
  country TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS fraud_events_user_id_idx ON fraud_events(user_id);
CREATE INDEX IF NOT EXISTS fraud_events_status_idx ON fraud_events(status);
CREATE INDEX IF NOT EXISTS fraud_events_fraud_type_idx ON fraud_events(fraud_type);

-- ── 4. risk_profiles (needed by fraud detection service) ────────────────────
CREATE TABLE IF NOT EXISTS risk_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  risk_score INTEGER NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'LOW',
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  block_reason TEXT,
  last_evaluated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS risk_profiles_user_id_idx ON risk_profiles(user_id);
CREATE INDEX IF NOT EXISTS risk_profiles_risk_level_idx ON risk_profiles(risk_level);

-- ── 5. referral_fraud_logs (needed by fingerprint fraud detection) ───────────
CREATE TABLE IF NOT EXISTS referral_fraud_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fraud_type TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS referral_fraud_logs_referrer_idx ON referral_fraud_logs(referrer_id);
CREATE INDEX IF NOT EXISTS referral_fraud_logs_referred_idx ON referral_fraud_logs(referred_user_id);

-- ── 6. ip_history (needed by IP intelligence service) ───────────────────────
CREATE TABLE IF NOT EXISTS ip_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ip TEXT NOT NULL,
  country TEXT,
  vpn_detected BOOLEAN NOT NULL DEFAULT FALSE,
  proxy_detected BOOLEAN NOT NULL DEFAULT FALSE,
  tor_detected BOOLEAN NOT NULL DEFAULT FALSE,
  datacenter_detected BOOLEAN NOT NULL DEFAULT FALSE,
  isp TEXT,
  trigger TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ip_history_user_id_idx ON ip_history(user_id);
CREATE INDEX IF NOT EXISTS ip_history_ip_idx ON ip_history(ip);

-- ── 7. velocity_events (needed by velocity service) ─────────────────────────
CREATE TABLE IF NOT EXISTS velocity_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ip_address TEXT,
  device_fingerprint TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS velocity_events_type_idx ON velocity_events(event_type);
CREATE INDEX IF NOT EXISTS velocity_events_created_at_idx ON velocity_events(created_at);
CREATE INDEX IF NOT EXISTS velocity_events_ip_idx ON velocity_events(ip_address);
