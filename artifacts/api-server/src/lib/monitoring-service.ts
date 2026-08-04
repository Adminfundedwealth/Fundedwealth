import { Request } from "express";
import { db } from "@workspace/db";
import { alertRules, apiLogs, backupRecovery, incidentSla, paymentFailures, notificationFailures, systemBackups, systemErrors, systemIncidents, users } from "@workspace/db";
import { and, desc, eq, gt, sql } from "drizzle-orm";
import { logger } from "./logger";
import { broadcastNotificationToUser } from "./supabase";
import { sendEmail } from "./email";
import { observePaymentEvent } from "./observability";

export interface LogApiRequestOptions {
  path: string;
  method: string;
  statusCode: number;
  durationMs: number;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  requestBody?: unknown;
  responseBody?: unknown;
}

export interface MonitoringErrorOptions {
  req?: Request;
  userId?: string;
  userEmail?: string;
  service?: string;
  environment?: string;
  metadata?: unknown;
  severity?: string;
  incidentType?: string;
}

export type MonitoringEventType = "SYSTEM_ERROR" | "PAYMENT_FAILURE" | "API_LOG" | "BACKUP_EVENT" | "NOTIFICATION_FAILURE" | "DATABASE_HEALTH";

export interface AlertCondition {
  errorType?: string;
  severity?: string;
  statusCodeGte?: number;
  pathContains?: string;
  messageContains?: string;
  provider?: string;
  status?: string;
  failureReasonContains?: string;
  amountGte?: number;
  durationMsGte?: number;
  backupType?: string;
  notificationChannel?: string;
  databaseStatus?: string;
}

export interface AlertNotificationTargets {
  emails?: string[];
  clerkIds?: string[];
}

export class MonitoringService {
  static async logApiRequest(options: LogApiRequestOptions) {
    try {
      const [inserted] = await db.insert(apiLogs).values({
        path: options.path,
        method: options.method,
        statusCode: options.statusCode,
        durationMs: options.durationMs,
        userId: options.userId,
        userEmail: options.userEmail,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        requestBody: options.requestBody ?? null,
        responseBody: options.responseBody ?? null,
      }).returning();

      if (inserted) {
        await this.evaluateAlertRules("API_LOG", {
          id: inserted.id,
          path: options.path,
          method: options.method,
          statusCode: options.statusCode,
          durationMs: options.durationMs,
          userId: options.userId,
          userEmail: options.userEmail,
        });
      }
    } catch (error) {
      logger.error(error, "Failed to persist API log");
    }
  }

  static async logError(error: unknown, options: MonitoringErrorOptions = {}) {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;
    const path = options.req?.url?.split("?")[0] ?? "unknown";
    const method = options.req?.method ?? "unknown";
    const statusCode = (options.req as any)?.statusCode || 500;
    const severity = options.severity?.toUpperCase() ?? "ERROR";
    const errorType = options.incidentType ?? "SYSTEM_ERROR";

    try {
      const [inserted] = await db
        .insert(systemErrors)
        .values({
          errorType,
          severity,
          message,
          stack,
          path,
          method,
          statusCode,
          userId: options.userId,
          userEmail: options.userEmail,
          service: options.service,
          environment: options.environment ?? process.env.NODE_ENV ?? "development",
          metadata: options.metadata ?? null,
        })
        .returning({ id: systemErrors.id });

      const errorEvent = {
        id: inserted?.id ?? 0,
        errorType,
        severity,
        message,
        path,
        method,
        statusCode,
        userId: options.userId,
        userEmail: options.userEmail,
      };

      await this.evaluateAlertRules("SYSTEM_ERROR", errorEvent);
      return inserted?.id ?? 0;
    } catch (logError) {
      logger.error(logError, "Unable to persist system error");
      return 0;
    }
  }

  static async createIncident(params: {
    title: string;
    description?: string;
    incidentType: string;
    severity?: string;
    linkedErrorId?: number;
    detectionSource?: string;
    assignee?: string;
    priority?: string;
    status?: string;
  }) {
    const { title, description, incidentType, severity, linkedErrorId, detectionSource, assignee, priority, status } = params;
    try {
      const [inserted] = await db
        .insert(systemIncidents)
        .values({
          title,
          description,
          incidentType,
          severity: severity?.toUpperCase() ?? "HIGH",
          status: status?.toUpperCase() ?? "OPEN",
          linkedErrorId,
          detectionSource,
          assignee,
          priority: priority?.toUpperCase() ?? "MEDIUM",
        })
        .returning();

      return inserted;
    } catch (error) {
      logger.error(error, "Failed to create incident");
      return null;
    }
  }

  static async resolveIncident(
    incidentId: number,
    status: string,
    resolvedBy?: string,
    notes?: string,
  ) {
    try {
      const [updated] = await db
        .update(systemIncidents)
        .set({
          status: status.toUpperCase(),
          resolvedBy: resolvedBy ?? null,
          resolutionNotes: notes ?? null,
          resolvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(systemIncidents.id, incidentId))
        .returning();

      return updated || null;
    } catch (error) {
      logger.error(error, "Unable to resolve incident");
      return null;
    }
  }

  static async queryErrors(options: {
    status?: string;
    severity?: string;
    path?: string;
    limit?: number;
  }) {
    const conditions = [] as any[];
    if (options.status) {
      conditions.push(eq(systemErrors.errorType, options.status.toUpperCase()));
    }
    if (options.severity) {
      conditions.push(eq(systemErrors.severity, options.severity.toUpperCase()));
    }
    if (options.path) {
      conditions.push(eq(systemErrors.path, options.path));
    }

    return db
      .select()
      .from(systemErrors)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(systemErrors.createdAt))
      .limit(options.limit ?? 50);
  }

  static async queryIncidents(options: {
    status?: string;
    severity?: string;
    incidentType?: string;
    limit?: number;
  }) {
    const conditions = [] as any[];
    if (options.status) {
      conditions.push(eq(systemIncidents.status, options.status.toUpperCase()));
    }
    if (options.severity) {
      conditions.push(eq(systemIncidents.severity, options.severity.toUpperCase()));
    }
    if (options.incidentType) {
      conditions.push(eq(systemIncidents.incidentType, options.incidentType.toUpperCase()));
    }

    return db
      .select()
      .from(systemIncidents)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(systemIncidents.createdAt))
      .limit(options.limit ?? 50);
  }

  static async queryPaymentFailures(options: { status?: string; limit?: number }) {
    const conditions = [] as any[];
    if (options.status) {
      conditions.push(eq(paymentFailures.status, options.status.toUpperCase()));
    }

    return db
      .select()
      .from(paymentFailures)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(paymentFailures.createdAt))
      .limit(options.limit ?? 50);
  }

  static async queryNotificationFailures(options: { status?: string; provider?: string; limit?: number }) {
    const conditions = [] as any[];
    if (options.status) {
      conditions.push(eq(notificationFailures.status, options.status.toUpperCase()));
    }
    if (options.provider) {
      conditions.push(eq(notificationFailures.provider, options.provider));
    }

    return db
      .select()
      .from(notificationFailures)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(notificationFailures.createdAt))
      .limit(options.limit ?? 50);
  }

  static async queryBackupEvents(options: { status?: string; backupType?: string; limit?: number }) {
    const conditions = [] as any[];
    if (options.status) {
      conditions.push(eq(systemBackups.status, options.status.toUpperCase()));
    }
    if (options.backupType) {
      conditions.push(eq(systemBackups.backupType, options.backupType.toUpperCase()));
    }

    return db
      .select()
      .from(systemBackups)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(systemBackups.completedAt))
      .limit(options.limit ?? 50);
  }

  static async logNotificationFailure(params: {
    notificationId?: string;
    userId?: string;
    channel?: string;
    provider?: string;
    status: string;
    failureReason?: string;
    metadata?: unknown;
  }) {
    try {
      const [inserted] = await db
        .insert(notificationFailures)
        .values({
          notificationId: params.notificationId,
          userId: params.userId,
          channel: params.channel,
          provider: params.provider,
          status: params.status.toUpperCase(),
          failureReason: params.failureReason,
          metadata: params.metadata ?? null,
        })
        .returning();

      if (inserted) {
        await this.evaluateAlertRules("NOTIFICATION_FAILURE", {
          id: inserted.id,
          notificationId: inserted.notificationId,
          userId: inserted.userId,
          channel: inserted.channel,
          provider: inserted.provider,
          status: inserted.status,
          failureReason: inserted.failureReason,
        });
      }

      return inserted;
    } catch (error) {
      logger.error(error, "Failed to persist notification failure");
      return null;
    }
  }

  static async logBackupEvent(params: {
    backupType: string;
    provider?: string;
    status: string;
    startedAt?: Date;
    completedAt?: Date;
    durationMs?: number;
    bytesTransferred?: number;
    storageLocation?: string;
    metadata?: unknown;
  }) {
    try {
      const [inserted] = await db
        .insert(systemBackups)
        .values({
          backupType: params.backupType.toUpperCase(),
          provider: params.provider,
          status: params.status.toUpperCase(),
          startedAt: params.startedAt ?? new Date(),
          completedAt: params.completedAt ?? null,
          durationMs: params.durationMs,
          bytesTransferred: params.bytesTransferred,
          storageLocation: params.storageLocation,
          metadata: params.metadata ?? null,
          successful: params.status.toUpperCase() === "SUCCESS",
        })
        .returning();

      if (inserted) {
        await this.evaluateAlertRules("BACKUP_EVENT", {
          id: inserted.id,
          backupType: inserted.backupType,
          provider: inserted.provider,
          status: inserted.status,
          successful: inserted.successful,
        });
      }

      return inserted;
    } catch (error) {
      logger.error(error, "Failed to persist backup event");
      return null;
    }
  }

  static async checkDatabaseConnectivity() {
    try {
      // Use a simple SELECT 1 so it works even if monitoring tables don't exist yet
      await db.execute(sql`SELECT 1`);
      return { healthy: true };
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      // Log full error so it appears in Railway logs for diagnosis
      console.error("[DB Health] Connection failed:", msg);
      return { healthy: false, error: msg };
    }
  }

  static async getMonitorOverview() {
    const [openIncidents] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(systemIncidents)
      .where(eq(systemIncidents.status, "OPEN"));

    const [recentErrors] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(systemErrors)
      .where(sql`created_at > now() - interval '24 hours'`);

    const [recentFailures] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(paymentFailures)
      .where(sql`created_at > now() - interval '24 hours'`);

    const [recentNotifications] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationFailures)
      .where(sql`created_at > now() - interval '24 hours'`);

    const [recentBackupFailures] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(systemBackups)
      .where(and(eq(systemBackups.successful, false), sql`updated_at > now() - interval '24 hours'`));

    const [avgLatency] = await db
      .select({ avgDuration: sql<number>`coalesce(avg(duration_ms)::int, 0)` })
      .from(apiLogs)
      .where(gt(apiLogs.durationMs, 0));

    const latestBackup = await db
      .select()
      .from(systemBackups)
      .orderBy(desc(systemBackups.completedAt))
      .limit(1)
      .then((rows) => rows[0]);

    const dbHealth = await this.checkDatabaseConnectivity();

    return {
      databaseHealthy: dbHealth.healthy,
      databaseError: dbHealth.healthy ? undefined : dbHealth.error,
      openIncidents: openIncidents.count ?? 0,
      recentErrors: recentErrors.count ?? 0,
      recentPaymentFailures: recentFailures.count ?? 0,
      recentNotificationFailures: recentNotifications.count ?? 0,
      recentBackupFailures: recentBackupFailures.count ?? 0,
      averageApiLatencyMs: avgLatency?.avgDuration ?? 0,
      latestBackup: latestBackup ?? null,
      lastBackupStatus: latestBackup?.status ?? "unknown",
    };
  }

  static async logPaymentFailure(params: {
    paymentId?: string;
    userId?: string;
    paymentMethod?: string;
    provider?: string;
    status: string;
    failureReason?: string;
    amount?: string | number;
    currency?: string;
    metadata?: unknown;
  }) {
    try {
      const [inserted] = await db
        .insert(paymentFailures)
        .values({
          paymentId: params.paymentId,
          userId: params.userId,
          paymentMethod: params.paymentMethod,
          provider: params.provider,
          status: params.status.toUpperCase(),
          failureReason: params.failureReason,
          amount: params.amount ? String(params.amount) : null,
          currency: params.currency ?? "INR",
          metadata: params.metadata ?? null,
        })
        .returning();

      if (inserted) {
        observePaymentEvent(inserted.status, inserted.provider ?? "unknown");
        await this.evaluateAlertRules("PAYMENT_FAILURE", {
          id: inserted.id,
          paymentId: inserted.paymentId,
          userId: inserted.userId,
          paymentMethod: inserted.paymentMethod,
          provider: inserted.provider,
          status: inserted.status,
          failureReason: inserted.failureReason,
          amount: inserted.amount,
          currency: inserted.currency,
        });
      }

      return inserted;
    } catch (error) {
      logger.error(error, "Failed to persist payment failure");
      return null;
    }
  }

  static async getAlertRules(limit?: number) {
    return db
      .select()
      .from(alertRules)
      .orderBy(desc(alertRules.createdAt))
      .limit(limit ?? 100);
  }

  static async createAlertRule(params: {
    name: string;
    description?: string;
    eventType: MonitoringEventType;
    condition: AlertCondition;
    enabled?: boolean;
    severity?: string;
    notifyEmails?: string[];
    notifyClerkIds?: string[];
    notifyDiscordWebhooks?: string[];
    notifyWhatsAppNumbers?: string[];
  }) {
    try {
      const [inserted] = await db
        .insert(alertRules)
        .values({
          name: params.name,
          description: params.description,
          eventType: params.eventType,
          condition: params.condition,
          enabled: params.enabled ?? true,
          severity: params.severity?.toUpperCase() ?? "HIGH",
          notifyEmails: params.notifyEmails ?? null,
          notifyClerkIds: params.notifyClerkIds ?? null,
          notifyDiscordWebhooks: params.notifyDiscordWebhooks ?? null,
          notifyWhatsAppNumbers: params.notifyWhatsAppNumbers ?? null,
        })
        .returning();

      return inserted;
    } catch (error) {
      logger.error(error, "Failed to create alert rule");
      return null;
    }
  }

  static async updateAlertRule(id: number, params: Partial<{
    name: string;
    description: string;
    eventType: MonitoringEventType;
    condition: AlertCondition;
    enabled: boolean;
    severity: string;
    notifyEmails: string[];
    notifyClerkIds: string[];
  }>) {
    try {
      const [updated] = await db
        .update(alertRules)
        .set({
          ...(params.name !== undefined ? { name: params.name } : {}),
          ...(params.description !== undefined ? { description: params.description } : {}),
          ...(params.eventType !== undefined ? { eventType: params.eventType } : {}),
          ...(params.condition !== undefined ? { condition: params.condition } : {}),
          ...(params.enabled !== undefined ? { enabled: params.enabled } : {}),
          ...(params.severity !== undefined ? { severity: params.severity.toUpperCase() } : {}),
          ...(params.notifyEmails !== undefined ? { notifyEmails: params.notifyEmails } : {}),
          ...(params.notifyClerkIds !== undefined ? { notifyClerkIds: params.notifyClerkIds } : {}),
          updatedAt: new Date(),
        })
        .where(eq(alertRules.id, id))
        .returning();

      return updated || null;
    } catch (error) {
      logger.error(error, "Failed to update alert rule");
      return null;
    }
  }

  static async deleteAlertRule(id: number) {
    try {
      await db.delete(alertRules).where(eq(alertRules.id, id));
      return true;
    } catch (error) {
      logger.error(error, "Failed to delete alert rule");
      return false;
    }
  }

  static matchesAlertRule(rule: any, event: any) {
    const condition = rule.condition as AlertCondition;
    if (!condition) return false;

    if (rule.eventType === "SYSTEM_ERROR") {
      if (condition.errorType && event.errorType !== condition.errorType) return false;
      if (condition.severity && event.severity !== condition.severity.toUpperCase()) return false;
      if (condition.statusCodeGte && Number(event.statusCode) < condition.statusCodeGte) return false;
      if (condition.pathContains && !event.path?.includes(condition.pathContains)) return false;
      if (condition.messageContains && !event.message?.toLowerCase().includes(condition.messageContains.toLowerCase())) return false;
    }

    if (rule.eventType === "PAYMENT_FAILURE") {
      if (condition.provider && event.provider !== condition.provider) return false;
      if (condition.status && event.status !== condition.status.toUpperCase()) return false;
      if (condition.failureReasonContains && !event.failureReason?.toLowerCase().includes(condition.failureReasonContains.toLowerCase())) return false;
      if (condition.amountGte && Number(event.amount) < condition.amountGte) return false;
    }

    if (rule.eventType === "API_LOG") {
      if (condition.pathContains && !event.path?.includes(condition.pathContains)) return false;
      if (condition.status && Number(event.statusCode) !== Number(condition.status)) return false;
      if (condition.durationMsGte && Number(event.durationMs) < condition.durationMsGte) return false;
    }

    if (rule.eventType === "NOTIFICATION_FAILURE") {
      if (condition.notificationChannel && event.channel !== condition.notificationChannel) return false;
      if (condition.provider && event.provider !== condition.provider) return false;
      if (condition.status && event.status !== condition.status.toUpperCase()) return false;
      if (condition.failureReasonContains && !event.failureReason?.toLowerCase().includes(condition.failureReasonContains.toLowerCase())) return false;
    }

    if (rule.eventType === "BACKUP_EVENT") {
      if (condition.backupType && event.backupType !== condition.backupType.toUpperCase()) return false;
      if (condition.status && event.status !== condition.status.toUpperCase()) return false;
      if (condition.failureReasonContains && !event.failureReason?.toLowerCase().includes(condition.failureReasonContains.toLowerCase())) return false;
    }

    if (rule.eventType === "DATABASE_HEALTH") {
      if (condition.databaseStatus && event.status !== condition.databaseStatus.toUpperCase()) return false;
    }

    return true;
  }

  static async notifyAlertRule(rule: any, incident: any) {
    try {
      const summary = `Incident ${incident.id} triggered by alert rule: ${rule.name}`;
      const emailBody = `
        <h2>${summary}</h2>
        <p>${rule.description || "No description provided."}</p>
        <p><strong>Severity:</strong> ${incident.severity}</p>
        <p><strong>Incident:</strong> ${incident.title}</p>
        <p><strong>Link:</strong> ${process.env.FRONTEND_URL || "<frontend>"}/admin</p>
      `;

      const emails = Array.isArray(rule.notifyEmails) ? rule.notifyEmails : [];
      for (const email of emails) {
        if (!email) continue;
        await sendEmail({
          to: email,
          subject: `[FundedWealth Alert] ${rule.name}`,
          html: emailBody,
        });
      }

      const clerkIds = Array.isArray(rule.notifyClerkIds) ? rule.notifyClerkIds : [];
      for (const clerkId of clerkIds) {
        if (!clerkId) continue;
        await broadcastNotificationToUser(clerkId, {
          title: `Alert triggered: ${rule.name}`,
          body: summary,
          incident,
        });
      }

      const discordWebhooks = Array.isArray(rule.notifyDiscordWebhooks) ? rule.notifyDiscordWebhooks : [];
      const discordFallback = process.env.ALERT_DISCORD_WEBHOOK_URL ? [process.env.ALERT_DISCORD_WEBHOOK_URL] : [];
      for (const webhook of [...discordWebhooks, ...discordFallback]) {
        if (!webhook) continue;
        try {
          await fetch(webhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `**${rule.name}**\n${summary}` }),
          });
        } catch (err) {
          logger.error({ err }, "Failed to send Discord alert");
        }
      }

      const whatsappNumbers = Array.isArray(rule.notifyWhatsAppNumbers) ? rule.notifyWhatsAppNumbers : [];
      const whatsappWebhook = process.env.ALERT_WHATSAPP_WEBHOOK_URL;
      for (const number of whatsappNumbers) {
        if (!whatsappWebhook || !number) continue;
        try {
          await fetch(whatsappWebhook, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ number, message: summary }),
          });
        } catch (err) {
          logger.error({ err }, "Failed to send WhatsApp alert");
        }
      }
    } catch (error) {
      logger.error(error, "Failed to notify alert rule recipients");
    }
  }

  static async evaluateAlertRules(eventType: MonitoringEventType, event: any) {
    try {
      const rules = await db
        .select()
        .from(alertRules)
        .where(and(eq(alertRules.eventType, eventType), eq(alertRules.enabled, true)));

      for (const rule of rules) {
        if (this.matchesAlertRule(rule, event)) {
          const incident = await this.createIncident({
            title: `Alert: ${rule.name}`,
            description: rule.description || `Triggered by ${eventType}`,
            incidentType: rule.eventType,
            severity: rule.severity,
            linkedErrorId: eventType === "SYSTEM_ERROR" ? event.id : undefined,
            detectionSource: `alert_rule:${rule.id}`,
            priority: rule.severity,
            status: "OPEN",
          });

          if (incident) {
            await this.notifyAlertRule(rule, incident);
          }
        }
      }
    } catch (error) {
      logger.error(error, "Failed to evaluate alert rules");
    }
  }

  static async getHealthSummary() {
    try {
      // Each query is individually wrapped — if a monitoring table doesn't exist
      // (e.g. migrations not fully run), we still report the rest of the health data.
      let openIncidentCount = 0;
      let recentErrorCount = 0;
      let recentPaymentFailureCount = 0;
      let avgLatencyMs = 0;

      try {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(systemIncidents)
          .where(eq(systemIncidents.status, "OPEN"));
        openIncidentCount = row?.count ?? 0;
      } catch { /* table may not exist */ }

      try {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(systemErrors)
          .where(sql`created_at > now() - interval '24 hours'`);
        recentErrorCount = row?.count ?? 0;
      } catch { /* table may not exist */ }

      try {
        const [row] = await db
          .select({ count: sql<number>`count(*)::int` })
          .from(paymentFailures)
          .where(sql`created_at > now() - interval '24 hours'`);
        recentPaymentFailureCount = row?.count ?? 0;
      } catch { /* table may not exist */ }

      try {
        const [row] = await db
          .select({ avgDuration: sql<number>`coalesce(avg(duration_ms)::int, 0)` })
          .from(apiLogs)
          .where(gt(apiLogs.durationMs, 0));
        avgLatencyMs = row?.avgDuration ?? 0;
      } catch { /* table may not exist */ }

      const dbHealth = await this.checkDatabaseConnectivity();

      return {
        databaseHealthy: dbHealth.healthy,
        databaseError: dbHealth.healthy ? undefined : dbHealth.error,
        openIncidents: openIncidentCount,
        recentErrors: recentErrorCount,
        recentPaymentFailures: recentPaymentFailureCount,
        averageApiLatencyMs: avgLatencyMs,
      };
    } catch (error) {
      logger.error(error, "Failed to gather health summary");
      return {
        databaseHealthy: false,
        databaseError: error instanceof Error ? error.message : String(error),
        openIncidents: 0,
        recentErrors: 0,
        recentPaymentFailures: 0,
        averageApiLatencyMs: 0,
      };
    }
  }

  static async logBackupRecovery(params: {
    backupId?: number;
    recoveryType: string;
    status: string;
    scheduledFor: Date;
    startedAt?: Date;
    completedAt?: Date;
    durationMs?: number;
    targetEnvironment?: string;
    recoveryMethod?: string;
    itemsRecovered?: number;
    itemsFailed?: number;
    successRate?: string;
    metadata?: unknown;
  }) {
    try {
      const [inserted] = await db
        .insert(backupRecovery)
        .values({
          backupId: params.backupId,
          recoveryType: params.recoveryType.toUpperCase(),
          status: params.status.toUpperCase(),
          scheduledFor: params.scheduledFor,
          startedAt: params.startedAt,
          completedAt: params.completedAt,
          durationMs: params.durationMs,
          targetEnvironment: params.targetEnvironment,
          recoveryMethod: params.recoveryMethod,
          itemsRecovered: params.itemsRecovered,
          itemsFailed: params.itemsFailed,
          successRate: params.successRate,
          metadata: params.metadata ?? null,
          successful: params.status.toUpperCase() === "SUCCESS",
        })
        .returning();

      return inserted;
    } catch (error) {
      logger.error(error, "Failed to persist backup recovery event");
      return null;
    }
  }

  static async queryBackupRecovery(options: { status?: string; backupId?: number; limit?: number }) {
    const conditions = [] as any[];
    if (options.status) {
      conditions.push(eq(backupRecovery.status, options.status.toUpperCase()));
    }
    if (options.backupId) {
      conditions.push(eq(backupRecovery.backupId, options.backupId));
    }

    return db
      .select()
      .from(backupRecovery)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(backupRecovery.completedAt))
      .limit(options.limit ?? 50);
  }

  static async createIncidentSla(params: {
    incidentId: number;
    severity: string;
    slaType: string;
    targetResponseHours?: number;
    targetResolutionHours?: number;
    metadata?: unknown;
  }) {
    try {
      const now = new Date();
      const responseDeadline = params.targetResponseHours
        ? new Date(now.getTime() + params.targetResponseHours * 60 * 60 * 1000)
        : null;
      const resolutionDeadline = params.targetResolutionHours
        ? new Date(now.getTime() + params.targetResolutionHours * 60 * 60 * 1000)
        : null;

      const [inserted] = await db
        .insert(incidentSla)
        .values({
          incidentId: params.incidentId,
          severity: params.severity.toUpperCase(),
          slaType: params.slaType,
          targetResponseHours: params.targetResponseHours?.toString(),
          targetResolutionHours: params.targetResolutionHours?.toString(),
          responseDeadline,
          resolutionDeadline,
          metadata: params.metadata ?? null,
        })
        .returning();

      return inserted;
    } catch (error) {
      logger.error(error, "Failed to create incident SLA");
      return null;
    }
  }

  static async updateIncidentSla(
    slaId: number,
    params: {
      respondedAt?: Date;
      resolvedAt?: Date;
      metadata?: unknown;
    },
  ) {
    try {
      const existing = await db.select().from(incidentSla).where(eq(incidentSla.id, slaId)).limit(1);
      if (!existing.length) return null;

      const sla = existing[0];
      const updates: any = { metadata: params.metadata ?? sla.metadata };

      if (params.respondedAt) {
        updates.respondedAt = params.respondedAt;
        if (sla.responseDeadline) {
          const responseTimeMs = params.respondedAt.getTime() - sla.createdAt.getTime();
          const responseTimeHours = responseTimeMs / (1000 * 60 * 60);
          updates.responseTimeHours = responseTimeHours.toFixed(2);
          updates.responseBreached = responseTimeHours > Number(sla.targetResponseHours) ? "YES" : "NO";
        }
      }

      if (params.resolvedAt) {
        updates.resolvedAt = params.resolvedAt;
        if (sla.resolutionDeadline) {
          const resolutionTimeMs = params.resolvedAt.getTime() - sla.createdAt.getTime();
          const resolutionTimeHours = resolutionTimeMs / (1000 * 60 * 60);
          updates.resolutionTimeHours = resolutionTimeHours.toFixed(2);
          updates.resolutionBreached = resolutionTimeHours > Number(sla.targetResolutionHours) ? "YES" : "NO";
        }

        // Calculate overall compliance
        const responseOk = updates.responseBreached === "NO" ? 1 : 0;
        const resolutionOk = updates.resolutionBreached === "NO" ? 1 : 0;
        const compliancePercentage = ((responseOk + resolutionOk) / 2) * 100;
        updates.compliancePercentage = compliancePercentage.toFixed(2);
      }

      updates.updatedAt = new Date();

      const [updated] = await db
        .update(incidentSla)
        .set(updates)
        .where(eq(incidentSla.id, slaId))
        .returning();

      return updated || null;
    } catch (error) {
      logger.error(error, "Failed to update incident SLA");
      return null;
    }
  }

  static async queryIncidentSla(options: { incidentId?: number; breached?: "YES" | "NO"; limit?: number }) {
    const conditions = [] as any[];
    if (options.incidentId) {
      conditions.push(eq(incidentSla.incidentId, options.incidentId));
    }
    if (options.breached) {
      conditions.push(
        sql`(${incidentSla.responseBreached} = ${options.breached} OR ${incidentSla.resolutionBreached} = ${options.breached})`,
      );
    }

    return db
      .select()
      .from(incidentSla)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(incidentSla.createdAt))
      .limit(options.limit ?? 50);
  }

  static async getSlaMetrics(options: { timeframeHours?: number } = {}) {
    const hours = options.timeframeHours ?? 24;
    const safeHours = Math.min(Math.max(Math.floor(Number(hours) || 24), 1), 720);
    const cutoffDate = new Date(Date.now() - safeHours * 60 * 60 * 1000);
    const [slaStats] = await db
      .select({
        totalSlas: sql<number>`count(*)::int`.as("totalSlas"),
        breachedResponse: sql<number>`count(*) filter (where response_breached = 'YES')::int`.as("breachedResponse"),
        breachedResolution: sql<number>`count(*) filter (where resolution_breached = 'YES')::int`.as("breachedResolution"),
        avgCompliancePercentage: sql<number>`coalesce(avg(compliance_percentage)::numeric, 0)`.as("avgCompliancePercentage"),
      })
      .from(incidentSla)
      .where(sql`created_at > ${cutoffDate}`);

    return {
      totalSlas: slaStats.totalSlas ?? 0,
      breachedResponse: slaStats.breachedResponse ?? 0,
      breachedResolution: slaStats.breachedResolution ?? 0,
      avgCompliancePercentage: slaStats.avgCompliancePercentage ?? 0,
      slaComplianceRate: slaStats.totalSlas
        ? (((slaStats.totalSlas - (slaStats.breachedResponse + slaStats.breachedResolution) / 2) / slaStats.totalSlas) * 100).toFixed(2)
        : "0",
    };
  }
}
