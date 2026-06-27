import { pgTable, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Matches the actual DB table — id is uuid/text, user_id is text
// updated_at must be added via SQL before this works (see migration below)
export const orders = pgTable("orders", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  amount: real("amount").notNull(),
  accountSize: integer("account_size"),  // Actual challenge account size (e.g. 500000), NOT fee paid
  planType: text("plan_type").notNull(),
  paymentType: text("payment_type").default("challenge").notNull(), // "challenge" | "championship" | "donation"
  status: text("status").default("pending").notNull(),
  paymentMethod: text("payment_method").notNull(),
  utrReference: text("utr_reference"),
  metadata: text("metadata"), // JSON string for extra data (championship type, donation cause, etc.)
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
