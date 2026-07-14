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
      await SecurityService.revokeSession(req.legacyAuth?.sessionId as unknown as number ?? 0);
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

      // legacyAuth.user is set by authMiddleware (session-based); fall back to DB lookup
      const legacyUser = (req as any).legacyAuth?.user;
      const userEmail = legacyUser?.email ?? req.auth.email ?? "";
      const setup = TOTPService.generateSetup(userEmail);

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
      const legacySessionId = (req as any).legacyAuth?.sessionId as number | undefined;
      const legacySessionToken = (req as any).legacyAuth?.sessionToken as string | undefined;
      if (legacySessionId) {
        await SecurityService.verifyMfaForSession(legacySessionId, true);

        // Rotate session after MFA verification (privilege escalation)
        const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";
        const newToken = await SessionHardeningService.rotateSession(
          legacySessionId, String(req.auth.userId), ipAddress, req.headers["user-agent"]
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
      const legacySessionId2 = (req as any).legacyAuth?.sessionId as number | undefined;
      if (legacySessionId2) {
        await SecurityService.verifyMfaForSession(legacySessionId2, true);
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

/**
 * GET /api/auth/onboarding-status
 * Returns whether the authenticated user needs to complete the password-setup
 * step. Called by the /auth/create-password page and DashboardRoute guard.
 */
router.get("/onboarding-status", async (req, res) => {
  try {
    const auth = (req as any).auth;
    if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db
      .select({ onboardingCompleted: users.onboardingCompleted })
      .from(users)
      .where(eq(users.clerkId, auth.userId))
      .limit(1);

    return res.json({ onboardingCompleted: user?.onboardingCompleted ?? true });
  } catch {
    return res.json({ onboardingCompleted: true });
  }
});

/**
 * POST /api/auth/create-password
 * Consumes a one-time onboarding token, sets the user's password via Supabase
 * admin API, marks onboarding_completed = true, and returns the Supabase
 * session so the client can auto-login.
 *
 * Body: { token: string, password: string }
 */
import { verifyOnboardingToken } from "../lib/onboarding-token";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";

router.post("/create-password", async (req, res) => {
  try {
    const { token, password: newPassword } = req.body || {};

    if (!token || !newPassword || typeof newPassword !== "string") {
      return res.status(400).json({ error: "token and password are required" });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // Verify the signed token
    const payload = verifyOnboardingToken(token);
    if (!payload) {
      return res.status(400).json({ error: "Invalid or expired setup link. Please contact support." });
    }

    // Check onboarding not already completed (one-time use enforcement)
    const [user] = await db
      .select({ id: users.id, onboardingCompleted: users.onboardingCompleted, clerkId: users.clerkId })
      .from(users)
      .where(eq(users.clerkId, payload.userId))
      .limit(1);

    if (user?.onboardingCompleted) {
      return res.status(409).json({
        error: "Password already set. Please sign in normally.",
        alreadyCompleted: true,
      });
    }

    // Build admin client
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      return res.status(503).json({ error: "Auth service not configured" });
    }
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false }, realtime: { transport: ws } });

    // Set the password on the Supabase auth user
    const { error: updateErr } = await admin.auth.admin.updateUserById(payload.userId, {
      password: newPassword,
      email_confirm: true,
    });
    if (updateErr) {
      logger.error({ updateErr, userId: payload.userId }, "create-password: supabase update failed");
      return res.status(500).json({ error: "Failed to set password. Please try again." });
    }

    // Mark onboarding completed in public.users
    await db
      .update(users)
      .set({ onboardingCompleted: true, updatedAt: new Date() })
      .where(eq(users.clerkId, payload.userId));

    // Sign the user in so the frontend gets a live session immediately
    const anonKey = process.env.SUPABASE_ANON_KEY || "";
    const anonClient = createClient(supabaseUrl, anonKey, { realtime: { transport: ws } });
    const { data: session, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: payload.email,
      password: newPassword,
    });

    if (signInErr || !session?.session) {
      // Password set OK — client can sign in themselves
      return res.json({ success: true, session: null });
    }

    return res.json({ success: true, session: session.session });
  } catch (err) {
    logger.error({ err }, "create-password error");
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/auth/forgot-password
 * Sends a password reset email via Resend (bypasses Supabase email rate limit).
 * Body: { email: string }
 */
import { sendEmail } from "../lib/email";

/**
 * GET /api/auth/email-diagnostic
 * Returns the email/Supabase config state (no secrets exposed).
 * Used to diagnose why reset emails aren't sending.
 */
router.get("/email-diagnostic", async (_req, res) => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const siteUrl = process.env.SITE_URL;

  // Test Resend connectivity if key present
  let resendStatus = "not_configured";
  let resendError = "";
  let resendDomains: string[] = [];
  if (resendKey) {
    try {
      const r = await fetch("https://api.resend.com/domains", {
        headers: { Authorization: `Bearer ${resendKey}` },
      });
      resendStatus = r.ok ? "connected" : `error_${r.status}`;
      if (r.ok) {
        const d = await r.json() as any;
        resendDomains = (d?.data || []).map((x: any) => `${x.name} [${x.status}]`);
      } else {
        resendError = await r.text();
      }
    } catch (e: any) {
      resendStatus = "fetch_failed";
      resendError = e.message;
    }
  }

  // Do a real test send to capture exact error
  let sendTestResult = "skipped";
  let sendTestError = "";
  if (resendKey) {
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "FundedWealth <onboarding@resend.dev>",
          to: "diagnostic-test@resend.dev",
          subject: "FundedWealth diagnostic test",
          html: "<p>test</p>",
        }),
      });
      if (r.ok) {
        sendTestResult = "success";
      } else {
        sendTestResult = `failed_${r.status}`;
        sendTestError = await r.text();
      }
    } catch (e: any) {
      sendTestResult = "exception";
      sendTestError = e.message;
    }
  }

  // Test Supabase admin connectivity
  let supabaseStatus = "not_configured";
  if (supabaseUrl && serviceKey) {
    try {
      const admin = createClient(supabaseUrl, serviceKey, {
        auth: { persistSession: false },
        realtime: { transport: ws },
      });
      const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
      supabaseStatus = error ? `error: ${error.message}` : "connected";
    } catch (e: any) {
      supabaseStatus = `fetch_failed: ${e.message}`;
    }
  }

  res.json({
    supabase: {
      url: supabaseUrl ? supabaseUrl.substring(0, 40) + "..." : "MISSING",
      serviceKey: serviceKey ? "set (" + serviceKey.length + " chars)" : "MISSING",
      status: supabaseStatus,
    },
    resend: {
      apiKey: resendKey ? "set (" + resendKey.length + " chars)" : "MISSING",
      status: resendStatus,
      error: resendError || undefined,
      verifiedDomains: resendDomains,
      sendTest: sendTestResult,
      sendTestError: sendTestError || undefined,
    },
    siteUrl: siteUrl || "NOT SET (using https://fundedwealth.com)",
  });
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email is required." });
    }

    const normalizedEmail = ValidationService.normalizeEmail(email);

    // ── Check RESEND_API_KEY first ──────────────────────────────────────────
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
      logger.error({ email: normalizedEmail }, "forgot-password: RESEND_API_KEY not set — email cannot be sent");
      return res.status(503).json({ error: "Email service not configured. Please contact support." });
    }

    // ── Build Supabase admin client ─────────────────────────────────────────
    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) {
      logger.error({ email: normalizedEmail }, "forgot-password: Supabase env vars missing");
      return res.status(503).json({ error: "Auth service not configured." });
    }
    const admin = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
      realtime: { transport: ws },
    });

    // ── Generate reset link (server-side, no Supabase email) ────────────────
    const { data, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email: normalizedEmail,
      options: {
        redirectTo: `${process.env.SITE_URL || "https://fundedwealth.com"}/reset-password`,
      },
    });

    if (linkErr) {
      logger.error({ linkErr, email: normalizedEmail }, "forgot-password: generateLink failed");
      // Return 200 to avoid email enumeration — but log clearly
      return res.json({ success: true, _debug: "link_gen_failed" });
    }

    const resetLink = data?.properties?.action_link;
    if (!resetLink) {
      logger.error({ email: normalizedEmail, data }, "forgot-password: no action_link in response");
      return res.json({ success: true, _debug: "no_action_link" });
    }

    // ── Send via Resend ─────────────────────────────────────────────────────
    const sent = await sendEmail({
      to: normalizedEmail,
      subject: "Reset Your FundedWealth Password",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
          <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
          <h2 style="color:#FF8A3D;margin-bottom:16px;">Reset Your Password</h2>
          <p style="color:rgba(255,255,255,0.7);line-height:1.6;">You requested a password reset for your FundedWealth account.</p>
          <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Click the button below to set a new password. This link expires in <strong>1 hour</strong>.</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#4A00E0,#7C3AED);color:white;text-decoration:none;padding:14px 32px;border-radius:12px;font-weight:bold;font-size:16px;">
              Reset Password
            </a>
          </div>
          <p style="color:rgba(255,255,255,0.4);font-size:13px;line-height:1.6;">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
          <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm · support@fundedwealth.com</p>
        </div>
      `,
    });

    if (!sent) {
      logger.error({ email: normalizedEmail }, "forgot-password: Resend API call failed — check RESEND_API_KEY and domain verification");
      return res.status(503).json({ error: "Failed to send reset email. Please try again or contact support." });
    }

    logger.info({ email: normalizedEmail }, "forgot-password: reset email sent via Resend");
    return res.json({ success: true });

  } catch (err) {
    logger.error({ err }, "forgot-password: unexpected error");
    return res.status(500).json({ error: "Server error. Please try again." });
  }
});

export default router;
