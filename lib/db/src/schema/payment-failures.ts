import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  json,
  decimal,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const paymentFailures = pgTable(
  "payment_failures",
  {
    id: serial("id").primaryKey(),
    paymentId: text("payment_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    paymentMethod: text("payment_method"),
    provider: text("provider"),
    status: text("status").notNull().default("FAILED"),
    failureReason: text("failure_reason"),
    amount: decimal("amount", { precision: 12, scale: 2 }),
    currency: text("currency").notNull().default("INR"),
    metadata: json("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("payment_failures_user_id_idx").on(table.userId),
    statusIdx: index("payment_failures_status_idx").on(table.status),
    providerIdx: index("payment_failures_provider_idx").on(table.provider),
    createdAtIdx: index("payment_failures_created_at_idx").on(table.createdAt),
  }),
);

export const insertPaymentFailureSchema = createInsertSchema(paymentFailures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type PaymentFailure = typeof paymentFailures.$inferSelect;
export type InsertPaymentFailure = z.infer<typeof insertPaymentFailureSchema>;
