import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const loginHistory = pgTable(
  "login_history",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    authMethod: text("auth_method").notNull(), // EMAIL_PASSWORD, OAUTH, OTP, MAGIC_LINK
    ipAddress: text("ip_address").notNull(),
    country: text("country"),
    deviceFingerprint: text("device_fingerprint"),
    userAgent: text("user_agent"),
    browser: text("browser"),
    os: text("os"),
    success: boolean("success").notNull(),
    failureReason: text("failure_reason"), // wrong_password, user_not_found, account_locked, etc.
    mfaRequired: boolean("mfa_required").default(false).notNull(),
    mfaVerified: boolean("mfa_verified").default(false).notNull(),
    sessionId: integer("session_id").references(() => sessions.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("login_history_user_id_idx").on(table.userId),
    emailIdx: index("login_history_email_idx").on(table.email),
    ipAddressIdx: index("login_history_ip_address_idx").on(table.ipAddress),
    successIdx: index("login_history_success_idx").on(table.success),
    createdAtIdx: index("login_history_created_at_idx").on(table.createdAt),
  }),
);

export const insertLoginHistorySchema = createInsertSchema(loginHistory).omit({
  id: true,
  createdAt: true,
});

export type LoginHistory = typeof loginHistory.$inferSelect;
export type InsertLoginHistory = z.infer<typeof insertLoginHistorySchema>;

import { sessions } from "./sessions";
