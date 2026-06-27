import { pgTable, uuid, varchar, text, json, integer, timestamp, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

/**
 * behavior_patterns
 * Detected behavior patterns like REVENGE_TRADING, MARTINGALE, FOMO, OVERTRADING
 */
export const behaviorPatterns = pgTable("behavior_patterns", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: varchar("user_id").notNull(),
  patternType: text("pattern_type").notNull(),
  patternDetails: json("pattern_details"),
  confidence: integer("confidence").default(0).notNull(),
  occurrences: integer("occurrences").default(1).notNull(),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).defaultNow().notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdIdx: index("behavior_patterns_user_id_idx").on(t.userId),
  patternTypeIdx: index("behavior_patterns_pattern_type_idx").on(t.patternType),
}));

export const insertBehaviorPatternSchema = createInsertSchema(behaviorPatterns).omit({ id: true, createdAt: true, updatedAt: true });
export type BehaviorPattern = typeof behaviorPatterns.$inferSelect;
export type InsertBehaviorPattern = z.infer<typeof insertBehaviorPatternSchema>;
