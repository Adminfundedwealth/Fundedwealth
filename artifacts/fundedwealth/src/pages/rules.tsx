import React from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, Shield, CheckCircle, XCircle, AlertTriangle, Info, BookOpen, Clock, Target, Activity, Calendar, Scale, FileText, LifeBuoy, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const GENERAL_RULES = [
  { rule: "Minimum Trading Days", desc: "Complete at least 5 trading days during the evaluation phase. Each day must have at least 1 trade executed.", allowed: true },
  { rule: "Daily Loss Limit", desc: "Your daily loss must not exceed the specified daily drawdown limit (varies by plan: 2-3%). Calculated from the day's starting equity.", allowed: true },
  { rule: "Maximum Drawdown", desc: "Your total account drawdown must not exceed the specified max drawdown (varies by plan: 4-8%). Measured from highest equity reached.", allowed: true },
  { rule: "Profit Target", desc: "Achieve the required profit target to pass evaluation (varies by plan: 8-10%). No profit target for Instant/Flash Funding.", allowed: true },
  { rule: "Maximum Risk Per Trade", desc: "No single trade should risk more than 1.5% of your account balance in the funded stage.", allowed: true },
  { rule: "Leverage Limit", desc: "Maximum leverage of 1:30 for evaluation plans, 1:50 for Instant/Flash funding.", allowed: true },
];

const ALLOWED = [
  "Scalping (minimum 2-minute hold time)",
  "Swing trading (overnight positions allowed Mon-Thu)",
  "Multiple instruments simultaneously",
  "Expert Advisors (EAs) and automated strategies",
  "Copy trading from your own accounts",
  "Hedging within the same account",
  "Trading during high-volatility sessions",
];

const PROHIBITED = [
  "Holding positions over weekends (close by Friday market close)",
  "Trading within 2 minutes of major news events (RBI policy, US NFP, FOMC)",
  "Martingale or grid strategies with no stop loss",
  "Account sharing or third-party trading without disclosure",
  "Exploiting platform glitches, latency arbitrage, or price feed errors",
  "Copy trading from other FundedWealth accounts",
];

const PLAN_RULES = [
  { plan: "Flash Funding", duration: "24 Hours", dailyDD: "2%", maxDD: "4%", profitTarget: "N/A", split: "80%", leverage: "1:50", minDays: "–" },
  { plan: "Instant Funding", duration: "Unlimited", dailyDD: "3%", maxDD: "5%", profitTarget: "N/A", split: "70-80%", leverage: "1:50", minDays: "7 days" },
  { plan: "1-Step Evaluation", duration: "Unlimited", dailyDD: "3%", maxDD: "6%", profitTarget: "10%", split: "80-90%", leverage: "1:30", minDays: "5 days" },
  { plan: "2-Step Evaluation", duration: "Unlimited", dailyDD: "3%", maxDD: "8%", profitTarget: "8% / 5%", split: "80-90%", leverage: "1:30", minDays: "5 days/phase" },
];

const QUICK_REF = [
  { label: "1-Step profit target", value: "10% (challenge)" },
  { label: "2-Step profit targets", value: "8% + 5% (per phase)" },
  { label: "Minimum trading days", value: "5 days" },
  { label: "Maximum Daily loss", value: "3% (Critical — Breach ends evaluation)", critical: true },
  { label: "Maximum Daily profit", value: "4% — discourages overtrading. Kill-switch: once hit, no new trades for that day (session lock until next trading day)." },
  { label: "Overnight positions", value: "Not allowed" },
  { label: "Trade window", value: "9:15 AM – 3:15 PM IST" },
  { label: "Auto square-off", value: "3:15 PM IST" },
  { label: "Max position size", value: "70% of account" },
  { label: "Evaluation duration", value: "UNLIMITED" },
  { label: "Options & hedging", value: "Index options: buying only — selling (writing) not allowed. Hedging not allowed. Full product list on Instruments page." },
];

const PROFIT_TARGETS = [
  { text: "1-Step Challenge: 10% profit target", ok: true },
  { text: "2-Step Challenge: 8% + 5% profit targets", ok: true },
  { text: "Minimum trading days: 5 days", ok: true },
];

const RISK_MGMT = [
  { text: "Maximum Daily loss: 3%", ok: true, tag: "Critical" },
  { text: "Maximum Daily profit: 4% — to prevent overtrading. If you hit this cap, kill-switch mode turns on: you cannot place new trades for the rest of that trading day (existing positions follow square-off rules).", ok: true },
  { text: "No overnight positions allowed", ok: true },
  { text: "Index Options: Buying only — Option selling (writing) not allowed", ok: false, tag: "Critical" },
  { text: "Hedging is not allowed", ok: false, tag: "Critical" },
];

const TRADING_HOURS = [
  { text: "Market hours: 9:15 AM – 3:30 PM IST" },
  { text: "Trading allowed: 9:15 AM – 3:15 PM IST" },
  { text: "Auto square-off: 3:15 PM IST sharp" },
];

const POSITION_SIZING = [
  { text: "Maximum position size: 70% of account", ok: true },
  { text: "Minimum position size: 1 lot", ok: true },
];

const EVAL_PERIOD = [
  { text: "1-Step Challenge: Unlimited", ok: true },
  { text: "2-Step Challenge: Unlimited", ok: true },
];

export default function Rules() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Prop Trading Rules India — Evaluation Rules, Drawdown & Profit Targets"
        description="Complete prop trading evaluation rules at FundedWealth. Understand drawdown limits, profit targets, allowed instruments, and plan comparison for India's best prop firm. Flash, Instant, 1-Step & 2-Step plans explained."
        keywords="prop trading rules India, funded account rules, drawdown limits prop firm, profit target prop trading, trading evaluation rules India, prop firm guidelines, FundedWealth rules, how prop trading evaluation works, prop firm drawdown rules India"
        canonical="/rules"
      />
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
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Evaluation & Risk Framework
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Program <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">trading rules</span>
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
            Everything that governs your challenge in one place: profit targets, loss limits, session rules, instruments, sizing, and timelines — structured the same way as our instruments reference.
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

          <div className="mt-8 max-w-3xl mx-auto rounded-xl bg-amber-500/5 border border-amber-500/25 p-4 text-left">
            <p className="text-white/75 text-sm leading-relaxed">
              <strong className="text-amber-300">Important:</strong> Breaking a <strong className="text-red-400">Critical</strong> rule (e.g. Daily loss limit, Maximum Loss Limit) disqualifies your evaluation immediately. Hitting the <strong className="text-amber-200">4% Daily profit</strong> cap triggers <strong className="text-amber-200">kill-switch</strong>: no new trades for that day.
            </p>
          </div>
        </div>

        <div className="mb-14">
          <div className="text-center mb-6">
            <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.25em]">At a glance</span>
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-2">Quick reference</h3>
          </div>
          <Card className="glass-card border-white/10 overflow-hidden">
            <div className="divide-y divide-white/5">
              {QUICK_REF.map((row, i) => (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-2 md:gap-6 px-5 py-4 hover:bg-white/[0.02] transition-colors">
                  <div className="text-white font-bold text-sm">{row.label}</div>
                  <div className={`text-sm ${row.critical ? "text-red-300" : "text-white/65"}`}>{row.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2"><BookOpen size={22} className="text-purple-400" /> Plan Comparison</h3>
          <Card className="glass-card border-white/10 overflow-x-auto">
            <div className="min-w-[700px]">
              <div className="grid grid-cols-[160px_repeat(4,1fr)] gap-0 text-xs">
                <div className="p-4 border-b border-r border-white/10 font-bold text-white/40 uppercase tracking-wider">Rule</div>
                {PLAN_RULES.map((p, i) => (
                  <div key={i} className="p-4 border-b border-r border-white/10 font-bold text-white text-center">{p.plan}</div>
                ))}
                {["Duration", "Daily Drawdown", "Max Drawdown", "Profit Target", "Profit Split", "Leverage", "Min Days"].map((label, ri) => (
                  <React.Fragment key={`row-${ri}`}>
                    <div className="p-4 border-b border-r border-white/10 text-white/60">{label}</div>
                    {PLAN_RULES.map((p, ci) => {
                      const vals = [p.duration, p.dailyDD, p.maxDD, p.profitTarget, p.split, p.leverage, p.minDays];
                      return <div key={`v-${ri}-${ci}`} className="p-4 border-b border-r border-white/10 text-white text-center font-semibold">{vals[ri]}</div>;
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-12">
          <h3 className="text-2xl font-heading font-bold text-white mb-6 flex items-center gap-2"><Info size={22} className="text-blue-400" /> General Rules</h3>
          <div className="space-y-3">
            {GENERAL_RULES.map((r, i) => (
              <Card key={i} className="glass-card border-white/10">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="text-white font-semibold text-sm mb-1">{r.rule}</div>
                      <div className="text-white/50 text-xs">{r.desc}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2"><CheckCircle size={20} className="text-green-400" /> Allowed</h3>
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
            <h3 className="text-xl font-heading font-bold text-white mb-4 flex items-center gap-2"><XCircle size={20} className="text-red-400" /> Prohibited</h3>
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

        <Card className="glass-card border-yellow-500/20 mb-16">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertTriangle size={20} className="text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-white font-semibold mb-1">Important Note</div>
              <div className="text-white/50 text-sm">Violating any rule results in account termination. However, your refundable fee is returned upon passing the evaluation. If you believe a violation was in error, contact support within 24 hours for review.</div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-14">
          <div className="text-center mb-8">
            <span className="text-white/40 text-[11px] font-bold uppercase tracking-[0.25em]">Full Rulebook</span>
            <h3 className="text-2xl md:text-3xl font-heading font-extrabold text-white mt-2">Rules in detail</h3>
            <p className="text-white/55 text-sm max-w-xl mx-auto mt-2">
              Each block expands the same items as the table above, with status colouring so you see what is mandatory, informational, or disqualifying.
            </p>
          </div>

          <div className="space-y-5">
            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center shrink-0">
                    <Target size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-lg">Profit Targets</h4>
                    <p className="text-white/55 text-sm">Clear numeric targets and a minimum activity bar so evaluations reflect real engagement, not one lucky day.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {PROFIT_TARGETS.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <CheckCircle size={15} className="text-emerald-400 shrink-0" />
                      <span className="text-white/80 text-sm">{r.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0">
                    <Activity size={18} className="text-purple-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-lg">Risk Management</h4>
                    <p className="text-white/55 text-sm">Daily loss ends the evaluation if breached. A 4% Daily profit cap curbs overtrading: reach it and kill-switch locks you out of new trades until the next session.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {RISK_MGMT.map((r, i) => (
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

            <Card className="glass-card border-white/10">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Clock size={18} className="text-cyan-300" />
                  </div>
                  <div>
                    <h4 className="text-white font-extrabold text-lg">Trading Hours & Session</h4>
                    <p className="text-white/55 text-sm">Aligned with NSE cash and derivatives session; intraday discipline is part of the evaluation design.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {TRADING_HOURS.map((r, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                      <Clock size={14} className="text-cyan-400 shrink-0" />
                      <span className="text-white/80 text-sm">{r.text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-5">
              <Card className="glass-card border-white/10">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                      <Scale size={18} className="text-emerald-300" />
                    </div>
                    <div>
                      <h4 className="text-white font-extrabold text-lg">Position Sizing</h4>
                      <p className="text-white/55 text-sm">Caps concentration so a single symbol cannot dominate the account — risk stays distributed and measurable.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {POSITION_SIZING.map((r, i) => (
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
                      <p className="text-white/55 text-sm">Enough time to show consistency without dragging forever. Plan your calendar before you start the clock.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {EVAL_PERIOD.map((r, i) => (
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
                    Questions? See <Link href="/#faq" className="text-blue-300 hover:underline">FAQ</Link> or <Link href="/#contact" className="text-blue-300 hover:underline">contact</Link>.
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

        <Card className="border-0 overflow-hidden bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-600 shadow-2xl shadow-blue-500/30">
          <CardContent className="p-10 md:p-14 text-center">
            <h3 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-3">Ready under the rules?</h3>
            <p className="text-white/85 max-w-xl mx-auto mb-7">
              Pick a program size, align your risk with the limits above, and start when you are prepared.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-white/90 rounded-full px-4 md:px-6 lg:px-8 xl:px-10 h-12 font-extrabold shadow-lg">
                  <Zap size={16} className="mr-2" /> Get started
                </Button>
              </Link>
              <Link href="/#plans">
                <Button size="lg" variant="outline" className="border-white/40 text-white bg-white/10 hover:bg-white/20 rounded-full px-4 md:px-6 lg:px-8 xl:px-10 h-12 font-bold">
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
