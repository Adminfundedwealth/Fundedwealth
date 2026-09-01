/**
 * Centralised API base URL resolver.
 *
 * Priority:
 *  1. VITE_API_URL  — only used if it is NOT the dead api.fundedwealth.com domain
 *  2. VITE_API_BASE_URL  — legacy alias, same guard
 *  3. Empty string ""  — falls back to RELATIVE /api/* URLs which Vercel
 *     proxies to the Railway backend via the /api rewrite in vercel.json.
 *
 * WHY THE GUARD:
 *   api.fundedwealth.com DNS currently points to Vercel (returns 404) — it is
 *   NOT the Railway Express server. Any build that had VITE_API_URL set to that
 *   domain will silently fail all API calls. Relative "" is always safe because
 *   vercel.json rewrites /api/* → fundedwealth-api-production.up.railway.app/api/*
 *
 * NEVER hard-code api.fundedwealth.com as a fallback anywhere in the codebase.
 * Use getApiBase() from this file everywhere instead.
 */

/** Dead domains that must be treated as if unset. */
const DEAD_DOMAINS = [
  "api.fundedwealth.com",
  "fundedwealth-api.onrender.com",  // Render service is suspended
];

function isDeadUrl(url: string | undefined): boolean {
  if (!url) return false;
  return DEAD_DOMAINS.some(d => url.includes(d));
}

export function getApiBase(): string {
  const fromEnv =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    "";

  // If the env var is set to a known-dead domain, ignore it and use relative.
  if (isDeadUrl(fromEnv)) return "";

  return fromEnv;
}
