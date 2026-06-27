import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  index,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const webhookLogs = pgTable(
  "webhook_logs",
  {
    id: serial("id").primaryKey(),
    provider: text("provider").notNull(), // easebuzz, razorpay, stripe, etc.
    eventType: text("event_type").notNull(), // payment.success, payment.failed, etc.
    webhookId: text("webhook_id").unique(),
    idempotencyKey: text("idempotency_key"),
    signature: text("signature").notNull(),
    isSignatureValid: boolean("is_signature_valid").notNull(),
    payload: jsonb("payload").notNull(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("PENDING"), // PENDING, PROCESSED, FAILED, DUPLICATE
    processedAt: timestamp("processed_at", { withTimezone: true }),
    errorMessage: text("error_message"),
    retryCount: integer("retry_count").default(0).notNull(),
    lastRetryAt: timestamp("last_retry_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    providerIdx: index("webhook_logs_provider_idx").on(table.provider),
    eventTypeIdx: index("webhook_logs_event_type_idx").on(table.eventType),
    webhookIdIdx: index("webhook_logs_webhook_id_idx").on(table.webhookId),
    idempotencyKeyIdx: index("webhook_logs_idempotency_key_idx").on(
      table.idempotencyKey,
    ),
    statusIdx: index("webhook_logs_status_idx").on(table.status),
    userIdIdx: index("webhook_logs_user_id_idx").on(table.userId),
    createdAtIdx: index("webhook_logs_created_at_idx").on(table.createdAt),
  }),
);

export const insertWebhookLogSchema = createInsertSchema(webhookLogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  processedAt: true,
  lastRetryAt: true,
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = z.infer<typeof insertWebhookLogSchema>;
