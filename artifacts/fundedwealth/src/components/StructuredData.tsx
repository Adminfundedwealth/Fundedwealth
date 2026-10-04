import { Helmet } from "react-helmet-async";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "FundedWealth",
  alternateName: ["FundedWealth India", "FW", "Funded Wealth"],
  url: "https://www.fundedwealth.com",
  logo: "https://www.fundedwealth.com/logo.png",
  image: "https://www.fundedwealth.com/opengraph.jpg",
  description: "FundedWealth is a simulated prop trading platform offering structured funded account evaluations for traders in the Indian stock market. Trade NIFTY, BANKNIFTY, SENSEX and selected Indian equities and futures in a defined simulated environment. Eligible participants can earn performance-based rewards under program terms.",
  foundingDate: "2023",
  slogan: "Indian Prop Trading & Funded Accounts",
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
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Prop Trading Plans",
    itemListElement: [
      {
        "@type": "Offer",
        name: "Flash Instant Simulated Account",
        description: "Access a simulated account without a separate evaluation phase, subject to the applicable program terms.",
        priceCurrency: "INR",
        price: "999",
        availability: "https://schema.org/InStock",
        url: "https://www.fundedwealth.com/#plans"
      },
      {
        "@type": "Offer",
        name: "1-Step Evaluation",
        description: "Pass a single evaluation phase with a 10% performance target. Simulated accounts from ₹1L to ₹25L; no live trading capital is provided.",
        priceCurrency: "INR",
        price: "2999",
        availability: "https://schema.org/InStock",
        url: "https://www.fundedwealth.com/#plans"
      },
      {
        "@type": "Offer",
        name: "2-Step Evaluation",
        description: "Two-phase evaluation with low fees. Simulated accounts from ₹5L to ₹25L, with program-based scaling up to ₹50L.",
        priceCurrency: "INR",
        price: "1999",
        availability: "https://schema.org/InStock",
        url: "https://www.fundedwealth.com/#plans"
      }
    ]
  }
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "FundedWealth — Simulated Trading Evaluations in India",
  alternateName: "FundedWealth",
  url: "https://www.fundedwealth.com",
  inLanguage: ["en-IN", "hi-IN"],
  potentialAction: {
    "@type": "SearchAction",
    target: "https://www.fundedwealth.com/blog?q={search_term_string}",
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
        text: "FundedWealth is a simulated prop trading platform offering structured funded account evaluations for traders in the Indian stock market. Trade NIFTY, BANKNIFTY, SENSEX and selected Indian equities and futures in a simulated environment. Eligible participants may qualify for plan-specific performance-based rewards under applicable terms. All trading is simulated and no customer-owned live capital is provided."
      }
    },
    {
      "@type": "Question",
      name: "Is FundedWealth the best prop firm in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth is a simulated prop trading platform offering funded account evaluations in India. Evaluation plans start at ₹999. Eligible participants may qualify for plan-specific performance-based rewards under applicable program terms."
      }
    },
    {
      "@type": "Question",
      name: "How does prop trading work at FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Choose a plan (Flash, Instant, 1-Step, or 2-Step), pass the evaluation by meeting profit targets while staying within drawdown limits, and receive a simulated evaluation account. All trading is simulated, so no real capital is at risk. The platform currently focuses on Indian markets (NIFTY, BANKNIFTY, SENSEX, FINNIFTY, NIFTY 500)."
      }
    },
    {
      "@type": "Question",
      name: "What is the cheapest prop firm in India?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth offers evaluation plans in India. Flash instant simulated accounts start at ₹999, subject to the selected plan terms. Coupon availability may vary."
      }
    },
    {
      "@type": "Question",
      name: "What markets can I trade with FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "FundedWealth offers simulated trading on NSE, BSE and MCX instruments (index F&O and equities). Forex, crypto and global futures are planned for future FundedWealth verticals."
      }
    },
    {
      "@type": "Question",
      name: "How are eligible rewards processed at FundedWealth?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Eligible performance-based reward requests are reviewed and processed under the applicable program terms, verification requirements, and payment-provider timelines. Available payment methods may include bank transfer or UPI."
      }
    },
    {
      "@type": "Question",
      name: "What is the maximum simulated account size?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Through the scaling program, eligible participants may progress from a ₹1 Lakh simulated evaluation account up to ₹50 Lakhs across six levels, subject to the applicable program rules."
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
      name: "Is the evaluation fee refundable?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Evaluation fees are non-refundable on failure. On passing, the original evaluation fee is refunded with your first reward payout, subject to the Refund Policy."
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
        text: "To access a simulated account with FundedWealth: 1) Visit fundedwealth.com, 2) Choose a plan, 3) Pay the evaluation fee, 4) Meet the applicable performance and drawdown criteria, and 5) follow the selected program terms for any eligible performance-based reward. All trading is simulated."
      }
    }
  ]
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  serviceType: "Proprietary Trading / Prop Trading Evaluation",
  name: "FundedWealth Prop Trading",
  provider: {
    "@type": "Organization",
    name: "FundedWealth"
  },
  description: "Simulated prop trading evaluation service for Indian stock market traders. Trade NIFTY, BANKNIFTY, SENSEX and selected equities in a structured funded account evaluation program. Eligible participants can earn performance-based rewards under program terms. All trading is simulated.",
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
      url: "https://www.fundedwealth.com",
    },
    publisher: {
      "@type": "Organization",
      name: "FundedWealth",
      logo: {
        "@type": "ImageObject",
        url: "https://www.fundedwealth.com/logo.png",
      },
      url: "https://www.fundedwealth.com",
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

// ── HowTo schema — used on /how-it-works ─────────────────────────────────────
const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Get a Funded Trading Account in India",
  description:
    "Step-by-step guide to getting a simulated funded trading account with FundedWealth — from choosing a plan to receiving performance-based rewards.",
  totalTime: "PT10M",
  estimatedCost: {
    "@type": "MonetaryAmount",
    currency: "INR",
    value: "999",
  },
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Choose an Evaluation Plan",
      text: "Select from Flash (₹999), Instant, 1-Step or 2-Step evaluation plans based on your trading style and timeline.",
      url: "https://www.fundedwealth.com/how-it-works#step-1",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Pass the Simulated Evaluation",
      text: "Trade on a simulated account using live NSE/BSE price data. Hit the profit target while staying within the 2% daily and 4–8% maximum drawdown limits.",
      url: "https://www.fundedwealth.com/how-it-works#step-2",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Receive Your Funded Simulated Account",
      text: "After passing and completing compliance review, receive access to a funded simulated account up to ₹50 Lakhs.",
      url: "https://www.fundedwealth.com/how-it-works#step-3",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Trade and Earn Performance-Based Rewards",
      text: "Trade within risk limits and earn up to 90% of eligible profits, processed every 7 days via UPI or bank transfer.",
      url: "https://www.fundedwealth.com/how-it-works#step-4",
    },
  ],
};

export function HowToSchema() {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(howToSchema)}
      </script>
    </Helmet>
  );
}
