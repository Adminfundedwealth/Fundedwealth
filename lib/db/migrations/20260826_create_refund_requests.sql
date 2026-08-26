-- ============================================================
-- Migration: create public.refund_requests
-- FundedWealth Support-First Refund System
-- Canonical refund-case lifecycle table.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.refund_requests (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relationships
  order_id           TEXT NOT NULL REFERENCES public.orders(id) ON DELETE RESTRICT,
  user_id            UUID NOT NULL REFERENCES public.users(id)  ON DELETE RESTRICT,

  -- Financials
  refund_amount      NUMERIC(12, 2) NOT NULL,
  reason             TEXT           NOT NULL,

  -- Lifecycle status
  -- PENDING → UNDER_REVIEW → APPROVED/REJECTED → PROCESSING → REFUNDED/FAILED/CANCELLED
  status             TEXT NOT NULL DEFAULT 'PENDING'
                       CHECK (status IN (
                         'PENDING',
                         'UNDER_REVIEW',
                         'MORE_INFORMATION_REQUIRED',
                         'APPROVED',
                         'REJECTED',
                         'PROCESSING',
                         'REFUNDED',
                         'FAILED',
                         'CANCELLED'
                       )),

  -- Payment details (original payment + refund processing)
  payment_method     TEXT,            -- razorpay | upi_manual | crypto | bank_manual
  payment_reference  TEXT,            -- original payment ID / UTR
  gateway_refund_id  TEXT,            -- gateway's refund ID once processed
  refund_method      TEXT,            -- may differ from original if manual

  -- Support-first origin
  support_ticket_id  TEXT,            -- linked support ticket / conversation ID
  support_agent_id   TEXT,            -- staff member who created the case
  support_note       TEXT,            -- internal note from support at creation

  -- Admin decision
  reviewed_by        TEXT,            -- staff_members.id of reviewer
  reviewed_at        TIMESTAMPTZ,
  rejection_reason   TEXT,            -- structured rejection reason label
  rejection_note     TEXT,            -- optional free-text admin explanation

  -- Processing timestamps
  requested_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at       TIMESTAMPTZ,     -- when gateway refund was initiated
  completed_at       TIMESTAMPTZ,     -- when gateway confirmed completion

  -- Gateway response metadata (JSON)
  metadata           JSONB DEFAULT '{}',

  -- Audit timestamps
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prevent multiple active cases for the same order
-- "active" = anything that is not terminal (REFUNDED, REJECTED, CANCELLED, FAILED)
CREATE UNIQUE INDEX IF NOT EXISTS uq_refund_requests_active_order
  ON public.refund_requests (order_id)
  WHERE status NOT IN ('REFUNDED', 'REJECTED', 'CANCELLED', 'FAILED');

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_refund_requests_user_id    ON public.refund_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_order_id   ON public.refund_requests (order_id);
CREATE INDEX IF NOT EXISTS idx_refund_requests_status     ON public.refund_requests (status);
CREATE INDEX IF NOT EXISTS idx_refund_requests_created_at ON public.refund_requests (created_at DESC);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_refund_requests_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_refund_requests_updated_at ON public.refund_requests;
CREATE TRIGGER trg_refund_requests_updated_at
  BEFORE UPDATE ON public.refund_requests
  FOR EACH ROW EXECUTE FUNCTION public.set_refund_requests_updated_at();

-- RLS: service role bypasses; no direct customer access
ALTER TABLE public.refund_requests ENABLE ROW LEVEL SECURITY;

-- Allow backend service role full access (service role bypasses RLS automatically)
-- Admin OS uses service role key — no explicit policy needed.
-- Authenticated users (main site) have NO access to this table.
