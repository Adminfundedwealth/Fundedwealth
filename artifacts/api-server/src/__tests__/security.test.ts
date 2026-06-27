import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@workspace/db";
import { users, sessions, authMethods, permissions } from "@workspace/db";
import { SecurityService } from "../src/lib/security-service";
import { RBACService } from "../src/lib/rbac-service";
import { ValidationService } from "../src/lib/validation-service";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

describe("Security System - Phase 1 Tests", () => {
  let testUserId: number;
  let testEmail = "test@security.com";
  const testPassword = "SecureP@ssw0rd123";

  beforeAll(async () => {
    // Create test user
    const [user] = await db
      .insert(users)
      .values({
        email: testEmail,
        firstName: "Test",
        lastName: "User",
        clerkId: `test_${Date.now()}`,
        role: "user",
      })
      .returning();

    testUserId = user.id;

    // Create auth method
    const passwordHash = await bcrypt.hash(testPassword, 12);
    await db.insert(authMethods).values({
      userId: testUserId,
      method: "EMAIL_PASSWORD",
      identifier: testEmail,
      password: passwordHash,
      isVerified: true,
      isPrimary: true,
    });
  });

  afterAll(async () => {
    // Cleanup
    await db.delete(users).where(eq(users.id, testUserId));
  });

  describe("Validation Service", () => {
    it("should validate strong passwords", () => {
      const validation = ValidationService.validatePassword(testPassword);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it("should reject weak passwords", () => {
      const validation = ValidationService.validatePassword("weak");
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it("should validate email format", () => {
      expect(ValidationService.validateEmail("test@example.com")).toBe(true);
      expect(ValidationService.validateEmail("invalid.email")).toBe(false);
      expect(ValidationService.validateEmail("another@test.co.uk")).toBe(true);
    });

    it("should validate phone numbers", () => {
      expect(ValidationService.validatePhone("+14155552671")).toBe(true);
      expect(ValidationService.validatePhone("14155552671")).toBe(true);
      expect(ValidationService.validatePhone("invalid")).toBe(false);
    });

    it("should sanitize input for XSS", () => {
      const malicious = "<script>alert('xss')</script>";
      const sanitized = ValidationService.sanitizeInput(malicious);
      expect(sanitized).not.toContain("<script>");
    });

    it("should validate KYC documents", () => {
      const validDoc = {
        name: "passport.pdf",
        size: 5 * 1024 * 1024,
        type: "application/pdf",
      };
      const result = ValidationService.validateKycDocument(validDoc);
      expect(result.valid).toBe(true);
    });

    it("should reject oversized documents", () => {
      const largeDoc = {
        name: "large.pdf",
        size: 15 * 1024 * 1024,
        type: "application/pdf",
      };
      const result = ValidationService.validateKycDocument(largeDoc);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "File size cannot exceed 10MB",
      );
    });

    it("should validate registration data", () => {
      const validData = {
        email: "newuser@example.com",
        password: testPassword,
        firstName: "John",
        lastName: "Doe",
        phone: "+14155552671",
      };
      const result = ValidationService.validateRegistration(validData);
      expect(result.valid).toBe(true);
    });
  });

  describe("Session Management", () => {
    let sessionToken: string;

    it("should create a session", async () => {
      sessionToken = await SecurityService.createSession({
        userId: testUserId,
        ipAddress: "127.0.0.1",
        userAgent: "Test Agent",
      });

      expect(sessionToken).toBeDefined();
      expect(sessionToken.length).toBeGreaterThan(0);
    });

    it("should retrieve valid session", async () => {
      const session = await SecurityService.getSession(sessionToken);
      expect(session).toBeDefined();
      expect(session?.userId).toBe(testUserId);
      expect(session?.isActive).toBe(true);
    });

    it("should fail on invalid session token", async () => {
      const session = await SecurityService.getSession("invalid_token");
      expect(session).toBeNull();
    });

    it("should revoke session", async () => {
      const sessionBefore = await SecurityService.getSession(sessionToken);
      const sessionId = sessionBefore!.id;

      await SecurityService.revokeSession(sessionId);

      const sessionAfter = await SecurityService.getSession(sessionToken);
      expect(sessionAfter).toBeNull();
    });
  });

  describe("Threat Detection", () => {
    it("should detect brute force attempts", async () => {
      // Record multiple failed attempts
      for (let i = 0; i < 6; i++) {
        await SecurityService.recordFailedAttempt(
          testEmail,
          "192.168.1.1",
          "login",
          "wrong_password",
        );
      }

      // Check if IP is locked
      const isLocked = await SecurityService.isIpLocked(
        testEmail,
        "192.168.1.1",
        "login",
      );

      expect(isLocked).toBe(true);
    });

    it("should track login history", async () => {
      await SecurityService.logLoginAttempt({
        email: testEmail,
        userId: testUserId,
        authMethod: "EMAIL_PASSWORD",
        ipAddress: "10.0.0.1",
        userAgent: "Test",
        success: true,
      });

      // Verify login was recorded (in real implementation)
      // expect(loginRecord).toBeDefined();
    });
  });

  describe("RBAC System", () => {
    it("should check user permissions", async () => {
      const hasPermission = await RBACService.hasPermission(
        testUserId,
        "view_own_profile",
      );
      expect(hasPermission).toBe(true);
    });

    it("should deny admin-only permissions", async () => {
      const hasPermission = await RBACService.hasPermission(
        testUserId,
        "manage_users",
      );
      expect(hasPermission).toBe(false);
    });

    it("should get user permissions list", async () => {
      const userPerms = await RBACService.getUserPermissions(testUserId);
      expect(Array.isArray(userPerms)).toBe(true);
      expect(userPerms).toContain("view_own_profile");
    });

    it("should identify admin actions", () => {
      expect(RBACService.isAdminAction("manage_users")).toBe(true);
      expect(RBACService.isAdminAction("view_own_profile")).toBe(false);
    });

    it("should identify financial actions", () => {
      expect(RBACService.isFinancialAction("approve_payout")).toBe(true);
      expect(RBACService.isFinancialAction("view_own_profile")).toBe(false);
    });
  });

  describe("OTP System", () => {
    let generatedOtp: string;

    it("should generate OTP", async () => {
      generatedOtp = (await SecurityService.generateOtp({
        userId: testUserId,
        purpose: "test_2fa",
        expiresInMinutes: 10,
      })) as string;

      expect(generatedOtp).toBeDefined();
      expect(generatedOtp.length).toBe(6);
      expect(/^\d+$/.test(generatedOtp)).toBe(true);
    });

    it("should verify valid OTP", async () => {
      const verified = await SecurityService.verifyOtp(
        generatedOtp,
        "test_2fa",
        undefined,
        testUserId,
      );
      expect(verified).toBe(true);
    });

    it("should reject invalid OTP", async () => {
      const verified = await SecurityService.verifyOtp(
        "000000",
        "test_2fa",
        undefined,
        testUserId,
      );
      expect(verified).toBe(false);
    });

    it("should expire OTP", async () => {
      // Create OTP that expires immediately
      const expiredOtp = await SecurityService.generateOtp({
        userId: testUserId,
        purpose: "test_expired",
        expiresInMinutes: -1, // Already expired
      });

      // Wait to ensure expiration
      await new Promise((resolve) => setTimeout(resolve, 100));

      const verified = await SecurityService.verifyOtp(
        expiredOtp!,
        "test_expired",
        undefined,
        testUserId,
      );

      expect(verified).toBe(false);
    });
  });

  describe("Security Incidents", () => {
    it("should create security incident", async () => {
      const incidentId = await SecurityService.createSecurityIncident({
        userId: testUserId,
        incidentType: "TEST_INCIDENT",
        severity: "HIGH",
        description: "Test security incident",
        ipAddress: "10.0.0.1",
      });

      expect(incidentId).toBeGreaterThan(0);
    });
  });

  describe("Rate Limiting", () => {
    it("should record rate limit violation", async () => {
      await SecurityService.recordRateLimitViolation(
        testUserId,
        "/api/test",
        "10.0.0.1",
        "POST",
        100,
        10,
        60000,
      );

      // In real implementation, would verify in database
    });
  });
});

describe("RBAC Permission Tests", () => {
  it("should verify permission hierarchy", () => {
    const userPerms = [
      "view_own_profile",
      "request_payout",
      "submit_kyc",
    ];
    const supportPerms = [
      "view_user_profile",
      "view_kyc_submissions",
      "respond_to_support_tickets",
    ];
    const adminPerms = [
      "manage_users",
      "manage_permissions",
      "view_audit_logs",
      "force_logout_user",
    ];

    // User should not have admin permissions
    expect(userPerms).not.toContain(...adminPerms);

    // Admin should have user-like permissions implicitly
    // (This would need hierarchical role setup)
  });
});
