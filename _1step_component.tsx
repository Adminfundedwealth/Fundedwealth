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

