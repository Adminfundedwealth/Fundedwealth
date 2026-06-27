import { Router } from "express";
import { db } from "@workspace/db";
import { blogPosts } from "@workspace/db";
import { eq, desc, ilike, and, sql } from "drizzle-orm";

const router = Router();

router.get("/", async (req, res) => {
  const { category, search } = req.query;

  const conditions = [eq(blogPosts.isPublished, true)];

  if (category && category !== "All") {
    conditions.push(eq(blogPosts.category, category as string));
  }

  if (search) {
    conditions.push(ilike(blogPosts.title, `%${search}%`));
  }

  const posts = await db
    .select()
    .from(blogPosts)
    .where(and(...conditions))
    .orderBy(desc(blogPosts.publishedAt));

  res.json(posts);
});

router.get("/:slug", async (req, res) => {
  const [post] = await db
    .select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, req.params.slug), eq(blogPosts.isPublished, true)));

  if (!post) return res.status(404).json({ error: "Post not found" });

  await db
    .update(blogPosts)
    .set({ views: sql`${blogPosts.views} + 1` })
    .where(eq(blogPosts.id, post.id));

  res.json(post);
});

export default router;
