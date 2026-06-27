import { pgTable, serial, text, timestamp, integer, boolean, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const communityComments = pgTable("community_comments", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull(), // references community_posts.id
  authorId: uuid("author_id").notNull(), // references users.id
  authorClerkId: text("author_clerk_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  authorRole: text("author_role").default("user").notNull(),
  content: text("content").notNull(),
  isHidden: boolean("is_hidden").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertCommunityCommentSchema = createInsertSchema(communityComments).omit({
  id: true,
  isHidden: true,
  createdAt: true,
  updatedAt: true,
});

export type CommunityComment = typeof communityComments.$inferSelect;
export type InsertCommunityComment = z.infer<typeof insertCommunityCommentSchema>;
