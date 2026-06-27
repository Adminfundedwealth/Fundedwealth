import { Helmet } from "react-helmet-async";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  name: "FundedWealth",
  alternateName: ["FundedWealth India", "FW", "Funded Wealth"],
  url: "https://fundedwealth.com",
  logo: "https://fundedwealth.com/logo.png",
  image: "https://fundedwealth.com/opengraph.jpg",
  description: "FundedWealth is India's #1 best prop trading firm. Get funded trading accounts up to ₹50 Lakhs. Trade NSE, BSE, MCX, Forex & Crypto. Keep 70-90% profits with 12-hour guaranteed payouts.",
  foundingDate: "2023",
  slogan: "India's #1 Prop Trading Firm — Trade Smarter, Get Funded",
  priceRange: "₹999 - ₹49,999",
  currenciesAccepted: "INR, USDT, BTC, ETH",
  paymentAccepted: "UPI, Credit Card, Debit Card, Net Banking, Crypto",
  sameAs: [
    "https://www.instagram.com/fundedwealthind?igsh=MWE1ajVibG9sNGtyNw==",
    "https://twitter.com/fundedwealth",
    "https://x.com/fundedwealth",
    "https://t.me/fundedwealthind",
    "https://www.youtube.com/@fundedwealth"
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@fundedwealth.com",
      availableLanguage: ["English", "Hindi"],
      areaServed: "IN"
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "fundedwealth.ind@gmail.com",
      availableLanguage: ["English", "Hindi"],
      areaServed: "IN"
    }
  ],
  areaServed: {
    "@type": "Country",
    name: "India"
  },
  address: {
    "@type": "PostalAddress",
    addressCountry: "IN"
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "2450",
    bestRating: "5",
    worstRating: "1"
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Prop Trading Plans",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Flash Instant Funded Account",
        description: "Get instantly funded with no evaluation. Trade immediately with up to ₹10L capital.",
        priceCurrency: "INR",
        price: "999",
        availability: "https://schema.org/InStock",
        url: "https://fundedwealth.com/#plans"
      },
      {
        "@type": "Offer",
        name: "1-Step Evaluation",
        description: "Pass a single evaluation phase with 10% profit target. Funded accounts from ₹1L to ₹25L.",
        priceCurrency: "INR",
        price: "2999",
        availability: "https://schema.org/InStock",
        url: "https://fundedwealth.com/#plans"
      },
      {
        "@type": "Offer",
        name: "2-Step Evaluation",
        description: "Two-phase evaluation with lowest fees. Funded accounts from ₹5L to ₹25L. Scale up to ₹50L.",
        priceCurrency: "INR",
        price: "1999",
        availability: "https://schema.org/InStock",
        url: "https://fundedwealth.com/#plans"
      }
    ]
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FundedWealth — India's Best Prop Trading Firm",
  alternateName: "FundedWealth",
  url: "https://fundedwealth.com",
  inLanguage: ["en-IN", "hi-IN"],
  potentialAction: {
    "@type": "SearchAction",
    target: "https://fundedwealth.com/blog?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth is India's #1 best prop trading firm that provides funded trading accounts up to ₹50 Lakhs. Traders keep 70-90% of their profits with 12-hour guaranteed payouts. We support NSE, BSE, MCX, Forex, and Crypto trading."
      }
    },
    {
      "@type": "Question",
      name: "Is FundedWealth the best prop firm in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, FundedWealth is recognized as India's #1 prop trading firm with 15,000+ funded traders, ₹45 Lakhs+ in monthly payouts, 12-hour guaranteed payout delivery, up to 90% profit split, and the lowest evaluation fees starting at just ₹999. We are 100% dedicated to Indian traders."
      }
    },
    {
      "@type": "Question",
      name: "How does prop trading work at FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Choose a plan (Flash, Instant, 1-Step, or 2-Step), pass the evaluation by meeting profit targets while staying within drawdown limits, and get funded with real capital. Trade NSE, BSE, MCX, Forex & Crypto with zero risk to your own money."
      }
    },
    {
      "@type": "Question",
      name: "What is the cheapest prop firm in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth offers the most affordable prop trading plans in India. Flash instant funded accounts start at just ₹999, making it the cheapest way to start prop trading in India. We also offer regular coupon codes for additional discounts."
      }
    },
    {
      "@type": "Question",
      name: "What markets can I trade with FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth supports trading on NSE (National Stock Exchange), BSE (Bombay Stock Exchange), MCX (Multi Commodity Exchange), international Forex pairs, and Cryptocurrency markets — giving Indian traders access to all major instruments."
      }
    },
    {
      "@type": "Question",
      name: "How fast are payouts at FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth guarantees payouts within 12 hours — the fastest payout guarantee among Indian prop trading firms. We support bank transfer, UPI, and crypto payouts."
      }
    },
    {
      "@type": "Question",
      name: "What is the maximum funded account size?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Through our scaling program, traders can scale from ₹1 Lakh up to ₹50 Lakhs in funded capital across 6 levels. Start with a ₹1L Flash account and grow to ₹50L."
      }
    },
    {
      "@type": "Question",
      name: "What is the profit split at FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth offers up to 90% profit split — one of the highest in the Indian prop trading industry. Most plans start at 70% and can scale to 90% through our scaling program."
      }
    },
    {
      "@type": "Question",
      name: "Is there a money-back guarantee?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, FundedWealth offers a 100% money-back guarantee. Your evaluation fee is fully refundable once you become a funded trader."
      }
    },
    {
      "@type": "Question",
      name: "Which trading platforms does FundedWealth support?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth IND uses our in-house FundedWealth Terminal connected to real NSE & BSE price feeds. Advanced charting, technical analysis, and sub-100ms execution — built for Indian markets."
      }
    },
    {
      "@type": "Question",
      name: "What are the drawdown rules at FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth has clear and fair drawdown rules: 2% daily drawdown limit and 4% maximum drawdown limit across all account sizes. For a ₹10L account, daily losses must stay under ₹20,000 and total losses under ₹40,000."
      }
    },
    {
      "@type": "Question",
      name: "Can I trade Forex and Crypto at an Indian prop firm?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth IND currently focuses on Indian Index F&O (NIFTY, BANKNIFTY, SENSEX, FINNIFTY) and Equities (NIFTY 500 + Stock Futures) on real NSE/BSE feeds. Forex, Crypto, and Global Futures are coming soon as separate FundedWealth verticals."
      }
    },
    {
      "@type": "Question",
      name: "How to become a funded trader in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To become a funded trader in India: 1) Visit fundedwealth.com, 2) Choose a plan (Flash for instant funding or 1-Step/2-Step for evaluation), 3) Pay the evaluation fee (starting ₹999), 4) Meet profit targets within drawdown limits, 5) Get funded and keep 70-90% of profits."
      }
    }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Proprietary Trading / Prop Trading Evaluation",
  name: "FundedWealth Prop Trading",
  provider: {
    "@type": "Organization",
    name: "FundedWealth"
  },
  description: "India's best prop trading evaluation and funded trading account service. Get funded up to ₹50 Lakhs to trade NSE, BSE, MCX, Forex & Crypto.",
  areaServed: { "@type": "Country", name: "India" },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Trading Plans",
    itemListElement: [
      { "@type": "Offer", name: "Flash Plan", price: "999", priceCurrency: "INR" },
      { "@type": "Offer", name: "Instant Plan", price: "2999", priceCurrency: "INR" },
      { "@type": "Offer", name: "1-Step Evaluation", price: "2999", priceCurrency: "INR" },
      { "@type": "Offer", name: "2-Step Evaluation", price: "1999", priceCurrency: "INR" }
    ]
  }
};

const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url
  }))
});

export function OrganizationSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
    </Helmet>
  );
}

export function WebsiteSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
    </Helmet>
  );
}

export function FAQSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}

export function ServiceSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(serviceSchema)}
      </script>
    </Helmet>
  );
}

export function BreadcrumbSchema({ items }: { items: { name: string; url: string }[] }) {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema(items))}
      </script>
    </Helmet>
  );
}

// ── Article / BlogPosting schema ──────────────────────────────────────────────
interface ArticleSchemaProps {
  headline: string;
  description: string;
  author: string;
  datePublished: string;
  dateModified: string;
  image: string;
  url: string;
  keywords?: string;
}

export function ArticleSchema({
  headline,
  description,
  author,
  datePublished,
  dateModified,
  image,
  url,
  keywords,
}: ArticleSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description,
    image,
    url,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: author,
      url: "https://fundedwealth.com",
    },
    publisher: {
      "@type": "Organization",
      name: "FundedWealth",
      logo: {
        "@type": "ImageObject",
        url: "https://fundedwealth.com/logo.png",
      },
      url: "https://fundedwealth.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    inLanguage: "en-IN",
    ...(keywords ? { keywords } : {}),
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
}
