import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  decimal,
  index,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const riskProfiles = pgTable(
  "risk_profiles",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    riskScore: decimal("risk_score", { precision: 5, scale: 2 })
      .notNull()
      .default("0"),
    riskLevel: text("risk_level").notNull().default("LOW"), // LOW, MEDIUM, HIGH, CRITICAL
    ipRiskScore: decimal("ip_risk_score", { precision: 5, scale: 2 })
      .default("0"),
    deviceRiskScore: decimal("device_risk_score", { precision: 5, scale: 2 })
      .default("0"),
    behaviorRiskScore: decimal("behavior_risk_score", { precision: 5, scale: 2 })
      .default("0"),
    vpnProxyRiskScore: decimal("vpn_proxy_risk_score", { precision: 5, scale: 2 })
      .default("0"),
    kycRiskScore: decimal("kyc_risk_score", { precision: 5, scale: 2 })
      .default("0"),
    referralRiskScore: decimal("referral_risk_score", { precision: 5, scale: 2 })
      .default("0"),
    tradingRiskScore: decimal("trading_risk_score", { precision: 5, scale: 2 })
      .default("0"),
    isBlocked: boolean("is_blocked").default(false).notNull(),
    payoutRestricted: boolean("payout_restricted").default(false).notNull(),
    requiresManualReview: boolean("requires_manual_review").default(false).notNull(),
    lastUpdated: timestamp("last_updated", { withTimezone: true })
      .defaultNow()
      .notNull(),
    notes: text("notes"),
  },
  (table) => ({
    userIdIdx: index("risk_profiles_user_id_idx").on(table.userId),
    riskLevelIdx: index("risk_profiles_risk_level_idx").on(table.riskLevel),
    isBlockedIdx: index("risk_profiles_is_blocked_idx").on(table.isBlocked),
  }),
);

export const insertRiskProfileSchema = createInsertSchema(riskProfiles).omit({
  id: true,
  lastUpdated: true,
});

export type RiskProfile = typeof riskProfiles.$inferSelect;
export type InsertRiskProfile = z.infer<typeof insertRiskProfileSchema>;
