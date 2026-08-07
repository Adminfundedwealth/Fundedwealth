import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

/**
 * discount_config — per-plan discount code configuration.
 * Founders update this via Admin → Founder → Discount Config.
 * The API serves it publicly so the main website can display live codes.
 */
export const discountConfig = pgTable("discount_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** plan key: "flash" | "instant" | "1step" | "2step" */
  planType: text("plan_type").notNull().unique(),
  /** The coupon code displayed on the site and entered at checkout */
  code: text("code").notNull(),
  /** Discount percentage (e.g. 60 = 60% OFF) */
  discountPct: integer("discount_pct").notNull(),
  /** Whether this plan's code is actively shown on the site */
  active: boolean("active").default(true).notNull(),
  updatedBy: text("updated_by"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type DiscountConfig = typeof discountConfig.$inferSelect;
export type InsertDiscountConfig = typeof discountConfig.$inferInsert;
