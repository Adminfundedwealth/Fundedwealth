import { Router } from "express";
import { clerkAuth } from "../middlewares/clerkAuth";
import { db, fraudEvents, riskProfiles, users } from "@workspace/db";
import FraudDetectionService from "../lib/fraud-detection-service";
import RiskScoringEngine from "../lib/risk-scoring-engine";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

/**
 * GET /api/fraud/risk-score/:userId
 * Get current risk score for a user
 */
router.get("/risk-score/:userId", clerkAuth, async (req, res) => {
  try {
    const userId = req.params.userId as string;

    const [riskProfile] = await db
      .select()
      .from(riskProfiles)
      .where(eq(riskProfiles.userId, userId))
      .limit(1);

    if (!riskProfile) {
      return res.status(404).json({ error: "Risk profile not found" });
    }

    res.json(riskProfile);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/fraud/events/:userId
 * Get fraud events for a user
 */
router.get("/events/:userId", clerkAuth, async (req, res) => {
  try {
    const userId = req.params.userId as string;
    const { days = 30 } = req.query;

    const events = await FraudDetectionService.getFraudHistory(
      userId,
      parseInt(days as string)
    );

    res.json(events);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/fraud/dashboard
 * Admin dashboard - get fraud statistics
 */
router.get("/dashboard", clerkAuth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });

    if (user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Get statistics
    const criticalUsers = await db
      .select()
      .from(riskProfiles)
      .where(eq(riskProfiles.riskLevel, "CRITICAL"));

    const highRiskUsers = await db
      .select()
      .from(riskProfiles)
      .where(eq(riskProfiles.riskLevel, "HIGH"));

    const blockedUsers = await db
      .select()
      .from(riskProfiles)
      .where(eq(riskProfiles.isBlocked, true));

    const recentFraudEvents = await db
      .select()
      .from(fraudEvents)
      .orderBy(desc(fraudEvents.createdAt))
      .limit(50);

    res.json({
      stats: {
        criticalCount: criticalUsers.length,
        highRiskCount: highRiskUsers.length,
        blockedCount: blockedUsers.length,
        recentEventsCount: recentFraudEvents.length,
      },
      recentEvents: recentFraudEvents,
      criticalUsers: criticalUsers.slice(0, 10),
      highRiskUsers: highRiskUsers.slice(0, 10),
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/fraud/check
 * Check and score user for fraud
 */
router.post("/check", clerkAuth, async (req, res) => {
  try {
    const { userId, ipAddress, deviceFingerprint, country, kycStatus } =
      req.body;

    if (!userId || !ipAddress || !deviceFingerprint) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const riskProfile = await FraudDetectionService.detectAndScore({
      userId,
      ipAddress,
      deviceFingerprint,
      country,
      kycStatus,
    });

    res.json({
      riskProfile,
      isBlocked: riskProfile.isBlocked,
      payoutRestricted: riskProfile.payoutRestricted,
      requiresReview: riskProfile.requiresManualReview,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/fraud/detect-multi-account
 * Detect multi-account fraud
 */
router.post("/detect-multi-account", clerkAuth, async (req, res) => {
  try {
    const { userId, ipAddress, deviceFingerprint, country } = req.body;

    if (!userId || !ipAddress) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await FraudDetectionService.detectMultiAccountFraud({
      userId,
      ipAddress,
      deviceFingerprint,
      country,
    });

    res.json({ success: true, message: "Multi-account fraud check completed" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/fraud/detect-referral-fraud
 * Detect referral fraud
 */
router.post("/detect-referral-fraud", clerkAuth, async (req, res) => {
  try {
    const { referrerId, referredUserId, ipAddress, deviceFingerprint } =
      req.body;

    if (!referrerId || !referredUserId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await FraudDetectionService.detectReferralFraud(
      referrerId,
      referredUserId,
      ipAddress || "unknown",
      deviceFingerprint || "unknown"
    );

    res.json({ success: true, message: "Referral fraud check completed" });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/fraud/events/:eventId/resolve
 * Resolve a fraud event
 */
router.patch("/events/:eventId/resolve", clerkAuth, async (req, res) => {
  try {
    const eventId = req.params.eventId as string;
    const { notes } = req.body;

    // Verify admin
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });

    if (user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const resolvedEvent = await FraudDetectionService.resolveFraudEvent(
      parseInt(eventId),
      user.id.toString(),
      notes || ""
    );

    res.json(resolvedEvent);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/fraud/block-user/:userId
 * Block a user account
 */
router.patch("/block-user/:userId", clerkAuth, async (req, res) => {
  try {
    const userId = req.params.userId as string;
    const { reason } = req.body;

    // Verify admin
    const admin = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });

    if (admin?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const blocked = await FraudDetectionService.blockUser(
      userId,
      reason || "Fraud detected"
    );

    res.json(blocked);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/fraud/high-risk-users
 * Get high-risk users requiring review
 */
router.get("/high-risk-users", clerkAuth, async (req, res) => {
  try {
    // Verify admin
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, req.auth!.userId),
    });

    if (user?.role !== "admin") {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const highRiskUsers = await FraudDetectionService.getHighRiskUsers();
    res.json(highRiskUsers);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/fraud/calculate-risk
 * Calculate risk score from factors
 */
router.post("/calculate-risk", clerkAuth, async (req, res) => {
  try {
    const {
      ipRisk,
      deviceRisk,
      behaviorRisk,
      vpnProxyRisk,
      kycRisk,
      referralRisk,
      tradingRisk,
    } = req.body;

    const riskScore = RiskScoringEngine.calculateRiskScore({
      ipRisk: parseFloat(ipRisk) || 0,
      deviceRisk: parseFloat(deviceRisk) || 0,
      behaviorRisk: parseFloat(behaviorRisk) || 0,
      vpnProxyRisk: parseFloat(vpnProxyRisk) || 0,
      kycRisk: parseFloat(kycRisk) || 0,
    });

    res.json(riskScore);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/fraud/detect-copy-trading
 * Detect copy trading pattern
 */
router.post("/detect-copy-trading", clerkAuth, async (req, res) => {
  try {
    const { trades } = req.body;

    if (!Array.isArray(trades)) {
      return res.status(400).json({ error: "trades must be an array" });
    }

    const probability = RiskScoringEngine.detectCopyTrading(trades);
    res.json({ copyTradingProbability: probability });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/fraud/detect-hft
 * Detect high-frequency trading
 */
router.post("/detect-hft", clerkAuth, async (req, res) => {
  try {
    const { trades } = req.body;

    if (!Array.isArray(trades)) {
      return res.status(400).json({ error: "trades must be an array" });
    }

    const hftScore = RiskScoringEngine.detectHFT(trades);
    res.json({ hftScore });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/fraud/detect-martingale
 * Detect Martingale strategy
 */
router.post("/detect-martingale", clerkAuth, async (req, res) => {
  try {
    const { trades } = req.body;

    if (!Array.isArray(trades)) {
      return res.status(400).json({ error: "trades must be an array" });
    }

    const martingaleScore = RiskScoringEngine.detectMartingale(trades);
    res.json({ martingaleScore });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
