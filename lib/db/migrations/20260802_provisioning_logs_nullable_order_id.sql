-- ============================================================================
-- Migration: Make provisioning_logs.order_id nullable
-- Date: 2026-08-02
-- Reason: Emergency provisions (founder_emergency source) have no real order row.
--         The previous NOT NULL + FK constraint caused "Failed query: INSERT INTO
--         provisioning_logs" errors when provisioning without an orderId.
-- ============================================================================

-- 1. Drop the foreign key constraint (it references orders.id, but emergency
--    provisions have no order — we store NULL instead of a fake ID).
ALTER TABLE provisioning_logs
  DROP CONSTRAINT IF EXISTS provisioning_logs_order_id_fkey;

-- 2. Make the column nullable
ALTER TABLE provisioning_logs
  ALTER COLUMN order_id DROP NOT NULL;

-- Done. Rows with order_id = NULL are emergency provisions.
-- Normal website purchases still populate order_id as before.
