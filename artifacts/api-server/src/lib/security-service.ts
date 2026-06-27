import { db } from "@workspace/db";
import {
  sessions,
  loginHistory,
  failedAttempts,
  securityIncidents,
  users,
  twoFactorSettings,
  otpCodes,
  rateLimitViolations,
  riskProfiles,
} from "@workspace/db";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { logger } from "./logger";
import crypto from "crypto";

export interface SessionCreateOptions {
  userId: string; // UUID
  ipAddress: string;
  userAgent?: string;
  deviceFingerprint?: string;
  country?: string;
  browser?: string;
  os?: string;
  expiresInMs?: number;
  requiresMfa?: boolean;
}

export interface LoginAttemptOptions {
  email: string;
  userId?: string;
  authMethod: string;
  ipAddress: string;
  userAgent?: string;
  country?: string;
  deviceFingerprint?: string;
  success: boolean;
  failureReason?: string;
  mfaRequired?: boolean;
  mfaVerified?: boolean;
}

export interface SecurityIncidentOptions {
  userId?: string;
  incidentType: string;
  severity?: string;
  description: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  country?: string;
  actionTaken?: string;
  metadata?: Record<string, unknown>;
}

export class SecurityService {
  // Session Management
  static async createSession(options: SessionCreateOptions): Promise<string> {
    try {
      const sessionToken = crypto.randomBytes(32).toString("hex");
      const expiresAt = new Date(
        Date.now() + (options.expiresInMs || 7 * 24 * 60 * 60 * 1000),
      ); // 7 days default

      const [inserted] = await db
        .insert(sessions)
        .values({
          userId: options.userId,
          sessionToken,
          ipAddress: options.ipAddress,
          userAgent: options.userAgent,
          deviceFingerprint: options.deviceFingerprint,
          country: options.country,
          browser: options.browser,
          os: options.os,
          expiresAt,
          isActive: true,
          requiresMfa: options.requiresMfa ?? false,
          mfaVerified: false,
        })
        .returning({ id: sessions.id });

      logger.info(
        { userId: options.userId, sessionId: inserted?.id },
        "Session created",
      );
      return sessionToken;
    } catch (error) {
      logger.error(error, "Failed to create session");
      throw error;
    }
  }

  static async getSession(sessionToken: string) {
    try {
      const session = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.sessionToken, sessionToken),
            eq(sessions.isActive, true),
            gte(sessions.expiresAt, new Date()),
          ),
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (session) {
        // Update last activity
        await db
          .update(sessions)
          .set({ lastActivityAt: new Date() })
          .where(eq(sessions.id, session.id));
      }

      return session || null;
    } catch (error) {
      logger.error(error, "Failed to retrieve session");
      return null;
    }
  }

  static async revokeSession(sessionId: number): Promise<boolean> {
    try {
      await db
        .update(sessions)
        .set({ isActive: false, revokedAt: new Date() })
        .where(eq(sessions.id, sessionId));
      return true;
    } catch (error) {
      logger.error(error, "Failed to revoke session");
      return false;
    }
  }

  static async revokeAllUserSessions(userId: string): Promise<boolean> {
    try {
      await db
        .update(sessions)
        .set({ isActive: false, revokedAt: new Date() })
        .where(
          and(
            eq(sessions.userId, userId),
            eq(sessions.isActive, true),
          ),
        );
      return true;
    } catch (error) {
      logger.error(error, "Failed to revoke all user sessions");
      return false;
    }
  }

  static async verifyMfaForSession(
    sessionId: number,
    mfaVerified: boolean,
  ): Promise<boolean> {
    try {
      await db
        .update(sessions)
        .set({ mfaVerified })
        .where(eq(sessions.id, sessionId));
      return true;
    } catch (error) {
      logger.error(error, "Failed to verify MFA for session");
      return false;
    }
  }

  // Login Tracking
  static async logLoginAttempt(options: LoginAttemptOptions): Promise<void> {
    try {
      if (!options.userId) {
        logger.warn("Cannot log login attempt without userId");
        return;
      }
      await db.insert(loginHistory).values({
        userId: options.userId,
        email: options.email,
        authMethod: options.authMethod,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        country: options.country,
        deviceFingerprint: options.deviceFingerprint,
        success: options.success,
        failureReason: options.failureReason,
        mfaRequired: options.mfaRequired,
        mfaVerified: options.mfaVerified,
      });

      if (!options.success) {
        await this.recordFailedAttempt(
          options.email,
          options.ipAddress,
          "login",
          options.failureReason,
        );
      }
    } catch (error) {
      logger.error(error, "Failed to log login attempt");
    }
  }

  // Failed Attempts Tracking
  static async recordFailedAttempt(
    email: string | null,
    ipAddress: string,
    attemptType: string,
    reason?: string,
  ): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(failedAttempts)
        .where(
          and(
            eq(failedAttempts.email, email || ""),
            eq(failedAttempts.ipAddress, ipAddress),
            eq(failedAttempts.attemptType, attemptType),
          ),
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (existing) {
        await db
          .update(failedAttempts)
          .set({
            count: existing.count + 1,
            lastAttemptAt: new Date(),
            lockedUntil:
              existing.count >= 5
                ? new Date(Date.now() + 15 * 60 * 1000) // 15 min lockout
                : null,
          })
          .where(eq(failedAttempts.id, existing.id));
      } else {
        await db.insert(failedAttempts).values({
          email,
          ipAddress,
          attemptType,
          reason,
          count: 1,
        });
      }
    } catch (error) {
      logger.error(error, "Failed to record failed attempt");
    }
  }

  static async isIpLocked(
    email: string | null,
    ipAddress: string,
    attemptType: string,
  ): Promise<boolean> {
    try {
      const record = await db
        .select()
        .from(failedAttempts)
        .where(
          and(
            eq(failedAttempts.email, email || ""),
            eq(failedAttempts.ipAddress, ipAddress),
            eq(failedAttempts.attemptType, attemptType),
          ),
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (record?.lockedUntil && record.lockedUntil > new Date()) {
        return true;
      }

      return false;
    } catch (error) {
      logger.error(error, "Failed to check IP lock status");
      return false;
    }
  }

  // Security Incident Tracking
  static async createSecurityIncident(
    options: SecurityIncidentOptions,
  ): Promise<number | null> {
    try {
      const [inserted] = await db
        .insert(securityIncidents)
        .values({
          userId: options.userId,
          incidentType: options.incidentType,
          severity: options.severity || "MEDIUM",
          description: options.description,
          ipAddress: options.ipAddress,
          deviceFingerprint: options.deviceFingerprint,
          country: options.country,
          actionTaken: options.actionTaken,
          status: "OPEN",
          isAutomatic: true,
          metadata: options.metadata,
        })
        .returning({ id: securityIncidents.id });

      logger.warn(
        { incidentType: options.incidentType, userId: options.userId },
        "Security incident created",
      );

      return inserted?.id ?? null;
    } catch (error) {
      logger.error(error, "Failed to create security incident");
      return null;
    }
  }

  // Threat Detection: Impossible Travel
  static async detectImpossibleTravel(
    userId: string,
    currentIp: string,
    currentCountry: string,
  ): Promise<boolean> {
    try {
      const recentLogins = await db
        .select()
        .from(loginHistory)
        .where(
          and(
            eq(loginHistory.userId, userId),
            eq(loginHistory.success, true),
            gte(
              loginHistory.createdAt,
              new Date(Date.now() - 60 * 60 * 1000),
            ), // Last hour
          ),
        )
        .orderBy(desc(loginHistory.createdAt))
        .limit(2);

      if (recentLogins.length < 2) return false;

      const lastLogin = recentLogins[1];
      const timeDiffMinutes =
        (Date.now() - lastLogin.createdAt.getTime()) / (60 * 1000);

      // If country changed and not enough time to travel
      if (lastLogin.country && lastLogin.country !== currentCountry) {
        if (timeDiffMinutes < 60) {
          // Would need 60+ min to travel between countries realistically
          await this.createSecurityIncident({
            userId,
            incidentType: "IMPOSSIBLE_TRAVEL",
            severity: "HIGH",
            description: `Impossible travel detected: ${lastLogin.country} to ${currentCountry} in ${timeDiffMinutes} minutes`,
            ipAddress: currentIp,
            country: currentCountry,
            actionTaken: "REQUIRE_2FA",
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error(error, "Failed to detect impossible travel");
      return false;
    }
  }

  // Threat Detection: Concurrent Sessions
  static async detectConcurrentSessions(
    userId: string,
    currentIp: string,
  ): Promise<boolean> {
    try {
      const activeSessions = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, userId),
            eq(sessions.isActive, true),
            gte(sessions.lastActivityAt, new Date(Date.now() - 5 * 60 * 1000)), // Active in last 5 min
          ),
        );

      // If more than 1 concurrent session with different IPs
      if (activeSessions.length > 1) {
        const uniqueIps = new Set(activeSessions.map((s) => s.ipAddress));
        if (uniqueIps.size > 1 && !activeSessions.some((s) => s.ipAddress === currentIp)) {
          await this.createSecurityIncident({
            userId,
            incidentType: "CONCURRENT_SESSIONS",
            severity: "MEDIUM",
            description: `Concurrent sessions detected from ${uniqueIps.size} different IPs`,
            ipAddress: currentIp,
            actionTaken: "LOG_ALERT",
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error(error, "Failed to detect concurrent sessions");
      return false;
    }
  }

  // Brute Force Detection
  static async detectBruteForce(ipAddress: string): Promise<boolean> {
    try {
      const attempts = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(failedAttempts)
        .where(
          and(
            eq(failedAttempts.ipAddress, ipAddress),
            gte(
              failedAttempts.lastAttemptAt,
              new Date(Date.now() - 10 * 60 * 1000),
            ), // Last 10 minutes
          ),
        )
        .then((rows) => rows[0]?.count ?? 0);

      if (attempts > 5) {
        await this.createSecurityIncident({
          incidentType: "BRUTE_FORCE",
          severity: "HIGH",
          description: `Brute force attack detected from IP: ${ipAddress} (${attempts} attempts)`,
          ipAddress,
          actionTaken: "BLOCK_IP",
        });
        return true;
      }

      return false;
    } catch (error) {
      logger.error(error, "Failed to detect brute force");
      return false;
    }
  }

  // Rate Limit Violation Tracking
  static async recordRateLimitViolation(
    userId: string | undefined,
    endpoint: string,
    ipAddress: string,
    method: string,
    requestCount: number,
    limitPerWindow: number,
    windowMs: number,
  ): Promise<void> {
    try {
      await db.insert(rateLimitViolations).values({
        userId,
        endpoint,
        ipAddress,
        method,
        requestCount,
        limitPerWindow,
        windowMs,
        actionTaken: "RATE_LIMITED",
      });

      // If severe violations, create incident
      if (requestCount > limitPerWindow * 3) {
        await this.createSecurityIncident({
          userId,
          incidentType: "SEVERE_RATE_LIMIT",
          severity: "MEDIUM",
          description: `Severe rate limit violations on ${endpoint}`,
          ipAddress,
        });
      }
    } catch (error) {
      logger.error(error, "Failed to record rate limit violation");
    }
  }

  // OTP Management
  static async generateOtp(options: {
    userId?: string;
    email?: string;
    phoneNumber?: string;
    purpose: string;
    expiresInMinutes?: number;
  }): Promise<string | null> {
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
      const expiresAt = new Date(
        Date.now() + (options.expiresInMinutes || 10) * 60 * 1000,
      );

      await db.insert(otpCodes).values({
        userId: options.userId,
        email: options.email,
        phoneNumber: options.phoneNumber,
        code,
        purpose: options.purpose,
        expiresAt,
      });

      return code;
    } catch (error) {
      logger.error(error, "Failed to generate OTP");
      return null;
    }
  }

  static async verifyOtp(
    code: string,
    purpose: string,
    email?: string,
    userId?: string,
  ): Promise<boolean> {
    try {
      const otp = await db
        .select()
        .from(otpCodes)
        .where(
          and(
            eq(otpCodes.code, code),
            eq(otpCodes.purpose, purpose),
            email ? eq(otpCodes.email, email) : eq(otpCodes.userId, userId || ""),
            eq(otpCodes.isUsed, false),
            gte(otpCodes.expiresAt, new Date()),
          ),
        )
        .limit(1)
        .then((rows) => rows[0]);

      if (!otp) {
        return false;
      }

      if (otp.attempts >= otp.maxAttempts) {
        return false;
      }

      // Mark as used
      await db
        .update(otpCodes)
        .set({ isUsed: true, usedAt: new Date(), attempts: otp.attempts + 1 })
        .where(eq(otpCodes.id, otp.id));

      return true;
    } catch (error) {
      logger.error(error, "Failed to verify OTP");
      return false;
    }
  }
}
