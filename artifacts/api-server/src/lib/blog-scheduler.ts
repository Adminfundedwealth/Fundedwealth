/**
 * Daily blog auto-generation scheduler.
 * Runs at 07:30 AM IST (02:00 UTC) every day.
 * Generates: NIFTY analysis, BANKNIFTY analysis, Trading Psychology tip, Risk Management article.
 */
import { db } from "@workspace/db";
import { blogPosts } from "@workspace/db";
import { logger } from "./logger";
import {
  generateArticle,
  DAILY_ANALYSIS_TEMPLATES,
  getRandomTopics,
  slugify,
} from "../routes/auto-blog";

// IST is UTC+5:30. 07:30 IST = 02:00 UTC.
// Cron: minute=0, hour=2, every day.
const CRON_SCHEDULE = "0 2 * * *";

let cronStarted = false;

async function runDailyBlogGeneration(): Promise<void> {
  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });

  logger.info("[BlogScheduler] Starting daily article generation for %s", today);

  // Build today's topic list
  const dailyTopics: { category: string; topic: string }[] = [
    // NIFTY analysis
    {
      category: DAILY_ANALYSIS_TEMPLATES[0].category,
      topic: DAILY_ANALYSIS_TEMPLATES[0].topicFn(today),
    },
    // BANKNIFTY analysis
    {
      category: DAILY_ANALYSIS_TEMPLATES[1].category,
      topic: DAILY_ANALYSIS_TEMPLATES[1].topicFn(today),
    },
    // Psychology tip (random from Psychology pool)
    ...getRandomTopics(1).filter(t => t.category === "Psychology").slice(0, 1),
    // Risk management (random from Trading Tips pool)
    ...getRandomTopics(1).filter(t => t.category === "Trading Tips").slice(0, 1),
  ];

  // Ensure we always have at least 2 entries even if filters returned nothing
  if (dailyTopics.length < 3) {
    dailyTopics.push(...getRandomTopics(4 - dailyTopics.length));
  }

  let generated = 0;
  for (const { category, topic } of dailyTopics) {
    try {
      const article = await generateArticle(topic, category);

      await db.insert(blogPosts).values({
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        author: "FundedWealth Team",
        readTime: article.readTime,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        keywords: article.keywords,
        isPublished: true,
        isFeatured: false,
        publishedAt: new Date(),
      });

      generated++;
      logger.info("[BlogScheduler] Published: %s", article.title);
    } catch (err: any) {
      logger.error({ err, topic }, "[BlogScheduler] Failed to generate article");
    }
  }

  logger.info("[BlogScheduler] Daily run complete — %d articles published", generated);
}

export async function startBlogScheduler(): Promise<void> {
  if (cronStarted) return;

  // Disable via env flag
  if (process.env.DISABLE_BLOG_SCHEDULER === "true") {
    logger.info("[BlogScheduler] Disabled by DISABLE_BLOG_SCHEDULER=true");
    return;
  }

  // Lazy-load node-cron to avoid hard dependency crash if not installed
  let cron: any;
  try {
    cron = await import("node-cron");
  } catch (_e) {
    logger.warn("[BlogScheduler] node-cron not installed — daily blog scheduler disabled. Run: pnpm add node-cron @types/node-cron");
    return;
  }

  cronStarted = true;

  // Schedule: 07:30 IST = 02:00 UTC daily
  cron.schedule(CRON_SCHEDULE, async () => {
    try {
      await runDailyBlogGeneration();
    } catch (err) {
      logger.error({ err }, "[BlogScheduler] Unhandled error in daily run");
    }
  }, {
    timezone: "UTC",
  });

  logger.info("[BlogScheduler] Scheduled — runs daily at 07:30 IST (02:00 UTC)");
}

// Export for manual trigger in tests / admin
export { runDailyBlogGeneration };
