import {
  pgTable,
  serial,
  text,
  timestamp,
  json,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const alertRules = pgTable(
  "alert_rules",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    eventType: text("event_type").notNull().default("SYSTEM_ERROR"),
    condition: json("condition").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    severity: text("severity").notNull().default("HIGH"),
    notifyEmails: json("notify_emails"),
    notifyClerkIds: json("notify_clerk_ids"),
    notifyDiscordWebhooks: json("notify_discord_webhooks"),
    notifyWhatsAppNumbers: json("notify_whatsapp_numbers"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    eventTypeIdx: index("alert_rules_event_type_idx").on(table.eventType),
    enabledIdx: index("alert_rules_enabled_idx").on(table.enabled),
    createdAtIdx: index("alert_rules_created_at_idx").on(table.createdAt),
  }),
);

export const insertAlertRuleSchema = createInsertSchema(alertRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type AlertRule = typeof alertRules.$inferSelect;
export type InsertAlertRule = z.infer<typeof insertAlertRuleSchema>;
