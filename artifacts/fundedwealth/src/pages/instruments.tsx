import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart2,
  Activity,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Instrument data ──────────────────────────────────────────────────────────
interface InstrumentInfo {
  name: string;
  badge: string;
  badgeColor: string; // Tailwind bg/text classes for badge
  category: string;
  description: string;
  market: string;
  tradingHours: string;
  allowed: string[];
  notAllowed: string[];
  icon: React.ReactNode;
  accentFrom: string;
  accentTo: string;
  glowColor: string;
}

const INSTRUMENTS: InstrumentInfo[] = [
  {
    name: "NIFTY 50",
    badge: "NSE",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    category: "Index Futures & Options",
    description:
      "India's leading benchmark index representing 50 major companies listed on the National Stock Exchange. A core instrument for structured simulated index trading with high liquidity and well-defined risk parameters.",
    market: "NSE",
    tradingHours: "9:15 AM – 3:30 PM IST",
    allowed: [
      "Index Futures",
      "Eligible Index Options",
      "Intraday positions within session",
    ],
    notAllowed: [
      "Overnight positions",
      "Copy execution / trade-copying",
      "Prohibited strategies (hedging, grid, martingale)",
    ],
    icon: <TrendingUp size={22} className="text-blue-300" />,
    accentFrom: "#1e40af",
    accentTo: "#3b82f6",
    glowColor: "rgba(59,130,246,0.25)",
  },
  {
    name: "BANKNIFTY",
    badge: "NSE",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    category: "Banking Index",
    description:
      "A major Indian banking-sector index tracking leading financial institutions listed on the NSE. Designed for traders who focus on high-liquidity index movements driven by the financial sector.",
    market: "NSE",
    tradingHours: "9:15 AM – 3:30 PM IST",
    allowed: [
      "Eligible Index Futures",
      "Eligible Index Options",
      "Intraday positions within session",
    ],
    notAllowed: [
      "Overnight positions",
      "Copy execution / trade-copying",
      "Prohibited strategies (hedging, grid, martingale)",
    ],
    icon: <BarChart2 size={22} className="text-violet-300" />,
    accentFrom: "#5b21b6",
    accentTo: "#8b5cf6",
    glowColor: "rgba(139,92,246,0.25)",
  },
  {
    name: "SENSEX",
    badge: "BSE",
    badgeColor: "bg-orange-500/20 text-orange-300 border-orange-500/40",
    category: "Index Futures & Options",
    description:
      "One of India's major benchmark indices representing leading companies listed on the Bombay Stock Exchange. Provides structured simulated access to BSE's flagship index with transparent evaluation rules.",
    market: "BSE",
    tradingHours: "9:15 AM – 3:30 PM IST",
    allowed: [
      "Eligible Index Futures",
      "Eligible Index Options",
      "Intraday positions within session",
    ],
    notAllowed: [
      "Overnight positions",
      "Copy execution / trade-copying",
      "Prohibited strategies (hedging, grid, martingale)",
    ],
    icon: <Activity size={22} className="text-orange-300" />,
    accentFrom: "#c2410c",
    accentTo: "#f97316",
    glowColor: "rgba(249,115,22,0.25)",
  },
  {
    name: "FINNIFTY",
    badge: "NSE",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/40",
    category: "Financial Services Index",
    description:
      "An NSE index focused on India's financial-services sector, providing another structured instrument for simulated index trading. Covers a broader set of financial-sector companies than BANKNIFTY.",
    market: "NSE",
    tradingHours: "9:15 AM – 3:30 PM IST",
    allowed: [
      "Eligible instruments supported by FundedWealth",
      "Intraday positions within session",
    ],
    notAllowed: [
      "Overnight positions",
      "Copy execution / trade-copying",
      "Prohibited strategies (hedging, grid, martingale)",
    ],
    icon: <TrendingUp size={22} className="text-cyan-300" />,
    accentFrom: "#0e7490",
    accentTo: "#06b6d4",
    glowColor: "rgba(6,182,212,0.25)",
  },
];

// ─── Card component ───────────────────────────────────────────────────────────
const InstrumentCard = ({ ins }: { ins: InstrumentInfo }) => (
  <div
    className="relative rounded-2xl border border-white/10 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-white/20 group"
    style={{
      background: "linear-gradient(145deg, rgba(26,0,48,0.95) 0%, rgba(15,0,32,0.98) 100%)",
      boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 8px 40px ${ins.glowColor}`,
    }}
  >
    {/* Top accent bar */}
    <div
      className="absolute top-0 left-0 right-0 h-[3px]"
      style={{ background: `linear-gradient(90deg, ${ins.accentFrom}, ${ins.accentTo})` }}
    />

    {/* Ambient glow behind card */}
    <div
      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
      style={{ background: `radial-gradient(ellipse at 50% 0%, ${ins.glowColor} 0%, transparent 70%)` }}
    />

    <div className="relative p-6 flex flex-col gap-4 flex-1">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${ins.accentFrom}55, ${ins.accentTo}33)`, border: `1px solid ${ins.accentTo}40` }}
          >
            {ins.icon}
          </div>
          <div>
            <h3 className="text-white font-heading font-extrabold text-xl leading-tight">{ins.name}</h3>
            <span className="text-white/50 text-xs font-medium">{ins.category}</span>
          </div>
        </div>
        <span className={`shrink-0 text-[11px] font-extrabold px-2.5 py-1 rounded-full border uppercase tracking-wider ${ins.badgeColor}`}>
          {ins.badge}
        </span>
      </div>

      {/* Description */}
      <p className="text-white/65 text-sm leading-relaxed">{ins.description}</p>

      {/* Info row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
          <Info size={13} className="text-white/40 shrink-0" />
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Market</div>
            <div className="text-white font-bold text-xs">{ins.market}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/8">
          <Clock size={13} className="text-white/40 shrink-0" />
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider">Session</div>
            <div className="text-white font-bold text-xs">{ins.tradingHours}</div>
          </div>
        </div>
      </div>

      {/* Allowed / Not Allowed */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
        <div className="rounded-xl bg-green-500/8 border border-green-500/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <CheckCircle size={13} className="text-green-400 shrink-0" />
            <span className="text-green-400 text-[11px] font-extrabold uppercase tracking-wider">Allowed</span>
          </div>
          <ul className="space-y-1">
            {ins.allowed.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-green-400/60 text-xs mt-0.5 shrink-0">›</span>
                <span className="text-white/70 text-xs leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-red-500/8 border border-red-500/20 p-3">
          <div className="flex items-center gap-1.5 mb-2">
            <XCircle size={13} className="text-red-400 shrink-0" />
            <span className="text-red-400 text-[11px] font-extrabold uppercase tracking-wider">Not Allowed</span>
          </div>
          <ul className="space-y-1">
            {ins.notAllowed.map((item, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-red-400/60 text-xs mt-0.5 shrink-0">›</span>
                <span className="text-white/70 text-xs leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Instruments() {
  return (
    <div className="min-h-screen bg-[#0a0010] text-white">
      <SEOHead
        title="Instruments | FundedWealth — Indian Market Simulated Trading"
        description="Explore the Indian market instruments available on FundedWealth's simulated evaluation platform — NIFTY 50, BANKNIFTY, SENSEX, FINNIFTY. Clear rules, defined sessions, transparent risk parameters."
        keywords="NIFTY trading, BANKNIFTY simulated, SENSEX prop firm India, FINNIFTY evaluation, FundedWealth instruments, Indian index futures, NSE BSE simulated trading"
        canonical="/instruments"
      />

      {/* ── Sticky mini-nav ── */}
      <div className="sticky top-0 z-40 bg-[#0a0010]/90 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-14">
          <Link href="/">
            <a className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-medium">
              <ArrowLeft size={16} />
              Back to Home
            </a>
          </Link>
          <span className="text-white/40 text-xs uppercase tracking-[0.2em] font-semibold">Instruments</span>
          <Link href="/checkout">
            <Button
              size="sm"
              className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white border-0 font-bold rounded-full px-5 text-xs"
            >
              Get Funded
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Hero header ── */}
      <section className="relative overflow-hidden pt-16 pb-12">
        {/* Background glow orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(74,0,224,0.6) 0%, transparent 70%)", filter: "blur(60px)" }} />
        <div className="absolute top-0 right-1/4 w-[400px] h-[250px] rounded-full opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(214,51,132,0.5) 0%, transparent 70%)", filter: "blur(60px)" }} />

        <div className="relative container mx-auto px-4 md:px-6 text-center max-w-3xl">
          {/* Label */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4A00E0]/20 border border-[#4A00E0]/40 text-[#a78bfa] text-xs font-extrabold uppercase tracking-[0.18em] mb-6">
            <Activity size={13} />
            Instruments
          </div>

          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-[52px] text-white leading-tight mb-4">
            Trade the Indian Markets{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#a78bfa] to-[#ec4899]">
              That Matter
            </span>
          </h1>

          <p className="text-white/50 text-sm uppercase tracking-[0.2em] font-semibold mb-5">
            Focused instruments for structured simulated trading
          </p>

          <p className="text-white/65 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            FundedWealth focuses on selected Indian market instruments so traders can operate within a clearly defined
            simulated trading environment. Trade major Indian indices and eligible futures with transparent rules and
            risk parameters.
          </p>

          {/* Exchange badges */}
          <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
            {[
              { label: "NSE", color: "bg-blue-500/15 text-blue-300 border-blue-500/30" },
              { label: "BSE", color: "bg-orange-500/15 text-orange-300 border-orange-500/30" },
              { label: "Index Futures", color: "bg-violet-500/15 text-violet-300 border-violet-500/30" },
              { label: "Intraday", color: "bg-green-500/15 text-green-300 border-green-500/30" },
              { label: "Real-Time Data", color: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30" },
            ].map(({ label, color }) => (
              <span key={label} className={`text-xs font-bold px-3 py-1.5 rounded-full border uppercase tracking-wider ${color}`}>
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Instrument cards grid ── */}
      <section className="container mx-auto px-4 md:px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
          {INSTRUMENTS.map((ins) => (
            <InstrumentCard key={ins.name} ins={ins} />
          ))}
        </div>

        {/* ── Disclaimer ── */}
        <div className="mt-10 max-w-5xl mx-auto rounded-xl bg-yellow-500/8 border border-yellow-500/20 p-4 flex items-start gap-3">
          <Info size={16} className="text-yellow-400 mt-0.5 shrink-0" />
          <p className="text-white/60 text-xs leading-relaxed">
            <span className="text-yellow-400 font-semibold">Simulated Environment: </span>
            All trading on FundedWealth is conducted in a simulated evaluation environment using real-time NSE/BSE
            market price data. Account balances are simulated balances and do not represent customer-owned funds or
            real capital at risk. Eligible participants may earn performance-based rewards under the applicable
            program terms.
          </p>
        </div>
      </section>

      {/* ── CTA footer strip ── */}
      <section className="border-t border-white/10 bg-gradient-to-b from-[#0a0010] to-[#100025] py-14">
        <div className="container mx-auto px-4 md:px-6 text-center max-w-xl">
          <h2 className="text-white font-heading font-extrabold text-2xl sm:text-3xl mb-3">
            Ready to trade these instruments?
          </h2>
          <p className="text-white/50 text-sm mb-7 leading-relaxed">
            Choose an evaluation plan and start trading NIFTY, BANKNIFTY, SENSEX and FINNIFTY in a structured
            simulated environment today.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/checkout">
              <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white border-0 font-bold px-8 py-5 rounded-full text-sm shadow-lg hover:-translate-y-0.5 transition-all">
                Get Funded Now <ArrowRight size={15} className="ml-1.5 inline" />
              </Button>
            </Link>
            <Link href="/rules">
              <a className="text-white/60 hover:text-white text-sm font-semibold transition-colors flex items-center gap-1.5">
                View Trading Rules <ArrowRight size={14} />
              </a>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
