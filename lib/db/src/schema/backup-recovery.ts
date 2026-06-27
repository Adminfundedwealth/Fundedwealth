import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  json,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { systemBackups } from "./system-backups";

export const backupRecovery = pgTable(
  "backup_recovery",
  {
    id: serial("id").primaryKey(),
    backupId: integer("backup_id").references(() => systemBackups.id, { onDelete: "cascade" }),
    recoveryType: text("recovery_type").notNull().default("FULL"),
    status: text("status").notNull().default("PENDING"),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    startedAt: timestamp("started_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    targetEnvironment: text("target_environment"),
    recoveryMethod: text("recovery_method"),
    itemsRecovered: integer("items_recovered"),
    itemsFailed: integer("items_failed"),
    successRate: text("success_rate"),
    metadata: json("metadata"),
    successful: boolean("successful"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("backup_recovery_status_idx").on(table.status),
    backupIdIdx: index("backup_recovery_backup_id_idx").on(table.backupId),
    scheduledForIdx: index("backup_recovery_scheduled_for_idx").on(table.scheduledFor),
    completedAtIdx: index("backup_recovery_completed_at_idx").on(table.completedAt),
  }),
);

export const insertBackupRecoverySchema = createInsertSchema(backupRecovery).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type BackupRecovery = typeof backupRecovery.$inferSelect;
export type InsertBackupRecovery = z.infer<typeof insertBackupRecoverySchema>;
