export const dynamic = 'force-dynamic';
// Increase timeout — AI generation can take 15-30s for multiple articles
export const maxDuration = 60;

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuthInHandler } from '@/lib/security/require-auth';

const AI_API_KEY = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
const AI_BASE_URL =
  process.env.AI_INTEGRATIONS_GEMINI_BASE_URL ||
  'https://generativelanguage.googleapis.com';

const CATEGORIES = [
  'Prop Trading Tips', 'Risk Management', 'Trading Psychology',
  'Market Analysis', 'Technical Analysis', 'Education',
];

const TOPIC_POOL: { topic: string; category: string }[] = [
  { topic: 'How to Pass a Prop Trading Evaluation in India', category: 'Prop Trading Tips' },
  { topic: 'Top 5 Risk Management Strategies for Indian Prop Traders', category: 'Risk Management' },
  { topic: 'The Psychology of Disciplined Trading', category: 'Trading Psychology' },
  { topic: 'How to Master Intraday Trading on NSE', category: 'Market Analysis' },
  { topic: 'Understanding Drawdown: The #1 Risk Metric for Funded Traders', category: 'Risk Management' },
  { topic: 'Bank Nifty Expiry Day Trading Strategies', category: 'Technical Analysis' },
  { topic: 'Why 90% of Traders Fail and How to Be the 10%', category: 'Trading Psychology' },
  { topic: 'Position Sizing: The 1.5% Rule Explained', category: 'Risk Management' },
  { topic: 'How to Use RSI and MACD Together for NSE Trading', category: 'Technical Analysis' },
  { topic: 'Scaling a Funded Account from ₹1L to ₹25L', category: 'Prop Trading Tips' },
  { topic: 'Fibonacci Retracement for Indian Stock Markets', category: 'Technical Analysis' },
  { topic: 'Trading Psychology: Overcoming Fear and Greed', category: 'Trading Psychology' },
  { topic: 'How to Build a Consistent Trading Routine', category: 'Prop Trading Tips' },
  { topic: 'Understanding FII and DII Data for NSE Traders', category: 'Market Analysis' },
  { topic: 'Beginner Guide to Futures and Options in India', category: 'Education' },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[₹—–]/g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

async function callGemini(prompt: string): Promise<string> {
  // Use the Gemini REST API directly — no SDK needed
  const url = `${AI_BASE_URL}/v1beta/models/gemini-2.5-flash:generateContent?key=${AI_API_KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 8192 },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err.slice(0, 200)}`);
  }

  const json = await res.json();
  return json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

// ── POST /api/blog/generate ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  if (!AI_API_KEY) {
    return NextResponse.json(
      { error: 'AI_INTEGRATIONS_GEMINI_API_KEY is not set in the admin environment variables' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      topic,
      category = 'Prop Trading Tips',
      count = 1,
      save = true,
      publish = true,
    } = body;

    if (category && !CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Invalid category. Valid: ${CATEGORIES.join(', ')}` }, { status: 400 });
    }

    const numArticles = Math.min(Math.max(1, Number(count)), 5);

    // Build topic list
    const topics: { topic: string; category: string }[] = [];
    if (topic) {
      topics.push({ topic, category });
    } else {
      const shuffled = [...TOPIC_POOL].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numArticles; i++) {
        topics.push(shuffled[i % shuffled.length]);
      }
    }

    const supabase = createAdminClient();
    const results: any[] = [];
    const errors: string[] = [];

    for (const { topic: t, category: cat } of topics) {
      try {
        const prompt = `You are an expert SEO content writer specialising in prop trading and Indian stock markets. Write a detailed, SEO-optimised blog article for FundedWealth, India's #1 prop trading firm.

Topic: "${t}"
Category: ${cat}

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

        const raw = await callGemini(prompt);
        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```\s*$/, '')
          .trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('AI response was not valid JSON');

        const parsed = JSON.parse(jsonMatch[0]);
        const timestamp = Date.now();
        const articleSlug = `${slugify(parsed.title || t)}-${timestamp}`;

        const article = {
          title: parsed.title || t,
          slug: articleSlug,
          excerpt: parsed.excerpt || `Learn about ${t} for Indian prop traders.`,
          content: parsed.content || '',
          category: cat,
          author: 'FundedWealth Team',
          read_time: parsed.readTime || '5 min read',
          meta_title: (parsed.metaTitle || parsed.title || t).slice(0, 60),
          meta_description: parsed.metaDescription || parsed.excerpt || '',
          keywords: parsed.keywords || 'prop trading India, funded trading, NSE, BSE, FundedWealth',
          is_featured: false,
          is_published: publish,
          published_at: publish ? new Date().toISOString() : null,
        };

        if (save || publish) {
          const { data: inserted, error: insertError } = await supabase
            .from('blog_posts')
            .insert(article)
            .select('id, title, slug, category, is_published')
            .single();

          if (insertError) throw new Error(insertError.message);
          results.push(inserted);
        } else {
          // Preview only — do not save
          results.push({ title: article.title, slug: article.slug, category: article.category, preview: true });
        }
      } catch (err: any) {
        errors.push(`"${t}": ${err.message}`);
      }
    }

    return NextResponse.json({
      generated: results.length,
      saved: save || publish,
      articles: results,
      errors: errors.length ? errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
