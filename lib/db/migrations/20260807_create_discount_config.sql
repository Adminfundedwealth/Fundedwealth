-- ─────────────────────────────────────────────────────────────────────────────
-- discount_config: per-plan active coupon code managed by founders via admin.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS discount_config (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type    TEXT NOT NULL UNIQUE,          -- "flash" | "instant" | "1step" | "2step"
  code         TEXT NOT NULL,                 -- coupon code shown on site
  discount_pct INTEGER NOT NULL,              -- 60, 55, 65, 70 etc.
  active       BOOLEAN NOT NULL DEFAULT TRUE,
  updated_by   TEXT,                          -- staff member id who last changed it
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default values matching current INDIA80 setup
INSERT INTO discount_config (plan_type, code, discount_pct, active) VALUES
  ('flash',   'INDIA80', 60, TRUE),
  ('instant', 'INDIA80', 55, TRUE),
  ('1step',   'INDIA80', 65, TRUE),
  ('2step',   'INDIA80', 70, TRUE)
ON CONFLICT (plan_type) DO NOTHING;
