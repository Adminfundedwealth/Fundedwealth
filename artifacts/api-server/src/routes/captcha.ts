/**
 * Captcha Verification Route
 *
 * Standalone endpoint for verifying Turnstile tokens.
 * The frontend calls this before performing sensitive actions (signup, login, etc.)
 * that go directly to Supabase (bypassing the /api/auth routes).
 *
 * Flow:
 *   1. Frontend renders Turnstile widget → gets token
 *   2. Frontend calls POST /api/captcha/verify with token + action
 *   3. Backend verifies with Cloudflare siteverify API
 *   4. If valid → frontend proceeds with Supabase signup/login
 *   5. If invalid → frontend blocks the action
 */

import { Router } from "express";
import { verifyTurnstileToken } from "../lib/turnstile-service";
import { logger } from "../lib/logger";

const router = Router();

/**
 * POST /api/captcha/verify
 * Verifies a Turnstile token. Returns { success: true } or 403.
 */
router.post("/verify", async (req, res) => {
    const token = req.body?.captchaToken || req.body?.turnstileToken || req.body?.token;
    const action = req.body?.action || "unknown";

    if (!token) {
        return res.status(400).json({ success: false, error: "CAPTCHA token required" });
    }

    const clientIp =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
        req.socket.remoteAddress ||
        undefined;

    const { valid, error } = await verifyTurnstileToken(token, clientIp);

    if (!valid) {
        logger.warn({ error, action, ip: clientIp }, "Captcha verification rejected");
        return res.status(403).json({
            success: false,
            error: "CAPTCHA verification failed. Please try again.",
            code: error,
        });
    }

    logger.info({ action, ip: clientIp }, "Captcha verified successfully");
    res.json({ success: true });
});

export default router;
