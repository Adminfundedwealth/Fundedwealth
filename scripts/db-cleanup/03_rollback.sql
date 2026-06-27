-- ============================================================================
-- ROLLBACK SQL — Restore Legacy Challenge Engine Tables from Backup
-- ============================================================================
-- Generated: 2026-06-21
-- Purpose: Restore all 11 tables from _backup_* copies if drop needs reversal.
-- Prerequisites: _backup_* tables must still exist (created by 01_backup.sql).
-- DO NOT EXECUTE UNLESS ROLLBACK IS REQUIRED.
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Recreate challenge_rules (leaf — no FK deps)
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenge_rules (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  value TEXT NOT NULL,
  "group" TEXT NOT NULL DEFAULT 'challenge',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

INSERT INTO challenge_rules SELECT * FROM _backup_challenge_rules ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 2: Recreate challenge_accounts (FK → challenge_rules)
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenge_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_rule_id UUID NOT NULL,
  account_name VARCHAR NOT NULL DEFAULT 'My Challenge',
  account_size NUMERIC(12, 2) NOT NULL,
  initial_balance NUMERIC(12, 2) NOT NULL,
  current_balance NUMERIC(12, 2) NOT NULL,
  current_equity NUMERIC(12, 2) NOT NULL,
  realized_pnl NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  unrealized_pnl NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  phase VARCHAR NOT NULL DEFAULT 'PHASE_1',
  profit_target_remaining NUMERIC(12, 2) NOT NULL,
  max_daily_loss_allowed NUMERIC(12, 2) NOT NULL,
  max_overall_loss_allowed NUMERIC(12, 2) NOT NULL,
  daily_dd NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  overall_dd NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  days_used INTEGER DEFAULT 0 NOT NULL,
  max_days_allowed INTEGER NOT NULL,
  min_trading_days INTEGER NOT NULL,
  trading_days_count INTEGER DEFAULT 0 NOT NULL,
  consistency NUMERIC(5, 2) DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  trading_started_at TIMESTAMP WITH TIME ZONE,
  funded_at TIMESTAMP WITH TIME ZONE,
  breached_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS challenge_accounts_user_id_idx ON challenge_accounts(user_id);
CREATE INDEX IF NOT EXISTS challenge_accounts_status_idx ON challenge_accounts(status);
CREATE INDEX IF NOT EXISTS challenge_accounts_phase_idx ON challenge_accounts(phase);
CREATE INDEX IF NOT EXISTS challenge_accounts_created_at_idx ON challenge_accounts(created_at);
CREATE INDEX IF NOT EXISTS challenge_accounts_expires_at_idx ON challenge_accounts(expires_at);

INSERT INTO challenge_accounts SELECT * FROM _backup_challenge_accounts ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 3: Recreate challenge_progress (FK → challenge_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_account_id UUID NOT NULL REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  day_start_balance NUMERIC(12, 2) NOT NULL,
  day_start_equity NUMERIC(12, 2) NOT NULL,
  day_end_balance NUMERIC(12, 2) NOT NULL,
  day_end_equity NUMERIC(12, 2) NOT NULL,
  daily_pnl NUMERIC(12, 2) NOT NULL,
  daily_dd NUMERIC(12, 2) NOT NULL,
  trades_executed INTEGER DEFAULT 0 NOT NULL,
  winning_trades INTEGER DEFAULT 0 NOT NULL,
  losing_trades INTEGER DEFAULT 0 NOT NULL,
  win_rate NUMERIC(5, 2) DEFAULT 0 NOT NULL,
  profit_target_progress NUMERIC(5, 2) DEFAULT 0 NOT NULL,
  profit_target_achieved BOOLEAN DEFAULT FALSE NOT NULL,
  rule_violations_count INTEGER DEFAULT 0 NOT NULL,
  consistency_ratio NUMERIC(5, 2) DEFAULT 0 NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'PASSING',
  health_score INTEGER DEFAULT 100 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS challenge_progress_challenge_account_id_idx ON challenge_progress(challenge_account_id);
CREATE INDEX IF NOT EXISTS challenge_progress_date_idx ON challenge_progress(date);
CREATE INDEX IF NOT EXISTS challenge_progress_day_number_idx ON challenge_progress(day_number);
CREATE INDEX IF NOT EXISTS challenge_progress_status_idx ON challenge_progress(status);

INSERT INTO challenge_progress SELECT * FROM _backup_challenge_progress ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 4: Recreate breach_events (FK → challenge_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS breach_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_account_id UUID NOT NULL REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  breach_type VARCHAR NOT NULL,
  severity VARCHAR NOT NULL DEFAULT 'WARNING',
  action VARCHAR NOT NULL,
  order_id UUID,
  position_id UUID,
  "position" JSONB,
  rule_violation JSONB,
  message VARCHAR NOT NULL,
  metadata JSONB,
  event_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS breach_events_challenge_account_id_idx ON breach_events(challenge_account_id);
CREATE INDEX IF NOT EXISTS breach_events_breach_type_idx ON breach_events(breach_type);
CREATE INDEX IF NOT EXISTS breach_events_severity_idx ON breach_events(severity);
CREATE INDEX IF NOT EXISTS breach_events_event_timestamp_idx ON breach_events(event_timestamp);
CREATE INDEX IF NOT EXISTS breach_events_created_at_idx ON breach_events(created_at);

INSERT INTO breach_events SELECT * FROM _backup_breach_events ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 5: Recreate risk_events (FK → challenge_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS risk_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_account_id UUID NOT NULL,
  user_id VARCHAR NOT NULL,
  risk_score VARCHAR NOT NULL,
  reason VARCHAR NOT NULL,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

INSERT INTO risk_events SELECT * FROM _backup_risk_events ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 6: Recreate account_locks (FK → challenge_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS account_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_account_id UUID NOT NULL REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  locked_by VARCHAR NOT NULL DEFAULT 'system',
  lock_type VARCHAR NOT NULL DEFAULT 'TEMP',
  reason VARCHAR NOT NULL,
  details JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

INSERT INTO account_locks SELECT * FROM _backup_account_locks ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 7: Recreate payout_eligibility (FK → challenge_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payout_eligibility (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_account_id UUID NOT NULL REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  eligibility_status VARCHAR NOT NULL DEFAULT 'NOT_ELIGIBLE',
  reason_if_blocked VARCHAR,
  profit_target_met BOOLEAN DEFAULT FALSE NOT NULL,
  consistency_met BOOLEAN DEFAULT FALSE NOT NULL,
  min_trading_days_met BOOLEAN DEFAULT FALSE NOT NULL,
  dd_limit_met BOOLEAN DEFAULT FALSE NOT NULL,
  rule_violations_free BOOLEAN DEFAULT FALSE NOT NULL,
  account_size NUMERIC(12, 2) NOT NULL,
  profit_earned NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  fundable_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  funded_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  withdrawn_amount NUMERIC(12, 2) DEFAULT 0 NOT NULL,
  application_submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by VARCHAR,
  admin_notes VARCHAR,
  funded_at TIMESTAMP WITH TIME ZONE,
  withdrawn_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS payout_eligibility_challenge_account_id_idx ON payout_eligibility(challenge_account_id);
CREATE INDEX IF NOT EXISTS payout_eligibility_eligibility_status_idx ON payout_eligibility(eligibility_status);
CREATE INDEX IF NOT EXISTS payout_eligibility_created_at_idx ON payout_eligibility(created_at);
CREATE INDEX IF NOT EXISTS payout_eligibility_reviewed_at_idx ON payout_eligibility(reviewed_at);

INSERT INTO payout_eligibility SELECT * FROM _backup_payout_eligibility ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 8: Recreate funded_accounts (FK → challenge_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS funded_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_account_id UUID NOT NULL REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  funded_account_name VARCHAR NOT NULL DEFAULT 'Funded Account',
  account_size NUMERIC(12,2) NOT NULL,
  initial_balance NUMERIC(12,2) NOT NULL,
  current_balance NUMERIC(12,2) NOT NULL,
  current_equity NUMERIC(12,2) NOT NULL,
  funded_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE',
  provisioning_status VARCHAR NOT NULL DEFAULT 'PENDING',
  active_rules JSONB,
  external_account_ref VARCHAR,
  provisioned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS funded_accounts_challenge_account_id_idx ON funded_accounts(challenge_account_id);
CREATE INDEX IF NOT EXISTS funded_accounts_user_id_idx ON funded_accounts(user_id);
CREATE INDEX IF NOT EXISTS funded_accounts_status_idx ON funded_accounts(status);

INSERT INTO funded_accounts SELECT * FROM _backup_funded_accounts ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 9: Recreate account_states (FK → challenge_accounts + funded_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS account_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_account_id UUID NOT NULL REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  funded_account_id UUID REFERENCES funded_accounts(id) ON DELETE SET NULL,
  from_state VARCHAR NOT NULL,
  to_state VARCHAR NOT NULL,
  trigger VARCHAR NOT NULL,
  reason VARCHAR,
  actor VARCHAR NOT NULL DEFAULT 'system',
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS account_states_user_id_idx ON account_states(user_id);
CREATE INDEX IF NOT EXISTS account_states_challenge_account_id_idx ON account_states(challenge_account_id);
CREATE INDEX IF NOT EXISTS account_states_to_state_idx ON account_states(to_state);

INSERT INTO account_states SELECT * FROM _backup_account_states ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 10: Recreate funding_events (FK → challenge_accounts + funded_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS funding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_account_id UUID REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  funded_account_id UUID REFERENCES funded_accounts(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL,
  event_status VARCHAR NOT NULL DEFAULT 'COMPLETED',
  payment_method VARCHAR,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  transaction_id VARCHAR,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS funding_events_user_id_idx ON funding_events(user_id);
CREATE INDEX IF NOT EXISTS funding_events_challenge_account_id_idx ON funding_events(challenge_account_id);
CREATE INDEX IF NOT EXISTS funding_events_funded_account_id_idx ON funding_events(funded_account_id);
CREATE INDEX IF NOT EXISTS funding_events_event_type_idx ON funding_events(event_type);

INSERT INTO funding_events SELECT * FROM _backup_funding_events ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 11: Recreate payout_reviews (FK → payout_eligibility + challenge_accounts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payout_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_eligibility_id UUID NOT NULL REFERENCES payout_eligibility(id) ON DELETE CASCADE,
  challenge_account_id UUID NOT NULL REFERENCES challenge_accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_type VARCHAR NOT NULL DEFAULT 'AUTO',
  decision VARCHAR NOT NULL,
  decision_reason VARCHAR,
  kyc_status VARCHAR,
  consistency_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  rule_check JSONB,
  reviewer_id VARCHAR,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  manual_override BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS payout_reviews_challenge_account_id_idx ON payout_reviews(challenge_account_id);
CREATE INDEX IF NOT EXISTS payout_reviews_decision_idx ON payout_reviews(decision);
CREATE INDEX IF NOT EXISTS payout_reviews_review_type_idx ON payout_reviews(review_type);

INSERT INTO payout_reviews SELECT * FROM _backup_payout_reviews ON CONFLICT DO NOTHING;

-- ============================================================================
-- STEP 12: Re-add FK columns to trading_orders (if needed)
-- ============================================================================
ALTER TABLE trading_orders ADD COLUMN IF NOT EXISTS challenge_account_id UUID REFERENCES challenge_accounts(id) ON DELETE SET NULL;
ALTER TABLE trading_orders ADD COLUMN IF NOT EXISTS rule_check_result JSONB;

COMMIT;

-- ============================================================================
-- POST-ROLLBACK VERIFICATION
-- ============================================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- AND table_name IN (
--   'challenge_accounts', 'challenge_rules', 'challenge_progress',
--   'funded_accounts', 'breach_events', 'risk_events', 'account_locks',
--   'payout_eligibility', 'payout_reviews', 'account_states', 'funding_events'
-- );
-- Expected result: 11 rows
