import { pgTable, serial, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const impactDonations = pgTable("impact_donations", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  donorName: text("donor_name").notNull(),
  donorCity: text("donor_city"),
  amount: integer("amount").notNull(),
  category: text("category").default("general").notNull(),
  mealsProvided: integer("meals_provided").default(0).notNull(),
  studentsSupported: integer("students_supported").default(0).notNull(),
  transactionId: text("transaction_id"),
  paymentId: text("payment_id"),  // FK → orders.id — links donation to Razorpay payment
  status: text("status").default("completed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertImpactDonationSchema = createInsertSchema(impactDonations).omit({
  id: true,
  createdAt: true,
});

export type ImpactDonation = typeof impactDonations.$inferSelect;
export type InsertImpactDonation = z.infer<typeof insertImpactDonationSchema>;
