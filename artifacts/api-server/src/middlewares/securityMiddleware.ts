import { Request, Response, NextFunction } from "express";
import { SecurityService } from "../lib/security-service";
import { RBACService } from "../lib/rbac-service";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

/**
 * Session & Authentication Middleware
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    // Skip auth for public endpoints
    const publicPaths = [
      "/api/health",
      "/api/auth/login",
      "/api/auth/register",
      "/api/auth/forgot-password",
      "/api/auth/reset-password",
      "/api/auth/oauth",
      "/api/auth/magic-link",
    ];

    if (publicPaths.some((path) => req.path.startsWith(path))) {
      return next();
    }

    // Get session token from header or cookie
    const authHeader = req.headers.authorization;
    const sessionToken =
      authHeader?.replace("Bearer ", "") || req.cookies?.sessionToken;

    if (!sessionToken) {
      return res
        .status(401)
        .json({ error: "Authentication required" });
    }

    // Validate session
    const session = await SecurityService.getSession(sessionToken);
    if (!session) {
      return res
        .status(401)
        .json({ error: "Invalid or expired session" });
    }

    // Get user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, session.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!user) {
      return res
        .status(401)
        .json({ error: "User not found" });
    }

    // Set auth context
    req.auth = {
      userId: user.id,
      sessionId: session.id,
      sessionToken,
      user,
      email: user.email,
      role: user.role,
    };

    // Check if 2FA is required and verified
    if (session.requiresMfa && !session.mfaVerified) {
      // Allow only 2FA verification endpoints
      if (!req.path.includes("/2fa")) {
        return res
          .status(403)
          .json({ error: "2FA verification required" });
      }
    }

    // Get user permissions
    const userPermissions = await RBACService.getUserPermissions(user.id);
    req.permissions = userPermissions;

    next();
  } catch (error) {
    logger.error(error, "Auth middleware error");
    res.status(500).json({ error: "Authentication error" });
  }
}

/**
 * RBAC Middleware - Check permissions
 */
export function rbacMiddleware(requiredPermissions: string | string[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.auth?.userId) {
        return res
          .status(401)
          .json({ error: "Authentication required" });
      }

      const permissions = Array.isArray(requiredPermissions)
        ? requiredPermissions
        : [requiredPermissions];

      const hasPermission = await RBACService.hasAnyPermission(
        req.auth.userId,
        permissions,
      );

      if (!hasPermission) {
        logger.warn(
          {
            userId: req.auth.userId,
            requiredPermissions: permissions,
            userPermissions: req.permissions,
          },
          "Permission denied",
        );

        return res
          .status(403)
          .json({ error: "Insufficient permissions" });
      }

      next();
    } catch (error) {
      logger.error(error, "RBAC middleware error");
      res.status(500).json({ error: "Authorization error" });
    }
  };
}

/**
 * Admin Security Middleware - Mandatory 2FA, IP logging, action logging
 */
export async function adminSecurityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.auth?.userId) {
      return res
        .status(401)
        .json({ error: "Authentication required" });
    }

    const user = req.auth.user;

    // Check if admin
    if (!["admin", "super_admin"].includes(user.role)) {
      return res
        .status(403)
        .json({ error: "Admin access required" });
    }

    // SECURITY: Enforce 2FA for all admin actions
    const session = await SecurityService.getSession(req.auth.sessionToken!);
    if (session?.requiresMfa && !session.mfaVerified) {
      return res
        .status(403)
        .json({ error: "2FA verification required for admin actions", code: "MFA_REQUIRED" });
    }

    // Log admin action for audit trail
    logger.info(
      {
        userId: req.auth.userId,
        method: req.method,
        path: req.path,
        ip: req.ip,
        query: req.query,
      },
      "Admin action",
    );

    next();
  } catch (error) {
    logger.error(error, "Admin security middleware error");
    res.status(500).json({ error: "Admin security check failed" });
  }
}

/**
 * Session Activity Tracking
 */
export async function sessionActivityMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (req.auth?.sessionId) {
      // Update last activity (async, non-blocking)
      SecurityService.getSession(req.auth.sessionToken!).catch((err) =>
        logger.error(err, "Failed to update session activity"),
      );
    }

    next();
  } catch (error) {
    logger.error(error, "Session activity middleware error");
    next(); // Don't block request
  }
}

/**
 * Threat Detection Middleware
 */
export async function threatDetectionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.auth?.userId) {
      return next();
    }

    const ipAddress = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "";
    
    // This would be enhanced in Phase 3 with more sophisticated detection
    // For now, just check brute force
    const isBruteForce = await SecurityService.detectBruteForce(ipAddress);
    if (isBruteForce) {
      return res
        .status(429)
        .json({ error: "Too many requests. Your IP has been temporarily blocked." });
    }

    next();
  } catch (error) {
    logger.error(error, "Threat detection middleware error");
    next(); // Don't block request on middleware error
  }
}

/**
 * Request Validation Middleware
 */
export function validateRequestBody(schema: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        return res
          .status(400)
          .json({
            error: "Invalid request body",
            details: result.error.errors,
          });
      }

      req.body = result.data;
      next();
    } catch (error) {
      logger.error(error, "Request validation error");
      res.status(400).json({ error: "Request validation failed" });
    }
  };
}
