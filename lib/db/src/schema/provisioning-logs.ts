import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * provisioning_logs — Integration bridge: Main Site → Terminal
 *
 * OWNERSHIP:
 * - Main Site: INSERT with status='pending' after payment confirmation
 * - Terminal: UPDATE status to 'processing'→'completed' or 'failed'
 * - Admin: READ for monitoring
 *
 * Main Site NEVER updates trader_id, challenge_account_id, or trading_account_id.
 */
export const provisioningLogs = pgTable(
  "provisioning_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: text("order_id").notNull(),
    plan: text("plan").notNull(),
    paymentMethod: text("payment_method").notNull(),
    paymentRef: text("payment_ref"),
    source: text("source").notNull().default("website"),
    status: text("status").notNull().default("pending"), // pending | processing | completed | failed
    errorMessage: text("error_message"),
    // Terminal populates these after provisioning
    traderId: uuid("trader_id"),
    challengeAccountId: uuid("challenge_account_id"),
    tradingAccountId: uuid("trading_account_id"),
    // Timestamps
    startedAt: timestamp("started_at", { withTimezone: true }).defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    orderIdIdx: index("provisioning_logs_order_id_idx").on(table.orderId),
    statusIdx: index("provisioning_logs_status_idx").on(table.status),
    createdAtIdx: index("provisioning_logs_created_at_idx").on(table.createdAt),
    tradingAccountIdIdx: index("provisioning_logs_trading_account_id_idx").on(table.tradingAccountId),
    challengeAccountIdIdx: index("provisioning_logs_challenge_account_id_idx").on(table.challengeAccountId),
  }),
);

export const insertProvisioningLogSchema = createInsertSchema(provisioningLogs).omit({
  id: true,
  createdAt: true,
  startedAt: true,
});

export type ProvisioningLog = typeof provisioningLogs.$inferSelect;
export type InsertProvisioningLog = z.infer<typeof insertProvisioningLogSchema>;
