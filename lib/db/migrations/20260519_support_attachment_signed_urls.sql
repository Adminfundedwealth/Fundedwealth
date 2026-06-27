-- Migration: Add signed upload metadata to support attachments
-- Date: 2026-05-19

ALTER TABLE support_attachments
  ADD COLUMN IF NOT EXISTS storage_key TEXT,
  ADD COLUMN IF NOT EXISTS size INTEGER,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS scan_status TEXT DEFAULT 'pending';
