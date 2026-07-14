import React, { useState } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Info,
  BookOpen, Clock, Target, Activity, Calendar, Scale, FileText,
  LifeBuoy, ArrowRight, Zap, Search, CreditCard, TrendingUp,
  Lock, BarChart2, HelpCircle, Share2, Check, Layers,
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
    { label: "Profit Target",          value: "None — funded immediately" },
    { label: "Daily Loss Limit",       value: "3% of starting balance", critical: true },
    { label: "Max Drawdown",           value: "5% of starting balance", critical: true },
    { label: "Daily Profit Cap",       value: "4% — kill-switch, no new trades rest of day", note: true },
    { label: "Account Duration",       value: "Unlimited" },
    { label: "Profit Split",           value: "80% to trader" },
    { label: "Payout Threshold",       value: "Net profit ≥ 5% of starting balance" },
    { label: "Payout Cadence",         value: "On-demand, anytime once conditions met" },
    { label: "Min Trading Days",       value: "7 days before first payout" },
    { label: "Consistency Rule",       value: "Best single trade ≤ 15% of total profit", note: true },
    { label: "Risk per Trade Idea",    value: "1% of starting balance max per idea", note: true },
    { label: "Leverage",               value: "1:50" },
    { label: "Trade Window",           value: "9:15 AM – 3:15 PM IST" },
    { label: "Auto Square-off",        value: "3:15 PM IST sharp" },
    { label: "Overnight Positions",    value: "Not allowed" },
    { label: "Max Position Size",      value: "70% of account" },
    { label: "Scaling",                value: "+25% of starting balance every 90 days (≥10% growth), up to +100% total" },
    { label: "Inactivity",             value: "Auto-close after 60 days of no trades" },
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
    { label: "Max Drawdown (Eval)",   value: "8% per phase", critical: true },
    { label: "Max Drawdown (Funded)", value: "6% after passing both phases", critical: true },
    { label: "Account Duration",      value: "Unlimited" },
    { label: "Profit Split",          value: "80% to trader" },
    { label: "Payout Threshold",      value: "Net profit ≥ 5% of starting balance" },
    { label: "Payout Cadence",        value: "On-demand, once conditions met" },
    { label: "Min Trading Days",      value: "5 days per eval phase · 3 days per payout (funded)" },
    { label: "Consistency Rule",      value: "None during evaluation · 40% best day rule when funded", note: true },
    { label: "Max Risk/Trade",        value: "1.5% of account balance" },
    { label: "Daily Profit Cap",      value: "4% — kill-switch activates at cap", note: true },
    { label: "Leverage",              value: "1:30" },
    { label: "Trade Window",          value: "9:15 AM – 3:15 PM IST" },
    { label: "Auto Square-off",       value: "3:15 PM IST" },
    { label: "Overnight Positions",   value: "Not allowed" },
    { label: "Max Position Size",     value: "70% of account" },
    { label: "Scaling",               value: "+25% of starting balance every 90 days (≥10% growth), up to +100% total" },
    { label: "Inactivity",            value: "Auto-close after 60 days of no trades" },
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
      { text: "Payout threshold: net profit ≥ 5% of starting balance", ok: true },
      { text: "Consistency rule: best trade ≤ 15% of total profit", ok: true },
    ],
    riskMgmt: [
      { text: "Daily loss limit: 3%", ok: true, tag: "Critical" },
      { text: "Max drawdown: 5% of starting balance", ok: true, tag: "Critical" },
      { text: "Max daily profit: 4% — kill-switch activates at cap", ok: true },
      { text: "Risk per trade idea: 1% of starting balance", ok: true },
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
      { text: "Profit split: 80% to trader", ok: true },
    ],
    evalPeriod: [
      { text: "No evaluation phase — account is live immediately", ok: true },
      { text: "Duration: unlimited", ok: true },
      { text: "Scaling: +25% balance every 90 days (≥10% growth), up to +100% total", ok: true },
      { text: "Inactivity: auto-close after 60 days with no trades", ok: true },
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
    badge: "Two challenge phases · lower drawdown when funded",
    profitTargets: [
      { text: "Phase 1 profit target: 8% on starting balance", ok: true },
      { text: "Phase 2 profit target: 5% on starting balance", ok: true },
      { text: "Minimum 5 trading days per evaluation phase", ok: true },
      { text: "Payout threshold (funded): net profit ≥ 5% of starting balance", ok: true },
      { text: "Consistency rule (funded only): best day ≤ 40% of total profit", ok: true },
    ],
    riskMgmt: [
      { text: "Daily loss limit: 3% (each phase)", ok: true, tag: "Critical" },
      { text: "Max drawdown: 8% during evaluation phases", ok: true, tag: "Critical" },
      { text: "Max drawdown: 6% after passing both phases (funded)", ok: true, tag: "Critical" },
      { text: "Max daily profit: 4% — kill-switch activates at cap", ok: true },
      { text: "Max risk per trade: 1.5% of account balance", ok: true },
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
      { text: "Profit split: 80% to trader", ok: true },
    ],
    evalPeriod: [
      { text: "Both evaluation phases: unlimited duration — no time pressure", ok: true },
      { text: "Two phases required before funded status", ok: true },
      { text: "Scaling: +25% balance every 90 days (≥10% growth), up to +100% total", ok: true },
      { text: "Inactivity: auto-close after 60 days with no trades", ok: true },
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

// ─── Instant Funding full detail page ────────────────────────────────────────
function InstantRulesDetail({ onBack }: { onBack: () => void }) {
  const [instantLinkCopied, setInstantLinkCopied] = useState(false);

  const BASICS = [
    { param: "Profit Target",       spec: "None — funded immediately" },
    { param: "Open trades limit",   spec: "Multiple (70% max position size)" },
    { param: "Profit split",        spec: "80%" },
    { param: "Payout cadence",      spec: "On-demand, anytime once conditions met" },
    { param: "Payout threshold",    spec: "Net profit ≥ 5% of starting balance" },
    { param: "Consistency rule",    spec: "Best single trade ≤ 15% of total profit" },
    { param: "Daily profit cap",    spec: "4% — triggers kill-switch for the day" },
    { param: "Risk per trade idea", spec: "1% of starting balance" },
    { param: "Leverage",            spec: "1:50" },
    { param: "Min trading days",    spec: "7 days before first payout" },
    { param: "Scaling",             spec: "+25% of starting balance per 90-day cycle, up to +100%" },
    { param: "Inactivity close",    spec: "60 days with no trades" },
  ];

  const LOT_TABLE = [
    { asset: "Nifty 50 Futures",   l1: "2",  l5: "10",  l10: "20",  l20: "40"  },
    { asset: "Bank Nifty Futures", l1: "1",  l5: "5",   l10: "10",  l20: "20"  },
    { asset: "Fin Nifty Futures",  l1: "1",  l5: "5",   l10: "10",  l20: "20"  },
    { asset: "Stock Futures",      l1: "1",  l5: "3",   l10: "5",   l20: "10"  },
    { asset: "Index Options (CE/PE)", l1: "5", l5: "25", l10: "50", l20: "100" },
    { asset: "Stock Options",      l1: "2",  l5: "10",  l10: "20",  l20: "40"  },
    { asset: "Currency Futures",   l1: "5",  l5: "25",  l10: "50",  l20: "100" },
    { asset: "Commodity Futures",  l1: "1",  l5: "5",   l10: "10",  l20: "20"  },
  ];

  const PROHIBITED_IF = [
    "One-sided bets",
    "Grid trading",
    "High-frequency trading (trades under 60 seconds or excessive volume)",
    "Copy trading between unrelated accounts",
    "Usage of public third-party expert advisors (EAs)",
    "Reverse trading and group hedging",
    "Group copying / account management",
    "Account churning (rolling)",
    "Exploiting system glitches or platform inefficiencies",
  ];

  const INSTANT_SIZES = [
    { label: "₹1,00,000",  value: 100000  },
    { label: "₹5,00,000",  value: 500000  },
    { label: "₹10,00,000", value: 1000000 },
    { label: "₹20,00,000", value: 2000000 },
  ];

  const [acctSize, setAcctSize] = useState(500000);
  const [bestTrade2, setBestTrade2] = useState("");
  const bestNum2 = parseFloat(bestTrade2.replace(/,/g, "")) || 0;
  const fromCons2 = bestNum2 > 0 ? bestNum2 / 0.15 : 0;
  const fromFloor2 = acctSize * 0.05;
  const required2 = Math.max(fromCons2, fromFloor2);
  const rule2: "consistency" | "floor" | null = bestNum2 > 0 ? (fromCons2 >= fromFloor2 ? "consistency" : "floor") : null;
  const fmtINR = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to all rules
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <TrendingUp size={22} className="text-cyan-400" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold text-white">Instant Funding Rules</h2>
            <span className="text-cyan-300 text-sm font-semibold">Funded immediately · no evaluation phase</span>
          </div>
        </div>
        <p className="text-white/65 text-base leading-relaxed max-w-3xl">
          FundedWealth Instant gives you a <strong className="text-white">live funded account</strong> from day one — no challenge, no evaluation. Trade within the risk limits, hit the payout threshold, and withdraw on demand. Accounts scale automatically every 90 days based on performance.
        </p>
        <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/25">
          <p className="text-white/75 text-sm leading-relaxed">
            <strong className="text-amber-300">Important:</strong> Breaking a <strong className="text-red-400">Critical</strong> rule (Daily Drawdown, Max Drawdown) closes your account immediately. Hitting the <strong className="text-amber-200">4% Daily Profit Cap</strong> triggers a <strong className="text-amber-200">kill-switch</strong> — no new trades for the rest of that day.
          </p>
        </div>
      </div>

      {/* 1. Basics */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-cyan-400" /> The Basics
        </h3>
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            <div className="grid grid-cols-2 px-5 py-3 bg-white/[0.03]">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Parameter</span>
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Specification</span>
            </div>
            {BASICS.map((row, i) => (
              <div key={i} className="grid grid-cols-2 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-white/70 text-sm font-medium">{row.param}</span>
                <span className="text-white text-sm font-semibold">{row.spec}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 2. Risk Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-400" /> Risk Limits
        </h3>
        <div className="space-y-4">
          <Card className="glass-card border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical</span>
                <h4 className="text-white font-extrabold text-base">Daily Drawdown — 3%</h4>
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-3">You may not lose more than <strong className="text-white">3%</strong> of your account value per day. Limit recalculates at rollover based on the higher of Balance or Equity.</p>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55">
                <strong className="text-white/80">Example:</strong> ₹5,00,000 account → max daily loss = <strong className="text-red-300">₹15,000</strong>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical</span>
                <h4 className="text-white font-extrabold text-base">Max Drawdown — 5%</h4>
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-3">Total account loss cannot exceed <strong className="text-white">5%</strong> of starting balance.</p>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55">
                <strong className="text-white/80">Example:</strong> ₹5,00,000 account → balance cannot drop below <strong className="text-red-300">₹4,75,000</strong>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase">Kill-switch</span>
                <h4 className="text-white font-extrabold text-base">Daily Profit Cap — 4%</h4>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">Once daily profit reaches <strong className="text-white">4%</strong>, the kill-switch activates. No new trades for the rest of that day. Existing positions follow normal square-off rules.</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-cyan-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 uppercase">Per-trade</span>
                <h4 className="text-white font-extrabold text-base">Risk per Trade Idea — 1%</h4>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">Max <strong className="text-white">1%</strong> of starting balance per trade idea. A trade idea = all open positions on the same instrument in the same direction. Reopening same-direction on same instrument within <strong className="text-white">10 minutes</strong> = same idea, limit does not reset.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Max Lot Table */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Scale size={20} className="text-emerald-400" /> Max Lot Rule
        </h3>
        <Card className="glass-card border-white/10 overflow-x-auto">
          <div className="min-w-[580px]">
            <div className="grid grid-cols-5 px-4 py-3 bg-white/[0.03] text-xs font-bold text-white/40 uppercase tracking-widest">
              <span>Asset Class</span><span className="text-center">₹1L</span><span className="text-center">₹5L</span><span className="text-center">₹10L</span><span className="text-center">₹20L</span>
            </div>
            <div className="divide-y divide-white/5">
              {LOT_TABLE.map((row, i) => (
                <div key={i} className="grid grid-cols-5 px-4 py-3 hover:bg-white/[0.02] transition-colors text-sm">
                  <span className="text-white/70">{row.asset}</span>
                  <span className="text-center text-white font-semibold">{row.l1}</span>
                  <span className="text-center text-white font-semibold">{row.l5}</span>
                  <span className="text-center text-white font-semibold">{row.l10}</span>
                  <span className="text-center text-white font-semibold">{row.l20}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <p className="text-white/35 text-xs mt-2">Max lots per open position, per instrument per direction.</p>
      </div>

      {/* 3. Payouts */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-green-400" /> Payouts
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <p className="text-white/65 text-sm mb-4">Request a payout <strong className="text-white">on demand, anytime</strong>, once all of the following apply:</p>
            <div className="space-y-3 mb-5">
              {[
                { t: <>Minimum <strong className="text-cyan-200">7 trading days</strong> have passed</> },
                { t: <>Net profit is at least <strong className="text-cyan-200">5%</strong> of your starting balance</> },
                { t: <>Best single trade does not exceed <strong className="text-cyan-200">15%</strong> of total profit</> },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{row.t}</span>
                </div>
              ))}
            </div>

            {/* Payout calculator */}
            <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] p-4">
              <p className="text-cyan-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <TrendingUp size={11} /> Calculate your required overall profit
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Account size</label>
                  <select value={acctSize} onChange={(e) => setAcctSize(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer">
                    {INSTANT_SIZES.map((s) => (
                      <option key={s.value} value={s.value} className="bg-[#1A0030] text-white">{s.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Best trade profit (₹)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">₹</span>
                    <input type="number" min="0" placeholder="e.g. 5000" value={bestTrade2} onChange={(e) => setBestTrade2(e.target.value)}
                      className="w-full h-10 pl-7 pr-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium placeholder-white/25 focus:outline-none focus:border-cyan-500/50 transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Overall profit should be</label>
                  <div className={`h-10 px-3 rounded-lg border flex items-center text-sm font-bold transition-all ${bestNum2 > 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.03] border-white/10 text-white/30"}`}>
                    {bestNum2 > 0 ? fmtINR(required2) : "—"}
                  </div>
                  {bestNum2 > 0 && <p className="text-white/40 text-[11px] mt-1">or more{rule2 === "floor" && <span className="ml-1 text-cyan-300/70"> (5% floor applies)</span>}</p>}
                </div>
              </div>
              {bestNum2 > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  <div className={`px-3 py-2 rounded-lg border text-xs ${rule2 === "consistency" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200" : "bg-white/[0.02] border-white/5 text-white/35"}`}>
                    <span className="font-bold block mb-0.5">15% consistency rule</span>
                    {fmtINR(fromCons2)}{rule2 === "consistency" && <span className="ml-1 font-extrabold">← applies</span>}
                  </div>
                  <div className={`px-3 py-2 rounded-lg border text-xs ${rule2 === "floor" ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-200" : "bg-white/[0.02] border-white/5 text-white/35"}`}>
                    <span className="font-bold block mb-0.5">5% floor ({fmtINR(acctSize)} account)</span>
                    {fmtINR(fromFloor2)}{rule2 === "floor" && <span className="ml-1 font-extrabold">← applies</span>}
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">How to request a withdrawal</p>
              <div className="space-y-2">
                {["Ensure 7+ trading days have passed and profit ≥ 5% of starting balance",
                  "Verify consistency: best trade ≤ 15% of total profit",
                  "Go to Dashboard → Withdrawals → choose UPI / bank transfer"].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Prohibited Practices */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <XCircle size={20} className="text-red-400" /> Prohibited Practices
        </h3>
        <Card className="glass-card border-red-500/15">
          <CardContent className="p-6 space-y-2.5">
            {PROHIBITED_IF.map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                <span className="text-white/70 text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 5. News Trading */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" /> News Trading
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-white/65 text-sm leading-relaxed">
            Enabled by default. You're free to trade around major events (RBI policy, US Fed, NFP, etc.). <strong className="text-white">News straddling or execution designed to gain an unfair advantage is not permitted.</strong>
          </CardContent>
        </Card>
      </div>

      {/* 6. Holding Rules */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-cyan-400" /> Holding Rules
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 space-y-3">
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
              <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-white/80 text-sm"><strong className="text-white">Overnight positions not allowed.</strong> All open positions squared off at <strong className="text-white">3:15 PM IST</strong>.</span>
            </div>
            <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
              <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-white/80 text-sm"><strong className="text-white">Weekend holding not allowed.</strong> Close all positions by Friday 3:15 PM IST.</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. Trading Window */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-400" /> Trading Window
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 space-y-2.5">
            {["Market hours: 9:15 AM – 3:30 PM IST",
              "Trading allowed: 9:15 AM – 3:15 PM IST",
              "Auto square-off: 3:15 PM IST sharp — all positions closed automatically",
              "New orders blocked after 3:15 PM IST"].map((item, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                <Clock size={14} className="text-blue-400 shrink-0" />
                <span className="text-white/80 text-sm">{item}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 8. Account Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Lock size={20} className="text-purple-400" /> Account Limits
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-white/65 text-sm leading-relaxed space-y-2">
            <p>A <strong className="text-white">combined cap</strong> applies across all account types based on <strong className="text-white">starting balance only</strong>.</p>
            <p>Scaling balance increases do <strong className="text-white">not</strong> count toward the cap — only original funded amounts.</p>
          </CardContent>
        </Card>
      </div>

      {/* 9. Scaling */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Target size={20} className="text-emerald-400" /> Scaling
        </h3>
        <Card className="glass-card border-emerald-500/20">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[
                { label: "Trigger",    value: "Grow balance by ≥ 10% over a 90-day cycle" },
                { label: "Reward",     value: "+25% of your original starting balance added to account" },
                { label: "Frequency",  value: "Repeatable every 90 days" },
                { label: "Cap",        value: "Up to +100% of starting balance total increase" },
              ].map((row, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                  <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm"><strong className="text-white">{row.label}:</strong> {row.value}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm text-white/55">
              <strong className="text-emerald-300">Example:</strong> ₹5,00,000 → 10% growth in 90 days → account becomes ₹6,25,000. Repeat up to ₹10,00,000 total.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 10. Inactivity */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-white/40" /> Inactivity
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-white/65 text-sm leading-relaxed">
            If no trades are placed within <strong className="text-white">60 days</strong> of account purchase or since the last trade, the account is automatically closed.
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <Card className="border-0 overflow-hidden bg-gradient-to-br from-cyan-600 via-teal-600 to-cyan-700 shadow-2xl shadow-cyan-500/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-heading font-extrabold text-white mb-2">Ready to trade Instant?</h3>
          <p className="text-white/80 mb-5 text-sm">Live funded account. No evaluation. Withdraw on demand.</p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-cyan-700 hover:bg-white/90 rounded-full px-8 h-11 font-extrabold shadow-lg">
              <TrendingUp size={15} className="mr-2" /> Get Instant account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── 1-Step Rules full detail page ──────────────────────────────────────────
function OneStepRulesDetail({ onBack }: { onBack: () => void }) {
  const ONESTEP_SIZES = [
    { label: "₹1,00,000",  value: 100000  },
    { label: "₹5,00,000",  value: 500000  },
    { label: "₹10,00,000", value: 1000000 },
    { label: "₹25,00,000", value: 2500000 },
  ];
  const [acctSz, setAcctSz] = useState(500000);
  const [bestT, setBestT] = useState("");
  const bestN = parseFloat(bestT.replace(/,/g, "")) || 0;
  const fromCons = bestN > 0 ? bestN / 0.40 : 0;
  const fromFloor = acctSz * 0.05;
  const req = Math.max(fromCons, fromFloor);
  const rule3: "consistency" | "floor" | null = bestN > 0 ? (fromCons >= fromFloor ? "consistency" : "floor") : null;
  const fi = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const LOT_TABLE = [
    { asset: "Nifty 50 Futures",      l1: "2",  l5: "10",  l10: "20",  l25: "50"  },
    { asset: "Bank Nifty Futures",    l1: "1",  l5: "5",   l10: "10",  l25: "25"  },
    { asset: "Fin Nifty Futures",     l1: "1",  l5: "5",   l10: "10",  l25: "25"  },
    { asset: "Stock Futures",         l1: "1",  l5: "3",   l10: "5",   l25: "10"  },
    { asset: "Index Options (CE/PE)", l1: "5",  l5: "25",  l10: "50",  l25: "125" },
    { asset: "Stock Options",         l1: "2",  l5: "10",  l10: "20",  l25: "50"  },
    { asset: "Currency Futures",      l1: "5",  l5: "25",  l10: "50",  l25: "125" },
    { asset: "Commodity Futures",     l1: "1",  l5: "5",   l10: "10",  l25: "25"  },
  ];

  const PROHIBITED_1S = [
    "One-sided bets",
    "Grid trading",
    "High-frequency trading (trades under 60 seconds or excessive volume)",
    "Copy trading between unrelated accounts",
    "Usage of public third-party expert advisors (EAs)",
    "Reverse trading and group hedging",
    "Group copying / account management",
    "Account churning (rolling)",
    "Exploiting system glitches or platform inefficiencies",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to all rules
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center">
            <Target size={22} className="text-blue-400" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold text-white">1-Step Rules</h2>
            <span className="text-blue-300 text-sm font-semibold">One evaluation phase · then funded forever</span>
          </div>
        </div>
        <p className="text-white/65 text-base leading-relaxed max-w-3xl">
          Pass <strong className="text-white">one challenge</strong> — hit 10% profit in at least 5 trading days — and you're funded with no time limit. Once funded, trade the same risk limits with on-demand payouts and automatic scaling every 90 days.
        </p>
        <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/25">
          <p className="text-white/75 text-sm leading-relaxed">
            <strong className="text-amber-300">Important:</strong> Breaking a <strong className="text-red-400">Critical</strong> rule (Daily Drawdown, Max Drawdown) disqualifies your evaluation immediately. Hitting the <strong className="text-amber-200">4% Daily Profit Cap</strong> triggers a <strong className="text-amber-200">kill-switch</strong> — no new trades for the rest of that day.
          </p>
        </div>
      </div>

      {/* 1. Basics — two-column Evaluation vs Funded */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-blue-400" /> The Basics
        </h3>
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr] divide-x divide-white/10">
            {/* Evaluation column */}
            <div>
              <div className="flex items-center gap-2 px-5 py-3 bg-blue-500/10 border-b border-white/10">
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">1</div>
                <span className="text-blue-300 text-xs font-bold uppercase tracking-wider">1-Step Evaluation</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { p: "Profit Target",    v: "10%", hi: true },
                  { p: "Daily Drawdown",   v: "3%",  cr: true },
                  { p: "Max Drawdown",     v: "6%",  cr: true },
                  { p: "Min Trading Days", v: "5 days" },
                  { p: "Leverage",         v: "1:30" },
                  { p: "Profit Split",     v: "80%" },
                  { p: "Time Limit",       v: "Unlimited" },
                  { p: "Max Risk/Trade",   v: "1.5% of balance" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-white/60">{r.p}</span>
                    <span className={r.cr ? "text-red-300 font-bold" : r.hi ? "text-green-400 font-bold" : "text-white font-semibold"}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Funded column */}
            <div>
              <div className="flex items-center gap-2 px-5 py-3 bg-emerald-500/10 border-b border-white/10">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Funded Trader</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { p: "Profit Target",    v: "None" },
                  { p: "Daily Drawdown",   v: "3%",  cr: true },
                  { p: "Max Drawdown",     v: "6%",  cr: true },
                  { p: "Min Trading Days", v: "3 days per payout" },
                  { p: "Leverage",         v: "1:30" },
                  { p: "Profit Split",     v: "80%" },
                  { p: "Payout Threshold", v: "5% net profit" },
                  { p: "Max Risk/Trade",   v: "1.5% of balance" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between px-5 py-3 text-sm">
                    <span className="text-white/60">{r.p}</span>
                    <span className={r.cr ? "text-red-300 font-bold" : "text-white font-semibold"}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Risk Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-400" /> Risk Limits
        </h3>
        <div className="space-y-4">
          <Card className="glass-card border-red-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical</span><h4 className="text-white font-extrabold text-base">Daily Drawdown — 3%</h4></div>
            <p className="text-white/65 text-sm mb-3">Max <strong className="text-white">3%</strong> loss per day. Recalculates at rollover from the higher of Balance or Equity.</p>
            <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55"><strong className="text-white/80">Example:</strong> ₹5,00,000 account → max daily loss = <strong className="text-red-300">₹15,000</strong></div>
          </CardContent></Card>
          <Card className="glass-card border-red-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical</span><h4 className="text-white font-extrabold text-base">Max Drawdown — 6%</h4></div>
            <p className="text-white/65 text-sm mb-3">Total account loss cannot exceed <strong className="text-white">6%</strong> of starting balance.</p>
            <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55"><strong className="text-white/80">Example:</strong> ₹5,00,000 account → cannot drop below <strong className="text-red-300">₹4,70,000</strong></div>
          </CardContent></Card>
          <Card className="glass-card border-amber-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase">Kill-switch</span><h4 className="text-white font-extrabold text-base">Daily Profit Cap — 4%</h4></div>
            <p className="text-white/65 text-sm">Once daily profit hits <strong className="text-white">4%</strong>, the kill-switch activates — no new orders for the rest of that session. Applies in both evaluation and funded phases.</p>
          </CardContent></Card>
          <Card className="glass-card border-blue-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-blue-500/15 border border-blue-500/30 text-blue-300 uppercase">Per-trade</span><h4 className="text-white font-extrabold text-base">Max Risk per Trade — 1.5%</h4></div>
            <p className="text-white/65 text-sm">No single trade should risk more than <strong className="text-white">1.5%</strong> of your account balance. Applies in both evaluation and funded phases.</p>
          </CardContent></Card>
        </div>
      </div>

      {/* Max Lot Table */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Scale size={20} className="text-emerald-400" /> Max Lot Rule</h3>
        <Card className="glass-card border-white/10 overflow-x-auto">
          <div className="min-w-[580px]">
            <div className="grid grid-cols-5 px-4 py-3 bg-white/[0.03] text-xs font-bold text-white/40 uppercase tracking-widest">
              <span>Asset Class</span><span className="text-center">₹1L</span><span className="text-center">₹5L</span><span className="text-center">₹10L</span><span className="text-center">₹25L</span>
            </div>
            <div className="divide-y divide-white/5">
              {LOT_TABLE.map((row, i) => (
                <div key={i} className="grid grid-cols-5 px-4 py-3 hover:bg-white/[0.02] transition-colors text-sm">
                  <span className="text-white/70">{row.asset}</span>
                  <span className="text-center text-white font-semibold">{row.l1}</span>
                  <span className="text-center text-white font-semibold">{row.l5}</span>
                  <span className="text-center text-white font-semibold">{row.l10}</span>
                  <span className="text-center text-white font-semibold">{row.l25}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <p className="text-white/35 text-xs mt-2">Max lots per open position, per instrument per direction.</p>
      </div>

      {/* 3. Payouts */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><CreditCard size={20} className="text-green-400" /> Payouts</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6">
          <p className="text-white/65 text-sm mb-4">Request a payout <strong className="text-white">on demand, anytime</strong> once funded, provided all of the following apply:</p>
          <div className="space-y-3 mb-5">
            {[
              <><strong className="text-blue-200">3 trading days</strong> have passed since the last payout (or since funded date)</>,
              <>Net profit is at least <strong className="text-blue-200">5%</strong> of your starting balance</>,
              <>Best single day's profit does not exceed <strong className="text-blue-200">40%</strong> of your total profit (consistency rule)</>,
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">{t}</span>
              </div>
            ))}
          </div>

          {/* Payout calculator */}
          <div className="mb-5 rounded-xl border border-blue-500/20 bg-blue-500/[0.04] p-4">
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Target size={11} /> Calculate your required overall profit
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Account size</label>
                <select value={acctSz} onChange={e => setAcctSz(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-blue-500/50 transition-colors appearance-none cursor-pointer">
                  {ONESTEP_SIZES.map(s => <option key={s.value} value={s.value} className="bg-[#1A0030] text-white">{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Best day profit (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">₹</span>
                  <input type="number" min="0" placeholder="e.g. 8000" value={bestT} onChange={e => setBestT(e.target.value)}
                    className="w-full h-10 pl-7 pr-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium placeholder-white/25 focus:outline-none focus:border-blue-500/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Overall profit should be</label>
                <div className={`h-10 px-3 rounded-lg border flex items-center text-sm font-bold transition-all ${bestN > 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.03] border-white/10 text-white/30"}`}>
                  {bestN > 0 ? fi(req) : "—"}
                </div>
                {bestN > 0 && <p className="text-white/40 text-[11px] mt-1">or more{rule3 === "floor" && <span className="ml-1 text-blue-300/70"> (5% floor applies)</span>}</p>}
              </div>
            </div>
            {bestN > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <div className={`px-3 py-2 rounded-lg border text-xs ${rule3 === "consistency" ? "bg-blue-500/10 border-blue-500/30 text-blue-200" : "bg-white/[0.02] border-white/5 text-white/35"}`}>
                  <span className="font-bold block mb-0.5">40% consistency rule</span>
                  {fi(fromCons)}{rule3 === "consistency" && <span className="ml-1 font-extrabold">← applies</span>}
                </div>
                <div className={`px-3 py-2 rounded-lg border text-xs ${rule3 === "floor" ? "bg-blue-500/10 border-blue-500/30 text-blue-200" : "bg-white/[0.02] border-white/5 text-white/35"}`}>
                  <span className="font-bold block mb-0.5">5% floor ({fi(acctSz)} account)</span>
                  {fi(fromFloor)}{rule3 === "floor" && <span className="ml-1 font-extrabold">← applies</span>}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">How to request a withdrawal</p>
            <div className="space-y-2">
              {["Ensure 3+ trading days since funded / last payout and profit ≥ 5% of starting balance",
                "Verify consistency: best day ≤ 40% of total profit",
                "Go to Dashboard → Withdrawals → choose UPI / bank transfer"].map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>{s}
                </div>
              ))}
            </div>
          </div>
        </CardContent></Card>
      </div>

      {/* 4. Prohibited */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><XCircle size={20} className="text-red-400" /> Prohibited Practices</h3>
        <Card className="glass-card border-red-500/15"><CardContent className="p-6 space-y-2.5">
          {PROHIBITED_1S.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </CardContent></Card>
      </div>

      {/* 5. News Trading */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-400" /> News Trading</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 text-white/65 text-sm leading-relaxed">
          Enabled by default. You're free to trade around major events (RBI policy, US Fed, NFP, etc.). <strong className="text-white">News straddling or execution designed to gain an unfair advantage is not permitted.</strong>
        </CardContent></Card>
      </div>

      {/* 6. Holding Rules */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Clock size={20} className="text-blue-400" /> Holding Rules</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 space-y-3">
          {[
            { ok: false, text: <><strong className="text-white">Overnight positions not allowed.</strong> All open positions squared off at <strong className="text-white">3:15 PM IST</strong>.</> },
            { ok: false, text: <><strong className="text-white">Weekend holding not allowed.</strong> Close all positions by Friday 3:15 PM IST.</> },
            { ok: true,  text: <>Index options: <strong className="text-white">buying only</strong> — option writing (selling) is not permitted.</> },
            { ok: true,  text: <><strong className="text-white">Hedging is not allowed.</strong></> },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
              {r.ok ? <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" /> : <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />}
              <span className="text-white/80 text-sm">{r.text}</span>
            </div>
          ))}
        </CardContent></Card>
      </div>

      {/* 7. Trading Window */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Clock size={20} className="text-cyan-400" /> Trading Window</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 space-y-2.5">
          {["Market hours: 9:15 AM – 3:30 PM IST",
            "Trading allowed: 9:15 AM – 3:15 PM IST",
            "Auto square-off: 3:15 PM IST sharp — all positions closed automatically",
            "New orders blocked after 3:15 PM IST"].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <Clock size={14} className="text-cyan-400 shrink-0" />
              <span className="text-white/80 text-sm">{item}</span>
            </div>
          ))}
        </CardContent></Card>
      </div>

      {/* 8. Account Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Lock size={20} className="text-purple-400" /> Account Limits</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 text-white/65 text-sm leading-relaxed space-y-2">
          <p>A <strong className="text-white">combined cap</strong> applies across all account types based on <strong className="text-white">starting balance only</strong>.</p>
          <p>Scaling balance increases do <strong className="text-white">not</strong> count toward the cap — only original funded amounts.</p>
        </CardContent></Card>
      </div>

      {/* 9. Scaling */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Target size={20} className="text-emerald-400" /> Scaling</h3>
        <Card className="glass-card border-emerald-500/20"><CardContent className="p-6">
          <div className="space-y-3">
            {[
              { label: "Trigger",   value: "Grow balance by ≥ 10% over a 90-day cycle" },
              { label: "Reward",    value: "+25% of your original starting balance added to account" },
              { label: "Frequency", value: "Repeatable every 90 days" },
              { label: "Cap",       value: "Up to +100% of starting balance total increase" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm"><strong className="text-white">{r.label}:</strong> {r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm text-white/55">
            <strong className="text-emerald-300">Example:</strong> ₹5,00,000 → 10% growth in 90 days → account becomes ₹6,25,000. Repeat up to ₹10,00,000 total.
          </div>
        </CardContent></Card>
      </div>

      {/* 10. Inactivity */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-white/40" /> Inactivity</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 text-white/65 text-sm leading-relaxed">
          If no trades are placed within <strong className="text-white">60 days</strong> of account purchase or since the last trade, the account is automatically closed.
        </CardContent></Card>
      </div>

      {/* CTA */}
      <Card className="border-0 overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 shadow-2xl shadow-blue-500/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-heading font-extrabold text-white mb-2">Ready for the 1-Step?</h3>
          <p className="text-white/80 mb-5 text-sm">One challenge. No time limit. Get funded and keep trading.</p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90 rounded-full px-8 h-11 font-extrabold shadow-lg">
              <Target size={15} className="mr-2" /> Start 1-Step challenge
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


// ─── 2-Step Rules full detail page ──────────────────────────────────────────
function TwoStepRulesDetail({ onBack }: { onBack: () => void }) {
  const TWOSTEP_SIZES = [
    { label: "₹5,00,000",  value: 500000  },
    { label: "₹10,00,000", value: 1000000 },
    { label: "₹25,00,000", value: 2500000 },
  ];
  const [acctSz2, setAcctSz2] = useState(1000000);
  const [bestDay2, setBestDay2] = useState("");
  const bestDayN = parseFloat(bestDay2.replace(/,/g, "")) || 0;
  // Funded: consistency = 40% (best day ≤ 40% of total profit → total ≥ best ÷ 0.40)
  const fromCons2s = bestDayN > 0 ? bestDayN / 0.40 : 0;
  const fromFloor2s = acctSz2 * 0.05;
  const req2s = Math.max(fromCons2s, fromFloor2s);
  const rule2s: "consistency" | "floor" | null = bestDayN > 0 ? (fromCons2s >= fromFloor2s ? "consistency" : "floor") : null;
  const fi2 = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

  const LOT_TABLE_2S = [
    { asset: "Nifty 50 Futures",      l5: "10",  l10: "20",  l25: "50"  },
    { asset: "Bank Nifty Futures",    l5: "5",   l10: "10",  l25: "25"  },
    { asset: "Fin Nifty Futures",     l5: "5",   l10: "10",  l25: "25"  },
    { asset: "Stock Futures",         l5: "3",   l10: "5",   l25: "10"  },
    { asset: "Index Options (CE/PE)", l5: "25",  l10: "50",  l25: "125" },
    { asset: "Stock Options",         l5: "10",  l10: "20",  l25: "50"  },
    { asset: "Currency Futures",      l5: "25",  l10: "50",  l25: "125" },
    { asset: "Commodity Futures",     l5: "5",   l10: "10",  l25: "25"  },
  ];

  const PROHIBITED_2S = [
    "One-sided bets",
    "Grid trading",
    "High-frequency trading (trades under 60 seconds or excessive volume)",
    "Copy trading between unrelated accounts",
    "Usage of public third-party expert advisors (EAs)",
    "Reverse trading and group hedging",
    "Group copying / account management",
    "Account churning (rolling)",
    "Exploiting system glitches or platform inefficiencies",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors">
        <ArrowLeft size={15} /> Back to all rules
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
            <Layers size={22} className="text-purple-400" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold text-white">2-Step Rules</h2>
            <span className="text-purple-300 text-sm font-semibold">Two evaluation phases · lower drawdown when funded</span>
          </div>
        </div>
        <p className="text-white/65 text-base leading-relaxed max-w-3xl">
          Pass <strong className="text-white">two challenges</strong> — Phase 1 (8% target) then Phase 2 (5% target) — and you're funded with the tightest drawdown buffer dropping to <strong className="text-white">6%</strong>. Once funded, trade with on-demand payouts, automatic scaling, and a consistency rule that activates only after you're funded.
        </p>
        <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/25">
          <p className="text-white/75 text-sm leading-relaxed">
            <strong className="text-amber-300">Important:</strong> Breaking a <strong className="text-red-400">Critical</strong> rule disqualifies the current phase immediately. Hitting the <strong className="text-amber-200">4% Daily Profit Cap</strong> triggers a <strong className="text-amber-200">kill-switch</strong> — no new trades for the rest of that day.
          </p>
        </div>
      </div>

      {/* 1. Basics — three-column */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-purple-400" /> The Basics
        </h3>
        <Card className="glass-card border-white/10 overflow-hidden overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-3 divide-x divide-white/10">
            {/* Phase 1 */}
            <div>
              <div className="flex items-center gap-2 px-4 py-3 bg-purple-500/10 border-b border-white/10">
                <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white text-[10px] font-bold">1</div>
                <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">Phase 1</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { p: "Profit Target", v: "8%", hi: true },
                  { p: "Daily Drawdown", v: "3%", cr: true },
                  { p: "Max Drawdown", v: "8%", cr: true },
                  { p: "Min Days", v: "5 days" },
                  { p: "Leverage", v: "1:30" },
                  { p: "Consistency", v: "None" },
                  { p: "Time Limit", v: "Unlimited" },
                  { p: "Max Risk/Trade", v: "1.5%" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-white/60">{r.p}</span>
                    <span className={r.cr ? "text-red-300 font-bold" : r.hi ? "text-green-400 font-bold" : "text-white font-semibold"}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Phase 2 */}
            <div>
              <div className="flex items-center gap-2 px-4 py-3 bg-purple-500/10 border-b border-white/10">
                <div className="w-5 h-5 rounded-full bg-purple-400 flex items-center justify-center text-white text-[10px] font-bold">2</div>
                <span className="text-purple-300 text-xs font-bold uppercase tracking-wider">Phase 2</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { p: "Profit Target", v: "5%", hi: true },
                  { p: "Daily Drawdown", v: "3%", cr: true },
                  { p: "Max Drawdown", v: "8%", cr: true },
                  { p: "Min Days", v: "5 days" },
                  { p: "Leverage", v: "1:30" },
                  { p: "Consistency", v: "None" },
                  { p: "Time Limit", v: "Unlimited" },
                  { p: "Max Risk/Trade", v: "1.5%" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-white/60">{r.p}</span>
                    <span className={r.cr ? "text-red-300 font-bold" : r.hi ? "text-green-400 font-bold" : "text-white font-semibold"}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Funded */}
            <div>
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-500/10 border-b border-white/10">
                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                <span className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Funded Trader</span>
              </div>
              <div className="divide-y divide-white/5">
                {[
                  { p: "Profit Target", v: "None" },
                  { p: "Daily Drawdown", v: "3%", cr: true },
                  { p: "Max Drawdown", v: "6%", cr: true },
                  { p: "Min Days", v: "3 days/payout" },
                  { p: "Leverage", v: "1:30" },
                  { p: "Consistency", v: "40% best day", note: true },
                  { p: "Payout Threshold", v: "5% net profit" },
                  { p: "Profit Split", v: "80%" },
                ].map((r, i) => (
                  <div key={i} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-white/60">{r.p}</span>
                    <span className={r.cr ? "text-red-300 font-bold" : r.note ? "text-amber-200 font-bold" : "text-white font-semibold"}>{r.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 2. Risk Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-400" /> Risk Limits
        </h3>
        <div className="space-y-4">
          <Card className="glass-card border-red-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical — both phases</span><h4 className="text-white font-extrabold text-base">Daily Drawdown — 3%</h4></div>
            <p className="text-white/65 text-sm mb-3">Max <strong className="text-white">3%</strong> loss per day across all phases. Recalculates at rollover based on higher of Balance or Equity.</p>
            <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55"><strong className="text-white/80">Example:</strong> ₹10,00,000 account → max daily loss = <strong className="text-red-300">₹30,000</strong></div>
          </CardContent></Card>
          <Card className="glass-card border-red-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical</span><h4 className="text-white font-extrabold text-base">Max Drawdown — 8% eval · 6% funded</h4></div>
            <p className="text-white/65 text-sm mb-3">During both evaluation phases: <strong className="text-white">8%</strong> of starting balance. Once funded: drops to <strong className="text-white">6%</strong> — tighter protection once you're trading real capital.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55"><strong className="text-white/80">Phase 1/2:</strong> ₹10,00,000 → floor <strong className="text-red-300">₹9,20,000</strong></div>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55"><strong className="text-white/80">Funded:</strong> ₹10,00,000 → floor <strong className="text-emerald-300">₹9,40,000</strong></div>
            </div>
          </CardContent></Card>
          <Card className="glass-card border-amber-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase">Kill-switch</span><h4 className="text-white font-extrabold text-base">Daily Profit Cap — 4%</h4></div>
            <p className="text-white/65 text-sm">Once daily profit hits <strong className="text-white">4%</strong>, no new orders for the rest of that session. Applies in both evaluation and funded phases.</p>
          </CardContent></Card>
          <Card className="glass-card border-purple-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-300 uppercase">Per-trade</span><h4 className="text-white font-extrabold text-base">Max Risk per Trade — 1.5%</h4></div>
            <p className="text-white/65 text-sm">No single trade should risk more than <strong className="text-white">1.5%</strong> of your account balance. Applies in all phases.</p>
          </CardContent></Card>
          <Card className="glass-card border-cyan-500/20"><CardContent className="p-6">
            <div className="flex items-center gap-2 mb-3"><span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 uppercase">Funded only</span><h4 className="text-white font-extrabold text-base">Consistency Rule — 40%</h4></div>
            <p className="text-white/65 text-sm"><strong className="text-white">No consistency rule during evaluation.</strong> Once funded: your best single day's profit must not exceed <strong className="text-white">40%</strong> of your total profit to qualify for a payout.</p>
          </CardContent></Card>
        </div>
      </div>

      {/* Max Lot Table */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Scale size={20} className="text-emerald-400" /> Max Lot Rule</h3>
        <Card className="glass-card border-white/10 overflow-x-auto">
          <div className="min-w-[520px]">
            <div className="grid grid-cols-4 px-4 py-3 bg-white/[0.03] text-xs font-bold text-white/40 uppercase tracking-widest">
              <span>Asset Class</span><span className="text-center">₹5L</span><span className="text-center">₹10L</span><span className="text-center">₹25L</span>
            </div>
            <div className="divide-y divide-white/5">
              {LOT_TABLE_2S.map((row, i) => (
                <div key={i} className="grid grid-cols-4 px-4 py-3 hover:bg-white/[0.02] transition-colors text-sm">
                  <span className="text-white/70">{row.asset}</span>
                  <span className="text-center text-white font-semibold">{row.l5}</span>
                  <span className="text-center text-white font-semibold">{row.l10}</span>
                  <span className="text-center text-white font-semibold">{row.l25}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
        <p className="text-white/35 text-xs mt-2">Max lots per open position, per instrument per direction.</p>
      </div>

      {/* 3. Payouts */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><CreditCard size={20} className="text-green-400" /> Payouts</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6">
          <p className="text-white/65 text-sm mb-4">Payouts are only available once <strong className="text-white">funded</strong>. Request <strong className="text-white">on demand, anytime</strong>, provided:</p>
          <div className="space-y-3 mb-5">
            {[
              <><strong className="text-purple-200">3 trading days</strong> have passed since funded / last payout</>,
              <>Net profit is at least <strong className="text-purple-200">5%</strong> of your starting balance</>,
              <>Best single day's profit does not exceed <strong className="text-purple-200">40%</strong> of your total profit (consistency rule)</>,
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">{t}</span>
              </div>
            ))}
          </div>

          {/* Funded payout calculator */}
          <div className="mb-5 rounded-xl border border-purple-500/20 bg-purple-500/[0.04] p-4">
            <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Layers size={11} /> Calculate your required overall profit (funded phase)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Account size</label>
                <select value={acctSz2} onChange={e => setAcctSz2(Number(e.target.value))}
                  className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-purple-500/50 transition-colors appearance-none cursor-pointer">
                  {TWOSTEP_SIZES.map(s => <option key={s.value} value={s.value} className="bg-[#1A0030] text-white">{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Best day profit (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">₹</span>
                  <input type="number" min="0" placeholder="e.g. 12000" value={bestDay2} onChange={e => setBestDay2(e.target.value)}
                    className="w-full h-10 pl-7 pr-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium placeholder-white/25 focus:outline-none focus:border-purple-500/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Overall profit should be</label>
                <div className={`h-10 px-3 rounded-lg border flex items-center text-sm font-bold transition-all ${bestDayN > 0 ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" : "bg-white/[0.03] border-white/10 text-white/30"}`}>
                  {bestDayN > 0 ? fi2(req2s) : "—"}
                </div>
                {bestDayN > 0 && <p className="text-white/40 text-[11px] mt-1">or more{rule2s === "floor" && <span className="ml-1 text-purple-300/70"> (5% floor)</span>}</p>}
              </div>
            </div>
            {bestDayN > 0 && (
              <div className="grid grid-cols-2 gap-2">
                <div className={`px-3 py-2 rounded-lg border text-xs ${rule2s === "consistency" ? "bg-purple-500/10 border-purple-500/30 text-purple-200" : "bg-white/[0.02] border-white/5 text-white/35"}`}>
                  <span className="font-bold block mb-0.5">40% consistency rule</span>
                  {fi2(fromCons2s)}{rule2s === "consistency" && <span className="ml-1 font-extrabold">← applies</span>}
                </div>
                <div className={`px-3 py-2 rounded-lg border text-xs ${rule2s === "floor" ? "bg-purple-500/10 border-purple-500/30 text-purple-200" : "bg-white/[0.02] border-white/5 text-white/35"}`}>
                  <span className="font-bold block mb-0.5">5% floor ({fi2(acctSz2)} account)</span>
                  {fi2(fromFloor2s)}{rule2s === "floor" && <span className="ml-1 font-extrabold">← applies</span>}
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/5 pt-4">
            <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">How to request a withdrawal</p>
            <div className="space-y-2">
              {["Ensure 3+ trading days since funded / last payout and profit ≥ 5% of starting balance",
                "Verify consistency: best day ≤ 40% of total profit",
                "Go to Dashboard → Withdrawals → choose UPI / bank transfer"].map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                  <span className="w-5 h-5 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>{s}
                </div>
              ))}
            </div>
          </div>
        </CardContent></Card>
      </div>

      {/* 4. Prohibited */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><XCircle size={20} className="text-red-400" /> Prohibited Practices</h3>
        <Card className="glass-card border-red-500/15"><CardContent className="p-6 space-y-2.5">
          {PROHIBITED_2S.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <XCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
              <span className="text-white/70 text-sm">{item}</span>
            </div>
          ))}
        </CardContent></Card>
      </div>

      {/* 5. News Trading */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><TrendingUp size={20} className="text-blue-400" /> News Trading</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 text-white/65 text-sm leading-relaxed">
          Enabled by default. Free to trade around major events (RBI policy, US Fed, NFP). <strong className="text-white">News straddling or execution designed to gain an unfair advantage is not permitted.</strong>
        </CardContent></Card>
      </div>

      {/* 6. Holding Rules */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Clock size={20} className="text-purple-400" /> Holding Rules</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 space-y-3">
          {[
            { ok: false, text: <><strong className="text-white">Overnight positions not allowed.</strong> All positions squared off at <strong className="text-white">3:15 PM IST</strong>.</> },
            { ok: false, text: <><strong className="text-white">Weekend holding not allowed.</strong> Close by Friday 3:15 PM IST.</> },
            { ok: false, text: <>Index options: <strong className="text-white">buying only</strong> — option writing is not permitted.</> },
            { ok: false, text: <><strong className="text-white">Hedging is not allowed.</strong></> },
          ].map((r, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
              <XCircle size={15} className="text-red-400 shrink-0 mt-0.5" />
              <span className="text-white/80 text-sm">{r.text}</span>
            </div>
          ))}
        </CardContent></Card>
      </div>

      {/* 7. Trading Window */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Clock size={20} className="text-cyan-400" /> Trading Window</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 space-y-2.5">
          {["Market hours: 9:15 AM – 3:30 PM IST",
            "Trading allowed: 9:15 AM – 3:15 PM IST",
            "Auto square-off: 3:15 PM IST sharp — all positions closed automatically",
            "New orders blocked after 3:15 PM IST"].map((item, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
              <Clock size={14} className="text-cyan-400 shrink-0" />
              <span className="text-white/80 text-sm">{item}</span>
            </div>
          ))}
        </CardContent></Card>
      </div>

      {/* 8. Account Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Lock size={20} className="text-purple-400" /> Account Limits</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 text-white/65 text-sm leading-relaxed space-y-2">
          <p>A <strong className="text-white">combined cap</strong> applies across all account types based on <strong className="text-white">starting balance only</strong>.</p>
          <p>Scaling balance increases do <strong className="text-white">not</strong> count toward the cap — only original funded amounts.</p>
        </CardContent></Card>
      </div>

      {/* 9. Scaling */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Target size={20} className="text-emerald-400" /> Scaling</h3>
        <Card className="glass-card border-emerald-500/20"><CardContent className="p-6">
          <div className="space-y-3">
            {[
              { label: "Trigger",   value: "Grow funded balance by ≥ 10% over a 90-day cycle" },
              { label: "Reward",    value: "+25% of your original starting balance added to account" },
              { label: "Frequency", value: "Repeatable every 90 days" },
              { label: "Cap",       value: "Up to +100% of starting balance total increase" },
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm"><strong className="text-white">{r.label}:</strong> {r.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-sm text-white/55">
            <strong className="text-emerald-300">Example:</strong> ₹10,00,000 → 10% growth in 90 days → account becomes ₹12,50,000. Repeat up to ₹20,00,000 total.
          </div>
        </CardContent></Card>
      </div>

      {/* 10. Inactivity */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-white/40" /> Inactivity</h3>
        <Card className="glass-card border-white/10"><CardContent className="p-6 text-white/65 text-sm leading-relaxed">
          If no trades are placed within <strong className="text-white">60 days</strong> of account purchase or since the last trade, the account is automatically closed. Applies across all phases.
        </CardContent></Card>
      </div>

      {/* CTA */}
      <Card className="border-0 overflow-hidden bg-gradient-to-br from-purple-600 via-violet-600 to-purple-700 shadow-2xl shadow-purple-500/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-heading font-extrabold text-white mb-2">Ready for the 2-Step?</h3>
          <p className="text-white/80 mb-5 text-sm">Two phases. No time limit. Lower drawdown when funded.</p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-purple-700 hover:bg-white/90 rounded-full px-8 h-11 font-extrabold shadow-lg">
              <Layers size={15} className="mr-2" /> Start 2-Step challenge
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}


const FLASH_SIZES = [
  { label: "₹50,000",     value: 50000   },
  { label: "₹1,00,000",   value: 100000  },
  { label: "₹2,50,000",   value: 250000  },
  { label: "₹5,00,000",   value: 500000  },
  { label: "₹10,00,000",  value: 1000000 },
];

function formatINR(n: number): string {
  return "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

function PayoutCalculator() {
  const [bestTrade, setBestTrade] = useState("");
  const [accountSize, setAccountSize] = useState(250000);

  const bestTradeNum = parseFloat(bestTrade.replace(/,/g, "")) || 0;

  // Rule 1 — consistency: best trade ≤ 15% of total profit → total ≥ best ÷ 0.15
  const fromConsistency = bestTradeNum > 0 ? bestTradeNum / 0.15 : 0;
  // Rule 2 — 3% floor on starting balance
  const fromFloor = accountSize * 0.03;
  // Required = whichever is higher
  const required = Math.max(fromConsistency, fromFloor);

  const activeRule: "consistency" | "floor" | null =
    bestTradeNum > 0
      ? fromConsistency >= fromFloor ? "consistency" : "floor"
      : null;

  return (
    <div className="mb-5 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
      <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
        <Zap size={11} /> Calculate your required overall profit
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
        {/* Account size selector */}
        <div>
          <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Account size</label>
          <select
            value={accountSize}
            onChange={(e) => setAccountSize(Number(e.target.value))}
            className="w-full h-10 px-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium focus:outline-none focus:border-amber-500/50 transition-colors appearance-none cursor-pointer"
          >
            {FLASH_SIZES.map((s) => (
              <option key={s.value} value={s.value} className="bg-[#1A0030] text-white">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Best trade input */}
        <div>
          <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Best trade profit (₹)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm pointer-events-none">₹</span>
            <input
              type="number"
              min="0"
              placeholder="e.g. 1500"
              value={bestTrade}
              onChange={(e) => setBestTrade(e.target.value)}
              className="w-full h-10 pl-7 pr-3 rounded-lg bg-white/[0.06] border border-white/15 text-white text-sm font-medium placeholder-white/25 focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Result */}
        <div>
          <label className="block text-white/45 text-[11px] font-semibold mb-1.5 uppercase tracking-wider">Overall profit should be</label>
          <div className={`h-10 px-3 rounded-lg border flex items-center text-sm font-bold transition-all ${
            bestTradeNum > 0
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-white/[0.03] border-white/10 text-white/30"
          }`}>
            {bestTradeNum > 0 ? formatINR(required) : "—"}
          </div>
          {bestTradeNum > 0 && (
            <p className="text-white/40 text-[11px] mt-1">
              or more
              {activeRule === "floor" && (
                <span className="ml-1 text-amber-300/70">(3% floor applies)</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Breakdown */}
      {bestTradeNum > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-1">
          <div className={`px-3 py-2 rounded-lg border text-xs transition-all ${
            activeRule === "consistency"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
              : "bg-white/[0.02] border-white/5 text-white/35"
          }`}>
            <span className="font-bold block mb-0.5">15% consistency rule</span>
            {formatINR(fromConsistency)}
            {activeRule === "consistency" && <span className="ml-1 font-extrabold">← applies</span>}
          </div>
          <div className={`px-3 py-2 rounded-lg border text-xs transition-all ${
            activeRule === "floor"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
              : "bg-white/[0.02] border-white/5 text-white/35"
          }`}>
            <span className="font-bold block mb-0.5">3% floor ({formatINR(accountSize)} account)</span>
            {formatINR(fromFloor)}
            {activeRule === "floor" && <span className="ml-1 font-extrabold">← applies</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Flash Rules full detail page ────────────────────────────────────────────
function FlashRulesDetail({ onBack }: { onBack: () => void }) {
  const BASICS = [
    { param: "Trading time",        spec: "24 hours from the first trade" },
    { param: "Open trades limit",   spec: "One open trade at a time" },
    { param: "Profit split",        spec: "80%" },
    { param: "Payout cycle",        spec: "Eligible after 24 hours" },
    { param: "Payout threshold",    spec: "3% net profit" },
    { param: "Profit target",       spec: "None — instant funded" },
    { param: "Consistency rule",    spec: "15% best-trade rule" },
    { param: "Daily profit cap",    spec: "4% — triggers kill-switch for the day" },
    { param: "Scaling",             spec: "Not available" },
  ];

  const PROHIBITED = [
    "Opening multiple small trades of the same idea to bypass the consistency rule",
    "One-sided bets",
    "Grid trading",
    "High-frequency trading (trades under 60 seconds or excessive volume)",
    "Copy trading between unrelated accounts",
    "Usage of public third-party expert advisors (EAs)",
    "Reverse trading and group hedging",
    "Group copying / account management",
    "Account churning (rolling)",
    "Exploiting system glitches or platform inefficiencies",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-white/50 hover:text-white text-sm mb-8 transition-colors"
      >
        <ArrowLeft size={15} /> Back to all rules
      </button>

      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
            <Zap size={22} className="text-amber-400" />
          </div>
          <div>
            <h2 className="text-3xl font-heading font-extrabold text-white">Flash Rules</h2>
            <span className="text-amber-300 text-sm font-semibold">Instant funded · 24-hour account</span>
          </div>
        </div>
        <p className="text-white/65 text-base leading-relaxed max-w-3xl">
          FundedWealth Flash gives instant access to a live trading account, active for <strong className="text-white">24 hours</strong> from your first trade.
          Only <strong className="text-white">one trade</strong> can be open at a time. Profits are shared at an <strong className="text-white">80% split</strong>,
          and the account closes automatically when the period ends. Meet the payout threshold and the consistency rule to qualify for a payout.
        </p>
        <div className="mt-5 p-4 rounded-xl bg-amber-500/5 border border-amber-500/25">
          <p className="text-white/75 text-sm leading-relaxed">
            <strong className="text-amber-300">Important:</strong> Breaking a <strong className="text-red-400">Critical</strong> rule
            (Daily Drawdown, Max Drawdown) disqualifies your account immediately. Hitting the{" "}
            <strong className="text-amber-200">4% Daily Profit Cap</strong> triggers a{" "}
            <strong className="text-amber-200">kill-switch</strong> — no new trades for the rest of that day.
          </p>
        </div>
      </div>

      {/* The Basics table */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <BarChart2 size={20} className="text-amber-400" /> The Basics
        </h3>
        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="divide-y divide-white/5">
            <div className="grid grid-cols-2 px-5 py-3 bg-white/[0.03]">
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Parameter</span>
              <span className="text-white/40 text-xs font-bold uppercase tracking-widest">Specification</span>
            </div>
            {BASICS.map((row, i) => (
              <div key={i} className="grid grid-cols-2 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <span className="text-white/70 text-sm font-medium">{row.param}</span>
                <span className={`text-sm font-semibold ${
                  row.param.includes("profit cap") || row.param.includes("consistency") ? "text-amber-200" : "text-white"
                }`}>{row.spec}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Risk Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-400" /> Risk Limits
        </h3>
        <div className="space-y-4">
          {/* Daily Drawdown */}
          <Card className="glass-card border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical</span>
                <h4 className="text-white font-extrabold text-base">Daily Drawdown — 2%</h4>
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-3">
                You may not lose more than <strong className="text-white">2%</strong> of your account value per day.
                At day rollover, your Daily Drawdown limit is recalculated based on the <strong className="text-white">higher</strong> of
                your Balance (excluding open trades) or your Equity (including open trades).
              </p>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55">
                <strong className="text-white/80">Example:</strong> Balance ₹2,50,000, Equity ₹2,62,500 at rollover → next day's Daily Drawdown limit = 2% of ₹2,62,500 = <strong className="text-amber-200">₹5,250</strong>
              </div>
            </CardContent>
          </Card>

          {/* Max Drawdown */}
          <Card className="glass-card border-red-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-red-500/15 border border-red-500/30 text-red-300 uppercase">Critical</span>
                <h4 className="text-white font-extrabold text-base">Max Drawdown — 4%</h4>
              </div>
              <p className="text-white/65 text-sm leading-relaxed mb-3">
                Your maximum loss is limited to <strong className="text-white">4%</strong> of your starting balance.
              </p>
              <div className="px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5 text-sm text-white/55">
                <strong className="text-white/80">Example:</strong> With a ₹2,50,000 starting balance, your account can't drop below <strong className="text-amber-200">₹2,40,000</strong>
              </div>
            </CardContent>
          </Card>

          {/* Risk per trade */}
          <Card className="glass-card border-amber-500/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase">Suggested</span>
                <h4 className="text-white font-extrabold text-base">Risk per Trade Idea — 1%</h4>
              </div>
              <p className="text-white/65 text-sm leading-relaxed">
                You may not risk more than <strong className="text-white">1%</strong> of your starting account balance at any time in one trade idea.
                A trade idea includes all open positions on the same instrument in the same direction (Buy or Sell).
                Closing and reopening a position in the same direction on the same instrument within <strong className="text-white">10 minutes</strong> is
                treated as the same trade idea and does not reset the limit. Exceeding this results in a hard breach.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payouts */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <CreditCard size={20} className="text-green-400" /> Payouts
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <p className="text-white/65 text-sm mb-4">
              You can request <strong className="text-white">one payout</strong> after the 24-hour account period ends, if <strong className="text-white">both</strong> of the following apply:
            </p>
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">Your best single trade does not exceed <strong className="text-amber-200">15%</strong> of your total profit
                  <span className="text-white/45 ml-1">(e.g. total profit ₹10,000 → best trade must be ₹1,500 or less)</span>
                </span>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm">Your net profit is at least <strong className="text-amber-200">3%</strong> of your starting balance</span>
              </div>
            </div>

            {/* ── Payout calculator ── */}
            <PayoutCalculator />

            <div className="border-t border-white/5 pt-4">
              <p className="text-white/50 text-xs font-bold uppercase tracking-wider mb-3">How to request a withdrawal</p>
              <div className="space-y-2">
                {[
                  "Confirm your account has passed its 24-hour lifetime",
                  "Go to your dashboard and choose your withdrawal method (UPI / bank transfer)",
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-white/65">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white/50 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prohibited Practices */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <XCircle size={20} className="text-red-400" /> Prohibited Practices
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300">Needs confirmation</span>
        </h3>
        <Card className="glass-card border-red-500/15">
          <CardContent className="p-6">
            <div className="space-y-2.5">
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

      {/* News Trading */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-400" /> News Trading
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300">Needs confirmation</span>
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-white/65 text-sm leading-relaxed">
            Enabled by default. You're free to open and close trades around major economic events (RBI policy, US Fed announcements, etc.).
            News straddling or execution designed to gain an unfair advantage is not permitted.
          </CardContent>
        </Card>
      </div>

      {/* Holding Rules */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Clock size={20} className="text-cyan-400" /> Holding Rules
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <CheckCircle size={15} className="text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm"><strong className="text-white">Overnight holding</strong> is allowed within the 24-hour window.</span>
              </div>
              <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/5">
                <AlertTriangle size={15} className="text-amber-400 shrink-0 mt-0.5" />
                <span className="text-white/80 text-sm"><strong className="text-white">Weekend holding</strong> is technically allowed, but positions may close automatically if the market shuts before your 24-hour period ends.</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Limits */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <Lock size={20} className="text-purple-400" /> Account Limits
          <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300">Needs confirmation</span>
        </h3>
        <Card className="glass-card border-white/10">
          <CardContent className="p-6 text-white/65 text-sm">
            You can hold up to <strong className="text-white">three Flash accounts</strong> of any size simultaneously.
          </CardContent>
        </Card>
      </div>

      {/* Confirmed vs needs decision */}
      <div className="mb-10">
        <h3 className="text-xl font-heading font-extrabold text-white mb-4 flex items-center gap-2">
          <HelpCircle size={20} className="text-white/40" /> What's Confirmed vs What Needs a Decision
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="glass-card border-green-500/20">
            <CardContent className="p-5">
              <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-3">✅ Confirmed — already live</p>
              <div className="space-y-1.5 text-sm text-white/65">
                {[
                  "Trading time (24 hours)",
                  "Open trades limit (1 at a time)",
                  "Profit split (80%)",
                  "Payout cycle (after 24 hours)",
                  "Payout threshold (3% net)",
                  "No profit target",
                  "Consistency rule (15%)",
                  "Daily drawdown (2%)",
                  "Max drawdown (4%)",
                  "Daily profit cap / kill-switch (4%)",
                  "Scaling: not available",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle size={12} className="text-green-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-amber-500/20">
            <CardContent className="p-5">
              <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-3">🆕 New — needs your sign-off</p>
              <div className="space-y-1.5 text-sm text-white/65">
                {[
                  "Risk per Trade Idea (1%)",
                  "Prohibited Practices list",
                  "News Trading policy",
                  "Account Limits (max 3 Flash accounts)",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <AlertTriangle size={12} className="text-amber-400 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA */}
      <Card className="border-0 overflow-hidden bg-gradient-to-br from-amber-600 via-orange-600 to-amber-700 shadow-2xl shadow-amber-500/20">
        <CardContent className="p-8 text-center">
          <h3 className="text-2xl font-heading font-extrabold text-white mb-2">Ready to trade Flash?</h3>
          <p className="text-white/80 mb-5 text-sm">24-hour funded account. No profit target. Start now.</p>
          <Link href="/sign-up">
            <Button size="lg" className="bg-white text-amber-700 hover:bg-white/90 rounded-full px-8 h-11 font-extrabold shadow-lg">
              <Zap size={15} className="mr-2" /> Get Flash account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Rules() {
  const [activePlan, setActivePlan] = useState<PlanKey | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [flashLinkCopied, setFlashLinkCopied] = useState(false);
  const [instantLinkCopied, setInstantLinkCopied] = useState(false);
  const [oneStepLinkCopied, setOneStepLinkCopied] = useState(false);
  const [twoStepLinkCopied, setTwoStepLinkCopied] = useState(false);

  // Flash plan — show its own full detail page
  if (activePlan === "flash") {
    const flashUrl = "https://fundedwealth.com/rules?plan=flash";

    const handleShare = async () => {
      if (navigator.share) {
        // Native share sheet on mobile
        try {
          await navigator.share({
            title: "FundedWealth Flash Rules",
            text: "Check out the Flash trading account rules on FundedWealth — 24-hour funded account, 80% profit split, no profit target.",
            url: flashUrl,
          });
        } catch (_) { /* user dismissed */ }
      } else {
        // Desktop — copy to clipboard + show tick
        await navigator.clipboard.writeText(flashUrl);
        setFlashLinkCopied(true);
        setTimeout(() => setFlashLinkCopied(false), 2000);
      }
    };

    return (
      <div className="min-h-screen bg-[#0D0020] text-white">
        <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <button onClick={() => setActivePlan(null)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
              <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
            </button>
            <h1 className="text-lg font-heading font-bold flex items-center gap-2">
              <Zap className="text-amber-400" size={18} /> Flash Rules
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200
                  ${flashLinkCopied
                    ? "bg-green-500/15 border-green-500/40 text-green-300"
                    : "bg-white/[0.05] border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
                  }`}
                title="Share Flash Rules link"
              >
                {flashLinkCopied
                  ? <><Check size={13} /> Copied!</>
                  : <><Share2 size={13} /> Share</>
                }
              </button>
              <Link href="/"><Button variant="ghost" className="text-white/70 hover:text-white">Home</Button></Link>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <FlashRulesDetail onBack={() => setActivePlan(null)} />
        </div>
      </div>
    );
  }

  // Instant Funding plan — show its own full detail page
  if (activePlan === "instant") {
    const instantUrl = "https://fundedwealth.com/rules?plan=instant";
    const handleInstantShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "FundedWealth Instant Funding Rules",
            text: "Check out the Instant Funding rules on FundedWealth — live funded account, 80% profit split, no evaluation.",
            url: instantUrl,
          });
        } catch (_) { /* dismissed */ }
      } else {
        await navigator.clipboard.writeText(instantUrl);
        setInstantLinkCopied(true);
        setTimeout(() => setInstantLinkCopied(false), 2000);
      }
    };
    return (
      <div className="min-h-screen bg-[#0D0020] text-white">
        <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <button onClick={() => setActivePlan(null)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
              <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
            </button>
            <h1 className="text-lg font-heading font-bold flex items-center gap-2">
              <TrendingUp className="text-cyan-400" size={18} /> Instant Funding Rules
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleInstantShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200
                  ${instantLinkCopied
                    ? "bg-green-500/15 border-green-500/40 text-green-300"
                    : "bg-white/[0.05] border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"
                  }`}
                title="Share Instant Funding Rules link"
              >
                {instantLinkCopied ? <><Check size={13} /> Copied!</> : <><Share2 size={13} /> Share</>}
              </button>
              <Link href="/"><Button variant="ghost" className="text-white/70 hover:text-white">Home</Button></Link>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <InstantRulesDetail onBack={() => setActivePlan(null)} />
        </div>
      </div>
    );
  }

  // 1-Step plan — show its own full detail page
  if (activePlan === "1step") {
    const oneStepUrl = "https://fundedwealth.com/rules?plan=1step";
    const handleOneStepShare = async () => {
      if (navigator.share) {
        try { await navigator.share({ title: "FundedWealth 1-Step Rules", text: "Check out the 1-Step challenge rules on FundedWealth — one evaluation, then funded forever.", url: oneStepUrl }); } catch (_) {}
      } else {
        await navigator.clipboard.writeText(oneStepUrl);
        setOneStepLinkCopied(true);
        setTimeout(() => setOneStepLinkCopied(false), 2000);
      }
    };
    return (
      <div className="min-h-screen bg-[#0D0020] text-white">
        <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <button onClick={() => setActivePlan(null)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
              <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
            </button>
            <h1 className="text-lg font-heading font-bold flex items-center gap-2">
              <Target className="text-blue-400" size={18} /> 1-Step Rules
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={handleOneStepShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 ${oneStepLinkCopied ? "bg-green-500/15 border-green-500/40 text-green-300" : "bg-white/[0.05] border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"}`}
                title="Share 1-Step Rules link">
                {oneStepLinkCopied ? <><Check size={13} /> Copied!</> : <><Share2 size={13} /> Share</>}
              </button>
              <Link href="/"><Button variant="ghost" className="text-white/70 hover:text-white">Home</Button></Link>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <OneStepRulesDetail onBack={() => setActivePlan(null)} />
        </div>
      </div>
    );
  }

  // 2-Step plan — show its own full detail page
  if (activePlan === "2step") {
    const twoStepUrl = "https://fundedwealth.com/rules?plan=2step";
    const handleTwoStepShare = async () => {
      if (navigator.share) {
        try { await navigator.share({ title: "FundedWealth 2-Step Rules", text: "Check out the 2-Step challenge rules on FundedWealth — two phases, then funded with 6% max drawdown.", url: twoStepUrl }); } catch (_) {}
      } else {
        await navigator.clipboard.writeText(twoStepUrl);
        setTwoStepLinkCopied(true);
        setTimeout(() => setTwoStepLinkCopied(false), 2000);
      }
    };
    return (
      <div className="min-h-screen bg-[#0D0020] text-white">
        <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <button onClick={() => setActivePlan(null)} className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
              <ArrowLeft size={20} />
              <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
              <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
            </button>
            <h1 className="text-lg font-heading font-bold flex items-center gap-2">
              <Layers className="text-purple-400" size={18} /> 2-Step Rules
            </h1>
            <div className="flex items-center gap-2">
              <button onClick={handleTwoStepShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all duration-200 ${twoStepLinkCopied ? "bg-green-500/15 border-green-500/40 text-green-300" : "bg-white/[0.05] border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30"}`}
                title="Share 2-Step Rules link">
                {twoStepLinkCopied ? <><Check size={13} /> Copied!</> : <><Share2 size={13} /> Share</>}
              </button>
              <Link href="/"><Button variant="ghost" className="text-white/70 hover:text-white">Home</Button></Link>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <TwoStepRulesDetail onBack={() => setActivePlan(null)} />
        </div>
      </div>
    );
  }

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
