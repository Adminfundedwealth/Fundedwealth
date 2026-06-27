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

export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull(),
    sessionToken: text("session_token").notNull().unique(),
    deviceFingerprint: text("device_fingerprint"),
    ipAddress: text("ip_address").notNull(),
    userAgent: text("user_agent"),
    country: text("country"),
    browser: text("browser"),
    os: text("os"),
    deviceName: text("device_name"),
    isActive: boolean("is_active").default(true).notNull(),
    isTrusted: boolean("is_trusted").default(false).notNull(),
    requiresMfa: boolean("requires_mfa").default(false).notNull(),
    mfaVerified: boolean("mfa_verified").default(false).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastActivityAt: timestamp("last_activity_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
  },
  (table) => ({
    userIdIdx: index("sessions_user_id_idx").on(table.userId),
    sessionTokenIdx: index("sessions_token_idx").on(table.sessionToken),
    isActiveIdx: index("sessions_is_active_idx").on(table.isActive),
    expiresAtIdx: index("sessions_expires_at_idx").on(table.expiresAt),
  }),
);

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  lastActivityAt: true,
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
