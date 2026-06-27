import { pgTable, serial, text, timestamp, real, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tradeJournal = pgTable("trade_journal", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  accountId: text("account_id"),
  symbol: text("symbol").notNull(),
  tradeType: text("trade_type").notNull(),
  entryPrice: real("entry_price").default(0).notNull(),
  exitPrice: real("exit_price").default(0).notNull(),
  pnl: real("pnl").default(0).notNull(),
  lotSize: real("lot_size").default(0).notNull(),
  risk: real("risk").default(0).notNull(),
  emotion: text("emotion").default("Calm").notNull(),
  confidenceScore: integer("confidence_score").default(50).notNull(),
  mistakeType: text("mistake_type").default("").notNull(),
  notes: text("notes").default("").notNull(),
  screenshotUrl: text("screenshot_url"),
  tags: text("tags").default("[]").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertTradeJournalSchema = createInsertSchema(tradeJournal).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type TradeJournal = typeof tradeJournal.$inferSelect;
export type InsertTradeJournal = z.infer<typeof insertTradeJournalSchema>;
