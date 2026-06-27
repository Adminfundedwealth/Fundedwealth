import 'dotenv/config';
import { initializeObservability } from "./lib/observability";
initializeObservability().catch((err) => {
  console.error("Failed to initialize observability", err);
});
import app from "./app";
import { logger } from "./lib/logger";
import { startEconomicCalendarScheduler } from "./lib/economic-calendar";
import http from "http";

// ── Clerk key guard ──────────────────────────────────────────────────────────
const clerkSecret = process.env.CLERK_SECRET_KEY ?? "";
if (process.env.NODE_ENV === "production" && clerkSecret.startsWith("sk_test_")) {
  logger.error(
    "CLERK_SECRET_KEY is a test key (sk_test_*) but NODE_ENV=production. " +
    "Go to https://dashboard.clerk.com → your app → Production → API Keys " +
    "and set CLERK_SECRET_KEY to your live sk_live_* key before deploying."
  );
  process.exit(1);
}
if (clerkSecret.startsWith("sk_test_") && process.env.NODE_ENV !== "test") {
  logger.warn(
    "CLERK_SECRET_KEY is a test key. Auth is running against a Clerk development instance. " +
    "Replace with a live sk_live_* key before accepting real users."
  );
}
// ────────────────────────────────────────────────────────────────────────────

// ── Encryption key guard — fail startup if missing in production ──────────────
if (process.env.NODE_ENV === "production" && !process.env.ENCRYPTION_KEY) {
  logger.error(
    "ENCRYPTION_KEY is not set. Financial data cannot be encrypted. " +
    "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\" " +
    "and set ENCRYPTION_KEY in your environment.",
  );
  process.exit(1);
}
if (process.env.NODE_ENV === "production" && (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64)) {
  logger.error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes).");
  process.exit(1);
}
// ────────────────────────────────────────────────────────────────────────────

const rawPort = process.env.PORT ?? (process.env.NODE_ENV === "development" ? "9010" : undefined);

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided. " +
    "Set PORT in your environment, or run in development mode to use the default 9010.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

// Initialize Redis connection (non-blocking — falls back to memory if unavailable)
import("./lib/redis-client").then(({ getRedisClient }) => {
  getRedisClient().catch(() => {});
});

server.listen(port, (err?: any) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "Server listening");
});

startEconomicCalendarScheduler().catch((err) => {
  logger.error({ err }, "Economic calendar scheduler failed to start");
});

// Daily blog auto-generation at 07:30 IST
import { startBlogScheduler } from "./lib/blog-scheduler";
startBlogScheduler().catch((err) => {
  logger.error({ err }, "Blog scheduler failed to start");
});
