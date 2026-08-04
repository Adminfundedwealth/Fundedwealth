import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { MonitoringService } from "../lib/monitoring-service";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/health", async (_req, res) => {
  try {
    const health = await MonitoringService.getHealthSummary();
    // Include DB host info (no password) to help diagnose connection issues
    let dbHost = "unknown";
    try {
      const url = process.env.DATABASE_URL || "";
      const match = url.match(/@([^/]+)/);
      if (match) dbHost = match[1];
    } catch {}
    res.json({ status: "ok", ...health, dbHost });
  } catch (error) {
    res.status(500).json({ status: "failed", error: "Unable to fetch health summary" });
  }
});

export default router;
