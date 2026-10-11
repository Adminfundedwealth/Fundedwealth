import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputDirectory = path.join(projectRoot, "dist");
const templatePath = path.join(outputDirectory, "index.html");
const siteUrl = "https://www.fundedwealth.com";
const isCheck = process.argv.includes("--check");

const pages = [
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
];

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

function renderPage(template, page) {
  const canonicalUrl = `${siteUrl}${page.path ? `/${page.path}` : ""}`;
  let html = replaceExactlyOnce(
    template,
    /<title\b[^>]*>[\s\S]*?<\/title>/i,
    `<title>${escapeHtml(page.title)}</title>`,
    "title element",
  );

  html = updateMeta(html, "name", "description", page.description);
  html = updateMeta(html, "property", "og:title", page.title);
  html = updateMeta(html, "property", "og:description", page.description);
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

  return replaceExactlyOnce(
    html,
    /<div id="root"><\/div>/i,
    `<div id="root">${fallback}</div>`,
    "empty React root",
  );
}

function assertPage(html, page) {
  const canonicalUrl = `${siteUrl}${page.path ? `/${page.path}` : ""}`;
  const requiredMarkup = [
    `<title>${escapeHtml(page.title)}</title>`,
    `rel="canonical" href="${canonicalUrl}"`,
    `hreflang="en-IN" href="${canonicalUrl}"`,
    `hreflang="x-default" href="${canonicalUrl}"`,
    `<h1 style="font-size:2rem;line-height:1.2">${escapeHtml(page.heading)}</h1>`,
    escapeHtml(page.description),
  ];
  const missingMarkup = requiredMarkup.filter((markup) => !html.includes(markup));
  for (const [attribute, name, content] of [
    ["name", "description", page.description],
    ["property", "og:title", page.title],
    ["property", "og:description", page.description],
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
