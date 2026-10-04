import React, { useMemo, useState } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { FAQSchema, BreadcrumbSchema } from "@/components/StructuredData";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  ChevronDown,
  HelpCircle,
  MessageCircle,
  Users,
  Sparkles,
  Filter,
} from "lucide-react";

type Faq = {
  q: string;
  a: string;
  cat: string;
};

const CATEGORIES = [
  "All",
  "About",
  "Accounts",
  "Assessment",
  "Billing",
  "Funded Account",
  "Payouts",
  "Platform",
  "Rules",
  "Scaling",
  "Support",
  "Tax & Compliance",
  "Trading",
] as const;

const FAQS: Faq[] = [
  // ---------------- About ----------------
  {
    cat: "About",
    q: "What is FundedWealth?",
    a: "FundedWealth is India's prop trading firm built exclusively for Indian markets. We provide simulated funded capital up to ₹50 lakh so traders can scale their skills on NIFTY, BANKNIFTY, SENSEX, FINNIFTY, NIFTY 500 stocks and stock F&O — without risking their personal savings.",
  },
  {
    cat: "About",
    q: "How does FundedWealth work?",
    a: "Pick a program (Flash, Instant, 1-Step or 2-Step), prove you can hit the profit target while staying inside the daily and overall loss limits, and we activate a funded simulated account. From there you trade your strategy and we share the profits with you — up to 90%.",
  },
  {
    cat: "About",
    q: "Why choose FundedWealth over other prop firms?",
    a: "Three reasons: we operate entirely on Indian instruments (rupee P&L, IST sessions, NSE/BSE feeds), eligible rewards are typically processed within 12 hours of approval to your Indian bank account (subject to verification and payment-provider timelines), and our rulebook is short, plain-English and published in full on our Rules page — no hidden disqualifications.",
  },
  {
    cat: "About",
    q: "Who is FundedWealth meant for?",
    a: "Serious retail traders who already have an edge on Indian markets but lack the capital to size up safely. We are not a course, signal group or copy-trading service — you bring the strategy, we bring the simulated capital and infrastructure.",
  },
  {
    cat: "About",
    q: "Where is FundedWealth headquartered?",
    a: "FundedWealth is built and operated from India for Indian traders. Our support, payments and onboarding are all rupee-native and IST-aligned.",
  },

  // ---------------- Accounts ----------------
  {
    cat: "Accounts",
    q: "What account sizes are available?",
    a: "Starting accounts range from ₹1 lakh up to ₹50 lakh of simulated capital. Through the scaling plan, consistent traders can grow to ₹1.6 crore over time.",
  },
  {
    cat: "Accounts",
    q: "Can I have multiple accounts at once?",
    a: "Yes. You can run up to 3 active funded accounts in parallel, plus any number of evaluation accounts. We only ask that you do not copy-trade between FundedWealth accounts.",
  },
  {
    cat: "Accounts",
    q: "Can I switch between programs?",
    a: "Yes. You can purchase a new evaluation under a different program at any time. Existing funded accounts continue running under their original rule set until you close them or breach.",
  },
  {
    cat: "Accounts",
    q: "How do I activate my account?",
    a: "After payment your dashboard auto-provisions credentials within minutes. You will receive your trading login over email and inside the dashboard simultaneously.",
  },
  {
    cat: "Accounts",
    q: "Can I close my account whenever I want?",
    a: "Of course. Closing is one click inside Dashboard → Settings. Any pending payout balance is processed before the account is archived.",
  },

  // ---------------- Assessment ----------------
  {
    cat: "Assessment",
    q: "What assessment types do you offer?",
    a: "Four: Flash Funding (24-hour skills test), Instant Funding (start trading immediately, no profit target), 1-Step Evaluation (one 10% profit objective) and 2-Step Evaluation (8% then 5% across two phases).",
  },
  {
    cat: "Assessment",
    q: "What are the 1-Step Assessment rules?",
    a: "Hit a 10% profit target with a 3% daily loss limit and 6% overall drawdown. Minimum 5 trading days, unlimited time. No overnight positions, no option writing, no hedging.",
  },
  {
    cat: "Assessment",
    q: "What are the 2-Step Assessment rules?",
    a: "Phase 1 requires 8% profit, Phase 2 requires 5%. Both phases share the 3% daily loss limit and 8% overall drawdown. Minimum 5 trading days per phase, unlimited time.",
  },
  {
    cat: "Assessment",
    q: "Is there a time limit to clear the evaluation?",
    a: "No. All evaluation phases have unlimited duration. Take the time you need to trade your edge — there is no countdown forcing you to overtrade.",
  },
  {
    cat: "Assessment",
    q: "What is the minimum trading days requirement?",
    a: "5 trading days per phase. A trading day counts only if you place at least one trade with a meaningful position size — to ensure the evaluation reflects real engagement.",
  },
  {
    cat: "Assessment",
    q: "Can I retry if I fail the evaluation?",
    a: "Yes. You can purchase a fresh evaluation any time. We also offer a discounted retake voucher inside your dashboard for traders who came close but did not pass.",
  },
  {
    cat: "Assessment",
    q: "How do I move from Phase 1 to Phase 2?",
    a: "Hitting the Phase 1 profit target without breaching any limit auto-promotes you. You receive an email and dashboard alert, and your Phase 2 account credentials are issued within a few hours.",
  },
  {
    cat: "Assessment",
    q: "Why are there 2 phases in the 2-Step Evaluation?",
    a: "The two-phase design separates raw performance (Phase 1: 8%) from sustained discipline (Phase 2: 5%). It is the most common industry standard and rewards traders who can repeat their edge, not just have a hot streak.",
  },
  {
    cat: "Assessment",
    q: "Is the evaluation account real or simulated?",
    a: "Simulated. All evaluations and account balances run inside our structured environment using market data. Any eligible performance-based reward is paid in INR under the applicable program terms; it is not a withdrawal of a live trading account balance.",
  },
  {
    cat: "Assessment",
    q: "How is my evaluation performance verified?",
    a: "Every trade, P&L tick and rule check is logged in real time on our risk engine. Once you meet the applicable evaluation criteria, the results are subject to compliance review and any next-stage simulated access is issued only after approval under the program terms.",
  },

  // ---------------- Funded Account ----------------
  {
    cat: "Funded Account",
    q: "How do I get my funded account activated?",
    a: "After clearing the final phase, your results are subject to compliance review. Once approved, simulated-account access credentials may be issued by email and inside the dashboard under the applicable program terms.",
  },
  {
    cat: "Funded Account",
    q: "What is the starting balance of my funded account?",
    a: "The displayed simulated balance corresponds to the account size selected for the program — for example, a ₹10 lakh evaluation may provide a ₹10 lakh simulated balance. It is not customer-owned or live trading capital, and any reset follows the applicable program terms.",
  },
  {
    cat: "Funded Account",
    q: "Do the same rules apply to funded accounts?",
    a: "Mostly yes — the daily loss limit, overall drawdown and product restrictions stay. The profit target, however, is removed: you only need to stay inside the limits and produce profits to earn payouts.",
  },
  {
    cat: "Funded Account",
    q: "When does the profit split start for funded accounts?",
    a: "From your very first profitable trade. There is no probation period. Eligible profits accumulate to the next payout window.",
  },
  {
    cat: "Funded Account",
    q: "Do I need to trade a minimum number of days on funded accounts?",
    a: "Yes — at least 5 trading days within a payout cycle to qualify for that cycle's payout. This keeps the funded book active and risk-balanced.",
  },
  {
    cat: "Funded Account",
    q: "Can my funded account be suspended or closed?",
    a: "Only if you breach the daily loss, overall drawdown or a critical rule (option writing, hedging, prohibited strategies). Closure is automatic and the dashboard shows the exact breach event with timestamps.",
  },
  {
    cat: "Funded Account",
    q: "How is risk exposure monitored on funded accounts?",
    a: "Our risk engine ticks live on every order and P&L update. The dashboard shows your remaining daily loss, drawdown buffer and position concentration at all times so you know exactly where you stand.",
  },
  {
    cat: "Funded Account",
    q: "Can I upgrade my funded account size without scaling?",
    a: "Yes — you can purchase additional evaluations of larger sizes at any time and run them in parallel. Scaling is automatic and free; manual upgrades are optional for traders who want to move faster.",
  },
  {
    cat: "Funded Account",
    q: "How do trading cycles work on funded accounts?",
    a: "Each payout cycle is 7 days. At the end of a cycle, eligible profits are paid out under the applicable program terms and the cycle resets. You can submit a reward request from your dashboard once per cycle if you have crossed the minimum payout amount.",
  },

  // ---------------- Payouts ----------------
  {
    cat: "Payouts",
    q: "What is the profit split?",
    a: "Up to 90%. Flash starts at 80%, Instant at 70-80%, and 1-Step / 2-Step funded accounts begin at 80% and step up to 90% as you scale.",
  },
  {
    cat: "Payouts",
    q: "When can I request my first payout?",
    a: "The first reward request is available only after the selected program's waiting period, trading-day, performance, verification, and other eligibility conditions are met. The activity and balance are simulated.",
  },
  {
    cat: "Payouts",
    q: "How often can I withdraw profits?",
    a: "Eligible rewards can be requested every 7 days under the applicable program terms, provided you have met the minimum payout threshold and completed the required trading days within that cycle.",
  },
  {
    cat: "Payouts",
    q: "What is the minimum payout amount?",
    a: "₹2,500. Below this we roll the balance into the next cycle to keep banking fees efficient.",
  },
  {
    cat: "Payouts",
    q: "How long do payouts take to process?",
    a: "Once approved, eligible rewards are typically processed to your verified Indian bank account within 12 hours, subject to verification and payment-provider timelines. We publish exact timestamps on our public Payouts page.",
  },
  {
    cat: "Payouts",
    q: "What payout methods do you support?",
    a: "Direct INR bank transfer (NEFT / IMPS / RTGS) to any verified Indian bank account. UPI is supported for amounts under ₹1 lakh per cycle. International wires are not currently offered — we serve Indian residents only.",
  },
  {
    cat: "Payouts",
    q: "Are payouts guaranteed?",
    a: "Eligible approved rewards are typically processed within 12 hours, subject to verification and applicable program requirements. FundedWealth aims for fast processing but payout timing depends on compliance review and payment provider availability.",
  },

  // ---------------- Platform ----------------
  {
    cat: "Platform",
    q: "Is the trading platform available 24/7?",
    a: "The dashboard, analytics and reporting tools are available 24/7. Live trading is open during NSE market hours: 9:15 AM – 3:30 PM IST on trading days.",
  },
  {
    cat: "Platform",
    q: "Can I trade on mobile devices?",
    a: "Yes. The dashboard is fully responsive and our mobile app (Android & iOS) lets you place orders, monitor risk and request payouts on the go.",
  },
  {
    cat: "Platform",
    q: "What features does the trading platform include?",
    a: "Live order routing, real-time NSE/BSE feeds, multi-chart layouts, advanced order types, integrated risk meter, P&L analytics, trade journal and one-click payout requests.",
  },
  {
    cat: "Platform",
    q: "What order types are supported?",
    a: "Market, Limit, Stop, Stop-Limit, Bracket, Cover and Iceberg orders — same coverage you expect from a top-tier Indian retail broker.",
  },
  {
    cat: "Platform",
    q: "What is the difference between Market and Limit order slippage?",
    a: "Market orders execute at the best available price and may slip in fast markets. Limit orders execute only at your chosen price or better, but may not fill at all. We log both fill price and theoretical price for transparency.",
  },
  {
    cat: "Platform",
    q: "Do I need special software to access the platform?",
    a: "No. Everything runs in your browser. We also support MT5 and our in-house FundedWealth Trading Terminal as optional desktop apps.",
  },
  {
    cat: "Platform",
    q: "How fast is order execution?",
    a: "Median order acknowledgement is under 50 ms inside Indian market hours. Our matching engine is co-located with NSE for minimum latency.",
  },
  {
    cat: "Platform",
    q: "What charting and analysis tools are available?",
    a: "Multi-timeframe candlestick / Heikin-Ashi / Renko charts, 80+ indicators, drawing tools, market profile and option chain analytics — built in, no third-party subscription needed.",
  },
  {
    cat: "Platform",
    q: "How often is the platform updated?",
    a: "We push updates every two weeks. Major features (new instruments, dashboard sections) ship monthly. Release notes are published inside the dashboard.",
  },
  {
    cat: "Platform",
    q: "How secure is the trading platform?",
    a: "TLS 1.3 in transit, AES-256 at rest, mandatory 2FA on payouts, isolated risk engine and regular external security audits. Funds and personal data are stored separately with bank-grade controls.",
  },

  // ---------------- Rules ----------------
  {
    cat: "Rules",
    q: "How is daily drawdown calculated?",
    a: "Daily drawdown is measured from the day's starting equity at 9:15 AM IST until end of session. Any unrealised loss on open positions counts in real time — we never wait for end-of-day to mark you down.",
  },
  {
    cat: "Rules",
    q: "What is the maximum total loss limit?",
    a: "Between 4% and 8% of starting balance, depending on the program. You can see the exact figure for your account inside Dashboard → Accounts.",
  },
  {
    cat: "Rules",
    q: "Is there a daily profit cap?",
    a: "Yes — a 4% daily profit cap. Hitting it triggers our kill-switch: no new trades for the rest of that session. Existing positions follow normal square-off rules. This is designed to discourage revenge trading after a hot streak.",
  },
  {
    cat: "Rules",
    q: "Can I trade during news events?",
    a: "Yes — we do not blanket-ban news trading. The kill-switch and drawdown limits naturally enforce sane risk during volatile prints like RBI policy or quarterly results.",
  },
  {
    cat: "Rules",
    q: "Is high-frequency trading allowed?",
    a: "Manual scalping and discretionary HFT-style approaches are allowed. Latency arbitrage, exploiting feed errors and any strategy that depends on platform glitches are strictly prohibited.",
  },
  {
    cat: "Rules",
    q: "Are EAs and automated strategies allowed?",
    a: "Yes, on Instant and Evaluation programs. EAs must respect all standard rules — daily loss, drawdown, kill-switch and product restrictions apply to bots exactly the same way.",
  },

  // ---------------- Scaling ----------------
  {
    cat: "Scaling",
    q: "How does account scaling work?",
    a: "After 3 consecutive profitable payout cycles, your account is automatically reviewed for scaling. Successful traders see a 25% capital increase per cycle, all the way up to ₹1.6 crore.",
  },
  {
    cat: "Scaling",
    q: "Is there a limit to how much I can scale?",
    a: "₹1.6 crore is the public ceiling. Top-performing traders past this level qualify for our private capital allocation programme — managed individually by our risk team.",
  },
  {
    cat: "Scaling",
    q: "Does the profit split increase with scaling?",
    a: "Yes. Profit split steps up from 80% → 85% → 90% as you progress through the scaling tiers. The scaling page lays out every milestone in detail.",
  },
  {
    cat: "Scaling",
    q: "Do I have to opt in to scaling?",
    a: "No. Scaling is automatic and free — there is no extra fee. You can opt out from your dashboard if you prefer to keep your current size.",
  },

  // ---------------- Support ----------------
  {
    cat: "Support",
    q: "What support do you provide?",
    a: "Live chat, email and WhatsApp support in English and Hindi. Trading-hour issues (order rejects, fills, risk alerts) get priority routing and are typically answered inside 5 minutes.",
  },
  {
    cat: "Support",
    q: "How do I access my dashboard?",
    a: "Sign in at fundedwealth.com/sign-in with the email you registered. The dashboard is the home base for accounts, payouts, KYC, scaling progress and analytics.",
  },
  {
    cat: "Support",
    q: "Is KYC required?",
    a: "Yes — KYC is mandatory before your first payout. We need PAN, Aadhaar (or another government photo ID), proof of address and a bank account in your name. The full KYC takes about 5 minutes inside the dashboard.",
  },
  {
    cat: "Support",
    q: "What if my support ticket is urgent?",
    a: "Tag the ticket as 'Trading-hour critical' and it jumps to the top of the queue. For payout issues, ping our WhatsApp support line — usually answered within minutes during business hours.",
  },

  // ---------------- Billing ----------------
  {
    cat: "Billing",
    q: "What payment methods do you accept for assessments?",
    a: "UPI, all major credit/debit cards, net banking, wallets (via Razorpay) and crypto (USDT TRC20/BEP20/ERC20, BTC, ETH, LTC via OxaPay). All Indian INR rails are supported.",
  },
  {
    cat: "Billing",
    q: "What if I fail the assessment?",
    a: "Your evaluation fee is non-refundable on failure, but a discounted retake is offered inside the dashboard. On passing, the original evaluation fee is fully refunded with your first payout.",
  },
  {
    cat: "Billing",
    q: "Can I cancel my assessment?",
    a: "Yes — within 48 hours of purchase and only if no trade has been placed on the challenge account. Refunds are processed to the original payment method within 5–7 business days of approval. Full terms are on our Refund Policy page.",
  },
  {
    cat: "Billing",
    q: "Are there any hidden fees?",
    a: "None. The evaluation fee is the only charge. Payouts, scaling, dashboard tools and support are all included — no monthly subscription, no platform fee, no withdrawal charge.",
  },
  {
    cat: "Billing",
    q: "Do you offer discounts or coupons?",
    a: "Yes — seasonal coupons appear inside the checkout. Affiliate partners and championship participants also receive exclusive discount codes.",
  },

  // ---------------- Tax & Compliance ----------------
  {
    cat: "Tax & Compliance",
    q: "Who is responsible for paying taxes on trading profits?",
    a: "You are. Profit-share payouts are treated as professional / business income under Indian tax law. We recommend consulting a CA, especially for higher payout brackets.",
  },
  {
    cat: "Tax & Compliance",
    q: "Does FundedWealth provide tax certificates (Form 16 / 16A)?",
    a: "Yes. We deduct TDS where applicable and issue Form 16A every quarter, plus an annual statement summarising all payouts. Both are downloadable inside Dashboard → Settings.",
  },
  {
    cat: "Tax & Compliance",
    q: "How should traders report income from FundedWealth?",
    a: "Most traders report it under 'Income from Business or Profession' (ITR-3 / ITR-4). Your CA can advise on presumptive vs regular books based on volume.",
  },
  {
    cat: "Tax & Compliance",
    q: "Is FundedWealth SEBI registered?",
    a: "FundedWealth operates a simulated proprietary trading evaluation programme — it is not a stockbroker, investment advisor or portfolio manager and does not require SEBI registration in those categories. Market data and related services may be sourced through regulated third-party providers where applicable.",
  },
  {
    cat: "Tax & Compliance",
    q: "Why is KYC verification required?",
    a: "To meet Indian PMLA / FEMA compliance, prevent fraud and ensure that profit payouts go to the verified bank account of the actual trader.",
  },
  {
    cat: "Tax & Compliance",
    q: "Why do I need to verify my bank account?",
    a: "Bank verification protects you and us — it confirms that payouts can only land in an account in your own name, blocking misuse.",
  },
  {
    cat: "Tax & Compliance",
    q: "How is my personal and trading data protected?",
    a: "All personal data is encrypted at rest with AES-256 and isolated from the trading risk engine. We never sell user data and never share strategies with third parties. Full details are in our Privacy Policy.",
  },
  {
    cat: "Tax & Compliance",
    q: "What happens if regulations change?",
    a: "We update our programme in line with any new SEBI / RBI / FIU directives. Material changes are communicated by email at least 30 days in advance with a clear summary of what is changing and why.",
  },

  // ---------------- Trading ----------------
  {
    cat: "Trading",
    q: "What instruments can I trade?",
    a: "NIFTY, BANKNIFTY, SENSEX and FINNIFTY index options & futures, plus NIFTY 500 cash equities and stock futures. Forex, crypto and global futures will be available on dedicated FundedWealth verticals soon.",
  },
  {
    cat: "Trading",
    q: "Are there any prohibited trading strategies?",
    a: "Yes: option writing (selling), hedging within the same account, martingale / grid without stop-loss, latency arbitrage, exploiting feed errors and copy-trading between FundedWealth accounts.",
  },
  {
    cat: "Trading",
    q: "What leverage do you provide?",
    a: "Up to 1:30 on evaluation programs and up to 1:50 on Instant / Flash funding. Index F&O leverage is auto-aligned with NSE's prescribed margins.",
  },
  {
    cat: "Trading",
    q: "Are there position size limits?",
    a: "Yes — maximum position size is 70% of account balance, with a minimum of 1 lot. This caps single-symbol concentration so a wrong call cannot wipe the entire account.",
  },
  {
    cat: "Trading",
    q: "Can I trade multiple correlated instruments?",
    a: "Yes, but combined exposure across correlated instruments (e.g. NIFTY + BANKNIFTY) still counts toward the 70% sizing cap. The risk engine aggregates exposure in real time.",
  },
  {
    cat: "Trading",
    q: "Is scalping allowed?",
    a: "Yes. We require a minimum 30-second hold time per trade to filter out latency-exploit strategies, but otherwise scalping is fully welcome.",
  },
  {
    cat: "Trading",
    q: "Are overnight positions allowed?",
    a: "No. All positions auto-square-off at 3:15 PM IST sharp. The evaluation is intentionally intraday — it keeps risk symmetric across all traders.",
  },
];

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>("All");
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return FAQS.filter((f) => {
      const catOk = active === "All" || f.cat === active;
      if (!catOk) return false;
      if (!q) return true;
      return (
        f.q.toLowerCase().includes(q) ||
        f.a.toLowerCase().includes(q) ||
        f.cat.toLowerCase().includes(q)
      );
    });
  }, [query, active]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: FAQS.length };
    for (const f of FAQS) c[f.cat] = (c[f.cat] ?? 0) + 1;
    return c;
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Prop Trading FAQ India [70+ Answers] — Payouts, Rules & Evaluation"
        description="Answers to 70+ questions about FundedWealth: payouts in 12 hours, 2% daily drawdown, 90% profit split, KYC, taxes, scaling and evaluation rules. Complete FAQ for Indian prop traders."
        keywords="FundedWealth FAQ, prop trading questions India, prop firm FAQ, funded trader FAQ, evaluation rules, profit split, drawdown rules, payout process India, prop trading india 2026 faq"
        canonical="/faq"
      />
      <FAQSchema />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.fundedwealth.com/" },
          { name: "FAQ", url: "https://www.fundedwealth.com/faq" },
        ]}
      />

      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <HelpCircle className="text-fw-pink" size={20} /> Prop Trading FAQ India
          </h1>
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">Home</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-10 py-14 max-w-[1600px]">
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fw-pink/10 border border-fw-pink/30 text-fw-pink text-xs font-bold uppercase tracking-[0.2em] mb-5">
            <Sparkles size={12} /> Everything you need to know
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-heading font-extrabold mb-4 leading-tight">
            Frequently Asked <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange via-fw-pink to-fw-purple">
              Questions
            </span>
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
            Search 70+ answers about our platform, evaluations, payouts and rules — all written for Indian traders, in plain language.
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto mb-7">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
          <input
            type="search"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpenIdx(null); }}
            placeholder="Search questions, e.g. payout, KYC, drawdown..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-12 pr-5 h-12 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-fw-pink/50 focus:bg-white/[0.07] transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          <span className="hidden sm:inline-flex items-center gap-1 text-white/40 text-xs font-bold uppercase tracking-wider mr-2">
            <Filter size={12} /> Filter
          </span>
          {CATEGORIES.map((c) => {
            const isActive = active === c;
            return (
              <button
                key={c}
                onClick={() => { setActive(c); setOpenIdx(null); }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                  isActive
                    ? "bg-gradient-to-r from-fw-orange to-fw-pink text-white border-transparent shadow-lg shadow-fw-pink/30"
                    : "bg-white/5 text-white/65 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                {c}
                <span className={`ml-1.5 text-[10px] ${isActive ? "text-white/80" : "text-white/35"}`}>
                  {counts[c] ?? 0}
                </span>
              </button>
            );
          })}
        </div>

        {filtered.length === 0 ? (
          <Card className="glass-card border-white/10">
            <CardContent className="p-10 text-center">
              <HelpCircle size={36} className="text-white/30 mx-auto mb-3" />
              <div className="text-white font-bold mb-1">No matching questions</div>
              <p className="text-white/55 text-sm">
                Try a different keyword or pick another category. Still stuck? Use the contact form below — we reply within 12 hours.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((f, i) => {
              const open = openIdx === i;
              return (
                <Card
                  key={`${f.cat}-${i}-${f.q}`}
                  className={`glass-card border-white/10 transition-all ${open ? "border-fw-pink/40 bg-white/[0.04]" : "hover:border-white/20"}`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : i)}
                    className="w-full text-left p-5 flex items-start gap-4"
                    aria-expanded={open}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-fw-pink/10 border border-fw-pink/30 text-fw-pink text-[10px] font-extrabold uppercase tracking-wider mb-2">
                        {f.cat}
                      </span>
                      <div className={`font-bold text-base md:text-lg ${open ? "text-white" : "text-white/90"}`}>
                        {f.q}
                      </div>
                      {open && (
                        <p className="text-white/65 text-sm md:text-[15px] leading-relaxed mt-3">
                          {f.a}
                        </p>
                      )}
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-white/50 shrink-0 mt-1 transition-transform ${open ? "rotate-180 text-fw-pink" : ""}`}
                    />
                  </button>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="border-0 mt-14 overflow-hidden bg-gradient-to-br from-[#1a0a30] via-[#1a0a30] to-[#2a0a3f] border border-white/10 shadow-2xl">
          <CardContent className="p-10 md:p-14">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fw-orange to-fw-pink flex items-center justify-center mb-5 shadow-lg shadow-fw-pink/30">
                <HelpCircle size={26} className="text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">
                Still have questions?
              </h3>
              <p className="text-white/65 max-w-xl mb-7 text-base">
                Our India support team is online during NSE hours and replies on email / WhatsApp within 12 hours, 7 days a week. Pick the option that suits you best.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-gradient-to-r from-fw-orange to-fw-pink text-white rounded-full px-4 md:px-6 lg:px-8 xl:px-10 h-12 font-extrabold shadow-lg shadow-fw-pink/30">
                    <ArrowRight size={16} className="mr-2" /> Get Started
                  </Button>
                </Link>
                <Link href="/how-it-works">
                  <Button size="lg" variant="outline" className="border-white/15 text-white bg-white/5 hover:bg-white/10 rounded-full px-4 md:px-6 lg:px-8 xl:px-10 h-12 font-bold">
                    <ArrowRight size={16} className="mr-2" /> How the evaluation works
                  </Button>
                </Link>
                <Link href="/#contact">
                  <Button size="lg" variant="outline" className="border-fw-pink/40 text-white bg-white/5 hover:bg-white/10 rounded-full px-4 md:px-6 lg:px-8 xl:px-10 h-12 font-bold">
                    <MessageCircle size={16} className="mr-2" /> Contact Support
                  </Button>
                </Link>
                <Link href="/community">
                  <Button size="lg" variant="outline" className="border-white/15 text-white bg-white/5 hover:bg-white/10 rounded-full px-4 md:px-6 lg:px-8 xl:px-10 h-12 font-bold">
                    <Users size={16} className="mr-2" /> Join Community
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
