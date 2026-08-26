import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";
import {
  ArrowRight,
  ShieldCheck,
  Target,
  Sparkles,
  Activity,
  BookOpen,
  RefreshCw,
  Scale,
  CheckCircle2,
  Quote,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

const Pill = ({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) => (
  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-white/70 text-xs font-bold">
    {icon}
    {children}
  </span>
);

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[#8E2DE2] text-[11px] font-extrabold tracking-[0.25em] mb-4">{children}</div>
);

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0010] text-white">
      <SEOHead
        title="About FundedWealth — India's First AI-Native Prop Firm"
        description="FundedWealth is India's first AI-native proprietary trading evaluation platform built for trust, discipline, and long-term performance. Learn how we align with serious Indian traders."
        keywords="about FundedWealth, AI prop firm India, FundedWealth founder, prop trading India, A-book prop firm"
        canonical="/about"
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0010]/95 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="FundedWealth" className="h-10 w-10 rounded-lg" />
            <span className="text-xl font-heading font-bold text-white tracking-tight">
              Funded<span className="text-fw-orange">Wealth</span>
            </span>
          </Link>
          <Link href="/">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 text-sm">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative py-20 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0040] via-[#0d001a] to-[#0a0010] pointer-events-none" />
        <div className="absolute top-20 -left-32 w-[500px] h-[500px] bg-violet-700/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-pink-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <SectionLabel>ABOUT FUNDEDWEALTH</SectionLabel>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1] mb-6">
                The <span className="text-gradient">AI-first</span> proprietary trading firm Indian traders can finally{" "}
                <span className="text-gradient">trust and stay disciplined with</span>.
              </h1>
              <div className="space-y-4 text-white/65 leading-relaxed">
                <p>
                  FundedWealth runs structured evaluations on a single tech platform — built for Indian traders who care about
                  process, not promises. Every challenge has published rules, visible progress, and measurable outcomes. We
                  operate on a strict <span className="text-white font-bold">A-book</span> philosophy: when you trade well and
                  stay within the rulebook, the platform grows. We do not run the offshore-style{" "}
                  <span className="text-white font-bold">B-book</span> playbook where the operator quietly benefits the moment
                  a participant blows up.
                </p>
                <p>
                  FundedWealth is not a brokerage, a portfolio manager, or an investment advisor — and we never solicit public
                  capital. Joining the program, clearing the evaluation, and receiving payouts is governed end-to-end by the
                  terms and rules we publish openly.
                </p>
                <p className="text-white font-bold">
                  In Indian fintech, credibility has to be earned before scale. That is why we run FundedWealth with one
                  promise: you should always know who is behind the screen, how the system works, and exactly what you signed
                  up for.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-7">
                <Pill icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}>SEBI-Aligned Brokers</Pill>
                <Pill icon={<Sparkles className="w-3.5 h-3.5 text-violet-400" />}>AI-Native</Pill>
                <Pill icon={<Scale className="w-3.5 h-3.5 text-blue-400" />}>A-Book Aligned</Pill>
              </div>
            </div>

            {/* Right visual */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-[5/4] bg-gradient-to-br from-[#0a1a3a] via-[#0a0824] to-[#1a0030]">
                {/* circuit grid */}
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(99,102,241,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.15) 1px, transparent 1px)",
                    backgroundSize: "30px 30px",
                  }}
                />
                {/* glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyan-500/20 rounded-full blur-3xl" />

                {/* upward arrows / chart */}
                <svg viewBox="0 0 400 320" className="absolute inset-0 w-full h-full">
                  <defs>
                    <linearGradient id="arrowGrad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stopColor="#06B6D4" />
                      <stop offset="100%" stopColor="#A78BFA" />
                    </linearGradient>
                  </defs>
                  <path d="M40,260 L120,200 L180,220 L240,150 L320,90 L360,60" stroke="url(#arrowGrad)" strokeWidth="3" fill="none" />
                  <path d="M340,75 L360,60 L355,85" stroke="url(#arrowGrad)" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

                  <path d="M60,280 L140,220 L200,240 L260,170 L340,110" stroke="#06B6D4" strokeWidth="2" fill="none" opacity="0.6" />
                  <path d="M20,290 L100,230 L160,250 L220,180 L300,120" stroke="#A78BFA" strokeWidth="2" fill="none" opacity="0.5" />
                </svg>

                {/* brand badge */}
                <div className="absolute bottom-6 left-6 text-white">
                  <div className="text-[10px] font-bold tracking-[0.3em] text-cyan-300 mb-1">FUNDED</div>
                  <div className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none">
                    WEALTH
                  </div>
                  <div className="text-[10px] text-cyan-200/70 mt-1.5 tracking-wider">AI-NATIVE • INDIA</div>
                </div>

                {/* corner badge */}
                <div className="absolute top-5 right-5 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-[10px] font-extrabold tracking-widest">
                  A-BOOK
                </div>
              </div>

              {/* floating mini stat */}
              <div className="absolute -bottom-5 -left-3 md:-left-6 bg-white rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-600" />
                </div>
                <div>
                  <div className="text-slate-500 text-[9px] font-bold tracking-widest">FUNDED TRADERS</div>
                  <div className="text-slate-900 font-extrabold text-base leading-tight">15,000+ &amp; growing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO / WHAT */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[1600px] mx-auto">
            <div className="rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 p-7 hover:border-white/20 transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-5">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">Who we are</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                A team of full-time traders, fintech operators, and product engineers — all obsessed with structure over hype.
                We started FundedWealth so capable Indian traders finally have an honest, rule-based stage to prove their edge,
                free from the loud, low-trust pitches that flood this space online.
              </p>
            </div>

            <div className="rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 p-7 hover:border-white/20 transition-all">
              <div className="w-11 h-11 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center mb-5">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-2xl font-extrabold text-white mb-3">What we enable</h3>
              <p className="text-white/60 leading-relaxed text-sm">
                A clean evaluation framework, dashboards that highlight repeatable behaviour over one-off luck, and a support
                team that treats you like the operator you are. Clear our published criteria and you unlock access to
                simulated evaluation accounts plus performance-based rewards — every step laid out in writing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* A-BOOK MINDSET */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 leading-tight">
              The <span className="text-gradient">A-book way</span>: your wins are how we grow
            </h2>
            <p className="text-white/55 text-sm max-w-2xl mx-auto">
              Our incentive model — and the technology layer that keeps it honest.
            </p>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-violet-500/[0.08] to-blue-500/[0.04] border border-white/10 p-7 md:p-9">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-xl md:text-2xl font-extrabold text-white">
                A-book aligned — never the "we win when you blow up" model
              </h3>
            </div>
            <div className="space-y-4 text-white/65 text-sm leading-relaxed">
              <p>
                FundedWealth runs on a strict <span className="text-white font-bold">A-book design</span>: our incentives only
                stack up when traders execute well and respect the rulebook. The platform scales because you scale — that is
                the only sustainable growth loop we believe in.
              </p>
              <p>
                Plenty of legacy and offshore prop setups quietly run on a <span className="text-white font-bold">B-book</span>{" "}
                engine, where the operator pockets fees and benefits whenever a participant breaks a limit or burns the
                account. The math is silently tilted against the trader. We refuse to build like that. We are openly chasing{" "}
                <span className="text-white font-bold">winners</span>, because your long-run results and our long-run business
                are pointed in the exact same direction.
              </p>
              <p className="text-white/45 text-xs italic">
                Fees, mechanics, and payout structures are always spelled out in our published policies. This section explains
                how we think about incentive alignment — it is not a guarantee of trading outcomes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT POWERS THAT ALIGNMENT */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-center text-3xl md:text-4xl font-extrabold text-white mb-10">
            The technology behind that <span className="text-gradient">alignment</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1600px] mx-auto">
            {[
              {
                icon: <Activity className="w-5 h-5" />,
                color: "bg-orange-500/15 text-orange-400",
                title: "Live Risk Guardrails",
                body:
                  "A rule engine that watches every order in real time — daily loss caps, drawdown ceilings, position limits, all enforced the moment they trigger. You see the rulebook, the platform holds the line, and your edge stays repeatable when the market gets noisy.",
              },
              {
                icon: <BookOpen className="w-5 h-5" />,
                color: "bg-blue-500/15 text-blue-400",
                title: "Structured Trade Journal",
                body:
                  "Every fill is auto-logged with setup, tags, emotion notes, and outcome — your journal becomes a searchable dataset, not a graveyard of forgotten WhatsApp screenshots. Reviews finish faster and your real edge becomes visible.",
              },
              {
                icon: <RefreshCw className="w-5 h-5" />,
                color: "bg-emerald-500/15 text-emerald-400",
                title: "Closed-Loop Performance Engine",
                body:
                  "Yesterday's stats automatically shape tomorrow's plan. Streak metrics, weekly checkpoints, and post-session reviews hand you a continuous improvement loop — log, reflect, refine, run it again.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 p-6 hover:border-white/20 transition-all">
                <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center mb-5`}>
                  {c.icon}
                </div>
                <h3 className="text-white font-extrabold text-lg mb-3">{c.title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <div className="rounded-3xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 p-7 md:p-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-[10px] font-extrabold tracking-[0.25em] mb-6">
              <Quote className="w-3 h-3" />
              A NOTE FROM THE FOUNDER
            </div>

            <div className="space-y-4 text-white/70 text-[15px] leading-relaxed">
              <p className="text-white font-bold text-lg leading-relaxed">
                Trading in India is already a battle — you should not have to fight the firm sitting on the other side of the
                terminal too. FundedWealth exists because we wanted a program that respects the trader's time: rules you can
                actually read, honest communication, and tools that show you your edge instead of burying it under jargon.
              </p>
              <p>
                I trade the markets myself. Across the last four-plus years I have lived through Indian equities, F&O, and
                forex — wins, drawdowns, and the same fog every retail trader hits at some point. I burned years chasing the
                wrong things: high-priced courses that over-promised, paid tips that felt like shortcuts, and pure narrative
                instead of a process. That road costs money, peace of mind, and is the silent reason most people quit trading.
              </p>
              <p>
                What actually shifted my P&L was never a magic indicator or a fresh strategy every Monday. The only edge that
                has stayed consistent is <span className="text-white font-bold">tight risk management</span> paired with{" "}
                <span className="text-white font-bold">unsexy discipline</span> — repeating small, sensible actions inside
                limits you set before the trade, not after the loss.
              </p>
              <p>
                Done the right way, trading is mostly a <span className="text-white font-bold">boring craft</span>: same
                checklist, same position-sizing math, same courage to skip a chart that does not match your plan. Boring beats
                brilliant the moment real capital is on the screen.
              </p>
              <p>
                We believe capital should chase discipline, not hype. If you are ready to treat trading as a serious craft,
                FundedWealth is being built to meet you on that exact ground — with transparency as a default setting, never an
                afterthought.
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 text-white/50 text-xs">— Founder, FundedWealth</div>
          </div>
        </div>
      </section>

      {/* HOW WE THINK ABOUT TRUST */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Pill icon={<ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />}>Compliance, structure &amp; transparency</Pill>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4 mb-2">Where we stand on trust</h2>
          <p className="text-white/55 text-sm mb-8 max-w-2xl">
            Zero fine-print games. Our legal pages cover every detail — this is the plain-English version we want every trader
            to read before anything else.
          </p>

          <div className="space-y-3">
            {[
              "All evaluations run inside a simulated trading environment. Assessment orders never hit live NSE or BSE order books.",
              "FundedWealth is a technology and assessment platform — not a SEBI-registered broker, advisor, or portfolio manager.",
              "We do not raise or pool money from the public. Any capital made available to qualified traders is fully company-owned and operates strictly under our program terms.",
              "Onboarding, KYC, and payout eligibility follow a documented compliance flow — PAN verification, valid government ID, and a confirmed Indian bank account where required.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-white/70 text-sm leading-relaxed">{t}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-7">
            {[
              { label: "Terms of Service", href: "/terms" },
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Refund Policy", href: "/refund" },
              { label: "FAQ", href: "/#faq" },
            ].map((p) => (
              <Link key={p.label} href={p.href}>
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/[0.04] border border-white/10 text-white/70 hover:text-white hover:border-white/30 text-xs font-bold cursor-pointer transition-all">
                  {p.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* VALUES IN ONE GLANCE */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-10">
            <Pill icon={<ShieldCheck className="w-3.5 h-3.5 text-blue-400" />}>What we stand for</Pill>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mt-4">Our core values, at a glance</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[1600px] mx-auto">
            {[
              {
                title: "Discipline",
                body:
                  "Consistent execution and tight risk hygiene beat a single hero trade — every single time. The whole product is engineered around that simple truth.",
                icon: <ShieldCheck className="w-7 h-7" />,
                visual: (
                  <svg viewBox="0 0 200 100" className="w-full h-full">
                    <defs>
                      <linearGradient id="vDisc" x1="0" x2="1">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                    {[20, 35, 50, 65, 80, 95, 110, 125, 140, 155, 170, 185].map((x, i) => {
                      const heights = [40, 55, 30, 60, 45, 70, 35, 65, 50, 75, 60, 80];
                      const isUp = i % 3 !== 1;
                      return (
                        <g key={x}>
                          <line x1={x} y1={50 - heights[i] / 4} x2={x} y2={50 + heights[i] / 4} stroke={isUp ? "#10B981" : "#EF4444"} strokeWidth="1.5" />
                          <rect x={x - 3} y={isUp ? 50 - heights[i] / 6 : 50 - heights[i] / 8} width="6" height={heights[i] / 4} fill={isUp ? "#10B981" : "#EF4444"} />
                        </g>
                      );
                    })}
                    <path d="M10,70 Q50,60 100,50 T190,30" stroke="url(#vDisc)" strokeWidth="2" fill="none" opacity="0.7" />
                  </svg>
                ),
                bg: "from-slate-900 to-slate-800",
              },
              {
                title: "Innovation",
                body:
                  "Smart dashboards, automation, and AI exist to make your decision-making visible — not to take the wheel away from you. The trader stays in charge.",
                icon: <Sparkles className="w-7 h-7" />,
                visual: (
                  <div className="grid grid-cols-2 gap-2 p-3 h-full">
                    <div className="rounded-md bg-blue-500/30 p-2 flex flex-col justify-end">
                      <div className="h-1 bg-blue-300 rounded mb-1" />
                      <div className="text-blue-100 text-[8px] font-bold">47%</div>
                    </div>
                    <div className="rounded-md bg-violet-500/30 p-2 flex flex-col justify-end">
                      <div className="h-1 bg-violet-300 rounded mb-1" />
                      <div className="text-violet-100 text-[8px] font-bold">2.1x</div>
                    </div>
                    <div className="rounded-md bg-emerald-500/30 p-2 flex items-end">
                      <div className="flex items-end gap-0.5 w-full h-8">
                        {[40, 60, 30, 75, 50, 85].map((h, i) => (
                          <div key={i} className="flex-1 bg-emerald-300 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    <div className="rounded-md bg-pink-500/30 p-2 flex items-end">
                      <div className="flex items-end gap-0.5 w-full h-8">
                        {[55, 35, 70, 45, 80, 60].map((h, i) => (
                          <div key={i} className="flex-1 bg-pink-300 rounded-t" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                ),
                bg: "from-blue-950 to-violet-950",
              },
              {
                title: "Community",
                body:
                  "Traders level up faster around honest peers and a support team that actually shows up when the screen turns red. We protect that culture, hard.",
                icon: <Users className="w-7 h-7" />,
                visual: (
                  <div className="flex items-center justify-center h-full p-4 gap-2">
                    {[
                      "from-orange-400 to-pink-500",
                      "from-violet-400 to-purple-600",
                      "from-blue-400 to-cyan-500",
                      "from-emerald-400 to-teal-500",
                    ].map((g, i) => (
                      <div key={i} className={`w-10 h-10 rounded-full bg-gradient-to-br ${g} border-2 border-white/20 shadow-lg`} style={{ marginLeft: i > 0 ? "-12px" : 0 }} />
                    ))}
                  </div>
                ),
                bg: "from-amber-950 to-orange-950",
              },
            ].map((v) => (
              <div key={v.title} className="rounded-2xl bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 overflow-hidden hover:border-white/20 transition-all">
                <div className={`relative h-40 bg-gradient-to-br ${v.bg} overflow-hidden`}>
                  {v.visual}
                  <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/10 backdrop-blur text-white flex items-center justify-center">
                    {v.icon}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-white font-extrabold text-xl mb-2">{v.title}</h3>
                  <p className="text-white/55 text-sm leading-relaxed">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* READY TO START CTA */}
      <section className="py-14">
        <div className="container mx-auto px-4 md:px-6 max-w-5xl">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#4A00E0] via-[#6B21FF] to-[#8E2DE2] p-10 md:p-14 text-center shadow-2xl">
            <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, rgba(255,255,255,0.2), transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.15), transparent 40%)" }} />
            <div className="relative">
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3">Ready to take the evaluation?</h2>
              <p className="text-white/80 max-w-xl mx-auto mb-8 text-sm md:text-base">
                Pick a program, go through the rulebook, and start whenever you feel set — our team is one ping away if anything
                is unclear.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/sign-up">
                  <Button className="bg-white text-[#4A00E0] hover:bg-white/90 rounded-full h-12 px-7 font-extrabold shadow-lg">
                    Get started <ArrowRight size={16} className="ml-2" />
                  </Button>
                </Link>
                <Link href="/#faq">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full h-12 px-7 font-extrabold bg-transparent">
                    Read FAQ
                  </Button>
                </Link>
                <Link href="/#contact">
                  <Button variant="outline" className="border-white/40 text-white hover:bg-white/10 rounded-full h-12 px-7 font-extrabold bg-transparent">
                    Contact us
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Trust strip below CTA */}
          <div className="grid grid-cols-3 gap-4 mt-8 max-w-3xl mx-auto">
            {[
              { icon: <TrendingUp className="w-4 h-4" />, value: "15,000+", label: "Active Traders" },
              { icon: <Zap className="w-4 h-4" />, value: "₹45L+", label: "Monthly Payouts" },
              { icon: <ShieldCheck className="w-4 h-4" />, value: "100%", label: "Rule-Transparent" },
            ].map((s) => (
              <div key={s.label} className="text-center px-3 py-4 rounded-xl bg-white/[0.03] border border-white/10">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/15 text-violet-300 mb-2">
                  {s.icon}
                </div>
                <div className="text-white font-extrabold text-lg leading-none">{s.value}</div>
                <div className="text-white/50 text-[11px] mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-white/10 py-6 text-center text-white/30 text-sm bg-[#0a0010]">
        © 2025 FundedWealth. All rights reserved. &nbsp;|&nbsp;{" "}
        <Link href="/" className="hover:text-white/60 transition-colors">Back to Home</Link>
      </div>
    </div>
  );
};

export default AboutPage;
