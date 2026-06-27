import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const deviceHistory = pgTable(
  "device_history",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceFingerprint: text("device_fingerprint").notNull(),
    browser: text("browser"),
    os: text("os"),
    screenSize: text("screen_size"),
    timezone: text("timezone"),
    language: text("language"),
    ip: text("ip"),
    country: text("country"),
    lastSeen: timestamp("last_seen", { withTimezone: true })
      .defaultNow()
      .notNull(),
    seenCount: integer("seen_count").default(1).notNull(),
  },
  (table) => ({
    userIdIdx: index("device_history_user_id_idx").on(table.userId),
    deviceFingerprintIdx: index("device_history_fingerprint_idx").on(
      table.deviceFingerprint
    ),
    lastSeenIdx: index("device_history_last_seen_idx").on(table.lastSeen),
  }),
);

export const insertDeviceHistorySchema = createInsertSchema(deviceHistory).omit({
  id: true,
  lastSeen: true,
});

export type DeviceHistory = typeof deviceHistory.$inferSelect;
export type InsertDeviceHistory = z.infer<typeof insertDeviceHistorySchema>;
