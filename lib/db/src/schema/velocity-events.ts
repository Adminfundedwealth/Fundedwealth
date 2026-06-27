import { pgTable, serial, integer, text, timestamp, index, jsonb, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const velocityEvents = pgTable(
    "velocity_events",
    {
        id: serial("id").primaryKey(),
        userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
        eventType: text("event_type").notNull(),
        ipAddress: text("ip_address"),
        deviceFingerprint: text("device_fingerprint"),
        metadata: jsonb("metadata").default({}),
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => ({
        userIdx: index("velocity_events_user_idx").on(table.userId),
        typeIdx: index("velocity_events_type_idx").on(table.eventType),
        ipIdx: index("velocity_events_ip_idx").on(table.ipAddress),
        fpIdx: index("velocity_events_fp_idx").on(table.deviceFingerprint),
        createdIdx: index("velocity_events_created_idx").on(table.createdAt),
    })
);

export type VelocityEvent = typeof velocityEvents.$inferSelect;
