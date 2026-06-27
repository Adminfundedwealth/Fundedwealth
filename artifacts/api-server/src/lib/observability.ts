import { Router, Request, Response, NextFunction } from "express";
import Sentry from "@sentry/node";
import { collectDefaultMetrics, Counter, Gauge, Histogram, Registry } from "prom-client";
import { logger } from "./logger";

const register = new Registry();
collectDefaultMetrics({ register, prefix: "fundedwealth_" });

const apiRequestCounter = new Counter({
  name: "fundedwealth_api_requests_total",
  help: "Total number of API requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [register],
});

const apiRequestLatency = new Histogram({
  name: "fundedwealth_api_request_duration_seconds",
  help: "API request duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
  registers: [register],
});

const apiErrorCounter = new Counter({
  name: "fundedwealth_api_errors_total",
  help: "Total number of API errors",
  labelNames: ["route", "status_code", "error_type"] as const,
  registers: [register],
});

const orderEventCounter = new Counter({
  name: "fundedwealth_order_events_total",
  help: "Total order lifecycle events",
  labelNames: ["event"] as const,
  registers: [register],
});

const executionEventCounter = new Counter({
  name: "fundedwealth_execution_events_total",
  help: "Total execution events",
  labelNames: ["event"] as const,
  registers: [register],
});

const paymentEventCounter = new Counter({
  name: "fundedwealth_payment_events_total",
  help: "Total payment events",
  labelNames: ["status", "provider"] as const,
  registers: [register],
});

const payoutEventCounter = new Counter({
  name: "fundedwealth_payout_events_total",
  help: "Total payout events",
  labelNames: ["status"] as const,
  registers: [register],
});

const dbQueryLatency = new Histogram({
  name: "fundedwealth_db_query_duration_seconds",
  help: "Database query duration in seconds",
  labelNames: ["query_type"] as const,
  buckets: [0.001, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1],
  registers: [register],
});

const websocketHealthGauge = new Gauge({
  name: "fundedwealth_websocket_health_status",
  help: "Websocket health status by provider (1 = healthy, 0 = unhealthy)",
  labelNames: ["provider"] as const,
  registers: [register],
});

let sdk: any = null;

export async function initializeObservability() {
  try {
    const sentryDsn = process.env.SENTRY_DSN;
    const tracesSampleRate = Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? "0.1");
    if (sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: process.env.NODE_ENV || "development",
        tracesSampleRate,
        release: process.env.RELEASE || undefined,
      });
      logger.info("Sentry initialized");
    }

    const otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    if (otelEndpoint) {
      try {
        const { OTLPTraceExporter } = await import("@opentelemetry/exporter-trace-otlp-http");
        const { getNodeAutoInstrumentations } = await import("@opentelemetry/auto-instrumentations-node");
        const { NodeSDK } = await import("@opentelemetry/sdk-node");

        const traceExporter = new OTLPTraceExporter({
          url: otelEndpoint,
          headers: process.env.OTEL_EXPORTER_OTLP_HEADERS
            ? Object.fromEntries(
                (process.env.OTEL_EXPORTER_OTLP_HEADERS || "").split(",").map((pair) => {
                  const [key, value] = pair.split("=");
                  return [key.trim(), value.trim()];
                }),
              )
            : undefined,
        });

        sdk = new NodeSDK({
          traceExporter,
          instrumentations: [getNodeAutoInstrumentations()],
        });
        await sdk.start();
        logger.info("OpenTelemetry SDK started");

        process.on("SIGTERM", async () => {
          if (sdk) {
            await sdk.shutdown();
          }
        });
      } catch (otelErr) {
        logger.warn({ err: otelErr }, "OpenTelemetry packages not available, skipping OTEL initialization");
      }
    }
  } catch (error) {
    logger.error({ err: error }, "Failed to initialize observability stack");
  }
}

export function observeApiRequest(params: { method: string; route: string; statusCode: number; durationMs: number }) {
  const route = params.route || "unknown";
  apiRequestCounter.labels(params.method, route, String(params.statusCode)).inc();
  apiRequestLatency.labels(params.method, route, String(params.statusCode)).observe(params.durationMs / 1000);
}

export function observeApiError(params: { route: string; statusCode: number; errorType: string }) {
  apiErrorCounter.labels(params.route || "unknown", String(params.statusCode), params.errorType).inc();
}

export function observeOrderEvent(event: string) {
  orderEventCounter.labels(event).inc();
}

export function observeExecutionEvent(event: string) {
  executionEventCounter.labels(event).inc();
}

export function observePaymentEvent(status: string, provider?: string) {
  paymentEventCounter.labels(status, provider ?? "unknown").inc();
}

export function observePayoutEvent(status: string) {
  payoutEventCounter.labels(status).inc();
}

export function observeDbQuery(durationMs: number, queryType: string) {
  dbQueryLatency.labels(queryType).observe(durationMs / 1000);
}

export function setWebsocketHealth(provider: string, healthy: boolean) {
  websocketHealthGauge.labels(provider).set(healthy ? 1 : 0);
}

export function metricsRouter() {
  const router = Router();
  router.get("/", async (_req: Request, res: Response) => {
    res.setHeader("Content-Type", register.contentType);
    res.send(await register.metrics());
  });
  return router;
}

export function observabilityMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = performance.now();
  res.once("finish", () => {
    const durationMs = Math.max(0, performance.now() - start);
    observeApiRequest({ method: req.method, route: req.path, statusCode: res.statusCode, durationMs });
  });
  next();
}

export function captureException(error: unknown) {
  try {
    Sentry.captureException(error);
  } catch (err) {
    logger.error({ err }, "Sentry capture failed");
  }
}
