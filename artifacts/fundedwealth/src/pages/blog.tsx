import { useState, useEffect } from "react";
import { Link } from "wouter";
import SEOHead from "@/components/SEOHead";
import { BreadcrumbSchema } from "@/components/StructuredData";
import { ArrowLeft, BookOpen, Clock, User, Tag, Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiBase } from "@/lib/api-base";

const CATEGORIES = ["All", "Market Analysis", "Trading Psychology", "Risk Management", "Technical Analysis", "Prop Trading Tips"];

export default function Blog() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/blog`)
      .then(r => {
        if (!r.ok) throw new Error("Failed to load blog posts");
        return r.json();
      })
      .then(data => {
        if (!Array.isArray(data)) throw new Error("Invalid blog response");
        setPosts(data.map((p: any) => ({
          id: p.id,
          slug: p.slug,
          title: p.title,
          excerpt: p.excerpt || p.content?.slice(0, 150) || "",
          category: p.category || "Prop Trading Tips",
          author: p.author || "FundedWealth Team",
          date: new Date(p.publishedAt || p.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          readTime: p.readTime || `${Math.max(3, Math.ceil((p.content?.length || 500) / 1000))} min`,
          featured: p.isFeatured || p.featured || false,
        })));
      })
      .catch(() => {
        setPosts([]);
        setError(true);
      })
      .finally(() => setLoading(false));
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
        title="Prop Trading Blog India [Free Education] — NIFTY Tips, Risk & Psychology"
        description="Free trading education for Indian prop traders. Expert tips on NIFTY, BANKNIFTY and index F&O strategies, risk management, technical analysis, and trading psychology from FundedWealth's expert team."
        keywords="prop trading blog India, trading tips India, NSE trading tips, NIFTY options strategies, trading psychology India, risk management trading india, technical analysis India, prop trading strategies, how to become funded trader India 2026"
        canonical="/blog"
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://www.fundedwealth.com/" },
          { name: "Blog", url: "https://www.fundedwealth.com/blog" },
        ]}
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

        {loading && (
          <div className="text-center py-16 text-white/40">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Loading published articles...</p>
          </div>
        )}

        {!loading && error && (
          <div className="text-center py-16 text-white/40">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Unable to load published articles right now.</p>
          </div>
        )}

        {/* ── Featured article ── */}
        {!loading && !error && featured && (
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
        {!loading && !error && <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 max-w-4xl mx-auto">
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
        </div>}

        {/* ── Article grid — every card is a link ── */}
        {!loading && !error && <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1600px] mx-auto">
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
        </div>}

        {!loading && !error && filtered.filter(p => !p.featured).length === 0 && (
          <div className="text-center py-16 text-white/40">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No articles found. Try a different category or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
