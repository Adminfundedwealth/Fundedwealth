/**
 * Admin IP Intelligence Dashboard Routes
 * Provides visibility into IPQS lookups, flagged IPs, and cache stats.
 */

import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db, users, ipLookups, ipHistory } from "@workspace/db";
import { eq, desc, gte, and, sql } from "drizzle-orm";
import { IPIntelligenceService } from "../lib/ip-intelligence-service";
import { logger } from "../lib/logger";

const router = Router();

/**
 * Admin-only guard
 */
async function requireAdmin(req: any, res: any): Promise<any | null> {
    const auth = getAuth(req);
    if (!auth?.userId) {
        res.status(401).json({ error: "Authentication required" });
        return null;
    }

    const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId)).limit(1);
    if (!user || !["admin", "super_admin"].includes(user.role)) {
        res.status(403).json({ error: "Admin access required" });
        return null;
    }

    return user;
}

/**
 * GET /api/ip-intelligence/dashboard
 * Overview stats for admin dashboard
 */
router.get("/dashboard", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Stats for last 24h
        const [stats24h] = await db
            .select({
                totalLookups: sql<number>`COUNT(*)`,
                vpnCount: sql<number>`COUNT(CASE WHEN vpn_detected THEN 1 END)`,
                proxyCount: sql<number>`COUNT(CASE WHEN proxy_detected THEN 1 END)`,
                torCount: sql<number>`COUNT(CASE WHEN tor_detected THEN 1 END)`,
                datacenterCount: sql<number>`COUNT(CASE WHEN datacenter_detected THEN 1 END)`,
                avgFraudScore: sql<number>`COALESCE(AVG(fraud_score), 0)`,
                apiCalls: sql<number>`COUNT(CASE WHEN lookup_source = 'api' THEN 1 END)`,
                cacheHits: sql<number>`COUNT(CASE WHEN lookup_source IN ('cache_memory', 'cache_db') THEN 1 END)`,
                failures: sql<number>`COUNT(CASE WHEN NOT lookup_success THEN 1 END)`,
            })
            .from(ipLookups)
            .where(gte(ipLookups.createdAt, last24h));

        // Stats for last 7d
        const [stats7d] = await db
            .select({
                totalLookups: sql<number>`COUNT(*)`,
                vpnCount: sql<number>`COUNT(CASE WHEN vpn_detected THEN 1 END)`,
                proxyCount: sql<number>`COUNT(CASE WHEN proxy_detected THEN 1 END)`,
                torCount: sql<number>`COUNT(CASE WHEN tor_detected THEN 1 END)`,
                apiCalls: sql<number>`COUNT(CASE WHEN lookup_source = 'api' THEN 1 END)`,
            })
            .from(ipLookups)
            .where(gte(ipLookups.createdAt, last7d));

        // Cache stats
        const cacheStats = IPIntelligenceService.getCacheStats();

        // Estimated API cost (IPQS free tier: 5000/month, paid: $0.001/lookup)
        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const [monthlyApiCalls] = await db
            .select({
                count: sql<number>`COUNT(CASE WHEN lookup_source = 'api' THEN 1 END)`,
            })
            .from(ipLookups)
            .where(gte(ipLookups.createdAt, monthStart));

        const estimatedMonthlyCost = Number(monthlyApiCalls.count) * 0.001; // $0.001 per lookup

        res.json({
            last24h: {
                totalLookups: Number(stats24h.totalLookups),
                vpnDetected: Number(stats24h.vpnCount),
                proxyDetected: Number(stats24h.proxyCount),
                torDetected: Number(stats24h.torCount),
                datacenterDetected: Number(stats24h.datacenterCount),
                avgFraudScore: Number(Number(stats24h.avgFraudScore).toFixed(1)),
                apiCalls: Number(stats24h.apiCalls),
                cacheHits: Number(stats24h.cacheHits),
                failures: Number(stats24h.failures),
                cacheHitRate: Number(stats24h.totalLookups) > 0
                    ? ((Number(stats24h.cacheHits) / Number(stats24h.totalLookups)) * 100).toFixed(1) + "%"
                    : "0%",
            },
            last7d: {
                totalLookups: Number(stats7d.totalLookups),
                vpnDetected: Number(stats7d.vpnCount),
                proxyDetected: Number(stats7d.proxyCount),
                torDetected: Number(stats7d.torCount),
                apiCalls: Number(stats7d.apiCalls),
            },
            cache: cacheStats,
            costEstimate: {
                monthlyApiCalls: Number(monthlyApiCalls.count),
                estimatedCostUSD: estimatedMonthlyCost.toFixed(2),
                freeTierRemaining: Math.max(0, 5000 - Number(monthlyApiCalls.count)),
            },
        });
    } catch (error) {
        logger.error(error, "IP intelligence dashboard error");
        res.status(500).json({ error: "Failed to load dashboard stats" });
    }
});

/**
 * GET /api/ip-intelligence/lookups
 * Recent IP lookups with pagination
 */
router.get("/lookups", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
        const limit = Math.min(Number(req.query.limit) || 50, 200);
        const offset = Number(req.query.offset) || 0;
        const flaggedOnly = req.query.flagged === "true";
        const trigger = req.query.trigger as string | undefined;

        const conditions = [];
        if (flaggedOnly) {
            conditions.push(
                sql`(vpn_detected OR proxy_detected OR tor_detected OR datacenter_detected OR fraud_score >= 75)`
            );
        }
        if (trigger) {
            conditions.push(eq(ipLookups.trigger, trigger));
        }

        const lookups = await db
            .select()
            .from(ipLookups)
            .where(conditions.length ? and(...conditions) : undefined)
            .orderBy(desc(ipLookups.createdAt))
            .limit(limit)
            .offset(offset);

        res.json({
            lookups,
            pagination: { limit, offset, count: lookups.length },
        });
    } catch (error) {
        logger.error(error, "IP intelligence lookups error");
        res.status(500).json({ error: "Failed to load lookups" });
    }
});

/**
 * GET /api/ip-intelligence/user/:userId
 * IP intelligence history for a specific user
 */
router.get("/user/:userId", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ error: "Valid userId required" });

        const lookups = await db
            .select()
            .from(ipLookups)
            .where(eq(ipLookups.userId, userId))
            .orderBy(desc(ipLookups.createdAt))
            .limit(100);

        const ipRecords = await db
            .select()
            .from(ipHistory)
            .where(eq(ipHistory.userId, userId))
            .orderBy(desc(ipHistory.lastSeen))
            .limit(50);

        res.json({
            lookups,
            ipHistory: ipRecords,
        });
    } catch (error) {
        logger.error(error, "IP intelligence user history error");
        res.status(500).json({ error: "Failed to load user IP history" });
    }
});

/**
 * POST /api/ip-intelligence/lookup
 * Manual IP lookup (admin tool)
 */
router.post("/lookup", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
        const { ip } = req.body;
        if (!ip || typeof ip !== "string") {
            return res.status(400).json({ error: "Valid IP address required" });
        }

        // Force fresh API lookup (bypass cache)
        IPIntelligenceService.clearMemoryCache();
        const result = await IPIntelligenceService.lookup(ip);

        res.json(result);
    } catch (error) {
        logger.error(error, "Manual IP lookup error");
        res.status(500).json({ error: "Lookup failed" });
    }
});

/**
 * GET /api/ip-intelligence/flagged-users
 * Users with VPN/TOR/proxy activity
 */
router.get("/flagged-users", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
        const flaggedUsers = await db
            .select({
                userId: ipLookups.userId,
                ip: ipLookups.ip,
                vpnDetected: ipLookups.vpnDetected,
                proxyDetected: ipLookups.proxyDetected,
                torDetected: ipLookups.torDetected,
                datacenterDetected: ipLookups.datacenterDetected,
                fraudScore: ipLookups.fraudScore,
                country: ipLookups.country,
                trigger: ipLookups.trigger,
                createdAt: ipLookups.createdAt,
            })
            .from(ipLookups)
            .where(
                sql`(vpn_detected OR proxy_detected OR tor_detected OR fraud_score >= 75)`
            )
            .orderBy(desc(ipLookups.fraudScore))
            .limit(100);

        res.json(flaggedUsers);
    } catch (error) {
        logger.error(error, "Flagged users query error");
        res.status(500).json({ error: "Failed to load flagged users" });
    }
});

/**
 * POST /api/ip-intelligence/clear-cache
 * Clear the in-memory cache (admin)
 */
router.post("/clear-cache", async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    IPIntelligenceService.clearMemoryCache();
    logger.info({ adminId: admin.id }, "IP intelligence memory cache cleared by admin");

    res.json({ message: "Memory cache cleared", stats: IPIntelligenceService.getCacheStats() });
});

export default router;
