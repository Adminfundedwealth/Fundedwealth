/**
 * DEPRECATED: Clerk proxy is no longer needed.
 * Auth is now handled by Supabase directly.
 * This file is kept as a no-op for backward compatibility.
 */
import type { RequestHandler } from "express";

export const CLERK_PROXY_PATH = "/api/__clerk";

export function clerkProxyMiddleware(): RequestHandler {
  return (_req, _res, next) => next();
}
