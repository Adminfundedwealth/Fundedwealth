import { pgTable, serial, uuid, text, real, timestamp, boolean, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * admin_events — Notification queue for Admin Panel
 *
 * OWNERSHIP:
 * - Main Site: INSERT events when actions require admin attention
 * - Admin Panel: READ and acknowledge (set is_read = true)
 * - Terminal: May INSERT provisioning_failed events
 *
 * Event types:
 *   payment_received — new payment confirmed (any method)
 *   kyc_submitted — user submitted KYC documents
 *   payout_requested — user requested a payout
 *   provisioning_failed — terminal failed to provision an account
 *   manual_review_required — payment needs manual verification
 */
export const adminEvents = pgTable(
  "admin_events",
  {
    id: serial("id").primaryKey(),
    eventType: text("event_type").notNull(),
    orderId: text("order_id"),
    userId: uuid("user_id").notNull(),
    amount: real("amount"),
    paymentMethod: text("payment_method"),
    metadata: jsonb("metadata").default({}),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventTypeIdx: index("admin_events_event_type_idx").on(table.eventType),
    isReadIdx: index("admin_events_is_read_idx").on(table.isRead),
    userIdIdx: index("admin_events_user_id_idx").on(table.userId),
    createdAtIdx: index("admin_events_created_at_idx").on(table.createdAt),
  }),
);

export const insertAdminEventSchema = createInsertSchema(adminEvents).omit({
  id: true,
  createdAt: true,
});

export type AdminEvent = typeof adminEvents.$inferSelect;
export type InsertAdminEvent = z.infer<typeof insertAdminEventSchema>;
