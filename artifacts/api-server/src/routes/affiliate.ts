import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { createHash } from "crypto";
import { db } from "@workspace/db";
import { users, referrals, affiliateClicks, affiliatePayouts, notifications } from "@workspace/db";
import { eq, desc, sql, or, and } from "drizzle-orm";
import { broadcastNotificationToUser } from "../lib/supabase";
import { registrationLimiter } from "../lib/rate-limit";
import { affiliateWelcomeEmail } from "../lib/email";
import { requireTurnstile } from "../lib/turnstile-service";
import { FraudDetectionService } from "../lib/fraud-detection-service";
import { requireActiveAccount } from "../middlewares/accountStatusMiddleware";

const router = Router();
const MIN_PAYOUT = 500;
const VALID_PAYOUT_METHODS = ["UPI", "Bank Transfer"];

function getAffiliateLink(code: string) {
  const frontendUrl = process.env.FRONTEND_URL || "https://fundedwealth.in";
  return `${frontendUrl}/ref/${code}`;
}

async function getCurrentUser(req: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return null;
  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  return user || null;
}

router.get("/stats", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const affiliateCode = user.affiliateCode || "";

  const [totalClicks] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(affiliateClicks)
    .where(eq(affiliateClicks.referralCode, affiliateCode));

  const [uniqueVisitors] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${affiliateClicks.ipHash})` })
    .from(affiliateClicks)
    .where(eq(affiliateClicks.referralCode, affiliateCode));

  const [referralSummary] = await db
    .select({
      totalReferrals: sql<number>`COALESCE(COUNT(${referrals.id}), 0)`,
      activeTraders: sql<number>`COALESCE(SUM(CASE WHEN ${referrals.status} IN ('approved','paid') THEN 1 ELSE 0 END), 0)`,
      totalEarned: sql<number>`COALESCE(SUM(${referrals.commissionAmount}), 0)`,
      totalPending: sql<number>`COALESCE(SUM(CASE WHEN ${referrals.status} = 'approved' THEN ${referrals.commissionAmount} ELSE 0 END), 0)`,
      totalPaid: sql<number>`COALESCE(SUM(CASE WHEN ${referrals.status} = 'paid' THEN ${referrals.commissionAmount} ELSE 0 END), 0)`,
    })
    .from(referrals)
    .where(eq(referrals.referrerUserId, user.id));

  const conversions = Number(referralSummary?.activeTraders || 0);
  const unique = Number(uniqueVisitors?.count || 0);
  const conversionRate = unique > 0 ? Math.round((conversions / unique) * 100 * 100) / 100 : 0;

  const topAffiliates = await db
    .select({
      userId: referrals.referrerUserId,
      totalEarnings: sql<number>`COALESCE(SUM(${referrals.commissionAmount}), 0)`,
    })
    .from(referrals)
    .groupBy(referrals.referrerUserId)
    .orderBy(desc(sql`COALESCE(SUM(${referrals.commissionAmount}), 0)`))
    .limit(100);

  let leaderboardRank: number | null = null;
  const rankPosition = topAffiliates.findIndex((row) => row.userId === user.id);
  if (rankPosition >= 0) leaderboardRank = rankPosition + 1;

  res.json({
    affiliateCode: user.affiliateCode,
    affiliateLink: getAffiliateLink(user.affiliateCode || ""),
    referralCount: Number(referralSummary?.totalReferrals || 0),
    activeTraders: Number(referralSummary?.activeTraders || 0),
    totalEarned: Number(referralSummary?.totalEarned || 0),
    totalPending: Number(referralSummary?.totalPending || 0),
    totalPaid: Number(referralSummary?.totalPaid || 0),
    totalClicks: Number(totalClicks?.count || 0),
    uniqueVisitors: unique,
    conversions,
    conversionRate,
    leaderboardRank: leaderboardRank || (topAffiliates.length === 100 ? 100 : null),
  });
});

router.get("/my-link", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  res.json({
    affiliateCode: user.affiliateCode,
    affiliateLink: getAffiliateLink(user.affiliateCode || ""),
  });
});

router.get("/history", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const statusFilter = String(req.query.status || "all").toLowerCase();
  const search = String(req.query.search || "").trim();
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
  const offset = (page - 1) * limit;

  const conditions = [eq(referrals.referrerUserId, user.id)];
  if (statusFilter !== "all") {
    conditions.push(eq(referrals.status, statusFilter));
  }
  if (search) {
    const q = `%${search.toLowerCase()}%`;
    conditions.push(
      sql`(${users.firstName} ILIKE ${q} OR ${users.email} ILIKE ${q} OR ${referrals.referralCode} ILIKE ${q})`,
    );
  }

  const query = db
    .select({
      id: referrals.id,
      createdAt: referrals.createdAt,
      referralCode: referrals.referralCode,
      planPurchased: referrals.planPurchased,
      purchaseAmount: referrals.purchaseAmount,
      commissionAmount: referrals.commissionAmount,
      status: referrals.status,
      level: referrals.level,
      referredUserId: referrals.referredUserId,
      referredName: users.firstName,
      referredEmail: users.email,
    })
    .from(referrals)
    .leftJoin(users, eq(users.id, referrals.referredUserId))
    .where(and(...conditions));

  const [totalRows] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(referrals)
    .where(eq(referrals.referrerUserId, user.id));

  const history = await query.orderBy(desc(referrals.createdAt)).limit(limit).offset(offset);

  res.json({
    history,
    page,
    limit,
    total: Number(totalRows?.count || 0),
  });
});

router.get("/clicks", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const affiliateCode = user.affiliateCode || "";
  const [totalClicks] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(affiliateClicks)
    .where(eq(affiliateClicks.referralCode, affiliateCode));

  const [uniqueVisitors] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${affiliateClicks.ipHash})` })
    .from(affiliateClicks)
    .where(eq(affiliateClicks.referralCode, affiliateCode));

  const recentClicks = await db
    .select()
    .from(affiliateClicks)
    .where(eq(affiliateClicks.referralCode, affiliateCode))
    .orderBy(desc(affiliateClicks.clickedAt))
    .limit(20);

  res.json({
    totalClicks: Number(totalClicks?.count || 0),
    uniqueVisitors: Number(uniqueVisitors?.count || 0),
    recentClicks,
  });
});

router.get("/leaderboard", async (_req, res) => {
  const top = await db
    .select({
      userId: referrals.referrerUserId,
      totalEarnings: sql<number>`COALESCE(SUM(${referrals.commissionAmount}), 0)`,
      totalReferrals: sql<number>`COUNT(${referrals.id})`,
      firstName: users.firstName,
      lastName: users.lastName,
      affiliateCode: users.affiliateCode,
    })
    .from(referrals)
    .leftJoin(users, eq(users.id, referrals.referrerUserId))
    .groupBy(users.id, referrals.referrerUserId)
    .orderBy(desc(sql`COALESCE(SUM(${referrals.commissionAmount}), 0)`))
    .limit(20);

  const leaderboard = top.map((row, index) => ({
    rank: index + 1,
    userId: row.userId,
    name: `${row.firstName || "Affiliate"}`,
    affiliateCode: row.affiliateCode,
    earnings: Number(row.totalEarnings),
    referrals: Number(row.totalReferrals),
  }));

  res.json({ leaderboard });
});

router.post("/claim", requireActiveAccount, async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const { method = "UPI" } = req.body as { method?: string };
  if (!VALID_PAYOUT_METHODS.includes(method)) {
    return res.status(400).json({ error: "Invalid payout method" });
  }

  const [pendingSummary] = await db
    .select({
      totalPending: sql<number>`COALESCE(SUM(${referrals.commissionAmount}), 0)`,
      count: sql<number>`COALESCE(COUNT(${referrals.id}), 0)`,
    })
    .from(referrals)
    .where(and(eq(referrals.referrerUserId, user.id), eq(referrals.status, "approved")));

  if (!pendingSummary || pendingSummary.totalPending < MIN_PAYOUT) {
    return res.status(400).json({ error: `Minimum ₹${MIN_PAYOUT} pending commission required to withdraw.` });
  }

  const payoutStatus = process.env.AUTO_PAYOUT === "1" ? "paid" : "pending";
  const [newPayout] = await db
    .insert(affiliatePayouts)
    .values({
      userId: user.id,
      amount: pendingSummary.totalPending,
      method,
      status: payoutStatus,
      processedAt: payoutStatus === "paid" ? new Date() : null,
    })
    .returning();

  await db
    .update(referrals)
    .set({ status: payoutStatus === "paid" ? "paid" : "approved", updatedAt: new Date() })
    .where(and(eq(referrals.referrerUserId, user.id), eq(referrals.status, "approved")));

  await db.insert(notifications).values({
    userId: user.id,
    type: "PAYOUT_REQUEST",
    title: "Commission withdrawal requested",
    message: `Your ₹${pendingSummary.totalPending} commission withdrawal via ${method} is now ${payoutStatus}.`,
    link: null,
    actionUrl: null,
    icon: null,
    category: "Payout",
    metadata: "{}",
    priority: "medium",
    deliveryChannels: "in_app,email",
    expiresAt: null,
    isRead: false,
  });

  broadcastNotificationToUser(user.clerkId, {
    type: "PAYOUT_REQUEST",
    title: "Commission withdrawal requested",
    message: `Your ₹${pendingSummary.totalPending} commission withdrawal via ${method} is now ${payoutStatus}.`,
    category: "Payout",
    priority: "medium",
    actionUrl: null,
    icon: "wallet",
    isRead: false,
    createdAt: new Date().toISOString(),
  });

  res.json({
    message: `Withdrawal request submitted for ₹${pendingSummary.totalPending}.`,
    payout: newPayout,
  });
});

router.get("/payout-history", async (req, res) => {
  const user = await getCurrentUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const payouts = await db
    .select()
    .from(affiliatePayouts)
    .where(eq(affiliatePayouts.userId, user.id))
    .orderBy(desc(affiliatePayouts.createdAt));

  res.json({ payouts });
});

router.post("/click", async (req, res) => {
  const { referralCode } = req.body;
  if (!referralCode || typeof referralCode !== "string") {
    return res.status(400).json({ error: "Referral code required" });
  }

  const [referrer] = await db
    .select()
    .from(users)
    .where(eq(users.affiliateCode, referralCode));

  if (!referrer) {
    return res.status(404).json({ error: "Invalid referral code" });
  }

  const ipAddress = String(req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").split(",")[0].trim();
  const hashSource = `${ipAddress}-${referralCode}-${Date.now()}`;
  const ipHash = createHash("sha256").update(hashSource).digest("hex");
  const country = String(req.headers["x-vercel-ip-country"] || req.headers["cf-ipcountry"] || req.headers["x-country"] || "");
  const device = String(req.headers["user-agent"] || "Unknown").slice(0, 255);

  await db.insert(affiliateClicks).values({
    referralCode,
    ipHash,
    country,
    device,
  });

  res.json({ success: true });
});

router.post("/track", async (req, res) => {
  const { affiliateCode, referredEmail } = req.body;

  if (!affiliateCode || !referredEmail) {
    return res.status(400).json({ error: "Affiliate code and email required" });
  }

  const [referrer] = await db
    .select()
    .from(users)
    .where(eq(users.affiliateCode, affiliateCode));

  if (!referrer) return res.status(404).json({ error: "Invalid affiliate code" });

  const [referral] = await db
    .insert(referrals)
    .values({
      referrerUserId: referrer.id,
      referredEmail,
      referralCode: affiliateCode,
      status: "pending",
    })
    .returning();

  res.status(201).json({ success: true, referralId: referral.id });
});

router.post("/register", registrationLimiter, requireTurnstile, async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: "Name and email required" });

    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const code = `FW-${name.replace(/\s+/g, "").slice(0, 6).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const [newUser] = await db
      .insert(users)
      .values({
        clerkId: `aff_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        email,
        firstName: name.split(" ")[0] || name,
        lastName: name.split(" ").slice(1).join(" ") || "",
        affiliateCode: code,
        role: "affiliate",
      })
      .returning();

    // Run fraud detection for referral registration
    const clientIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const deviceFp =
      (req.headers["x-device-fingerprint"] as string) ||
      req.headers["user-agent"] ||
      "unknown";

    FraudDetectionService.detectAndScore({
      userId: newUser.id,
      ipAddress: clientIp,
      deviceFingerprint: deviceFp,
      country: "unknown",
      userEmail: email,
      trigger: "signup",
    }).catch((err) => {
      console.error("Referral fraud scoring failed:", err);
    });

    affiliateWelcomeEmail(name, email, code).catch(() => { });

    res.status(201).json({
      success: true,
      affiliateCode: code,
      userId: newUser.id,
    });
  } catch (err: any) {
    console.error("Affiliate register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
});

export default router;
