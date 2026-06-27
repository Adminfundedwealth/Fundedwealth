-- Migration: KYC Duplicate Protection
-- Date: 2026-06-15
-- Purpose: Prevent same identity document from being used across multiple accounts

-- 1. Add document_hash column to kyc_documents for file deduplication
ALTER TABLE kyc_documents ADD COLUMN IF NOT EXISTS document_hash TEXT;

-- 2. Create unique index on (document_type, document_number) for kyc_submissions
-- Only enforces uniqueness for non-null, non-empty document numbers on approved/pending submissions
CREATE UNIQUE INDEX IF NOT EXISTS kyc_submissions_doc_type_number_uniq
  ON kyc_submissions (document_type, document_number)
  WHERE document_number IS NOT NULL
    AND document_number != ''
    AND status IN ('pending', 'approved', 'submitted');

-- 3. Create unique index on document_hash for kyc_documents
-- Only enforces on latest versions with non-null hashes
CREATE UNIQUE INDEX IF NOT EXISTS kyc_documents_hash_uniq
  ON kyc_documents (document_hash)
  WHERE document_hash IS NOT NULL
    AND is_latest_version = true;

-- 4. Create index for fast duplicate lookups
CREATE INDEX IF NOT EXISTS kyc_submissions_doc_number_idx
  ON kyc_submissions (document_number, document_type);

CREATE INDEX IF NOT EXISTS kyc_documents_hash_idx
  ON kyc_documents (document_hash)
  WHERE document_hash IS NOT NULL;

-- 5. Add document_hash to kyc_submissions as well (for the legacy submit flow)
ALTER TABLE kyc_submissions ADD COLUMN IF NOT EXISTS document_hash TEXT;

CREATE INDEX IF NOT EXISTS kyc_submissions_hash_idx
  ON kyc_submissions (document_hash)
  WHERE document_hash IS NOT NULL;
