import { useState } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { Trophy, Medal, TrendingUp, Users, ArrowLeft, Crown, Star, Flame, Target, ChevronDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const TRADERS = [
  { rank: 1, name: "Ravi Kumar", city: "Delhi", profit: 482000, winRate: 82, trades: 312, account: "₹25L", badge: "🏆", streak: 14, joined: "Jan 2024" },
  { rank: 2, name: "Priya Sharma", city: "Mumbai", profit: 356000, winRate: 78, trades: 278, account: "₹10L", badge: "🥈", streak: 11, joined: "Mar 2024" },
  { rank: 3, name: "Arjun Nair", city: "Bangalore", profit: 298000, winRate: 75, trades: 245, account: "₹25L", badge: "🥉", streak: 9, joined: "Feb 2024" },
  { rank: 4, name: "Sneha Patel", city: "Ahmedabad", profit: 245000, winRate: 73, trades: 198, account: "₹10L", badge: "", streak: 8, joined: "Apr 2024" },
  { rank: 5, name: "Deepak Mehta", city: "Chennai", profit: 218000, winRate: 71, trades: 176, account: "₹5L", badge: "", streak: 7, joined: "May 2024" },
  { rank: 6, name: "Kavita Joshi", city: "Pune", profit: 192000, winRate: 69, trades: 154, account: "₹10L", badge: "", streak: 6, joined: "Mar 2024" },
  { rank: 7, name: "Vikram Singh", city: "Jaipur", profit: 178000, winRate: 68, trades: 143, account: "₹5L", badge: "", streak: 5, joined: "Jun 2024" },
  { rank: 8, name: "Anita Desai", city: "Hyderabad", profit: 165000, winRate: 66, trades: 132, account: "₹10L", badge: "", streak: 5, joined: "Apr 2024" },
  { rank: 9, name: "Rohit Verma", city: "Kolkata", profit: 148000, winRate: 65, trades: 121, account: "₹5L", badge: "", streak: 4, joined: "Jul 2024" },
  { rank: 10, name: "Meera Reddy", city: "Bangalore", profit: 135000, winRate: 64, trades: 115, account: "₹25L", badge: "", streak: 4, joined: "May 2024" },
  { rank: 11, name: "Amit Gupta", city: "Lucknow", profit: 128000, winRate: 63, trades: 108, account: "₹5L", badge: "", streak: 3, joined: "Aug 2024" },
  { rank: 12, name: "Pooja Rao", city: "Chennai", profit: 115000, winRate: 62, trades: 98, account: "₹10L", badge: "", streak: 3, joined: "Jun 2024" },
];

const HALL_OF_FAME = [
  { name: "Ravi Kumar", title: "Highest Single Month Profit", value: "₹4,82,000", icon: <Crown className="text-yellow-400" size={20} /> },
  { name: "Priya Sharma", title: "Longest Winning Streak", value: "14 Days", icon: <Flame className="text-orange-400" size={20} /> },
  { name: "Arjun Nair", title: "Most Consistent Trader", value: "82% Win Rate", icon: <Target className="text-green-400" size={20} /> },
  { name: "Sneha Patel", title: "Fastest to ₹50L", value: "45 Days", icon: <Star className="text-purple-400" size={20} /> },
];

const fmt = (n: number) => `₹${(n / 1000).toFixed(0)}K`;

export default function Leaderboard() {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "alltime">("monthly");
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? TRADERS : TRADERS.slice(0, 8);

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Prop Trading Leaderboard India [Live Rankings] — Top Funded Traders 2026"
        description="Live rankings of India's top-performing funded traders at FundedWealth. See profit, win rate, and payout totals. ₹45L+ paid monthly. Join 15,000+ evaluation participants."
        keywords="top funded traders India, prop trading leaderboard India, best prop traders India, trading competition India, funded trader rankings, prop firm leaderboard, best traders India 2026, trading profits India"
        canonical="/leaderboard"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.fundedwealth.com/" },
          { name: "Leaderboard", url: "https://www.fundedwealth.com/leaderboard" },
        ]}
      />
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <Trophy className="text-yellow-400" size={20} /> Leaderboard
          </h1>
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white/70 hover:text-white">Dashboard</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Trader <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Leaderboard</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">Top-performing funded traders ranked by profit. Compete, climb, and earn your place in the Hall of Fame.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {HALL_OF_FAME.map((item, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}>
              <Card className="glass-card border-white/10 hover:border-yellow-500/30 transition-all hover:scale-105 duration-300 h-full">
                <CardContent className="p-3 sm:p-5 text-center">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">{item.icon}</div>
                  <div className="text-white font-bold text-xs sm:text-sm mb-1 truncate">{item.name}</div>
                  <div className="text-white/50 text-[10px] sm:text-xs mb-2 leading-snug">{item.title}</div>
                  <div className="text-sm sm:text-lg font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 break-words">{item.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Prize Pool", value: "₹15L+", icon: <Trophy size={18} className="text-yellow-400" />, color: "from-yellow-500/10 to-yellow-500/5" },
            { label: "Active Traders", value: "2,800+", icon: <Users size={18} className="text-blue-400" />, color: "from-blue-500/10 to-blue-500/5" },
            { label: "Avg Win Rate", value: "68%", icon: <BarChart3 size={18} className="text-green-400" />, color: "from-green-500/10 to-green-500/5" },
            { label: "Monthly Payouts", value: "₹45L+", icon: <TrendingUp size={18} className="text-purple-400" />, color: "from-purple-500/10 to-purple-500/5" },
          ].map((stat, i) => (
            <div key={i} className={`bg-gradient-to-b ${stat.color} border border-white/10 rounded-xl p-4 flex items-center gap-3`}>
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center">{stat.icon}</div>
              <div>
                <div className="text-white/50 text-xs">{stat.label}</div>
                <div className="text-white font-extrabold text-lg">{stat.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-white/50" />
            <span className="text-white/50 text-sm">{TRADERS.length} Funded Traders</span>
          </div>
          <div className="flex gap-2">
            {(["weekly", "monthly", "alltime"] as const).map((p) => (
              <Button key={p} variant="ghost" size="sm"
                className={`rounded-full text-xs ${period === p ? "bg-gradient-fw text-white" : "text-white/50 hover:text-white"}`}
                onClick={() => setPeriod(p)}>
                {p === "alltime" ? "All Time" : p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="hidden md:grid grid-cols-[60px_1fr_100px_100px_100px_100px_100px] gap-4 px-3 sm:px-6 py-3 border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
            <div>Rank</div><div>Trader</div><div className="text-right">Profit</div><div className="text-right">Win Rate</div><div className="text-right">Trades</div><div className="text-right">Account</div><div className="text-right">Streak</div>
          </div>
          {displayed.map((t, idx) => (
            <motion.div key={t.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className={`grid grid-cols-[40px_1fr_90px] md:grid-cols-[60px_1fr_100px_100px_100px_100px_100px] gap-2 sm:gap-4 px-3 sm:px-6 py-3 sm:py-4 border-b border-white/5 hover:bg-white/5 transition-colors ${t.rank <= 3 ? "bg-yellow-500/5" : ""}`}>
              <div className="flex items-center">
                <span className={`text-lg font-bold ${t.rank === 1 ? "text-yellow-400" : t.rank === 2 ? "text-gray-300" : t.rank === 3 ? "text-amber-600" : "text-white/40"}`}>
                  {t.badge || `#${t.rank}`}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-fw flex items-center justify-center text-white font-bold text-sm">{t.name.charAt(0)}</div>
                <div>
                  <div className="text-white font-semibold text-sm">{t.name}</div>
                  <div className="text-white/40 text-xs">{t.city} · {t.joined}</div>
                </div>
              </div>
              <div className="flex items-center justify-end text-green-400 font-bold text-sm">{fmt(t.profit)}</div>
              <div className="hidden md:flex items-center justify-end text-white font-semibold text-sm">{t.winRate}%</div>
              <div className="hidden md:flex items-center justify-end text-white/60 text-sm">{t.trades}</div>
              <div className="hidden md:flex items-center justify-end text-white/60 text-sm">{t.account}</div>
              <div className="hidden md:flex items-center justify-end">
                <span className="flex items-center gap-1 text-orange-400 text-sm font-semibold"><Flame size={14} />{t.streak}d</span>
              </div>
            </motion.div>
          ))}
        </Card>
        {!showAll && (
          <div className="text-center mt-6">
            <Button variant="ghost" className="text-white/50 hover:text-white" onClick={() => setShowAll(true)}>
              <ChevronDown size={16} className="mr-2" /> Show All Traders
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
