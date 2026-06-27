import { Link } from "wouter";
import { TrendingUp, Target, Users, Zap, Heart, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const MissionPage = () => {
  return (
    <div className="min-h-screen bg-[#0a0010] text-white">
      <SEOHead
        title="Our Mission — Democratizing Trading for Every Indian"
        description="FundedWealth's mission is to democratize trading by providing funded accounts to talented Indian traders. We believe every skilled trader deserves capital to trade, regardless of their financial background."
        keywords="FundedWealth mission, prop trading India mission, democratize trading India, funded trading vision, Indian traders empowerment, prop firm mission India"
        canonical="/mission"
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

      {/* Hero Banner */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a0030] via-[#0a0010] to-[#0a0010]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-fw-purple/10 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-fw-purple/20 border border-fw-purple/30 text-fw-purple text-sm font-bold mb-6">
            <Heart size={14} /> OUR MISSION
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-heading font-extrabold text-white mb-6 leading-tight">
            Turning Indian Skill Into<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange via-fw-pink to-fw-purple">
              Real Trading Wealth
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            FundedWealth exists for one reason: to remove capital as the barrier between a talented trader and a life-changing income.
          </p>
        </div>
      </section>

      {/* Disclaimer strip */}
      <div className="bg-white/3 border-y border-white/10 py-3">
        <p className="text-center text-white/40 text-xs px-4">
          "FundedWealth India is not a SEBI-registered entity and does not provide regulated financial services. All activities are for educational and skill assessment purposes."
        </p>
      </div>

      {/* Main content */}
      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">

          {/* Opening statement */}
          <div className="bg-white/3 border border-white/10 rounded-3xl p-10 mb-12">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink mb-6 leading-snug">
              Giving India's Best Traders the Capital They Deserve
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-4">
              FundedWealth is India's fastest-growing performance-based proprietary trading firm — built to bridge the gap between raw trading talent and real financial opportunity. We give disciplined traders access to capital up to ₹50 Lakhs without asking them to risk a single rupee of their own savings.
            </p>
            <p className="text-white/55 leading-relaxed mb-4">
              Born from the belief that skill — not savings — should determine who gets funded, we've grown into a platform trusted by 15,000+ traders across every corner of India. From tier-1 cities to small towns, if you can trade, we'll back you.
            </p>
            <p className="text-white/55 leading-relaxed">
              We believe a future where capital never limits potential isn't just possible — it's what we're building every single day.
            </p>
          </div>

          {/* What We Do */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-fw-orange/20 flex items-center justify-center">
                <TrendingUp size={20} className="text-fw-orange" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-fw-orange">What We Do</h3>
            </div>
            <div className="space-y-5">
              {[
                {
                  title: "We Back Traders with Capital:",
                  body: "Clear the evaluation challenge and you receive a fully-funded live account — up to ₹50L — to trade the Indian markets exactly the way you trade now.",
                },
                {
                  title: "We Keep the Rules Honest:",
                  body: "No hidden tripwires, no arbitrary denials. Our rules are published, simple, and designed to reward good risk management — not punish traders on technicalities.",
                },
                {
                  title: "We Share Profits Generously:",
                  body: "Earn 70%–90% of every rupee of profit you generate. We only win when you win — so we're fully invested in your success.",
                },
                {
                  title: "We Pay Fast, Every Week:",
                  body: "No 30-day cycles. Verified payouts go straight to your UPI or bank account in 12 hours. We average 5–7 hours. Because your money is your money.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 p-6 bg-white/3 border border-white/8 rounded-2xl hover:border-fw-orange/20 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-fw-orange mt-2 shrink-0" />
                  <p className="text-white/75 leading-relaxed">
                    <span className="text-white font-bold">{item.title}</span>{" "}{item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Who We're For */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-fw-pink/20 flex items-center justify-center">
                <Users size={20} className="text-fw-pink" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-fw-pink">Who We're For</h3>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-2xl p-8">
              <p className="text-white/75 text-lg leading-relaxed mb-6">
                We exist for the self-taught swing trader who has never had enough capital to show what they can really do. For the F&O strategist with a consistent edge but limited funds. For the disciplined scalper in a tier-3 city who has the same skills as anyone in Mumbai — but not the same backing.
              </p>
              <p className="text-white/55 leading-relaxed">
                If you can trade profitably and manage risk consistently, FundedWealth is for you. Metro or small town, beginner or veteran — your zip code doesn't limit your potential here.
              </p>
            </div>
          </div>

          {/* Our Vision */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-fw-purple/20 flex items-center justify-center">
                <Target size={20} className="text-fw-purple" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-fw-purple">Our Vision</h3>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-2xl p-8">
              <p className="text-white/75 text-lg leading-relaxed">
                To become India's most trusted trader-first prop firm — one where success is shared, barriers are removed, and every funded trader becomes a story of skill meeting opportunity. We measure our growth in funded accounts and trader milestones, not just revenue.
              </p>
            </div>
          </div>

          {/* Built for India */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <MapPin size={20} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-green-400">Built in India, For Indian Markets</h3>
            </div>
            <div className="bg-white/3 border border-white/10 rounded-2xl p-8">
              <p className="text-white/75 text-lg leading-relaxed mb-4">
                Most prop firms are designed around global Forex and crypto markets. We're different — FundedWealth is engineered specifically for NSE, BSE, MCX, and the unique rhythms of Indian equities, futures, and options.
              </p>
              <p className="text-white/55 leading-relaxed">
                Our funding models, evaluation parameters, payout systems, and support infrastructure are all tailored to how Indian traders actually trade. We speak your market's language.
              </p>
            </div>
          </div>

          {/* Join the Movement */}
          <div className="mb-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-fw-orange/20 flex items-center justify-center">
                <Zap size={20} className="text-fw-orange" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-fw-orange">Join the Movement</h3>
            </div>
            <div className="bg-gradient-to-br from-fw-orange/10 via-fw-pink/10 to-fw-purple/10 border border-fw-pink/20 rounded-2xl p-8">
              <p className="text-white/80 text-lg leading-relaxed mb-4">
                FundedWealth isn't just a platform — it's a growing community of 15,000+ ambitious, disciplined traders who chose to bet on their skill instead of waiting for capital. No loans. No external investors. No gimmicks.
              </p>
              <p className="text-white/55 leading-relaxed">
                Zero hidden fees, full trading freedom, and a team that actually wants you to succeed. Your trading journey doesn't have to wait any longer.
              </p>
            </div>
          </div>

          {/* Closing tagline */}
          <div className="text-center py-10 border-t border-white/10">
            <p className="text-2xl font-heading font-bold text-white/80 mb-8">
              Your Skills. <span className="text-fw-orange">Our Capital.</span> <span className="text-fw-pink">Unlimited Potential.</span>
            </p>
            <Link href="/">
              <Button className="h-14 px-10 text-lg font-bold bg-gradient-to-r from-fw-orange to-fw-pink text-white rounded-xl shadow-lg shadow-fw-orange/30 hover:opacity-90 transition-opacity">
                Get Funded Today <ArrowRight size={20} />
              </Button>
            </Link>
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

export default MissionPage;
