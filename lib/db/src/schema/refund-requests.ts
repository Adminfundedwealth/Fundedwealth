import { pgTable, uuid, text, numeric, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const REFUND_STATUSES = [
  "PENDING",
  "UNDER_REVIEW",
  "MORE_INFORMATION_REQUIRED",
  "APPROVED",
  "REJECTED",
  "PROCESSING",
  "REFUNDED",
  "FAILED",
  "CANCELLED",
] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

/** Terminal statuses — a case in one of these cannot be reopened */
export const REFUND_TERMINAL_STATUSES: RefundStatus[] = [
  "REFUNDED",
  "REJECTED",
  "CANCELLED",
  "FAILED",
];

export const refundRequests = pgTable("refund_requests", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Relationships
  orderId:  text("order_id").notNull(),
  userId:   uuid("user_id").notNull(),

  // Financials
  refundAmount: numeric("refund_amount", { precision: 12, scale: 2 }).notNull(),
  reason:       text("reason").notNull(),

  // Lifecycle
  status: text("status").notNull().default("PENDING"),

  // Payment details
  paymentMethod:    text("payment_method"),
  paymentReference: text("payment_reference"),
  gatewayRefundId:  text("gateway_refund_id"),
  refundMethod:     text("refund_method"),

  // Support-first origin
  supportTicketId: text("support_ticket_id"),
  supportAgentId:  text("support_agent_id"),
  supportNote:     text("support_note"),

  // Admin decision
  reviewedBy:      text("reviewed_by"),
  reviewedAt:      timestamp("reviewed_at", { withTimezone: true }),
  rejectionReason: text("rejection_reason"),
  rejectionNote:   text("rejection_note"),

  // Processing timestamps
  requestedAt:  timestamp("requested_at",  { withTimezone: true }).defaultNow().notNull(),
  processedAt:  timestamp("processed_at",  { withTimezone: true }),
  completedAt:  timestamp("completed_at",  { withTimezone: true }),

  // Gateway metadata
  metadata: jsonb("metadata").default({}),

  // Audit timestamps
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertRefundRequestSchema = createInsertSchema(refundRequests).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RefundRequest   = typeof refundRequests.$inferSelect;
export type InsertRefundRequest = z.infer<typeof insertRefundRequestSchema>;
