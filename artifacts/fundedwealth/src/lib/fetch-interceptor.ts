/**
 * Global Fetch Interceptor
 *
 * Patches window.fetch to inject X-Device-Fingerprint header
 * on every request to our API backend. This ensures ALL API calls
 * (login, signup, payments, payouts) include the real FingerprintJS visitorId.
 *
 * Activated once by FingerprintProvider after visitorId is available.
 */

const API_HOSTS = [
    // Production API host, plus supported deployment and local API hosts.
    "api.fundedwealth.com",
    "fundedwealth-api-production.up.railway.app",
    "localhost:9000",
    "localhost:9010",
    "127.0.0.1:9000",
    "127.0.0.1:9010",
];

let installedVisitorId: string | null = null;
let originalFetch: typeof window.fetch | null = null;

/**
 * Install the fetch interceptor with the given visitorId.
 * Safe to call multiple times — updates the visitorId without re-patching.
 */
export function installFetchInterceptor(visitorId: string): void {
    installedVisitorId = visitorId;

    if (originalFetch) return; // Already patched

    originalFetch = window.fetch.bind(window);

    window.fetch = async function (input, init) {
        const url = typeof input === "string"
            ? input
            : input instanceof URL
                ? input.href
                : (input as Request).url;

        // Pass through without header injection — fingerprint sent via request body
        return originalFetch!(input, init);
    };
}

function isOurApi(url: string): boolean {
    try {
        // Relative URLs (e.g., "/api/auth/login") → always our API
        if (url.startsWith("/api")) return true;

        const parsed = new URL(url, window.location.origin);
        return API_HOSTS.some((h) => parsed.host === h || parsed.host.endsWith("." + h));
    } catch {
        return false;
    }
}
