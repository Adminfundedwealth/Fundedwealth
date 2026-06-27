/**
 * Payment Fingerprint Service
 *
 * Detects same UPI/bank/crypto wallet across multiple accounts.
 * Stores SHA-256 hashes only — never raw payment identifiers.
 */

import { createHash } from "node:crypto";
import { db } from "@workspace/db";
import { paymentFingerprints, fraudEvents, users } from "@workspace/db";
import { eq, and, ne, sql, count } from "drizzle-orm";
import { logger } from "./logger";

export type FingerprintType = "upi" | "bank_account" | "crypto_wallet" | "razorpay_customer";

export interface PaymentFingerprintResult {
    stored: boolean;
    isDuplicate: boolean;
    linkedUserCount: number;
    linkedUserIds: string[];
    riskContribution: number;
}

export class PaymentFingerprintService {
    /**
     * Hash a payment identifier (UPI ID, account number, wallet address).
     */
    static hash(value: string): string {
        const normalized = value.trim().toLowerCase().replace(/\s+/g, "");
        return createHash("sha256").update(normalized).digest("hex");
    }

    /**
     * Record a payment fingerprint and check for duplicates.
     */
    static async record(
        userId: string,
        type: FingerprintType,
        rawValue: string,
        source: string
    ): Promise<PaymentFingerprintResult> {
        if (!rawValue || rawValue.trim().length < 3) {
            return { stored: false, isDuplicate: false, linkedUserCount: 0, linkedUserIds: [], riskContribution: 0 };
        }

        const hash = this.hash(rawValue);

        try {
            // Upsert (ignore if already exists for this user)
            await db.insert(paymentFingerprints).values({
                userId,
                fingerprintType: type,
                fingerprintHash: hash,
                source,
            }).onConflictDoNothing();

            // Check for other users with same hash
            const others = await db
                .select({ userId: paymentFingerprints.userId })
                .from(paymentFingerprints)
                .where(
                    and(
                        eq(paymentFingerprints.fingerprintHash, hash),
                        eq(paymentFingerprints.fingerprintType, type),
                        ne(paymentFingerprints.userId, userId)
                    )
                );

            const linkedUserIds = others.map((o) => o.userId);
            const linkedUserCount = linkedUserIds.length + 1; // Include current user

            if (linkedUserIds.length > 0) {
                // Create fraud event
                await this.createFraudEvent(userId, type, hash, linkedUserIds);
            }

            const riskContribution = this.calculateRisk(linkedUserCount);

            return {
                stored: true,
                isDuplicate: linkedUserIds.length > 0,
                linkedUserCount,
                linkedUserIds,
                riskContribution,
            };
        } catch (err) {
            logger.error({ err, userId, type }, "Payment fingerprint record failed");
            return { stored: false, isDuplicate: false, linkedUserCount: 0, linkedUserIds: [], riskContribution: 0 };
        }
    }

    /**
     * Calculate payment risk score contribution.
     */
    static calculateRisk(linkedUserCount: number): number {
        if (linkedUserCount >= 5) return 60;
        if (linkedUserCount >= 3) return 40;
        if (linkedUserCount >= 2) return 25;
        return 0;
    }

    /**
     * Check if a payout should be blocked (payment method linked to restricted account).
     */
    static async shouldBlockPayout(userId: string): Promise<{ blocked: boolean; reason?: string }> {
        const userFingerprints = await db
            .select({ fingerprintHash: paymentFingerprints.fingerprintHash, fingerprintType: paymentFingerprints.fingerprintType })
            .from(paymentFingerprints)
            .where(eq(paymentFingerprints.userId, userId));

        for (const fp of userFingerprints) {
            // Find other users sharing this payment method
            const linkedUsers = await db
                .select({ userId: paymentFingerprints.userId })
                .from(paymentFingerprints)
                .where(
                    and(
                        eq(paymentFingerprints.fingerprintHash, fp.fingerprintHash),
                        ne(paymentFingerprints.userId, userId)
                    )
                );

            for (const linked of linkedUsers) {
                const [linkedUser] = await db
                    .select({ accountStatus: users.accountStatus })
                    .from(users)
                    .where(eq(users.id, linked.userId))
                    .limit(1);

                if (linkedUser?.accountStatus && ["restricted", "suspended", "banned"].includes(linkedUser.accountStatus)) {
                    return {
                        blocked: true,
                        reason: `Payment method (${fp.fingerprintType}) linked to ${linkedUser.accountStatus} account (userId=${linked.userId})`,
                    };
                }
            }
        }

        return { blocked: false };
    }

    /**
     * Get shared payment fingerprints (admin dashboard).
     */
    static async getSharedFingerprints(): Promise<any[]> {
        const shared = await db
            .select({
                fingerprintType: paymentFingerprints.fingerprintType,
                fingerprintHash: paymentFingerprints.fingerprintHash,
                userCount: sql<number>`COUNT(DISTINCT ${paymentFingerprints.userId})`,
            })
            .from(paymentFingerprints)
            .groupBy(paymentFingerprints.fingerprintType, paymentFingerprints.fingerprintHash)
            .having(sql`COUNT(DISTINCT ${paymentFingerprints.userId}) >= 2`)
            .orderBy(sql`COUNT(DISTINCT ${paymentFingerprints.userId}) DESC`)
            .limit(50);

        const enriched = [];
        for (const s of shared) {
            const linkedUsers = await db
                .select({ userId: paymentFingerprints.userId, source: paymentFingerprints.source })
                .from(paymentFingerprints)
                .where(
                    and(
                        eq(paymentFingerprints.fingerprintHash, s.fingerprintHash),
                        eq(paymentFingerprints.fingerprintType, s.fingerprintType)
                    )
                );
            enriched.push({
                type: s.fingerprintType,
                hash: s.fingerprintHash.slice(0, 12) + "...",
                userCount: Number(s.userCount),
                users: linkedUsers,
            });
        }
        return enriched;
    }

    /**
     * Get fingerprints for a specific user (admin).
     */
    static async getUserFingerprints(userId: string): Promise<any[]> {
        const fps = await db
            .select()
            .from(paymentFingerprints)
            .where(eq(paymentFingerprints.userId, userId));

        const enriched = [];
        for (const fp of fps) {
            const [shared] = await db
                .select({ count: sql<number>`COUNT(DISTINCT ${paymentFingerprints.userId})` })
                .from(paymentFingerprints)
                .where(eq(paymentFingerprints.fingerprintHash, fp.fingerprintHash));

            enriched.push({
                ...fp,
                fingerprintHash: fp.fingerprintHash.slice(0, 12) + "...",
                sharedWithCount: Number(shared.count) - 1,
            });
        }
        return enriched;
    }

    private static async createFraudEvent(
        userId: string,
        type: FingerprintType,
        hash: string,
        linkedUserIds: string[]
    ): Promise<void> {
        try {
            await db.insert(fraudEvents).values({
                userId,
                fraudType: "PAYMENT_METHOD_REUSE",
                severity: linkedUserIds.length >= 4 ? "CRITICAL" : "HIGH",
                riskScore: this.calculateRisk(linkedUserIds.length + 1),
                status: "OPEN",
                details: {
                    fingerprintType: type,
                    fingerprintHash: hash.slice(0, 16),
                    linkedUserIds,
                    linkedCount: linkedUserIds.length + 1,
                    detectedAt: new Date().toISOString(),
                },
                ipAddress: null,
                deviceFingerprint: null,
                country: null,
            } as any);
        } catch (err) {
            logger.error({ err, userId, type }, "Failed to create PAYMENT_METHOD_REUSE event");
        }
    }
}

export default PaymentFingerprintService;
