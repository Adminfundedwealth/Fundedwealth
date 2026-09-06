import express from 'express';
import { generateRobotsTxt, generateSitemapXml } from '../lib/seo';
import { generalLimiter } from '../lib/rate-limit';
import { db } from '@workspace/db';
import { blogPosts } from '@workspace/db';
import { eq, desc } from 'drizzle-orm';

const router = express.Router();

const STATIC_PAGES = [
  { path: '/',                 changefreq: 'daily',   priority: 1.0 },
  { path: '/leaderboard',      changefreq: 'daily',   priority: 0.9 },
  { path: '/payouts',          changefreq: 'daily',   priority: 0.9 },
  { path: '/blog',             changefreq: 'daily',   priority: 0.9 },
  { path: '/championship',     changefreq: 'weekly',  priority: 0.9 },
  { path: '/scaling',          changefreq: 'weekly',  priority: 0.9 },
  { path: '/faq',              changefreq: 'weekly',  priority: 0.8 },
  { path: '/rules',            changefreq: 'weekly',  priority: 0.8 },
  { path: '/community',        changefreq: 'weekly',  priority: 0.8 },
  { path: '/success-stories',  changefreq: 'weekly',  priority: 0.8 },
  { path: '/economic-calendar',changefreq: 'daily',   priority: 0.7 },
  { path: '/impact',           changefreq: 'monthly', priority: 0.7 },
  { path: '/about',            changefreq: 'monthly', priority: 0.6 },
  { path: '/terms',            changefreq: 'monthly', priority: 0.4 },
  { path: '/privacy',          changefreq: 'monthly', priority: 0.4 },
  { path: '/refund',           changefreq: 'monthly', priority: 0.4 },
];

function safeHost(req: express.Request): string {
  const configured = process.env.CANONICAL_HOST || 'https://www.fundedwealth.com';
  const raw = configured || req.get('host') || 'localhost';
  const cleaned = String(raw).replace(/[^a-zA-Z0-9.:-]/g, '');
  if (configured.startsWith('http')) return configured.replace(/\/$/, '');
  if (cleaned.startsWith('http')) return cleaned.replace(/\/$/, '');
  return `${req.protocol}://${cleaned}`;
}

router.get('/robots.txt', generalLimiter, (req, res) => {
  const host = safeHost(req);
  res.set('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.type('text/plain').send(generateRobotsTxt(host));
});

// Dynamic sitemap — includes all static pages + every published blog article
router.get('/sitemap.xml', generalLimiter, async (req, res) => {
  const host = safeHost(req);
  const now = new Date().toISOString();

  // Static page entries
  const entries: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[] = STATIC_PAGES.map(p => ({
    loc: `${host}${p.path}`,
    lastmod: now,
    changefreq: p.changefreq,
    priority: p.priority,
  }));

  // Dynamic blog post entries from DB
  try {
    const posts = await db
      .select({
        slug: blogPosts.slug,
        updatedAt: blogPosts.updatedAt,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.isPublished, true))
      .orderBy(desc(blogPosts.publishedAt));

    for (const post of posts) {
      entries.push({
        loc: `${host}/blog/${post.slug}`,
        lastmod: (post.publishedAt ?? post.updatedAt).toISOString(),
        changefreq: 'weekly',
        priority: 0.7,
      });
    }
  } catch (_err) {
    // DB unavailable — serve static entries only, don't crash
  }

  res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.type('application/xml').send(generateSitemapXml(entries));
});

export default router;
