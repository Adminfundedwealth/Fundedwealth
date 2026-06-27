-- Fraud Detection System Schema
-- This migration creates all tables needed for the fraud detection system

-- Create fraud_events table
CREATE TABLE IF NOT EXISTS fraud_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  account_id TEXT,
  fraud_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'MEDIUM',
  risk_score DECIMAL(5,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'OPEN',
  details JSONB,
  ip_address TEXT,
  device_fingerprint TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for fraud_events
CREATE INDEX IF NOT EXISTS fraud_events_user_id_idx ON fraud_events(user_id);
CREATE INDEX IF NOT EXISTS fraud_events_ip_address_idx ON fraud_events(ip_address);
CREATE INDEX IF NOT EXISTS fraud_events_fraud_type_idx ON fraud_events(fraud_type);
CREATE INDEX IF NOT EXISTS fraud_events_status_idx ON fraud_events(status);
CREATE INDEX IF NOT EXISTS fraud_events_created_at_idx ON fraud_events(created_at);

-- Create risk_profiles table
CREATE TABLE IF NOT EXISTS risk_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  risk_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  risk_level TEXT NOT NULL DEFAULT 'LOW',
  ip_risk_score DECIMAL(5,2) DEFAULT 0,
  device_risk_score DECIMAL(5,2) DEFAULT 0,
  behavior_risk_score DECIMAL(5,2) DEFAULT 0,
  vpn_proxy_risk_score DECIMAL(5,2) DEFAULT 0,
  kyc_risk_score DECIMAL(5,2) DEFAULT 0,
  referral_risk_score DECIMAL(5,2) DEFAULT 0,
  trading_risk_score DECIMAL(5,2) DEFAULT 0,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  payout_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  requires_manual_review BOOLEAN NOT NULL DEFAULT FALSE,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for risk_profiles
CREATE INDEX IF NOT EXISTS risk_profiles_user_id_idx ON risk_profiles(user_id);
CREATE INDEX IF NOT EXISTS risk_profiles_risk_level_idx ON risk_profiles(risk_level);
CREATE INDEX IF NOT EXISTS risk_profiles_is_blocked_idx ON risk_profiles(is_blocked);

-- Create device_history table
CREATE TABLE IF NOT EXISTS device_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  device_fingerprint TEXT NOT NULL,
  browser TEXT,
  os TEXT,
  screen_size TEXT,
  timezone TEXT,
  language TEXT,
  ip TEXT,
  country TEXT,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  seen_count INTEGER DEFAULT 1 NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for device_history
CREATE INDEX IF NOT EXISTS device_history_user_id_idx ON device_history(user_id);
CREATE INDEX IF NOT EXISTS device_history_fingerprint_idx ON device_history(device_fingerprint);
CREATE INDEX IF NOT EXISTS device_history_last_seen_idx ON device_history(last_seen);

-- Create ip_history table
CREATE TABLE IF NOT EXISTS ip_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  ip TEXT NOT NULL,
  country TEXT,
  vpn_detected BOOLEAN NOT NULL DEFAULT FALSE,
  proxy_detected BOOLEAN NOT NULL DEFAULT FALSE,
  tor_detected BOOLEAN NOT NULL DEFAULT FALSE,
  datacenter_detected BOOLEAN NOT NULL DEFAULT FALSE,
  isp TEXT,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for ip_history
CREATE INDEX IF NOT EXISTS ip_history_user_id_idx ON ip_history(user_id);
CREATE INDEX IF NOT EXISTS ip_history_ip_idx ON ip_history(ip);
CREATE INDEX IF NOT EXISTS ip_history_vpn_detected_idx ON ip_history(vpn_detected);
CREATE INDEX IF NOT EXISTS ip_history_created_at_idx ON ip_history(created_at);

-- Create referral_fraud_logs table
CREATE TABLE IF NOT EXISTS referral_fraud_logs (
  id SERIAL PRIMARY KEY,
  referrer_id INTEGER NOT NULL,
  referred_user_id INTEGER NOT NULL,
  fraud_reason TEXT NOT NULL,
  risk_score DECIMAL(5,2) NOT NULL,
  ip_address TEXT,
  device_fingerprint TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for referral_fraud_logs
CREATE INDEX IF NOT EXISTS referral_fraud_logs_referrer_id_idx ON referral_fraud_logs(referrer_id);
CREATE INDEX IF NOT EXISTS referral_fraud_logs_referred_user_id_idx ON referral_fraud_logs(referred_user_id);
CREATE INDEX IF NOT EXISTS referral_fraud_logs_fraud_reason_idx ON referral_fraud_logs(fraud_reason);
CREATE INDEX IF NOT EXISTS referral_fraud_logs_created_at_idx ON referral_fraud_logs(created_at);

-- Enable Row Level Security (RLS) for fraud tables
ALTER TABLE fraud_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ip_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_fraud_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fraud_events (admins only)
CREATE POLICY "Admins can view all fraud events" ON fraud_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- RLS Policies for risk_profiles (admins only)
CREATE POLICY "Admins can view all risk profiles" ON risk_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- RLS Policies for device_history (users can view their own)
CREATE POLICY "Users can view their own device history" ON device_history
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- RLS Policies for ip_history (admins only)
CREATE POLICY "Admins can view all ip history" ON ip_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- RLS Policies for referral_fraud_logs (admins only)
CREATE POLICY "Admins can view all referral fraud logs" ON referral_fraud_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );
