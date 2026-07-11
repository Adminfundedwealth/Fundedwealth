import 'dotenv/config';
import { initializeObservability } from "./lib/observability";
initializeObservability().catch((err) => {
  console.error("Failed to initialize observability", err);
});
import app from "./app";
import router from "./routes";
import { logger } from "./lib/logger";
import { startEconomicCalendarScheduler } from "./lib/economic-calendar";
import http from "http";

function collectApiRoutes(stack: any[], prefix = "/api"): string[] {
  const routes: string[] = [];

  for (const layer of stack) {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .filter((method) => layer.route.methods[method])
        .map((method) => method.toUpperCase());
      const path = `${prefix}${layer.route.path === "/" ? "" : layer.route.path}`;
      methods.forEach((method) => routes.push(`${method} ${path}`));
    } else if (layer.name === "router" && layer.handle?.stack) {
      routes.push(...collectApiRoutes(layer.handle.stack, prefix));
    }
  }

  return routes;
}

// ── Supabase config guard — warn if missing in production ───────────────────
if (process.env.NODE_ENV === "production") {
  if (!process.env.SUPABASE_URL) {
    logger.warn("SUPABASE_URL is not set — JWT authentication will not work.");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_ANON_KEY) {
    logger.warn("Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set — JWT authentication will not work.");
  }
  if (!process.env.DATABASE_URL) {
    logger.warn("DATABASE_URL is not set — database queries will fail.");
  }
}
// ────────────────────────────────────────────────────────────────────────────

// ── Encryption key guard — warn if missing in production (non-fatal) ─────────
if (process.env.NODE_ENV === "production" && !process.env.ENCRYPTION_KEY) {
  logger.warn(
    "ENCRYPTION_KEY is not set. Financial data encryption disabled. " +
    "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\" " +
    "and set ENCRYPTION_KEY in Railway environment variables.",
  );
} else if (process.env.NODE_ENV === "production" && process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length !== 64) {
  logger.warn("ENCRYPTION_KEY should be a 64-character hex string (32 bytes). Current length: " + process.env.ENCRYPTION_KEY.length);
}
// ────────────────────────────────────────────────────────────────────────────

const rawPort = process.env.PORT ?? "9000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = http.createServer(app);

const railwayCommit = process.env.RAILWAY_GIT_COMMIT_SHA || process.env.COMMIT_SHA || "unknown";
const terminalLaunchRegistered = collectApiRoutes((router as any).stack).some((route) => route.includes("/terminal-launch"));

console.log(`[startup] Railway commit: ${railwayCommit}`);
console.log("[startup] app.use('/api', router): enabled");
console.log("[startup] router.post('/terminal-launch'):", terminalLaunchRegistered ? "enabled" : "missing");
console.log("[startup] Registered routes:");
for (const route of collectApiRoutes((router as any).stack).sort()) {
  console.log(`[startup] ${route}`);
}

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
