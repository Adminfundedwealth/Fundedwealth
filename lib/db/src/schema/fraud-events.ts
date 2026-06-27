import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  json,
  decimal,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const fraudEvents = pgTable(
  "fraud_events",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accountId: text("account_id"),
    fraudType: text("fraud_type").notNull(), // MULTI_ACCOUNT, VPN, COPY_TRADING, HFT, REFERRAL, PAYOUT, TRADING_RISK, KYC_MISMATCH, DEVICE_CHANGE, IP_CHANGE
    severity: text("severity").notNull().default("MEDIUM"), // LOW, MEDIUM, HIGH, CRITICAL
    riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(),
    status: text("status").notNull().default("OPEN"), // OPEN, REVIEWING, RESOLVED, BLOCKED
    details: json("details"), // Additional context as JSON
    ipAddress: text("ip_address"),
    deviceFingerprint: text("device_fingerprint"),
    country: text("country"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    resolvedBy: text("resolved_by"), // Admin ID who resolved it
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    notes: text("notes"),
  },
  (table) => ({
    userIdIdx: index("fraud_events_user_id_idx").on(table.userId),
    ipAddressIdx: index("fraud_events_ip_address_idx").on(table.ipAddress),
    fraudTypeIdx: index("fraud_events_fraud_type_idx").on(table.fraudType),
    statusIdx: index("fraud_events_status_idx").on(table.status),
    createdAtIdx: index("fraud_events_created_at_idx").on(table.createdAt),
  }),
);

export const insertFraudEventSchema = createInsertSchema(fraudEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedBy: true,
  resolvedAt: true,
});

export type FraudEvent = typeof fraudEvents.$inferSelect;
export type InsertFraudEvent = z.infer<typeof insertFraudEventSchema>;
