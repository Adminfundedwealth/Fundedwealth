import { db, FraudEvent, InsertFraudEvent, RiskProfile } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import {
  fraudEvents,
  riskProfiles,
  deviceHistory,
  ipHistory,
  ipLookups,
  referralFraudLogs,
  users,
} from "@workspace/db";
import RiskScoringEngine, { RiskFactors } from "./risk-scoring-engine";
import { IPIntelligenceService, type IPIntelligenceResult } from "./ip-intelligence-service";
import { FraudEnforcementService } from "./fraud-enforcement-service";
import { logger } from "./logger";

export interface FraudDetectionContext {
  userId: string;
  ipAddress: string;
  deviceFingerprint: string;
  country: string;
  userEmail?: string;
  kycStatus?: string;
  accountAge?: number;
  trigger?: "signup" | "login" | "challenge_purchase" | "payout_request";
}

export class FraudDetectionService {
  /**
   * Main fraud detection pipeline
   */
  static async detectAndScore(context: FraudDetectionContext): Promise<RiskProfile> {
    try {
      // Run IPQS lookup for real VPN/proxy/TOR detection
      const ipIntelResult = await IPIntelligenceService.lookupAndStore(
        context.ipAddress,
        context.userId,
        context.trigger || "login"
      );

      // Store full lookup result in ip_lookups table
      await this.storeFullLookup(context, ipIntelResult);

      const factors: RiskFactors = {
        ipRisk: await this.calculateIpRisk(context),
        deviceRisk: await this.calculateDeviceRisk(context),
        behaviorRisk: await this.calculateBehaviorRisk(context),
        vpnProxyRisk: IPIntelligenceService.calculateVpnProxyRiskScore(ipIntelResult),
        kycRisk: await this.calculateKycRisk(context),
      };

      const riskScore = RiskScoringEngine.calculateRiskScore(factors);

      // Update risk profile
      const riskProfile = await this.updateRiskProfile(context.userId, riskScore);

      // Enforce account status based on score
      await FraudEnforcementService.enforce(
        context.userId,
        riskScore.totalScore,
        riskScore.riskLevel
      );

      // Log any fraud events detected
      if (riskScore.totalScore >= 50) {
        await this.logFraudEvent(context, riskScore);
      }

      return riskProfile;
    } catch (error) {
      logger.error(error, "Error in fraud detection");
      throw error;
    }
  }

  /**
   * Store the full IPQS lookup result for audit trail
   */
  private static async storeFullLookup(
    context: FraudDetectionContext,
    result: IPIntelligenceResult
  ): Promise<void> {
    try {
      await db.insert(ipLookups).values({
        userId: context.userId,
        ip: context.ipAddress,
        trigger: context.trigger || "login",
        vpnDetected: result.vpnDetected,
        proxyDetected: result.proxyDetected,
        torDetected: result.torDetected,
        datacenterDetected: result.datacenterDetected,
        fraudScore: result.fraudScore,
        country: result.country || null,
        region: result.region || null,
        city: result.city || null,
        isp: result.isp || null,
        asn: result.asn || null,
        organization: result.organization || null,
        connectionType: result.connectionType || null,
        abuseVelocity: result.abuseVelocity || null,
        recentAbuse: result.recentAbuse,
        isCrawler: result.isCrawler,
        mobile: result.mobile,
        lookupSuccess: result.lookupSuccess,
        lookupSource: result.lookupSource,
        errorMessage: result.error || null,
        rawResponse: result.rawResponse || null,
        vpnProxyRiskScore: IPIntelligenceService.calculateVpnProxyRiskScore(result),
      });
    } catch (err) {
      logger.error({ err, userId: context.userId }, "Failed to store full IP lookup");
    }
  }

  /**
   * Calculate IP-based risk
   */
  private static async calculateIpRisk(context: FraudDetectionContext): Promise<number> {
    try {
      // Check IP history
      const ipRecord = await db.query.ipHistory.findFirst({
        where: eq(ipHistory.ip, context.ipAddress),
      });

      const existingUserIps = await db
        .select()
        .from(ipHistory)
        .where(eq(ipHistory.userId, context.userId))
        .limit(10);

      let risk = 0;

      // Check for VPN/Proxy
      if (ipRecord?.vpnDetected) risk += 12;
      if (ipRecord?.proxyDetected) risk += 10;
      if (ipRecord?.torDetected) risk += 20;
      if (ipRecord?.datacenterDetected) risk += 8;

      // Check for country mismatch
      if (existingUserIps.length > 0) {
        const previousCountries = existingUserIps.map((ip) => ip.country);
        if (previousCountries.length > 0 && !previousCountries.includes(context.country)) {
          risk += 5;
        }
      }

      return Math.min(20, risk);
    } catch (error) {
      logger.error(error, "Error calculating IP risk");
      return 0;
    }
  }

  /**
   * Calculate device-based risk using FingerprintJS Pro visitorId.
   * Uses real fingerprint data instead of user-agent strings.
   */
  private static async calculateDeviceRisk(context: FraudDetectionContext): Promise<number> {
    try {
      // Skip placeholder fingerprints (user-agent fallback)
      const isFallbackFingerprint =
        !context.deviceFingerprint ||
        context.deviceFingerprint === "unknown" ||
        context.deviceFingerprint.startsWith("Mozilla/");

      if (isFallbackFingerprint) {
        // No real fingerprint available — return minimal risk from device count
        const userDevices = await db
          .select()
          .from(deviceHistory)
          .where(eq(deviceHistory.userId, context.userId))
          .limit(10);

        return userDevices.length > 5 ? 10 : 0;
      }

      // Real FingerprintJS visitorId available
      let risk = 0;

      // Check if this fingerprint is used by multiple users (multi-account)
      const usersOnDevice = await db
        .select({ userId: deviceHistory.userId })
        .from(deviceHistory)
        .where(eq(deviceHistory.deviceFingerprint, context.deviceFingerprint));

      const uniqueUsers = new Set(usersOnDevice.map((d) => d.userId));

      if (uniqueUsers.size > 3) {
        risk += 20; // 4+ accounts on same device = maximum risk
      } else if (uniqueUsers.size > 1) {
        risk += 18; // 2-3 accounts on same device = very high
      }

      // Check device change frequency (many different devices for same user)
      const userDevices = await db
        .select()
        .from(deviceHistory)
        .where(eq(deviceHistory.userId, context.userId))
        .orderBy(desc(deviceHistory.lastSeen))
        .limit(10);

      if (userDevices.length > 5) {
        risk += 10; // Frequent device changes
      } else if (userDevices.length > 3) {
        risk += 5;
      }

      return Math.min(20, risk);
    } catch (error) {
      logger.error(error, "Error calculating device risk");
      return 0;
    }
  }

  /**
   * Calculate behavior-based risk
   */
  private static async calculateBehaviorRisk(context: FraudDetectionContext): Promise<number> {
    try {
      let risk = 0;

      // Check recent fraud events
      const recentFraudEvents = await db
        .select()
        .from(fraudEvents)
        .where(
          and(
            eq(fraudEvents.userId, context.userId),
            sql`created_at > now() - interval '24 hours'`
          )
        );

      if (recentFraudEvents.length > 3) {
        risk += 12; // Multiple fraud flags in 24h
      }

      // Check for rapid logins
      const accountAge = context.accountAge || 0;
      if (accountAge < 7 && recentFraudEvents.length > 0) {
        risk += 10; // New account with suspicious behavior
      }

      return Math.min(30, risk);
    } catch (error) {
      logger.error(error, "Error calculating behavior risk");
      return 0;
    }
  }

  /**
   * Calculate KYC-based risk
   */
  private static async calculateKycRisk(context: FraudDetectionContext): Promise<number> {
    let risk = 0;

    if (context.kycStatus === "rejected") {
      risk += 15;
    } else if (context.kycStatus === "pending") {
      risk += 8;
    } else if (context.kycStatus === "approved") {
      risk += 0;
    }

    return Math.min(15, risk);
  }

  /**
   * Detect multi-account fraud
   */
  static async detectMultiAccountFraud(context: FraudDetectionContext): Promise<void> {
    try {
      // Find other users with same IP
      const sameIpUsers = await db.query.ipHistory.findMany({
        where: eq(ipHistory.ip, context.ipAddress),
        limit: 20,
      });

      // Find other users with same device
      const sameDeviceUsers = await db.query.deviceHistory.findMany({
        where: eq(deviceHistory.deviceFingerprint, context.deviceFingerprint),
        limit: 20,
      });

      const suspiciousUserIds = new Set<string>();
      sameIpUsers.forEach((ip) => suspiciousUserIds.add(ip.userId));
      sameDeviceUsers.forEach((device) => suspiciousUserIds.add(device.userId));

      // Flag all suspicious accounts
      for (const suspiciousUserId of suspiciousUserIds) {
        if (suspiciousUserId !== context.userId) {
          await this.createFraudEvent({
            userId: suspiciousUserId,
            fraudType: "MULTI_ACCOUNT",
            severity: "HIGH",
            riskScore: 75,
            status: "OPEN",
            details: {
              sharedWithUser: context.userId,
              sharedIp: context.ipAddress,
              sharedDevice: context.deviceFingerprint,
            },
            ipAddress: context.ipAddress,
            deviceFingerprint: context.deviceFingerprint,
            country: context.country,
          } as any);
        }
      }
    } catch (error) {
      logger.error(error, "Error detecting multi-account fraud");
    }
  }

  /**
   * Detect referral fraud
   */
  static async detectReferralFraud(
    referrerId: string,
    referredUserId: string,
    ipAddress: string,
    deviceFingerprint: string
  ): Promise<void> {
    try {
      // Check for self-referral
      if (referrerId === referredUserId) {
        await db.insert(referralFraudLogs).values({
          referrerId,
          referredUserId,
          fraudReason: "SELF_REFERRAL",
          riskScore: "100",
          ipAddress,
          deviceFingerprint,
          status: "OPEN",
        });
        return;
      }

      // Check for referrals from same IP
      const sameIpReferrals = await db
        .select()
        .from(referralFraudLogs)
        .where(
          and(
            eq(referralFraudLogs.referrerId, referrerId),
            eq(referralFraudLogs.ipAddress, ipAddress)
          )
        );

      if (sameIpReferrals.length > 2) {
        await db.insert(referralFraudLogs).values({
          referrerId,
          referredUserId,
          fraudReason: "SAME_IP",
          riskScore: "85",
          ipAddress,
          deviceFingerprint,
          status: "OPEN",
        });
      }
    } catch (error) {
      logger.error(error, "Error detecting referral fraud");
    }
  }

  /**
   * Create fraud event
   */
  private static async createFraudEvent(fraudData: InsertFraudEvent): Promise<FraudEvent> {
    const result = await db
      .insert(fraudEvents)
      .values(fraudData)
      .returning();
    return result[0];
  }

  /**
   * Update user risk profile
   */
  private static async updateRiskProfile(
    userId: string,
    riskScore: ReturnType<typeof RiskScoringEngine.calculateRiskScore>
  ): Promise<RiskProfile> {
    const existing = await db.query.riskProfiles.findFirst({
      where: eq(riskProfiles.userId, userId),
    });

    const profileData = {
      userId,
      riskScore: String(riskScore.totalScore),
      riskLevel: riskScore.riskLevel,
      isBlocked: riskScore.isBlocked,
      payoutRestricted: riskScore.payoutRestricted,
      requiresManualReview: riskScore.requiresReview,
    };

    if (existing) {
      const updated = await db
        .update(riskProfiles)
        .set(profileData)
        .where(eq(riskProfiles.userId, userId))
        .returning();
      return updated[0];
    } else {
      const created = await db.insert(riskProfiles).values(profileData).returning();
      return created[0];
    }
  }

  /**
   * Log fraud event with details
   */
  private static async logFraudEvent(
    context: FraudDetectionContext,
    riskScore: ReturnType<typeof RiskScoringEngine.calculateRiskScore>
  ): Promise<void> {
    const fraudType = riskScore.totalScore >= 85 ? "CRITICAL_BEHAVIOR" : "SUSPICIOUS_BEHAVIOR";
    const severity = riskScore.riskLevel === "CRITICAL" ? "CRITICAL" : "HIGH";

    await this.createFraudEvent({
      userId: context.userId,
      fraudType,
      severity: severity as any,
      riskScore: riskScore.totalScore,
      status: "OPEN",
      details: riskScore.factors,
      ipAddress: context.ipAddress,
      deviceFingerprint: context.deviceFingerprint,
      country: context.country,
    } as any);
  }

  /**
   * Get user fraud history
   */
  static async getFraudHistory(userId: string, days: number = 30): Promise<FraudEvent[]> {
    // Validate days is a safe integer to prevent injection
    const safeDays = Math.min(Math.max(Math.floor(Number(days) || 30), 1), 365);
    const cutoffDate = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000);

    return await db
      .select()
      .from(fraudEvents)
      .where(
        and(
          eq(fraudEvents.userId, userId),
          sql`created_at > ${cutoffDate}`
        )
      )
      .orderBy(desc(fraudEvents.createdAt));
  }

  /**
   * Resolve fraud event
   */
  static async resolveFraudEvent(
    eventId: number,
    resolvedBy: string,
    notes: string
  ): Promise<FraudEvent> {
    const updated = await db
      .update(fraudEvents)
      .set({
        status: "RESOLVED",
        resolvedBy,
        resolvedAt: new Date(),
        notes,
      })
      .where(eq(fraudEvents.id, eventId))
      .returning();
    return updated[0];
  }

  /**
   * Block user account
   */
  static async blockUser(userId: string, reason: string): Promise<RiskProfile> {
    const updated = await db
      .update(riskProfiles)
      .set({
        isBlocked: true,
        notes: reason,
      })
      .where(eq(riskProfiles.userId, userId))
      .returning();
    return updated[0];
  }

  /**
   * Get high-risk users
   */
  static async getHighRiskUsers(limit: number = 50): Promise<any[]> {
    return await db
      .select({
        riskProfile: riskProfiles,
        user: users,
      })
      .from(riskProfiles)
      .leftJoin(users, eq(riskProfiles.userId, users.id))
      .where(
        and(
          eq(riskProfiles.riskLevel, "HIGH"),
          eq(riskProfiles.requiresManualReview, true)
        )
      )
      .orderBy(desc(riskProfiles.riskScore))
      .limit(limit);
  }
}

export default FraudDetectionService;
