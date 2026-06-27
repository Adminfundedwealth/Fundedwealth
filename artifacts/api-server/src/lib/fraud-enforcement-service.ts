/**
 * Fraud Enforcement Service
 * Applies account restrictions based on risk scoring.
 */

import { db, riskProfiles, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

export class FraudEnforcementService {
  /**
   * Enforce account restrictions based on risk score.
   */
  static async enforce(
    userId: string,
    riskScore: number,
    riskLevel: string
  ): Promise<void> {
    try {
      if (riskLevel === "CRITICAL" && riskScore >= 85) {
        // Block account
        await db
          .update(riskProfiles)
          .set({ isBlocked: true })
          .where(eq(riskProfiles.userId, userId));

        logger.warn({ userId, riskScore, riskLevel }, "Account blocked due to critical risk");
      } else if (riskLevel === "HIGH" && riskScore >= 60) {
        // Restrict payouts
        await db
          .update(riskProfiles)
          .set({ payoutRestricted: true, requiresManualReview: true })
          .where(eq(riskProfiles.userId, userId));

        logger.warn({ userId, riskScore, riskLevel }, "Payout restricted due to high risk");
      }
    } catch (error) {
      logger.error({ error, userId }, "Error enforcing fraud rules");
    }
  }
}
