import { pgTable, text, timestamp, integer, bigint, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Matches actual DB columns exactly
export const tradingAccounts = pgTable("trading_accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  accountCode: text("account_code").notNull().unique(),
  userId: text("user_id").notNull(),
  orderId: text("order_id"),                                 // FK → orders.id — links account back to originating purchase
  planType: text("plan").notNull(),                          // DB col = "plan"
  phase: text("phase").default("phase_1").notNull(),
  status: text("status").default("active").notNull(),
  currentBalance: bigint("virtual_balance", { mode: "number" }),   // DB col = "virtual_balance"
  profitTarget: bigint("profit_target", { mode: "number" }),
  maxDrawdown: bigint("max_drawdown", { mode: "number" }),
  dailyLossLimit: bigint("daily_loss_limit", { mode: "number" }),
  profitLoss: bigint("total_pnl", { mode: "number" }).default(0),  // DB col = "total_pnl"
  dailyDrawdown: real("daily_drawdown").default(0),
  profitSplit: integer("profit_split").default(80),
  tradingDays: integer("trading_days").default(0),
  scalingLevel: integer("scaling_level").default(1),
  feePaid: integer("fee_paid").default(0),
  couponUsed: text("coupon_used"),
  isFunded: boolean("is_funded").default(false),
  fundedAt: timestamp("funded_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertTradingAccountSchema = createInsertSchema(tradingAccounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TradingAccount = typeof tradingAccounts.$inferSelect;
export type InsertTradingAccount = z.infer<typeof insertTradingAccountSchema>;
