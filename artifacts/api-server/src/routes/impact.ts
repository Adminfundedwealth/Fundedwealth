import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { users, impactDonations } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { donationLimiter } from "../lib/rate-limit";
import { donationThankYouEmail } from "../lib/email";

const router = Router();

router.get("/stats", async (_req, res) => {
  const [stats] = await db
    .select({
      totalDonations: sql<number>`COALESCE(SUM(${impactDonations.amount}), 0)`,
      totalMeals: sql<number>`COALESCE(SUM(${impactDonations.mealsProvided}), 0)`,
      totalStudents: sql<number>`COALESCE(SUM(${impactDonations.studentsSupported}), 0)`,
      donorCount: sql<number>`COUNT(DISTINCT ${impactDonations.donorName})`,
    })
    .from(impactDonations)
    .where(eq(impactDonations.status, "completed"));

  res.json(stats);
});

router.get("/leaderboard", async (_req, res) => {
  const leaders = await db
    .select({
      donorName: impactDonations.donorName,
      donorCity: impactDonations.donorCity,
      totalAmount: sql<number>`SUM(${impactDonations.amount})`,
      totalMeals: sql<number>`SUM(${impactDonations.mealsProvided})`,
      totalStudents: sql<number>`SUM(${impactDonations.studentsSupported})`,
    })
    .from(impactDonations)
    .where(eq(impactDonations.status, "completed"))
    .groupBy(impactDonations.donorName, impactDonations.donorCity)
    .orderBy(sql`SUM(${impactDonations.amount}) DESC`)
    .limit(20);

  res.json(leaders);
});

router.post("/donate", donationLimiter, async (req, res) => {
  const auth = getAuth(req);
  const { donorName, donorCity, amount, category } = req.body;

  if (!donorName || !amount || amount <= 0) {
    return res.status(400).json({ error: "Donor name and valid amount required" });
  }

  let userId = null;
  if (auth?.userId) {
    const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
    if (user) userId = user.id;
  }

  const mealsProvided = Math.floor(amount / 25);
  const studentsSupported = Math.floor(amount / 500);

  const [donation] = await db
    .insert(impactDonations)
    .values({
      userId,
      donorName,
      donorCity,
      amount,
      category: category || "general",
      mealsProvided,
      studentsSupported,
    })
    .returning();

  const donorEmail = req.body.donorEmail;
  if (donorEmail) {
    donationThankYouEmail(donorName, donorEmail, amount, category || "general").catch(() => {});
  }

  res.status(201).json(donation);
});

/**
 * GET /api/impact/my-history
 * User's donation history, total contribution, badges.
 */
router.get("/my-history", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  try {
    const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
    if (!user) return res.status(404).json({ error: "User not found" });

    const donations = await db
      .select()
      .from(impactDonations)
      .where(eq(impactDonations.userId, user.id))
      .orderBy(desc(impactDonations.createdAt));

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const totalMeals = donations.reduce((sum, d) => sum + d.mealsProvided, 0);
    const totalStudents = donations.reduce((sum, d) => sum + d.studentsSupported, 0);

    // Badge calculation
    let badge = "none";
    if (totalDonated >= 1000) badge = "leader";
    else if (totalDonated >= 100) badge = "contributor";
    else if (totalDonated >= 10) badge = "supporter";

    // Leaderboard position
    const allDonors = await db
      .select({ donorName: impactDonations.donorName, totalAmount: sql<number>`SUM(amount)` })
      .from(impactDonations)
      .where(eq(impactDonations.status, "completed"))
      .groupBy(impactDonations.donorName)
      .orderBy(sql`SUM(amount) DESC`);

    const donorName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Trader";
    const leaderboardPosition = allDonors.findIndex(d => d.donorName === donorName) + 1;

    res.json({
      donations,
      totalDonated,
      totalMeals,
      totalStudents,
      badge,
      leaderboardPosition: leaderboardPosition || null,
      donationCount: donations.length,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch impact history" });
  }
});

export default router;
