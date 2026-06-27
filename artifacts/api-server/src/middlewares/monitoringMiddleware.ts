import { Request, Response, NextFunction } from "express";
import { MonitoringService } from "../lib/monitoring-service";
import { logger } from "../lib/logger";
import { observeApiRequest, observeApiError, captureException } from "../lib/observability";

export async function recordApiLog(req: Request, res: Response) {
  const start = performance.now();
  res.once("finish", async () => {
    const durationMs = Math.max(0, Math.round(performance.now() - start));
    try {
      observeApiRequest({ method: req.method, route: req.path, statusCode: res.statusCode, durationMs });
      if (res.statusCode >= 500) {
        observeApiError({ route: req.path, statusCode: res.statusCode, errorType: "SERVER_ERROR" });
      }

      await MonitoringService.logApiRequest({
        path: req.url.split("?")[0],
        method: req.method,
        statusCode: res.statusCode,
        durationMs,
        userId: req.auth?.userId,
        userEmail: req.auth?.user?.email,
        ipAddress:
          (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          req.socket.remoteAddress ||
          undefined,
        userAgent: req.headers["user-agent"] as string | undefined,
        requestBody: req.body ?? null,
      });
    } catch (error) {
      logger.error(error, "Error recording API log");
    }
  });
}

export function monitoringMiddleware(req: Request, res: Response, next: NextFunction) {
  if (!req.path.startsWith("/api")) {
    next();
    return;
  }

  recordApiLog(req, res).catch((error) => logger.error(error, "Failed to attach API log listener"));
  next();
}

export function monitoringErrorHandler(error: unknown, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    next(error);
    return;
  }

  captureException(error);
  MonitoringService.logError(error, {
    req,
    userId: req.auth?.userId,
    userEmail: req.auth?.user?.email,
    metadata: {
      body: req.body ?? null,
      query: req.query ?? null,
      params: req.params ?? null,
    },
  }).catch((err) => logger.error(err, "Failed to persist system error"));

  res.status(500).json({ error: "Internal server error" });
}
