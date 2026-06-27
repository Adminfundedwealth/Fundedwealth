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

// Load script once globally
let scriptLoaded = false;
let scriptLoadPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
    if (scriptLoaded) return Promise.resolve();
    if (scriptLoadPromise) return scriptLoadPromise;

    scriptLoadPromise = new Promise((resolve) => {
        window.onTurnstileLoad = () => {
            scriptLoaded = true;
            resolve();
        };

        const script = document.createElement("script");
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
    });

    return scriptLoadPromise;
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

    const isDev = import.meta.env.DEV || !import.meta.env.VITE_TURNSTILE_SITE_KEY;

    useEffect(() => {
        if (isDev) return; // Skip loading Turnstile script in dev mode
        loadTurnstileScript().then(() => setReady(true));
    }, [isDev]);

    useEffect(() => {
        if (isDev || !ready || !containerRef.current || !window.turnstile) return;

        const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
        if (!siteKey) {
            console.error("[Turnstile] VITE_TURNSTILE_SITE_KEY not set");
            return;
        }

        // Remove previous widget if re-rendering
        if (widgetIdRef.current) {
            window.turnstile!.remove(widgetIdRef.current);
        }

        widgetIdRef.current = window.turnstile!.render(containerRef.current, {
            sitekey: siteKey,
            callback: onVerify,
            "expired-callback": onExpire,
            "error-callback": onError,
            action,
            theme,
            size,
        });

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [isDev, ready, onVerify, onExpire, onError, action, theme, size]);

    // In dev mode, show a small indicator instead of the widget
    if (isDev) {
        return (
            <div className={className}>
                <div className="px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-xs text-center">
                    ✓ CAPTCHA bypassed (dev mode)
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
