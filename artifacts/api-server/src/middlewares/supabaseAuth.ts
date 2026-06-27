import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";

declare global {
    namespace Express {
        interface Request {
            auth?: {
                userId: string;
                sessionId?: number;
                sessionToken?: string;
                user?: any;
                email?: string;
                role?: string;
            };
            adminUser?: typeof users.$inferSelect;
            permissions?: string[];
        }
    }
}

const ADMIN_ROLES = ["super_admin", "admin", "support", "compliance", "finance"];

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabaseAdmin = supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    })
    : null;

/**
 * Extract the Bearer token from the Authorization header.
 */
function extractToken(req: Request): string | null {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return null;
    return authHeader.slice(7);
}

/**
 * Middleware: Verifies Supabase JWT and attaches auth info to request.
 * Replaces Clerk's clerkMiddleware() — attaches req.auth globally.
 */
export async function supabaseAuthMiddleware(req: Request, _res: Response, next: NextFunction) {
    const token = extractToken(req);
    if (!token || !supabaseAdmin) {
        // No token or Supabase not configured — proceed without auth
        return next();
    }

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
        if (error || !user) {
            return next(); // Invalid token — proceed without auth
        }

        (req as any).auth = {
            userId: user.id,
            sessionId: undefined,
            email: user.email,
        };
    } catch {
        // Token verification failed — proceed without auth
    }

    next();
}

/**
 * Middleware: Requires a valid Supabase session.
 * Returns 401 if no valid session.
 * Drop-in replacement for the old clerkAuth middleware.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.auth?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
}

/**
 * Middleware: Requires auth AND admin role.
 * Looks up user in DB by Supabase user ID.
 * Drop-in replacement for clerkAdminAuth.
 */
export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
    try {
        if (!req.auth?.userId) {
            return res.status(401).json({ error: "Unauthorized" });
        }

        // Look up user by Supabase ID (stored in clerkId column)
        let [user] = await db
            .select()
            .from(users)
            .where(eq(users.clerkId, req.auth.userId))
            .limit(1);

        // Fallback: link by email if not found by ID (Clerk → Supabase migration)
        if (!user && req.auth.email) {
            [user] = await db
                .select()
                .from(users)
                .where(eq(users.email, req.auth.email))
                .limit(1);
            if (user) {
                await db
                    .update(users)
                    .set({ clerkId: req.auth.userId })
                    .where(eq(users.id, user.id));
            }
        }

        if (!user || !ADMIN_ROLES.includes(user.role)) {
            return res.status(403).json({ error: "Admin access required" });
        }

        (req as any).adminUser = user;
        next();
    } catch (err) {
        console.error("[requireAdminAuth] Error checking admin role:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

/**
 * Helper function: Get auth from request (replaces getAuth from @clerk/express)
 */
export function getAuth(req: Request) {
    return (req as any).auth || null;
}

export default requireAuth;
