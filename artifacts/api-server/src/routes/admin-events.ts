/**
 * Admin Events API — consumed by Admin Panel (admin.fundedwealth.com)
 *
 * OWNERSHIP: Admin Panel reads these events to see pending actions.
 * Main Site writes events via AdminEventService (fire-and-forget).
 *
 * Routes:
 *   GET  /api/admin-events        — list unread/all events (paginated)
 *   PATCH /api/admin-events/:id   — acknowledge (mark as read)
 *   GET  /api/admin-events/stats  — counts by event type
 */

import { Router } from "express";
import { requireAdminAuth } from "../middlewares/supabaseAuth";
import { db, adminEvents } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

// All admin-events routes require admin authentication
router.use(requireAdminAuth);

/**
 * GET /api/admin-events
 * Returns admin events, optionally filtered by type or read status.
 * Query params: type, status (unread|all), limit, offset
 */
router.get("/", async (req, res) => {
  try {
    const eventType = req.query.type as string | undefined;
    const status = (req.query.status as string) || "unread";
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);
    const offset = parseInt(req.query.offset as string) || 0;

    const conditions: any[] = [];
    if (status === "unread") {
      conditions.push(eq(adminEvents.isRead, false));
    }
    if (eventType) {
      conditions.push(eq(adminEvents.eventType, eventType));
    }

    const whereClause = conditions.length > 0
      ? conditions.length === 1 ? conditions[0] : and(...conditions)
      : undefined;

    const events = await db
      .select()
      .from(adminEvents)
      .where(whereClause)
      .orderBy(desc(adminEvents.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ total: sql<number>`COUNT(*)` })
      .from(adminEvents)
      .where(whereClause);

    res.json({
      events,
      total: Number(countResult?.total || 0),
      limit,
      offset,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to fetch admin events");
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

/**
 * GET /api/admin-events/stats
 * Returns count of unread events by type.
 */
router.get("/stats", async (_req, res) => {
  try {
    const stats = await db
      .select({
        eventType: adminEvents.eventType,
        count: sql<number>`COUNT(*)`,
      })
      .from(adminEvents)
      .where(eq(adminEvents.isRead, false))
      .groupBy(adminEvents.eventType);

    const totalUnread = stats.reduce((sum, s) => sum + Number(s.count), 0);

    res.json({ stats, totalUnread });
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to fetch admin event stats");
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

/**
 * PATCH /api/admin-events/acknowledge-all
 * Mark all unread events as read (bulk acknowledge).
 */
router.patch("/acknowledge-all", async (req, res) => {
  try {
    const eventType = req.body?.eventType as string | undefined;

    const conditions: any[] = [eq(adminEvents.isRead, false)];
    if (eventType) {
      conditions.push(eq(adminEvents.eventType, eventType));
    }

    await db
      .update(adminEvents)
      .set({ isRead: true })
      .where(and(...conditions));

    res.json({ success: true });
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to acknowledge all admin events");
    res.status(500).json({ error: "Failed to acknowledge events" });
  }
});

/**
 * PATCH /api/admin-events/:id
 * Mark an event as read (acknowledge).
 */
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }

    const [updated] = await db
      .update(adminEvents)
      .set({ isRead: true })
      .where(eq(adminEvents.id, id))
      .returning();

    if (!updated) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, event: updated });
  } catch (err: any) {
    logger.error({ err: err.message }, "Failed to acknowledge admin event");
    res.status(500).json({ error: "Failed to acknowledge event" });
  }
});

export default router;
