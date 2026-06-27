import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  decimal,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const referralFraudLogs = pgTable(
  "referral_fraud_logs",
  {
    id: serial("id").primaryKey(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    referredUserId: uuid("referred_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fraudReason: text("fraud_reason").notNull(), // SELF_REFERRAL, SAME_IP, SAME_DEVICE, SAME_KYC, FAKE_SIGNUP, REFERRAL_LOOP
    riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(),
    ipAddress: text("ip_address"),
    deviceFingerprint: text("device_fingerprint"),
    status: text("status").default("OPEN").notNull(), // OPEN, REVIEWING, RESOLVED
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    referrerIdIdx: index("referral_fraud_logs_referrer_id_idx").on(
      table.referrerId
    ),
    referredUserIdIdx: index("referral_fraud_logs_referred_user_id_idx").on(
      table.referredUserId
    ),
    fraudReasonIdx: index("referral_fraud_logs_fraud_reason_idx").on(
      table.fraudReason
    ),
    createdAtIdx: index("referral_fraud_logs_created_at_idx").on(
      table.createdAt
    ),
  }),
);

export const insertReferralFraudLogSchema = createInsertSchema(
  referralFraudLogs
).omit({
  id: true,
  createdAt: true,
});

export type ReferralFraudLog = typeof referralFraudLogs.$inferSelect;
export type InsertReferralFraudLog = z.infer<
  typeof insertReferralFraudLogSchema
>;
