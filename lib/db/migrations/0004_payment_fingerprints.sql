-- Migration: Payment Fingerprinting
-- Date: 2026-06-16
-- Detects same UPI/bank/crypto wallet used across multiple accounts

CREATE TABLE IF NOT EXISTS payment_fingerprints (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint_type TEXT NOT NULL,  -- upi, bank_account, crypto_wallet, razorpay_customer
  fingerprint_hash TEXT NOT NULL,  -- SHA-256 hash of normalized payment identifier
  source TEXT,                     -- where this was collected (payout, payment_details, checkout)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS payment_fp_user_idx ON payment_fingerprints(user_id);
CREATE INDEX IF NOT EXISTS payment_fp_hash_idx ON payment_fingerprints(fingerprint_hash);
CREATE INDEX IF NOT EXISTS payment_fp_type_hash_idx ON payment_fingerprints(fingerprint_type, fingerprint_hash);

-- Prevent exact duplicate (same user, same type, same hash)
CREATE UNIQUE INDEX IF NOT EXISTS payment_fp_user_type_hash_uniq
  ON payment_fingerprints(user_id, fingerprint_type, fingerprint_hash);
