-- ============================================================
-- Migration: Production KYC Flow (main-site DB)
-- Date: 2026-08-01
-- Applies to: public schema used by the API server (lib/db)
-- ============================================================

-- ── 1. Expand kyc_profiles.status to include new states ───────────────────────
-- Drizzle stores status as plain TEXT (no CHECK), so nothing to drop/re-add.
-- This migration is a no-op for the status column; it documents the contract.

-- ── 2. Ensure kyc_documents has the columns the new flow writes ───────────────

ALTER TABLE kyc_documents
  ADD COLUMN IF NOT EXISTS document_front_url  TEXT,
  ADD COLUMN IF NOT EXISTS document_back_url   TEXT,
  ADD COLUMN IF NOT EXISTS document_hash       TEXT,
  ADD COLUMN IF NOT EXISTS verification_status TEXT NOT NULL DEFAULT 'PENDING',
  ADD COLUMN IF NOT EXISTS is_latest_version   BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS version             INTEGER  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS mime_type           TEXT,
  ADD COLUMN IF NOT EXISTS file_size           INTEGER,
  ADD COLUMN IF NOT EXISTS uploaded_at         TIMESTAMPTZ DEFAULT NOW();

-- ── 3. Ensure kyc_profiles has review_notes ───────────────────────────────────

ALTER TABLE kyc_profiles
  ADD COLUMN IF NOT EXISTS review_notes TEXT;

-- ── 4. Index: fast lookup of latest version per profile + type ────────────────

CREATE INDEX IF NOT EXISTS idx_kyc_docs_profile_type_latest
  ON kyc_documents (kyc_profile_id, document_type)
  WHERE is_latest_version = TRUE;

-- ── 5. Unique constraint: one latest version per type per profile ─────────────

CREATE UNIQUE INDEX IF NOT EXISTS kyc_docs_profile_type_latest_uniq
  ON kyc_documents (kyc_profile_id, document_type)
  WHERE is_latest_version = TRUE;

-- ── 6. Index: fast KYC status queries on users ───────────────────────────────

CREATE INDEX IF NOT EXISTS idx_users_kyc_status
  ON users (kyc_status)
  WHERE kyc_status IN ('pending', 'verified', 'rejected');
