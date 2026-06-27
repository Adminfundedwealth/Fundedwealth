import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { championshipRegistrations, users } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { registrationLimiter } from "../lib/rate-limit";
import { championshipRegistrationEmail } from "../lib/email";

const router = Router();

router.post("/register", registrationLimiter, async (req, res) => {
  const auth = getAuth(req);
  const { name, email, mobile, challengeType } = req.body;

  if (!name || !email || !mobile) {
    return res.status(400).json({ error: "Name, email, and mobile are required" });
  }

  const [registration] = await db
    .insert(championshipRegistrations)
    .values({
      name,
      email,
      mobile,
      clerkId: auth?.userId || null,
      challengeType: challengeType || "monthly",
    })
    .returning();

  championshipRegistrationEmail(name, email, challengeType || "monthly").catch(() => {});

  res.status(201).json({ success: true, id: registration.id });
});

router.get("/leaderboard", async (req, res) => {
  const type = (req.query.type as string) || "monthly";

  const registrations = await db
    .select()
    .from(championshipRegistrations)
    .where(eq(championshipRegistrations.challengeType, type))
    .orderBy(desc(championshipRegistrations.profitAmount))
    .limit(50);

  res.json(registrations);
});

/**
 * GET /api/championship/my-status
 * User's championship entry status, payment status, tournaments joined.
 */
router.get("/my-status", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const entries = await db
      .select()
      .from(championshipRegistrations)
      .where(eq(championshipRegistrations.clerkId, auth.userId))
      .orderBy(desc(championshipRegistrations.createdAt));

    res.json({
      registered: entries.length > 0,
      entries,
      totalJoined: entries.length,
      paidEntries: entries.filter(e => e.paymentStatus === "paid").length,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch championship status" });
  }
});

export default router;
