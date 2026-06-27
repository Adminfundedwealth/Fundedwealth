import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  json,
  boolean,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const systemErrors = pgTable(
  "system_errors",
  {
    id: serial("id").primaryKey(),
    errorType: text("error_type").notNull().default("SYSTEM_ERROR"),
    message: text("message").notNull(),
    stack: text("stack"),
    path: text("path").notNull(),
    method: text("method").notNull(),
    severity: text("severity").notNull().default("ERROR"),
    statusCode: integer("status_code").notNull().default(500),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    userEmail: text("user_email"),
    service: text("service"),
    environment: text("environment").notNull().default("production"),
    metadata: json("metadata"),
    seen: boolean("seen").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    errorTypeIdx: index("system_errors_error_type_idx").on(table.errorType),
    severityIdx: index("system_errors_severity_idx").on(table.severity),
    statusCodeIdx: index("system_errors_status_code_idx").on(table.statusCode),
    createdAtIdx: index("system_errors_created_at_idx").on(table.createdAt),
    userIdIdx: index("system_errors_user_id_idx").on(table.userId),
  }),
);

export const insertSystemErrorSchema = createInsertSchema(systemErrors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type SystemError = typeof systemErrors.$inferSelect;
export type InsertSystemError = z.infer<typeof insertSystemErrorSchema>;
