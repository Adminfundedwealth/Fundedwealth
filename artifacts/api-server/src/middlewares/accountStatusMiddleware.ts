/**
 * Account Status Enforcement Middleware
 *
 * Blocks restricted/suspended/banned users from performing
 * sensitive actions (payments, payouts, referrals, challenges).
 */

import { Request, Response, NextFunction } from "express";
import { getAuth } from "./supabaseAuth";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "../lib/logger";

/**
 * Blocks users with account_status = 'restricted', 'suspended', or 'banned'.
 * Use on: payments, payouts, referrals, challenge purchase.
 */
export function requireActiveAccount(req: Request, res: Response, next: NextFunction) {
    const auth = getAuth(req);
    if (!auth?.userId) {
        return res.status(401).json({ success: false, error: "Authentication required", message: "Authentication required" });
    }

    db.select({ accountStatus: users.accountStatus, riskLevel: users.riskLevel })
        .from(users)
        .where(eq(users.clerkId, auth.userId))
        .limit(1)
        .then(([user]) => {
            if (!user) {
                // User not yet in DB — allow through so downstream handlers
                // (e.g. getOrCreateUser) can create the record on first payment.
                // This is NOT a security risk: the user has a valid Supabase JWT.
                logger.info({ userId: auth.userId }, "User not in DB yet — allowing through for lazy creation");
                return next();
            }

            const status = user.accountStatus || "active";

            if (status === "banned" || status === "suspended") {
                logger.warn({ userId: auth.userId, status }, "Suspended/banned user blocked");
                return res.status(403).json({
                    success: false,
                    error: "Account suspended. Contact support for assistance.",
                    message: "Account suspended. Contact support for assistance.",
                    code: "ACCOUNT_SUSPENDED",
                    status,
                });
            }

            if (status === "restricted") {
                logger.warn({ userId: auth.userId, status }, "Restricted user blocked");
                return res.status(403).json({
                    success: false,
                    error: "Account restricted for security review. Contact support.",
                    message: "Account restricted for security review. Contact support.",
                    code: "ACCOUNT_RESTRICTED",
                    status,
                });
            }

            next();
        })
        .catch((err) => {
            logger.error({ err }, "Account status check failed");
            // SECURITY: Fail closed — block request if DB check fails
            return res.status(503).json({
                success: false,
                error: "Service temporarily unavailable. Please try again.",
                message: "Service temporarily unavailable. Please try again.",
                code: "SERVICE_UNAVAILABLE",
            });
        });
}

export default requireActiveAccount;
