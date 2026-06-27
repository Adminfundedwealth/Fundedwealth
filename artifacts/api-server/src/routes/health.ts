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
    res.json({ status: "ok", ...health });
  } catch (error) {
    res.status(500).json({ status: "failed", error: "Unable to fetch health summary" });
  }
});

export default router;
