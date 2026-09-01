import { useState, useEffect } from "react";
import { Link, useParams, useLocation } from "wouter";
import DOMPurify from "dompurify";
import SEOHead from "@/components/SEOHead";
import { ArticleSchema, BreadcrumbSchema } from "@/components/StructuredData";
import {
  ArrowLeft, BookOpen, Clock, User, Tag, Calendar,
  Eye, Share2, Twitter, Facebook, Link2, ChevronRight,
  TrendingUp, Shield, Brain, BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiBase } from "@/lib/api-base";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage?: string | null;
  readTime: string;
  isFeatured: boolean;
  isPublished: boolean;
  views: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  ogImage?: string | null;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface RelatedPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  author: string;
  readTime: string;
  publishedAt?: string | null;
  createdAt: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Market Analysis": <TrendingUp size={14} />,
  "Risk Management": <Shield size={14} />,
  "Trading Psychology": <Brain size={14} />,
  "Technical Analysis": <BarChart3 size={14} />,
  "Prop Trading Tips": <BookOpen size={14} />,
};

const BASE_URL = "https://fundedwealth.com";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function slugToTitle(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BlogArticle() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug ?? "";
  const [, navigate] = useLocation();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [related, setRelated] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);

    const apiBase = getApiBase();
    fetch(`${apiBase}/api/blog/${encodeURIComponent(slug)}`)
      .then(async (res) => {
        if (res.status === 404) throw new Error("Article not found");
        if (!res.ok) throw new Error("Failed to load article");
        return res.json();
      })
      .then((data: BlogPost) => {
        setPost(data);
        // Fetch related posts by same category
        return fetch(`${apiBase}/api/blog?category=${encodeURIComponent(data.category)}`);
      })
      .then(async (res) => {
        if (!res.ok) return [];
        return res.json();
      })
      .then((allPosts: RelatedPost[]) => {
        // Exclude current post, take up to 3
        const rel = allPosts.filter((p) => p.slug !== slug).slice(0, 3);
        setRelated(rel);
      })
      .catch((err: Error) => {
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${BASE_URL}/blog/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(`${BASE_URL}/blog/${slug}`);
  const shareTitle = encodeURIComponent(post?.title ?? slugToTitle(slug));

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0020] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#4A00E0] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/50 text-sm">Loading article…</p>
        </div>
      </div>
    );
  }

  // ── Error / not found ──
  if (error || !post) {
    return (
      <div className="min-h-screen bg-[#0D0020] text-white flex items-center justify-center">
        <SEOHead noindex title="Article Not Found" />
        <div className="text-center max-w-md px-4">
          <div className="text-5xl mb-4">📄</div>
          <h1 className="text-2xl font-heading font-bold mb-2">Article Not Found</h1>
          <p className="text-white/50 mb-6 text-sm">
            {error === "Article not found"
              ? "This article doesn't exist or has been removed."
              : "Unable to load this article right now. Please try again."}
          </p>
          <Link href="/blog">
            <Button className="bg-gradient-fw text-white border-0 font-bold">
              ← Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Resolved SEO values ──
  const seoTitle = post.metaTitle || post.title;
  const seoDesc = post.metaDescription || post.excerpt;
  const seoKeywords = post.keywords || undefined;
  const seoImage = post.ogImage || post.coverImage || `${BASE_URL}/opengraph.jpg`;
  const canonicalPath = `/blog/${post.slug}`;
  const publishedDate = post.publishedAt || post.createdAt;
  const modifiedDate = post.updatedAt;

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      {/* ── Head tags ── */}
      <SEOHead
        title={seoTitle}
        description={seoDesc}
        keywords={seoKeywords}
        canonical={canonicalPath}
        ogImage={seoImage}
        ogType="article"
      />

      {/* ── Article JSON-LD ── */}
      <ArticleSchema
        headline={post.title}
        description={post.excerpt}
        author={post.author}
        datePublished={publishedDate}
        dateModified={modifiedDate}
        image={seoImage}
        url={`${BASE_URL}${canonicalPath}`}
        keywords={post.keywords ?? undefined}
      />

      {/* ── Breadcrumb JSON-LD ── */}
      <BreadcrumbSchema
        items={[
          { name: "Home", url: `${BASE_URL}/` },
          { name: "Blog", url: `${BASE_URL}/blog` },
          { name: post.title, url: `${BASE_URL}${canonicalPath}` },
        ]}
      />

      {/* ── Sticky nav ── */}
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">Blog</span>
          </Link>
          <div className="hidden md:flex items-center gap-1 text-white/40 text-xs">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <ChevronRight size={12} />
            <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
          </div>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white text-xs">
              Home
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Article container ── */}
      <div className="container mx-auto px-4 py-10 max-w-4xl">

        {/* Category + meta */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#4A00E0]/20 border border-[#4A00E0]/30 text-[#a78bfa] text-xs font-bold">
            {CATEGORY_ICONS[post.category] ?? <Tag size={12} />}
            {post.category}
          </span>
          {post.isFeatured && (
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold">
              Featured
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Author / meta row */}
        <div className="flex flex-wrap items-center gap-4 text-white/50 text-sm mb-8 pb-8 border-b border-white/10">
          <span className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4A00E0] to-[#8E2DE2] flex items-center justify-center text-white text-xs font-bold">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <span className="text-white/70 font-medium">{post.author}</span>
          </span>
          {publishedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              <time dateTime={publishedDate}>{formatDate(publishedDate)}</time>
            </span>
          )}
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {post.readTime}
          </span>
          <span className="flex items-center gap-1">
            <Eye size={14} />
            {post.views.toLocaleString()} views
          </span>
        </div>

        {/* Cover image */}
        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8 border border-white/10">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-64 sm:h-80 object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>
        )}

        {/* Excerpt callout */}
        <div className="bg-[#1a0030]/60 border-l-4 border-[#4A00E0] rounded-r-xl px-5 py-4 mb-8">
          <p className="text-white/80 text-base leading-relaxed italic">{post.excerpt}</p>
        </div>

        {/* Article body */}
        <div
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-heading prose-headings:font-bold prose-headings:text-white
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-white/75 prose-p:leading-relaxed prose-p:mb-4
            prose-li:text-white/75 prose-li:mb-1
            prose-strong:text-white prose-strong:font-bold
            prose-a:text-[#a78bfa] prose-a:no-underline hover:prose-a:underline
            prose-ul:list-disc prose-ul:ml-6 prose-ol:list-decimal prose-ol:ml-6
            prose-blockquote:border-l-4 prose-blockquote:border-[#4A00E0] prose-blockquote:pl-4 prose-blockquote:text-white/60"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content, { ALLOWED_TAGS: ['h1','h2','h3','h4','h5','h6','p','a','ul','ol','li','strong','em','blockquote','code','pre','br','img','span','div','table','thead','tbody','tr','th','td'], ALLOWED_ATTR: ['href','src','alt','class','target','rel','width','height'] }) }}
        />

        {/* Share + CTA strip */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Share this article</p>
            <div className="flex items-center gap-2">
              <a
                href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Share on Twitter"
              >
                <Twitter size={14} className="text-white/60" />
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center transition-colors"
                aria-label="Share on Facebook"
              >
                <Facebook size={14} className="text-white/60" />
              </a>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 text-xs font-medium"
              >
                <Link2 size={12} />
                {copied ? "Copied!" : "Copy link"}
              </button>
            </div>
          </div>

          <Link href="/#plans">
            <Button className="bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold px-6 rounded-full shadow-lg shadow-[#4A00E0]/30 hover:opacity-90 transition-opacity">
              Get Funded Now →
            </Button>
          </Link>
        </div>

        {/* Internal CTA cards */}
        <div className="mt-10 grid sm:grid-cols-3 gap-4">
          {[
            { label: "Trading Challenges", href: "/#plans", icon: "🎯", desc: "Start your funded journey" },
            { label: "Community", href: "/community", icon: "👥", desc: "Join 50,000+ traders" },
            { label: "FAQ", href: "/faq", icon: "❓", desc: "Get all your answers" },
          ].map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="glass-card border border-white/10 hover:border-[#4A00E0]/40 rounded-xl p-4 text-center cursor-pointer transition-all hover:bg-white/5 group">
                <div className="text-2xl mb-1">{item.icon}</div>
                <div className="text-white font-bold text-sm group-hover:text-[#a78bfa] transition-colors">{item.label}</div>
                <div className="text-white/40 text-xs mt-0.5">{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Related articles ── */}
      {related.length > 0 && (
        <div className="border-t border-white/10 mt-4 py-14 bg-[#0a0018]">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-2xl font-heading font-extrabold text-white mb-8">
              More in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">{post.category}</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((rel) => (
                <Link key={rel.id} href={`/blog/${rel.slug}`}>
                  <Card className="glass-card border-white/10 hover:border-white/20 transition-all cursor-pointer group h-full">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-1.5 mb-3">
                        <Tag size={11} className="text-white/30" />
                        <span className="text-white/40 text-[10px] font-semibold uppercase tracking-wider">{rel.category}</span>
                      </div>
                      <h3 className="text-sm font-heading font-bold text-white mb-2 line-clamp-2 group-hover:text-[#a78bfa] transition-colors leading-snug">
                        {rel.title}
                      </h3>
                      <p className="text-white/50 text-xs line-clamp-2 mb-3">{rel.excerpt}</p>
                      <div className="flex items-center justify-between text-white/30 text-[10px]">
                        <span className="flex items-center gap-1"><User size={10} /> {rel.author}</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {rel.readTime}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/blog">
                <Button variant="ghost" className="text-white/60 hover:text-white border border-white/10 hover:border-white/20 rounded-full px-6 text-sm">
                  View All Articles →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
