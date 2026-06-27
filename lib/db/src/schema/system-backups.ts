import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  json,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const systemBackups = pgTable(
  "system_backups",
  {
    id: serial("id").primaryKey(),
    backupType: text("backup_type").notNull().default("FULL"),
    provider: text("provider"),
    status: text("status").notNull().default("SUCCESS"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    durationMs: integer("duration_ms"),
    bytesTransferred: integer("bytes_transferred"),
    storageLocation: text("storage_location"),
    metadata: json("metadata"),
    successful: boolean("successful").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("system_backups_status_idx").on(table.status),
    backupTypeIdx: index("system_backups_backup_type_idx").on(table.backupType),
    completedAtIdx: index("system_backups_completed_at_idx").on(table.completedAt),
  }),
);

export const insertSystemBackupSchema = createInsertSchema(systemBackups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SystemBackup = typeof systemBackups.$inferSelect;
export type InsertSystemBackup = z.infer<typeof insertSystemBackupSchema>;
