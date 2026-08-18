/**
 * discount-resolver.ts
 *
 * Resolves the live discount percentage for a given plan type from the
 * discount_config DB table (admin-controlled). Falls back to the static
 * @workspace/products COUPONS map if the DB row is missing.
 *
 * This is the single source of truth resolver for server-side pricing.
 */
import { db, discountConfig } from "@workspace/db";
import { getCouponDiscount, type PlanType, PRODUCTS } from "@workspace/products";
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
 * Get the live discount for a given plan type.
 * Returns the DB-configured discount if available, otherwise falls back
 * to the static product defaults.
 */
export async function getLiveDiscount(planType: PlanType): Promise<LiveDiscount> {
  if (Date.now() - _cacheTime > CACHE_TTL_MS) {
    await refreshCache();
  }

  const dbEntry = _cache[planType];
  if (dbEntry) return dbEntry;

  // Fallback to static product defaults
  const product = PRODUCTS[planType];
  return {
    code: product?.code ?? "INDIA80",
    discountPct: product ? parseInt(product.discount, 10) : 0,
    active: true,
  };
}

/**
 * Resolve the effective discount percentage for a plan + coupon code.
 *
 * Logic:
 * 1. Fetch the live discount config for the plan from the DB.
 * 2. If the provided couponCode matches the active DB code → use the DB discount %.
 * 3. Otherwise, fall back to the static COUPONS map (for legacy/other codes).
 *
 * This ensures admin changes are immediately reflected in pricing while
 * still supporting static coupon codes that aren't plan-specific.
 */
export async function resolveDiscountPct(
  planType: PlanType,
  couponCode?: string | null,
): Promise<number> {
  const liveDiscount = await getLiveDiscount(planType);

  if (!couponCode) {
    // No coupon provided — use the plan's active discount if active
    return liveDiscount.active ? liveDiscount.discountPct : 0;
  }

  const normalizedCode = couponCode.trim().toUpperCase();
  const normalizedDbCode = liveDiscount.code.trim().toUpperCase();

  // If the coupon matches the plan's active admin-configured code
  if (normalizedCode === normalizedDbCode && liveDiscount.active) {
    return liveDiscount.discountPct;
  }

  // Otherwise fall back to the static COUPONS map for other codes
  return getCouponDiscount(couponCode);
}

/**
 * Invalidate the cache (called after admin updates discount_config).
 */
export function invalidateDiscountCache(): void {
  _cacheTime = 0;
}
