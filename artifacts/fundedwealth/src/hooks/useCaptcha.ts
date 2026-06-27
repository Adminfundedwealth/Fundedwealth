/**
 * useCaptcha Hook
 *
 * Manages the full Turnstile captcha flow:
 * 1. Gets token from the Turnstile widget (via onVerify callback)
 * 2. Verifies with backend POST /api/captcha/verify before sensitive actions
 * 3. Blocks the action if verification fails (fail-closed)
 *
 * Usage in forms:
 *   const { token, onVerify, onExpire, verifyCaptcha, isVerified } = useCaptcha();
 *   // Render <TurnstileWidget onVerify={onVerify} onExpire={onExpire} />
 *   // Before submit: const ok = await verifyCaptcha("signup"); if (!ok) return;
 */

import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "";

export function useCaptcha() {
    const isDev = import.meta.env.DEV || !import.meta.env.VITE_TURNSTILE_SITE_KEY;

    const [token, setToken] = useState<string | null>(isDev ? "dev-bypass" : null);
    const [verified, setVerified] = useState(isDev);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onVerify = useCallback((t: string) => {
        setToken(t);
        setError(null);
    }, []);

    const onExpire = useCallback(() => {
        if (isDev) return; // Don't expire in dev mode
        setToken(null);
        setVerified(false);
        setError("CAPTCHA expired. Please complete it again.");
    }, [isDev]);

    const onError = useCallback(() => {
        if (isDev) return; // Don't error in dev mode
        setToken(null);
        setVerified(false);
        setError("CAPTCHA failed to load. Please refresh the page.");
    }, [isDev]);

    /**
     * Verify the captcha token with the backend.
     * Returns true if verified, false if rejected.
     * In dev mode (or missing site key), always returns true.
     */
    const verifyCaptcha = useCallback(async (action?: string): Promise<boolean> => {
        if (isDev) {
            setVerified(true);
            return true;
        }

        if (!token) {
            setError("Please complete the CAPTCHA verification.");
            return false;
        }

        setVerifying(true);
        setError(null);

        try {
            const res = await fetch(`${API_URL}/api/captcha/verify`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token, action: action || "unknown" }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setVerified(true);
                return true;
            }

            setError(data.error || "CAPTCHA verification failed. Please try again.");
            setToken(null);
            return false;
        } catch {
            setError("Network error. Please check your connection and try again.");
            return false;
        } finally {
            setVerifying(false);
        }
    }, [token, isDev]);

    const reset = useCallback(() => {
        setToken(isDev ? "dev-bypass" : null);
        setVerified(isDev);
        setError(null);
    }, [isDev]);

    return {
        token,
        verified,
        verifying,
        error,
        isVerified: isDev || !!token,
        onVerify,
        onExpire,
        onError,
        verifyCaptcha,
        reset,
    };
}

export default useCaptcha;
