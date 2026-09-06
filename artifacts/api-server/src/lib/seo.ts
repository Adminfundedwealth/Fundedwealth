import fs from 'fs';
import path from 'path';

const PRIVATE_PATHS = [
  '/dashboard',
  '/dashboard/',
  '/sign-in',
  '/sign-up',
  '/login',
  '/register',
  '/checkout',
  '/payment-pending',
  '/purchase-success',
  '/kyc',
  '/auth/',
  '/sso-callback',
  '/reset-password',
  '/ref/',
  '/admin',
];

export function generateRobotsTxt(hostname: string) {
  const host = hostname.replace(/\/$/, '');
  const disallowLines = PRIVATE_PATHS.map(path => `Disallow: ${path}`).join('\n');

  return [
    'User-agent: *',
    'Allow: /',
    '',
    '# Private / auth / account / checkout pages',
    disallowLines,
    '',
    'User-agent: Googlebot',
    'Allow: /',
    disallowLines,
    '',
    'User-agent: Bingbot',
    'Allow: /',
    disallowLines,
    'Crawl-delay: 1',
    '',
    `Sitemap: ${host}/sitemap.xml`,
    '',
  ].join('\n');
}

export function generateSitemapXml(entries: { loc: string; lastmod?: string; changefreq?: string; priority?: number }[]) {
  const urls = entries.map(e => `  <url>\n    <loc>${e.loc}</loc>\n    ${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}\n    ${e.changefreq ? `<changefreq>${e.changefreq}</changefreq>` : ''}\n    ${e.priority ? `<priority>${e.priority}</priority>` : ''}\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

export function jsonLdForPage(params: { title: string; description: string; url: string; image?: string; type?: string }) {
  const graph: any = {
    '@context': 'https://schema.org',
    '@type': params.type || 'WebPage',
    'headline': params.title,
    'description': params.description,
    'url': params.url,
  };
  if (params.image) graph.image = params.image;
  return JSON.stringify(graph, null, 2);
}
