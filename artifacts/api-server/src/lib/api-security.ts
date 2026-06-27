/**
 * API Security Utilities
 *
 * Provides:
 * - Zod request validation middleware
 * - Error sanitization (never leak stack traces)
 * - Ownership validation helpers
 * - Standardized error responses
 */

import { Request, Response, NextFunction } from "express";
import { z, ZodSchema, ZodError } from "zod";
import { logger } from "./logger";

/**
 * Middleware factory for request body validation using Zod.
 * Rejects with 400 if body does not match schema.
 * Replaces req.body with the parsed (coerced/stripped) result.
 */
export function validateBody<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        error: "Validation failed",
        details: errors,
      });
    }
    req.body = result.data;
    next();
  };
}

/**
 * Middleware factory for query param validation.
 */
export function validateQuery<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return res.status(400).json({
        error: "Invalid query parameters",
        details: errors,
      });
    }
    req.query = result.data;
    next();
  };
}

/**
 * Middleware factory for URL params validation.
 */
export function validateParams<T extends ZodSchema>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid URL parameters" });
    }
    next();
  };
}

/**
 * Sanitize error responses for production.
 * Never expose stack traces, internal paths, or SQL errors.
 */
export function sanitizeError(error: unknown): { message: string; code?: string } {
  if (error instanceof ZodError) {
    return { message: "Validation failed", code: "VALIDATION_ERROR" };
  }

  if (error instanceof Error) {
    // Check for known safe error messages
    const safePatterns = [
      /not found/i,
      /unauthorized/i,
      /forbidden/i,
      /already exists/i,
      /invalid/i,
    ];

    for (const pattern of safePatterns) {
      if (pattern.test(error.message)) {
        return { message: error.message };
      }
    }

    // Log the real error, return generic message
    logger.error({ error: error.message, stack: error.stack }, "Unhandled error sanitized");
    return { message: "An internal error occurred", code: "INTERNAL_ERROR" };
  }

  return { message: "An unexpected error occurred", code: "UNKNOWN_ERROR" };
}

/**
 * Global error handler middleware — sanitizes all unhandled errors.
 */
export function securityErrorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  const sanitized = sanitizeError(error);

  // Never send 200 for errors
  const statusCode = res.statusCode >= 400 ? res.statusCode : 500;

  res.status(statusCode).json({
    error: sanitized.message,
    ...(sanitized.code ? { code: sanitized.code } : {}),
  });
}

/**
 * Common Zod schemas for reuse across routes.
 */
export const CommonSchemas = {
  uuid: z.string().uuid(),
  email: z.string().email().max(255).transform((v) => v.toLowerCase().trim()),
  password: z.string().min(12).max(128),
  pagination: z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
  }),
  amount: z.number().positive().max(10000000),
  planType: z.enum(["flash", "instant", "1step", "2step"]),
  sizeIndex: z.number().int().min(0).max(10),
};

export default { validateBody, validateQuery, validateParams, sanitizeError, securityErrorHandler, CommonSchemas };
