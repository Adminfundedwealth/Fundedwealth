import { pgTable, serial, text, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const referrals = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerUserId: uuid("referrer_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  referredUserId: uuid("referred_user_id").references(() => users.id, { onDelete: "set null" }),
  referralCode: text("referral_code").notNull(),
  referredEmail: text("referred_email"),
  commissionAmount: integer("commission_amount").default(0).notNull(),
  status: text("status").default("pending").notNull(),
  planPurchased: text("plan_purchased"),
  purchaseAmount: integer("purchase_amount").default(0).notNull(),
  level: integer("level").default(1).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  referralCode: text("referral_code").notNull(),
  ipHash: text("ip_hash").notNull(),
  country: text("country"),
  device: text("device"),
  clickedAt: timestamp("clicked_at", { withTimezone: true }).defaultNow().notNull(),
});

export const affiliatePayouts = pgTable("affiliate_payouts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  method: text("method").default("UPI").notNull(),
  status: text("status").default("pending").notNull(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const affiliateReferrals = referrals;

export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertAffiliatePayoutSchema = createInsertSchema(affiliatePayouts).omit({
  id: true,
  processedAt: true,
  createdAt: true,
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliatePayout = typeof affiliatePayouts.$inferSelect;
export type InsertAffiliatePayout = z.infer<typeof insertAffiliatePayoutSchema>;

// Recommended database indexes for production:
// CREATE INDEX idx_referrals_referral_code ON referrals (referral_code);
// CREATE INDEX idx_referrals_referrer_user_id ON referrals (referrer_user_id);
// CREATE INDEX idx_referrals_status ON referrals (status);
// CREATE INDEX idx_affiliate_clicks_referral_code ON affiliate_clicks (referral_code);
// CREATE INDEX idx_affiliate_payouts_user_id ON affiliate_payouts (user_id);
// CREATE INDEX idx_affiliate_payouts_status ON affiliate_payouts (status);
// Enable Row Level Security in Supabase or PostgreSQL for these tables by restricting access to referrer_user_id / user_id.
