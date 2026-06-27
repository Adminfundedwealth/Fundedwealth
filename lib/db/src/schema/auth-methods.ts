import {
  pgTable,
  serial,
  uuid,
  text,
  timestamp,
  boolean,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const authMethods = pgTable(
  "auth_methods",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    method: text("method").notNull(), // EMAIL_PASSWORD, OAUTH_GOOGLE, OAUTH_GITHUB, OTP, MAGIC_LINK
    provider: text("provider"), // For OAuth: google, github, etc.
    identifier: text("identifier").notNull(), // Email, OAuth ID, phone number, etc.
    isVerified: boolean("is_verified").default(false).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    password: text("password"), // Hashed password for EMAIL_PASSWORD
    metadata: jsonb("metadata"), // OAuth tokens, etc.
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("auth_methods_user_id_idx").on(table.userId),
    methodIdx: index("auth_methods_method_idx").on(table.method),
    identifierIdx: index("auth_methods_identifier_idx").on(table.identifier),
    isPrimaryIdx: index("auth_methods_is_primary_idx").on(table.isPrimary),
  }),
);

export const insertAuthMethodSchema = createInsertSchema(authMethods).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verifiedAt: true,
  lastUsedAt: true,
});

export type AuthMethod = typeof authMethods.$inferSelect;
export type InsertAuthMethod = z.infer<typeof insertAuthMethodSchema>;
