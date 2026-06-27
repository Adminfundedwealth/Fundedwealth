import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { economicEvents, users } from "@workspace/db";
import { and, asc, desc, eq, gt, lt, ne } from "drizzle-orm";
import { syncEconomicEvents } from "../lib/economic-calendar";

const router = Router();

async function requireAdmin(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin access required" });

  req.adminUser = user;
  next();
}

router.get("/", async (req, res) => {
  try {
    const region = typeof req.query.region === "string" ? req.query.region : undefined;
    const impact = typeof req.query.impact === "string" ? req.query.impact : undefined;
    const from = typeof req.query.from === "string" ? new Date(req.query.from) : undefined;
    const to = typeof req.query.to === "string" ? new Date(req.query.to) : undefined;

    const query = db.select().from(economicEvents);
    const filters: any[] = [];

    if (region === "India") {
      filters.push(eq(economicEvents.country, "India"));
    } else if (region === "Global") {
      filters.push(ne(economicEvents.country, "India"));
    }
    if (impact) filters.push(eq(economicEvents.impact, impact));
    if (from && !Number.isNaN(from.getTime())) filters.push(gt(economicEvents.scheduledAt, new Date(from.getTime() - 1)));
    if (to && !Number.isNaN(to.getTime())) filters.push(lt(economicEvents.scheduledAt, new Date(to.getTime() + 1)));

    const events = filters.length
      ? await query.where(and(...filters)).orderBy(desc(economicEvents.isPinned), asc(economicEvents.scheduledAt))
      : await query.orderBy(desc(economicEvents.isPinned), asc(economicEvents.scheduledAt));

    res.json({ events });
  } catch (error) {
    console.error("[EconomicEvents] GET / failed", error);
    res.status(500).json({ error: "Failed to load economic events" });
  }
});

router.post("/sync", requireAdmin, async (_req, res) => {
  try {
    await syncEconomicEvents();
    res.json({ success: true, message: "Economic calendar sync completed." });
  } catch (error) {
    console.error("[EconomicEvents] Sync trigger failed", error);
    res.status(500).json({ error: "Sync trigger failed" });
  }
});

router.patch("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid event id" });
    }

    const {
      title,
      country,
      eventType,
      impact,
      scheduledAt,
      actual,
      forecast,
      previous,
      source,
      sourceUrl,
      isPinned,
      notified24h,
      notified1h,
      notified15m,
    } = req.body as Record<string, unknown>;

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof title === "string") updates.title = title;
    if (typeof country === "string") updates.country = country;
    if (typeof eventType === "string") updates.eventType = eventType;
    if (typeof impact === "string") updates.impact = impact;
    if (typeof scheduledAt === "string") updates.scheduledAt = new Date(scheduledAt);
    if (typeof actual === "string") updates.actual = actual;
    if (typeof forecast === "string") updates.forecast = forecast;
    if (typeof previous === "string") updates.previous = previous;
    if (typeof source === "string") updates.source = source;
    if (typeof sourceUrl === "string") updates.sourceUrl = sourceUrl;
    if (typeof isPinned === "boolean") updates.isPinned = isPinned;
    if (typeof notified24h === "boolean") updates.notified24h = notified24h;
    if (typeof notified1h === "boolean") updates.notified1h = notified1h;
    if (typeof notified15m === "boolean") updates.notified15m = notified15m;

    const [updated] = await db
      .update(economicEvents)
      .set(updates)
      .where(eq(economicEvents.id, id))
      .returning();

    res.json({ event: updated });
  } catch (error) {
    console.error("[EconomicEvents] PATCH /:id failed", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

export default router;
