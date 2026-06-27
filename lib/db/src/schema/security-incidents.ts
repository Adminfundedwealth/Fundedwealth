import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const securityIncidents = pgTable(
  "security_incidents",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    incidentType: text("incident_type").notNull(), // brute_force, credential_stuffing, account_takeover, suspicious_activity, etc.
    severity: text("severity").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, CRITICAL
    status: text("status").notNull().default("OPEN"), // OPEN, INVESTIGATING, RESOLVED, FALSE_ALARM
    description: text("description").notNull(),
    ipAddress: text("ip_address"),
    deviceFingerprint: text("device_fingerprint"),
    country: text("country"),
    actionTaken: text("action_taken"), // account_locked, email_sent, mfa_reset, etc.
    isAutomatic: boolean("is_automatic").default(true).notNull(),
    requiresManualReview: boolean("requires_manual_review").default(false),
    reviewedBy: uuid("reviewed_by").references(() => users.id, {
      onDelete: "set null",
    }),
    resolution: text("resolution"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("security_incidents_user_id_idx").on(table.userId),
    incidentTypeIdx: index("security_incidents_incident_type_idx").on(
      table.incidentType,
    ),
    severityIdx: index("security_incidents_severity_idx").on(table.severity),
    statusIdx: index("security_incidents_status_idx").on(table.status),
    createdAtIdx: index("security_incidents_created_at_idx").on(
      table.createdAt,
    ),
  }),
);

export const insertSecurityIncidentSchema = createInsertSchema(
  securityIncidents,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export type SecurityIncident = typeof securityIncidents.$inferSelect;
export type InsertSecurityIncident = z.infer<
  typeof insertSecurityIncidentSchema
>;
