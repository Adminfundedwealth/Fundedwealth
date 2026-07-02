/**
 * Cloudflare Turnstile CAPTCHA Widget
 *
 * Free, privacy-friendly CAPTCHA replacement.
 * No usage limits. No cost. Ever.
 *
 * Docs: https://developers.cloudflare.com/turnstile/
 */

import { useEffect, useRef, useCallback, useState } from "react";

declare global {
    interface Window {
        turnstile?: {
            render: (container: string | HTMLElement, options: any) => string;
            reset: (widgetId: string) => void;
            remove: (widgetId: string) => void;
        };
        onTurnstileLoad?: () => void;
    }
}

interface TurnstileWidgetProps {
    onVerify: (token: string) => void;
    onExpire?: () => void;
    onError?: (error: string) => void;
    action?: string;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "compact";
    className?: string;
}

// Load script once globally — shared across widget instances
let scriptLoaded = false;
let scriptLoadFailed = false;
let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
    if (scriptLoaded) return Promise.resolve();
    if (scriptLoadFailed) return Promise.reject(new Error("Turnstile script previously failed to load"));
    if (scriptLoadPromise) return scriptLoadPromise;

    scriptLoadPromise = new Promise((resolve, reject) => {
        // Check if script already exists
        const existingScript = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
        if (existingScript && window.turnstile) {
            scriptLoaded = true;
            resolve();
            return;
        }

        window.onTurnstileLoad = () => {
            scriptLoaded = true;
            resolve();
        };

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            scriptLoadFailed = true;
            scriptLoadPromise = null; // allow retry
            reject(new Error("Failed to load Turnstile script"));
        };
        
        // Add timeout to handle script load issues
        const timeout = setTimeout(() => {
            if (!scriptLoaded) {
                scriptLoadFailed = true;
                scriptLoadPromise = null;
                reject(new Error("Turnstile script load timeout"));
            }
        }, 10000);

        script.onload = () => {
            clearTimeout(timeout);
            // Sometimes onload fires but window.onTurnstileLoad doesn't
            if (window.turnstile && !scriptLoaded) {
                scriptLoaded = true;
                resolve();
            }
        };

        document.head.appendChild(script);
    });

    return scriptLoadPromise;
}

/** Reset the global script-load state so next mount will retry */
function resetTurnstileScriptState() {
    scriptLoaded = false;
    scriptLoadFailed = false;
    scriptLoadPromise = null;
}

export function TurnstileWidget({
    onVerify,
    onExpire,
    onError,
    action,
    theme = "dark",
    size = "normal",
    className = "",
}: TurnstileWidgetProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [ready, setReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Only bypass CAPTCHA in local development (Vite dev server)
    const isDev = import.meta.env.DEV &&
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

    const tryLoadScript = useCallback(() => {
        if (isDev) return;
        setLoadError(null);
        loadTurnstileScript()
            .then(() => setReady(true))
            .catch((err: Error) => {
                const msg = "CAPTCHA failed to load. Please check your connection and retry.";
                setLoadError(msg);
                onError?.(msg);
                console.error("[Turnstile] Script load failed:", err.message);
            });
    }, [isDev, onError]);

    useEffect(() => {
        tryLoadScript();
    }, [tryLoadScript]);

    useEffect(() => {
        if (isDev || !ready || !containerRef.current || !window.turnstile) return;

        const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
        if (!siteKey) {
            const msg = "CAPTCHA is not configured. Please contact support.";
            console.error("[Turnstile] VITE_TURNSTILE_SITE_KEY not set — CAPTCHA will not render in production!");
            setLoadError(msg);
            onError?.(msg);
            return;
        }

        // CRITICAL FIX: Trim whitespace from sitekey (Cloudflare error 400020 if space exists)
        const cleanSiteKey = siteKey.trim().replace(/\s+/g, '');

        console.log('[Turnstile] Attempting render with sitekey:', cleanSiteKey.substring(0, 10) + '...');

        // Remove previous widget if re-rendering
        if (widgetIdRef.current) {
            try { 
                console.log('[Turnstile] Removing previous widget:', widgetIdRef.current);
                window.turnstile!.remove(widgetIdRef.current); 
            } catch (e) { 
                console.warn('[Turnstile] Failed to remove previous widget:', e);
            }
            widgetIdRef.current = null;
        }

        try {
            console.log('[Turnstile] Calling render with options:', {
                sitekey: cleanSiteKey.substring(0, 10) + '...',
                action,
                theme,
                size,
                hasCallback: !!onVerify,
                hasExpireCallback: !!onExpire,
            });

            widgetIdRef.current = window.turnstile!.render(containerRef.current, {
                sitekey: cleanSiteKey,
                callback: onVerify,
                "expired-callback": onExpire,
                "error-callback": (errCode: string) => {
                    console.error('[Turnstile] Error callback triggered:', errCode);
                    const msg = `CAPTCHA encountered an error (${errCode}). Please retry.`;
                    setLoadError(msg);
                    onError?.(msg);
                },
                action,
                theme,
                size,
            });

            console.log('[Turnstile] Render successful, widgetId:', widgetIdRef.current);
        } catch (err) {
            console.error('[Turnstile] Render exception:', err);
            const msg = "CAPTCHA failed to initialize. Please refresh the page.";
            setLoadError(msg);
            onError?.(msg);
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                try { 
                    console.log('[Turnstile] Cleanup: removing widget:', widgetIdRef.current);
                    window.turnstile.remove(widgetIdRef.current); 
                } catch { /* ignore */ }
                widgetIdRef.current = null;
            }
        };
    }, [isDev, ready, retryCount, onVerify, onExpire, onError, action, theme, size]);

    const handleRetry = useCallback(() => {
        resetTurnstileScriptState();
        setReady(false);
        setLoadError(null);
        setRetryCount(c => c + 1);
        tryLoadScript();
    }, [tryLoadScript]);

    // Only show bypass indicator in local development
    if (isDev) {
        return (
            <div className={className}>
                <div className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs text-center">
                    🛠️ Local dev — CAPTCHA skipped
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className={className}>
                <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center space-y-2">
                    <div>⚠️ {loadError}</div>
                    <button
                        type="button"
                        onClick={handleRetry}
                        className="underline hover:text-red-300 transition-colors font-semibold"
                    >
                        Retry CAPTCHA
                    </button>
                </div>
            </div>
        );
    }

    if (!ready) {
        return (
            <div className={className}>
                <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white/40 text-xs text-center flex items-center justify-center gap-2">
                    <span className="w-3 h-3 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                    Loading security check…
                </div>
            </div>
        );
    }

    return <div ref={containerRef} className={className} />;
}

/**
 * Hook to manage Turnstile token state.
 */
export function useTurnstile(action?: string) {
    const [token, setToken] = useState<string | null>(null);
    const [expired, setExpired] = useState(false);

    const onVerify = useCallback((t: string) => {
        setToken(t);
        setExpired(false);
    }, []);

    const onExpire = useCallback(() => {
        setToken(null);
        setExpired(true);
    }, []);

    const reset = useCallback(() => {
        setToken(null);
        setExpired(false);
    }, []);

    return { token, expired, onVerify, onExpire, reset, isVerified: !!token };
}

export default TurnstileWidget;
