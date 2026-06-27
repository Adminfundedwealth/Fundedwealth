/**
 * Audit Logging Service
 *
 * Provides comprehensive audit trail for all sensitive operations.
 * All state-changing actions by admins and sensitive user operations are logged.
 */

import { db } from "@workspace/db";
import { auditLogs } from "@workspace/db";
import { logger } from "./logger";

export type AuditAction =
  // Admin actions
  | "ADMIN_LOGIN"
  | "ADMIN_ROLE_CHANGE"
  | "ADMIN_ACCOUNT_SUSPEND"
  | "ADMIN_ACCOUNT_UNSUSPEND"
  | "ADMIN_PAYMENT_APPROVE"
  | "ADMIN_PAYMENT_REJECT"
  | "ADMIN_REFUND"
  | "ADMIN_KYC_APPROVE"
  | "ADMIN_KYC_REJECT"
  | "ADMIN_FRAUD_RESOLVE"
  | "ADMIN_FRAUD_BLOCK"
  | "ADMIN_CONFIG_CHANGE"
  // User actions
  | "USER_LOGIN"
  | "USER_LOGOUT"
  | "USER_REGISTER"
  | "USER_PASSWORD_CHANGE"
  | "USER_2FA_ENABLE"
  | "USER_2FA_DISABLE"
  | "USER_PAYMENT_DETAILS_UPDATE"
  | "USER_KYC_SUBMIT"
  | "USER_PAYOUT_REQUEST"
  // Payment events
  | "PAYMENT_CREATED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_PROVISIONED"
  | "PAYMENT_FAILED"
  | "PAYMENT_REFUNDED"
  // Security events
  | "SECURITY_BRUTE_FORCE"
  | "SECURITY_IMPOSSIBLE_TRAVEL"
  | "SECURITY_ACCOUNT_BLOCKED"
  | "SECURITY_SESSION_REVOKED"
  | "SECURITY_RATE_LIMIT_EXCEEDED";

export interface AuditEntry {
  adminId: string;
  action: AuditAction;
  entity: string;
  entityId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Log an audit event. Never throws — audit failures are logged but don't block operations.
   */
  static async log(entry: AuditEntry): Promise<void> {
    try {
      await db.insert(auditLogs).values({
        adminId: entry.adminId as unknown as number,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId,
        details: JSON.stringify(entry.details || {}),
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
      });
    } catch (error) {
      // Never throw on audit failure — log and continue
      logger.error(
        { error, action: entry.action, entity: entry.entity },
        "Audit log write failed",
      );
    }
  }

  /**
   * Log an admin action with request context.
   */
  static async logAdminAction(
    req: any,
    action: AuditAction,
    entity: string,
    entityId: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    const userId = req.auth?.userId || req.adminUser?.id || "";
    const ipAddress =
      (req.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";

    await AuditService.log({
      adminId: String(userId),
      action,
      entity,
      entityId: String(entityId),
      details: {
        ...details,
        method: req.method,
        path: req.path,
      },
      ipAddress,
      userAgent: req.headers?.["user-agent"],
    });
  }

  /**
   * Log a user action with request context.
   */
  static async logUserAction(
    req: any,
    action: AuditAction,
    entity: string,
    entityId: string,
    details?: Record<string, unknown>,
  ): Promise<void> {
    const userId = req.auth?.userId || "";
    const ipAddress =
      (req.headers?.["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "";

    await AuditService.log({
      adminId: String(userId),
      action,
      entity,
      entityId: String(entityId),
      details,
      ipAddress,
      userAgent: req.headers?.["user-agent"],
    });
  }
}

export default AuditService;
