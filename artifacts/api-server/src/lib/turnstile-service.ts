/**
 * Cloudflare Turnstile Server-Side Verification
 *
 * Verifies CAPTCHA tokens from the frontend.
 * Free, unlimited usage. Fail-closed: if verification fails, request is rejected.
 *
 * API: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */

import { logger } from "./logger";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface TurnstileVerifyResult {
    success: boolean;
    challenge_ts?: string;
    hostname?: string;
    action?: string;
    cdata?: string;
    error_codes?: string[];
}

/**
 * Verify a Turnstile token server-side.
 * Returns true only if Cloudflare confirms the token is valid.
 * Fail-closed: returns false on any error.
 */
export async function verifyTurnstileToken(
    token: string,
    remoteIp?: string
): Promise<{ valid: boolean; error?: string }> {
    const secretKey = process.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
        logger.error("TURNSTILE_SECRET_KEY not configured — all captcha checks will fail");
        return { valid: false, error: "captcha_not_configured" };
    }

    if (!token || typeof token !== "string" || token.length < 10) {
        return { valid: false, error: "invalid_token_format" };
    }

    try {
        const body: Record<string, string> = {
            secret: secretKey,
            response: token,
        };

        if (remoteIp) {
            body.remoteip = remoteIp;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(TURNSTILE_VERIFY_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams(body).toString(),
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!response.ok) {
            logger.error({ status: response.status }, "Turnstile API non-200");
            return { valid: false, error: `turnstile_http_${response.status}` };
        }

        const data = await response.json() as TurnstileVerifyResult;

        if (!data.success) {
            logger.warn(
                { errorCodes: data.error_codes },
                "Turnstile verification failed"
            );
            return {
                valid: false,
                error: data.error_codes?.join(", ") || "verification_failed",
            };
        }

        return { valid: true };
    } catch (err: any) {
        if (err.name === "AbortError") {
            logger.error("Turnstile verification timed out");
            return { valid: false, error: "turnstile_timeout" };
        }
        logger.error({ err }, "Turnstile verification exception");
        return { valid: false, error: `turnstile_exception: ${err.message}` };
    }
}

/**
 * Express middleware: require valid Turnstile token in request body.
 * Token field: `captchaToken` or `turnstileToken`
 *
 * Usage: router.post("/register", requireTurnstile, async (req, res) => { ... })
 */
export function requireTurnstile(req: any, res: any, next: any) {
    const token = req.body?.captchaToken || req.body?.turnstileToken;

    if (!token) {
        return res.status(400).json({ error: "CAPTCHA verification required" });
    }

    const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        undefined;

    verifyTurnstileToken(token, clientIp).then(({ valid, error }) => {
        if (!valid) {
            logger.warn({ error, ip: clientIp }, "Turnstile captcha rejected");
            return res.status(403).json({
                error: "CAPTCHA verification failed. Please try again.",
                code: error,
            });
        }
        next();
    }).catch((err) => {
        logger.error({ err }, "Turnstile middleware error");
        // Fail closed
        return res.status(403).json({ error: "CAPTCHA verification failed" });
    });
}

export default { verifyTurnstileToken, requireTurnstile };
