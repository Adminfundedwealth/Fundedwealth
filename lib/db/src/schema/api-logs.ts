import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  json,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const apiLogs = pgTable(
  "api_logs",
  {
    id: serial("id").primaryKey(),
    path: text("path").notNull(),
    method: text("method").notNull(),
    statusCode: integer("status_code").notNull(),
    durationMs: integer("duration_ms").notNull(),
    userId: text("user_id"),
    userEmail: text("user_email"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    requestBody: json("request_body"),
    responseBody: json("response_body"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pathIdx: index("api_logs_path_idx").on(table.path),
    statusCodeIdx: index("api_logs_status_code_idx").on(table.statusCode),
    createdAtIdx: index("api_logs_created_at_idx").on(table.createdAt),
    userIdIdx: index("api_logs_user_id_idx").on(table.userId),
  }),
);

export const insertApiLogSchema = createInsertSchema(apiLogs).omit({
  id: true,
  createdAt: true,
});

export type ApiLog = typeof apiLogs.$inferSelect;
export type InsertApiLog = z.infer<typeof insertApiLogSchema>;
