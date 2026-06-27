/**
 * Redis Client — Production-grade connection with fallback.
 *
 * Used for:
 * - Rate limiting (distributed across instances)
 * - Session storage
 * - OTP storage (time-limited)
 * - Login attempt tracking
 *
 * If REDIS_URL is not configured, returns null and callers fall back to in-memory.
 */

import { logger } from "./logger";

export interface RedisClientInterface {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, options?: { EX?: number }): Promise<void>;
  del(key: string): Promise<void>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<void>;
  ttl(key: string): Promise<number>;
  sendCommand(args: string[]): Promise<any>;
  isReady: boolean;
}

let redisClient: RedisClientInterface | null = null;
let connectionAttempted = false;

/**
 * Get or create the Redis client singleton.
 * Returns null if REDIS_URL is not configured or connection fails.
 */
export async function getRedisClient(): Promise<RedisClientInterface | null> {
  if (connectionAttempted) return redisClient;
  connectionAttempted = true;

  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    logger.warn("REDIS_URL not configured — using in-memory stores (not suitable for multi-instance production)");
    return null;
  }

  try {
    const { createClient } = await import("redis");
    const client = createClient({ url: redisUrl });

    client.on("error", (err) => {
      logger.error({ err }, "Redis client error");
    });

    client.on("reconnecting", () => {
      logger.warn("Redis reconnecting...");
    });

    await client.connect();
    logger.info("Redis connected successfully");

    redisClient = {
      async get(key: string) {
        return await client.get(key);
      },
      async set(key: string, value: string, options?: { EX?: number }) {
        if (options?.EX) {
          await client.set(key, value, { EX: options.EX });
        } else {
          await client.set(key, value);
        }
      },
      async del(key: string) {
        await client.del(key);
      },
      async incr(key: string) {
        return await client.incr(key);
      },
      async expire(key: string, seconds: number) {
        await client.expire(key, seconds);
      },
      async ttl(key: string) {
        return await client.ttl(key);
      },
      async sendCommand(args: string[]) {
        return await client.sendCommand(args);
      },
      get isReady() {
        return client.isReady;
      },
    };

    return redisClient;
  } catch (err) {
    logger.error({ err }, "Redis connection failed — falling back to in-memory");
    return null;
  }
}

/**
 * Get the cached Redis client (does not reconnect).
 */
export function getCachedRedisClient(): RedisClientInterface | null {
  return redisClient;
}

export default { getRedisClient, getCachedRedisClient };
