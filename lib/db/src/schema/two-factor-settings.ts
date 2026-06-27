import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
  integer,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const twoFactorSettings = pgTable(
  "two_factor_settings",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .unique()
      .references(() => users.id, { onDelete: "cascade" }),
    enabled: boolean("enabled").default(false).notNull(),
    method: text("method"), // totp, sms, email
    totpSecret: text("totp_secret"), // TOTP secret for authenticator apps
    backupCodes: jsonb("backup_codes"), // Backup codes for account recovery
    phoneNumber: text("phone_number"),
    isPhoneVerified: boolean("is_phone_verified").default(false).notNull(),
    isMandatory: boolean("is_mandatory").default(false).notNull(), // For admins
    forceEnableAt: timestamp("force_enable_at", { withTimezone: true }),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    enabledAt: timestamp("enabled_at", { withTimezone: true }),
    trustedDevices: jsonb("trusted_devices"), // Array of trusted device tokens
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("two_factor_settings_user_id_idx").on(table.userId),
    enabledIdx: index("two_factor_settings_enabled_idx").on(table.enabled),
  }),
);

export const insertTwoFactorSettingsSchema = createInsertSchema(
  twoFactorSettings,
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastVerifiedAt: true,
});

export type TwoFactorSettings = typeof twoFactorSettings.$inferSelect;
export type InsertTwoFactorSettings = z.infer<
  typeof insertTwoFactorSettingsSchema
>;

// OTP codes for time-limited verification
export const otpCodes = pgTable(
  "otp_codes",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    email: text("email"),
    phoneNumber: text("phone_number"),
    code: text("code").notNull(),
    purpose: text("purpose").notNull(), // login, password_reset, phone_verification, etc.
    isUsed: boolean("is_used").default(false).notNull(),
    attempts: integer("attempts").default(0).notNull(),
    maxAttempts: integer("max_attempts").default(3).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("otp_codes_user_id_idx").on(table.userId),
    emailIdx: index("otp_codes_email_idx").on(table.email),
    codeIdx: index("otp_codes_code_idx").on(table.code),
    expiresAtIdx: index("otp_codes_expires_at_idx").on(table.expiresAt),
  }),
);

export const insertOtpCodeSchema = createInsertSchema(otpCodes).omit({
  id: true,
  createdAt: true,
  usedAt: true,
});

export type OtpCode = typeof otpCodes.$inferSelect;
export type InsertOtpCode = z.infer<typeof insertOtpCodeSchema>;
