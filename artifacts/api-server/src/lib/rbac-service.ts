/**
 * RBAC (Role-Based Access Control) Service
 * Production implementation with role → permission mapping.
 */

import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

/**
 * Role hierarchy and permission matrix.
 * Permissions use "resource:action" format.
 */
const ROLE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    "users:read", "users:write", "users:delete", "users:manage_roles",
    "payments:read", "payments:write", "payments:refund", "payments:approve",
    "accounts:read", "accounts:write", "accounts:suspend",
    "kyc:read", "kyc:approve", "kyc:reject",
    "fraud:read", "fraud:resolve", "fraud:block",
    "blog:read", "blog:write", "blog:delete",
    "reports:read", "reports:export",
    "system:read", "system:write", "system:config",
    "audit:read",
  ],
  admin: [
    "users:read", "users:write",
    "payments:read", "payments:write", "payments:refund", "payments:approve",
    "accounts:read", "accounts:write", "accounts:suspend",
    "kyc:read", "kyc:approve", "kyc:reject",
    "fraud:read", "fraud:resolve",
    "blog:read", "blog:write", "blog:delete",
    "reports:read",
    "audit:read",
  ],
  finance: [
    "payments:read", "payments:write", "payments:refund", "payments:approve",
    "accounts:read",
    "reports:read", "reports:export",
    "audit:read",
  ],
  compliance: [
    "users:read",
    "kyc:read", "kyc:approve", "kyc:reject",
    "fraud:read", "fraud:resolve", "fraud:block",
    "accounts:read",
    "audit:read",
  ],
  support: [
    "users:read",
    "payments:read",
    "accounts:read",
    "kyc:read",
    "fraud:read",
  ],
  user: [
    "self:read", "self:write",
    "self:payments", "self:accounts",
  ],
};

export class RBACService {
  /**
   * Get all permissions for a user by their ID.
   */
  static async getUserPermissions(userId: string): Promise<string[]> {
    try {
      const [user] = await db
        .select({ role: users.role })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) return [];

      return ROLE_PERMISSIONS[user.role] || ROLE_PERMISSIONS["user"] || [];
    } catch (error) {
      logger.error({ error, userId }, "Failed to get user permissions");
      return [];
    }
  }

  /**
   * Get permissions for a role directly.
   */
  static getPermissionsForRole(role: string): string[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Check if a user has any of the specified permissions.
   */
  static async hasAnyPermission(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await RBACService.getUserPermissions(userId);
    return permissions.some((p) => userPermissions.includes(p));
  }

  /**
   * Check if a user has ALL specified permissions.
   */
  static async hasAllPermissions(userId: string, permissions: string[]): Promise<boolean> {
    const userPermissions = await RBACService.getUserPermissions(userId);
    return permissions.every((p) => userPermissions.includes(p));
  }

  /**
   * Check if a role is an admin-level role.
   */
  static isAdminRole(role: string): boolean {
    return ["super_admin", "admin", "finance", "compliance", "support"].includes(role);
  }

  /**
   * Validate that a role transition is allowed.
   * Only super_admin can assign admin roles.
   */
  static canAssignRole(assignerRole: string, targetRole: string): boolean {
    if (assignerRole === "super_admin") return true;
    if (assignerRole === "admin" && !["super_admin", "admin"].includes(targetRole)) return true;
    return false;
  }
}
