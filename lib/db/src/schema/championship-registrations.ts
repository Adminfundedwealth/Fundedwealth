import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const championshipRegistrations = pgTable("championship_registrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  mobile: text("mobile").notNull(),
  clerkId: text("clerk_id"),
  challengeType: text("challenge_type").default("monthly").notNull(),
  status: text("status").default("registered").notNull(),
  rank: integer("rank"),
  profitAmount: integer("profit_amount").default(0).notNull(),
  prizeWon: text("prize_won"),
  paymentId: text("payment_id"),  // FK → orders.id — links registration to payment
  paymentStatus: text("payment_status").default("pending").notNull(), // "pending" | "paid" | "failed"
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertChampionshipRegistrationSchema = createInsertSchema(championshipRegistrations).omit({
  id: true,
  rank: true,
  prizeWon: true,
  createdAt: true,
});

export type ChampionshipRegistration = typeof championshipRegistrations.$inferSelect;
export type InsertChampionshipRegistration = z.infer<typeof insertChampionshipRegistrationSchema>;
