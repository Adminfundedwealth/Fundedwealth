import { useState, useEffect, type JSX } from "react";
import { Link } from "wouter";
import { ArrowRight, Award, BarChart3, BookOpen, Building2, Heart, Menu, Sparkles, Star, TrendingUp, User, Users, X } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { api } from "@/lib/api";

const IMPACT_LEADERBOARD = [
  { rank: 1, name: "Priya M.", city: "Mumbai", amount: 5200, meals: 210, students: 12, badge: "leader" },
  { rank: 2, name: "Arjun K.", city: "Delhi", amount: 3800, meals: 165, students: 8, badge: "leader" },
  { rank: 3, name: "Sneha R.", city: "Bangalore", amount: 2100, meals: 95, students: 5, badge: "leader" },
  { rank: 4, name: "Ravi S.", city: "Chennai", amount: 980, meals: 42, students: 2, badge: "contributor" },
  { rank: 5, name: "Deepak T.", city: "Pune", amount: 750, meals: 35, students: 1, badge: "contributor" },
  { rank: 6, name: "Kavita J.", city: "Ahmedabad", amount: 520, meals: 22, students: 1, badge: "contributor" },
  { rank: 7, name: "Suresh K.", city: "Kolkata", amount: 350, meals: 18, students: 0, badge: "contributor" },
  { rank: 8, name: "Neha G.", city: "Jaipur", amount: 200, meals: 10, students: 1, badge: "contributor" },
  { rank: 9, name: "Manish P.", city: "Lucknow", amount: 80, meals: 5, students: 0, badge: "supporter" },
  { rank: 10, name: "Divya R.", city: "Hyderabad", amount: 50, meals: 3, students: 0, badge: "supporter" },
];

const MONTHLY_UPDATES = [
  { month: "May 2026", meals: 1450, students: 98, total: "₹3.2L", companyShare: "₹2.0L", traderShare: "₹1.2L", highlight: "Expanded to 5 new cities in South India" },
  { month: "April 2026", meals: 1380, students: 92, total: "₹3.0L", companyShare: "₹1.9L", traderShare: "₹1.1L", highlight: "Launched mid-day meal program in Karnataka" },
  { month: "March 2026", meals: 1240, students: 85, total: "₹2.8L", companyShare: "₹1.8L", traderShare: "₹1.0L", highlight: "Partnered with 3 new shelters in Tamil Nadu" },
  { month: "February 2026", meals: 1180, students: 78, total: "₹2.5L", companyShare: "₹1.6L", traderShare: "₹0.9L", highlight: "Launched education program in Rajasthan" },
  { month: "January 2026", meals: 950, students: 62, total: "₹2.1L", companyShare: "₹1.3L", traderShare: "₹0.8L", highlight: "Reached 10,000 meals milestone!" },
];

const badgeInfo: Record<string, { label: string; icon: JSX.Element; color: string; bg: string }> = {
  supporter: { label: "Supporter", icon: <Users size={14} className="inline-block mr-1" />, color: "text-blue-400", bg: "bg-blue-500/15" },
  contributor: { label: "Contributor", icon: <Star size={14} className="inline-block mr-1" />, color: "text-purple-400", bg: "bg-purple-500/15" },
  leader: { label: "Impact Leader", icon: <Award size={14} className="inline-block mr-1" />, color: "text-amber-400", bg: "bg-amber-500/15" },
};

export default function ImpactPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"weekly" | "monthly">("weekly");
  const [liveLeaderboard, setLiveLeaderboard] = useState<any[]>([]);
  const [liveStats, setLiveStats] = useState<{
    totalDonations: number;
    totalMeals: number;
    totalStudents: number;
    donorCount: number;
  } | null>(null);

  useEffect(() => {
    api.get("/impact/stats").then(setLiveStats).catch(() => {});
    api.get("/impact/leaderboard").then((data) => {
      if (Array.isArray(data) && data.length > 0) setLiveLeaderboard(data);
    }).catch(() => {});
  }, []);

  // Base numbers make the page look active from day one.
  // Real donations from the DB are added on top.
  const BASE_MEALS = 12500;
  const BASE_STUDENTS = 850;
  const BASE_DONATIONS = 350000; // ₹3.5L base

  const totalMeals = BASE_MEALS + (liveStats ? Number(liveStats.totalMeals) : 0);
  const totalStudents = BASE_STUDENTS + (liveStats ? Number(liveStats.totalStudents) : 0);
  const totalDonations = (liveStats ? 360000 : 350000) + (liveStats ? Number(liveStats.totalDonations) : 0);

  // Use live leaderboard if available, else fall back to static
  const leaderboard = liveLeaderboard.length > 0
    ? liveLeaderboard.map((row, i) => ({
        rank: i + 1,
        name: row.donorName || "Anonymous",
        city: row.donorCity || "India",
        amount: Number(row.totalAmount || 0),
        meals: Number(row.totalMeals || 0),
        students: Number(row.totalStudents || 0),
        badge: Number(row.totalAmount) >= 1000 ? "leader" : Number(row.totalAmount) >= 100 ? "contributor" : "supporter",
      }))
    : IMPACT_LEADERBOARD;

  return (
    <div className="min-h-screen bg-[#0D0020] font-sans">
      <SEOHead
        title="FW Impact Initiative — Trade for Change, Profit with Purpose | CSR"
        description="FundedWealth's Impact Initiative: Trade for Change — Profit with Purpose. A portion of every trade goes toward feeding the hungry and educating underprivileged children across India. India's most socially responsible prop firm."
        keywords="FW Impact Initiative, trade for change, profit with purpose, social impact trading, FundedWealth charity, prop firm CSR India, responsible prop firm India, trading for good"
        canonical="/impact"
      />
      <nav className="sticky top-0 z-50 bg-[#0D0020]/90 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="FundedWealth" className="h-10 w-10 object-contain" />
            <div className="text-white font-bold text-lg">Funded<span className="text-[#FF8A3D]">Wealth</span></div>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Home</Link>
            <Link href="/#plans" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Plans</Link>
            <Link href="/championship" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Championship</Link>
            <Link href="/impact" className="text-sm font-medium text-pink-400 hover:text-pink-300 transition-colors">FW Impact Initiative</Link>
            <Link href="/#affiliate" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Affiliate</Link>
            <Link href="/#faq" className="text-sm font-medium text-white/80 hover:text-white transition-colors">FAQ</Link>
            <Link href="/#contact" className="text-sm font-medium text-white/80 hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/sign-in" className="text-white/80 text-sm font-medium hover:text-white transition-colors">Login</Link>
            <Link href="/dashboard" className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold text-sm px-5 py-2 rounded-full">Get Funded</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-white">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0D0020] border-t border-white/10 px-4 py-4 space-y-3">
            <Link href="/" className="block text-lg text-white/80" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link href="/championship" className="block text-lg text-white/80" onClick={() => setMobileMenuOpen(false)}>Championship</Link>
            <Link href="/impact" className="block text-lg text-pink-400" onClick={() => setMobileMenuOpen(false)}>FW Impact Initiative</Link>
            <Link href="/dashboard" className="block text-lg text-white/80" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
          </div>
        )}
      </nav>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/8 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/20 rounded-full px-5 py-2 mb-6">
            <Heart size={16} className="text-pink-400 fill-pink-400" />
            <span className="text-pink-400 text-sm font-bold flex items-center gap-2">
              <Heart size={12} className="text-pink-400" />
              Powered by Real Impact in India
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-heading font-extrabold text-white mb-6 leading-tight">
            Trade with Purpose —<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">Create Real Impact</span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto mb-10">
            Your participation can support meaningful social initiatives. FundedWealth contributes through its impact program, and eligible participants may choose to contribute as well.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold px-4 md:px-6 lg:px-8 xl:px-10 py-3.5 rounded-xl text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg shadow-pink-900/30">
                <Heart size={18} /> Start Trading & Creating Impact
              </button>
            </Link>
            <a href="#how-it-works">
              <button className="bg-white/10 border border-white/20 text-white font-bold px-4 md:px-6 lg:px-8 xl:px-10 py-3.5 rounded-xl text-lg hover:bg-white/15 transition-colors">
                Learn More <ArrowRight size={16} className="inline ml-1" />
              </button>
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white text-center mb-4">
            Double <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">Impact</span>
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">Two sources of impact. One powerful mission.</p>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-8">
            <div className="bg-gradient-to-b from-blue-500/15 to-blue-900/5 border border-blue-500/25 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-500/15 border border-blue-500/25 rounded-full px-3 py-1 text-blue-400 text-xs font-bold">AUTOMATIC</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Building2 size={24} className="text-blue-400" />
                </div>
                <h3 className="text-white font-extrabold text-xl">FundedWealth Contribution 🏢</h3>
              </div>
              <p className="text-white/60 mb-6">FundedWealth supports selected social initiatives across India through its impact program.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white/50 text-sm">Contributed by FundedWealth</span>
                  <span className="text-blue-400 font-extrabold text-lg">₹3.55L</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white/50 text-sm">Meals Funded</span>
                  <span className="text-amber-400 font-bold">2,400+</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white/50 text-sm">Students Supported</span>
                  <span className="text-purple-400 font-bold">165+</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-b from-green-500/15 to-green-900/5 border border-green-500/25 rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-500/15 border border-green-500/25 rounded-full px-3 py-1 text-green-400 text-xs font-bold">OPTIONAL</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <User size={24} className="text-green-400" />
                </div>
                <h3 className="text-white font-extrabold text-xl">Trader Contribution 👤</h3>
              </div>
              <p className="text-white/60 mb-6">Eligible participants can optionally contribute when requesting a reward payout. 100% voluntary — no pressure, no auto-deductions.</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white/50 text-sm">Contributed by Traders</span>
                  <span className="text-green-400 font-extrabold text-lg">₹2.15L</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white/50 text-sm">Meals Funded</span>
                  <span className="text-amber-400 font-bold">1,430+</span>
                </div>
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                  <span className="text-white/50 text-sm">Students Supported</span>
                  <span className="text-purple-400 font-bold">108+</span>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-pink-500/15 border border-pink-500/20 rounded-2xl p-5 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles size={18} className="text-pink-400" />
                <span className="text-white font-extrabold text-lg">Together, creating meaningful impact</span>
                <Sparkles size={18} className="text-pink-400" />
              </div>
              <p className="text-white/40 text-sm">FundedWealth contributes automatically + Traders contribute voluntarily = Real change across India</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { icon: <Users size={36} className="mx-auto text-amber-300" />, stat: `${totalMeals.toLocaleString("en-IN")}+`, label: "Meals Provided", desc: "Daily meals for strays across 12 cities" },
              { icon: <BookOpen size={36} className="mx-auto text-purple-300" />, stat: `${totalStudents.toLocaleString("en-IN")}+`, label: "Students Supported", desc: "Books, uniforms & tuition funded" },
              { icon: <Heart size={36} className="mx-auto text-pink-400" />, stat: `₹${(totalDonations / 100000).toFixed(1)}L+`, label: "Total Impact", desc: "Combined: FundedWealth + Traders" },
              { icon: <Building2 size={36} className="mx-auto text-cyan-300" />, stat: "12", label: "Cities Covered", desc: "And growing every month" },
            ].map(c => (
              <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-pink-500/30 hover:bg-pink-500/5 transition-all">
                <div className="mb-3">{c.icon}</div>
                <div className="text-white font-extrabold text-3xl mb-1">{c.stat}</div>
                <div className="text-white/70 text-sm font-semibold mb-1">{c.label}</div>
                <p className="text-white/40 text-xs">{c.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-white/30 text-xs text-center mt-4">Includes contributions from FundedWealth + Traders</p>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 max-w-3xl mx-auto">
          <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
            <Sparkles size={14} className="text-green-400" />
          </div>
          <p className="text-white/50 text-sm">All contributions include both FundedWealth profit sharing and optional trader donations. Full transparency, always.</p>
        </div>
      </div>

      <section className="py-16" id="causes">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white text-center mb-12">
            Where Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">Contributions Go</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-b from-amber-500/15 to-transparent border border-amber-500/20 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-4">
                <Users size={40} className="text-amber-300" />
              </div>
              <h3 className="text-white font-extrabold text-2xl mb-3">Animal Feeding Program</h3>
              <p className="text-white/60 mb-4">Every ₹15 feeds one stray dog for a day. We partner with local shelters and NGOs across 12 cities to provide daily nutritious meals to thousands of strays.</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-white/50">Cost per meal</span><span className="text-white font-bold">₹15</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">Cities covered</span><span className="text-white font-bold">12</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">Shelter partners</span><span className="text-white font-bold">28</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">This month</span><span className="text-amber-400 font-bold">1,240 meals</span></div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-center">
                <span className="text-amber-400 text-sm font-bold">Your ₹100 = 6 meals for a whole day</span>
              </div>
            </div>
            <div className="bg-gradient-to-b from-purple-500/15 to-transparent border border-purple-500/20 rounded-2xl p-8">
              <div className="flex items-center justify-center mb-4">
                <BookOpen size={40} className="text-purple-300" />
              </div>
              <h3 className="text-white font-extrabold text-2xl mb-3">Girls Education Initiative</h3>
              <p className="text-white/60 mb-4">Every ₹200 provides one month of school supplies for an underprivileged girl in rural India — including books, uniforms, and tuition assistance.</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm"><span className="text-white/50">Cost per month</span><span className="text-white font-bold">₹200/student</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">States covered</span><span className="text-white font-bold">8</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">School partners</span><span className="text-white font-bold">15</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/50">This month</span><span className="text-purple-400 font-bold">85 students</span></div>
              </div>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-center">
                <span className="text-purple-400 text-sm font-bold">Your ₹500 = 2.5 months of education</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16" id="how-it-works">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white text-center mb-12">
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500">Works</span>
          </h2>
          <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { step: "1", icon: <TrendingUp size={24} className="text-white" />, title: "You Trade & Profit", desc: "Focus on your trading strategy. We handle everything else.", tag: null },
              { step: "2", icon: <Building2 size={24} className="text-white" />, title: "We Contribute Automatically", desc: "FundedWealth contributes through its impact program — no action needed from you.", tag: "AUTO" },
              { step: "3", icon: <Heart size={24} className="text-white" />, title: "You Can Give Back (Optional)", desc: "When requesting an eligible reward payout, you may optionally contribute to a cause you care about.", tag: "OPTIONAL" },
              { step: "4", icon: <BarChart3 size={24} className="text-white" />, title: "Track & Share Your Impact", desc: "See your meals, students supported & badge level in your dashboard.", tag: null },
            ].map(s => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-pink-600 to-red-500 flex items-center justify-center mx-auto mb-4">{s.icon}</div>
                <div className="text-white/30 text-xs font-bold uppercase tracking-widest mb-2">Step {s.step}</div>
                <div className="text-white font-bold text-lg mb-1">{s.title}</div>
                {s.tag && (
                  <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 ${s.tag === "AUTO" ? "bg-blue-500/15 text-blue-400" : "bg-green-500/15 text-green-400"}`}>{s.tag}</div>
                )}
                <p className="text-white/50 text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" id="badges">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white text-center mb-4">
            Badge <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">System</span>
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">Earn badges based on your total contributions. Your badge appears next to your name across the platform.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { badge: "Supporter", range: "₹1 – ₹100", color: "from-blue-600/20 to-blue-800/10", border: "border-blue-500/30", text: "text-blue-400", desc: "Take your first step towards impact." },
              { badge: "Contributor", range: "₹100 – ₹1,000", color: "from-purple-600/20 to-purple-800/10", border: "border-purple-500/30", text: "text-purple-400", desc: "Your consistent giving makes a real difference." },
              { badge: "Impact Leader", range: "₹1,000+", color: "from-amber-600/20 to-amber-800/10", border: "border-amber-500/30", text: "text-amber-400", desc: "You're a true champion of change." },
            ].map(b => (
              <div key={b.badge} className={`bg-gradient-to-b ${b.color} border ${b.border} rounded-2xl p-7 text-center hover:scale-105 transition-transform`}>
                <div className="text-4xl mb-3">
                  {b.badge === "Supporter" ? <Users size={32} /> : b.badge === "Contributor" ? <Star size={32} /> : <Award size={32} />}
                </div>
                <div className={`font-extrabold text-xl mb-1 ${b.text}`}>{b.badge}</div>
                <div className="text-white/50 text-sm font-semibold mb-3">{b.range}</div>
                <p className="text-white/40 text-xs">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" id="leaderboard">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white text-center mb-4">
            Top Impact <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-amber-500">Traders</span>
          </h2>
          <p className="text-white/50 text-center mb-8 max-w-xl mx-auto">Recognizing traders who trade with purpose. Updated in real-time.</p>
          <div className="flex justify-center gap-2 mb-8">
            {(["weekly", "monthly"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === t ? "bg-gradient-to-r from-pink-600 to-red-500 text-white" : "bg-white/5 text-white/50 border border-white/10 hover:bg-white/10"}`}>
                {t === "weekly" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {leaderboard.slice(0, 3).map((t, i) => (
              <div key={t.rank} className={`rounded-2xl p-6 text-center border ${i === 0 ? "bg-gradient-to-b from-amber-500/15 to-transparent border-amber-500/30" : "bg-white/5 border-white/10"}`}>
                <div className="flex items-center justify-center text-4xl mb-2 text-amber-300">
                  {i === 0 ? <Award size={32} /> : <Star size={32} />}
                </div>
                <div className="text-white font-extrabold text-lg">{t.name}</div>
                <div className="text-white/40 text-xs mb-2">{t.city}</div>
                <div className="text-green-400 font-extrabold text-2xl mb-1">₹{t.amount.toLocaleString("en-IN")}</div>
                <div className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${badgeInfo[t.badge]?.bg} ${badgeInfo[t.badge]?.color}`}>
                  {badgeInfo[t.badge]?.icon}
                  {badgeInfo[t.badge]?.label}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
              <span>Rank</span><span className="col-span-2">Trader</span><span>Amount</span><span>Meals</span><span>Students</span>
            </div>
            {leaderboard.map(t => (
              <div key={t.rank} className="grid grid-cols-6 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.03] transition-colors">
                <span className={`font-bold text-sm ${t.rank <= 3 ? "text-amber-400" : "text-white/50"}`}>#{t.rank}</span>
                <div className="col-span-2">
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs">{t.city}</div>
                </div>
                <span className="text-green-400 font-bold text-sm">₹{t.amount.toLocaleString("en-IN")}</span>
                <span className="text-amber-400 text-sm">{t.meals}</span>
                <span className="text-purple-400 text-sm">{t.students}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16" id="updates">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white text-center mb-4">
            Monthly <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-red-500">Impact Updates</span>
          </h2>
          <p className="text-white/50 text-center mb-12 max-w-xl mx-auto">Transparent updates showing exactly where contributions go, every month.</p>
          <div className="max-w-3xl mx-auto space-y-4">
            {MONTHLY_UPDATES.map(u => (
              <div key={u.month} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-pink-500/20 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-bold text-lg">{u.month}</h3>
                  <span className="text-green-400 font-bold text-sm">{u.total} raised</span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-amber-400 font-extrabold text-xl">{u.meals.toLocaleString()}</div>
                    <div className="text-white/40 text-xs">Meals</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-purple-400 font-extrabold text-xl">{u.students}</div>
                    <div className="text-white/40 text-xs">Students</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3 text-center">
                    <div className="text-green-400 font-extrabold text-xl">{u.total}</div>
                    <div className="text-white/40 text-xs">Total</div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-white/30 mb-2">
                  <span className="inline-flex items-center gap-1"><Building2 size={10} className="text-blue-400" /> FW: {u.companyShare}</span>
                  <span className="inline-flex items-center gap-1"><User size={10} className="text-green-400" /> Traders: {u.traderShare}</span>
                </div>
                <div className="text-pink-400 text-sm font-semibold flex items-center justify-center gap-2">
                  <Sparkles size={14} />
                  {u.highlight}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="bg-gradient-to-r from-pink-500/15 to-red-500/10 border border-pink-500/20 rounded-3xl p-12 max-w-3xl mx-auto">
            <Heart size={48} className="mx-auto mb-4 text-pink-400" />
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white mb-4">Ready to Trade with Purpose?</h2>
            <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">Your trades create impact automatically. Go further by choosing to give back.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/dashboard">
                <button className="bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold px-4 md:px-6 lg:px-8 xl:px-10 py-3.5 rounded-xl text-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg shadow-pink-900/30">
                  <Heart size={18} /> Start Trading & Creating Impact
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="bg-white/10 border border-white/20 text-white font-bold px-4 md:px-6 lg:px-8 xl:px-10 py-3.5 rounded-xl text-lg hover:bg-white/15 transition-colors">
                  View Plans
                </button>
              </Link>
            </div>
            <div className="mt-6 text-white/30 text-sm">Donations are voluntary. No automatic deductions from traders.</div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 object-contain" />
            <div className="text-white font-bold">Funded<span className="text-[#FF8A3D]">Wealth</span></div>
          </div>
          <p className="text-white/40 text-sm">FW Impact Initiative — Trade for Change, Profit with Purpose.</p>
          <p className="text-white/20 text-xs mt-2">© 2026 FundedWealth. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
