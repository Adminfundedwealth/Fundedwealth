import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  json,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const notificationFailures = pgTable(
  "notification_failures",
  {
    id: serial("id").primaryKey(),
    notificationId: text("notification_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    channel: text("channel"),
    provider: text("provider"),
    status: text("status").notNull().default("FAILED"),
    failureReason: text("failure_reason"),
    metadata: json("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    statusIdx: index("notification_failures_status_idx").on(table.status),
    providerIdx: index("notification_failures_provider_idx").on(table.provider),
    createdAtIdx: index("notification_failures_created_at_idx").on(table.createdAt),
  }),
);

export const insertNotificationFailureSchema = createInsertSchema(notificationFailures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type NotificationFailure = typeof notificationFailures.$inferSelect;
export type InsertNotificationFailure = z.infer<typeof insertNotificationFailureSchema>;
