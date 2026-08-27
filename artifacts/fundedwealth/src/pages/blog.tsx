import { useState, useEffect } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { ArrowLeft, BookOpen, Clock, User, Tag, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORIES = ["All", "Market Analysis", "Trading Psychology", "Risk Management", "Technical Analysis", "Prop Trading Tips"];

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[₹]/g, "rs")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

const FALLBACK_POSTS = [
  { id: 1, slug: "5-golden-rules-every-prop-trader-must-follow", title: "5 Golden Rules Every Prop Trader Must Follow", excerpt: "Discipline separates profitable traders from the rest. Learn the 5 rules that our top-performing traders swear by.", category: "Prop Trading Tips", author: "FundedWealth Team", date: "14 Apr 2026", readTime: "5 min", featured: true },
  { id: 2, slug: "understanding-drawdown-your-1-risk-metric", title: "Understanding Drawdown: Your #1 Risk Metric", excerpt: "Drawdown is the most critical metric in prop trading. Here's how to monitor, manage, and recover from drawdown effectively.", category: "Risk Management", author: "Ravi Kumar", date: "12 Apr 2026", readTime: "7 min", featured: false },
  { id: 3, slug: "nifty-50-weekly-analysis-key-levels-to-watch", title: "Nifty 50 Weekly Analysis: Key Levels to Watch", excerpt: "Our technical breakdown of Nifty's current structure, support/resistance levels, and what to expect this week.", category: "Market Analysis", author: "Priya Sharma", date: "11 Apr 2026", readTime: "6 min", featured: false },
  { id: 4, slug: "the-psychology-behind-revenge-trading", title: "The Psychology Behind Revenge Trading", excerpt: "Why do traders revenge trade after a loss? Understanding the psychology helps you break the cycle.", category: "Trading Psychology", author: "FundedWealth Team", date: "10 Apr 2026", readTime: "8 min", featured: false },
  { id: 5, slug: "how-to-use-rsi-and-macd-together", title: "How to Use RSI and MACD Together", excerpt: "Combining RSI and MACD gives you a powerful confirmation system. Learn the exact setup our traders use.", category: "Technical Analysis", author: "Arjun Nair", date: "9 Apr 2026", readTime: "6 min", featured: false },
  { id: 6, slug: "from-rs1l-to-rs25l-a-scaling-success-story", title: "From ₹1L to ₹25L: A Scaling Success Story", excerpt: "How Sneha Patel scaled her funded account from ₹1 Lakh to ₹25 Lakhs in just 6 months.", category: "Prop Trading Tips", author: "FundedWealth Team", date: "8 Apr 2026", readTime: "4 min", featured: false },
  { id: 7, slug: "position-sizing-the-1-5-percent-rule-explained", title: "Position Sizing: The 1.5% Rule Explained", excerpt: "Never risk more than 1.5% per trade. Here's the exact formula and why it works.", category: "Risk Management", author: "Deepak Mehta", date: "7 Apr 2026", readTime: "5 min", featured: false },
  { id: 8, slug: "bank-nifty-expiry-day-strategies", title: "Bank Nifty Expiry Day Strategies", excerpt: "Expiry days offer unique opportunities. Learn 3 strategies specifically designed for Bank Nifty expiry trading.", category: "Technical Analysis", author: "Vikram Singh", date: "6 Apr 2026", readTime: "7 min", featured: false },
  { id: 9, slug: "why-90-percent-of-traders-fail", title: "Why 90% of Traders Fail (And How to Be the 10%)", excerpt: "The statistics are brutal, but the solution is simple. Here's what separates winners from losers in trading.", category: "Trading Psychology", author: "FundedWealth Team", date: "5 Apr 2026", readTime: "9 min", featured: false },
];

export default function Blog() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState(FALLBACK_POSTS);

  useEffect(() => {
    const apiBase = (import.meta.env.VITE_API_URL as string) || "https://api.fundedwealth.com";
    fetch(`${apiBase}/api/blog`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setPosts(data.map((p: any) => ({
            id: p.id,
            slug: p.slug || titleToSlug(p.title),
            title: p.title,
            excerpt: p.excerpt || p.content?.slice(0, 150) || "",
            category: p.category || "Prop Trading Tips",
            author: p.author || "FundedWealth Team",
            date: new Date(p.publishedAt || p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            readTime: p.readTime || `${Math.max(3, Math.ceil((p.content?.length || 500) / 1000))} min`,
            featured: p.isFeatured || p.featured || false,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = posts.filter((p: any) => {
    const matchCat = category === "All" || p.category === category;
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const featured = posts.find((p: any) => p.featured);

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Prop Trading Blog India — Trading Tips, Strategies & Market Analysis"
        description="Learn trading discipline from experienced Indian traders. Expert tips on NSE, BSE and MCX instruments, risk management, technical analysis, and trading psychology. Free trading education from FundedWealth."
        keywords="prop trading blog India, trading tips India, NSE trading tips, BSE trading tips, MCX trading tips, forex trading tips India, crypto trading tips, trading psychology India, risk management trading, technical analysis India, prop trading strategies, how to become funded trader India, trading education India"
        canonical="/blog"
      />

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <BookOpen className="text-blue-400" size={20} /> Trading Blog
          </h1>
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">Home</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Trading <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Education Hub</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Market analysis, trading strategies, and expert insights from India's top funded traders.
          </p>
        </div>

        {/* ── Featured article ── */}
        {featured && (
          <Link href={`/blog/${featured.slug}`}>
            <Card className="glass-card border-blue-500/20 mb-12 max-w-4xl mx-auto overflow-hidden cursor-pointer hover:border-blue-400/40 transition-all group">
              <CardContent className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Featured</span>
                  <span className="text-white/40 text-xs">{featured.category}</span>
                </div>
                <h3 className="text-2xl font-heading font-extrabold text-white mb-3 group-hover:text-blue-400 transition-colors">
                  {featured.title}
                </h3>
                <p className="text-white/60 mb-4">{featured.excerpt}</p>
                <div className="flex items-center gap-4 text-white/40 text-xs">
                  <span className="flex items-center gap-1"><User size={12} /> {featured.author}</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {featured.readTime} read</span>
                  <span>{featured.date}</span>
                </div>
                <div className="mt-6 inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-6 py-2.5 rounded-full text-sm">
                  Read Article <ChevronRight size={16} />
                </div>
              </CardContent>
            </Card>
          </Link>
        )}

        {/* ── Filters ── */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 max-w-4xl mx-auto">
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant="ghost"
                size="sm"
                className={`rounded-full text-xs ${category === cat ? "bg-gradient-fw text-white" : "text-white/50 hover:text-white border border-white/10"}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 w-48"
            />
          </div>
        </div>

        {/* ── Article grid — every card is a link ── */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
          {filtered.filter(p => !p.featured).map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="glass-card border-white/10 hover:border-white/30 hover:bg-white/[0.03] transition-all cursor-pointer group h-full">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag size={12} className="text-white/30" />
                    <span className="text-white/40 text-xs">{post.category}</span>
                  </div>
                  <h3 className="text-lg font-heading font-bold text-white mb-2 group-hover:text-fw-orange transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-white/50 text-sm mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-white/30 text-xs">
                    <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime}</span>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-fw-orange text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Read article <ChevronRight size={12} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {filtered.filter(p => !p.featured).length === 0 && (
          <div className="text-center py-16 text-white/40">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No articles found. Try a different category or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
