/**
 * Device Fingerprint Service
 *
 * Manages FingerprintJS Pro visitor data on the backend.
 * Handles:
 * - Storing fingerprint history in device_history table
 * - Multi-account detection (same fingerprint → multiple users)
 * - Account sharing detection (same fingerprint appearing across users)
 * - Challenge farming detection (multiple accounts on same device)
 * - Referral abuse detection (self-referrals from same device)
 * - Risk score contribution for the fraud detection pipeline
 */

import { db } from "@workspace/db";
import {
    deviceHistory,
    users,
    fraudEvents,
    riskProfiles,
    referralFraudLogs,
    orders,
} from "@workspace/db";
import { eq, and, desc, sql, ne, count, gte } from "drizzle-orm";
import { logger } from "./logger";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FingerprintReportData {
    userId: string;
    visitorId: string;
    requestId?: string;
    confidence?: number;
    browser?: string;
    os?: string;
    device?: string;
    timezone?: string;
    screenResolution?: string;
    language?: string;
    incognito?: boolean;
    ip?: string;
    country?: string;
}

export interface RecordResult {
    isNew: boolean;
    totalDevices: number;
    deviceHistoryId: number;
}

export interface FraudDetectionResult {
    multiAccountDetected: boolean;
    accountSharingDetected: boolean;
    challengeFarmingDetected: boolean;
    referralAbuseDetected: boolean;
    sharedUserIds: string[];
    riskContribution: number;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class DeviceFingerprintService {
    /**
     * Record a fingerprint visit. Upserts into device_history.
     */
    static async recordFingerprint(data: FingerprintReportData): Promise<RecordResult> {
        // Check if this fingerprint already exists for this user
        const existing = await db.query.deviceHistory.findFirst({
            where: and(
                eq(deviceHistory.userId, data.userId),
                eq(deviceHistory.deviceFingerprint, data.visitorId)
            ),
        });

        let deviceHistoryId: number;
        let isNew = false;

        if (existing) {
            // Update last seen + increment count
            const [updated] = await db
                .update(deviceHistory)
                .set({
                    lastSeen: new Date(),
                    seenCount: sql`${deviceHistory.seenCount} + 1`,
                    // Update metadata if available
                    browser: data.browser || existing.browser,
                    os: data.os || existing.os,
                    screenSize: data.screenResolution || existing.screenSize,
                    timezone: data.timezone || existing.timezone,
                    language: data.language || existing.language,
                    ip: data.ip || existing.ip,
                    country: data.country || existing.country,
                })
                .where(eq(deviceHistory.id, existing.id))
                .returning();

            deviceHistoryId = updated.id;
        } else {
            // New device for this user
            isNew = true;
            const [inserted] = await db
                .insert(deviceHistory)
                .values({
                    userId: data.userId,
                    deviceFingerprint: data.visitorId,
                    browser: data.browser || null,
                    os: data.os || null,
                    screenSize: data.screenResolution || null,
                    timezone: data.timezone || null,
                    language: data.language || null,
                    ip: data.ip || null,
                    country: data.country || null,
                    seenCount: 1,
                })
                .returning();

            deviceHistoryId = inserted.id;
        }

        // Count total devices for this user
        const [deviceCount] = await db
            .select({ count: count() })
            .from(deviceHistory)
            .where(eq(deviceHistory.userId, data.userId));

        return {
            isNew,
            totalDevices: Number(deviceCount.count),
            deviceHistoryId,
        };
    }

    /**
     * Run fraud detection based on fingerprint data.
     * Detects: multi-account, account sharing, challenge farming, referral abuse.
     */
    static async detectFraud(
        userId: string,
        visitorId: string,
        ipAddress: string
    ): Promise<FraudDetectionResult> {
        const result: FraudDetectionResult = {
            multiAccountDetected: false,
            accountSharingDetected: false,
            challengeFarmingDetected: false,
            referralAbuseDetected: false,
            sharedUserIds: [],
            riskContribution: 0,
        };

        try {
            // ── 1. Multi-Account Detection ──────────────────────────────────────
            // Same fingerprint used by different user IDs
            const otherUsersWithSameDevice = await db
                .select({
                    userId: deviceHistory.userId,
                    lastSeen: deviceHistory.lastSeen,
                    seenCount: deviceHistory.seenCount,
                })
                .from(deviceHistory)
                .where(
                    and(
                        eq(deviceHistory.deviceFingerprint, visitorId),
                        ne(deviceHistory.userId, userId)
                    )
                )
                .orderBy(desc(deviceHistory.lastSeen))
                .limit(20);

            if (otherUsersWithSameDevice.length > 0) {
                result.multiAccountDetected = true;
                result.sharedUserIds = otherUsersWithSameDevice.map((d) => d.userId);

                logger.warn(
                    {
                        userId,
                        visitorId: visitorId.slice(0, 12) + "...",
                        sharedWith: result.sharedUserIds,
                    },
                    "Multi-account detected: same fingerprint across users"
                );

                // Log fraud event for each linked account
                for (const otherUser of otherUsersWithSameDevice) {
                    await this.createFraudEvent(
                        userId,
                        "MULTI_ACCOUNT",
                        "HIGH",
                        75,
                        {
                            reason: "Same FingerprintJS visitorId detected on multiple accounts",
                            sharedWithUserId: otherUser.userId,
                            visitorIdPrefix: visitorId.slice(0, 12),
                            otherUserLastSeen: otherUser.lastSeen,
                        },
                        ipAddress,
                        visitorId
                    );
                }
            }

            // ── 2. Account Sharing Detection ────────────────────────────────────
            // Multiple active sessions from same device for different users within 24h
            const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const recentSharedSessions = otherUsersWithSameDevice.filter(
                (d) => d.lastSeen && new Date(d.lastSeen) > last24h
            );

            if (recentSharedSessions.length > 0) {
                result.accountSharingDetected = true;

                await this.createFraudEvent(
                    userId,
                    "ACCOUNT_SHARING",
                    "HIGH",
                    80,
                    {
                        reason: "Same device used by multiple users within 24 hours",
                        usersOnDevice: [userId, ...recentSharedSessions.map((d) => d.userId)],
                        visitorIdPrefix: visitorId.slice(0, 12),
                    },
                    ipAddress,
                    visitorId
                );
            }

            // ── 3. Challenge Farming Detection ──────────────────────────────────
            // Same device purchasing multiple challenge accounts
            if (result.multiAccountDetected) {
                const allUserIds = [userId, ...result.sharedUserIds];

                // Check if multiple users on this device have purchased challenges
                const challengeOrders = await db
                    .select({
                        userId: orders.userId,
                        orderCount: count(),
                    })
                    .from(orders)
                    .where(
                        and(
                            sql`${orders.userId} = ANY(${allUserIds})`,
                            sql`${orders.status} IN ('paid', 'confirmed')`
                        )
                    )
                    .groupBy(orders.userId);

                const usersWithPurchases = challengeOrders.filter(
                    (o) => Number(o.orderCount) > 0
                );

                if (usersWithPurchases.length > 1) {
                    result.challengeFarmingDetected = true;

                    await this.createFraudEvent(
                        userId,
                        "CHALLENGE_FARMING",
                        "CRITICAL",
                        90,
                        {
                            reason: "Multiple accounts on same device with challenge purchases",
                            usersWithOrders: usersWithPurchases.map((o) => ({
                                userId: o.userId,
                                orderCount: Number(o.orderCount),
                            })),
                            visitorIdPrefix: visitorId.slice(0, 12),
                        },
                        ipAddress,
                        visitorId
                    );
                }
            }

            // ── 4. Referral Abuse Detection ─────────────────────────────────────
            // Users on same device referring each other
            if (result.multiAccountDetected) {
                const allUserIds = [userId, ...result.sharedUserIds];

                // Check if any referral relationships exist between these users
                const crossReferrals = await db
                    .select()
                    .from(referralFraudLogs)
                    .where(
                        sql`referrer_id = ANY(${allUserIds}) AND referred_user_id = ANY(${allUserIds})`
                    )
                    .limit(10);

                if (crossReferrals.length > 0) {
                    result.referralAbuseDetected = true;

                    await this.createFraudEvent(
                        userId,
                        "REFERRAL_ABUSE",
                        "CRITICAL",
                        95,
                        {
                            reason: "Referral between accounts sharing the same device fingerprint",
                            crossReferralCount: crossReferrals.length,
                            involvedUsers: allUserIds,
                            visitorIdPrefix: visitorId.slice(0, 12),
                        },
                        ipAddress,
                        visitorId
                    );
                }
            }

            // ── Calculate Risk Contribution ─────────────────────────────────────
            result.riskContribution = this.calculateDeviceRiskContribution(result);

            return result;
        } catch (error) {
            logger.error({ error, userId, visitorId: visitorId.slice(0, 12) }, "Fingerprint fraud detection error");
            return result;
        }
    }

    /**
     * Calculate device risk points (0-20) for the risk scoring engine.
     * Replaces the placeholder logic in FraudDetectionService.calculateDeviceRisk.
     */
    static calculateDeviceRiskContribution(result: FraudDetectionResult): number {
        let risk = 0;

        if (result.challengeFarmingDetected) risk += 20; // Max — critical
        else if (result.referralAbuseDetected) risk += 18;
        else if (result.accountSharingDetected) risk += 15;
        else if (result.multiAccountDetected) risk += 12;

        return Math.min(20, risk);
    }

    /**
     * Get all users sharing a given fingerprint (admin query).
     */
    static async getUsersForFingerprint(visitorId: string): Promise<any[]> {
        const records = await db
            .select({
                userId: deviceHistory.userId,
                lastSeen: deviceHistory.lastSeen,
                seenCount: deviceHistory.seenCount,
                browser: deviceHistory.browser,
                os: deviceHistory.os,
                ip: deviceHistory.ip,
                country: deviceHistory.country,
            })
            .from(deviceHistory)
            .where(eq(deviceHistory.deviceFingerprint, visitorId))
            .orderBy(desc(deviceHistory.lastSeen));

        // Enrich with user data
        const enriched = [];
        for (const record of records) {
            const [user] = await db
                .select({ id: users.id, email: users.email, firstName: users.firstName })
                .from(users)
                .where(eq(users.id, record.userId))
                .limit(1);

            enriched.push({
                ...record,
                user: user || null,
            });
        }

        return enriched;
    }

    /**
     * Get fingerprint clusters — groups of fingerprints shared by multiple users.
     * Used by admin dashboard.
     */
    static async getSuspiciousClusters(minUsers: number = 2): Promise<any[]> {
        const clusters = await db
            .select({
                deviceFingerprint: deviceHistory.deviceFingerprint,
                userCount: sql<number>`COUNT(DISTINCT ${deviceHistory.userId})`,
                totalSeen: sql<number>`SUM(${deviceHistory.seenCount})`,
                lastActivity: sql<Date>`MAX(${deviceHistory.lastSeen})`,
            })
            .from(deviceHistory)
            .groupBy(deviceHistory.deviceFingerprint)
            .having(sql`COUNT(DISTINCT ${deviceHistory.userId}) >= ${minUsers}`)
            .orderBy(desc(sql`COUNT(DISTINCT ${deviceHistory.userId})`))
            .limit(50);

        // Enrich each cluster with user details
        const enriched = [];
        for (const cluster of clusters) {
            const usersOnDevice = await db
                .select({
                    userId: deviceHistory.userId,
                    lastSeen: deviceHistory.lastSeen,
                    browser: deviceHistory.browser,
                    os: deviceHistory.os,
                })
                .from(deviceHistory)
                .where(eq(deviceHistory.deviceFingerprint, cluster.deviceFingerprint))
                .orderBy(desc(deviceHistory.lastSeen));

            enriched.push({
                fingerprint: cluster.deviceFingerprint.slice(0, 16) + "...",
                fullFingerprint: cluster.deviceFingerprint,
                userCount: Number(cluster.userCount),
                totalSeen: Number(cluster.totalSeen),
                lastActivity: cluster.lastActivity,
                users: usersOnDevice,
            });
        }

        return enriched;
    }

    /**
     * Check if a visitor has been seen on too many accounts (quick check for login/signup).
     */
    static async isDeviceSuspicious(visitorId: string): Promise<{
        suspicious: boolean;
        reason?: string;
        linkedAccounts: number;
    }> {
        const [result] = await db
            .select({
                userCount: sql<number>`COUNT(DISTINCT ${deviceHistory.userId})`,
            })
            .from(deviceHistory)
            .where(eq(deviceHistory.deviceFingerprint, visitorId));

        const linkedAccounts = Number(result.userCount);

        if (linkedAccounts >= 5) {
            return {
                suspicious: true,
                reason: `Device linked to ${linkedAccounts} accounts (threshold: 5)`,
                linkedAccounts,
            };
        }

        if (linkedAccounts >= 3) {
            return {
                suspicious: true,
                reason: `Device linked to ${linkedAccounts} accounts (elevated risk)`,
                linkedAccounts,
            };
        }

        return { suspicious: false, linkedAccounts };
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private static async createFraudEvent(
        userId: string,
        fraudType: string,
        severity: string,
        riskScore: number,
        details: Record<string, any>,
        ipAddress: string,
        deviceFingerprint: string
    ): Promise<void> {
        try {
            // Check for existing open event of same type to avoid duplicates
            const existing = await db.query.fraudEvents.findFirst({
                where: and(
                    eq(fraudEvents.userId, userId),
                    eq(fraudEvents.fraudType, fraudType),
                    eq(fraudEvents.status, "OPEN")
                ),
            });

            if (existing) {
                // Update existing event with new details
                await db
                    .update(fraudEvents)
                    .set({
                        details: { ...(existing.details as any), ...details, updatedAt: new Date().toISOString() },
                        riskScore: String(riskScore),
                    })
                    .where(eq(fraudEvents.id, existing.id));
                return;
            }

            await db.insert(fraudEvents).values({
                userId,
                fraudType,
                severity: severity as any,
                riskScore,
                status: "OPEN",
                details,
                ipAddress,
                deviceFingerprint,
                country: null,
            } as any);
        } catch (err) {
            logger.error({ err, userId, fraudType }, "Failed to create fraud event");
        }
    }
}

export default DeviceFingerprintService;
