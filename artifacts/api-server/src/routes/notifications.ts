import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { users, notifications } from "@workspace/db";
import { eq, desc, and, or, gt, sql, isNull } from "drizzle-orm";
import { sendEmail } from "../lib/email";
import { broadcastNotificationToUser, supabaseAdmin } from "../lib/supabase";
import { generalLimiter } from "../lib/rate-limit";

const router = Router();

const DEFAULT_NOTIFICATION_SETTINGS = {
  emailAlerts: true,
  whatsappAlerts: false,
  inAppAlerts: true,
  payoutAlerts: true,
  tradeAlerts: true,
  marketingAlerts: false,
};

const notificationTemplates: Record<string, { title: string; message: (body: any) => string }> = {
  TRADE_BREACH: {
    title: "Trade limit breached",
    message: (body) => `⚠️ Your account ${body.accountCode || "FW-XXXXX"} has been breached - Daily loss limit exceeded`,
  },
  PAYOUT_APPROVED: {
    title: "Payout approved",
    message: (body) => `✅ Your payout of ₹${body.amount ?? "XX,XXX"} has been approved`,
  },
  PAYOUT_REJECTED: {
    title: "Payout rejected",
    message: () => "❌ Your payout request was rejected",
  },
  CHALLENGE_PASSED: {
    title: "Challenge passed",
    message: () => "🎉 Congratulations! You passed Phase 1",
  },
  NEW_CHALLENGE: {
    title: "New challenge available",
    message: () => "🚀 New Flash Challenge available - Limited time!",
  },
  ACCOUNT_CREATED: {
    title: "Account ready",
    message: (body) => `✅ Your trading account ${body.accountCode || "FW-XXXXX"} is ready`,
  },
  REFERRAL_SIGNUP: {
    title: "Referral credited",
    message: (body) => `🎉 ${body.name || "A new trader"} joined with your link and your referral bonus is on the way.`,
  },
};

function parseNotificationSettings(settings: string | null) {
  try {
    if (!settings) return DEFAULT_NOTIFICATION_SETTINGS;
    return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(settings) };
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

function notificationToResponse(row: any) {
  return {
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : {},
  };
}

async function sendWhatsAppNotification(phone: string | null, title: string, message: string) {
  if (!phone) return false;
  if (!process.env.TWILIO_API_KEY) {
    console.log(`[WHATSAPP] would send to ${phone}: ${title} — ${message}`);
    return false;
  }
  console.log(`[WHATSAPP] Twilio integration enabled, but not configured in this demo path.`);
  return false;
}

router.post("/", generalLimiter, async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const {
    type,
    title,
    message,
    link,
    actionUrl,
    icon,
    category,
    metadata,
    priority,
    deliveryChannels,
    expiresAt,
  } = req.body as {
    type?: string;
    title?: string;
    message?: string;
    link?: string;
    actionUrl?: string;
    icon?: string;
    category?: string;
    metadata?: Record<string, unknown>;
    priority?: string;
    deliveryChannels?: string[];
    expiresAt?: string;
  };

  if (!type || typeof type !== "string") {
    return res.status(400).json({ error: "Notification type is required" });
  }

  const template = notificationTemplates[type];
  const resolvedTitle = title || template?.title || "Notification";
  const resolvedMessage = message || template?.message(req.body) || "You have a new notification.";
  const resolvedCategory = category || (type.includes("PAYOUT") ? "Payout" : type.includes("CHALLENGE") ? "Challenges" : type.includes("REFERRAL") ? "Referral" : "System");
  const resolvedPriority = priority || "medium";
  const resolvedChannels = Array.isArray(deliveryChannels) && deliveryChannels.length > 0 ? deliveryChannels : ["in_app"];

  const [created] = await db
    .insert(notifications)
    .values({
      userId: user.id,
      type,
      title: resolvedTitle,
      message: resolvedMessage,
      link: link || null,
      actionUrl: actionUrl || link || null,
      icon: icon || null,
      category: resolvedCategory,
      metadata: JSON.stringify(metadata || {}),
      priority: resolvedPriority,
      deliveryChannels: resolvedChannels.join(","),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isRead: false,
    })
    .returning();

  if (supabaseAdmin) {
    await supabaseAdmin.from("notifications").insert({
      user_id: auth.userId,
      type: type,
      title: resolvedTitle,
      message: resolvedMessage,
      link: link || null,
      action_url: actionUrl || link || null,
      icon: icon || null,
      category: resolvedCategory,
      metadata: JSON.stringify(metadata || {}),
      priority: resolvedPriority,
      delivery_channels: resolvedChannels.join(","),
      expires_at: expiresAt ? new Date(expiresAt) : null,
    });
  }

  broadcastNotificationToUser(auth.userId, notificationToResponse(created));

  const preferences = parseNotificationSettings(user.notificationSettings);
  if (resolvedChannels.includes("email") && preferences.emailAlerts && user.email) {
    await sendEmail({
      to: user.email,
      subject: resolvedTitle,
      html: `<p>${resolvedMessage}</p><p><a href="${actionUrl || link || "#"}">View details</a></p>`,
    });
  }

  if (resolvedChannels.includes("whatsapp") && preferences.whatsappAlerts) {
    await sendWhatsAppNotification(user.phone || null, resolvedTitle, resolvedMessage);
  }

  res.json({ notification: notificationToResponse(created) });
});

router.get("/", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
  const items = await db
    .select()
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, user.id),
        or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date())),
      ),
    )
    .orderBy(desc(notifications.createdAt))
    .limit(limit);

  const [unreadCount] = await db
    .select({
      count: sql<number>`count(*)::int`,
    })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, user.id),
        eq(notifications.isRead, false),
        or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date())),
      ),
    );

  res.json({ notifications: items.map(notificationToResponse), unreadCount: Number(unreadCount?.count || 0) });
});

router.get("/unread-count", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const [unreadCount] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(
      and(
        eq(notifications.userId, user.id),
        eq(notifications.isRead, false),
        or(isNull(notifications.expiresAt), gt(notifications.expiresAt, new Date())),
      ),
    );

  res.json({ unreadCount: Number(unreadCount?.count || 0) });
});

router.patch("/:id/read", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const id = parseInt(req.params.id);
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  res.json({ success: true });
});

router.patch("/read-all", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));

  res.json({ success: true });
});

router.delete("/:id", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const id = parseInt(req.params.id);
  await db.delete(notifications).where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));

  res.json({ success: true });
});

router.get("/preferences", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ preferences: parseNotificationSettings(user.notificationSettings) });
});

router.patch("/preferences", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  const updates = req.body as Partial<Record<keyof typeof DEFAULT_NOTIFICATION_SETTINGS, boolean>>;
  const nextSettings = { ...parseNotificationSettings(user.notificationSettings), ...updates };

  await db
    .update(users)
    .set({ notificationSettings: JSON.stringify(nextSettings) })
    .where(eq(users.id, user.id));

  res.json({ preferences: nextSettings });
});

export default router;
