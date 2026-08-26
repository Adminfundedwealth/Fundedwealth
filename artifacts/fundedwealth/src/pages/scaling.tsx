import { Link } from "wouter";
import { ArrowLeft, TrendingUp, ChevronRight, CheckCircle, Star, Zap, Crown, Rocket } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const LEVELS = [
  { level: 1, account: "₹1,00,000", profitTarget: "10%", milestone: "₹10,000", split: "80%", icon: <Star size={18} />, color: "from-blue-500 to-cyan-500" },
  { level: 2, account: "₹2,50,000", profitTarget: "10%", milestone: "₹25,000", split: "80%", icon: <TrendingUp size={18} />, color: "from-green-500 to-emerald-500" },
  { level: 3, account: "₹5,00,000", profitTarget: "10%", milestone: "₹50,000", split: "85%", icon: <Zap size={18} />, color: "from-yellow-500 to-orange-500" },
  { level: 4, account: "₹10,00,000", profitTarget: "10%", milestone: "₹1,00,000", split: "85%", icon: <Rocket size={18} />, color: "from-fw-orange to-fw-pink" },
  { level: 5, account: "₹25,00,000", profitTarget: "10%", milestone: "₹2,50,000", split: "90%", icon: <Crown size={18} />, color: "from-purple-500 to-pink-500" },
  { level: 6, account: "₹50,00,000", profitTarget: "–", milestone: "Max Level", split: "90%", icon: <Crown size={18} />, color: "from-yellow-400 to-yellow-600", final: true },
];

const REQUIREMENTS = [
  "Complete minimum 30 trading days at current level",
  "Achieve at least 10% profit on your funded account",
  "Maintain consistency — no single day exceeding 40% of total profit",
  "No active rule violations (drawdown, risk limits, etc.)",
  "Request scaling upgrade through your dashboard",
];

export default function Scaling() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Scaling Plan — Grow from ₹1L to ₹50L Funded Capital | Best Prop Firm India"
        description="Scale your funded trading account from ₹1 Lakh to ₹50 Lakhs in 6 levels at India's best prop firm. FundedWealth's scaling program rewards consistent traders with more capital and higher profit splits."
        keywords="prop trading scaling plan India, funded account scaling, grow trading capital India, ₹50 lakh funded account, scaling program prop firm, best prop firm India scaling, increase funded account size, prop firm capital growth India"
        canonical="/scaling"
      />
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <TrendingUp className="text-green-400" size={20} /> Scaling Plan
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white/70 hover:text-white">Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Scale to <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">₹50 Lakhs</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">Start small, prove your skills, and unlock progressively larger accounts. Every funded trader has a clear path to ₹50L.</p>
        </div>

        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-yellow-500 to-yellow-600 hidden md:block" />

            <div className="space-y-6">
              {LEVELS.map((lvl, i) => (
                <div key={i} className="relative flex items-start gap-6">
                  <div className={`hidden md:flex w-16 h-16 rounded-2xl bg-gradient-to-br ${lvl.color} items-center justify-center text-white shrink-0 z-10 shadow-lg`}>
                    {lvl.icon}
                  </div>
                  <Card className={`glass-card border-white/10 flex-1 ${lvl.final ? "border-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.15)]" : ""}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`md:hidden w-8 h-8 rounded-lg bg-gradient-to-br ${lvl.color} flex items-center justify-center text-white text-xs`}>{lvl.icon}</span>
                            <span className="text-white/40 text-xs font-semibold uppercase tracking-widest">Level {lvl.level}</span>
                            {lvl.final && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full">MAX LEVEL</span>}
                          </div>
                          <div className="text-2xl font-heading font-extrabold text-white">{lvl.account}</div>
                        </div>
                        <div className="flex gap-6 text-sm">
                          <div>
                            <div className="text-white/40 text-xs">Profit Target</div>
                            <div className="text-green-400 font-bold">{lvl.profitTarget}</div>
                          </div>
                          <div>
                            <div className="text-white/40 text-xs">Milestone</div>
                            <div className="text-white font-bold">{lvl.milestone}</div>
                          </div>
                          <div>
                            <div className="text-white/40 text-xs">Profit Split</div>
                            <div className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink font-bold">{lvl.split}</div>
                          </div>
                        </div>
                      </div>
                      {!lvl.final && (
                        <div className="flex items-center gap-2 text-white/40 text-xs">
                          <ChevronRight size={14} /> Hit {lvl.profitTarget} profit to unlock Level {lvl.level + 1}
                        </div>
                      )}
                      {lvl.final && (
                        <div className="flex items-center gap-2 text-yellow-400 text-xs font-semibold">
                          <Crown size={14} /> Maximum account size — trade with a ₹50 Lakh simulated account
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <Card className="glass-card border-white/10">
            <CardContent className="p-8">
              <h3 className="text-xl font-heading font-bold text-white mb-6">Scaling Requirements</h3>
              <div className="space-y-4">
                {REQUIREMENTS.map((req, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-green-400 mt-0.5 shrink-0" />
                    <span className="text-white/70 text-sm">{req}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <Link href="/sign-up">
                  <Button className="bg-gradient-fw text-white border-0 rounded-full px-4 md:px-6 lg:px-8 xl:px-10 py-3 font-bold">
                    Start Your Journey →
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
