-- Rollback: Remove signed upload metadata from support attachments
-- Date: 2026-05-19

ALTER TABLE support_attachments
  DROP COLUMN IF EXISTS storage_key,
  DROP COLUMN IF EXISTS size,
  DROP COLUMN IF EXISTS expires_at,
  DROP COLUMN IF EXISTS scan_status;
