import { Helmet } from "react-helmet-async";

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: string;
  noindex?: boolean;
}

const SITE_NAME = "FundedWealth";
const DEFAULT_TITLE = "FundedWealth — Simulated Prop Trading Evaluations in India | Accounts up to ₹50 Lakhs";
const DEFAULT_DESCRIPTION =
  "Practice on a simulated evaluation platform built around NSE, BSE and MCX instruments. No real capital is at risk because all trading is simulated. Eligible participants can earn performance-based rewards, typically processed within 12 hours for approved requests. Join 15,000+ evaluation participants. Fees starting ₹999.";
const DEFAULT_KEYWORDS =
  "prop trading India, best prop firm India, funded trading account India, prop firm India, funded trader India, NSE prop trading, BSE prop trading, MCX prop trading, forex prop trading India, crypto prop trading India, proprietary trading India, funded account India, FundedWealth, get funded trading, best prop trading firm India, prop trading company India, instant funded account India, prop firm for Indian traders, cheapest prop firm India, top prop firm India, trading evaluation India, prop trading challenge India, funded forex account India, best proprietary trading firm India, prop trading firms in India, Indian prop firm, prop trading platform India, 90 profit split prop firm, instant funding prop firm India, lowest drawdown prop firm";
const BASE_URL = "https://fundedwealth.com";
const DEFAULT_OG_IMAGE = `${BASE_URL}/opengraph.jpg`;
const DEFAULT_OG_IMAGE_ALT = "FundedWealth — India's #1 Prop Trading Firm";

export default function SEOHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  ogType = "website",
  noindex = false,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const canonicalUrl = canonical ? `${BASE_URL}${canonical}` : undefined;
  const robotsContent = noindex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="author" content="FundedWealth" />
      <meta name="robots" content={robotsContent} />
      <meta name="geo.region" content="IN" />
      <meta name="theme-color" content="#1A0030" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

      {/* Canonical — only emitted when a path is explicitly provided */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_IN" />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@fundedwealth" />
      <meta name="twitter:creator" content="@fundedwealth" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
    </Helmet>
  );
}
