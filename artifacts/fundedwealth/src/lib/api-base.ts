/**
 * Centralised API base URL resolver.
 *
 * Priority:
 *  1. VITE_API_URL  (set in GitHub Actions secret / local .env — MUST point to the
 *                    real EC2 backend hostname/IP, e.g. http://13.x.x.x:8080)
 *  2. VITE_API_BASE_URL  (legacy alias)
 *  3. Hard-coded fallback — update this if the EC2 Elastic IP/hostname changes
 *     and VITE_API_URL cannot be set in time.
 *
 * NOTE: If api.fundedwealth.com DNS is not configured, set VITE_API_URL in
 * GitHub Actions secrets to the EC2 public hostname or Elastic IP directly.
 * All frontend API calls route through this resolver.
 */
export const RAILWAY_API_BASE = "https://api.fundedwealth.com";

export function getApiBase(): string {
  return (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    RAILWAY_API_BASE
  );
}
