import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const rateLimitViolations = pgTable(
  "rate_limit_violations",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    endpoint: text("endpoint").notNull(),
    ipAddress: text("ip_address").notNull(),
    method: text("method").notNull(), // GET, POST, PATCH, DELETE
    requestCount: integer("request_count").notNull(),
    limitPerWindow: integer("limit_per_window").notNull(),
    windowMs: integer("window_ms").notNull(),
    actionTaken: text("action_taken"), // blocked, logged, rate_limited, etc.
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("rate_limit_violations_user_id_idx").on(table.userId),
    ipAddressIdx: index("rate_limit_violations_ip_address_idx").on(
      table.ipAddress,
    ),
    endpointIdx: index("rate_limit_violations_endpoint_idx").on(table.endpoint),
    createdAtIdx: index("rate_limit_violations_created_at_idx").on(
      table.createdAt,
    ),
  }),
);

export const insertRateLimitViolationSchema = createInsertSchema(
  rateLimitViolations,
).omit({
  id: true,
  createdAt: true,
});

export type RateLimitViolation = typeof rateLimitViolations.$inferSelect;
export type InsertRateLimitViolation = z.infer<
  typeof insertRateLimitViolationSchema
>;
