-- Migration: Fraud Enforcement Engine
-- Date: 2026-06-16
-- Adds risk scoring + account status enforcement to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'LOW';
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status TEXT DEFAULT 'active';

-- Index for quick filtering of restricted/suspended accounts
CREATE INDEX IF NOT EXISTS users_account_status_idx ON users(account_status);
CREATE INDEX IF NOT EXISTS users_risk_level_idx ON users(risk_level);
CREATE INDEX IF NOT EXISTS users_risk_score_idx ON users(risk_score);
