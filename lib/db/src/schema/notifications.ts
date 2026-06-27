import { pgTable, serial, text, timestamp, boolean, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  actionUrl: text("action_url"),
  icon: text("icon"),
  category: text("category").default("system").notNull(),
  metadata: text("metadata").default("{}").notNull(),
  priority: text("priority").default("medium").notNull(),
  deliveryChannels: text("delivery_channels").default("in_app").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
