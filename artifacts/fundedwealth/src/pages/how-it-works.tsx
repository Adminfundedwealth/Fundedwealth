import { Link } from "wouter";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  TrendingUp,
  ShieldCheck,
  Wallet,
  Rocket,
  BookOpen,
  HelpCircle,
  Users,
} from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    number: "01",
    icon: <ClipboardList size={22} className="text-blue-400" />,
    title: "Choose an Evaluation Plan",
    description:
      "Select the plan that matches your trading style. FundedWealth offers four programmes: Flash (24-hour skills test), Instant (no profit target, start trading immediately), 1-Step Evaluation, and 2-Step Evaluation. Fees start at ₹999.",
    detail: [
      "Flash — fastest route; pass a 24-hour challenge",
      "Instant — no evaluation phase; trade right away",
      "1-Step — hit a 10% profit target, single phase",
      "2-Step — two phases (8% then 5%), lower fees",
    ],
    color: "from-blue-500 to-cyan-500",
    linkLabel: "Compare plans",
    linkHref: "/#plans",
  },
  {
    number: "02",
    icon: <ShieldCheck size={22} className="text-purple-400" />,
    title: "Pass the Simulated Evaluation",
    description:
      "Trade on a simulated account using live NSE and BSE price data. Hit the profit target while keeping daily and overall drawdown within the limits. All trading is simulated — no real capital is at risk.",
    detail: [
      "2% daily drawdown limit, 4–8% maximum drawdown",
      "Minimum 5 trading days required per phase",
      "No time limit — trade at your own pace",
      "Instruments: NIFTY, BANKNIFTY, SENSEX, equity F&O",
    ],
    color: "from-purple-500 to-pink-500",
    linkLabel: "Read full rules",
    linkHref: "/rules",
  },
  {
    number: "03",
    icon: <Rocket size={22} className="text-fw-orange" />,
    title: "Receive Your Funded Simulated Account",
    description:
      "After passing the evaluation and completing compliance review, you receive access to a funded simulated account. Sizes range from ₹1 Lakh up to ₹50 Lakhs depending on the plan.",
    detail: [
      "Dashboard credentials issued within a few hours of approval",
      "Simulated account balance reflects your chosen plan size",
      "Same instruments and market data as the evaluation",
      "Profit target removed — focus on consistent trading",
    ],
    color: "from-fw-orange to-fw-pink",
    linkLabel: "View scaling plan",
    linkHref: "/scaling",
  },
  {
    number: "04",
    icon: <TrendingUp size={22} className="text-green-400" />,
    title: "Trade and Earn Performance-Based Rewards",
    description:
      "Trade your funded simulated account within the risk limits. Eligible profits are split with you — up to 90% — and reviewed for reward processing every 7 days under the applicable programme terms.",
    detail: [
      "Profit split up to 90% as you scale",
      "Payout requests available every 7 trading days",
      "Minimum reward request: ₹2,500",
      "Payment via UPI, NEFT, or IMPS to your verified Indian bank",
    ],
    color: "from-green-500 to-emerald-500",
    linkLabel: "See payout proofs",
    linkHref: "/payouts",
  },
  {
    number: "05",
    icon: <Wallet size={22} className="text-yellow-400" />,
    title: "Scale Your Account",
    description:
      "Demonstrate consistency across three consecutive profitable cycles and your account is automatically reviewed for a capital increase. Progress from ₹1 Lakh up to ₹50 Lakhs across six scaling levels.",
    detail: [
      "25% capital increase per qualifying scale-up",
      "Profit split increases from 80% → 85% → 90%",
      "Automatic — no extra fee to scale",
      "Top performers may qualify for private capital allocation",
    ],
    color: "from-yellow-500 to-orange-500",
    linkLabel: "Scaling details",
    linkHref: "/scaling",
  },
];

const PLANS = [
  { name: "Flash", fee: "₹999", target: "24-hour challenge", accounts: "₹1L – ₹5L", split: "80%" },
  { name: "Instant", fee: "₹2,999", target: "No profit target", accounts: "₹1L – ₹10L", split: "70–80%" },
  { name: "1-Step", fee: "₹2,999", target: "10% in one phase", accounts: "₹1L – ₹25L", split: "80%" },
  { name: "2-Step", fee: "₹1,999", target: "8% then 5%", accounts: "₹5L – ₹25L", split: "80%" },
];

const FAQS = [
  {
    q: "Is FundedWealth a real prop firm in India?",
    a: "FundedWealth is an Indian simulated trading evaluation platform. All accounts and trading activity are simulated. Eligible participants may qualify for performance-based rewards under the applicable programme terms. FundedWealth is not a SEBI-registered broker or investment adviser.",
  },
  {
    q: "How long does the evaluation take?",
    a: "There is no time limit. All evaluation phases have unlimited duration. The minimum is 5 trading days per phase. Most traders complete a 1-Step evaluation within 2–6 weeks.",
  },
  {
    q: "Can I trade NIFTY and BANKNIFTY?",
    a: "Yes. FundedWealth evaluations focus on Indian market instruments: NIFTY 50, BANKNIFTY, SENSEX, FINNIFTY index futures and options, plus NIFTY 500 equity futures and stock options on NSE/BSE.",
  },
  {
    q: "What happens if I fail the evaluation?",
    a: "The evaluation fee is non-refundable on failure. You can purchase a fresh evaluation at any time. A discounted retake voucher is available inside your dashboard for traders who came close.",
  },
  {
    q: "When do I get paid after getting funded?",
    a: "Eligible reward requests can be submitted every 7 trading days once you meet the minimum threshold of ₹2,500 and complete the required trading days. Approved rewards are typically processed within 12 hours, subject to verification and provider timelines.",
  },
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="How to Get a Funded Trading Account in India — Step-by-Step"
        description="Learn exactly how FundedWealth's prop trading evaluation works. Choose a plan from ₹999, pass a simulated NIFTY/BANKNIFTY challenge, receive a funded account up to ₹50 Lakhs, and earn performance-based rewards."
        keywords="how to get funded trading account India, prop trading evaluation process India, how prop trading works India, funded account India steps, become funded trader India, NIFTY funded account how it works, prop firm evaluation India, funded trading account process"
        canonical="/how-it-works"
      />

      {/* Navbar */}
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <BookOpen className="text-fw-orange" size={20} /> How It Works
          </h1>
          <Link href="/#plans">
            <Button variant="ghost" className="text-white/70 hover:text-white text-sm">View Plans</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-14 max-w-4xl">

        {/* Hero */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fw-orange/10 border border-fw-orange/30 text-fw-orange text-xs font-bold uppercase tracking-[0.2em] mb-5">
            Simple 5-Step Process
          </span>
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold mb-4 leading-tight">
            How to Get a{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink">
              Funded Trading Account
            </span>{" "}
            in India
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            FundedWealth provides simulated prop trading evaluations for Indian market instruments — NIFTY, BANKNIFTY, SENSEX, and equities. Here is exactly how the process works, from registration to funded account to rewards.
          </p>
        </div>

        {/* 5-Step Process */}
        <div className="relative mb-16">
          {/* Connecting line */}
          <div className="absolute left-8 top-10 bottom-10 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-yellow-500 hidden md:block" />

          <div className="space-y-8">
            {STEPS.map((step, i) => (
              <div key={i} className="relative flex items-start gap-6">
                {/* Step number badge */}
                <div className={`hidden md:flex w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} items-center justify-center text-white font-extrabold text-lg shrink-0 z-10 shadow-lg`}>
                  {step.number}
                </div>

                <Card className="glass-card border-white/10 flex-1 hover:border-white/20 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`md:hidden w-8 h-8 rounded-lg bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                        {step.number}
                      </div>
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                        {step.icon}
                      </div>
                      <h3 className="text-white font-heading font-bold text-lg leading-tight">{step.title}</h3>
                    </div>

                    <p className="text-white/65 text-sm leading-relaxed mb-4">{step.description}</p>

                    <ul className="space-y-1.5 mb-4">
                      {step.detail.map((d, j) => (
                        <li key={j} className="flex items-start gap-2 text-white/60 text-sm">
                          <CheckCircle size={13} className="text-green-400 mt-0.5 shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>

                    <Link href={step.linkHref}>
                      <span className="inline-flex items-center gap-1.5 text-fw-orange text-xs font-semibold hover:text-fw-pink transition-colors">
                        {step.linkLabel} <ArrowRight size={12} />
                      </span>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Plan comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-heading font-extrabold text-white mb-6 text-center">
            Choose Your Starting Plan
          </h2>
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[540px] text-sm">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left px-5 py-3 text-white/50 font-semibold uppercase text-xs tracking-wider">Plan</th>
                  <th className="text-left px-5 py-3 text-white/50 font-semibold uppercase text-xs tracking-wider">Fee</th>
                  <th className="text-left px-5 py-3 text-white/50 font-semibold uppercase text-xs tracking-wider">Target</th>
                  <th className="text-left px-5 py-3 text-white/50 font-semibold uppercase text-xs tracking-wider">Account Size</th>
                  <th className="text-left px-5 py-3 text-white/50 font-semibold uppercase text-xs tracking-wider">Profit Split</th>
                </tr>
              </thead>
              <tbody>
                {PLANS.map((p, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-4 text-white font-bold">{p.name}</td>
                    <td className="px-5 py-4 text-fw-orange font-semibold">{p.fee}</td>
                    <td className="px-5 py-4 text-white/70">{p.target}</td>
                    <td className="px-5 py-4 text-white/70">{p.accounts}</td>
                    <td className="px-5 py-4 text-green-400 font-semibold">{p.split}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-white/40 text-xs text-center mt-3">
            All account balances are simulated. Fees and plan terms subject to the applicable programme rules.
          </p>
        </div>

        {/* FAQ section */}
        <div className="mb-16">
          <h2 className="text-2xl font-heading font-extrabold text-white mb-6 text-center flex items-center justify-center gap-2">
            <HelpCircle size={22} className="text-fw-pink" /> Common Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <Card key={i} className="glass-card border-white/10">
                <CardContent className="p-5">
                  <div className="font-bold text-white mb-2 text-sm">{faq.q}</div>
                  <p className="text-white/60 text-sm leading-relaxed">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link href="/faq">
              <span className="text-fw-orange text-sm font-semibold hover:text-fw-pink transition-colors inline-flex items-center gap-1.5">
                See all 70+ FAQs <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>

        {/* Internal links / CTA grid */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { icon: <ClipboardList size={20} className="text-blue-400" />, label: "Trading Rules", desc: "Full evaluation rulebook", href: "/rules" },
            { icon: <TrendingUp size={20} className="text-green-400" />, label: "Scaling Plan", desc: "Grow from ₹1L to ₹50L", href: "/scaling" },
            { icon: <Users size={20} className="text-purple-400" />, label: "Community", desc: "Join 50,000+ traders", href: "/community" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <Card className="glass-card border-white/10 hover:border-white/25 transition-all cursor-pointer group h-full">
                <CardContent className="p-5 text-center">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    {item.icon}
                  </div>
                  <div className="text-white font-bold text-sm group-hover:text-fw-orange transition-colors">{item.label}</div>
                  <div className="text-white/40 text-xs mt-1">{item.desc}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <h3 className="text-2xl font-heading font-extrabold text-white mb-3">
            Ready to Start Your Evaluation?
          </h3>
          <p className="text-white/55 mb-6 max-w-md mx-auto">
            Plans from ₹999. All trading is simulated on live NSE/BSE price data. No real capital is provided or at risk.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/sign-up">
              <Button className="bg-gradient-to-r from-fw-orange to-fw-pink text-white rounded-full px-8 h-12 font-extrabold shadow-lg shadow-fw-pink/30">
                Get Started <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
            <Link href="/faq">
              <Button variant="outline" className="border-white/15 text-white bg-white/5 hover:bg-white/10 rounded-full px-8 h-12 font-bold">
                <HelpCircle size={16} className="mr-2" /> FAQ
              </Button>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
