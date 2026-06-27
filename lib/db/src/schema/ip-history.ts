import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  index,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const ipHistory = pgTable(
  "ip_history",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ip: text("ip").notNull(),
    country: text("country"),
    vpnDetected: boolean("vpn_detected").default(false).notNull(),
    proxyDetected: boolean("proxy_detected").default(false).notNull(),
    torDetected: boolean("tor_detected").default(false).notNull(),
    datacenterDetected: boolean("datacenter_detected").default(false).notNull(),
    isp: text("isp"),
    organization: text("organization"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastSeen: timestamp("last_seen", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdIdx: index("ip_history_user_id_idx").on(table.userId),
    ipIdx: index("ip_history_ip_idx").on(table.ip),
    vpnDetectedIdx: index("ip_history_vpn_detected_idx").on(table.vpnDetected),
    createdAtIdx: index("ip_history_created_at_idx").on(table.createdAt),
  }),
);

export const insertIpHistorySchema = createInsertSchema(ipHistory).omit({
  id: true,
  createdAt: true,
  lastSeen: true,
});

export type IpHistory = typeof ipHistory.$inferSelect;
export type InsertIpHistory = z.infer<typeof insertIpHistorySchema>;
