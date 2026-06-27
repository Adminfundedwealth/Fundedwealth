import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  json,
  numeric,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { systemIncidents } from "./system-incidents";

export const incidentSla = pgTable(
  "incident_sla",
  {
    id: serial("id").primaryKey(),
    incidentId: integer("incident_id").references(() => systemIncidents.id, { onDelete: "cascade" }),
    severity: text("severity").notNull().default("MEDIUM"),
    slaType: text("sla_type").notNull(),
    targetResponseHours: numeric("target_response_hours", { precision: 10, scale: 2 }),
    targetResolutionHours: numeric("target_resolution_hours", { precision: 10, scale: 2 }),
    responseDeadline: timestamp("response_deadline", { withTimezone: true }),
    resolutionDeadline: timestamp("resolution_deadline", { withTimezone: true }),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    responseBreached: text("response_breached").default("NO"),
    resolutionBreached: text("resolution_breached").default("NO"),
    responseTimeHours: numeric("response_time_hours", { precision: 10, scale: 2 }),
    resolutionTimeHours: numeric("resolution_time_hours", { precision: 10, scale: 2 }),
    compliancePercentage: numeric("compliance_percentage", { precision: 5, scale: 2 }),
    metadata: json("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    incidentIdIdx: index("incident_sla_incident_id_idx").on(table.incidentId),
    severityIdx: index("incident_sla_severity_idx").on(table.severity),
    responseBreachedIdx: index("incident_sla_response_breached_idx").on(table.responseBreached),
    resolutionBreachedIdx: index("incident_sla_resolution_breached_idx").on(table.resolutionBreached),
    createdAtIdx: index("incident_sla_created_at_idx").on(table.createdAt),
  }),
);

export const insertIncidentSlaSchema = createInsertSchema(incidentSla).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type IncidentSla = typeof incidentSla.$inferSelect;
export type InsertIncidentSla = z.infer<typeof insertIncidentSlaSchema>;
