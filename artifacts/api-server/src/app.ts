import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import { supabaseAuthMiddleware } from "./middlewares/supabaseAuth";
import { monitoringErrorHandler, monitoringMiddleware } from "./middlewares/monitoringMiddleware";
import { observabilityMiddleware } from "./lib/observability";
import { securityErrorHandler } from "./lib/api-security";
import {
  sessionActivityMiddleware,
  threatDetectionMiddleware,
} from "./middlewares/securityMiddleware";
import router from "./routes";
import metricsRouter from "./routes/metrics";
import { logger } from "./lib/logger";

const app: Express = express();

app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// CORS: Allow only production frontend domains + localhost dev
const ALLOWED_ORIGINS = [
  "https://www.fundedwealth.com",
  "https://fundedwealth.com",
  "https://admin.fundedwealth.com",
  "https://terminal.fundedwealth.com",
  "https://fundedwealth.vercel.app",
  "https://d-fundedwealth.cloudfront.net", // CloudFront distribution
  ...(process.env.NODE_ENV !== "production" ? ["http://localhost:5200", "http://localhost:5201", "http://localhost:5202"] : []),
];
app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    // Allow requests with no origin (server-to-server, curl, mobile apps)
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      // SECURITY: Only allow fundedwealth Vercel preview deployments, not any .vercel.app
      if (origin.match(/^https:\/\/fundedwealth[a-z0-9-]*\.vercel\.app$/)) {
        callback(null, true);
      } else if (origin.match(/^https:\/\/(admin|terminal)\.fundedwealth\.(com|in)$/)) {
        // Allow admin and terminal subdomains
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    }
  },
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
}));

// Attach raw body buffer to req so the Razorpay webhook handler can verify
// the HMAC-SHA256 signature.
app.use(
  express.json({
    limit: "10mb",
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser with secure configuration
app.use(cookieParser(process.env.SESSION_SECRET || ""));

// Supabase auth middleware (replaces Clerk) — validates JWT on every request
app.use(supabaseAuthMiddleware);
app.use(observabilityMiddleware);
app.use(monitoringMiddleware);

// Security middleware stack
app.use(threatDetectionMiddleware);
app.use(sessionActivityMiddleware);

// Add security headers
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "0"); // Deprecated, CSP handles this
  res.setHeader("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline'", // inline styles needed for React
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://challenges.cloudflare.com https://terminal.fundedwealth.com https://admin.fundedwealth.com",
      "frame-src https://challenges.cloudflare.com https://api.razorpay.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; "),
  );
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=(self)");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  next();
});

app.use("/metrics", metricsRouter);
app.use("/api", router);

// Return JSON for unmatched API routes
app.use((req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "Not found" });
  }
  res.status(404).send("Not found");
});

// Body parser errors
app.use((error: unknown, req: any, res: any, next: any) => {
  if (error instanceof SyntaxError && (error as any).type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  next(error);
});

// SECURITY: Sanitize all unhandled errors — never leak internal details
app.use(securityErrorHandler as any);

app.use(monitoringErrorHandler);

export default app;
