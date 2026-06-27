import { pgTable, serial, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  authorId: uuid("author_id").notNull(), // references users.id
  authorClerkId: text("author_clerk_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  authorRole: text("author_role").default("user").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  category: text("category").default("general").notNull(), // general | trades | education | help | milestone
  likesCount: integer("likes_count").default(0).notNull(),
  commentsCount: integer("comments_count").default(0).notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertCommunityPostSchema = createInsertSchema(communityPosts).omit({
  id: true,
  likesCount: true,
  commentsCount: true,
  isPinned: true,
  isHidden: true,
  createdAt: true,
  updatedAt: true,
});

export type CommunityPost = typeof communityPosts.$inferSelect;
export type InsertCommunityPost = z.infer<typeof insertCommunityPostSchema>;
