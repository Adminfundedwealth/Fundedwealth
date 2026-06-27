import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { systemErrors } from "./system-errors";

export const systemIncidents = pgTable(
  "system_incidents",
  {
    id: serial("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description"),
    incidentType: text("incident_type").notNull().default("SYSTEM"),
    severity: text("severity").notNull().default("HIGH"),
    status: text("status").notNull().default("OPEN"),
    linkedErrorId: integer("linked_error_id").references(() => systemErrors.id, { onDelete: "set null" }),
    assignee: text("assignee"),
    priority: text("priority").notNull().default("MEDIUM"),
    detectionSource: text("detection_source"),
    resolutionNotes: text("resolution_notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedBy: text("resolved_by"),
  },
  (table) => ({
    statusIdx: index("system_incidents_status_idx").on(table.status),
    severityIdx: index("system_incidents_severity_idx").on(table.severity),
    incidentTypeIdx: index("system_incidents_incident_type_idx").on(table.incidentType),
    createdAtIdx: index("system_incidents_created_at_idx").on(table.createdAt),
  }),
);

export const insertSystemIncidentSchema = createInsertSchema(systemIncidents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  resolvedBy: true,
});

export type SystemIncident = typeof systemIncidents.$inferSelect;
export type InsertSystemIncident = z.infer<typeof insertSystemIncidentSchema>;
