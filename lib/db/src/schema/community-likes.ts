import { pgTable, serial, text, timestamp, integer, uuid, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const communityLikes = pgTable(
  "community_likes",
  {
    id: serial("id").primaryKey(),
    postId: integer("post_id").notNull(), // references community_posts.id
    authorClerkId: text("author_clerk_id").notNull(),
    authorId: uuid("author_id").notNull(), // references users.id
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    // One like per user per post
    uniqueLike: unique("unique_like").on(t.postId, t.authorClerkId),
  })
);

export const insertCommunityLikeSchema = createInsertSchema(communityLikes).omit({
  id: true,
  createdAt: true,
});

export type CommunityLike = typeof communityLikes.$inferSelect;
export type InsertCommunityLike = z.infer<typeof insertCommunityLikeSchema>;
