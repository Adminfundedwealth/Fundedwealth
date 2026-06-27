import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const kycReviews = pgTable("kyc_reviews", {
  id: serial("id").primaryKey(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Action Details
  action: text("action").notNull(), // APPROVED, REJECTED, RESUBMISSION_REQUESTED, NOTES_ADDED
  reason: text("reason"), // Reason for action
  notes: text("notes"), // Additional review notes

  // Risk Assessment
  riskScore: integer("risk_score"), // 0-100
  riskLevel: text("risk_level"), // LOW, MEDIUM, HIGH
  riskFactors: text("risk_factors").default("[]").notNull(), // JSON array

  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertKycReviewSchema = createInsertSchema(kycReviews).omit({
  id: true,
  createdAt: true,
});

export type KycReview = typeof kycReviews.$inferSelect;
export type InsertKycReview = z.infer<typeof insertKycReviewSchema>;
