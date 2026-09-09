import { Link } from "wouter";
import { ArrowLeft, Star, Quote, TrendingUp, Award, Users, Play } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STORIES = [
  {
    name: "Ravi Kumar",
    city: "Delhi",
    age: 28,
    account: "₹25L",
    totalPayout: "₹12,40,000",
    journey: "Started with ₹1L account, scaled to ₹25L in 8 months",
    quote: "FundedWealth gave me the capital I never had. I went from trading ₹50K of my savings to managing ₹25 Lakhs of their capital. The 12-hour payout is real — I've received 14 payouts so far.",
    strategy: "Price Action + Order Flow",
    tradingSince: "2022",
    rating: 5,
    featured: true,
  },
  {
    name: "Priya Sharma",
    city: "Mumbai",
    age: 25,
    account: "₹10L",
    totalPayout: "₹7,80,000",
    journey: "College student who turned trading into a full-time career",
    quote: "I was skeptical at first — another prop firm? But the transparency won me over. Clear rules, fast payouts, and genuine support. I'm now a full-time trader at 25.",
    strategy: "Swing Trading (Nifty Options)",
    tradingSince: "2023",
    rating: 5,
  },
  {
    name: "Arjun Nair",
    city: "Bangalore",
    age: 32,
    account: "₹25L",
    totalPayout: "₹9,60,000",
    journey: "Software engineer who switched to full-time trading",
    quote: "I left my IT job after my third payout. The scaling plan is incredible — I went from ₹5L to ₹25L by just being consistent. No hidden catches.",
    strategy: "Algorithmic + Discretionary",
    tradingSince: "2021",
    rating: 5,
  },
  {
    name: "Sneha Patel",
    city: "Ahmedabad",
    age: 30,
    account: "₹10L",
    totalPayout: "₹5,20,000",
    journey: "Homemaker who started trading as a side income",
    quote: "Trading from home while managing my family. FundedWealth's flexible time limits mean I can trade at my own pace. Already earned more than my husband's monthly salary!",
    strategy: "Support/Resistance + RSI",
    tradingSince: "2024",
    rating: 5,
  },
  {
    name: "Deepak Mehta",
    city: "Chennai",
    age: 35,
    account: "₹50L",
    totalPayout: "₹18,50,000",
    journey: "From ₹1L to ₹50L — the full scaling journey",
    quote: "I've been with FundedWealth since the beginning. Started with their smallest plan, followed the scaling path, and now I trade with ₹50 Lakhs. The consistency rule actually made me a better trader.",
    strategy: "Multi-timeframe Analysis",
    tradingSince: "2020",
    rating: 5,
    featured: true,
  },
  {
    name: "Kavita Joshi",
    city: "Pune",
    age: 27,
    account: "₹5L",
    totalPayout: "₹3,40,000",
    journey: "MBA graduate who chose trading over corporate",
    quote: "Best decision I ever made. The affiliate program alone earns me ₹40K/month on top of my trading profits. FundedWealth is building something special for Indian traders.",
    strategy: "Breakout Trading",
    tradingSince: "2023",
    rating: 5,
  },
];

export default function SuccessStories() {
  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Funded Trader Success Stories India — Real Reviews & Profits"
        description="Real success stories from FundedWealth evaluation participants across India. See how traders from Delhi, Mumbai, Bangalore, Hyderabad & more earn consistent profits through FundedWealth's structured evaluation programs."
        keywords="funded trader success stories India, prop trading success stories, funded trader testimonials India, FundedWealth reviews, real funded trader profits, best prop firm reviews India, prop trading India reviews, prop firm testimonials"
        canonical="/success-stories"
      />
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft size={20} />
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-heading font-bold hidden sm:block">FundedWealth</span>
          </Link>
          <h1 className="text-lg font-heading font-bold flex items-center gap-2">
            <Award className="text-yellow-400" size={20} /> Success Stories
          </h1>
          <Link href="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">Home</Button>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-heading font-extrabold mb-4">
            Real Traders, <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Real Results</span>
          </h2>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">Stories from evaluation participants who received performance-based rewards through FundedWealth.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto">
          <Card className="glass-card border-white/10">
            <CardContent className="p-5 text-center">
              <div className="text-2xl font-heading font-extrabold text-green-400">₹56L+</div>
              <div className="text-white/50 text-xs">Total Paid to Traders</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-5 text-center">
              <div className="text-2xl font-heading font-extrabold text-yellow-400">15K+</div>
              <div className="text-white/50 text-xs">Funded Traders</div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10">
            <CardContent className="p-5 text-center">
              <div className="text-2xl font-heading font-extrabold text-purple-400">4.9/5</div>
              <div className="text-white/50 text-xs">Average Rating</div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 max-w-4xl mx-auto">
          {STORIES.map((story, i) => (
            <Card key={i} className={`glass-card border-white/10 overflow-hidden ${story.featured ? "border-yellow-500/20 shadow-[0_0_20px_rgba(234,179,8,0.1)]" : ""}`}>
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="shrink-0 flex flex-col items-center md:items-start gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-fw flex items-center justify-center text-white font-bold text-2xl">{story.name.charAt(0)}</div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: story.rating }).map((_, j) => (
                        <Star key={j} size={12} className="text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    {story.featured && <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-bold px-2 py-0.5 rounded-full">TOP TRADER</span>}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-heading font-bold text-white">{story.name}</h3>
                      <span className="text-white/30 text-xs">{story.city} · Age {story.age}</span>
                    </div>
                    <div className="text-white/50 text-sm mb-4">{story.journey}</div>
                    <div className="bg-white/5 rounded-xl p-4 mb-4 relative">
                      <Quote size={16} className="text-white/10 absolute top-3 left-3" />
                      <p className="text-white/80 text-sm italic pl-6">"{story.quote}"</p>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="bg-green-500/10 text-green-400 px-3 py-1.5 rounded-full font-semibold">Total Payout: {story.totalPayout}</div>
                      <div className="bg-purple-500/10 text-purple-400 px-3 py-1.5 rounded-full font-semibold">Account: {story.account}</div>
                      <div className="bg-blue-500/10 text-blue-400 px-3 py-1.5 rounded-full font-semibold">{story.strategy}</div>
                      <div className="bg-white/5 text-white/50 px-3 py-1.5 rounded-full">Trading since {story.tradingSince}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Card className="glass-card border-fw-pink/20 max-w-2xl mx-auto">
            <CardContent className="p-8">
              <Users className="text-fw-pink mx-auto mb-4" size={32} />
              <h3 className="text-2xl font-heading font-bold text-white mb-3">Your Story Could Be Next</h3>
              <p className="text-white/60 mb-6">Join thousands of Indian traders participating in FundedWealth's performance-based evaluation programs.</p>
              <Link href="/sign-up">
                <Button className="bg-gradient-fw text-white border-0 rounded-full px-4 md:px-6 lg:px-8 xl:px-10 py-3 font-bold">
                  Start Your Journey →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
