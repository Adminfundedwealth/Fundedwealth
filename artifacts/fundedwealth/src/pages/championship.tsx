import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Trophy, ArrowRight, CheckCircle2, Medal, ShieldCheck, BarChart3, Users, Zap, Star, Copy, Smartphone, CreditCard } from "lucide-react";
import SEOHead from "@/components/SEOHead";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getApiBase } from "@/lib/api-base";

const ChampionshipPage = () => {
  const [challenge, setChallenge] = useState<"weekly" | "monthly">("weekly");
  const [prizeTab, setPrizeTab] = useState<"monthly" | "weekly">("monthly");
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "" });
  const [checkoutStep, setCheckoutStep] = useState(1); // 1=Configure, 2=Verify, 3=Pay
  const [payCategory, setPayCategory] = useState<"upi" | "crypto" | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [utrStatus, setUtrStatus] = useState<"idle" | "verifying" | "pending" | "success" | "failed">("idle");
  const [utrError, setUtrError] = useState("");
  const [paySecondsLeft, setPaySecondsLeft] = useState(900);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [oxapayLoading, setOxapayLoading] = useState(false);
  const [oxapayError, setOxapayError] = useState("");
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState("");
  const [termsAgreed, setTermsAgreed] = useState(false);

  const FW_UPI_ID = "BHARATPE09S9C1V8L1Z53809@yesbankltd";
  const FW_MERCHANT_NAME = "AMAN KUMAR SINGH";
  const challengePrice = challenge === "weekly" ? 149 : 399;
  const challengeLabel = challenge === "weekly" ? "Weekly Challenge" : "Monthly Challenge";
  const productName = `FWC ${challengeLabel}`;

  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(FW_UPI_ID)}&pn=${encodeURIComponent(FW_MERCHANT_NAME)}&am=${challengePrice}&cu=INR&tn=${encodeURIComponent(productName)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(upiPayUrl)}`;

  useEffect(() => {
    if (checkoutStep !== 3 || payCategory !== "upi") return;
    setPaySecondsLeft(900);
    const t = setInterval(() => {
      setPaySecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [checkoutStep, payCategory]);

  const fmtTimer = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const copyToField = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleVerifyUtr = async () => {
    if (utrInput.trim().length < 10) {
      setUtrError("Please enter a valid 10-12 digit UTR/Reference Number");
      return;
    }
    setUtrError("");
    setUtrStatus("verifying");
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/payments/verify-utr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          utr: utrInput.trim(),
          amount: challengePrice,
          planType: `championship-${challenge}`,
          billing: { firstName: form.name, email: form.email, phone: form.mobile },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setUtrStatus("success");
      } else if (res.status === 202 || data.status === "pending") {
        setUtrStatus("pending");
      } else {
        setUtrStatus("failed");
        setUtrError(data.message || "UTR not found yet. Please wait 2-5 mins after paying and retry.");
      }
    } catch {
      setUtrStatus("pending");
    }
  };

  const handleOxaPayPayment = async () => {
    setOxapayLoading(true);
    setOxapayError("");
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/payments/create-crypto-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          paymentMethod: "oxapay-usdt-trc20",
          planType: `championship-${challenge}`,
          amount: challengePrice,
          billing: { firstName: form.name, email: form.email, phone: form.mobile },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.payLink) {
        window.location.href = data.payLink;
      } else {
        setOxapayError(data.message || "Payment creation failed. Please try again.");
      }
    } catch {
      setOxapayError("Network error. Please check your connection and try again.");
    } finally {
      setOxapayLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setRazorpayLoading(true);
    setRazorpayError("");
    try {
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: challengePrice, planType: `championship-${challenge}`, sizeIndex: 0 }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.order?.id) {
        setRazorpayError(data.message || "Could not create payment order. Please try again.");
        setRazorpayLoading(false);
        return;
      }
      const options: any = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "FundedWealth Championship",
        description: `${challengeLabel} — ?${challengePrice}`,
        order_id: data.order.id,
        image: "/logo.png",
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        theme: { color: "#4A00E0" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${apiBase}/api/razorpay/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: challengePrice,
                planType: `championship-${challenge}`,
                sizeIndex: 0,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyRes.ok && verifyData.success) {
              window.location.href = "/dashboard?payment=success&type=championship";
            } else {
              setRazorpayError("Payment verification failed. Contact support: " + response.razorpay_payment_id);
            }
          } catch {
            setRazorpayError("Could not verify payment. Contact support if amount was deducted.");
          }
          setRazorpayLoading(false);
        },
        modal: { ondismiss: () => { setRazorpayLoading(false); setRazorpayError("Payment cancelled. Try again."); } },
      };
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (r: any) => {
        setRazorpayError("Payment failed: " + (r.error?.description || "Unknown error"));
        setRazorpayLoading(false);
      });
      rzp.open();
    } catch {
      setRazorpayError("Network error. Please try again.");
      setRazorpayLoading(false);
    }
  };

  const formValid = form.name.trim() && form.email.trim() && form.mobile.trim();
  return (
    <div className="min-h-screen bg-[#0a0010] text-white">
      <SEOHead
        title="Trading Championship India 2026 — Win iPhone, MacBook & Cash Prizes"
        description="Join FundedWealth's monthly trading championship. Compete with India's best prop traders and win iPhone 16, MacBook, Royal Enfield & cash prizes. Free entry for funded traders. Weekly & monthly trading contests."
        keywords="trading championship India, prop trading competition India, trading contest India 2026, win prizes trading, FundedWealth championship, monthly trading challenge India, trading tournament India, best trading competition"
        canonical="/championship"
      />
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
              ? Back to Home
            </Button>
          </Link>
        </div>
      </nav>

      {/* Premium page-wide floating particles — multiple types */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        {/* Round glowing dots */}
        {Array.from({ length: 35 }).map((_, i) => {
          const size = 1.5 + (i % 5) * 1.2;
          const colors = ["#fbbf24", "#DC4D34", "#D93AA0", "#4dd4ff", "#AB18C2", "#ff8a3d"];
          const color = colors[i % colors.length];
          const left = (i * 2.8 + 3) % 100;
          const top = (i * 7.3 + 5) % 100;
          const dur = 4 + (i % 6) * 1.5;
          const delay = (i * 0.4) % 6;
          return (
            <div
              key={`dot-${i}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                top: `${top}%`,
                backgroundColor: color,
                opacity: 0.4,
                boxShadow: `0 0 ${size * 3}px ${color}`,
                animation: `pageParticle ${dur}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* Star-shaped particles (4-point) */}
        {Array.from({ length: 15 }).map((_, i) => {
          const starColors = ["#fbbf24", "#ffffff", "#4dd4ff", "#D93AA0", "#ff8a3d"];
          const color = starColors[i % starColors.length];
          const size = 6 + (i % 4) * 3;
          const left = (i * 6.7 + 8) % 95;
          const top = (i * 6.2 + 3) % 90;
          const dur = 3 + (i % 4) * 2;
          const delay = (i * 0.7) % 5;
          return (
            <div
              key={`star-${i}`}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                animation: `starTwinkle ${dur}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
            >
              <svg viewBox="0 0 24 24" width={size} height={size} fill={color} opacity={0.6}>
                <path d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5Z" />
              </svg>
            </div>
          );
        })}

        {/* Diamond sparkles */}
        {Array.from({ length: 12 }).map((_, i) => {
          const sparkColors = ["#ffffff", "#fbbf24", "#4dd4ff", "#D93AA0"];
          const color = sparkColors[i % sparkColors.length];
          const size = 4 + (i % 3) * 2;
          const left = (i * 8.3 + 5) % 92;
          const top = (i * 8.1 + 7) % 88;
          const dur = 2.5 + (i % 5) * 1.2;
          const delay = (i * 0.6) % 4;
          return (
            <div
              key={`diamond-${i}`}
              className="absolute"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                width: size,
                height: size,
                backgroundColor: color,
                opacity: 0.5,
                transform: "rotate(45deg)",
                boxShadow: `0 0 ${size * 2}px ${color}`,
                animation: `diamondPulse ${dur}s ease-in-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* Shooting meteors (left to right) */}
        {Array.from({ length: 4 }).map((_, i) => {
          const top = 15 + i * 20;
          const dur = 4 + i * 1.5;
          const delay = i * 2.5;
          return (
            <div
              key={`meteor-${i}`}
              className="absolute"
              style={{
                top: `${top}%`,
                left: "-5%",
                width: 40 + i * 10,
                height: 2,
                background: `linear-gradient(to right, transparent, ${["#fbbf24", "#4dd4ff", "#D93AA0", "#ff8a3d"][i]})`,
                borderRadius: 2,
                opacity: 0.6,
                animation: `meteorShoot ${dur}s linear infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}

        {/* Rising glow particles */}
        {Array.from({ length: 10 }).map((_, i) => {
          const size = 3 + (i % 3) * 2;
          const colors = ["#fbbf24", "#DC4D34", "#4dd4ff", "#AB18C2", "#D93AA0"];
          const color = colors[i % colors.length];
          const left = (i * 10 + 5) % 95;
          const dur = 6 + (i % 4) * 2;
          const delay = (i * 1.2) % 8;
          return (
            <div
              key={`rise-${i}`}
              className="absolute rounded-full"
              style={{
                width: size,
                height: size,
                left: `${left}%`,
                bottom: "-5%",
                backgroundColor: color,
                opacity: 0.5,
                boxShadow: `0 0 ${size * 4}px ${color}`,
                animation: `riseUp ${dur}s ease-out infinite`,
                animationDelay: `${delay}s`,
              }}
            />
          );
        })}
      </div>

      {/* Hero — Full-screen background image */}
      <section className="relative overflow-hidden" style={{ minHeight: "100vh" }}>
        {/* Background image — full cover */}
        <div className="absolute inset-0">
          <img
            src="/maps/champ-man.png"
            alt=""
            className="w-full h-full object-cover object-top"
          />
        </div>

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0010]/95 via-[#0a0010]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0010] via-[#0a0010]/30 to-transparent" />

        {/* Content overlay */}
        <div className="container mx-auto px-4 md:px-6 relative z-10 flex items-center" style={{ minHeight: "100vh" }}>
          <div className="max-w-xl py-20 lg:py-24">
            {/* LIVE COMPETITION badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-fw-orange/15 border border-fw-orange/40 text-fw-orange text-sm font-bold mb-5 uppercase tracking-wider backdrop-blur-sm">
              <Trophy size={16} /> Live Competition
            </div>

            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-[3.5rem] lg:text-[4rem] font-heading font-extrabold text-white mb-4 leading-[1.1]">
              Where Traders<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink">Become Champions.</span>
            </h1>

            {/* Description */}
            <p className="text-base md:text-lg text-white/80 mb-6 leading-relaxed max-w-md">
              Compete with thousands of traders in a simulated challenge.
              Put your skills to the test and win <span className="text-fw-orange font-semibold">cash prizes</span>.
              Don't miss your chance to prove yourself and
              take home amazing rewards!
            </p>

            {/* Buttons */}
            <div className="flex gap-4 flex-wrap mb-7">
              <a href="#join">
                <Button className="h-12 px-6 text-sm font-bold bg-gradient-to-r from-fw-orange to-fw-pink text-white rounded-full shadow-lg shadow-fw-orange/30 hover:opacity-90 transition-opacity flex items-center gap-2">
                  <Trophy size={15} /> Join Competition <ArrowRight size={16} />
                </Button>
              </a>
              <a href="#prizes">
                <Button variant="outline" className="h-12 px-6 text-sm font-bold border-2 border-white/30 text-white hover:bg-white/10 rounded-full backdrop-blur-sm flex items-center gap-2">
                  <Trophy size={15} /> View Prizes <ArrowRight size={16} />
                </Button>
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 md:gap-5 mb-7">
              {[
                { icon: <Users size={15} className="text-fw-orange" />, value: "10,000+", label: "Participants" },
                { icon: <Trophy size={15} className="text-fw-pink" />, value: "Massive", label: "Prize Pool" },
                { icon: <BarChart3 size={15} className="text-cyan-400" />, value: "Real", label: "Trading Conditions" },
                { icon: <Zap size={15} className="text-yellow-400" />, value: "Live", label: "Leaderboard" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">{s.icon}</div>
                  <div>
                    <div className="text-white font-bold text-xs leading-tight">{s.value}</div>
                    <div className="text-white/50 text-[10px]">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prize cards */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { place: "1st Place", amount: "?1,00,000", border: "border-fw-orange/60", bg: "bg-fw-orange/10", text: "text-fw-orange", medal: "??" },
                { place: "2nd Place", amount: "?50,000", border: "border-white/30", bg: "bg-white/10", text: "text-white", medal: "??" },
                { place: "3rd Place", amount: "?25,000", border: "border-amber-600/40", bg: "bg-amber-900/20", text: "text-amber-400", medal: "??" },
              ].map((p, i) => (
                <div key={i} className={`rounded-2xl border ${p.border} ${p.bg} backdrop-blur-md p-3 text-center`}>
                  <div className="text-[11px] font-bold text-white/70 mb-1 flex items-center justify-center gap-1">
                    <span>{p.medal}</span> {p.place}
                  </div>
                  <div className={`text-lg md:text-xl font-heading font-extrabold ${p.text}`}>{p.amount}</div>
                  <div className="text-[10px] text-white/50 mt-0.5">Cash Prize</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes pageParticle {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
            25% { transform: translate(8px, -12px) scale(1.2); opacity: 0.6; }
            50% { transform: translate(-5px, -20px) scale(1.1); opacity: 0.5; }
            75% { transform: translate(6px, -8px) scale(0.9); opacity: 0.4; }
          }
          @keyframes starTwinkle {
            0%, 100% { transform: scale(1) rotate(0deg); opacity: 0.3; }
            25% { transform: scale(1.3) rotate(15deg); opacity: 0.8; }
            50% { transform: scale(0.8) rotate(-10deg); opacity: 0.4; }
            75% { transform: scale(1.2) rotate(5deg); opacity: 0.7; }
          }
          @keyframes diamondPulse {
            0%, 100% { transform: rotate(45deg) scale(1); opacity: 0.3; }
            50% { transform: rotate(45deg) scale(1.5); opacity: 0.8; }
          }
          @keyframes meteorShoot {
            0% { left: -10%; opacity: 0; }
            10% { opacity: 0.7; }
            90% { opacity: 0.7; }
            100% { left: 110%; opacity: 0; }
          }
          @keyframes riseUp {
            0% { bottom: -5%; opacity: 0; transform: scale(0.5); }
            20% { opacity: 0.6; transform: scale(1); }
            80% { opacity: 0.4; }
            100% { bottom: 105%; opacity: 0; transform: scale(0.3); }
          }
        `}</style>
      </section>

      {/* Prizes Section */}
      <section id="prizes" className="py-20 bg-[#0d0018]">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-heading font-extrabold text-white mb-4">
              Competition <span className="text-transparent bg-clip-text bg-gradient-to-r from-fw-orange to-fw-pink">Prizes & Giveaways</span>
            </h2>
            <p className="text-white/60 text-lg">Win up to <span className="text-fw-orange font-bold">?10 Lakh + MacBook + ?30K Cash</span> every month!</p>
          </div>

          {/* Tab switcher: Monthly / Weekly */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-2xl bg-white/5 border border-white/10 p-1.5 gap-1">
              <button
                onClick={() => setPrizeTab("monthly")}
                className={`px-4 md:px-6 lg:px-8 xl:px-10 py-3 rounded-xl font-bold text-sm transition-all ${prizeTab === "monthly" ? "bg-gradient-to-r from-fw-orange to-fw-pink text-white shadow-lg shadow-fw-orange/30" : "text-white/60 hover:text-white"}`}
              >
                ?? Monthly Prizes
              </button>
              <button
                onClick={() => setPrizeTab("weekly")}
                className={`px-4 md:px-6 lg:px-8 xl:px-10 py-3 rounded-xl font-bold text-sm transition-all ${prizeTab === "weekly" ? "bg-gradient-to-r from-fw-pink to-fw-purple text-white shadow-lg shadow-fw-pink/30" : "text-white/60 hover:text-white"}`}
              >
                ?? Weekly Prizes
              </button>
            </div>
          </div>

          {/* -- WEEKLY PRIZES -- */}
          {prizeTab === "weekly" && (
            <div className="max-w-5xl mx-auto space-y-10">

              {/* Weekly Giveaway Banner */}
              <div className="rounded-3xl overflow-hidden border border-fw-pink/20 bg-gradient-to-br from-[#1a0030] via-[#0d001a] to-[#0a0010]">
                <div className="grid md:grid-cols-2 items-center">
                  {/* Left: text info */}
                  <div className="p-8 md:p-10 flex flex-col gap-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-fw-pink/20 border border-fw-pink/30 text-fw-pink text-sm font-bold w-fit">
                      ?? Weekly & Daily Giveaways
                    </div>
                    <div>
                      <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Bumper Prize</div>
                      <h3 className="text-4xl font-heading font-extrabold text-white mb-1">MacBook <span className="text-fw-orange">+</span> iPhone 16</h3>
                      <p className="text-white/60 text-sm mt-2">Randomly selected from REAL traders who follow all rules. No gambling — pure skill rewarded every week!</p>
                    </div>
                    <div className="border-t border-white/10 pt-4">
                      <div className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Every Day Prize</div>
                      <h4 className="text-2xl font-heading font-extrabold text-blue-300">? Smart Watch</h4>
                      <p className="text-white/60 text-sm mt-1">Top-performing active trader wins daily. Trade consistently to be in the running!</p>
                    </div>
                    <a href="#join">
                      <Button className="bg-gradient-to-r from-fw-pink to-fw-purple hover:opacity-90 text-white font-bold px-6 rounded-xl w-fit">
                        Join Now <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </a>
                  </div>
                  {/* Right: prize image */}
                  <div className="relative h-72 md:h-full min-h-[280px]">
                    <img
                      src="/weekly-prizes.png"
                      alt="Weekly Prizes — MacBook, iPhone 16, Smart Watch"
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover object-center"
                    />
                    {/* subtle left-fade so it blends with left panel */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0d001a] via-transparent to-transparent pointer-events-none" style={{ width: "35%" }} />
                  </div>
                </div>
              </div>

              {/* Weekly Top 3 Podium */}
              <div>
                <h3 className="text-2xl font-heading font-extrabold text-white text-center mb-8">?? Top 3 Weekly Winners</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

                  {/* 2nd */}
                  <div className="rounded-3xl border border-white/20 bg-white/5 p-6 text-center flex flex-col gap-3">
                    <div className="text-5xl">??</div>
                    <div className="text-white/60 text-sm font-bold uppercase tracking-widest">2nd Place</div>
                    <div className="text-3xl font-heading font-extrabold text-white">?2 Lakh</div>
                    <div className="text-xs text-white/50 font-semibold bg-white/10 rounded-lg px-3 py-1.5 inline-block mx-auto">Evaluation Account</div>
                    <div className="text-xs text-white/40 font-medium">(Worth ?9,999)</div>
                    <a href="#join">
                      <Button className="w-full mt-2 bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 rounded-xl">Compete Now</Button>
                    </a>
                  </div>

                  {/* 1st — elevated */}
                  <div className="rounded-3xl border-2 border-fw-pink bg-gradient-to-b from-fw-pink/20 via-fw-pink/5 to-transparent p-6 text-center flex flex-col gap-3 shadow-2xl shadow-fw-pink/20 md:-mt-8 relative">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-fw-pink to-fw-purple text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg">
                        ?? WEEKLY TOP PRIZE
                      </div>
                    </div>
                    <div className="text-5xl mt-2">??</div>
                    <div className="text-fw-pink text-sm font-bold uppercase tracking-widest">1st Place</div>
                    <div className="text-4xl font-heading font-extrabold text-fw-pink">?5 Lakh</div>
                    <div className="text-xs text-fw-pink/80 font-semibold bg-fw-pink/10 rounded-lg px-3 py-1.5 inline-block mx-auto border border-fw-pink/30">Evaluation Account</div>
                    <div className="text-xs text-white/40 font-medium">(Worth ?17,999)</div>
                    <a href="#join">
                      <Button className="w-full h-12 mt-2 bg-gradient-to-r from-fw-pink to-fw-purple hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-fw-pink/30">Win This! ?</Button>
                    </a>
                  </div>

                  {/* 3rd */}
                  <div className="rounded-3xl border border-amber-700/40 bg-amber-900/10 p-6 text-center flex flex-col gap-3">
                    <div className="text-5xl">??</div>
                    <div className="text-amber-500 text-sm font-bold uppercase tracking-widest">3rd Place</div>
                    <div className="text-3xl font-heading font-extrabold text-white">?1 Lakh</div>
                    <div className="text-xs text-white/50 font-semibold bg-white/10 rounded-lg px-3 py-1.5 inline-block mx-auto">Evaluation Account</div>
                    <div className="text-xs text-white/40 font-medium">(Worth ?5,999)</div>
                    <a href="#join">
                      <Button className="w-full mt-2 bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 font-bold border border-amber-700/40 rounded-xl">Compete Now</Button>
                    </a>
                  </div>
                </div>
              </div>

              {/* Weekly 4th–10th */}
              <Card className="bg-white/5 border border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Medal size={18} className="text-white/60" />
                    <h4 className="font-bold text-white text-lg">4th – 10th Place</h4>
                  </div>
                  <p className="text-white/50 text-sm mb-4">Randomly selected winners from the top performers.</p>
                  <div className="space-y-3">
                    {[
                      { winners: "Random Winners", prize: "50K Evaluation Funding Account" },
                      { winners: "Random Winners", prize: "1 Lakh 2-Step Funding Account" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-fw-pink/20 text-fw-pink text-xs font-bold px-3 py-1 rounded-full">{row.winners}</span>
                          <span className="text-white/80 font-medium text-sm">{row.prize}</span>
                        </div>
                        <Medal size={16} className="text-white/30" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* -- MONTHLY PRIZES -- */}
          {prizeTab === "monthly" && <>

            {/* Monthly Prize Pool Banner */}
            <div className="max-w-5xl mx-auto mb-16">
              <div className="relative rounded-3xl overflow-hidden border border-fw-orange/30 bg-gradient-to-br from-fw-orange/10 via-[#1a0030] to-fw-purple/10 p-8 md:p-12 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,138,61,0.12)_0%,transparent_70%)]" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fw-orange/20 border border-fw-orange/40 text-fw-orange text-sm font-bold mb-4">
                    ?? Monthly Prize Pool
                  </div>
                  <div className="text-3xl sm:text-5xl md:text-7xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-fw-orange to-fw-pink mb-2">
                    ?17,59,000+
                  </div>
                  <p className="text-white/60 text-lg">Total value in prizes — funding accounts, cash & gadgets every month</p>
                </div>
              </div>
            </div>

            {/* Top 3 Prize Cards */}
            <div className="max-w-5xl mx-auto mb-10">
              <h3 className="text-2xl font-heading font-extrabold text-white text-center mb-8">?? Top 3 Monthly Winners</h3>

              {/* Podium layout: 2nd | 1st | 3rd */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">

                {/* 2nd Place */}
                <div className="rounded-3xl border border-white/20 bg-white/5 p-6 text-center flex flex-col gap-3 md:mb-0 mb-4">
                  <div className="text-5xl">??</div>
                  <div className="text-white/60 text-sm font-bold uppercase tracking-widest">2nd Place</div>
                  <div className="text-3xl font-heading font-extrabold text-white">?5 Lakh</div>
                  <div className="text-xs text-white/50 font-semibold bg-white/10 rounded-lg px-3 py-1.5 inline-block mx-auto">1-Step Evaluation Account</div>
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <span className="text-green-400 font-bold text-base">??</span> ?20,000 Cash Prize
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <span className="text-fw-orange font-bold text-base">??</span> Winner Certificate
                    </div>
                  </div>
                  <a href="#join">
                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20 rounded-xl">
                      Compete Now
                    </Button>
                  </a>
                </div>

                {/* 1st Place — elevated */}
                <div className="rounded-3xl border-2 border-fw-orange bg-gradient-to-b from-fw-orange/20 via-fw-orange/5 to-transparent p-6 text-center flex flex-col gap-3 shadow-2xl shadow-fw-orange/20 md:-mt-8 relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-fw-orange to-fw-pink text-white text-xs font-extrabold px-4 py-1.5 rounded-full shadow-lg">
                      ?? TOP PRIZE
                    </div>
                  </div>
                  <div className="text-5xl mt-2">??</div>
                  <div className="text-fw-orange text-sm font-bold uppercase tracking-widest">1st Place</div>
                  <div className="text-4xl font-heading font-extrabold text-fw-orange">?10 Lakh</div>
                  <div className="text-xs text-fw-orange/80 font-semibold bg-fw-orange/10 rounded-lg px-3 py-1.5 inline-block mx-auto border border-fw-orange/30">1-Step Evaluation Account</div>

                  {/* MacBook image */}
                  <div className="relative my-2">
                    <div className="absolute inset-0 bg-radial-gradient rounded-2xl" style={{ background: "radial-gradient(ellipse at center, rgba(255,210,60,0.25) 0%, transparent 70%)" }} />
                    <img
                      src="/macbook-gold.png"
                      alt="Apple MacBook Prize"
                      loading="lazy"
                      decoding="async"
                      className="w-full max-w-[200px] mx-auto object-contain"
                      style={{
                        filter: "drop-shadow(0 0 18px rgba(255,210,60,0.7)) drop-shadow(0 0 40px rgba(255,150,0,0.4))",
                      }}
                    />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-[#1a0030]/90 text-white text-xs font-bold px-3 py-1 rounded-full border border-yellow-400/60 whitespace-nowrap backdrop-blur-sm">
                      ?? Apple MacBook
                    </div>
                  </div>

                  <div className="border-t border-fw-orange/20 pt-3 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <span className="text-green-400 font-bold text-base">??</span> ?30,000 Cash Prize
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <span className="text-fw-orange font-bold text-base">??</span> Winner Certificate
                    </div>
                  </div>
                  <a href="#join">
                    <Button className="w-full h-12 bg-gradient-to-r from-fw-orange to-fw-pink hover:opacity-90 text-white font-bold rounded-xl shadow-lg shadow-fw-orange/30">
                      Win This! ?
                    </Button>
                  </a>
                </div>

                {/* 3rd Place */}
                <div className="rounded-3xl border border-amber-700/40 bg-amber-900/10 p-6 text-center flex flex-col gap-3 md:mb-0 mb-4">
                  <div className="text-5xl">??</div>
                  <div className="text-amber-500 text-sm font-bold uppercase tracking-widest">3rd Place</div>
                  <div className="text-3xl font-heading font-extrabold text-white">?2 Lakh</div>
                  <div className="text-xs text-white/50 font-semibold bg-white/10 rounded-lg px-3 py-1.5 inline-block mx-auto">1-Step Evaluation Account</div>
                  <div className="border-t border-amber-700/30 pt-3 space-y-2">
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <span className="text-green-400 font-bold text-base">??</span> ?9,000 Cash Prize
                    </div>
                    <div className="flex items-center justify-center gap-2 text-sm text-white/80">
                      <span className="text-fw-orange font-bold text-base">??</span> Winner Certificate
                    </div>
                  </div>
                  <a href="#join">
                    <Button className="w-full bg-amber-900/30 hover:bg-amber-900/50 text-amber-400 font-bold border border-amber-700/40 rounded-xl">
                      Compete Now
                    </Button>
                  </a>
                </div>
              </div>
            </div>

            {/* 4th–10th Monthly */}
            <div className="max-w-5xl mx-auto">
              <Card className="bg-white/5 border border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Medal size={18} className="text-white/60" />
                    <h4 className="font-bold text-white text-lg">4th – 10th Place</h4>
                  </div>
                  <p className="text-white/50 text-sm mb-4">Randomly selected winners from the top performers.</p>
                  <div className="space-y-3">
                    {[
                      { winners: "2 Winners", prize: "1 Lakh Instant Funding Account" },
                      { winners: "3 Winners", prize: "2 Lakh 2-Step Funding Account" },
                      { winners: "2 Winners", prize: "50K Instant Funding Account" },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="bg-fw-orange/20 text-fw-orange text-xs font-bold px-3 py-1 rounded-full">{row.winners}</span>
                          <span className="text-white/80 font-medium text-sm">{row.prize}</span>
                        </div>
                        <Medal size={16} className="text-white/30" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>}
        </div>
      </section>

      {/* Rules Section */}
      <section className="py-20 bg-[#0a0010]">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-white text-center mb-12 uppercase tracking-wide">
            FundedWealth Trading Competition Rules
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                icon: <Users size={22} className="text-fw-orange" />,
                title: "Eligibility",
                items: ["Age must be 18+", "Entry fee must be successfully paid"],
              },
              {
                icon: <BarChart3 size={22} className="text-fw-pink" />,
                title: "Drawdown Rules",
                badge: "Hitting the drawdown limit at any time = account disqualified.",
                items: ["Maximum Daily Drawdown limit must not be breached", "Maximum Overall Drawdown limit must not be breached"],
              },
              {
                icon: <Trophy size={22} className="text-fw-purple" />,
                title: "Ranking Criteria",
                intro: "Top 3 winners are selected based on:",
                items: ["Highest % Return (ROI Based)", "Proper risk management & no rule violations", "Minimum required trading days completed"],
              },
              {
                icon: <ShieldCheck size={22} className="text-red-400" />,
                title: "Prohibited Activities",
                badge: "Violation = Immediate removal from competition.",
                items: ["Gambling-style trading & Martingale strategy", "Overleveraging", "Copy trading / signal-based automation"],
              },
              {
                icon: <Star size={22} className="text-fw-orange" />,
                title: "Prize Distribution",
                items: ["Top 3: Performance Based", "4th to 10th: Random selection (eligible, disciplined traders only)", "iPhone Giveaway: Must follow all rules, no violations, and complete required trading days."],
              },
              {
                icon: <Zap size={22} className="text-yellow-400" />,
                title: "Final Authority",
                intro: "FundedWealth reserves the right to disqualify any participant violating rules, cancel suspicious accounts, and take the final decision on all disputes.",
                badge: "All decisions will be final and binding.",
                items: [],
              },
            ].map((rule, i) => (
              <Card key={i} className="bg-white/3 border border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">{rule.icon}</div>
                    <h4 className="text-white font-bold text-lg">{rule.title}</h4>
                  </div>
                  {rule.badge && <p className="text-fw-orange font-semibold text-xs mb-3">{rule.badge}</p>}
                  {rule.intro && <p className="text-white/60 text-sm mb-3">{rule.intro}</p>}
                  {rule.items.length > 0 && (
                    <ul className="space-y-2">
                      {rule.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2 text-white/60 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-white/40 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Championship Checkout — Cart ? Verify ? Pay */}
      <section id="join" className="py-20 bg-[#0d0018]">
        <div className="container mx-auto px-4 md:px-6 max-w-2xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-heading font-extrabold text-fw-orange mb-3">
              Join the Trading Competition
            </h2>
            <p className="text-white/60">Choose your challenge and pay securely.</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-0 mb-10">
            {[
              { num: 1, label: "Configure", icon: "Cart" },
              { num: 2, label: "Verify", icon: "Verify" },
              { num: 3, label: "Pay", icon: "?" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${checkoutStep >= s.num ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white shadow-lg shadow-[#4A00E0]/30" : "bg-white/5 border border-white/20 text-white/40"}`}>
                    {checkoutStep > s.num ? <CheckCircle2 size={18} /> : <span>{s.icon}</span>}
                  </div>
                  <span className={`text-xs font-semibold ${checkoutStep >= s.num ? "text-white" : "text-white/40"}`}>
                    {s.num} {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-18px] transition-all ${checkoutStep > s.num ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]" : "bg-white/10"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Configure — Choose challenge + details */}
          {checkoutStep === 1 && (
            <div className="space-y-6">
              {/* Prize tab switcher */}
              <div className="flex justify-center mb-4">
                <div className="inline-flex rounded-2xl bg-white/5 border border-white/10 p-1.5 gap-1">
                  <button
                    onClick={() => setPrizeTab("monthly")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${prizeTab === "monthly" ? "bg-gradient-to-r from-fw-orange to-fw-pink text-white shadow-lg" : "text-white/60 hover:text-white"}`}
                  >
                    <Trophy size={14} className="inline mr-1" /> Monthly Prizes
                  </button>
                  <button
                    onClick={() => setPrizeTab("weekly")}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${prizeTab === "weekly" ? "bg-gradient-to-r from-fw-pink to-fw-purple text-white shadow-lg" : "text-white/60 hover:text-white"}`}
                  >
                    <Star size={14} className="inline mr-1" /> Weekly Prizes
                  </button>
                </div>
              </div>

              {/* Challenge selector */}
              <Card className="bg-white/5 border border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Choose Your Challenge</h3>
                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${challenge === "weekly" ? "border-fw-orange bg-fw-orange/10" : "border-white/10 hover:border-white/20"}`} onClick={() => setChallenge("weekly")}>
                      <div>
                        <div className="text-white font-bold">Weekly Challenge</div>
                        <div className="text-white/50 text-sm">?149.00 / week</div>
                      </div>
                      <input type="radio" name="challenge" value="weekly" checked={challenge === "weekly"} onChange={() => setChallenge("weekly")} className="accent-fw-orange w-5 h-5" />
                    </label>
                    <label className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${challenge === "monthly" ? "border-fw-orange bg-fw-orange/10" : "border-white/10 hover:border-white/20"}`} onClick={() => setChallenge("monthly")}>
                      <div>
                        <div className="text-white font-bold">Monthly Challenge</div>
                        <div className="text-white/50 text-sm">?399.00 / month</div>
                      </div>
                      <input type="radio" name="challenge" value="monthly" checked={challenge === "monthly"} onChange={() => setChallenge("monthly")} className="accent-fw-orange w-5 h-5" />
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Your Details */}
              <Card className="bg-white/5 border border-white/10 rounded-2xl">
                <CardContent className="p-6 space-y-5">
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">Your Details</h3>
                    <p className="text-white/50 text-sm">This will create your competition account.</p>
                  </div>
                  {[
                    { label: "Full Name", key: "name", type: "text", placeholder: "Rahul Sharma" },
                    { label: "Email", key: "email", type: "email", placeholder: "rahul@example.com" },
                    { label: "Mobile Number", key: "mobile", type: "tel", placeholder: "+91 98765 43210" },
                    { label: "Password", key: "password", type: "password", placeholder: "Create a strong password" },
                  ].map(({ label, key, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-white/80 font-medium text-sm mb-2">{label}</label>
                      <input
                        type={type}
                        placeholder={placeholder}
                        required
                        value={form[key as keyof typeof form]}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-fw-orange transition-colors text-sm"
                      />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Order Summary */}
              <Card className="bg-white/5 border border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold text-lg mb-3">Order Summary</h3>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">Product</span>
                    <span className="text-white/60">Amount</span>
                  </div>
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-white/80">FWC {challengeLabel}</span>
                    <span className="text-white font-bold">?{challengePrice}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold border-t border-white/10 pt-3">
                    <span className="text-white">Total</span>
                    <span className="text-fw-orange text-xl">?{challengePrice}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Waitlist Notice — shown always when championship is paused */}
              <div className="w-full rounded-2xl border border-fw-orange/50 bg-gradient-to-br from-fw-orange/15 via-fw-orange/5 to-transparent px-6 py-6 text-center shadow-lg shadow-fw-orange/10">
                <div className="text-3xl mb-3">??</div>
                <p className="text-fw-orange font-extrabold text-lg mb-1">
                  Thank you — FundedWealth Championship
                </p>
                <p className="text-white/80 text-sm leading-relaxed">
                  {form.email
                    ? <>You're on the waitlist! We'll notify you at <span className="text-white font-semibold">{form.email}</span> when registration opens.</>
                    : "You're on the waitlist! Fill in your details above and we'll notify you when registration opens."
                  }
                </p>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/60 text-xs font-semibold">
                  ?? Registration Currently Paused
                </div>
              </div>

              <button
                disabled
                className="w-full h-14 text-lg font-bold rounded-xl bg-white/10 border border-white/10 text-white/30 cursor-not-allowed select-none"
              >
                ?? Registration Paused — Coming Soon
              </button>

              <p className="text-center text-white/30 text-xs">
                By registering you agree to the FundedWealth competition rules and terms.
              </p>
            </div>
          )}

          {/* Step 2: Verify — Terms agreement */}
          {checkoutStep === 2 && (
            <div className="space-y-6">
              <Card className="bg-white/5 border border-white/10 rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Verify & Agree</h3>
                  <div className="space-y-4 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Challenge</span>
                        <span className="text-white font-bold">{challengeLabel}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Name</span>
                        <span className="text-white">{form.name}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Email</span>
                        <span className="text-white">{form.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-white/60">Amount</span>
                        <span className="text-fw-orange font-bold">?{challengePrice}</span>
                      </div>
                    </div>

                    <label className="flex items-start gap-3 cursor-pointer" onClick={() => setTermsAgreed(!termsAgreed)}>
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-all ${termsAgreed ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]" : "border border-white/20 bg-white/5"}`}>
                        {termsAgreed && <CheckCircle2 size={14} className="text-white" />}
                      </div>
                      <span className="text-white/70 text-sm leading-relaxed">
                        I have read and agreed to the <Link href="/rules" className="text-[#8E2DE2] hover:underline">Trading Rules</Link>, <Link href="/terms" className="text-[#8E2DE2] hover:underline">Terms & Conditions</Link>, and competition guidelines.
                      </span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCheckoutStep(1)} className="flex-1 h-12 border-white/20 text-white hover:bg-white/10 rounded-xl">
                      Back
                    </Button>
                    <Button
                      onClick={() => termsAgreed && setCheckoutStep(3)}
                      disabled={!termsAgreed}
                      className="flex-1 h-12 bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white border-0 font-bold disabled:opacity-40 rounded-xl"
                    >
                      Proceed to Pay
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Pay — UPI QR / Crypto */}
          {checkoutStep === 3 && (
            <div className="space-y-6">
              {/* Payment method selector */}
              {!payCategory && (
                <Card className="bg-white/5 border border-white/10 rounded-2xl">
                  <CardContent className="p-6">
                    <h3 className="text-white font-bold text-lg mb-4">Choose Payment Method</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => setPayCategory("upi")}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/10 hover:border-fw-orange/50 bg-white/5 hover:bg-fw-orange/5 transition-all text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                          <Smartphone size={22} className="text-green-400" />
                        </div>
                        <div>
                          <div className="text-white font-bold">UPI / QR Code</div>
                          <div className="text-white/50 text-sm">Google Pay, PhonePe, Paytm, any UPI app</div>
                        </div>
                      </button>
                      <button
                        onClick={() => handleOxaPayPayment()}
                        disabled={oxapayLoading}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-white/10 hover:border-[#8E2DE2]/50 bg-white/5 hover:bg-[#8E2DE2]/5 transition-all text-left"
                      >
                        <div className="w-12 h-12 rounded-xl bg-[#8E2DE2]/20 flex items-center justify-center">
                          <CreditCard size={22} className="text-[#8E2DE2]" />
                        </div>
                        <div>
                          <div className="text-white font-bold">{oxapayLoading ? "Redirecting..." : "Crypto (USDT/BTC/ETH)"}</div>
                          <div className="text-white/50 text-sm">Pay via OxaPay — USDT TRC20, BTC, ETH, LTC</div>
                        </div>
                      </button>
                      {oxapayError && <p className="text-red-400 text-sm">{oxapayError}</p>}

                      {/* -- Razorpay — Cards / Net Banking / Wallets -- */}
                      <button
                        onClick={() => handleRazorpayPayment()}
                        disabled={razorpayLoading}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-500/40 hover:border-blue-400/70 bg-blue-600/10 hover:bg-blue-600/15 transition-all text-left relative overflow-hidden"
                      >
                        {/* Recommended badge */}
                        <span className="absolute top-2 right-3 text-[10px] bg-blue-500 text-white font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Recommended
                        </span>
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                          <CreditCard size={22} className="text-blue-400" />
                        </div>
                        <div>
                          <div className="text-white font-extrabold text-base">
                            {razorpayLoading ? "Opening Razorpay…" : "?? Cards / Net Banking / UPI Wallets"}
                          </div>
                          <div className="text-white/55 text-sm mt-0.5">
                            <span className="font-bold text-blue-300">Powered by Razorpay</span> — Visa, Mastercard, RuPay, All Indian Banks
                          </div>
                        </div>
                      </button>
                      {razorpayError && <p className="text-red-400 text-sm mt-1">{razorpayError}</p>}
                    </div>
                    <button onClick={() => setCheckoutStep(2)} className="mt-4 text-white/40 hover:text-white text-sm underline">
                      Back to Verify
                    </button>
                  </CardContent>
                </Card>
              )}

              {/* UPI Payment */}
              {payCategory === "upi" && (
                <Card className="bg-white/5 border border-white/10 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white font-bold text-lg">Pay via UPI</h3>
                      <div className="text-fw-orange font-mono font-bold text-sm">
                        {fmtTimer(paySecondsLeft)}
                      </div>
                    </div>

                    <div className="text-center mb-6">
                      <div className="inline-block p-3 bg-white rounded-2xl mb-3">
                        <img src={qrSrc} alt="UPI QR Code" className="w-48 h-48" />
                      </div>
                      <p className="text-white/60 text-sm">Scan with any UPI app to pay <span className="text-fw-orange font-bold">?{challengePrice}</span></p>
                    </div>

                    {/* UPI ID */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                      <div className="text-white/50 text-xs mb-1">UPI ID</div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-mono text-sm">{FW_UPI_ID}</span>
                        <button onClick={() => copyToField("upi", FW_UPI_ID)} className="text-fw-orange hover:text-fw-orange/80 text-xs flex items-center gap-1">
                          <Copy size={12} /> {copiedField === "upi" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                      <div className="text-white/40 text-xs mt-1">Account: {FW_MERCHANT_NAME}</div>
                    </div>

                    {/* Amount */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 mb-4">
                      <div className="text-white/50 text-xs mb-1">Amount to Pay</div>
                      <div className="flex items-center justify-between">
                        <span className="text-white font-bold text-lg">?{challengePrice}</span>
                        <button onClick={() => copyToField("amount", String(challengePrice))} className="text-fw-orange hover:text-fw-orange/80 text-xs flex items-center gap-1">
                          <Copy size={12} /> {copiedField === "amount" ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {/* Open UPI app button — works on mobile only */}
                    <a href={upiPayUrl} className="block mb-4">
                      <Button className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl">
                        Open UPI App to Pay
                      </Button>
                    </a>
                    <p className="text-white/40 text-xs text-center mb-6">On desktop? Scan the QR code above with your phone's UPI app.</p>

                    {/* UTR Verification */}
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="text-white font-bold text-sm mb-3">After Payment — Enter UTR/Reference Number</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter 10-12 digit UTR number"
                          value={utrInput}
                          onChange={e => setUtrInput(e.target.value)}
                          className="flex-1 bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-fw-orange text-sm"
                        />
                        <Button
                          onClick={handleVerifyUtr}
                          disabled={utrStatus === "verifying"}
                          className="px-5 bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold rounded-xl"
                        >
                          {utrStatus === "verifying" ? "..." : "Verify"}
                        </Button>
                      </div>
                      {utrError && <p className="text-red-400 text-xs mt-2">{utrError}</p>}
                      {utrStatus === "success" && (
                        <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center">
                          <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 font-bold">Payment Verified! Welcome to FWC Championship!</p>
                          <p className="text-white/60 text-sm mt-1">Your competition account will be activated within 24 hours.</p>
                        </div>
                      )}
                      {utrStatus === "pending" && (
                        <div className="mt-4 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-center">
                          <p className="text-yellow-400 font-bold text-sm">Payment is being verified...</p>
                          <p className="text-white/60 text-xs mt-1">This may take 2-5 minutes. You'll receive confirmation via email.</p>
                        </div>
                      )}
                    </div>

                    <button onClick={() => setPayCategory(null)} className="mt-4 text-white/40 hover:text-white text-sm underline">
                      Choose different payment method
                    </button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer strip */}
      <div className="border-t border-white/10 py-6 text-center text-white/30 text-sm bg-[#0a0010]">
        © 2025 FundedWealth. All rights reserved. &nbsp;|&nbsp; <Link href="/" className="hover:text-white/60 transition-colors">Back to Home</Link>
      </div>
    </div>
  );
};

export default ChampionshipPage;
