/**
 * Centralised API base URL resolver.
 *
 * Priority:
 *  1. VITE_API_URL
 *  2. VITE_API_BASE_URL — legacy alias
 *  3. https://api.fundedwealth.com — the production Railway API domain
 */

const LEGACY_API_HOST = "api.fundedwealth11.com";
const PRODUCTION_API_BASE = "https://api.fundedwealth.com";

/** Domains that must be treated as if unset. */
const DEAD_DOMAINS = [
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
    PRODUCTION_API_BASE;

  // Rewrite the previously misconfigured hostname to the production API domain.
  const normalized = fromEnv.replace(
    new RegExp(`(^https?://)${LEGACY_API_HOST.replace(/\./g, "\\.")}(?=[:/]|$)`, "i"),
    "$1api.fundedwealth.com",
  );

  // If the env var is set to a known-dead domain, ignore it and use relative.
  if (isDeadUrl(normalized)) return "";

  return normalized;
}
