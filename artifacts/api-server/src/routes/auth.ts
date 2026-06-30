import { Router } from "express";
import { db } from "@workspace/db";
import {
  users,
  authMethods,
  sessions,
  twoFactorSettings,
  loginHistory,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { SecurityService } from "../lib/security-service";
import { ValidationService } from "../lib/validation-service";
import { RBACService } from "../lib/rbac-service";
import { logger } from "../lib/logger";
import { AuditService } from "../lib/audit-service";
import { TOTPService } from "../lib/totp-service";
import { SessionHardeningService } from "../lib/session-hardening";
import { validateBody } from "../lib/api-security";
import { z } from "zod";
import {
  authMiddleware,
  rbacMiddleware,
  sessionActivityMiddleware,
} from "../middlewares/securityMiddleware";
import { IPIntelligenceService } from "../lib/ip-intelligence-service";
import { FraudDetectionService } from "../lib/fraud-detection-service";
import { requireTurnstile } from "../lib/turnstile-service";
import { randomBytes, scrypt as _scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(_scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString("hex")}`;
}

async function verifyPassword(password: string, storedHash: string | null | undefined) {
  const [salt, key] = storedHash?.split(":") ?? [];
  if (!salt || !key) {
    return false;
  }

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const storedKey = Buffer.from(key, "hex");
  return timingSafeEqual(derivedKey, storedKey);
}

const router = Router();

// ==================== Public Endpoints ====================

/**
 * GET /api/auth/check-email?email=xxx
 * Returns whether a Supabase Auth identity already exists for the given email.
 * Used by the checkout billing form to decide between "Create password" and
 * "Enter your existing password" — never reveals account details.
 */
router.get("/check-email", async (req, res) => {
  const email = (req.query.email as string || "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return res.status(400).json({ exists: false });
  }

  try {
    // Check public.users table for an existing entry with a real (non-guest) auth link
    const [existing] = await db
      .select({ clerkId: users.clerkId })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    // A user row with a non-guest clerkId means they have a Supabase Auth identity
    const exists = !!(existing && existing.clerkId && !existing.clerkId.startsWith("guest_"));
    return res.json({ exists });
  } catch {
    return res.json({ exists: false });
  }
});

/**
 * POST /api/auth/register
 * Register new user with email/password
 */
router.post("/register", requireTurnstile, async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate input
    const validation = ValidationService.validateRegistration({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    if (!validation.valid) {
      return res
        .status(400)
        .json({
          error: "Validation failed",
          details: validation.errors,
        });
    }

    // Normalize email
    const normalizedEmail = ValidationService.normalizeEmail(email);

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)
      .then((rows) => rows[0]);

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Email already registered" });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: normalizedEmail,
        firstName,
        lastName,
        phone,
        clerkId: `supabase_pending_${Date.now()}`, // Will be updated with Supabase user ID on first OAuth login
        role: "user",
      })
      .returning();

    // Create auth method
    await db.insert(authMethods).values({
      userId: newUser.id,
      method: "EMAIL_PASSWORD",
      identifier: normalizedEmail,
      password: passwordHash,
      isVerified: false,
      isPrimary: true,
    });

    // Create 2FA settings (disabled by default, mandatory for admins)
    await db.insert(twoFactorSettings).values({
      userId: newUser.id,
      enabled: false,
      isMandatory: false,
    });

    logger.info({ userId: newUser.id, email: normalizedEmail }, "User registered");

    // Run IPQS IP intelligence check (non-blocking for registration)
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    // Audit log
    AuditService.log({
      adminId: newUser.id,
      action: "USER_REGISTER",
      entity: "users",
      entityId: String(newUser.id),
      details: { email: normalizedEmail },
      ipAddress: clientIp,
      userAgent: req.headers["user-agent"],
    }).catch(() => {});

    // Fire and forget — don't block registration on IP lookup
    IPIntelligenceService.lookupAndStore(clientIp, newUser.id, "signup").catch((err) => {
      logger.error({ err, userId: newUser.id }, "IPQS signup lookup failed");
    });

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      userId: newUser.id,
    });
  } catch (error) {
    logger.error(error, "Registration error");
    res.status(500).json({ error: "Registration failed" });
  }
});

/**
 * POST /api/auth/login
 * Login with email/password
 */
import { loginLimiter } from "../lib/rate-limit";

router.post("/login", loginLimiter, requireTurnstile, async (req, res) => {
  try {
    const { email, password, ipAddress, userAgent } = req.body;

    // Validate input
    if (!ValidationService.validateEmail(email)) {
      return res
        .status(400)
        .json({ error: "Invalid email format" });
    }

    // Get IP from request
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";

    // Check if IP is locked (brute force)
    const isLocked = await SecurityService.isIpLocked(
      email,
      clientIp,
      "login",
    );

    if (isLocked) {
      await SecurityService.logLoginAttempt({
        email,
        authMethod: "EMAIL_PASSWORD",
        ipAddress: clientIp,
        userAgent: req.headers["user-agent"],
        success: false,
        failureReason: "account_locked",
      });

      return res
        .status(429)
        .json({ error: "Too many failed attempts. Please try again later." });
    }

    // Find user
    const normalizedEmail = ValidationService.normalizeEmail(email);
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      await SecurityService.logLoginAttempt({
        email,
        authMethod: "EMAIL_PASSWORD",
        ipAddress: clientIp,
        userAgent: req.headers["user-agent"],
        success: false,
        failureReason: "user_not_found",
      });

      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    // Get auth method
    const authMethod = await db
      .select()
      .from(authMethods)
      .where(
        and(
          eq(authMethods.userId, user.id),
          eq(authMethods.method, "EMAIL_PASSWORD"),
        ),
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (!authMethod?.password) {
      await SecurityService.logLoginAttempt({
        email,
        userId: user.id,
        authMethod: "EMAIL_PASSWORD",
        ipAddress: clientIp,
        userAgent: req.headers["user-agent"],
        success: false,
        failureReason: "auth_method_not_found",
      });

      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, authMethod.password);

    if (!passwordValid) {
      await SecurityService.logLoginAttempt({
        email,
        userId: user.id,
        authMethod: "EMAIL_PASSWORD",
        ipAddress: clientIp,
        userAgent: req.headers["user-agent"],
        success: false,
        failureReason: "wrong_password",
      });

      return res
        .status(401)
        .json({ error: "Invalid email or password" });
    }

    // Check for threats
    const impossibleTravel = await SecurityService.detectImpossibleTravel(
      user.id,
      clientIp,
      "US", // Would get from IP geolocation service
    );

    // Run IPQS IP intelligence during login (async, non-blocking for session creation)
    const ipIntelPromise = IPIntelligenceService.lookupAndStore(clientIp, user.id, "login").catch((err) => {
      logger.error({ err, userId: user.id }, "IPQS login lookup failed");
      return null;
    });

    // Get real device fingerprint from frontend (FingerprintJS visitorId)
    const deviceFingerprint =
      (req.headers["x-device-fingerprint"] as string) ||
      req.body.deviceFingerprint ||
      req.headers["user-agent"] ||
      "unknown";

    // Run full fraud detection pipeline in background (includes IPQS data)
    FraudDetectionService.detectAndScore({
      userId: user.id,
      ipAddress: clientIp,
      deviceFingerprint,
      country: "unknown", // Will be populated from IPQS result
      userEmail: normalizedEmail,
      trigger: "login",
    }).catch((err) => {
      logger.error({ err, userId: user.id }, "Fraud detection during login failed");
    });

    // Check 2FA requirement
    const twoFaSettings = await db
      .select()
      .from(twoFactorSettings)
      .where(eq(twoFactorSettings.userId, user.id))
      .limit(1)
      .then((rows) => rows[0]);

    const requiresMfa =
      twoFaSettings?.enabled ||
      twoFaSettings?.isMandatory ||
      impossibleTravel ||
      ["admin", "super_admin"].includes(user.role);

    // Create session
    const sessionToken = await SecurityService.createSession({
      userId: user.id,
      ipAddress: clientIp,
      userAgent: req.headers["user-agent"],
      expiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days
      requiresMfa,
    });

    // Enforce concurrent session limit (max 5)
    SessionHardeningService.enforceConcurrentLimit(user.id).catch((err) =>
      logger.error({ err, userId: user.id }, "Session limit enforcement failed"));

    // Log successful login
    await SecurityService.logLoginAttempt({
      email,
      userId: user.id,
      authMethod: "EMAIL_PASSWORD",
      ipAddress: clientIp,
      userAgent: req.headers["user-agent"],
      success: true,
      mfaRequired: requiresMfa,
    });

    logger.info(
      { userId: user.id, email: normalizedEmail },
      "User logged in",
    );

    // Audit log
    AuditService.log({
      adminId: user.id,
      action: "USER_LOGIN",
      entity: "users",
      entityId: String(user.id),
      details: { email: normalizedEmail, authMethod: "EMAIL_PASSWORD", requiresMfa },
      ipAddress: clientIp,
      userAgent: req.headers["user-agent"],
    }).catch(() => {});

    res.json({
      message: "Login successful",
      sessionToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      requiresMfa,
      requiresMfaReason: impossibleTravel ? "impossible_travel" : undefined,
    });
  } catch (error) {
    logger.error(error, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

/**
 * POST /api/auth/logout
 */
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    if (req.auth?.sessionId) {
      await SecurityService.revokeSession(req.auth.sessionId);
    }

    logger.info({ userId: req.auth?.userId }, "User logged out");

    res.json({ message: "Logout successful" });
  } catch (error) {
    logger.error(error, "Logout error");
    res.status(500).json({ error: "Logout failed" });
  }
});

/**
 * POST /api/auth/logout-all
 * Logout all sessions
 */
router.post(
  "/logout-all",
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.auth?.userId) {
        return res
          .status(401)
          .json({ error: "Authentication required" });
      }

      await SecurityService.revokeAllUserSessions(req.auth.userId);

      logger.info(
        { userId: req.auth.userId },
        "User logged out from all devices",
      );

      res.json({ message: "Logged out from all devices" });
    } catch (error) {
      logger.error(error, "Logout all error");
      res.status(500).json({ error: "Logout failed" });
    }
  },
);

/**
 * POST /api/auth/2fa/setup
 * Generate TOTP secret + QR URI + backup codes.
 */
router.post(
  "/2fa/setup",
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.auth?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const user = req.auth.user;
      const setup = TOTPService.generateSetup(user.email);

      // Store secret temporarily (not enabled until verified)
      await db
        .update(twoFactorSettings)
        .set({ totpSecret: setup.secret, method: "totp", updatedAt: new Date() })
        .where(eq(twoFactorSettings.userId, req.auth.userId));

      logger.info({ userId: req.auth.userId }, "TOTP 2FA setup initiated");

      res.json({
        secret: setup.secret,
        uri: setup.uri,
        backupCodes: setup.backupCodes,
        message: "Scan the QR code with Google Authenticator, Microsoft Authenticator, or Authy. Then verify with a code.",
      });
    } catch (error) {
      logger.error(error, "2FA setup error");
      res.status(500).json({ error: "2FA setup failed" });
    }
  },
);

/**
 * POST /api/auth/2fa/verify
 * Verify a TOTP code to enable 2FA or complete MFA challenge.
 */
router.post(
  "/2fa/verify",
  authMiddleware,
  validateBody(z.object({ code: z.string().min(6).max(10) })),
  async (req, res) => {
    try {
      const { code } = req.body;

      if (!req.auth?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Get TOTP secret
      const [twoFa] = await db
        .select()
        .from(twoFactorSettings)
        .where(eq(twoFactorSettings.userId, req.auth.userId))
        .limit(1);

      if (!twoFa?.totpSecret) {
        return res.status(400).json({ error: "2FA not set up. Call /2fa/setup first." });
      }

      // Verify TOTP code
      const result = await TOTPService.verify(req.auth.userId, code, twoFa.totpSecret);

      if (!result.valid) {
        return res.status(400).json({
          error: result.error || "Invalid code",
          locked: result.locked,
          remainingAttempts: result.remainingAttempts,
        });
      }

      // Enable 2FA if not already enabled
      if (!twoFa.enabled) {
        const backupCodes = TOTPService.generateBackupCodes();
        await TOTPService.enable(req.auth.userId, twoFa.totpSecret, backupCodes);

        AuditService.log({
          adminId: req.auth.userId,
          action: "USER_2FA_ENABLE",
          entity: "two_factor_settings",
          entityId: String(req.auth.userId),
        }).catch(() => {});

        return res.json({ message: "2FA enabled successfully", backupCodes });
      }

      // Mark session MFA as verified
      if (req.auth.sessionId) {
        await SecurityService.verifyMfaForSession(req.auth.sessionId, true);

        // Rotate session after MFA verification (privilege escalation)
        const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
        const newToken = await SessionHardeningService.rotateSession(
          req.auth.sessionId, String(req.auth.userId), ipAddress, req.headers["user-agent"]
        );

        if (newToken) {
          return res.json({ message: "2FA verified", sessionToken: newToken });
        }
      }

      res.json({ message: "2FA verified" });
    } catch (error) {
      logger.error(error, "2FA verification error");
      res.status(500).json({ error: "2FA verification failed" });
    }
  },
);

/**
 * POST /api/auth/2fa/recover
 * Use a backup code to bypass TOTP (single-use).
 */
router.post(
  "/2fa/recover",
  authMiddleware,
  validateBody(z.object({ code: z.string().min(8).max(12) })),
  async (req, res) => {
    try {
      const { code } = req.body;

      if (!req.auth?.userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const [twoFa] = await db
        .select()
        .from(twoFactorSettings)
        .where(eq(twoFactorSettings.userId, req.auth.userId))
        .limit(1);

      if (!twoFa?.backupCodes) {
        return res.status(400).json({ error: "No backup codes available" });
      }

      const storedCodes: string[] = Array.isArray(twoFa.backupCodes) ? twoFa.backupCodes : JSON.parse(twoFa.backupCodes as string);
      const result = TOTPService.verifyBackupCode(code, storedCodes);

      if (!result.valid) {
        return res.status(400).json({ error: "Invalid backup code" });
      }

      // Update remaining codes
      await db
        .update(twoFactorSettings)
        .set({ backupCodes: JSON.stringify(result.remainingCodes), updatedAt: new Date() })
        .where(eq(twoFactorSettings.userId, req.auth.userId));

      // Mark session MFA verified
      if (req.auth.sessionId) {
        await SecurityService.verifyMfaForSession(req.auth.sessionId, true);
      }

      logger.info({ userId: req.auth.userId, remainingCodes: result.remainingCodes.length }, "Backup code used");

      res.json({
        message: "Backup code accepted. MFA verified.",
        remainingCodes: result.remainingCodes.length,
      });
    } catch (error) {
      logger.error(error, "2FA recovery error");
      res.status(500).json({ error: "Recovery failed" });
    }
  },
);

/**
 * GET /api/auth/sessions
 * Get all active sessions for user
 */
router.get(
  "/sessions",
  authMiddleware,
  async (req, res) => {
    try {
      if (!req.auth?.userId) {
        return res
          .status(401)
          .json({ error: "Authentication required" });
      }

      const userSessions = await db
        .select()
        .from(sessions)
        .where(
          and(
            eq(sessions.userId, req.auth.userId),
            eq(sessions.isActive, true),
          ),
        );

      res.json(userSessions);
    } catch (error) {
      logger.error(error, "Get sessions error");
      res.status(500).json({ error: "Failed to get sessions" });
    }
  },
);

/**
 * GET /api/auth/account-status
 * Returns the user's account_status for frontend enforcement.
 * Called after Supabase session is established.
 */
router.get("/account-status", async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select({
        accountStatus: users.accountStatus,
        riskLevel: users.riskLevel,
        riskScore: users.riskScore,
      })
      .from(users)
      .where(eq(users.clerkId, auth.userId))
      .limit(1);

    if (!user) {
      return res.json({ accountStatus: "active" });
    }

    res.json({
      accountStatus: user.accountStatus || "active",
      riskLevel: user.riskLevel || "LOW",
    });
  } catch {
    res.json({ accountStatus: "active" });
  }
});

export default router;
