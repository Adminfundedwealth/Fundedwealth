/**
 * Centralised API base URL resolver.
 *
 * Priority:
 *  1. VITE_API_URL  (set in Vercel / local .env)
 *  2. VITE_API_BASE_URL  (legacy alias)
 *  3. Railway production URL  (hard-coded fallback so relative "" never happens)
 *
 * NOTE: Never return "" — that causes fetch("/api/...") which goes to Vercel
 * instead of Railway, triggering 405 on POST endpoints.
 */
export const RAILWAY_API_BASE = "https://fundedwealth-api-production.up.railway.app";

export function getApiBase(): string {
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    RAILWAY_API_BASE
  );
}
