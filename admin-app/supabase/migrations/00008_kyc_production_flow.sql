-- ============================================================
-- Migration: Production KYC Flow
-- Date: 2026-08-01
-- Purpose: Expand KYC tables to support the full production flow:
--   • New statuses: under_review, resubmit_requested,
--                   additional_docs_required
--   • New document types: PAN, AADHAR_FRONT, AADHAR_BACK
--   • New columns: submitted_at, rejection_reason, review_notes
--   • Supabase Storage bucket + RLS for kyc-documents
-- ============================================================

-- ── 1. Expand kyc_submissions.status CHECK ────────────────────────────────────
-- Drop the old constraint and replace with the full set of statuses.

ALTER TABLE kyc_submissions
  DROP CONSTRAINT IF EXISTS kyc_submissions_status_check;

ALTER TABLE kyc_submissions
  ADD CONSTRAINT kyc_submissions_status_check
  CHECK (status IN (
    'pending',
    'under_review',
    'approved',
    'rejected',
    'resubmit_requested',
    'additional_docs_required'
  ));

-- ── 2. Add missing columns to kyc_submissions ─────────────────────────────────

ALTER TABLE kyc_submissions
  ADD COLUMN IF NOT EXISTS submitted_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
  ADD COLUMN IF NOT EXISTS review_notes     TEXT,
  ADD COLUMN IF NOT EXISTS document_type    VARCHAR(50),
  ADD COLUMN IF NOT EXISTS document_front_url TEXT,
  ADD COLUMN IF NOT EXISTS document_back_url  TEXT,
  ADD COLUMN IF NOT EXISTS selfie_url         TEXT,
  ADD COLUMN IF NOT EXISTS rejection_details  TEXT;

-- ── 3. Expand kyc_documents.document_type CHECK ───────────────────────────────
-- New document types: PAN, AADHAR_FRONT, AADHAR_BACK (plus legacy types).

ALTER TABLE kyc_documents
  DROP CONSTRAINT IF EXISTS kyc_documents_document_type_check;

ALTER TABLE kyc_documents
  ADD CONSTRAINT kyc_documents_document_type_check
  CHECK (document_type IN (
    'PAN',
    'AADHAR_FRONT',
    'AADHAR_BACK',
    'government_id_front',
    'government_id_back',
    'proof_of_address',
    'selfie_with_id',
    'additional'
  ));

-- ── 4. Add is_latest_version + version columns to kyc_documents ──────────────

ALTER TABLE kyc_documents
  ADD COLUMN IF NOT EXISTS is_latest_version BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS version           INTEGER  NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS document_front_url TEXT,
  ADD COLUMN IF NOT EXISTS verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (verification_status IN ('PENDING', 'VERIFIED', 'REJECTED')),
  ADD COLUMN IF NOT EXISTS document_hash     TEXT;

-- Index for fast latest-version lookups
CREATE INDEX IF NOT EXISTS idx_kyc_docs_latest
  ON kyc_documents (submission_id, document_type)
  WHERE is_latest_version = TRUE;

-- ── 5. Unique index: one active document per type per submission ──────────────
CREATE UNIQUE INDEX IF NOT EXISTS kyc_documents_submission_type_latest_uniq
  ON kyc_documents (submission_id, document_type)
  WHERE is_latest_version = TRUE;

-- ── 6. Index for fast queue queries ──────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_kyc_submitted_at
  ON kyc_submissions (submitted_at ASC NULLS LAST)
  WHERE status IN ('pending', 'under_review');

-- ── 7. Updated_at trigger for kyc_submissions ─────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'kyc_submissions_updated_at'
  ) THEN
    CREATE TRIGGER kyc_submissions_updated_at
      BEFORE UPDATE ON kyc_submissions
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- ── 8. Supabase Storage: kyc-documents bucket ─────────────────────────────────
-- Create the bucket if it does not exist.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'kyc-documents',
  'kyc-documents',
  FALSE,                                -- private bucket
  5242880,                              -- 5 MB max per file
  ARRAY['image/jpeg', 'image/png', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit    = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types,
      public             = FALSE;

-- ── 9. Storage RLS: users may only read/write their own folder ────────────────
-- Enable RLS on storage.objects (idempotent)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist so this migration is re-runnable
DROP POLICY IF EXISTS "kyc_owner_insert" ON storage.objects;
DROP POLICY IF EXISTS "kyc_owner_select" ON storage.objects;
DROP POLICY IF EXISTS "kyc_admin_all"    ON storage.objects;

-- Users may upload into kyc/<their-auth-user-id>/…
CREATE POLICY "kyc_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = 'kyc'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Users may read their own documents
CREATE POLICY "kyc_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'kyc-documents'
    AND (storage.foldername(name))[1] = 'kyc'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

-- Service role (admin / API server) gets full access
CREATE POLICY "kyc_admin_all" ON storage.objects
  FOR ALL TO service_role
  USING (bucket_id = 'kyc-documents');

-- ── 10. Grant admin staff select on kyc_submissions ──────────────────────────
-- (depends on your RLS setup; adjust role name as needed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'admin_user') THEN
    GRANT SELECT, UPDATE ON kyc_submissions TO admin_user;
    GRANT SELECT ON kyc_documents TO admin_user;
  END IF;
END $$;
