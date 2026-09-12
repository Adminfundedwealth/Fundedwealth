import { useState, useEffect } from "react";
import { getApiBase } from "../lib/api-base";

export interface DiscountConfigEntry {
  planType: string;
  displayLabel: string;
  code: string;
  discountPct: number;
  active: boolean;
}

/** Map of planType → entry for convenient lookup */
export type DiscountConfigMap = Record<string, DiscountConfigEntry>;

// getApiBase() strips dead domains and returns "" (relative) or a live URL
const _base = getApiBase();
const API_PREFIX = _base ? `${_base}/api` : "/api";

/**
 * Static fallback used before the API responds or on error.
 *
 * CANONICAL PLAN SALE DISCOUNTS — keep in sync with @workspace/products PRODUCTS:
 *   Flash   = 50%  (code BAPPA)
 *   Instant = 45%  (code BAPPA)
 *   1-Step  = 55%  (code BAPPA)
 *   2-Step  = 60%  (code BAPPA)
 *
 * These are BASE PLAN DISCOUNTS, not coupons.
 * DO NOT set discountPct to 80 here — that was the P0 bug root cause.
 */
const FALLBACK: DiscountConfigEntry[] = [
  { planType: "flash",   displayLabel: "Flash Funding",     code: "BAPPA", discountPct: 50, active: true },
  { planType: "instant", displayLabel: "Instant Funding",   code: "BAPPA", discountPct: 45, active: true },
  { planType: "1step",   displayLabel: "1-Step Evaluation", code: "BAPPA", discountPct: 55, active: true },
  { planType: "2step",   displayLabel: "2-Step Evaluation", code: "BAPPA", discountPct: 60, active: true },
];

function toMap(entries: DiscountConfigEntry[]): DiscountConfigMap {
  const m: DiscountConfigMap = {};
  for (const e of entries) m[e.planType] = e;
  return m;
}

let _cache: DiscountConfigEntry[] | null = null;
let _cacheTime = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

/**
 * Compute the discounted price from a base fee and discount percentage.
 * Uses Math.round for consistency with the server-side calculation.
 */
export function computeDiscountedPrice(baseFee: number, discountPct: number): number {
  return Math.round(baseFee * (1 - discountPct / 100));
}

/**
 * Format a number as INR price string using Indian numbering (lakh/crore).
 * E.g., 1999 → "₹1,999", 16974 → "₹16,974", 100000 → "₹1,00,000"
 */
export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

/**
 * useLiveDiscountConfig
 *
 * Fetches the active discount codes from the API and returns them as a map.
 * Results are cached for 60 s in module scope so multiple components don't
 * make duplicate requests. Falls back to static INDIA80 defaults instantly.
 */
export function useLiveDiscountConfig(): {
  config: DiscountConfigMap;
  entries: DiscountConfigEntry[];
  loading: boolean;
} {
  const [entries, setEntries] = useState<DiscountConfigEntry[]>(
    _cache ?? FALLBACK,
  );
  const [loading, setLoading] = useState(!_cache);

  useEffect(() => {
    // Still fresh from module cache — skip fetch
    if (_cache && Date.now() - _cacheTime < CACHE_TTL_MS) {
      setEntries(_cache);
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetch(`${API_PREFIX}/discount-config`, { credentials: "include" })
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        const data: DiscountConfigEntry[] = json.data ?? FALLBACK;
        _cache = data;
        _cacheTime = Date.now();
        setEntries(data);
      })
      .catch(() => {
        // silently fall back — FALLBACK is already set
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  return { config: toMap(entries), entries, loading };
}
