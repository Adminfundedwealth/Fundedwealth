/**
 * Centralised API base URL resolver.
 *
 * Priority:
 *  1. VITE_API_URL  (set in GitHub Actions secret / local .env)
 *  2. VITE_API_BASE_URL  (legacy alias)
 *  3. Empty string ""  — falls back to RELATIVE /api/* URLs which Vercel
 *     proxies to the real EC2 backend via the /api rewrite in vercel.json.
 *     This means the frontend works correctly even when VITE_API_URL is not
 *     set at build time, as long as vercel.json points /api/* to the EC2.
 *
 * NEVER return a dead domain (like api.fundedwealth.com if DNS isn't set up).
 * Relative "" is always safe — Vercel handles the proxy.
 */
export const RAILWAY_API_BASE = "";   // empty = use relative /api/* via Vercel proxy

export function getApiBase(): string {
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    RAILWAY_API_BASE
  );
}
