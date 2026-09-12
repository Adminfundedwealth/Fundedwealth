-- ─────────────────────────────────────────────────────────────────────────────
-- P0 FIX: Correct plan sale discounts in discount_config.
--
-- ROOT CAUSE: The original seed set all plan codes to "INDIA80" and used
-- wrong discount percentages (60/55/65/70). Because the COUPONS map had
-- INDIA80=80, the backend resolveDiscountPct() was returning 80% for every
-- plan when the coupon code matched. The checkout was applying 80% OFF instead
-- of the correct plan sale discounts.
--
-- CANONICAL PLAN SALE DISCOUNTS:
--   All plans use code BAPPA; discount percentages remain plan-specific.
--
-- These values match @workspace/products PRODUCTS[planType].discountPct.
-- The admin panel (Admin → Founder → Discount Config) can override these,
-- but must never set them to 80 unless that is the intentional sale discount.
--
-- NOTE: The "profit split" is 80% — that is a DIFFERENT business rule and
-- is stored in trading_account_rules / challenge_accounts, not here.
-- ─────────────────────────────────────────────────────────────────────────────

-- Ensure table exists (idempotent — safe if already created by earlier migration)
CREATE TABLE IF NOT EXISTS discount_config (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type    TEXT NOT NULL UNIQUE,
  code         TEXT NOT NULL,
  discount_pct INTEGER NOT NULL,
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by   TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Upsert correct values — this overwrites any stale rows from the old seed.
INSERT INTO discount_config (plan_type, code, discount_pct, active, updated_at)
VALUES
  ('flash',   'BAPPA', 50, TRUE, NOW()),
  ('instant', 'BAPPA', 45, TRUE, NOW()),
  ('1step',   'BAPPA', 55, TRUE, NOW()),
  ('2step',   'BAPPA', 60, TRUE, NOW())
ON CONFLICT (plan_type) DO UPDATE SET
  code         = EXCLUDED.code,
  discount_pct = EXCLUDED.discount_pct,
  active       = EXCLUDED.active,
  updated_at   = EXCLUDED.updated_at;

-- Verify the fix (will show in migration output)
SELECT plan_type, code, discount_pct, active
FROM   discount_config
ORDER  BY plan_type;
