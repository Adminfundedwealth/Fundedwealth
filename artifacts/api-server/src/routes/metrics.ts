import { Router } from "express";
import { metricsRouter as observabilityMetricsRouter } from "../lib/observability";

const router = Router();
router.use(observabilityMetricsRouter());

export default router;
