import {
    pgTable,
    serial,
    integer,
    text,
    timestamp,
    index,
    boolean,
    jsonb,
    real,
    uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

/**
 * Full IPQS lookup results storage.
 * Stores the complete API response for audit trail and admin review.
 * ip_history stores the lightweight detection flags; this stores the full payload.
 */
export const ipLookups = pgTable(
    "ip_lookups",
    {
        id: serial("id").primaryKey(),
        userId: uuid("user_id")
            .references(() => users.id, { onDelete: "set null" }),
        ip: text("ip").notNull(),
        trigger: text("trigger").notNull(), // signup, login, challenge_purchase, payout_request
        // Detection results
        vpnDetected: boolean("vpn_detected").default(false).notNull(),
        proxyDetected: boolean("proxy_detected").default(false).notNull(),
        torDetected: boolean("tor_detected").default(false).notNull(),
        datacenterDetected: boolean("datacenter_detected").default(false).notNull(),
        fraudScore: real("fraud_score").default(0).notNull(),
        // Geo info
        country: text("country"),
        region: text("region"),
        city: text("city"),
        isp: text("isp"),
        asn: integer("asn"),
        organization: text("organization"),
        connectionType: text("connection_type"),
        // Abuse info
        abuseVelocity: text("abuse_velocity"),
        recentAbuse: boolean("recent_abuse").default(false).notNull(),
        isCrawler: boolean("is_crawler").default(false).notNull(),
        mobile: boolean("mobile").default(false).notNull(),
        // Lookup metadata
        lookupSuccess: boolean("lookup_success").default(true).notNull(),
        lookupSource: text("lookup_source").notNull(), // api, cache_memory, cache_db, unavailable
        errorMessage: text("error_message"),
        // Full raw response for audit
        rawResponse: jsonb("raw_response"),
        // Risk score contribution
        vpnProxyRiskScore: real("vpn_proxy_risk_score").default(0).notNull(),
        // Timestamps
        createdAt: timestamp("created_at", { withTimezone: true })
            .defaultNow()
            .notNull(),
    },
    (table) => ({
        userIdIdx: index("ip_lookups_user_id_idx").on(table.userId),
        ipIdx: index("ip_lookups_ip_idx").on(table.ip),
        triggerIdx: index("ip_lookups_trigger_idx").on(table.trigger),
        fraudScoreIdx: index("ip_lookups_fraud_score_idx").on(table.fraudScore),
        vpnDetectedIdx: index("ip_lookups_vpn_detected_idx").on(table.vpnDetected),
        createdAtIdx: index("ip_lookups_created_at_idx").on(table.createdAt),
    })
);

export const insertIpLookupSchema = createInsertSchema(ipLookups).omit({
    id: true,
    createdAt: true,
});

export type IpLookup = typeof ipLookups.$inferSelect;
export type InsertIpLookup = z.infer<typeof insertIpLookupSchema>;
