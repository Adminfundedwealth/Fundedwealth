/**
 * Fingerprint Routes
 *
 * Receives FingerprintJS Pro data from the frontend.
 * Stores fingerprint history, detects multi-account fraud, and feeds risk scoring.
 */

import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users, deviceHistory } from "@workspace/db";
import { eq, and, desc, sql, ne } from "drizzle-orm";
import { DeviceFingerprintService } from "../lib/device-fingerprint-service";
import { FraudDetectionService } from "../lib/fraud-detection-service";
import { IPIntelligenceService } from "../lib/ip-intelligence-service";
import { VelocityService } from "../lib/velocity-service";
import { logger } from "../lib/logger";

const router = Router();

/**
 * POST /api/fingerprint/report
 * Called by frontend after login/signup with FingerprintJS Pro data.
 */
router.post("/report", async (req, res) => {
    try {
        const auth = getAuth(req);
        if (!auth?.userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const {
            visitorId,
            requestId,
            confidence,
            browser,
            browserVersion,
            os,
            osVersion,
            device,
            timezone,
            screenResolution,
            language,
            incognito,
            ip,
            ipLocation,
        } = req.body;

        if (!visitorId || typeof visitorId !== "string") {
            return res.status(400).json({ error: "visitorId is required" });
        }

        // Get the DB user
        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, auth.userId))
            .limit(1);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Get client IP
        const clientIp =
            ip ||
            (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
            req.socket.remoteAddress ||
            "unknown";

        // Store/update fingerprint in device_history
        const result = await DeviceFingerprintService.recordFingerprint({
            userId: user.id,
            visitorId,
            requestId,
            confidence,
            browser: browser ? `${browser} ${browserVersion || ""}`.trim() : undefined,
            os: os ? `${os} ${osVersion || ""}`.trim() : undefined,
            device,
            timezone,
            screenResolution,
            language,
            incognito,
            ip: clientIp,
            country: ipLocation?.country || undefined,
        });

        // Run background fraud checks (non-blocking)
        DeviceFingerprintService.detectFraud(user.id, visitorId, clientIp).catch((err) => {
            logger.error({ err, userId: user.id }, "Fingerprint fraud detection failed");
        });

        // Run full FraudDetectionService pipeline (signup/login trigger)
        // This is the first backend call after Supabase auth — covers both signup and login
        FraudDetectionService.detectAndScore({
            userId: user.id,
            ipAddress: clientIp,
            deviceFingerprint: visitorId,
            country: ipLocation?.country || "unknown",
            userEmail: user.email || undefined,
            trigger: result.isNew ? "signup" : "login",
        }).catch((err) => {
            logger.error({ err, userId: user.id }, "Fraud scoring on fingerprint report failed");
        });

        // Also run IP intelligence (ProxyCheck)
        IPIntelligenceService.lookupAndStore(
            clientIp,
            user.id,
            result.isNew ? "signup" : "login"
        ).catch((err) => {
            logger.error({ err, userId: user.id }, "IP intelligence on fingerprint report failed");
        });

        // Track account creation velocity (for new devices = likely new signup)
        if (result.isNew) {
            VelocityService.recordAndCheck("account_creation", user.id, clientIp, visitorId).catch(() => { });
        }

        res.json({
            stored: true,
            isNewDevice: result.isNew,
            deviceCount: result.totalDevices,
        });
    } catch (error) {
        logger.error(error, "Fingerprint report error");
        res.status(500).json({ error: "Failed to process fingerprint" });
    }
});

/**
 * GET /api/fingerprint/my-devices
 * User can see their own registered devices.
 */
router.get("/my-devices", async (req, res) => {
    try {
        const auth = getAuth(req);
        if (!auth?.userId) {
            return res.status(401).json({ error: "Authentication required" });
        }

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, auth.userId))
            .limit(1);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const devices = await db
            .select()
            .from(deviceHistory)
            .where(eq(deviceHistory.userId, user.id))
            .orderBy(desc(deviceHistory.lastSeen))
            .limit(20);

        res.json(devices);
    } catch (error) {
        logger.error(error, "My devices error");
        res.status(500).json({ error: "Failed to load devices" });
    }
});

export default router;
