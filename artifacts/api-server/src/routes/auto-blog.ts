import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { users, blogPosts } from "@workspace/db";
import { eq } from "drizzle-orm";
import { ai } from "@workspace/integrations-gemini-ai";

const router = Router();

async function requireAdmin(req: any, res: any, next: any) {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });
  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user || user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
  req.adminUser = user;
  next();
}

export const BLOG_TOPICS = [
  { category: "Trading Tips", topics: [
    "How to Pass a Prop Trading Evaluation in India: Step-by-Step Guide",
    "Top 5 Risk Management Strategies for Indian Prop Traders",
    "Best Trading Hours for NSE, BSE & MCX Markets",
    "How to Master Intraday Trading on NSE: A Complete Guide",
    "10 Common Mistakes Indian Prop Traders Make and How to Avoid Them",
    "Position Sizing Strategies for Funded Trading Accounts",
    "How to Build a Consistent Trading Routine for Prop Trading",
    "The Psychology of Passing a Prop Trading Challenge",
    "How to Trade Nifty 50 Options Like a Pro",
    "Scalping vs Swing Trading: Which is Better for Prop Trading?",
    "How to Manage Drawdown in Prop Trading",
    "Best Technical Indicators for NSE Intraday Trading",
    "How to Create a Trading Plan That Passes Prop Firm Evaluations",
    "Money Management Rules Every Funded Trader Should Follow",
    "How to Trade Bank Nifty for Maximum Profits",
  ]},
  { category: "Market Analysis", topics: [
    "Indian Stock Market Outlook 2026: Key Trends for Traders",
    "How to Read Candlestick Patterns for NSE Trading",
    "Understanding Support and Resistance Levels in Indian Markets",
    "How to Use Moving Averages for BSE Stock Trading",
    "Fibonacci Retracement Strategy for Indian Stock Markets",
    "Volume Analysis Techniques for MCX Commodity Trading",
    "How to Identify Breakout Trades in Indian Markets",
    "Sector Rotation Strategy for NSE Traders",
    "Understanding FII and DII Data for Indian Market Trading",
    "How to Trade During Indian Market Earnings Season",
    "Gold Trading Strategies for MCX: A Comprehensive Guide",
    "How to Analyze Nifty 50 Using Price Action",
    "Understanding Market Breadth Indicators for Indian Markets",
    "How to Trade Currency Pairs in Indian Forex Market",
    "Crypto Market Analysis: Opportunities for Indian Traders",
  ]},
  { category: "Prop Trading", topics: [
    "What is Prop Trading? A Complete Guide for Indian Traders",
    "How to Choose the Best Prop Trading Firm in India",
    "Flash vs Instant vs 1-Step vs 2-Step: Which Prop Trading Plan is Right for You?",
    "How FundedWealth is Revolutionizing Prop Trading in India",
    "Prop Trading vs Personal Trading: Which is Better for Indian Traders?",
    "How to Scale Your Funded Account from Rs 1L to Rs 50L",
    "Understanding Drawdown Rules in Indian Prop Trading Firms",
    "How to Get Your First Payout as a Funded Trader",
    "The Future of Prop Trading in India: 2026 and Beyond",
    "How Prop Trading is Making Professional Trading Accessible in India",
    "Benefits of Trading with a Prop Firm vs Your Own Capital",
    "How to Recover After Failing a Prop Trading Challenge",
    "Understanding Profit Split Models in Indian Prop Firms",
    "Why Prop Trading is the Fastest Path to Full-Time Trading",
    "How to Trade Multiple Funded Accounts Simultaneously",
  ]},
  { category: "Psychology", topics: [
    "Trading Psychology: How to Stay Disciplined During Volatile Markets",
    "How to Overcome Fear and Greed in Prop Trading",
    "Building Mental Toughness for Professional Trading",
    "The Mindset of Successful Funded Traders in India",
    "How to Handle Trading Losses Without Emotional Breakdown",
    "Developing Patience: The Most Underrated Trading Skill",
    "How to Avoid Revenge Trading and Protect Your Funded Account",
    "Meditation and Trading: How Mindfulness Improves Your Results",
    "How to Stay Motivated During a Losing Streak",
    "The Role of Journaling in Becoming a Better Trader",
  ]},
  { category: "Education", topics: [
    "Technical Analysis for Beginners: A Guide for Indian Traders",
    "How to Start Trading in India with Zero Experience",
    "Understanding Lot Sizes and Margin Requirements for Indian Markets",
    "A Beginner's Guide to Futures and Options Trading in India",
    "How to Use TradingView for Indian Market Analysis",
    "Understanding SEBI Regulations Every Indian Trader Should Know",
    "Tax Implications of Trading Profits in India",
    "How to Set Up MetaTrader 5 for Indian Market Trading",
    "Fundamental Analysis vs Technical Analysis for Indian Stocks",
    "How to Read Financial Statements for Stock Trading in India",
  ]},
];

// Topics reserved for daily auto-generation (NIFTY / BANKNIFTY analysis)
export const DAILY_ANALYSIS_TEMPLATES = [
  {
    category: "Market Analysis",
    topicFn: (date: string) => `NIFTY 50 Daily Market Analysis — ${date}: Key Levels, Trends & Trading Setup`,
  },
  {
    category: "Market Analysis",
    topicFn: (date: string) => `BANKNIFTY Daily Analysis — ${date}: Support, Resistance & Options Strategy`,
  },
  {
    category: "Psychology",
    topicFn: (_date: string) => "Trading Psychology Tip of the Day: Building Discipline in Volatile Markets",
  },
  {
    category: "Trading Tips",
    topicFn: (_date: string) => "Daily Risk Management Rule: Protecting Your Funded Account Today",
  },
];

export function getRandomTopics(count: number): { category: string; topic: string }[] {
  const allTopics: { category: string; topic: string }[] = [];
  for (const cat of BLOG_TOPICS) {
    for (const topic of cat.topics) {
      allTopics.push({ category: cat.category, topic });
    }
  }
  const shuffled = allTopics.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[₹—–]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

interface GeneratedArticle {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
}

export async function generateArticle(topic: string, category: string): Promise<GeneratedArticle> {
  const prompt = `You are an expert SEO content writer specialising in prop trading and Indian stock markets. Write a detailed, SEO-optimised blog article for FundedWealth, India's #1 prop trading firm.

Topic: "${topic}"
Category: ${category}

Requirements:
1. Write 1000-1500 words of high-quality, informative content
2. Use proper HTML formatting (h2, h3, p, ul, li, strong, em tags only — NO h1)
3. Target Indian traders searching for prop trading and stock market content
4. Naturally include keywords: prop trading India, funded trading, NSE, BSE, FundedWealth
5. Include practical tips and actionable advice
6. Write in a professional but accessible tone
7. End with a call-to-action mentioning FundedWealth's plans starting at Rs 999

Return ONLY a valid JSON object with these exact fields (no markdown, no code block):
{
  "title": "SEO-optimised article title (max 65 chars, include India where relevant)",
  "metaTitle": "Meta title for search engines (max 60 chars)",
  "metaDescription": "Compelling meta description (max 155 chars) that drives clicks",
  "keywords": "8-12 comma-separated SEO keywords relevant to the article",
  "excerpt": "Article card summary (max 160 chars)",
  "content": "Full HTML article content",
  "readTime": "X min read"
}`;

  if (!ai) {
    throw new Error("AI service not configured (GEMINI_API_KEY missing)");
  }
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { maxOutputTokens: 8192 },
  });

  const raw = response.text || "";
  // Strip markdown code fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Failed to parse AI response as JSON");

  const parsed = JSON.parse(jsonMatch[0]);
  const timestamp = Date.now();

  return {
    title: parsed.title || topic,
    slug: `${slugify(parsed.title || topic)}-${timestamp}`,
    excerpt: parsed.excerpt || `Learn about ${topic} for Indian prop traders.`,
    content: parsed.content || "",
    category,
    readTime: parsed.readTime || "5 min read",
    metaTitle: parsed.metaTitle || (parsed.title || topic).slice(0, 60),
    metaDescription: parsed.metaDescription || parsed.excerpt || "",
    keywords: parsed.keywords || "prop trading India, funded trading, NSE, BSE, FundedWealth",
  };
}

// ── Admin: manually trigger generation ────────────────────────────────────────
router.post("/generate", requireAdmin, async (req, res) => {
  try {
    const { count = 1, category } = req.body;
    const numArticles = Math.min(Math.max(1, Number(count)), 5);

    let topics: { category: string; topic: string }[];

    if (category) {
      const catTopics = BLOG_TOPICS.find(c => c.category === category);
      if (!catTopics) return res.status(400).json({ error: "Invalid category" });
      topics = catTopics.topics
        .sort(() => Math.random() - 0.5)
        .slice(0, numArticles)
        .map(t => ({ category, topic: t }));
    } else {
      topics = getRandomTopics(numArticles);
    }

    const results: any[] = [];
    const errors: string[] = [];

    for (const { category: cat, topic } of topics) {
      try {
        const article = await generateArticle(topic, cat);

        const [inserted] = await db.insert(blogPosts).values({
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
        }).returning();

        results.push({
          id: inserted.id,
          title: inserted.title,
          slug: inserted.slug,
          category: inserted.category,
        });
      } catch (err: any) {
        errors.push(`Failed to generate "${topic}": ${err.message}`);
      }
    }

    res.json({
      generated: results.length,
      articles: results,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/topics", requireAdmin, async (_req, res) => {
  res.json({
    categories: BLOG_TOPICS.map(c => ({
      name: c.category,
      topicCount: c.topics.length,
    })),
    totalTopics: BLOG_TOPICS.reduce((sum, c) => sum + c.topics.length, 0),
  });
});

export default router;
