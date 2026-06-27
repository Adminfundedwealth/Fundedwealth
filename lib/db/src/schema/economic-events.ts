import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const economicEvents = pgTable("economic_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  country: text("country").notNull(),
  eventType: text("event_type").notNull(),
  impact: text("impact").default("low").notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  actual: text("actual"),
  forecast: text("forecast"),
  previous: text("previous"),
  source: text("source").notNull(),
  sourceUrl: text("source_url"),
  isPinned: boolean("is_pinned").default(false).notNull(),
  notified24h: boolean("notified_24h").default(false).notNull(),
  notified1h: boolean("notified_1h").default(false).notNull(),
  notified15m: boolean("notified_15m").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertEconomicEventSchema = createInsertSchema(economicEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  notified24h: true,
  notified1h: true,
  notified15m: true,
});

export type EconomicEvent = typeof economicEvents.$inferSelect;
export type InsertEconomicEvent = z.infer<typeof insertEconomicEventSchema>;
