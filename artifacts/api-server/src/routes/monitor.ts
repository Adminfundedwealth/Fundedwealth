import { Router } from "express";
import { MonitoringService } from "../lib/monitoring-service";
import { logger } from "../lib/logger";

const router = Router();

router.get("/errors", async (req, res) => {
  try {
    const errors = await MonitoringService.queryErrors({
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      severity: typeof req.query.severity === "string" ? req.query.severity : undefined,
      path: typeof req.query.path === "string" ? req.query.path : undefined,
      limit: Number(req.query.limit ?? 50),
    });

    res.json(errors);
  } catch (error) {
    logger.error(error, "Unable to fetch system errors");
    res.status(500).json({ error: "Unable to fetch system errors" });
  }
});

router.get("/incidents", async (req, res) => {
  try {
    const incidents = await MonitoringService.queryIncidents({
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      severity: typeof req.query.severity === "string" ? req.query.severity : undefined,
      incidentType: typeof req.query.incidentType === "string" ? req.query.incidentType : undefined,
      limit: Number(req.query.limit ?? 50),
    });

    res.json(incidents);
  } catch (error) {
    logger.error(error, "Unable to fetch incidents");
    res.status(500).json({ error: "Unable to fetch incidents" });
  }
});

router.get("/health", async (_req, res) => {
  try {
    const health = await MonitoringService.getHealthSummary();
    res.json(health);
  } catch (error) {
    logger.error(error, "Unable to fetch monitoring health summary");
    res.status(500).json({ error: "Unable to fetch health summary" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const summary = await MonitoringService.getMonitorOverview();
    res.json(summary);
  } catch (error) {
    logger.error(error, "Unable to fetch monitor overview");
    res.status(500).json({ error: "Unable to fetch monitor overview" });
  }
});

router.get("/db-health", async (_req, res) => {
  try {
    const result = await MonitoringService.checkDatabaseConnectivity();
    res.json(result);
  } catch (error) {
    logger.error(error, "Unable to fetch database health");
    res.status(500).json({ error: "Unable to fetch database health" });
  }
});

router.get("/backup-events", async (req, res) => {
  try {
    const events = await MonitoringService.queryBackupEvents({
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      backupType: typeof req.query.backupType === "string" ? req.query.backupType : undefined,
      limit: Number(req.query.limit ?? 50),
    });

    res.json(events);
  } catch (error) {
    logger.error(error, "Unable to fetch backup events");
    res.status(500).json({ error: "Unable to fetch backup events" });
  }
});

router.post("/backup-events", async (req, res) => {
  try {
    const { backupType, provider, status, startedAt, completedAt, durationMs, bytesTransferred, storageLocation, metadata } = req.body;
    if (!backupType || !status) {
      res.status(400).json({ error: "Missing required fields backupType or status" });
      return;
    }

    const event = await MonitoringService.logBackupEvent({
      backupType,
      provider,
      status,
      startedAt: startedAt ? new Date(startedAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
      durationMs: durationMs ? Number(durationMs) : undefined,
      bytesTransferred: bytesTransferred ? Number(bytesTransferred) : undefined,
      storageLocation,
      metadata,
    });

    if (!event) {
      res.status(500).json({ error: "Unable to create backup event" });
      return;
    }

    res.status(201).json(event);
  } catch (error) {
    logger.error(error, "Unable to create backup event");
    res.status(500).json({ error: "Unable to create backup event" });
  }
});

router.get("/notification-failures", async (req, res) => {
  try {
    const failures = await MonitoringService.queryNotificationFailures({
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      provider: typeof req.query.provider === "string" ? req.query.provider : undefined,
      limit: Number(req.query.limit ?? 50),
    });

    res.json(failures);
  } catch (error) {
    logger.error(error, "Unable to fetch notification failures");
    res.status(500).json({ error: "Unable to fetch notification failures" });
  }
});

router.post("/notification-failures", async (req, res) => {
  try {
    const { notificationId, userId, channel, provider, status, failureReason, metadata } = req.body;
    if (!status) {
      res.status(400).json({ error: "Missing required field status" });
      return;
    }

    const failure = await MonitoringService.logNotificationFailure({
      notificationId,
      userId: userId ? String(userId) : undefined,
      channel,
      provider,
      status,
      failureReason,
      metadata,
    });

    if (!failure) {
      res.status(500).json({ error: "Unable to log notification failure" });
      return;
    }

    res.status(201).json(failure);
  } catch (error) {
    logger.error(error, "Unable to log notification failure");
    res.status(500).json({ error: "Unable to log notification failure" });
  }
});

router.get("/payments", async (req, res) => {
  try {
    const failures = await MonitoringService.queryPaymentFailures({
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      limit: Number(req.query.limit ?? 50),
    });

    res.json(failures);
  } catch (error) {
    logger.error(error, "Unable to fetch payment failures");
    res.status(500).json({ error: "Unable to fetch payment failures" });
  }
});

router.get("/alerts", async (req, res) => {
  try {
    const alerts = await MonitoringService.getAlertRules(Number(req.query.limit ?? 100));
    res.json(alerts);
  } catch (error) {
    logger.error(error, "Unable to fetch alert rules");
    res.status(500).json({ error: "Unable to fetch alert rules" });
  }
});

router.post("/alerts", async (req, res) => {
  try {
    const { name, description, eventType, condition, enabled, severity, notifyEmails, notifyClerkIds } = req.body;
    if (!name || !eventType || !condition) {
      res.status(400).json({ error: "Missing required fields name, eventType or condition" });
      return;
    }

    const rule = await MonitoringService.createAlertRule({
      name,
      description,
      eventType,
      condition,
      enabled,
      severity,
      notifyEmails,
      notifyClerkIds,
    });

    if (!rule) {
      res.status(500).json({ error: "Unable to create alert rule" });
      return;
    }

    res.status(201).json(rule);
  } catch (error) {
    logger.error(error, "Unable to create alert rule");
    res.status(500).json({ error: "Unable to create alert rule" });
  }
});

router.patch("/alerts/:id", async (req, res) => {
  try {
    const rule = await MonitoringService.updateAlertRule(Number(req.params.id), req.body);
    if (!rule) {
      res.status(404).json({ error: "Alert rule not found" });
      return;
    }

    res.json(rule);
  } catch (error) {
    logger.error(error, "Unable to update alert rule");
    res.status(500).json({ error: "Unable to update alert rule" });
  }
});

router.delete("/alerts/:id", async (req, res) => {
  try {
    const deleted = await MonitoringService.deleteAlertRule(Number(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: "Alert rule not found" });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    logger.error(error, "Unable to delete alert rule");
    res.status(500).json({ error: "Unable to delete alert rule" });
  }
});

router.post("/incidents", async (req, res) => {
  try {
    const { title, description, incidentType, severity, linkedErrorId, detectionSource, assignee, priority } = req.body;
    if (!title || !incidentType) {
      res.status(400).json({ error: "Missing required fields title or incidentType" });
      return;
    }

    const incident = await MonitoringService.createIncident({
      title,
      description,
      incidentType,
      severity,
      linkedErrorId,
      detectionSource,
      assignee,
      priority,
    });

    if (!incident) {
      res.status(500).json({ error: "Unable to create incident" });
      return;
    }

    res.status(201).json(incident);
  } catch (error) {
    logger.error(error, "Unable to create incident");
    res.status(500).json({ error: "Unable to create incident" });
  }
});

router.patch("/resolve", async (req, res) => {
  try {
    const { incidentId, status, resolvedBy, notes } = req.body;
    if (!incidentId || !status) {
      res.status(400).json({ error: "Missing incidentId or status" });
      return;
    }

    const resolved = await MonitoringService.resolveIncident(Number(incidentId), status, resolvedBy, notes);
    if (!resolved) {
      res.status(404).json({ error: "Incident not found" });
      return;
    }

    res.json(resolved);
  } catch (error) {
    logger.error(error, "Unable to resolve incident");
    res.status(500).json({ error: "Unable to resolve incident" });
  }
});

router.get("/backup-recovery", async (req, res) => {
  try {
    const events = await MonitoringService.queryBackupRecovery({
      status: typeof req.query.status === "string" ? req.query.status : undefined,
      backupId: typeof req.query.backupId === "string" ? Number(req.query.backupId) : undefined,
      limit: Number(req.query.limit ?? 50),
    });

    res.json(events);
  } catch (error) {
    logger.error(error, "Unable to fetch backup recovery events");
    res.status(500).json({ error: "Unable to fetch backup recovery events" });
  }
});

router.post("/backup-recovery", async (req, res) => {
  try {
    const {
      backupId,
      recoveryType,
      status,
      scheduledFor,
      startedAt,
      completedAt,
      durationMs,
      targetEnvironment,
      recoveryMethod,
      itemsRecovered,
      itemsFailed,
      successRate,
      metadata,
    } = req.body;

    if (!recoveryType || !status || !scheduledFor) {
      res.status(400).json({ error: "Missing required fields: recoveryType, status, scheduledFor" });
      return;
    }

    const event = await MonitoringService.logBackupRecovery({
      backupId: backupId ? Number(backupId) : undefined,
      recoveryType,
      status,
      scheduledFor: new Date(scheduledFor),
      startedAt: startedAt ? new Date(startedAt) : undefined,
      completedAt: completedAt ? new Date(completedAt) : undefined,
      durationMs: durationMs ? Number(durationMs) : undefined,
      targetEnvironment,
      recoveryMethod,
      itemsRecovered: itemsRecovered ? Number(itemsRecovered) : undefined,
      itemsFailed: itemsFailed ? Number(itemsFailed) : undefined,
      successRate,
      metadata,
    });

    if (!event) {
      res.status(500).json({ error: "Unable to create backup recovery event" });
      return;
    }

    res.status(201).json(event);
  } catch (error) {
    logger.error(error, "Unable to create backup recovery event");
    res.status(500).json({ error: "Unable to create backup recovery event" });
  }
});

router.get("/incident-sla", async (req, res) => {
  try {
    const slas = await MonitoringService.queryIncidentSla({
      incidentId: typeof req.query.incidentId === "string" ? Number(req.query.incidentId) : undefined,
      breached: (req.query.breached as "YES" | "NO") || undefined,
      limit: Number(req.query.limit ?? 50),
    });

    res.json(slas);
  } catch (error) {
    logger.error(error, "Unable to fetch incident SLA records");
    res.status(500).json({ error: "Unable to fetch incident SLA records" });
  }
});

router.post("/incident-sla", async (req, res) => {
  try {
    const { incidentId, severity, slaType, targetResponseHours, targetResolutionHours, metadata } = req.body;

    if (!incidentId || !severity || !slaType) {
      res.status(400).json({ error: "Missing required fields: incidentId, severity, slaType" });
      return;
    }

    const sla = await MonitoringService.createIncidentSla({
      incidentId: Number(incidentId),
      severity,
      slaType,
      targetResponseHours: targetResponseHours ? Number(targetResponseHours) : undefined,
      targetResolutionHours: targetResolutionHours ? Number(targetResolutionHours) : undefined,
      metadata,
    });

    if (!sla) {
      res.status(500).json({ error: "Unable to create incident SLA" });
      return;
    }

    res.status(201).json(sla);
  } catch (error) {
    logger.error(error, "Unable to create incident SLA");
    res.status(500).json({ error: "Unable to create incident SLA" });
  }
});

router.patch("/incident-sla/:id", async (req, res) => {
  try {
    const { respondedAt, resolvedAt, metadata } = req.body;

    const sla = await MonitoringService.updateIncidentSla(Number(req.params.id), {
      respondedAt: respondedAt ? new Date(respondedAt) : undefined,
      resolvedAt: resolvedAt ? new Date(resolvedAt) : undefined,
      metadata,
    });

    if (!sla) {
      res.status(404).json({ error: "Incident SLA not found" });
      return;
    }

    res.json(sla);
  } catch (error) {
    logger.error(error, "Unable to update incident SLA");
    res.status(500).json({ error: "Unable to update incident SLA" });
  }
});

router.get("/sla-metrics", async (req, res) => {
  try {
    const metrics = await MonitoringService.getSlaMetrics({
      timeframeHours: typeof req.query.timeframeHours === "string" ? Number(req.query.timeframeHours) : 24,
    });

    res.json(metrics);
  } catch (error) {
    logger.error(error, "Unable to fetch SLA metrics");
    res.status(500).json({ error: "Unable to fetch SLA metrics" });
  }
});

export default router;
