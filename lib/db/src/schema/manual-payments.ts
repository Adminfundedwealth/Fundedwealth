import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  decimal,
  json,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const manualPayments = pgTable(
  "manual_payments",
  {
    id: serial("id").primaryKey(),
    // NOTE: live DB has order_id as integer and user_id as integer.
    // These cannot FK to orders.id (text) or users.id (uuid) due to type mismatch.
    // FK references removed to avoid Drizzle type errors.
    // A future migration should align these column types.
    orderId: text("order_id"),
    userId: uuid("user_id").notNull(),
    paymentMethod: text("payment_method").notNull(), // 'upi' or 'bank'
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    currency: text("currency").notNull().default("INR"),
    
    // UPI specific
    upiId: text("upi_id"),
    utr: text("utr"), // UTR/Reference number entered by user
    
    // Bank specific
    reference: text("reference"), // Bank transfer reference number
    
    // Payment proof
    proofUrl: text("proof_url"), // URL to uploaded proof file
    proofFileName: text("proof_file_name"),
    
    // Status tracking
    status: text("status").notNull().default("pending"), // pending, under_review, approved, rejected
    rejectionReason: text("rejection_reason"),
    
    // Admin review
    reviewedBy: integer("reviewed_by"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    
    // Metadata
    metadata: json("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("manual_payments_user_id_idx").on(table.userId),
    orderIdIdx: index("manual_payments_order_id_idx").on(table.orderId),
    statusIdx: index("manual_payments_status_idx").on(table.status),
    methodIdx: index("manual_payments_method_idx").on(table.paymentMethod),
    createdAtIdx: index("manual_payments_created_at_idx").on(table.createdAt),
  }),
);

export const insertManualPaymentSchema = createInsertSchema(manualPayments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  reviewedAt: true,
});

export type ManualPayment = typeof manualPayments.$inferSelect;
export type InsertManualPayment = z.infer<typeof insertManualPaymentSchema>;
