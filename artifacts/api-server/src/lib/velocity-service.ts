/**
 * Velocity & Challenge Farming Detection Service
 *
 * Tracks event frequency per user/IP/fingerprint.
 * Detects: account creation spikes, purchase velocity,
 * challenge recycling, payout clusters.
 */

import { db } from "@workspace/db";
import { velocityEvents, fraudEvents, orders, users } from "@workspace/db";
import { eq, and, gte, sql, count, ne } from "drizzle-orm";
import { logger } from "./logger";

type EventType = "account_creation" | "challenge_purchase" | "payout_request" | "challenge_failure";

export interface VelocityCheckResult {
    allowed: boolean;
    velocityRisk: number;
    warning?: string;
    fraudEventCreated: boolean;
}

export class VelocityService {
    /**
     * Record a velocity event and check thresholds.
     */
    static async recordAndCheck(
        eventType: EventType,
        userId: string | null,
        ip: string,
        fingerprint: string,
        metadata?: Record<string, any>
    ): Promise<VelocityCheckResult> {
        // Store event
        await db.insert(velocityEvents).values({
            userId,
            eventType,
            ipAddress: ip,
            deviceFingerprint: fingerprint,
            metadata: metadata || {},
        }).catch((err) => logger.error({ err }, "Velocity event insert failed"));

        // Check thresholds
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [byIp] = await db
            .select({ count: count() })
            .from(velocityEvents)
            .where(and(
                eq(velocityEvents.eventType, eventType),
                eq(velocityEvents.ipAddress, ip),
                gte(velocityEvents.createdAt, last24h)
            ));

        const [byFp] = await db
            .select({ count: count() })
            .from(velocityEvents)
            .where(and(
                eq(velocityEvents.eventType, eventType),
                eq(velocityEvents.deviceFingerprint, fingerprint),
                gte(velocityEvents.createdAt, last24h)
            ));

        const ipCount = Number(byIp.count);
        const fpCount = Number(byFp.count);
        const maxCount = Math.max(ipCount, fpCount);

        let velocityRisk = 0;
        let warning: string | undefined;
        let fraudEventCreated = false;

        if (maxCount >= 5) {
            velocityRisk = 40;
            warning = `High velocity: ${maxCount} ${eventType} events in 24h`;
            await this.createFraudEvent(userId, eventType, ip, fingerprint, maxCount);
            fraudEventCreated = true;
        } else if (maxCount >= 3) {
            velocityRisk = 15;
            warning = `Elevated velocity: ${maxCount} ${eventType} events in 24h`;
        }

        return { allowed: true, velocityRisk, warning, fraudEventCreated };
    }

    /**
     * Detect challenge farming pattern:
     * Same user/fingerprint fails challenge → buys new one within 30 days.
     */
    static async checkChallengeFarming(
        userId: string,
        fingerprint: string
    ): Promise<{ detected: boolean; risk: number; failCount: number }> {
        const last30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        // Count recent challenge failures for this user
        const [userFailures] = await db
            .select({ count: count() })
            .from(velocityEvents)
            .where(and(
                eq(velocityEvents.userId, userId),
                eq(velocityEvents.eventType, "challenge_failure"),
                gte(velocityEvents.createdAt, last30d)
            ));

        // Also check by fingerprint (catches multi-account farming)
        const [fpFailures] = await db
            .select({ count: count() })
            .from(velocityEvents)
            .where(and(
                eq(velocityEvents.deviceFingerprint, fingerprint),
                eq(velocityEvents.eventType, "challenge_failure"),
                gte(velocityEvents.createdAt, last30d)
            ));

        const failCount = Math.max(Number(userFailures.count), Number(fpFailures.count));

        if (failCount >= 3) {
            // Create CHALLENGE_FARMING fraud event
            await db.insert(fraudEvents).values({
                userId,
                fraudType: "CHALLENGE_FARMING",
                severity: failCount >= 5 ? "CRITICAL" : "HIGH",
                riskScore: failCount >= 5 ? 80 : 60,
                status: "OPEN",
                details: {
                    failCount,
                    fingerprint: fingerprint.slice(0, 12),
                    last30Days: true,
                    detectedAt: new Date().toISOString(),
                },
                ipAddress: null,
                deviceFingerprint: fingerprint,
                country: null,
            } as any).catch(() => { });

            return { detected: true, risk: failCount >= 5 ? 40 : 25, failCount };
        }

        return { detected: false, risk: 0, failCount };
    }

    /**
     * Detect payout clusters (multiple linked accounts requesting payouts).
     */
    static async checkPayoutCluster(
        userId: string,
        fingerprint: string,
        ip: string
    ): Promise<{ clustered: boolean; risk: number; linkedPayouts: number }> {
        const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        // Find payout requests from same fingerprint or IP by different users
        const [fpPayouts] = await db
            .select({ count: sql<number>`COUNT(DISTINCT ${velocityEvents.userId})` })
            .from(velocityEvents)
            .where(and(
                eq(velocityEvents.eventType, "payout_request"),
                eq(velocityEvents.deviceFingerprint, fingerprint),
                gte(velocityEvents.createdAt, last7d)
            ));

        const linkedPayouts = Number(fpPayouts.count);

        if (linkedPayouts >= 2) {
            await db.insert(fraudEvents).values({
                userId,
                fraudType: "PAYOUT_CLUSTER",
                severity: linkedPayouts >= 4 ? "CRITICAL" : "HIGH",
                riskScore: linkedPayouts >= 4 ? 80 : 50,
                status: "OPEN",
                details: {
                    linkedPayoutUsers: linkedPayouts,
                    fingerprint: fingerprint.slice(0, 12),
                    ip,
                    detectedAt: new Date().toISOString(),
                },
                ipAddress: ip,
                deviceFingerprint: fingerprint,
                country: null,
            } as any).catch(() => { });

            return { clustered: true, risk: 20, linkedPayouts };
        }

        return { clustered: false, risk: 0, linkedPayouts };
    }

    /**
     * Get velocity stats for admin dashboard.
     */
    static async getVelocityStats() {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [stats24h] = await db
            .select({
                accountCreations: sql<number>`COUNT(CASE WHEN event_type='account_creation' THEN 1 END)`,
                challengePurchases: sql<number>`COUNT(CASE WHEN event_type='challenge_purchase' THEN 1 END)`,
                payoutRequests: sql<number>`COUNT(CASE WHEN event_type='payout_request' THEN 1 END)`,
                challengeFailures: sql<number>`COUNT(CASE WHEN event_type='challenge_failure' THEN 1 END)`,
                total: count(),
            })
            .from(velocityEvents)
            .where(gte(velocityEvents.createdAt, last24h));

        // High velocity IPs (5+ events per type)
        const highVelocityIps = await db
            .select({
                ipAddress: velocityEvents.ipAddress,
                eventType: velocityEvents.eventType,
                eventCount: count(),
            })
            .from(velocityEvents)
            .where(gte(velocityEvents.createdAt, last24h))
            .groupBy(velocityEvents.ipAddress, velocityEvents.eventType)
            .having(sql`COUNT(*) >= 5`)
            .limit(20);

        return { stats24h, highVelocityIps };
    }

    /**
     * Get challenge farming suspects.
     */
    static async getChallengeFarmingSuspects() {
        const last30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const suspects = await db
            .select({
                userId: velocityEvents.userId,
                deviceFingerprint: velocityEvents.deviceFingerprint,
                failCount: count(),
            })
            .from(velocityEvents)
            .where(and(
                eq(velocityEvents.eventType, "challenge_failure"),
                gte(velocityEvents.createdAt, last30d)
            ))
            .groupBy(velocityEvents.userId, velocityEvents.deviceFingerprint)
            .having(sql`COUNT(*) >= 3`)
            .limit(50);

        return suspects;
    }

    /**
     * Get payout clusters.
     */
    static async getPayoutClusters() {
        const last7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const clusters = await db
            .select({
                deviceFingerprint: velocityEvents.deviceFingerprint,
                userCount: sql<number>`COUNT(DISTINCT ${velocityEvents.userId})`,
                payoutCount: count(),
            })
            .from(velocityEvents)
            .where(and(
                eq(velocityEvents.eventType, "payout_request"),
                gte(velocityEvents.createdAt, last7d)
            ))
            .groupBy(velocityEvents.deviceFingerprint)
            .having(sql`COUNT(DISTINCT ${velocityEvents.userId}) >= 2`)
            .limit(50);

        return clusters;
    }

    private static async createFraudEvent(
        userId: string | null,
        eventType: string,
        ip: string,
        fingerprint: string,
        eventCount: number
    ): Promise<void> {
        const fraudType = eventType === "account_creation"
            ? "ACCOUNT_CREATION_VELOCITY"
            : eventType === "challenge_purchase"
                ? "CHALLENGE_PURCHASE_VELOCITY"
                : "PAYOUT_CLUSTER";

        await db.insert(fraudEvents).values({
            userId: userId || "",
            fraudType,
            severity: eventCount >= 7 ? "CRITICAL" : "HIGH",
            riskScore: eventCount >= 7 ? 80 : 50,
            status: "OPEN",
            details: {
                eventType,
                eventCount,
                ip,
                fingerprint: fingerprint.slice(0, 12),
                detectedAt: new Date().toISOString(),
            },
            ipAddress: ip,
            deviceFingerprint: fingerprint,
            country: null,
        } as any).catch((err) => logger.error({ err }, "Velocity fraud event creation failed"));
    }
}

export default VelocityService;
