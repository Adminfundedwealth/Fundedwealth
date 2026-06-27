import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const failedAttempts = pgTable(
  "failed_attempts",
  {
    id: serial("id").primaryKey(),
    email: text("email"),
    ipAddress: text("ip_address").notNull(),
    attemptType: text("attempt_type").notNull(), // login, password_reset, otp, 2fa
    count: integer("count").default(1).notNull(),
    lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    reason: text("reason"), // too_many_attempts, account_locked, etc.
    userAgent: text("user_agent"),
    country: text("country"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    emailIdx: index("failed_attempts_email_idx").on(table.email),
    ipAddressIdx: index("failed_attempts_ip_address_idx").on(table.ipAddress),
    attemptTypeIdx: index("failed_attempts_attempt_type_idx").on(
      table.attemptType,
    ),
    lockedUntilIdx: index("failed_attempts_locked_until_idx").on(
      table.lockedUntil,
    ),
  }),
);

export const insertFailedAttemptsSchema = createInsertSchema(failedAttempts).omit({
  id: true,
  createdAt: true,
  lastAttemptAt: true,
});

export type FailedAttempt = typeof failedAttempts.$inferSelect;
export type InsertFailedAttempt = z.infer<typeof insertFailedAttemptsSchema>;
