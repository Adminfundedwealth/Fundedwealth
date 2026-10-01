import { ArrowLeft, ArrowRight, BadgeCheck, ChartCandlestick, CheckCircle2, ShieldCheck, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const highlights = [
  {
    title: "India-first prop trading",
    text: "Built for Indian traders who want simulated evaluation accounts with NSE, BSE, and MCX coverage rather than generic offshore offerings.",
    icon: ChartCandlestick,
  },
  {
    title: "Clear evaluation rules",
    text: "Set your risk limits, trade within the daily and overall drawdown controls, and focus on consistency instead of guessing the rules.",
    icon: ShieldCheck,
  },
  {
    title: "Rewards once you qualify",
    text: "Eligible traders can scale their account and submit reward requests under the programme terms after passing the evaluation phase.",
    icon: TrendingUp,
  },
];

const plans = [
  { name: "Flash", fee: "₹999", detail: "Fastest path to a simulated evaluation with a 24-hour challenge and direct account progression." },
  { name: "Instant", fee: "₹2,999", detail: "No target-driven challenge; trade from the start with a streamlined evaluation model." },
  { name: "1-Step", fee: "₹2,999", detail: "Single-phase evaluation with a 10% target and a focused trading process." },
  { name: "2-Step", fee: "₹1,999", detail: "Two-phase assessment that helps traders prove consistency and risk control." },
];

const faqs = [
  {
    question: "What is a prop firm in India?",
    answer: "A prop firm in India is a simulated trading evaluation platform that lets traders access larger account sizes and earn performance-based rewards when they follow the rules and achieve the required results.",
  },
  {
    question: "Is FundedWealth a good prop firm for Indian traders?",
    answer: "FundedWealth is designed around Indian market instruments, evaluation rules, and reward terms for traders who want a simplified simulated path to funded trading without taking on real capital risk.",
  },
  {
    question: "Can I trade NIFTY and BANKNIFTY on a funded account?",
    answer: "Yes. FundedWealth evaluations focus on NIFTY, BANKNIFTY, SENSEX, FINNIFTY, and other relevant Indian market instruments used by active traders in the country.",
  },
  {
    question: "Do I need to deposit real capital?",
    answer: "No. The evaluation is a simulated trading process. All trading is simulated, and the platform is intended to support strategy testing and disciplined performance rather than real-money investing.",
  },
];

export default function PropFirmIndiaPage() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Prop Firm India — Simulated Funded Trading Accounts for Indian Traders"
        description="Find the FundedWealth prop firm experience built for Indian traders. Learn how simulated funded accounts, evaluation rules, rewards, and NIFTY-focused trading work in India."
        keywords="prop firm india, prop trading firm india, best prop firm india, funded trading account india, prop firm for indian traders, indian prop firm, funded trader india, funded account india"
        canonical="/prop-firm-india"
      />

      <div className="sticky top-0 z-40 border-b border-white/10 bg-[#1A0030]/95 backdrop-blur-md">
        <div className="container mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-white/70 transition-colors hover:text-white">
            <ArrowLeft size={18} />
            <span>Back to home</span>
          </Link>
          <div className="hidden items-center gap-2 md:flex">
            <BadgeCheck className="text-fw-orange" size={18} />
            <span className="text-sm font-medium text-white/80">India-focused prop trading</span>
          </div>
          <Link href="/#plans">
            <Button className="bg-gradient-to-r from-fw-orange to-fw-pink text-white">
              Explore plans
            </Button>
          </Link>
        </div>
      </div>

      <main className="container mx-auto max-w-6xl px-4 py-12 md:py-18">
        <section className="grid items-center gap-10 md:grid-cols-[1.2fr_0.8fr]">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-fw-orange/30 bg-fw-orange/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-fw-orange">
              Best prop firm India
            </span>
            <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">
              Prop firm India for traders who want a <span className="text-transparent bg-gradient-to-r from-fw-orange to-fw-pink bg-clip-text">clear path to funded accounts</span>
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/70">
              FundedWealth offers a simulated evaluation model for Indian traders who want to trade NIFTY, BANKNIFTY, SENSEX, and other market instruments under defined rules and reward terms.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#plans">
                <Button className="bg-gradient-to-r from-fw-orange to-fw-pink text-white">
                  Get funded
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10">
                  How it works
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-4 text-sm text-white/60">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="text-green-400" size={16} /> India-focused coverage</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="text-green-400" size={16} /> Simulated evaluation model</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="text-green-400" size={16} /> Reward eligibility terms</span>
            </div>
          </div>

          <Card className="border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(103,80,244,0.2)]">
            <CardContent className="space-y-4 p-6">
              <div className="rounded-2xl border border-white/10 bg-[#120423] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">State of the market</p>
                <p className="mt-3 text-3xl font-black text-white">₹999</p>
                <p className="mt-1 text-sm text-white/60">Entry fee across select plans</p>
              </div>
              <div className="space-y-3">
                {[
                  "NIFTY, BANKNIFTY, SENSEX, equity F&O access",
                  "Daily and overall drawdown controls",
                  "Reward eligibility after evaluation completion",
                  "Flexible account sizes up to ₹50 Lakhs",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#140626] p-3 text-sm text-white/80">
                    <CheckCircle2 className="mt-0.5 text-green-400" size={16} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-16 grid gap-6 md:grid-cols-3">
          {highlights.map(({ title, text, icon: Icon }) => (
            <Card key={title} className="border border-white/10 bg-white/5">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-fw-orange to-fw-pink text-white">
                  <Icon size={22} />
                </div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/65">{text}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-20">
          <div className="mb-8 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-fw-orange">Popular plans</p>
            <h2 className="mt-3 text-3xl font-black text-white md:text-4xl">Choose the evaluation that matches your trading style</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <Card key={plan.name} className="border border-white/10 bg-gradient-to-b from-white/6 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                    <span className="rounded-full border border-fw-orange/30 bg-fw-orange/10 px-2 py-1 text-xs font-bold text-fw-orange">{plan.fee}</span>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-white/65">{plan.detail}</p>
                  <Link href="/#plans" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-fw-orange">
                    Compare plans <ArrowRight size={14} />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-3xl border border-white/10 bg-[#120423] p-8 md:p-10">
          <h2 className="text-3xl font-black text-white md:text-4xl">Why traders choose FundedWealth as a prop firm in India</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 text-green-400" size={18} />
                <span className="text-white/75">Evaluation process is designed around a transparent set of rules, risk limits, and milestones.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 text-green-400" size={18} />
                <span className="text-white/75">Targeted at Indian instruments such as NIFTY, BANKNIFTY, SENSEX, and index and stock futures.</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 text-green-400" size={18} />
                <span className="text-white/75">A clear reward structure helps traders understand what qualifies for payout and scaling.</span>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 text-green-400" size={18} />
                <span className="text-white/75">The website is structured around clear educational pages such as rules, payouts, and how-it-works.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20">
          <h2 className="text-3xl font-black text-white md:text-4xl">Frequently asked questions</h2>
          <div className="mt-8 space-y-4">
            {faqs.map((item) => (
              <Card key={item.question} className="border border-white/10 bg-white/5">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white">{item.question}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/70">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
