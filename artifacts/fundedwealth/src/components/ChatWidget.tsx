import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@/contexts/SupabaseAuthContext";
import { useLocation } from "wouter";
import { Brain } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Message {
  role: "user" | "assistant";
  content: string;
  attachment?: { name: string; preview?: string };
}

interface Attachment {
  name: string;
  mimeType: string;
  base64: string;
  preview?: string;
}

const QUICK_ACTIONS = [
  "What happens if I breach daily DD?",
  "When can I request payout?",
  "Explain consistency rule.",
  "Why was payout rejected?",
  "How do I complete KYC?",
  "Tell me about the referral program.",
  "I need to talk to a real person",
];

const EMAIL_KEY = "fw_chat_email";

const AssistantAvatar = ({ size = "sm" }: { size?: "sm" | "md" | "lg" }) => {
  const dims = size === "lg" ? "w-16 h-16" : size === "md" ? "w-12 h-12" : "w-10 h-10";
  const iconSize = size === "lg" ? 28 : size === "md" ? 22 : 18;
  return (
    <div className={`${dims} rounded-full shrink-0 ring-2 ring-fw-purple/50 shadow-[0_0_15px_rgba(74,0,224,0.35)] bg-gradient-to-br from-[#4A00E0] to-[#D63384] flex items-center justify-center`}>
      <div className="w-3/4 h-3/4 rounded-full bg-white/10 flex items-center justify-center">
        <Brain className="text-white" size={iconSize} />
      </div>
    </div>
  );
};

const TypingDots = () => (
  <div className="flex gap-1 items-center py-1">
    {[0, 1, 2].map((i) => (
      <div key={i} className="w-2 h-2 rounded-full bg-fw-orange animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

function getFemaleIndianVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const femaleNames = ["raveena", "heera", "priya", "neerja", "sunita", "aditi", "female", "zira", "samantha", "victoria", "karen", "moira", "tessa", "fiona", "allison", "ava", "susan"];

  const isFemale = (v: SpeechSynthesisVoice) =>
    femaleNames.some((n) => v.name.toLowerCase().includes(n));

  return (
    voices.find((v) => v.lang === "en-IN" && isFemale(v)) ||
    voices.find((v) => v.lang.startsWith("en-IN")) ||
    voices.find((v) => v.lang.startsWith("hi") && isFemale(v)) ||
    voices.find((v) => isFemale(v) && v.lang.startsWith("en")) ||
    voices.find((v) => isFemale(v)) ||
    null
  );
}

export default function ChatWidget() {
  const { isLoaded } = useAuth();
  const { user } = useUser();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem(EMAIL_KEY) || "";
    } catch {
      return "";
    }
  });
  const [emailInput, setEmailInput] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const voicesLoadedRef = useRef(false);

  const storageKey = user?.id ? `fw_ai_chat_history_${user.id}` : "fw_ai_chat_history_guest";

  useEffect(() => {
    const load = () => { voicesLoadedRef.current = true; };
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  // Listen for programmatic open requests (e.g. from dashboard Live Chat button)
  useEffect(() => {
    const handleOpen = () => setOpen(true);
    window.addEventListener("open-chat-widget", handleOpen);
    return () => window.removeEventListener("open-chat-widget", handleOpen);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setMessages(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch {
      // ignore write errors
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (isLoaded && user?.primaryEmailAddress?.emailAddress) {
      setEmail(user.primaryEmailAddress.emailAddress);
    }
  }, [isLoaded, user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      if (!email) {
        setShowEmailStep(true);
      } else {
        setShowEmailStep(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    }
  }, [open, email]);

  const [showSupportForm, setShowSupportForm] = useState(false);
  const [supportQuery, setSupportQuery] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportSubmitted, setSupportSubmitted] = useState(false);
  const [supportSubmitting, setSupportSubmitting] = useState(false);

  const HUMAN_KEYWORDS = ["real person", "real human", "human agent", "live chat", "live support", "talk to someone", "speak to someone", "human support", "customer support", "connect me", "real agent"];

  const accountSummary = null;

  const openDashboardSection = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const isHumanRequest = (text: string) => {
    const lower = text.toLowerCase();
    return HUMAN_KEYWORDS.some(kw => lower.includes(kw));
  };

  const submitSupportRequest = async () => {
    if (!supportQuery.trim() || !supportEmail.trim()) return;
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail.trim());
    if (!emailValid) {
      setMessages(prev => [...prev, { role: "assistant", content: "Please enter a valid email address so our team can reach you." }]);
      return;
    }
    setSupportSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: email !== "guest" ? email.split("@")[0] : "Chat User",
          email: supportEmail,
          subject: "Live Support Request",
          message: supportQuery,
        }),
      });
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      setSupportSubmitted(true);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Your query has been submitted successfully! Our support team will reach out to you at **" + supportEmail + "** within 2-4 hours during business hours (Mon-Sat, 10 AM - 7 PM IST). In the meantime, feel free to ask me anything else! 🙏",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Sorry, there was an issue submitting your query. Please try again or email us directly at **support@fundedwealth.com** 🙏",
      }]);
    }
    setSupportSubmitting(false);
    setShowSupportForm(false);
    setSupportQuery("");
    setSupportEmail("");
    setSupportSubmitted(false);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) { setEmailError("Please enter a valid email address."); return; }
    localStorage.setItem(EMAIL_KEY, trimmed);
    setEmail(trimmed);
    setShowEmailStep(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const speakText = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*#`~_>\-•]/g, "").replace(/\n+/g, " ").slice(0, 400);
    const utter = new SpeechSynthesisUtterance(clean);
    const voice = getFemaleIndianVoice();
    if (voice) utter.voice = voice;
    utter.lang = voice?.lang ?? "en-IN";
    utter.rate = 0.95;
    utter.pitch = 1.15;
    utter.volume = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      alert("Please attach an image (JPG, PNG, GIF, WebP) or PDF file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      const preview = file.type.startsWith("image/") ? result : undefined;
      setAttachment({ name: file.name, mimeType: file.type, base64, preview });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // FundedWealth Knowledge Base — answers common questions when backend is unavailable
  const getLocalAnswer = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes("what is fundedwealth") || q.includes("about fundedwealth") || q.includes("what is fw"))
      return "**FundedWealth** is a simulated trading evaluation platform. We provide simulated evaluation accounts up to ₹50 Lakhs. You trade a simulated balance, and eligible participants may qualify for plan-specific performance-based rewards under applicable terms, verification, and provider timelines. No customer-owned live capital is provided.\n\n• Indian markets: NIFTY, BANKNIFTY, SENSEX, F&O, Equities\n• Plan-specific reward terms\n• Available payment methods and timing vary by program and provider\n• Evaluation participants across India";

    if (q.includes("challenge rule") || q.includes("trading rule") || q.includes("evaluation rule"))
      return "**FundedWealth Challenge Rules:**\n\n• **Profit Target:** 8-10% (depends on plan)\n• **Max Daily Loss:** 3-4% of starting balance\n• **Max Overall Drawdown:** 6-8% of starting balance\n• **Minimum Trading Days:** 3-5 days\n• **Leverage:** 1:100\n• **No gambling-style trading or Martingale**\n• **No copy trading or signal automation**\n\nOnce you hit the profit target while respecting all rules, you pass and get funded!";

    if (q.includes("payout") || q.includes("withdrawal") || q.includes("how do i get paid"))
      return "**Reward Process:**\n\n1. Complete the selected evaluation and receive eligible simulated-account access\n2. Trade within the applicable simulated program rules\n3. Request a reward when the program conditions are met\n4. Requests are subject to verification and provider processing timelines\n5. Available methods may include UPI or Bank Transfer (IMPS/NEFT)\n\n**Reward Share:** Plan-specific and subject to eligibility\n**Minimum Reward:** See the selected program terms";

    if (q.includes("profit target") || q.includes("target"))
      return "**Profit Targets by Plan:**\n\n• **Flash:** No profit target (24-hour challenge)\n• **Instant:** No profit target (instant funding)\n• **1-Step:** 10% profit target\n• **2-Step:** 8% (Phase 1) + 5% (Phase 2)\n\nOnce you reach the target while respecting drawdown limits and minimum trading days, you automatically pass!";

    if (q.includes("drawdown") || q.includes("daily loss") || q.includes("max loss") || q.includes("breach"))
      return "**Drawdown Rules:**\n\n• **Daily Drawdown:** 3% of starting balance (resets each day)\n• **Max Overall Drawdown:** 6% of starting balance\n\nIf you breach either limit, your account is locked. The system monitors this in real-time and will warn you at 80% of the limit.\n\n**Tip:** Use stop-losses on every trade and never risk more than 1-2% per trade.";

    if (q.includes("pricing") || q.includes("cost") || q.includes("fee") || q.includes("how much"))
      return "**FundedWealth Plans & Pricing:**\n\n• **Flash (24hr):** ₹799 - ₹7,799\n• **Instant Funding:** ₹2,749 - ₹9,899\n• **1-Step Evaluation:** ₹1,049 - ₹16,974\n• **2-Step Evaluation:** ₹3,599 - ₹14,549\n\n**Account Sizes:** ₹50K to ₹25 Lakhs\n**Discount Codes:** Flash (60% off), Instant (55% off), FW (65% off)\n\nAll plans include the FundedWealth IND Terminal with real NSE/BSE data.";

    if (q.includes("kyc") || q.includes("verification") || q.includes("identity"))
      return "**KYC Process:**\n\n1. Go to Dashboard → KYC section\n2. Upload: Aadhaar/PAN card + Selfie\n3. Fill personal details\n4. Submit for review\n\n**Processing Time:** 24-48 hours\n**Required for:** Payouts above ₹10,000\n\nKYC is mandatory before your first payout can be processed.";

    if (q.includes("contact") || q.includes("support") || q.includes("email") || q.includes("help"))
      return "**Contact FundedWealth:**\n\n• **Email:** support@fundedwealth.com\n• **WhatsApp:** https://whatsapp.com/channel/0029Vb7PZoPFHWpz05pv7Q0A\n• **Telegram:** https://t.me/fundedwealthind\n• **Instagram:** @fundedwealthind\n• **YouTube:** @FundedWealth\n\n**Support Hours:** Mon-Sat, 10 AM - 7 PM IST\n**Response Time:** Within 2-4 hours";

    if (q.includes("dashboard") || q.includes("how to use"))
      return "**Dashboard Guide:**\n\n• **Accounts:** View all your trading accounts and their status\n• **Trade Terminal:** Access at /trade — full charting + order placement\n• **Payouts:** Request and track your payouts\n• **Analytics:** View win rate, P&L, equity curve\n• **KYC:** Complete identity verification\n• **Journal:** Log and review your trades\n\nAfter login, you'll see your account cards with balance, P&L, and challenge progress.";

    if (q.includes("terminal") || q.includes("trading platform") || q.includes("how to trade"))
      return "**FundedWealth Trading Terminal:**\n\n• **Instruments:** Indian indices, stocks, and commodities (NSE/BSE/MCX)\n• **TradingView charts** with all indicators\n• **Order types:** Market, Limit, Stop with SL/TP\n• **One-click trading** for fast execution\n• **Keyboard shortcuts:** B (Buy), S (Sell), Esc (Close), Ctrl+K (Search)\n• **Real-time metrics:** Balance, equity, drawdown, profit target progress\n• **AI Risk Score** with behavioral insights\n\nAccess at: /trade after login";

    if (q.includes("funded") || q.includes("pass") || q.includes("how to get funded"))
      return "**How to Get a Simulated Funded Account:**\n\n1. **Purchase a challenge** (₹799+)\n2. **Trade and hit profit target** (8-10%)\n3. **Respect drawdown limits** (3% daily, 6% overall)\n4. **Complete minimum trading days** (3-5 days)\n5. **Simulated account status changes to FUNDED**\n6. **Become eligible for up to 90% performance-based rewards under the applicable program terms.**\n\nThe entire process can be completed in as little as 3 days with disciplined trading. All trading is simulated.";

    if (q.includes("championship") || q.includes("competition") || q.includes("contest"))
      return "**FW Championship:**\n\n• **Weekly Entry:** ₹149/week\n• **Monthly Entry:** ₹399/month\n• **1st Place:** ₹10 Lakh account + MacBook + ₹30K cash\n• **2nd Place:** ₹5 Lakh account + ₹20K cash\n• **3rd Place:** ₹2 Lakh account + ₹9K cash\n• **Weekly Giveaways:** iPhone 16, Smart Watch\n\nCompete with thousands of traders. Pure skill wins!";

    // Default fallback
    return "I'm your FundedWealth AI assistant! I can help with:\n\n• Challenge rules & pricing\n• Payout process\n• Drawdown & risk rules\n• KYC verification\n• Trading terminal usage\n• Account management\n• Contact information\n\nWhat would you like to know? If you need personalized help, email **support@fundedwealth.com** and our team will assist you within 2-4 hours.";
  };

  const sendMessage = useCallback(async (text: string, att?: Attachment | null) => {
    const hasText = text.trim().length > 0;
    const hasFile = !!att;
    if (!hasText && !hasFile) return;
    if (loading) return;

    if (hasText && isHumanRequest(text.trim())) {
      setMessages(prev => [...prev,
      { role: "user", content: text.trim() },
      { role: "assistant", content: "I understand you'd like to speak with a real person! 😊 Our AI handles most queries instantly, but for complex issues, our live support team is here for you.\n\nPlease share your **email** and **query** below, and our team will get back to you within **2-4 hours** during business hours (Mon-Sat, 10 AM - 7 PM IST)." },
      ]);
      setInput("");
      setSupportEmail(email !== "guest" ? email : "");
      setShowSupportForm(true);
      return;
    }

    const displayText = hasText ? text.trim() : `[Attached: ${att!.name}]`;
    const userMsg: Message = {
      role: "user",
      content: displayText,
      attachment: att ? { name: att.name, preview: att.preview } : undefined,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setAttachment(null);
    setLoading(true);

    const history = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      content: m.content,
    }));

    let assistantText = "";
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const body: Record<string, unknown> = {
        messages: history,
        message: hasText ? text.trim() : "Please analyze this file and tell me what you see.",
        userEmail: email,
        userId: user?.id ?? null,
      };
      if (att) {
        body.imageData = att.base64;
        body.imageMimeType = att.mimeType;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok || !res.body) throw new Error("Failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const payload = JSON.parse(line.slice(6));
            if (payload.done) break;
            if (payload.content) {
              assistantText += payload.content;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: assistantText };
                return updated;
              });
            }
          } catch { }
        }
      }
      speakText(assistantText);
    } catch {
      // Fallback: use local knowledge base when backend is unavailable
      const localAnswer = getLocalAnswer(hasText ? text.trim() : "");
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: localAnswer };
        return updated;
      });
      speakText(localAnswer);
    } finally {
      setLoading(false);
    }
  }, [loading, messages, speakText, email]);

  const startListening = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Your browser doesn't support voice input."); return; }
    const rec = new SR();
    rec.lang = "en-IN";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript, attachment), 300);
    };
    rec.onerror = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
  };

  const renderMessage = (content: string) => {
    const lines = content.split("\n").filter(Boolean);
    return lines.map((line, i) => {
      if (line.startsWith("**") && line.endsWith("**"))
        return <p key={i} className="font-bold text-white mt-1">{line.slice(2, -2)}</p>;
      if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* "))
        return <p key={i} className="pl-3 text-white/85">• {line.slice(2)}</p>;
      return <p key={i} className="text-white/90">{line}</p>;
    });
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full overflow-hidden shadow-[0_0_28px_rgba(74,0,224,0.65)] transition-transform hover:scale-110 active:scale-95 ring-2 ring-fw-purple/60"
        aria-label="Open AI Assistant"
      >
        {open ? (
          <div className="w-full h-full bg-gradient-fw flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-fw flex items-center justify-center">
            <Brain className="text-white" size={26} />
          </div>
        )}
      </button>

      {!open && (
        <div className="fixed bottom-[5.5rem] right-5 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="bg-gradient-to-r from-fw-purple to-fw-pink text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            👋 Hi! How can we help?
          </div>
          <div className="absolute -bottom-1.5 right-5 w-3 h-3 bg-fw-pink rotate-45 rounded-sm" />
        </div>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-28 right-6 z-50 w-[375px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-fw-purple/40"
          style={{ background: "linear-gradient(160deg,#160028 0%,#0f0020 100%)", maxHeight: "calc(100vh - 140px)" }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-white/5 shrink-0">
            <AssistantAvatar size="md" />
            <div className="flex-1 min-w-0">
              <div className="text-white font-bold text-sm">FundedWealth AI</div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-white/50 text-xs">{speaking ? "Speaking…" : "Online · Ask me anything"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {email && (
                <span className="text-white/30 text-xs truncate max-w-[100px]" title={email}>{email}</span>
              )}
              {speaking && (
                <button onClick={stopSpeaking} className="text-white/40 hover:text-white transition-colors p-1 ml-1" title="Stop speaking">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Email collection step */}
          {showEmailStep ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 space-y-5">
              <AssistantAvatar size="lg" />
              <div className="text-center space-y-1">
                <p className="text-white font-bold text-base">Hi! I'm your FundedWealth AI</p>
                <p className="text-white/60 text-sm">Please share your email to get started — so we can follow up if needed.</p>
              </div>
              <form onSubmit={handleEmailSubmit} className="w-full space-y-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  <Input
                    type="email"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setEmailError(""); }}
                    placeholder="your@gmail.com"
                    className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-fw-purple pl-9 rounded-xl text-sm h-11"
                    autoFocus
                  />
                </div>
                {emailError && <p className="text-red-400 text-xs">{emailError}</p>}
                <button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-fw text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-[0_0_12px_rgba(74,0,224,0.3)]"
                >
                  Start Chatting →
                </button>
                <button
                  type="button"
                  onClick={() => { setEmail("guest"); setShowEmailStep(false); }}
                  className="w-full text-white/35 text-xs hover:text-white/60 transition-colors"
                >
                  Skip for now
                </button>
              </form>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
                {messages.length === 0 && (
                  <div className="space-y-4">
                    <div className="text-center pt-2">
                      <div className="mx-auto mb-3">
                        <AssistantAvatar size="lg" />
                      </div>
                      <p className="text-white font-bold text-base">Hi{email && email !== "guest" ? `, ${email.split("@")[0]}` : ""}! 👋</p>
                      <p className="text-white/60 text-sm mt-1">Ask me anything — or attach a screenshot for help!</p>
                      {accountSummary && (
                        <p className="text-white/60 text-xs mt-3 border border-white/10 rounded-2xl bg-white/5 px-3 py-2">{accountSummary}</p>
                      )}
                      <div className="flex flex-wrap gap-2 justify-center mt-3">
                        <button onClick={() => openDashboardSection("/payouts")}
                          className="text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-2 text-xs font-semibold">
                          Open Payouts
                        </button>
                        <button onClick={() => openDashboardSection("/dashboard")}
                          className="text-white/80 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-2 text-xs font-semibold">
                          Open Dashboard
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {QUICK_ACTIONS.map((q) => (
                        <button
                          key={q}
                          onClick={() => sendMessage(q, null)}
                          className="w-full text-left px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 hover:border-fw-purple/40 transition-all flex items-center justify-between group"
                        >
                          <span>{q}</span>
                          <svg className="text-white/30 group-hover:text-fw-orange transition-colors shrink-0 ml-2" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}>
                    {msg.role === "assistant" && <AssistantAvatar size="sm" />}
                    <div className={`max-w-[78%] rounded-2xl text-sm leading-relaxed overflow-hidden ${msg.role === "user"
                      ? "bg-gradient-fw text-white rounded-br-sm"
                      : "bg-white/8 border border-white/10 text-white/90 rounded-bl-sm"
                      }`}>
                      {msg.attachment?.preview && (
                        <div className="px-2 pt-2">
                          <img src={msg.attachment.preview} alt={msg.attachment.name} className="rounded-lg max-h-40 w-full object-cover" />
                        </div>
                      )}
                      {msg.attachment && !msg.attachment.preview && (
                        <div className="flex items-center gap-2 px-3 pt-2">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-white/70">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                          </svg>
                          <span className="text-white/70 text-xs truncate max-w-[120px]">{msg.attachment.name}</span>
                        </div>
                      )}
                      <div className="px-3 py-2.5 space-y-0.5">
                        {msg.role === "assistant" ? renderMessage(msg.content) : <p>{msg.content}</p>}
                      </div>
                    </div>
                  </div>
                ))}

                {loading && (
                  <div className="flex items-end gap-2">
                    <AssistantAvatar size="sm" />
                    <div className="bg-white/8 border border-white/10 px-3 py-2 rounded-2xl rounded-bl-sm">
                      <TypingDots />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Human support form */}
              {showSupportForm && (
                <div className="px-3 pt-2 shrink-0">
                  <div className="bg-gradient-to-b from-[#4A00E0]/20 to-[#D63384]/10 border border-[#8E2DE2]/30 rounded-xl p-4 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                      </div>
                      <span className="text-white font-bold text-xs">Connect with Live Support</span>
                    </div>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={e => setSupportEmail(e.target.value)}
                      placeholder="Your email address"
                      className="w-full bg-white/8 border border-white/15 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E2DE2]"
                    />
                    <textarea
                      value={supportQuery}
                      onChange={e => setSupportQuery(e.target.value)}
                      placeholder="Describe your issue or question..."
                      rows={3}
                      className="w-full bg-white/8 border border-white/15 text-white placeholder:text-white/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#8E2DE2] resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={submitSupportRequest}
                        disabled={supportSubmitting || !supportQuery.trim() || !supportEmail.trim()}
                        className="flex-1 bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold text-xs py-2.5 rounded-lg hover:opacity-90 disabled:opacity-40 transition-opacity"
                      >
                        {supportSubmitting ? "Submitting..." : "Submit Query"}
                      </button>
                      <button
                        onClick={() => setShowSupportForm(false)}
                        className="px-3 py-2.5 bg-white/5 border border-white/10 text-white/50 text-xs rounded-lg hover:bg-white/10"
                      >
                        Cancel
                      </button>
                    </div>
                    <p className="text-white/30 text-[10px] text-center">Our team responds within 2-4 hours (Mon-Sat, 10 AM - 7 PM IST)</p>
                  </div>
                </div>
              )}

              {/* Attachment preview */}
              {attachment && (
                <div className="px-3 pt-2 shrink-0">
                  <div className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-xl px-3 py-2">
                    {attachment.preview ? (
                      <img src={attachment.preview} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" className="shrink-0">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    )}
                    <span className="text-white/70 text-xs truncate flex-1">{attachment.name}</span>
                    <button onClick={() => setAttachment(null)} className="text-white/40 hover:text-white/80 shrink-0 transition-colors">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Input area */}
              <div className="px-3 py-3 border-t border-white/10 bg-white/5 shrink-0">
                <div className="flex gap-1.5 items-center">
                  {/* Attach button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    title="Attach image or PDF"
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 bg-white/8 hover:bg-white/15 disabled:opacity-40"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <div className="relative flex-1">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage(input, attachment)}
                      placeholder={attachment ? "Add a message (optional)…" : "Ask anything about FundedWealth…"}
                      className="bg-white/8 border-white/15 text-white placeholder:text-white/30 focus:border-fw-purple rounded-xl text-sm h-9"
                      disabled={loading}
                    />
                  </div>

                  {/* Voice button */}
                  <button
                    onClick={listening ? stopListening : startListening}
                    disabled={loading}
                    title={listening ? "Stop listening" : "Voice input"}
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shrink-0 ${listening ? "bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse" : "bg-white/8 hover:bg-white/15"
                      }`}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="2" width="6" height="12" rx="3" />
                      <path d="M5 10a7 7 0 0 0 14 0" />
                      <line x1="12" y1="19" x2="12" y2="22" />
                      <line x1="9" y1="22" x2="15" y2="22" />
                    </svg>
                  </button>

                  {/* Send button */}
                  <button
                    onClick={() => sendMessage(input, attachment)}
                    disabled={loading || (!input.trim() && !attachment)}
                    className="w-9 h-9 rounded-xl bg-gradient-fw flex items-center justify-center transition-all shrink-0 hover:opacity-90 disabled:opacity-40 shadow-[0_0_10px_rgba(74,0,224,0.3)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                </div>
                <div className="text-center mt-2 text-white/25 text-xs">Powered by FundedWealth AI · Gemini Vision</div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
