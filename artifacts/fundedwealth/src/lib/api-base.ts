/**
 * Centralised API base URL resolver.
 *
 * Priority:
 *  1. VITE_API_URL
 *  2. VITE_API_BASE_URL — legacy alias
 *  3. The Railway production API service
 */

const LEGACY_API_HOST = "api.fundedwealth11.com";
const BROKEN_API_HOST = "api.fundedwealth.com";
const PRODUCTION_API_BASE = "https://fundedwealth-api-production.up.railway.app";

/** Domains that must be treated as if unset. */
const DEAD_DOMAINS = [
  "fundedwealth-api.onrender.com",  // Render service is suspended
];

function isDeadUrl(url: string | undefined): boolean {
  if (!url) return false;
  return DEAD_DOMAINS.some(d => url.includes(d));
}

export function resolveApiBase(fromEnv?: string): string {
  const configured = fromEnv || PRODUCTION_API_BASE;
  const normalized = configured.replace(
    new RegExp(`(^https?://)${LEGACY_API_HOST.replace(/\./g, "\\.")}(?=[:/]|$)`, "i"),
    "$1fundedwealth-api-production.up.railway.app",
  ).replace(
    new RegExp(`(^https?://)${BROKEN_API_HOST.replace(/\./g, "\\.")}(?=[:/]|$)`, "i"),
    `$1fundedwealth-api-production.up.railway.app`,
  );

  // Never fall back to a same-origin /api path on production hosting. This
  // endpoint must reach the Railway service even when a stale build secret is set.
  if (isDeadUrl(normalized)) return PRODUCTION_API_BASE;

  return normalized;
}

export function getApiBase(): string {
  return resolveApiBase(
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL,
  );
}
