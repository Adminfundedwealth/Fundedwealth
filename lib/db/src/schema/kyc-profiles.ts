import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const kycProfiles = pgTable("kyc_profiles", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  // Personal Information
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(), // YYYY-MM-DD
  country: text("country").notNull(),
  countryCode: text("country_code"), // ISO 3166-1 alpha-2
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  addressCity: text("address_city"),
  addressState: text("address_state"),
  addressPostalCode: text("address_postal_code"),

  // KYC Status & Verification
  status: text("status")
    .default("NOT_STARTED")
    .notNull(), // NOT_STARTED | PENDING | UNDER_REVIEW | APPROVED | REJECTED | RESUBMISSION_REQUIRED | ADDITIONAL_DOCS_REQUIRED
  verificationLevel: integer("verification_level").default(0).notNull(), // 0-4

  // Risk Assessment
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).default("0").notNull(), // 0-100
  riskLevel: text("risk_level").default("LOW").notNull(), // LOW, MEDIUM, HIGH
  riskFlags: text("risk_flags").default("[]").notNull(), // JSON array of flag strings

  // Timeline
  submittedAt: timestamp("submitted_at", { withTimezone: true }),
  approvedAt: timestamp("approved_at", { withTimezone: true }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }), // For document expiry

  // Admin Review
  reviewedBy: uuid("reviewed_by").references(() => users.id, { onDelete: "set null" }),
  reviewNotes: text("review_notes"),       // general notes / additional-docs instructions
  rejectionReason: text("rejection_reason"),
  resubmissionCount: integer("resubmission_count").default(0).notNull(),

  // Metadata
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isActive: boolean("is_active").default(true).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertKycProfileSchema = createInsertSchema(kycProfiles).omit({
  id: true,
  status: true,
  verificationLevel: true,
  riskScore: true,
  riskLevel: true,
  riskFlags: true,
  submittedAt: true,
  approvedAt: true,
  rejectedAt: true,
  expiresAt: true,
  reviewedBy: true,
  reviewNotes: true,
  rejectionReason: true,
  resubmissionCount: true,
  createdAt: true,
  updatedAt: true,
});

export type KycProfile = typeof kycProfiles.$inferSelect;
export type InsertKycProfile = z.infer<typeof insertKycProfileSchema>;
