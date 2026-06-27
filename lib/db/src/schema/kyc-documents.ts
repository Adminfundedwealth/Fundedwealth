import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";
import { kycProfiles } from "./kyc-profiles";

export const kycDocuments = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  kycProfileId: integer("kyc_profile_id")
    .notNull()
    .references(() => kycProfiles.id, { onDelete: "cascade" }),

  // Document Details
  documentType: text("document_type").notNull(), // PASSPORT, PAN, AADHAR, DRIVING_LICENSE, NATIONAL_ID, BANK_STATEMENT, UTILITY_BILL, SELFIE
  documentNumber: text("document_number"),
  documentFrontUrl: text("document_front_url"),
  documentBackUrl: text("document_back_url"),

  // File Metadata
  mimeType: text("mime_type"),
  fileSize: integer("file_size"), // in bytes
  fileResolution: text("file_resolution"), // for images

  // Document hash for deduplication (SHA-256)
  documentHash: text("document_hash"),

  // Verification Status
  verificationStatus: text("verification_status")
    .default("PENDING")
    .notNull(), // PENDING, VERIFIED, REJECTED
  verificationNotes: text("verification_notes"),

  // Document Validity
  expiryDate: timestamp("expiry_date", { withTimezone: true }),
  isExpired: boolean("is_expired").default(false).notNull(),

  // Quality Checks
  isBlurred: boolean("is_blurred").default(false).notNull(),
  isLegible: boolean("is_legible").default(true).notNull(),
  qualityScore: integer("quality_score"), // 0-100

  // Face Recognition (for selfies)
  faceDetected: boolean("face_detected").default(false),
  faceMatch: boolean("face_match").default(false), // Face matches other documents
  faceMatchScore: integer("face_match_score"), // 0-100

  // Metadata
  uploadedAt: timestamp("uploaded_at", { withTimezone: true }).defaultNow().notNull(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  rejectedAt: timestamp("rejected_at", { withTimezone: true }),

  // Version Control (for resubmissions)
  version: integer("version").default(1).notNull(),
  isLatestVersion: boolean("is_latest_version").default(true).notNull(),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertKycDocumentSchema = createInsertSchema(kycDocuments).omit({
  id: true,
  verificationStatus: true,
  verificationNotes: true,
  isExpired: true,
  isBlurred: true,
  isLegible: true,
  qualityScore: true,
  faceDetected: true,
  faceMatch: true,
  faceMatchScore: true,
  uploadedAt: true,
  verifiedAt: true,
  rejectedAt: true,
  version: true,
  isLatestVersion: true,
  createdAt: true,
  updatedAt: true,
});

export type KycDocument = typeof kycDocuments.$inferSelect;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
