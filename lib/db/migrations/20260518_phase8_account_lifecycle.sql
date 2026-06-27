-- ================================================================
-- PHASE 8: Account Lifecycle + Funding + Payout Automation
-- ================================================================
-- Implements funded account provisioning, lifecycle transitions, funding events,
-- payout review auditing, and account state history for the prop challenge lifecycle.

-- ================================================================
-- 1. funded_accounts
-- ================================================================
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

-- ================================================================
-- 2. account_states
-- ================================================================
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

-- ================================================================
-- 3. funding_events
-- ================================================================
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

-- ================================================================
-- 4. payout_reviews
-- ================================================================
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

-- ================================================================
-- Complete ✅
-- ================================================================
-- New Tables: 4
--   funded_accounts, account_states, funding_events, payout_reviews
-- Indexes: 12
-- ================================================================
