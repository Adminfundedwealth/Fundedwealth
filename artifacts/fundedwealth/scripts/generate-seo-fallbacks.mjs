import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const templatePath = path.join(outputDirectory, "index.html");
const siteUrl = "https://www.fundedwealth.com";
const productionApiBaseUrl = "https://fundedwealth-api-production.up.railway.app";
const configuredApiBaseUrl =
  process.env.VITE_API_URL ||
  process.env.VITE_API_BASE_URL ||
  productionApiBaseUrl;
const normalizedApiBaseUrl = configuredApiBaseUrl
  .replace(
    /^(https?:\/\/)api\.fundedwealth11\.com(?=[:/]|$)/i,
    "$1fundedwealth-api-production.up.railway.app",
  )
  .replace(
    /^(https?:\/\/)api\.fundedwealth\.com(?=[:/]|$)/i,
    "$1fundedwealth-api-production.up.railway.app",
  );
const apiBaseUrl = normalizedApiBaseUrl.includes("fundedwealth-api.onrender.com")
  ? productionApiBaseUrl
  : normalizedApiBaseUrl;
const isCheck = process.argv.includes("--check");

const staticPages = [
  {
    path: "",
    title: "Indian Prop Trading & NIFTY Funded Accounts | FundedWealth",
    description:
      "Explore simulated funded account evaluations for Indian traders. Trade NIFTY, BANKNIFTY and SENSEX in a structured prop trading environment with clear risk rules and accounts up to ₹50 Lakhs.",
    heading:
      "Get Funded to Trade Indian Markets — FundedWealth Simulated Prop Trading Evaluations in India",
  },
  {
    path: "leaderboard",
    title: "Prop Trading Leaderboard India [Live Rankings] — Top Funded Traders 2026 | FundedWealth",
    description:
      "Live rankings of India's top-performing funded traders at FundedWealth. See profit, win rate, and payout totals. ₹45L+ paid monthly. Join 15,000+ evaluation participants.",
    heading: "Leaderboard",
  },
  {
    path: "blog",
    title: "Prop Trading Blog India [Free Education] — NIFTY Tips, Risk & Psychology | FundedWealth",
    description:
      "Free trading education for Indian prop traders. Expert tips on NIFTY, BANKNIFTY and index F&O strategies, risk management, technical analysis, and trading psychology from FundedWealth's expert team.",
    heading: "Trading Blog",
  },
  {
    path: "rules",
    title: "Prop Trading Rules India [Complete Guide] — Drawdown, Targets & Evaluation | FundedWealth",
    description:
      "Full evaluation rules for every FundedWealth plan. 2% daily drawdown, no time limit, min 5 trading days. Flash, Instant, 1-Step & 2-Step rules for NIFTY, BANKNIFTY and stock futures — explained in plain language.",
    heading: "Indian Prop Trading & Funded Account Rules",
  },
  {
    path: "payouts",
    title: "Prop Trading Payouts India [Live Proof] — ₹45L+ Paid in Under 12 Hours | FundedWealth",
    description:
      "See real verified payout proofs from FundedWealth traders. Over ₹45 Lakhs in performance-based rewards paid. Eligible rewards typically processed within 12 hours via UPI or bank transfer — subject to verification and program terms.",
    heading: "Verified Payout Proofs",
  },
  {
    path: "scaling",
    title: "Scaling Plan India [Step-by-Step] — Grow Your Funded Account from ₹1L to ₹50L | FundedWealth",
    description:
      "Scale your simulated prop trading account across 6 levels from ₹1 Lakh to ₹50 Lakhs. Profit split grows from 80% to 90% as you advance. No extra fees — automatic scaling for consistent traders. FundedWealth India.",
    heading: "Scaling Plan",
  },
  {
    path: "faq",
    title: "Prop Trading FAQ India [70+ Answers] — Payouts, Rules & Evaluation | FundedWealth",
    description:
      "Answers to 70+ questions about FundedWealth: payouts in 12 hours, 2% daily drawdown, 90% profit split, KYC, taxes, scaling and evaluation rules. Complete FAQ for Indian prop traders.",
    heading: "Prop Trading FAQ India",
  },
  {
    path: "championship",
    title: "Trading Championship India 2026 [Win iPhone, MacBook & Cash Prizes] | FundedWealth",
    description:
      "Join FundedWealth's monthly trading championship. Compete with India's best prop traders and win iPhone 16, MacBook, Royal Enfield and cash prizes. Free entry for all funded traders.",
    heading: "Where Traders Become Champions.",
  },
  {
    path: "success-stories",
    title: "Funded Trader Success Stories India [Real Case Studies] — Profits & Reviews | FundedWealth",
    description:
      "Real case studies from FundedWealth evaluation participants across India — Delhi, Mumbai, Bangalore, Hyderabad & more. See profits earned, strategies used, and honest reviews of India's prop trading platform.",
    heading: "Success Stories",
  },
  {
    path: "about",
    title: "About FundedWealth [India's Prop Trading Platform] — Our Story & Values | FundedWealth",
    description:
      "FundedWealth is India's AI-native prop trading evaluation platform. Learn about our team, mission, and why we built a simulated evaluation platform specifically for Indian traders trading NIFTY and BANKNIFTY.",
    heading: "The AI-first proprietary trading firm Indian traders can finally trust and stay disciplined with.",
  },
  {
    path: "mission",
    title: "FundedWealth Mission — Democratizing Prop Trading for Every Indian Trader | FundedWealth",
    description:
      "FundedWealth's mission: make structured simulated trading evaluations accessible to every serious Indian trader regardless of capital. Discipline, consistency, and skill — not luck — determine who gets funded.",
    heading: "Turning Indian Skill Into Performance-Based Rewards",
  },
  {
    path: "impact",
    title: "FW Impact Initiative — Trade with Purpose | CSR | FundedWealth",
    description:
      "FundedWealth's Impact Initiative supports selected social initiatives across India through FundedWealth and voluntary participant contributions.",
    heading: "Trade with Purpose — Create Real Impact",
  },
  {
    path: "community",
    title: "Prop Trading Community India [15,000+ Traders] — Discussion & Trade Ideas | FundedWealth",
    description:
      "Join India's prop trading community: post trade ideas, discuss NIFTY and BANKNIFTY setups, and connect on WhatsApp, Telegram, YouTube and Instagram. Free for all FundedWealth evaluation participants.",
    heading: "India's Prop Trading Community",
  },
  {
    path: "economic-calendar",
    title: "India Economic Calendar 2026 — RBI & Global Macro Events | FundedWealth",
    description:
      "Free India-first economic calendar for traders. Track RBI announcements, FOMC, CPI, GDP and all high-impact macro events for NSE, BSE & MCX trading in real time.",
    heading: "Zero-maintenance India-first macro schedule",
  },
  {
    path: "terms",
    title: "Terms of Service — FundedWealth | FundedWealth",
    description:
      "Read FundedWealth's Terms of Service. Understand the rules, obligations, and conditions for using our simulated trading evaluation platform.",
    heading: "Terms of Service",
  },
  {
    path: "privacy",
    title: "Privacy Policy — FundedWealth | FundedWealth",
    description:
      "FundedWealth's Privacy Policy. Learn how we collect, use, and protect your personal information.",
    heading: "Privacy Policy",
  },
  {
    path: "refund",
    title: "Refund Policy — FundedWealth | FundedWealth",
    description:
      "FundedWealth's Refund Policy. Understand our refund terms, eligibility criteria, review process, and timelines for simulated trading challenges and evaluation programs.",
    heading: "Refund Policy",
  },
];

async function getPublishedArticlePages() {
  const response = await fetch(`${apiBaseUrl}/api/blog`, {
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) {
    throw new Error(`Could not load published articles for SEO output: HTTP ${response.status}`);
  }

  const posts = await response.json();
  if (!Array.isArray(posts)) {
    throw new Error("Could not load published articles for SEO output: invalid API response.");
  }

  return posts
    .filter((post) => post?.isPublished === true)
    .map((post) => {
      if (typeof post.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.slug)) {
        throw new Error("Could not generate article SEO output: published article has an invalid slug.");
      }
      if (typeof post.title !== "string" || !post.title.trim()) {
        throw new Error(`Could not generate article SEO output for "${post.slug}": missing title.`);
      }

      const title = post.metaTitle?.trim() || post.title.trim();
      const description = post.metaDescription?.trim() || post.excerpt?.trim();
      if (!description) {
        throw new Error(`Could not generate article SEO output for "${post.slug}": missing description.`);
      }

      return {
        path: `blog/${post.slug}`,
        title: /\|\s*FundedWealth\s*$/i.test(title) ? title : `${title} | FundedWealth`,
        description,
        heading: post.title.trim(),
        ogType: "article",
        ogImage: post.ogImage || post.coverImage || `${siteUrl}/opengraph.jpg`,
      };
    });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function replaceExactlyOnce(html, pattern, replacement, label) {
  const globalPattern = new RegExp(pattern.source, `${pattern.flags.replace("g", "")}g`);
  const matches = html.match(globalPattern) ?? [];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${label}; found ${matches.length}.`);
  }
  return html.replace(pattern, () => replacement);
}

function updateMeta(html, attribute, name, content) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `<meta\\b(?=[^>]*\\b${attribute}="${escapedName}")[^>]*>`,
    "i",
  );
  const matches = html.match(new RegExp(pattern.source, "gi")) ?? [];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ${attribute}="${name}" meta tag; found ${matches.length}.`);
  }
  const contentPattern = /\bcontent="[^"]*"/i;
  if (!contentPattern.test(matches[0])) {
    throw new Error(`The ${attribute}="${name}" meta tag has no content attribute.`);
  }
  const updatedTag = matches[0].replace(
    contentPattern,
    `content="${escapeHtml(content)}"`,
  );
  return html.replace(matches[0], updatedTag);
}

function updateLink(html, rel, attribute, value, href) {
  const pattern = new RegExp(
    `<link\\b(?=[^>]*\\brel="${rel}")(?=[^>]*\\b${attribute}="${value}")[^>]*>`,
    "i",
  );
  return replaceExactlyOnce(
    html,
    pattern,
    `<link rel="${rel}" ${attribute}="${value}" href="${href}" />`,
    `${rel} ${attribute}="${value}" link`,
  );
}

function markSeoFallbackTags(html) {
  const managedMetaValues = new Set([
    "description",
    "keywords",
    "author",
    "robots",
    "geo.region",
    "theme-color",
    "mobile-web-app-capable",
    "apple-mobile-web-app-status-bar-style",
    "og:type",
    "og:title",
    "og:description",
    "og:image",
    "og:image:alt",
    "og:site_name",
    "og:locale",
    "og:url",
    "twitter:card",
    "twitter:site",
    "twitter:creator",
    "twitter:title",
    "twitter:description",
    "twitter:image",
    "twitter:image:alt",
  ]);
  const mark = (tag) =>
    tag.replace(/^<(title|meta|link)\b/i, '<$1 data-seo-fallback="true"');

  html = html.replace(/<title\b[^>]*>/i, mark);
  html = html.replace(/<meta\b[^>]*>/gi, (tag) => {
    const name = tag.match(/\b(?:name|property)="([^"]+)"/i)?.[1]?.toLowerCase();
    return name && managedMetaValues.has(name) ? mark(tag) : tag;
  });
  return html.replace(/<link\b[^>]*>/gi, (tag) =>
    /\brel="canonical"/i.test(tag) ? mark(tag) : tag,
  );
}

function renderPage(template, page) {
  const canonicalUrl = `${siteUrl}${page.path ? `/${page.path}/` : ""}`;
  let html = replaceExactlyOnce(
    template,
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(page.title)}</title>`,
    "title element",
  );

  html = updateMeta(html, "name", "description", page.description);
  html = updateMeta(html, "property", "og:title", page.title);
  html = updateMeta(html, "property", "og:description", page.description);
  if (page.ogType) html = updateMeta(html, "property", "og:type", page.ogType);
  if (page.ogImage) html = updateMeta(html, "property", "og:image", page.ogImage);
  html = updateMeta(html, "property", "og:url", canonicalUrl);
  html = updateMeta(html, "name", "twitter:title", page.title);
  html = updateMeta(html, "name", "twitter:description", page.description);
  html = replaceExactlyOnce(
    html,
    /<link\b(?=[^>]*\brel="canonical")[^>]*>/i,
    `<link rel="canonical" href="${canonicalUrl}" />`,
    "canonical link",
  );
  html = updateLink(html, "alternate", "hreflang", "en-IN", canonicalUrl);
  html = updateLink(html, "alternate", "hreflang", "x-default", canonicalUrl);
  html = replaceExactlyOnce(
    html,
    /<h1\b(?=[^>]*\baria-hidden="true")[^>]*>[\s\S]*?<\/h1>/i,
    "",
    "static homepage heading",
  );

  const fallback = [
    '<main class="seo-prerender-fallback" style="min-height:100vh;box-sizing:border-box;padding:3rem 1.5rem;background:#0D0020;color:#fff;font:16px/1.6 Arial,sans-serif">',
    '<div style="max-width:64rem;margin:0 auto">',
    `<h1 style="font-size:2rem;line-height:1.2">${escapeHtml(page.heading)}</h1>`,
    `<p>${escapeHtml(page.description)}</p>`,
    "</div>",
    "</main>",
  ].join("");

  html = replaceExactlyOnce(
    html,
    /<div id="root"><\/div>/i,
    `<div id="root">${fallback}</div>`,
    "empty React root",
  );
  return markSeoFallbackTags(html);
}

function assertPage(html, page) {
  const canonicalUrl = `${siteUrl}${page.path ? `/${page.path}/` : ""}`;
  const requiredMarkup = [
    `<title data-seo-fallback="true">${escapeHtml(page.title)}</title>`,
    `data-seo-fallback="true" rel="canonical" href="${canonicalUrl}"`,
    `hreflang="en-IN" href="${canonicalUrl}"`,
    `hreflang="x-default" href="${canonicalUrl}"`,
    `<h1 style="font-size:2rem;line-height:1.2">${escapeHtml(page.heading)}</h1>`,
    escapeHtml(page.description),
  ];
  const missingMarkup = requiredMarkup.filter((markup) => !html.includes(markup));
  for (const [attribute, name, content] of [
    ["name", "description", page.description],
    ...(page.ogType ? [["property", "og:type", page.ogType]] : []),
    ["property", "og:title", page.title],
    ["property", "og:description", page.description],
    ...(page.ogImage ? [["property", "og:image", page.ogImage]] : []),
    ["property", "og:url", canonicalUrl],
    ["name", "twitter:title", page.title],
    ["name", "twitter:description", page.description],
  ]) {
    const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const tag = html.match(
      new RegExp(`<meta\\b(?=[^>]*\\b${attribute}="${escapedName}")[^>]*>`, "i"),
    )?.[0];
    if (!tag?.includes(`content="${escapeHtml(content)}"`)) {
      missingMarkup.push(`${attribute}="${name}" metadata`);
    }
  }
  if (missingMarkup.length > 0) {
    throw new Error(
      `SEO fallback is missing or stale: ${page.path || "/"}; missing ${missingMarkup.join(", ")}`,
    );
  }
  if (/<h1\b(?=[^>]*\baria-hidden="true")/i.test(html)) {
    throw new Error(`A stale homepage heading remains in the fallback: ${page.path || "/"}`);
  }
}

const template = await readFile(templatePath, "utf8");
const pages = [...staticPages, ...(await getPublishedArticlePages())];
for (const page of pages) {
  const outputPath = page.path
    ? path.join(outputDirectory, page.path, "index.html")
    : templatePath;

  if (isCheck) {
    assertPage(await readFile(outputPath, "utf8"), page);
    continue;
  }

  const output = renderPage(template, page);
  await assertPage(output, page);
  if (page.path) await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, output, "utf8");
}

console.log(
  isCheck
    ? `Verified ${pages.length} SEO route HTML files.`
    : `Generated static SEO fallbacks for ${pages.length} routes.`,
);
