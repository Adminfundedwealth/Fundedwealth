/**
 * discount-resolver.ts
 *
 * Resolves the server-authoritative PLAN SALE DISCOUNT and COUPON DISCOUNT
 * for a given plan type from the discount_config DB table (admin-controlled).
 *
 * ─── ARCHITECTURE (mirrors the two-tier pricing model in @workspace/products) ──
 *
 *   Tier 1 — Plan Sale Discount (always applied, per plan):
 *     Flash   = 50%   Instant = 45%   1-Step = 55%   2-Step = 60%
 *     Source: discount_config.discount_pct (admin can override via Admin panel)
 *     Fallback: PRODUCTS[planType].discountPct (static canonical values above)
 *
 *   Tier 2 — Coupon Discount (only when user enters a promo code):
 *     Applied on top of the already-discounted plan price.
 *     Source: @workspace/products COUPONS map
 *     Example: WELCOME=10% → 10% off the plan sale price
 *
 * ─── CRITICAL: Plan sale discount ≠ coupon discount ──────────────────────────
 *
 *   The old implementation conflated these: every plan used the code "INDIA80",
 *   and COUPONS["INDIA80"] = 80, so resolveDiscountPct() returned 80 for every
 *   plan. That was the root cause of the P0 bug.
 *
 *   This resolver now:
 *   1. Returns the plan sale discount from DB (or static fallback) — always.
 *   2. Applies a coupon discount on TOP of the plan price — only if user entered one.
 *   3. Never returns 80% from a coupon lookup for a base plan discount.
 */
import { db, discountConfig } from "@workspace/db";
import { getCouponDiscount, getPlanDiscountPct, type PlanType, PRODUCTS } from "@workspace/products";
import { logger } from "./logger";

interface LiveDiscount {
  code: string;
  discountPct: number;
  active: boolean;
}

// Simple in-memory cache with 30s TTL to avoid hitting DB on every request
let _cache: Record<string, LiveDiscount> = {};
let _cacheTime = 0;
const CACHE_TTL_MS = 30_000;

/**
 * Fetch all discount_config rows from the DB and cache them.
 */
async function refreshCache(): Promise<void> {
  try {
    const rows = await db.select().from(discountConfig);
    const map: Record<string, LiveDiscount> = {};
    for (const row of rows) {
      map[row.planType] = {
        code: row.code,
        discountPct: row.discountPct,
        active: row.active,
      };
    }
    _cache = map;
    _cacheTime = Date.now();
  } catch (err) {
    logger.error({ err }, "discount-resolver: failed to refresh cache");
    // Keep stale cache if we have one
  }
}

/**
 * Get the live PLAN SALE DISCOUNT for a given plan type.
 *
 * Returns the DB-configured discount if available, otherwise falls back
 * to the static canonical product discount (50/45/55/60).
 *
 * The returned discountPct is the BASE PLAN SALE DISCOUNT —
 * it is NOT a coupon discount.
 */
export async function getLiveDiscount(planType: PlanType): Promise<LiveDiscount> {
  if (Date.now() - _cacheTime > CACHE_TTL_MS) {
    await refreshCache();
  }

  const dbEntry = _cache[planType];
  if (dbEntry) return dbEntry;

  // Fallback to static canonical product defaults
  const product = PRODUCTS[planType];
  return {
    code: product?.code ?? "",
    discountPct: getPlanDiscountPct(planType),
    active: true,
  };
}

/**
 * Resolve the PLAN SALE DISCOUNT percentage for a plan.
 *
 * This is Tier 1 — the base discount applied to every purchase of this plan.
 * Flash=50, Instant=45, 1-Step=55, 2-Step=60 (unless admin overrides in DB).
 *
 * Call this when you need just the plan discount (no coupon logic).
 */
export async function resolvePlanDiscountPct(planType: PlanType): Promise<number> {
  const liveDiscount = await getLiveDiscount(planType);
  return liveDiscount.active ? liveDiscount.discountPct : getPlanDiscountPct(planType);
}

/**
 * Resolve the full pricing for a plan + optional coupon.
 *
 * Returns:
 *   planDiscountPct    — base plan sale discount (from DB / canonical)
 *   couponDiscountPct  — additional coupon discount (0 if no coupon or invalid)
 *
 * These two values are then consumed by computeTotal() in @workspace/products
 * to derive the final payable amount.
 *
 * @param planType   — "flash" | "instant" | "1step" | "2step"
 * @param couponCode — optional promo code entered by the user at checkout
 */
export async function resolveDiscountPct(
  planType: PlanType,
  couponCode?: string | null,
): Promise<number> {
  const liveDiscount = await getLiveDiscount(planType);

  // Tier 1: base plan sale discount (always applied)
  const planDiscountPct = liveDiscount.active
    ? liveDiscount.discountPct
    : getPlanDiscountPct(planType);

  if (!couponCode) {
    // No coupon — return only the plan sale discount
    return planDiscountPct;
  }

  // Tier 2: additional coupon on top of plan price
  // The coupon does NOT replace the plan discount.
  // We return only planDiscountPct here because computeTotal() handles
  // the coupon stacking separately via the couponCode parameter.
  // This value is passed as planDiscountOverride to computeTotal().
  return planDiscountPct;
}

/**
 * Resolve both the plan discount and coupon discount in a single call.
 * Use this when you need both values for price breakdown display.
 */
export async function resolveFullPricing(
  planType: PlanType,
  couponCode?: string | null,
): Promise<{ planDiscountPct: number; couponDiscountPct: number }> {
  const planDiscountPct = await resolveDiscountPct(planType, couponCode);
  const couponDiscountPct = getCouponDiscount(couponCode);
  return { planDiscountPct, couponDiscountPct };
}

/**
 * Invalidate the cache (called after admin updates discount_config).
 */
export function invalidateDiscountCache(): void {
  _cacheTime = 0;
}
