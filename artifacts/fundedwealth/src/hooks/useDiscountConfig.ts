import { useState, useEffect } from "react";

export interface DiscountConfigEntry {
  planType: string;
  displayLabel: string;
  code: string;
  discountPct: number;
  active: boolean;
}

/** Map of planType → entry for convenient lookup */
export type DiscountConfigMap = Record<string, DiscountConfigEntry>;

const RAILWAY_API = "https://api.fundedwealth.com";
const API_PREFIX = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/api`
    : `${RAILWAY_API}/api`;

/** Static fallback used before the API responds or on error. */
const FALLBACK: DiscountConfigEntry[] = [
  { planType: "flash",   displayLabel: "Flash Funding",     code: "INDIA80", discountPct: 60, active: true },
  { planType: "instant", displayLabel: "Instant Funding",   code: "INDIA80", discountPct: 55, active: true },
  { planType: "1step",   displayLabel: "1-Step Evaluation", code: "INDIA80", discountPct: 65, active: true },
  { planType: "2step",   displayLabel: "2-Step Evaluation", code: "INDIA80", discountPct: 70, active: true },
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
