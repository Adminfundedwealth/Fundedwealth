import { pgTable, uuid, varchar, timestamp, integer, numeric, text, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * session_analytics
 * Aggregated metrics per trading session (session = user login / defined window)
 */
export const sessionAnalytics = pgTable("session_analytics", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  sessionId: varchar("session_id"),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }),
  trades: integer("trades").default(0).notNull(),
  winRate: numeric("win_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  lossRate: numeric("loss_rate", { precision: 5, scale: 2 }).default("0").notNull(),
  avgRR: numeric("avg_rr", { precision: 6, scale: 3 }).default("0").notNull(),
  avgHoldTimeSec: integer("avg_hold_time_sec").default(0).notNull(),
  bestTradePnl: numeric("best_trade_pnl", { precision: 12, scale: 2 }).default("0").notNull(),
  worstTradePnl: numeric("worst_trade_pnl", { precision: 12, scale: 2 }).default("0").notNull(),
  overtradeScore: numeric("overtrade_score", { precision: 5, scale: 2 }).default("0").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("session_analytics_user_id_idx").on(t.userId),
  sessionIdIdx: index("session_analytics_session_id_idx").on(t.sessionId),
  startAtIdx: index("session_analytics_start_at_idx").on(t.startAt),
}));

export const insertSessionAnalyticsSchema = createInsertSchema(sessionAnalytics).omit({ id: true, createdAt: true, updatedAt: true });
export type SessionAnalytics = typeof sessionAnalytics.$inferSelect;
export type InsertSessionAnalytics = z.infer<typeof insertSessionAnalyticsSchema>;
