/**
 * FingerprintJS Open Source Integration
 *
 * Generates a stable visitorId using the free open-source FingerprintJS library.
 * No API key required. No paid service. Runs entirely client-side.
 *
 * SDK: @fingerprintjs/fingerprintjs (MIT license, free forever)
 * Docs: https://github.com/nicknisi/fingerprintjs
 */

import FingerprintJS from "@fingerprintjs/fingerprintjs";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FingerprintData {
    visitorId: string;
    confidence: number;
    browser: string;
    os: string;
    timezone: string;
    screenResolution: string;
    language: string;
    platform: string;
    hardwareConcurrency: number;
    touchSupport: boolean;
}

// ─── Singleton Agent ─────────────────────────────────────────────────────────

let agentPromise: ReturnType<typeof FingerprintJS.load> | null = null;

function getAgent() {
    if (!agentPromise) {
        agentPromise = FingerprintJS.load();
    }
    return agentPromise;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Get the visitor fingerprint. Runs entirely client-side, no network calls.
 */
export async function getFingerprint(): Promise<FingerprintData> {
    const agent = await getAgent();
    const result = await agent.get();

    return {
        visitorId: result.visitorId,
        confidence: result.confidence.score,
        browser: navigator.userAgent.includes("Chrome")
            ? "Chrome"
            : navigator.userAgent.includes("Firefox")
                ? "Firefox"
                : navigator.userAgent.includes("Safari")
                    ? "Safari"
                    : "Other",
        os: navigator.platform || "unknown",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenResolution: `${screen.width}x${screen.height}`,
        language: navigator.language || "en",
        platform: navigator.platform || "unknown",
        hardwareConcurrency: navigator.hardwareConcurrency ?? 0,
        touchSupport: navigator.maxTouchPoints > 0,
    };
}

/**
 * Get just the visitorId string.
 */
export async function getVisitorId(): Promise<string> {
    try {
        const fp = await getFingerprint();
        return fp.visitorId;
    } catch {
        return generateFallbackFingerprint();
    }
}

/**
 * Fallback fingerprint if the library fails to load.
 */
function generateFallbackFingerprint(): string {
    const signals = [
        navigator.userAgent,
        navigator.language,
        `${screen.width}x${screen.height}`,
        Intl.DateTimeFormat().resolvedOptions().timeZone,
        navigator.hardwareConcurrency?.toString() || "0",
        navigator.maxTouchPoints?.toString() || "0",
    ].join("|");

    let hash = 0;
    for (let i = 0; i < signals.length; i++) {
        const char = signals.charCodeAt(i);
        hash = ((hash << 5) - hash + char) | 0;
    }
    return `fallback_${Math.abs(hash).toString(36)}`;
}

/**
 * Send fingerprint data to the backend for storage and fraud detection.
 */
export async function reportFingerprint(
    apiBaseUrl: string,
    authToken: string | null
): Promise<void> {
    try {
        const fp = await getFingerprint();

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };
        if (authToken) {
            headers["Authorization"] = `Bearer ${authToken}`;
        }

        await fetch(`${apiBaseUrl}/api/fingerprint/report`, {
            method: "POST",
            headers,
            credentials: "include",
            body: JSON.stringify({
                visitorId: fp.visitorId,
                confidence: fp.confidence,
                browser: fp.browser,
                os: fp.os,
                timezone: fp.timezone,
                screenResolution: fp.screenResolution,
                language: fp.language,
                platform: fp.platform,
                hardwareConcurrency: fp.hardwareConcurrency,
                touchSupport: fp.touchSupport,
            }),
        });
    } catch (err) {
        console.warn("[Fingerprint] Failed to report:", err);
    }
}
