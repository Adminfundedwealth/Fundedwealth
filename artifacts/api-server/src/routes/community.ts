import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import multer from "multer";
import { createHash } from "crypto";
import rateLimit from "express-rate-limit";
import { db } from "@workspace/db";
import {
  users,
  communityPosts,
  communityComments,
  communityLikes,
} from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { supabaseAdmin } from "../lib/supabase";

const router = Router();

const ADMIN_ROLES = ["super_admin", "admin", "support"];
const MAX_CONTENT_LENGTH = 2000;
const MAX_COMMENT_LENGTH = 500;
const POSTS_PER_PAGE = 20;

// ─── Rate limiters ────────────────────────────────────────────────────────────

function getIpKey(req: any): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
}

// Max 10 posts per user per 15 minutes
const postLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  keyGenerator: (req) => getAuth(req)?.userId ?? getIpKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many posts. Please wait before posting again." },
});

// Max 30 comments per user per 15 minutes
const commentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  keyGenerator: (req) => getAuth(req)?.userId ?? getIpKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many comments. Please wait before commenting again." },
});

// Max 60 likes per user per 15 minutes
const likeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  keyGenerator: (req) => getAuth(req)?.userId ?? getIpKey(req),
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests." },
});

// ─── Image upload (multer → Supabase Storage) ─────────────────────────────────

const ALLOWED_MIME = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const UPLOAD_BUCKET = "community-images";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req: any, file: { mimetype: string }, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    if (ALLOWED_MIME.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only JPEG, PNG, WebP, or GIF images are allowed"));
    }
  },
});

async function uploadToSupabase(buffer: Buffer, mimeType: string): Promise<string> {
  if (!supabaseAdmin) throw new Error("Supabase admin client not configured");

  const ext = mimeType.split("/")[1].replace("jpeg", "jpg");
  const hash = createHash("sha256").update(buffer).digest("hex").slice(0, 16);
  const filename = `posts/${Date.now()}_${hash}.${ext}`;

  const { error } = await supabaseAdmin.storage
    .from(UPLOAD_BUCKET)
    .upload(filename, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabaseAdmin.storage.from(UPLOAD_BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

// ─── Auth helper ────────────────────────────────────────────────────────────

async function getAuthedUser(req: any, res: any) {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return null;
  }
  return user;
}

// ─── POST /api/community/upload-image ────────────────────────────────────────
// Auth required — upload an image, returns { url }

router.post("/upload-image", postLimiter, upload.single("image"), async (req, res) => {
  try {
    const user = await getAuthedUser(req, res);
    if (!user) return;

    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    const url = await uploadToSupabase(req.file.buffer, req.file.mimetype);
    res.json({ url });
  } catch (err: any) {
    if (err.message?.includes("Only JPEG")) {
      return res.status(400).json({ error: err.message });
    }
    console.error("[community] POST /upload-image error:", err);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// ─── GET /api/community/posts ─────────────────────────────────────────────────
// Public — lists posts, newest first. Supports ?category=&page=

router.get("/posts", async (req, res) => {
  try {
    const { category, page = "1" } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const offset = (pageNum - 1) * POSTS_PER_PAGE;

    const conditions = [eq(communityPosts.isHidden, false)];
    if (category && category !== "all") {
      conditions.push(eq(communityPosts.category, category as string));
    }

    const posts = await db
      .select()
      .from(communityPosts)
      .where(and(...conditions))
      .orderBy(desc(communityPosts.isPinned), desc(communityPosts.createdAt))
      .limit(POSTS_PER_PAGE)
      .offset(offset);

    // Attach current user's like status if authenticated
    const auth = getAuth(req);
    let likedPostIds: Set<number> = new Set();
    if (auth?.userId) {
      const likes = await db
        .select({ postId: communityLikes.postId })
        .from(communityLikes)
        .where(eq(communityLikes.authorClerkId, auth.userId));
      likedPostIds = new Set(likes.map((l) => l.postId));
    }

    const enriched = posts.map((p) => ({ ...p, likedByMe: likedPostIds.has(p.id) }));

    res.json({ posts: enriched, page: pageNum, hasMore: posts.length === POSTS_PER_PAGE });
  } catch (err) {
    console.error("[community] GET /posts error:", err);
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// ─── POST /api/community/posts ────────────────────────────────────────────────
// Auth required — create a post

router.post("/posts", postLimiter, async (req, res) => {
  try {
    const user = await getAuthedUser(req, res);
    if (!user) return;

    const { content, category = "general", imageUrl } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return res.status(400).json({ error: `Content must be ${MAX_CONTENT_LENGTH} characters or less` });
    }
    const VALID_CATEGORIES = ["general", "trades", "education", "help", "milestone"];
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ error: "Invalid category" });
    }

    // Validate imageUrl if provided — must be a Supabase storage URL
    let safeImageUrl: string | null = null;
    if (imageUrl && typeof imageUrl === "string") {
      const supabaseHost = process.env.SUPABASE_URL?.replace("https://", "") ?? "";
      if (supabaseHost && imageUrl.includes(supabaseHost)) {
        safeImageUrl = imageUrl;
      }
      // Silently drop external URLs — prevents hotlinking abuse
    }

    const [post] = await db
      .insert(communityPosts)
      .values({
        authorId: user.id,
        authorClerkId: user.clerkId,
        authorName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        authorAvatar: user.avatarUrl ?? null,
        authorRole: user.role,
        content: content.trim(),
        imageUrl: safeImageUrl,
        category,
      })
      .returning();

    res.status(201).json(post);
  } catch (err) {
    console.error("[community] POST /posts error:", err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ─── DELETE /api/community/posts/:id ──────────────────────────────────────────
// Auth required — only post author or admin can delete

router.delete("/posts/:id", async (req, res) => {
  try {
    const user = await getAuthedUser(req, res);
    if (!user) return;

    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) return res.status(400).json({ error: "Invalid post id" });

    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, postId));
    if (!post) return res.status(404).json({ error: "Post not found" });

    const isAdmin = ADMIN_ROLES.includes(user.role);
    if (post.authorClerkId !== user.clerkId && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.update(communityPosts).set({ isHidden: true }).where(eq(communityPosts.id, postId));

    res.json({ success: true });
  } catch (err) {
    console.error("[community] DELETE /posts/:id error:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// ─── GET /api/community/posts/:id/comments ────────────────────────────────────
// Public

router.get("/posts/:id/comments", async (req, res) => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) return res.status(400).json({ error: "Invalid post id" });

    const comments = await db
      .select()
      .from(communityComments)
      .where(and(eq(communityComments.postId, postId), eq(communityComments.isHidden, false)))
      .orderBy(desc(communityComments.createdAt));

    res.json(comments);
  } catch (err) {
    console.error("[community] GET /posts/:id/comments error:", err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// ─── POST /api/community/posts/:id/comments ───────────────────────────────────
// Auth required

router.post("/posts/:id/comments", commentLimiter, async (req, res) => {
  try {
    const user = await getAuthedUser(req, res);
    if (!user) return;

    const postId = parseInt(req.params.id as string, 10);
    if (isNaN(postId)) return res.status(400).json({ error: "Invalid post id" });

    const [post] = await db
      .select()
      .from(communityPosts)
      .where(and(eq(communityPosts.id, postId), eq(communityPosts.isHidden, false)));
    if (!post) return res.status(404).json({ error: "Post not found" });

    const { content } = req.body;
    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return res.status(400).json({ error: "Content is required" });
    }
    if (content.length > MAX_COMMENT_LENGTH) {
      return res.status(400).json({ error: `Comment must be ${MAX_COMMENT_LENGTH} characters or less` });
    }

    const [comment] = await db
      .insert(communityComments)
      .values({
        postId,
        authorId: user.id,
        authorClerkId: user.clerkId,
        authorName: [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
        authorAvatar: user.avatarUrl ?? null,
        authorRole: user.role,
        content: content.trim(),
      })
      .returning();

    await db
      .update(communityPosts)
      .set({ commentsCount: sql`${communityPosts.commentsCount} + 1` })
      .where(eq(communityPosts.id, postId));

    res.status(201).json(comment);
  } catch (err) {
    console.error("[community] POST /posts/:id/comments error:", err);
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ─── DELETE /api/community/comments/:id ───────────────────────────────────────
// Auth required — author or admin

router.delete("/comments/:id", async (req, res) => {
  try {
    const user = await getAuthedUser(req, res);
    if (!user) return;

    const commentId = parseInt(req.params.id, 10);
    if (isNaN(commentId)) return res.status(400).json({ error: "Invalid comment id" });

    const [comment] = await db.select().from(communityComments).where(eq(communityComments.id, commentId));
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const isAdmin = ADMIN_ROLES.includes(user.role);
    if (comment.authorClerkId !== user.clerkId && !isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await db.update(communityComments).set({ isHidden: true }).where(eq(communityComments.id, commentId));

    await db
      .update(communityPosts)
      .set({ commentsCount: sql`GREATEST(${communityPosts.commentsCount} - 1, 0)` })
      .where(eq(communityPosts.id, comment.postId));

    res.json({ success: true });
  } catch (err) {
    console.error("[community] DELETE /comments/:id error:", err);
    res.status(500).json({ error: "Failed to delete comment" });
  }
});

// ─── POST /api/community/posts/:id/like ───────────────────────────────────────
// Auth required — toggle like

router.post("/posts/:id/like", likeLimiter, async (req, res) => {
  try {
    const user = await getAuthedUser(req, res);
    if (!user) return;

    const postId = parseInt(req.params.id as string, 10);
    if (isNaN(postId)) return res.status(400).json({ error: "Invalid post id" });

    const [post] = await db
      .select()
      .from(communityPosts)
      .where(and(eq(communityPosts.id, postId), eq(communityPosts.isHidden, false)));
    if (!post) return res.status(404).json({ error: "Post not found" });

    const [existing] = await db
      .select()
      .from(communityLikes)
      .where(and(eq(communityLikes.postId, postId), eq(communityLikes.authorClerkId, user.clerkId)));

    if (existing) {
      await db
        .delete(communityLikes)
        .where(and(eq(communityLikes.postId, postId), eq(communityLikes.authorClerkId, user.clerkId)));
      await db
        .update(communityPosts)
        .set({ likesCount: sql`GREATEST(${communityPosts.likesCount} - 1, 0)` })
        .where(eq(communityPosts.id, postId));
      return res.json({ liked: false });
    }

    await db.insert(communityLikes).values({
      postId,
      authorClerkId: user.clerkId,
      authorId: user.id,
    });
    await db
      .update(communityPosts)
      .set({ likesCount: sql`${communityPosts.likesCount} + 1` })
      .where(eq(communityPosts.id, postId));

    res.json({ liked: true });
  } catch (err: any) {
    if (err?.code === "23505") return res.json({ liked: true });
    console.error("[community] POST /posts/:id/like error:", err);
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// ─── PATCH /api/community/posts/:id/pin ───────────────────────────────────────
// Admin only

router.patch("/posts/:id/pin", async (req, res) => {
  try {
    const user = await getAuthedUser(req, res);
    if (!user) return;

    if (!ADMIN_ROLES.includes(user.role)) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) return res.status(400).json({ error: "Invalid post id" });

    const [post] = await db.select().from(communityPosts).where(eq(communityPosts.id, postId));
    if (!post) return res.status(404).json({ error: "Post not found" });

    const [updated] = await db
      .update(communityPosts)
      .set({ isPinned: !post.isPinned })
      .where(eq(communityPosts.id, postId))
      .returning();

    res.json(updated);
  } catch (err) {
    console.error("[community] PATCH /posts/:id/pin error:", err);
    res.status(500).json({ error: "Failed to pin post" });
  }
});

export default router;
