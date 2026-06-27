import { db } from "@workspace/db";
import { economicEvents, notifications, users } from "@workspace/db";
import { broadcastNotificationToUser, supabaseAdmin } from "./supabase";
import { sendEmail } from "./email";
import { and, asc, eq, gt, lt } from "drizzle-orm";

const SIX_HOURS = 1000 * 60 * 60 * 6;
const ONE_DAY = 1000 * 60 * 60 * 24;
const ONE_HOUR = 1000 * 60 * 60;
const FIFTEEN_MINUTES = 1000 * 60 * 15;
const PULL_INTERVAL = 1000 * 60 * 5;

interface SyncableEconomicEvent {
  title: string;
  country: string;
  eventType: string;
  impact: "low" | "medium" | "high";
  scheduledAt: string;
  actual?: string | null;
  forecast?: string | null;
  previous?: string | null;
  source: string;
  sourceUrl?: string;
}

function normalizeImpact(value: string | number | null | undefined): "low" | "medium" | "high" {
  if (value === null || value === undefined) return "low";
  const normalized = String(value).trim().toLowerCase();
  if (normalized === "high" || normalized === "3" || normalized === "important") return "high";
  if (normalized === "medium" || normalized === "2" || normalized === "moderate") return "medium";
  return "low";
}

function parseNotificationSettings(settings: string | null) {
  try {
    if (!settings) return { emailAlerts: true, inAppAlerts: true };
    const parsed = JSON.parse(settings);
    return {
      emailAlerts: parsed.emailAlerts ?? true,
      inAppAlerts: parsed.inAppAlerts ?? true,
    };
  } catch {
    return { emailAlerts: true, inAppAlerts: true };
  }
}

async function fetchTradingEconomicsCalendar(country: string): Promise<SyncableEconomicEvent[]> {
  const apiKey = process.env.TRADING_ECONOMICS_API_KEY;
  if (!apiKey) return [];

  const url = new URL("https://api.tradingeconomics.com/calendar");
  url.searchParams.set("c", apiKey);
  url.searchParams.set("country", country);
  url.searchParams.set("f", "json");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`TradingEconomics calendar fetch failed (${country}): ${response.status}`);
  }

  const data = (await response.json()) as Array<Record<string, unknown>>;
  return data
    .map((item) => {
      const title = String(item.event || item.title || "Untitled event");
      const countryValue = String(item.country || country || "India");
      const dateString = String(item.date || item.dateTime || item.datetime || item.datetime_utc || "");
      const scheduledAt = new Date(dateString);
      if (Number.isNaN(scheduledAt.getTime())) return null;

      return {
        title,
        country: countryValue,
        eventType: String(item.category || item.subject || item.type || "Macro").trim(),
        impact: normalizeImpact((item.importance || item.impact || item.importanceText) as string | number | null),
        scheduledAt: scheduledAt.toISOString(),
        actual: item.actual != null ? String(item.actual) : null,
        forecast: item.forecast != null ? String(item.forecast) : null,
        previous: item.previous != null ? String(item.previous) : null,
        source: "TradingEconomics",
        sourceUrl: item.url ? String(item.url) : "https://tradingeconomics.com",
      };
    })
    .filter(Boolean) as SyncableEconomicEvent[];
}

async function fetchAllSources(): Promise<SyncableEconomicEvent[]> {
  const events: SyncableEconomicEvent[] = [];

  try {
    events.push(...(await fetchTradingEconomicsCalendar("India")));
  } catch (error) {
    console.warn("[EconomicCalendar] India calendar sync failed", error);
  }

  try {
    events.push(...(await fetchTradingEconomicsCalendar("United States")));
  } catch (error) {
    console.warn("[EconomicCalendar] US calendar sync failed", error);
  }

  try {
    events.push(...(await fetchTradingEconomicsCalendar("Euro Area")));
  } catch (error) {
    console.warn("[EconomicCalendar] Euro Area calendar sync failed", error);
  }

  return events;
}

async function upsertEvent(event: SyncableEconomicEvent) {
  const scheduledAt = new Date(event.scheduledAt);
  if (Number.isNaN(scheduledAt.getTime())) return null;

  const [existing] = await db
    .select()
    .from(economicEvents)
    .where(
      and(
        eq(economicEvents.source, event.source),
        eq(economicEvents.title, event.title),
        eq(economicEvents.scheduledAt, scheduledAt),
      ),
    );

  const values = {
    title: event.title,
    country: event.country,
    eventType: event.eventType,
    impact: event.impact,
    scheduledAt,
    actual: event.actual ?? null,
    forecast: event.forecast ?? null,
    previous: event.previous ?? null,
    source: event.source,
    sourceUrl: event.sourceUrl ?? null,
    updatedAt: new Date(),
  };

  if (existing) {
    await db
      .update(economicEvents)
      .set(values)
      .where(eq(economicEvents.id, existing.id));
    return existing.id;
  }

  const [inserted] = await db.insert(economicEvents).values({ ...values, createdAt: new Date() }).returning();
  return inserted.id;
}

async function performSyncEconomicEvents() {
  const allEvents = await fetchAllSources();
  if (allEvents.length === 0) {
    console.info("[EconomicCalendar] No events found during this sync pass.");
    return;
  }

  const uniqueKey = new Set<string>();
  const inserted = [] as number[];

  for (const event of allEvents) {
    const key = `${event.source}::${event.title}::${event.scheduledAt}`;
    if (uniqueKey.has(key)) continue;
    uniqueKey.add(key);

    const id = await upsertEvent(event);
    if (id) inserted.push(id);
  }

  console.info(`[EconomicCalendar] Synced ${inserted.length} economic event records.`);
}

function formatEventNotificationWindow(label: string) {
  if (label === "24h") return "1 day";
  if (label === "1h") return "1 hour";
  if (label === "15m") return "15 minutes";
  return label;
}

async function sendHighImpactNotifications() {
  const now = new Date();
  const targets = [
    { limit: ONE_DAY, flag: "notified24h" as const, label: "24h" },
    { limit: ONE_HOUR, flag: "notified1h" as const, label: "1h" },
    { limit: FIFTEEN_MINUTES, flag: "notified15m" as const, label: "15m" },
  ];

  const usersToNotify = await db.select().from(users).where(eq(users.isActive, true));

  for (const target of targets) {
    const lowerBound = new Date(now.getTime() + target.limit - 1000 * 60 * 8);
    const upperBound = new Date(now.getTime() + target.limit + 1000 * 60 * 8);

    const events = await db
      .select()
      .from(economicEvents)
      .where(
        and(
          eq(economicEvents.impact, "high"),
          eq(economicEvents[target.flag], false),
          gt(economicEvents.scheduledAt, lowerBound),
          lt(economicEvents.scheduledAt, upperBound),
        ),
      );

    for (const event of events) {
      await db
        .update(economicEvents)
        .set({ [target.flag]: true, updatedAt: new Date() })
        .where(eq(economicEvents.id, event.id));

      const eventTime = new Date(event.scheduledAt).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      });
      const title = `High-impact event in ${formatEventNotificationWindow(target.label)}`;
      const message = `${event.title} (${event.eventType}) is scheduled for ${eventTime}. Prepare for volatility.`;

      for (const user of usersToNotify) {
        const settings = parseNotificationSettings(user.notificationSettings);
        if (settings.inAppAlerts) {
          const [created] = await db.insert(notifications).values({
            userId: user.id,
            type: "ECONOMIC_EVENT_ALERT",
            title,
            message,
            link: "/economic-calendar",
            actionUrl: "/economic-calendar",
            icon: "bell",
            category: "Economy",
            metadata: JSON.stringify({ eventId: event.id, eventTitle: event.title, window: target.label }),
            priority: "high",
            deliveryChannels: "in_app",
            expiresAt: new Date(event.scheduledAt),
            isRead: false,
          }).returning();

          if (supabaseAdmin && user.clerkId) {
            broadcastNotificationToUser(user.clerkId, created);
          }
        }

        if (settings.emailAlerts && user.email) {
          await sendEmail({
            to: user.email,
            subject: title,
            html: `<div style="font-family: Arial, sans-serif; background: #11001d; color: white; padding: 24px; border-radius: 16px;"><h2 style="color: #FF8A3D;">${title}</h2><p>${message}</p><p><strong>${event.title}</strong><br/>Impact: ${event.impact}<br/>Scheduled: ${eventTime}</p><p><a href="${process.env.FRONTEND_BASE_URL || "https://fundedwealth.com"}/economic-calendar" style="color: #7f5dff;">View calendar</a></p></div>`,
          });
        }
      }
    }
  }
}

export async function syncEconomicEvents() {
  await performSyncEconomicEvents();
}

export async function refreshUpcomingEconomicEvents() {
  await performSyncEconomicEvents();
}

export async function startEconomicCalendarScheduler() {
  if (process.env.DISABLE_CALENDAR_JOBS === "true") {
    console.info("[EconomicCalendar] Scheduler disabled by DISABLE_CALENDAR_JOBS=true");
    return;
  }

  try {
    await syncEconomicEvents();
  } catch (error) {
    console.warn("[EconomicCalendar] Initial sync failed", error);
  }

  setInterval(async () => {
    try {
      await syncEconomicEvents();
    } catch (error) {
      console.warn("[EconomicCalendar] Scheduled sync failed", error);
    }
  }, SIX_HOURS);

  setInterval(async () => {
    try {
      await refreshUpcomingEconomicEvents();
    } catch (error) {
      console.warn("[EconomicCalendar] Daily refresh failed", error);
    }
  }, ONE_DAY);

  setInterval(async () => {
    try {
      await sendHighImpactNotifications();
    } catch (error) {
      console.warn("[EconomicCalendar] Notification job failed", error);
    }
  }, PULL_INTERVAL);
}
