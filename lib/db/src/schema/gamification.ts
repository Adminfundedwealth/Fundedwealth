import { pgTable, serial, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  color: text("color").default("#8E2DE2").notNull(),
  points: integer("points").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  badgeId: integer("badge_id").notNull().references(() => badges.id, { onDelete: "cascade" }),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).defaultNow().notNull(),
  metadata: text("metadata").default("{}").notNull(),
});

export const achievementDefinitions = pgTable("achievement_definitions", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  points: integer("points").default(0).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  achievementId: integer("achievement_id").notNull().references(() => achievementDefinitions.id, { onDelete: "cascade" }),
  progress: integer("progress").default(100).notNull(),
  earnedAt: timestamp("earned_at", { withTimezone: true }).defaultNow().notNull(),
  metadata: text("metadata").default("{}").notNull(),
});

export const certificates = pgTable("certificates", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  certId: text("cert_id").notNull().unique(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  challengeType: text("challenge_type"),
  accountSize: text("account_size"),
  issuedAt: timestamp("issued_at", { withTimezone: true }).defaultNow().notNull(),
  status: text("status").default("active").notNull(),
  metadata: text("metadata").default("{}").notNull(),
});

export const streaks = pgTable("streaks", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  loginStreakDays: integer("login_streak_days").default(0).notNull(),
  tradingStreakDays: integer("trading_streak_days").default(0).notNull(),
  winStreakDays: integer("win_streak_days").default(0).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertBadgeSchema = createInsertSchema(badges).omit({ id: true, createdAt: true });
export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ id: true, awardedAt: true });
export const insertAchievementDefinitionSchema = createInsertSchema(achievementDefinitions).omit({ id: true, createdAt: true });
export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({ id: true, earnedAt: true });
export const insertCertificateSchema = createInsertSchema(certificates).omit({ id: true, issuedAt: true });
export const insertStreakSchema = createInsertSchema(streaks).omit({ id: true, updatedAt: true });

export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type AchievementDefinition = typeof achievementDefinitions.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
export type Streak = typeof streaks.$inferSelect;
