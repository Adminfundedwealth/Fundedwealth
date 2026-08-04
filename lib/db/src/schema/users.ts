import { pgTable, uuid, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  city: text("city"),
  state: text("state"),
  addressLine1: text("address_line1"),
  postalCode: text("postal_code"),
  country: text("country"),
  avatarUrl: text("avatar_url"),
  role: text("role").default("user").notNull(),
  affiliateCode: text("affiliate_code").unique(),
  referredBy: text("referred_by"),
  notificationSettings: text("notification_settings").default(JSON.stringify({ emailAlerts: true, whatsappAlerts: false, inAppAlerts: true, payoutAlerts: true, tradeAlerts: true, marketingAlerts: false })).notNull(),
  kycStatus: text("kyc_status").default("pending").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  // Onboarding: true once the customer has set their password via /auth/create-password.
  // Gates the one-time password-setup page so it is never shown again.
  onboardingCompleted: boolean("onboarding_completed").default(false).notNull(),
  // Fraud enforcement
  riskScore: integer("risk_score").default(0),
  riskLevel: text("risk_level").default("LOW"),
  accountStatus: text("account_status").default("active"), // active, restricted, suspended, banned
  experiencePoints: integer("experience_points").default(0).notNull(),
  currentLevel: text("current_level").default("Beginner").notNull(),
  achievementCount: integer("achievement_count").default(0).notNull(),
  streakPoints: integer("streak_points").default(0).notNull(),
  publicProfile: boolean("public_profile").default(false).notNull(),
  totalPayout: integer("total_payout").default(0).notNull(),
  // Withdrawal payment details
  upiId: text("upi_id"),
  bankAccountName: text("bank_account_name"),
  bankAccountNumber: text("bank_account_number"),
  bankIfscCode: text("bank_ifsc_code"),
  bankName: text("bank_name"),
  preferredPayoutMethod: text("preferred_payout_method").default("UPI"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
