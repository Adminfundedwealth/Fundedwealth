import createRateLimit from "express-rate-limit";
import { logger } from "./logger";

/**
 * Rate Limiting Configuration
 *
 * PRODUCTION NOTE: The default in-memory store resets on server restart and
 * does NOT synchronize across multiple instances. For horizontal scaling,
 * configure REDIS_URL env var to use Redis-backed rate limiting.
 *
 * When REDIS_URL is not set, falls back to in-memory (acceptable for single-instance).
 */

// Redis store integration (lazy-loaded if REDIS_URL is configured)
let storeFactory: (() => any) | null = null;

if (process.env.REDIS_URL) {
  try {
    // Use rate-limit-redis if available
    const { RedisStore } = require("rate-limit-redis");
    const { createClient } = require("redis");
    const redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.connect().catch((err: any) => {
      logger.error({ err }, "Redis connection failed for rate limiting — falling back to memory store");
      storeFactory = null;
    });
    storeFactory = () => new RedisStore({ sendCommand: (...args: any[]) => redisClient.sendCommand(args) });
    logger.info("Rate limiting: Redis store configured");
  } catch {
    logger.warn("rate-limit-redis not installed — using in-memory rate limiting");
  }
}

export function rateLimit(maxRequests: number, windowSeconds: number) {
  return createRateLimit({
    windowMs: windowSeconds * 1000,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests. Please try again later." },
    ...(storeFactory ? { store: storeFactory() } : {}),
  });
}

export const contactLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many contact submissions. Please try again in 15 minutes." },
  ...(storeFactory ? { store: storeFactory() } : {}),
});

export const registrationLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many registration attempts. Please try again in 15 minutes." },
  ...(storeFactory ? { store: storeFactory() } : {}),
});

export const donationLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
  ...(storeFactory ? { store: storeFactory() } : {}),
});

export const generalLimiter = createRateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
  ...(storeFactory ? { store: storeFactory() } : {}),
});

export const loginLimiter = createRateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again in 5 minutes." },
  skip: (req) => req.method !== "POST",
  ...(storeFactory ? { store: storeFactory() } : {}),
});
