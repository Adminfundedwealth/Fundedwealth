# SEO AUDIT — fundedwealth.com

**Date:** June 21, 2026  
**Method:** Real HTTP fetch + Playwright DOM inspection

---

## robots.txt — WORKING ✅

```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /admin
Disallow: /sign-in
Disallow: /sign-up
Disallow: /login

User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

Sitemap: https://fundedwealth.com/sitemap.xml
```

**Status: WORKING** — Properly configured, disallows private routes, includes sitemap reference.

---

## sitemap.xml — WORKING ✅

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://fundedwealth.com/</loc>
    <lastmod>2026-06-05</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://fundedwealth.com/championship</loc>
    <lastmod>2026-06-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <!-- More entries... -->
</urlset>
```

**Status: WORKING** — Valid XML, recent lastmod dates, proper priority values.

---

## Page Title — WORKING ✅

```
FundedWealth — India's #1 Best Prop Trading Firm | Get Funded Up to ₹50 Lakhs
```

Present and descriptive. Could be shorter for SERP display (currently 78 chars, recommend < 60).

---

## Meta Description — BROKEN ❌

**Value:** `null` (not found in DOM)

No `<meta name="description" content="...">` tag found on the home page. This is critical for SEO.

---

## Open Graph Tags — BROKEN ❌

| Tag | Value |
|-----|-------|
| og:title | `null` |
| og:description | Not checked (absent) |
| og:image | `null` |
| og:url | Not checked (absent) |
| og:type | Not checked (absent) |

Social sharing will show no preview image or description.

---

## Canonical Tag — BROKEN ❌

**Value:** `null`

No `<link rel="canonical">` found. The site serves from both `fundedwealth.com` and `www.fundedwealth.com`, creating potential duplicate content without canonical.

---

## Structured Data — WORKING ✅

Found **4 LD+JSON blocks** on the home page:
1. Organization schema
2. Website schema
3. FAQ schema
4. Service schema

Properly formatted, good for rich snippets.

---

## Google Analytics — WORKING ✅

- Tracking ID: `G-2JC3K2H68Y`
- GTM integration confirmed via network requests
- Sends page_view and scroll events

---

## URL Structure — WORKING ✅

- Clean URLs: `/about`, `/blog`, `/checkout`
- No query parameter pollution
- Proper redirects: `fundedwealth.com` → `www.fundedwealth.com`

---

## Performance Concerns for SEO

1. **SPA rendering** — This is a client-side React app. Google can render JavaScript but:
   - First paint shows "Loading..." text
   - Content is not server-side rendered
   - No `<meta name="robots">` directives for crawlers
   
2. **Missing SSR/prerendering** — Blog pages, product pages would benefit from prerendering for crawlers

---

## Summary

| Feature | Status |
|---------|--------|
| robots.txt | ✅ WORKING |
| sitemap.xml | ✅ WORKING |
| Page Title | ✅ WORKING |
| Meta Description | ❌ BROKEN (missing) |
| OG Title | ❌ BROKEN (missing) |
| OG Image | ❌ BROKEN (missing) |
| Canonical | ❌ BROKEN (missing) |
| Structured Data | ✅ WORKING (4 schemas) |
| Google Analytics | ✅ WORKING |
| Clean URLs | ✅ WORKING |
| SSR/Prerendering | ❌ NOT IMPLEMENTED |

**SEO Score: 5/10** — Foundation exists (robots, sitemap, structured data) but critical meta tags are absent, no OG tags for social, no canonical for deduplication, and no SSR for crawler friendliness.
