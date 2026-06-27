/**
 * KYC Duplicate Detection Service
 *
 * Prevents same PAN/Aadhaar/passport across multiple accounts.
 * Detects duplicate document uploads via SHA-256 hashing.
 */

import { createHash } from "node:crypto";
import { db } from "@workspace/db";
import { kycSubmissions, kycDocuments, fraudEvents, users } from "@workspace/db";
import { eq, and, ne, sql, or } from "drizzle-orm";
import { logger } from "./logger";

export interface DuplicateCheckResult {
    isDuplicate: boolean;
    duplicateUserId?: string;
    duplicateUserEmail?: string;
    reason?: string;
}

export interface DocumentHashResult {
    hash: string;
    isDuplicate: boolean;
    duplicateUserId?: string;
    duplicateDocumentId?: number;
}

export class KycDuplicateService {
    /**
     * Check if a document number already exists for another user.
     */
    static async checkDocumentNumber(
        documentType: string,
        documentNumber: string,
        currentUserId: string
    ): Promise<DuplicateCheckResult> {
        if (!documentNumber || documentNumber.trim().length < 3) {
            return { isDuplicate: false };
        }

        const normalized = documentNumber.trim().toUpperCase().replace(/\s+/g, "");

        try {
            // Check kyc_submissions table
            const existing = await db
                .select({
                    id: kycSubmissions.id,
                    userId: kycSubmissions.userId,
                    status: kycSubmissions.status,
                })
                .from(kycSubmissions)
                .where(
                    and(
                        eq(kycSubmissions.documentType, documentType),
                        sql`UPPER(TRIM(${kycSubmissions.documentNumber})) = ${normalized}`,
                        ne(kycSubmissions.userId, currentUserId),
                        sql`${kycSubmissions.status} IN ('pending', 'approved', 'submitted')`
                    )
                )
                .limit(1);

            if (existing.length > 0) {
                const dupUserId = existing[0].userId;
                const [dupUser] = await db
                    .select({ email: users.email })
                    .from(users)
                    .where(eq(users.id, dupUserId))
                    .limit(1);

                // Create fraud event
                await this.createDuplicateFraudEvent(
                    currentUserId,
                    dupUserId,
                    documentType,
                    normalized,
                    null
                );

                return {
                    isDuplicate: true,
                    duplicateUserId: dupUserId,
                    duplicateUserEmail: dupUser?.email,
                    reason: `${documentType} number already registered on another account`,
                };
            }

            // Also check kyc_documents table
            const existingDoc = await db
                .select({
                    id: kycDocuments.id,
                    userId: kycDocuments.userId,
                })
                .from(kycDocuments)
                .where(
                    and(
                        eq(kycDocuments.documentType, documentType),
                        sql`UPPER(TRIM(${kycDocuments.documentNumber})) = ${normalized}`,
                        ne(kycDocuments.userId, currentUserId),
                        eq(kycDocuments.isLatestVersion, true)
                    )
                )
                .limit(1);

            if (existingDoc.length > 0) {
                await this.createDuplicateFraudEvent(
                    currentUserId,
                    existingDoc[0].userId,
                    documentType,
                    normalized,
                    null
                );

                return {
                    isDuplicate: true,
                    duplicateUserId: existingDoc[0].userId,
                    reason: `${documentType} number already registered on another account`,
                };
            }

            return { isDuplicate: false };
        } catch (error) {
            logger.error({ error, documentType, currentUserId }, "Duplicate document check error");
            return { isDuplicate: false };
        }
    }

    /**
     * Generate SHA-256 hash of a document file buffer.
     */
    static hashDocument(buffer: Buffer): string {
        return createHash("sha256").update(buffer).digest("hex");
    }

    /**
     * Check if a document file hash already exists for another user.
     */
    static async checkDocumentHash(
        hash: string,
        currentUserId: string
    ): Promise<DocumentHashResult> {
        try {
            const existing = await db
                .select({
                    id: kycDocuments.id,
                    userId: kycDocuments.userId,
                    documentType: kycDocuments.documentType,
                })
                .from(kycDocuments)
                .where(
                    and(
                        sql`${kycDocuments.documentHash} = ${hash}`,
                        ne(kycDocuments.userId, currentUserId),
                        eq(kycDocuments.isLatestVersion, true)
                    )
                )
                .limit(1);

            if (existing.length > 0) {
                await this.createDuplicateFraudEvent(
                    currentUserId,
                    existing[0].userId,
                    existing[0].documentType || "UNKNOWN",
                    null,
                    hash
                );

                return {
                    hash,
                    isDuplicate: true,
                    duplicateUserId: existing[0].userId,
                    duplicateDocumentId: existing[0].id,
                };
            }

            return { hash, isDuplicate: false };
        } catch (error) {
            logger.error({ error, currentUserId }, "Document hash check error");
            return { hash, isDuplicate: false };
        }
    }

    /**
     * Get duplicate info for admin dashboard (during KYC review).
     */
    static async getDuplicateInfo(userId: string): Promise<{
        duplicateDocNumbers: { type: string; number: string; otherUserIds: string[] }[];
        duplicateHashes: { hash: string; otherUserIds: string[] }[];
        totalDuplicates: number;
    }> {
        const duplicateDocNumbers: { type: string; number: string; otherUserIds: string[] }[] = [];
        const duplicateHashes: { hash: string; otherUserIds: string[] }[] = [];

        // Check submissions for this user
        const userSubmissions = await db
            .select()
            .from(kycSubmissions)
            .where(eq(kycSubmissions.userId, userId));

        for (const sub of userSubmissions) {
            if (!sub.documentNumber) continue;
            const normalized = sub.documentNumber.trim().toUpperCase();

            const others = await db
                .select({ userId: kycSubmissions.userId })
                .from(kycSubmissions)
                .where(
                    and(
                        sql`UPPER(TRIM(${kycSubmissions.documentNumber})) = ${normalized}`,
                        eq(kycSubmissions.documentType, sub.documentType),
                        ne(kycSubmissions.userId, userId)
                    )
                );

            if (others.length > 0) {
                duplicateDocNumbers.push({
                    type: sub.documentType,
                    number: this.maskDocumentNumber(normalized),
                    otherUserIds: others.map((o) => o.userId),
                });
            }
        }

        // Check document hashes
        const userDocs = await db
            .select()
            .from(kycDocuments)
            .where(and(eq(kycDocuments.userId, userId), eq(kycDocuments.isLatestVersion, true)));

        for (const doc of userDocs) {
            if (!(doc as any).documentHash) continue;
            const hash = (doc as any).documentHash as string;

            const others = await db
                .select({ userId: kycDocuments.userId })
                .from(kycDocuments)
                .where(
                    and(
                        sql`${kycDocuments.documentHash} = ${hash}`,
                        ne(kycDocuments.userId, userId),
                        eq(kycDocuments.isLatestVersion, true)
                    )
                );

            if (others.length > 0) {
                duplicateHashes.push({
                    hash: hash.slice(0, 12) + "...",
                    otherUserIds: others.map((o) => o.userId),
                });
            }
        }

        return {
            duplicateDocNumbers,
            duplicateHashes,
            totalDuplicates: duplicateDocNumbers.length + duplicateHashes.length,
        };
    }

    /**
     * Create a DUPLICATE_KYC fraud event.
     */
    private static async createDuplicateFraudEvent(
        userId: string,
        duplicateUserId: string,
        documentType: string,
        documentNumber: string | null,
        documentHash: string | null
    ): Promise<void> {
        try {
            await db.insert(fraudEvents).values({
                userId,
                fraudType: "DUPLICATE_KYC",
                severity: "CRITICAL",
                riskScore: 90,
                status: "OPEN",
                details: {
                    duplicateUserId,
                    documentType,
                    documentNumber: documentNumber ? this.maskDocumentNumber(documentNumber) : null,
                    documentHash: documentHash ? documentHash.slice(0, 16) : null,
                    detectedAt: new Date().toISOString(),
                },
                ipAddress: null,
                deviceFingerprint: null,
                country: null,
            } as any);

            logger.warn(
                { userId, duplicateUserId, documentType },
                "DUPLICATE_KYC fraud event created"
            );
        } catch (err) {
            logger.error({ err, userId, duplicateUserId }, "Failed to create DUPLICATE_KYC event");
        }
    }

    /**
     * Mask document number for logging (show first 2 + last 2 only).
     */
    private static maskDocumentNumber(num: string): string {
        if (num.length <= 4) return "****";
        return num.slice(0, 2) + "*".repeat(num.length - 4) + num.slice(-2);
    }
}

export default KycDuplicateService;
