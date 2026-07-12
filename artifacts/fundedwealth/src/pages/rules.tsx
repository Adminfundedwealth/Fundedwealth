import React, { useState } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Info,
  BookOpen, Clock, Target, Activity, Calendar, Scale, FileText,
  LifeBuoy, ArrowRight, Zap, Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// ─── Plan tab definitions ────────────────────────────────────────────────────
type PlanKey = "flash" | "instant" | "1step" | "2step";

const PLAN_TABS: { key: PlanKey; label: string }[] = [
  { key: "flash",   label: "Flash Rules"           },
  { key: "instant", label: "Instant Funding Rules" },
  { key: "1step",   label: "1-Step Rules"           },
  { key: "2step",   label: "2-Step Rules"           },
];

// ─── Per-plan quick reference data ───────────────────────────────────────────
type QuickRefRow = { label: string; value: string; critical?: boolean; note?: boolean };

const QUICK_REF: Record<PlanKey, QuickRefRow[]> = {
  flash: [
    { label: "Profit Target",        value: "None — no target required" },
    { label: "Daily Loss Limit",     value: "2% of starting balance", critical: true },
    { label: "Max Drawdown",         value: "4% of starting balance", critical: true },
    { label: "Account Duration",     value: "24 hours from first trade" },
    { label: "Profit Split",         value: "80% to trader" },
    { label: "Consistency Rule",     value: "Best single trade ≤ 15% of total profit", note: true },
    { label: "Payout Threshold",     value: "Net profit ≥ 3% of starting balance" },
    { label: "Min Trading Days",     value: "None" },
    { label: "Leverage",             value: "1:100 (currencies) · 1:20 (commodities/indices) · 1:2 (crypto)" },
    { label: "Overnight / Weekend",  value: "Allowed within the 24-hour window" },
    { label: "Scaling",              value: "Not available — account closes after 24 hours" },
  ],
  instant: [
    { label: "Profit Target",        value: "None — funded immediately" },
    { label: "Daily Loss Limit",     value: "3% of starting balance", critical: true },
    { label: "Max Drawdown",         value: "5% of starting balance", critical: true },
    { label: "Account Duration",     value: "Unlimited" },
    { label: "Profit Split",         value: "70 – 80% to trader" },
    { label: "Min Trading Days",     value: "7 days before first payout" },
    { label: "Leverage",             value: "1:50" },
    { label: "Trade Window",         value: "9:15 AM – 3:15 PM IST" },
    { label: "Auto Square-off",      value: "3:15 PM IST" },
    { label: "Overnight Positions",  value: "Not allowed" },
    { label: "Max Position Size",    value: "70% of account" },
  ],
  "1step": [
    { label: "Profit Target",        value: "10% (challenge phase)", note: true },
    { label: "Daily Loss Limit",     value: "3% of starting balance", critical: true },
    { label: "Max Drawdown",         value: "6% of starting balance", critical: true },
    { label: "Account Duration",     value: "Unlimited" },
    { label: "Profit Split",         value: "80 – 90% to trader" },
    { label: "Min Trading Days",     value: "5 days" },
    { label: "Leverage",             value: "1:30" },
    { label: "Trade Window",         value: "9:15 AM – 3:15 PM IST" },
    { label: "Auto Square-off",      value: "3:15 PM IST" },
    { label: "Max Daily Profit",     value: "4% — kill-switch activates at cap", note: true },
    { label: "Overnight Positions",  value: "Not allowed" },
    { label: "Max Position Size",    value: "70% of account" },
  ],
  "2step": [
    { label: "Phase 1 Profit Target", value: "8%", note: true },
    { label: "Phase 2 Profit Target", value: "5%", note: true },
    { label: "Daily Loss Limit",      value: "3% per phase", critical: true },
    { label: "Max Drawdown",          value: "8% per phase", critical: true },
    { label: "Account Duration",      value: "Unlimited" },
    { label: "Profit Split",          value: "80 – 90% to trader" },
    { label: "Min Trading Days",      value: "5 days per phase" },
    { label: "Leverage",              value: "1:30" },
    { label: "Trade Window",          value: "9:15 AM – 3:15 PM IST" },
    { label: "Auto Square-off",       value: "3:15 PM IST" },
    { label: "Max Daily Profit",      value: "4% — kill-switch activates at cap", note: true },
    { label: "Overnight Positions",   value: "Not allowed" },
    { label: "Max Position Size",     value: "70% of account" },
  ],
};

// ─── Per-plan detail cards ────────────────────────────────────────────────────
type DetailItem = { text: string; ok: boolean; tag?: string };
type PlanDetail = {
  headline: string;
  badge: string;
  profitTargets: DetailItem[];
  riskMgmt: DetailItem[];
  tradingHours: { text: string }[];
  positionSizing: DetailItem[];
  evalPeriod: DetailItem[];
};

const PLAN_DETAIL: Record<PlanKey, PlanDetail> = {
  flash: {
    headline: "Flash — 24-Hour Account",
    badge: "Instant funded · no profit target",
    profitTargets: [
      { text: "No profit target required", ok: true },
      { text: "Consistency rule: best trade ≤ 15% of total profit", ok: true },
      { text: "Payout requires ≥ 3% net profit on starting balance", ok: true },
    ],
    riskMgmt: [
      { text: "Daily loss limit: 2%", ok: true, tag: "Critical" },
      { text: "Max drawdown: 4% of starting balance", ok: true, tag: "Critical" },
      { text: "No kill-switch / daily profit cap (24-hour window instead)", ok: true },
      { text: "Martingale / grid strategies without stop-loss: not allowed", ok: false, tag: "Critical" },
    ],
    tradingHours: [
      { text: "Trades can be placed any time within the 24-hour account window" },
      { text: "Account auto-closes 24 hours after the first trade" },
      { text: "Overnight and weekend holding is allowed within the window" },
    ],
    positionSizing: [
      { text: "Leverage: 1:100 currencies · 1:20 commodities & indices · 1:2 crypto", ok: true },
      { text: "No scaling — account is single-cycle", ok: true },
    ],
    evalPeriod: [
      { text: "Account active for exactly 24 hours from first trade", ok: true },
      { text: "Single payout request after the window closes", ok: true },
    ],
  },
  instant: {
    headline: "Instant Funding",
    badge: "Funded immediately · no evaluation",
    profitTargets: [
      { text: "No profit target — funded from day one", ok: true },
      { text: "First payout after minimum 7 trading days", ok: true },
    ],
    riskMgmt: [
      { text: "Daily loss limit: 3%", ok: true, tag: "Critical" },
      { text: "Max drawdown: 5% of starting balance", ok: true, tag: "Critical" },
      { text: "Max daily profit: 4% — kill-switch activates at cap", ok: true },
      { text: "Index options: buying only — writing not allowed", ok: false, tag: "Critical" },
      { text: "Hedging not allowed", ok: false, tag: "Critical" },
    ],
    tradingHours: [
      { text: "Market hours: 9:15 AM – 3:30 PM IST" },
      { text: "Trading allowed: 9:15 AM – 3:15 PM IST" },
      { text: "Auto square-off: 3:15 PM IST sharp" },
    ],
    positionSizing: [
      { text: "Maximum position size: 70% of account", ok: true },
      { text: "Leverage: 1:50", ok: true },
    ],
    evalPeriod: [
      { text: "No evaluation phase — account is live immediately", ok: true },
      { text: "Duration: unlimited", ok: true },
    ],
  },
  "1step": {
    headline: "1-Step Evaluation",
    badge: "One challenge phase · then funded",
    profitTargets: [
      { text: "Profit target: 10% on starting balance", ok: true },
      { text: "Minimum 5 trading days to qualify", ok: true },
    ],
    riskMgmt: [
      { text: "Daily loss limit: 3%", ok: true, tag: "Critical" },
      { text: "Max drawdown: 6% of starting balance", ok: true, tag: "Critical" },
      { text: "Max daily profit: 4% — kill-switch activates at cap", ok: true },
      { text: "Index options: buying only — writing not allowed", ok: false, tag: "Critical" },
      { text: "Hedging not allowed", ok: false, tag: "Critical" },
    ],
    tradingHours: [
      { text: "Market hours: 9:15 AM – 3:30 PM IST" },
      { text: "Trading allowed: 9:15 AM – 3:15 PM IST" },
      { text: "Auto square-off: 3:15 PM IST sharp" },
    ],
    positionSizing: [
      { text: "Maximum position size: 70% of account", ok: true },
      { text: "Leverage: 1:30", ok: true },
    ],
    evalPeriod: [
      { text: "Evaluation duration: unlimited — no time pressure", ok: true },
      { text: "One phase to pass before funded status", ok: true },
    ],
  },
  "2step": {
    headline: "2-Step Evaluation",
    badge: "Two challenge phases · higher drawdown buffer",
    profitTargets: [
      { text: "Phase 1 profit target: 8% on starting balance", ok: true },
      { text: "Phase 2 profit target: 5% on starting balance", ok: true },
      { text: "Minimum 5 trading days per phase", ok: true },
    ],
    riskMgmt: [
      { text: "Daily loss limit: 3% (each phase)", ok: true, tag: "Critical" },
      { text: "Max drawdown: 8% (each phase)", ok: true, tag: "Critical" },
      { text: "Max daily profit: 4% — kill-switch activates at cap", ok: true },
      { text: "Index options: buying only — writing not allowed", ok: false, tag: "Critical" },
      { text: "Hedging not allowed", ok: false, tag: "Critical" },
    ],
    tradingHours: [
      { text: "Market hours: 9:15 AM – 3:30 PM IST" },
      { text: "Trading allowed: 9:15 AM – 3:15 PM IST" },
      { text: "Auto square-off: 3:15 PM IST sharp" },
    ],
    positionSizing: [
      { text: "Maximum position size: 70% of account", ok: true },
      { text: "Leverage: 1:30", ok: true },
    ],
    evalPeriod: [
      { text: "Both phases: unlimited duration — no time pressure", ok: true },
      { text: "Two phases required before funded status", ok: true },
    ],
  },
};

// ─── Shared allowed / prohibited (apply to all plans) ───────────────────────
const ALLOWED = [
  "Scalping (minimum 2-minute hold time)",
  "Swing trading (overnight positions allowed Mon–Thu for eval plans)",
  "Multiple instruments simultaneously",
  "Expert Advisors (EAs) and automated strategies",
  "Copy trading from your own accounts only",
  "Trading during high-volatility sessions",
];

const PROHIBITED = [
  "Holding positions over weekends (close by Friday market close) — eval plans",
  "Trading within 2 minutes of major news events (RBI policy, US NFP, FOMC)",
  "Martingale or grid strategies with no stop loss",
  "Account sharing or third-party trading without disclosure",
  "Exploiting platform glitches, latency arbitrage, or price feed errors",
  "Copy trading from other FundedWealth accounts",
];

// ─── Plan accent colours ──────────────────────────────────────────────────────
const PLAN_ACCENT: Record<PlanKey, { bg: string; border: string; text: string; pill: string }> = {
  flash:   { bg: "bg-amber-500/10",  border: "border-amber-500/30",  text: "text-amber-300",  pill: "bg-amber-500/20 border-amber-400/40 text-amber-200" },
  instant: { bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   text: "text-cyan-300",   pill: "bg-cyan-500/20 border-cyan-400/40 text-cyan-200" },
  "1step": { bg: "bg-blue-500/10",   border: "border-blue-500/30",   text: "text-blue-300",   pill: "bg-blue-500/20 border-blue-400/40 text-blue-200" },
  "2step": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-300", pill: "bg-purple-500/20 border-purple-400/40 text-purple-200" },
};

// ─── Component ───────────────────────────────────────────────────────────────
export default function Rules() {
  const [activePlan, setActivePlan] = useState<PlanKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // When no plan selected, default detail/qr to flash for the detail cards
  const selectedPlan: PlanKey = activePlan ?? "flash";
  const qr     = QUICK_REF[selectedPlan];
  const detail = PLAN_DETAIL[selectedPlan];
  const accent = PLAN_ACCENT[selectedPlan];

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Prop Trading Rules India — Flash, Instant, 1-Step & 2-Step Rules"
        description="Complete prop trading evaluation rules at FundedWealth. Understand drawdown limits, profit targets, allowed instruments, and plan comparison for India's best prop firm. Flash, Instant, 1-Step & 2-Step plans explained."
        keywords="prop trading rules India, funded account rules, Flash rules, Instant funding rules, 1-Step evaluation, 2-Step evaluation, drawdown limits prop firm, profit target prop trading"
        canonical="/rules"
      />

      {/* ── Navbar ── */}
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <Shield className="text-blue-400" size={20} /> Trading Rules
          </h1>
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">Home</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-5xl">

        {/* ── Hero ── */}
        <div className="text-center mb-10">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Evaluation & Risk Framework
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Program <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">trading rules</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
            Everything that governs your challenge in one place: profit targets, loss limits, session rules, instruments, sizing, and timelines.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full px-7 h-11 font-bold shadow-lg shadow-blue-500/30">
                Start evaluation <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/#instruments">
              <Button variant="outline" className="border-white/15 text-white bg-white/5 hover:bg-white/10 rounded-full px-7 h-11 font-semibold">
                View instruments
              </Button>
            </Link>
            <Link href="/#faq">
              <Button variant="outline" className="border-white/15 text-white bg-white/5 hover:bg-white/10 rounded-full px-7 h-11 font-semibold">
                FAQ
              </Button>
            </Link>
          </div>
          {/* ── Search + plan filter buttons ── */}
          <div className="mt-10 max-w-2xl mx-auto space-y-4">
            {/* Search input */}
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
              <input
                type="text"
                placeholder="Search rules…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/35 text-sm font-medium focus:outline-none focus:border-blue-500/60 focus:bg-white/[0.08] transition-all"
              />
            </div>
            {/* Plan filter buttons */}
            <div className="flex flex-wrap gap-2 justify-center">
              {PLAN_TABS.map((tab) => {
                const isActive = activePlan === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActivePlan(isActive ? null : tab.key)}
                    className={`
                      flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200
                      ${isActive
                        ? "bg-white text-[#1A0030] border-white shadow-md"
                        : "bg-white/[0.05] border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
                      }
                    `}
                  >
                    {tab.key === "flash" && <Zap size={13} className={isActive ? "text-amber-500" : "text-amber-400"} />}
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 max-w-3xl mx-auto rounded-xl bg-amber-500/5 border border-amber-500/25 p-4 text-left">
            <p className="text-white/75 text-sm leading-relaxed">
              <strong className="text-amber-300">Important:</strong> Breaking a{" "}
              <strong className="text-red-400">Critical</strong> rule (e.g. Daily loss limit, Maximum Loss Limit) disqualifies your evaluation immediately. Hitting the{" "}
              <strong className="text-amber-200">4% Daily profit</strong> cap triggers{" "}
              <strong className="text-amber-200">kill-switch</strong>: no new trades for that day.
            </p>
          </div>
        </div>

        {/* ── Active plan badge ── */}
        <div className={`flex items-center gap-2 mb-8 px-4 py-2.5 rounded-xl ${accent.bg} border ${accent.border} w-fit mx-auto`}>
          <span className={`text-sm font-extrabold ${accent.text}`}>{detail.headline}</span>
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${accent.pill}`}>{detail.badge}</span>
        </div>

        {/* ── Quick Reference ── */}
        <div className="mb-14">
          <div className="text-center mb-6">
            <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.25em]">At a glance</span>
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-2">Quick reference</h3>
          </div>
          <Card className="glass-card border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {qr.map((row, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-2 md:gap-6 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="text-white font-bold text-sm">{row.label}</div>
                  <div className={`text-sm ${row.critical ? "text-red-300 font-semibold" : row.note ? "text-amber-200" : "text-white/65"}`}>
                    {row.value}
                    {row.critical && (
                      <span className="ml-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400 uppercase">Critical</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ── Rules in detail ── */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.25em]">Full Rulebook</span>
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-2">Rules in detail</h3>
          </div>

          <div className="space-y-5">
            {/* Profit Targets */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Target size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-lg">Profit Targets</h4>
                    <p className="text-white/55 text-sm">What you need to hit — or not — depending on your plan.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {detail.profitTargets.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                      <span className="text-white/80 text-sm">{r.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Risk Management */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Activity size={18} className="text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-lg">Risk Management</h4>
                    <p className="text-white/55 text-sm">Loss limits and daily controls — breaching a Critical rule ends the account.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {detail.riskMgmt.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      {r.ok
                        ? <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                        : <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />}
                      <span className="text-white/80 text-sm flex-1">{r.text}</span>
                      {r.tag && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase shrink-0">{r.tag}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trading Hours */}
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-lg">Trading Hours & Session</h4>
                    <p className="text-white/55 text-sm">When you can open new positions.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {detail.tradingHours.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <Clock size={14} className="text-cyan-400 shrink-0" />
                      <span className="text-white/80 text-sm">{r.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Position Sizing + Eval Period */}
            <div className="grid md:grid-cols-2 gap-5">
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Scale size={18} className="text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-lg">Position Sizing</h4>
                      <p className="text-white/55 text-sm">Leverage and concentration caps.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {detail.positionSizing.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <CheckCircle size={14} className="text-emerald-400 shrink-0" />
                        <span className="text-white/80 text-sm">{r.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-fw-orange/15 border border-fw-orange/30 flex items-center justify-center shrink-0">
                      <Calendar size={18} className="text-fw-orange" />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-lg">Evaluation Period</h4>
                      <p className="text-white/55 text-sm">Timeline and phase structure.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {detail.evalPeriod.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                        <Clock size={14} className="text-fw-orange shrink-0" />
                        <span className="text-white/80 text-sm">{r.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* ── Allowed / Prohibited (shared across all plans) ── */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" /> Allowed
            </h3>
            <Card className="glass-card border-green-500/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {ALLOWED.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-green-400 mt-0.5 shrink-0" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2">
              <XCircle size={20} className="text-red-400" /> Prohibited
            </h3>
            <Card className="glass-card border-red-500/20">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {PROHIBITED.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                      <span className="text-white/70 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── Important note ── */}
        <Card className="glass-card border-yellow-500/20 mb-12">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-semibold mb-1">Important Note</div>
              <div className="text-white/50 text-sm">
                Violating any rule results in account termination. If you believe a violation was in error,
                contact support within 24 hours for review.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Plan comparison table ── */}
        <div className="mb-12">
          <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2">
            <BookOpen size={22} className="text-purple-400" /> Plan Comparison
          </h3>
          <Card className="glass-card border-white/10 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[160px_repeat(4,1fr)] gap-0 text-xs">
                <div className="p-4 border-b border-r border-white/10 font-bold text-white/40 uppercase tracking-wider">Rule</div>
                {(["flash","instant","1step","2step"] as PlanKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setActivePlan(k)}
                    className={`p-4 border-b border-r border-white/10 font-bold text-center transition-colors
                      ${selectedPlan === k && activePlan !== null
                        ? `${PLAN_ACCENT[k].text} ${PLAN_ACCENT[k].bg}`
                        : "text-white/60 hover:text-white hover:bg-white/[0.03]"}`}
                  >
                    {PLAN_DETAIL[k].headline.split(" — ")[0]}
                    {selectedPlan === k && activePlan !== null && (
                      <span className={`block text-[9px] mt-0.5 font-bold uppercase tracking-wide ${PLAN_ACCENT[k].text} opacity-70`}>
                        selected ↑
                      </span>
                    )}
                  </button>
                ))}
                {[
                  ["Duration",       "24 Hours",    "Unlimited",   "Unlimited",   "Unlimited"  ],
                  ["Daily Drawdown", "2%",          "3%",          "3%",          "3%"         ],
                  ["Max Drawdown",   "4%",          "5%",          "6%",          "8%"         ],
                  ["Profit Target",  "N/A",         "N/A",         "10%",         "8% + 5%"   ],
                  ["Profit Split",   "80%",         "70–80%",      "80–90%",      "80–90%"    ],
                  ["Leverage",       "1:100",       "1:50",        "1:30",        "1:30"       ],
                  ["Min Days",       "—",           "7 days",      "5 days",      "5 days/phase"],
                ].map(([label, ...vals], ri) => (
                  <React.Fragment key={`row-${ri}`}>
                    <div className="p-4 border-b border-r border-white/10 text-white/60">{label}</div>
                    {(["flash","instant","1step","2step"] as PlanKey[]).map((k, ci) => (
                      <div
                        key={`v-${ri}-${ci}`}
                        className={`p-4 border-b border-r border-white/10 text-center font-semibold transition-colors
                          ${selectedPlan === k && activePlan !== null ? `${PLAN_ACCENT[k].text} ${PLAN_ACCENT[k].bg}` : "text-white"}`}
                      >
                        {vals[ci]}
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
          <p className="text-white/35 text-xs text-center mt-3">
            Click any column header to switch the detail view above.
          </p>
        </div>

        {/* ── Practical notes ── */}
        <div className="mb-14">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-2 text-white/40 text-[11px] font-bold uppercase tracking-[0.25em]">
              <BookOpen size={12} /> Before you start
            </span>
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-2">Practical notes</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5 mb-6">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={16} className="text-blue-400" />
                  <h4 className="text-white font-extrabold">Compliance & environment</h4>
                </div>
                <ul className="space-y-2 text-white/65 text-sm list-disc pl-5">
                  <li>Evaluation runs in our structured, simulated environment — not a live retail brokerage account.</li>
                  <li>Rules are enforced systematically so every trader is measured the same way.</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <LifeBuoy size={16} className="text-fw-pink" />
                  <h4 className="text-white font-extrabold">Support</h4>
                </div>
                <ul className="space-y-2 text-white/65 text-sm list-disc pl-5">
                  <li>Use the dashboard for limits, P&amp;L, and open risk — check before sizing up.</li>
                  <li>
                    Questions? See{" "}
                    <Link href="/#faq" className="text-blue-300 hover:underline">FAQ</Link> or{" "}
                    <Link href="/#contact" className="text-blue-300 hover:underline">contact</Link>.
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <Link href="/refund" className="text-blue-300 hover:underline">Risk disclosure</Link>
            <Link href="/terms" className="text-blue-300 hover:underline">Terms of service</Link>
            <Link href="/privacy" className="text-blue-300 hover:underline">Privacy</Link>
          </div>
        </div>

        {/* ── CTA ── */}
        <Card className="border-0 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-600 shadow-2xl shadow-blue-500/30">
          <CardContent className="p-10 md:p-14 text-center">
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">Ready under the rules?</h3>
            <p className="text-white/85 max-w-xl mx-auto mb-7">
              Pick a program size, align your risk with the limits above, and start when you are prepared.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90 rounded-full px-8 h-12 font-extrabold shadow-lg">
                  <Zap size={16} className="mr-2" /> Get started
                </Button>
              </Link>
              <Link href="/#plans">
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 rounded-full px-8 h-12 font-bold">
                  View programs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
