import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { payouts } from "./payouts";

export const payoutTimelineEvents = pgTable("payout_timeline_events", {
  id: serial("id").primaryKey(),
  payoutId: integer("payout_id").notNull().references(() => payouts.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  note: text("note").default("").notNull(),
  actor: text("actor").default("system").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertPayoutTimelineEventSchema = createInsertSchema(payoutTimelineEvents).omit({
  id: true,
  createdAt: true,
});

export type PayoutTimelineEvent = typeof payoutTimelineEvents.$inferSelect;
export type InsertPayoutTimelineEvent = z.infer<typeof insertPayoutTimelineEventSchema>;

// CREATE INDEX idx_payout_timeline_events_payout_id ON payout_timeline_events (payout_id);
