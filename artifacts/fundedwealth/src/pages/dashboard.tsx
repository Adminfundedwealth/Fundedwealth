import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useUser, useAuth } from "@/contexts/SupabaseAuthContext";
import { useTradingData } from "@/contexts/TradingDataContext";
import { motion } from "framer-motion";
import { useNotifications, DashboardNotification, NotificationPreferences } from "@/hooks/useNotifications";
import {
  Home, Monitor, BarChart2, DollarSign, Trophy, TrendingUp,
  Users, Tag, Gift, Scale, BookOpen, Shield, Settings, LogOut,
  Plus, ChevronRight, Clock, CheckCircle,
  XCircle, Menu, X, Bell, Moon, Sun, Copy, ExternalLink,
  ArrowUpRight, ArrowDownRight, Wallet, AlertTriangle, Zap,
  Heart, Share2, Award, FileText, Upload, Camera, Globe,
  NotebookPen, MessageSquare, LifeBuoy, Activity, Send,
  TrendingDown, ArrowUp, ArrowDown, CreditCard, Building2, Smartphone, CheckCircle2,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend, ReferenceLine } from "recharts";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { buildTerminalLaunchRequestBody } from "@/lib/terminalLaunchPayload";

type Section =
  | "home" | "accounts" | "platform" | "payouts" | "leaderboard"
  | "analytics" | "affiliate" | "coupon" | "giveaway"
  | "comparison" | "rules" | "privacy" | "settings"
  | "impact" | "kyc" | "journal" | "feedback" | "support"
  | "withdrawal-details";

type JournalEntry = { id: number; date: string; title: string; note: string; tag: "win" | "loss" | "lesson" };

type TradingAccount = {
  id: string;
  phase: "flash" | "challenge" | "verification" | "funded";
  status: string;
  balance: number;
  startBalance: number;
  size: number;
  profitTarget: number;
  dailyLoss: number;
  maxLoss: number;
  profitSplit: number;
  winRate: number;
  tradeCount: number;
  startDate: string;
  accountCode: string;
  pnlPercent: number;
};

type Notification = DashboardNotification;
type KycStatus = { kycStatus: string; submission: any | null };

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

const pnlColor = (v: number) => v >= 0 ? "text-green-400" : "text-red-400";



function JournalSection({ storageKey, initial }: { storageKey: string; initial: JournalEntry[] }) {
  const [entries, setEntries] = useState<JournalEntry[]>(initial);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [tag, setTag] = useState<JournalEntry["tag"]>("lesson");
  const save = (next: JournalEntry[]) => { setEntries(next); try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { } };
  const add = () => {
    if (!title.trim() || !note.trim()) return;
    const e: JournalEntry = { id: Date.now(), date: new Date().toISOString(), title: title.trim(), note: note.trim(), tag };
    save([e, ...entries]); setTitle(""); setNote(""); setTag("lesson");
  };
  const remove = (id: number) => save(entries.filter(e => e.id !== id));
  const tagStyle = (t: JournalEntry["tag"]) =>
    t === "win" ? "bg-green-500/15 text-green-400 border-green-500/30"
      : t === "loss" ? "bg-red-500/15 text-red-400 border-red-500/30"
        : "bg-amber-500/15 text-amber-400 border-amber-500/30";
  const stats = {
    wins: entries.filter(e => e.tag === "win").length,
    losses: entries.filter(e => e.tag === "loss").length,
    lessons: entries.filter(e => e.tag === "lesson").length,
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white font-extrabold text-xl">Trading Journal</h2>
        <p className="text-white/55 text-sm mt-1">Log every setup, mistake and lesson. Saved locally to your browser, private to you.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { l: "Wins logged", v: stats.wins, c: "text-green-400" },
          { l: "Losses logged", v: stats.losses, c: "text-red-400" },
          { l: "Lessons", v: stats.lessons, c: "text-amber-400" },
        ].map(s => (
          <div key={s.l} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
            <div className={`font-extrabold text-2xl ${s.c}`}>{s.v}</div>
            <div className="text-white/45 text-[11px] mt-1 uppercase tracking-wider">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
        <div className="text-white font-bold text-sm flex items-center gap-2"><NotebookPen size={16} className="text-fw-pink" /> New entry</div>
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Setup name — e.g. BANKNIFTY breakout @ 9:25"
          className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60" />
        <textarea value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="What went right or wrong? What will you do next time?"
          className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60 resize-none" />
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {(["win", "loss", "lesson"] as const).map(t => (
              <button key={t} onClick={() => setTag(t)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border uppercase tracking-wider transition-all ${tag === t ? tagStyle(t) : "bg-white/5 border-white/10 text-white/45 hover:text-white/70"
                  }`}>{t}</button>
            ))}
          </div>
          <Button onClick={add} disabled={!title.trim() || !note.trim()}
            className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-9 px-5 disabled:opacity-40">
            <Plus size={14} className="mr-1" /> Save entry
          </Button>
        </div>
      </div>
      {entries.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
          <NotebookPen size={36} className="text-white/20 mx-auto mb-3" />
          <div className="text-white/55 text-sm">No entries yet — your first lesson is the most valuable one.</div>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map(e => (
            <div key={e.id} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${tagStyle(e.tag)}`}>{e.tag}</span>
                    <span className="text-white/35 text-[11px]">{new Date(e.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                  </div>
                  <div className="text-white font-bold text-base mb-1">{e.title}</div>
                  <p className="text-white/65 text-sm leading-relaxed whitespace-pre-wrap">{e.note}</p>
                </div>
                <button onClick={() => remove(e.id)} className="text-white/35 hover:text-red-400 transition-colors p-1"><X size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FundingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-4">
      <div>
        <div className="text-white/60 text-[12px]">{label}</div>
      </div>
      <div className="text-white font-bold">{value}</div>
    </div>
  );
}

function FeedbackForm({ displayName, displayEmail }: { displayName: string; displayEmail: string }) {
  const [type, setType] = useState<"feature" | "bug" | "praise" | "other">("feature");
  const [rating, setRating] = useState(5);
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const submit = async () => {
    if (!msg.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/contact`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName, email: displayEmail, phone: "",
          subject: `[Dashboard feedback · ${type} · ${rating}★]`,
          message: msg.trim(),
        }),
      });
      if (res.ok) { setDone(true); setMsg(""); }
    } catch { }
    setSubmitting(false);
  };
  if (done) {
    return (
      <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6 flex items-start gap-3">
        <CheckCircle size={22} className="text-green-400 mt-0.5 shrink-0" />
        <div>
          <div className="text-white font-bold">Thank you — feedback received.</div>
          <div className="text-white/65 text-sm mt-1">Our product team reads every message. If you asked for a reply, we'll get back within 12 hours.</div>
          <button onClick={() => setDone(false)} className="mt-3 text-fw-pink text-xs font-bold hover:underline">Send another</button>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
      <div>
        <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Type of feedback</div>
        <div className="flex gap-2 flex-wrap">
          {([
            { v: "feature", l: "Feature request" },
            { v: "bug", l: "Bug report" },
            { v: "praise", l: "Praise" },
            { v: "other", l: "Other" },
          ] as const).map(o => (
            <button key={o.v} onClick={() => setType(o.v)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${type === o.v
                ? "bg-gradient-to-r from-[#4A00E0]/30 to-[#D63384]/20 text-white border-fw-pink/40"
                : "bg-white/5 text-white/55 border-white/10 hover:text-white"
                }`}>{o.l}</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Overall rating</div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map(n => (
            <button key={n} onClick={() => setRating(n)} className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? "text-fw-orange" : "text-white/20"}`}>★</button>
          ))}
        </div>
      </div>
      <div>
        <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-2">Your message</div>
        <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5} placeholder="Be as specific as possible — screenshots, steps to reproduce, ideas..."
          className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#4A00E0]/60 resize-none" />
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="text-white/40 text-xs">From: <span className="text-white/65">{displayEmail || "your dashboard account"}</span></div>
        <Button onClick={submit} disabled={submitting || !msg.trim()}
          className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-10 px-6 disabled:opacity-40">
          <Send size={14} className="mr-2" /> {submitting ? "Sending..." : "Send feedback"}
        </Button>
      </div>
    </div>
  );
}

const RULES_LIST = [
  { title: "Minimum Trading Days", desc: "Complete at least 5 trading days in the challenge phase.", ok: true },
  { title: "Daily Loss Limit", desc: "Maximum 5% loss on any single trading day.", ok: true },
  { title: "Maximum Drawdown", desc: "Total account drawdown must not exceed 10%.", ok: true },
  { title: "Profit Target", desc: "Achieve 10% profit to pass the challenge phase.", ok: false },
  { title: "No Holding Over Weekend", desc: "Close all positions before market close on Friday.", ok: true },
  { title: "No News Trading", desc: "No trades within 2 minutes of major news events.", ok: true },
  { title: "Consistent Trading", desc: "Trades must be consistent — no single-day > 50% of total profit.", ok: false },
];

function AccountCard({ acc }: { acc: TradingAccount }) {
  const pnl = acc.balance - acc.startBalance;
  const pnlPct = (pnl / acc.startBalance) * 100;
  const progressPct = Math.min((pnlPct / (acc.profitTarget || 1)) * 100, 100);
  const phaseColor = {
    flash: "text-[#FF8A3D]",
    challenge: "text-amber-400",
    verification: "text-blue-400",
    funded: "text-green-400",
  }[acc.phase] ?? "text-amber-400";
  const phaseLabel = {
    flash: "Flash",
    challenge: "Challenge",
    verification: "Verification",
    funded: "Funded",
  }[acc.phase] ?? "Challenge";

  const [copied, setCopied] = useState<string | null>(null);
  const [showCreds, setShowCreds] = useState(false);
  const { getToken } = useAuth();
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");

  const copyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadCreds = () => {
    const termPass = (acc as any).terminalPassword || (acc as any).tempPassword
      ? ((acc as any).terminalPassword || (acc as any).tempPassword)
      : "Reset via 'Forgot Password' on fundedwealth.com/sign-in";
    const phaseDisplay = acc.phase === "flash" ? "Flash Funding"
      : acc.phase === "funded" ? "Funded"
      : acc.phase === "verification" ? "Verification"
      : "Phase 1";
    const lines = [
      `FundedWealth — Trading Account Credentials`,
      `==========================================`,
      `Account Code    : ${acc.accountCode}`,
      `Login Email     : ${(acc as any).loginEmail || "Check your registered email"}`,
      `Terminal Password: ${termPass}`,
      `Challenge       : ${phaseDisplay}`,
      `Account Size    : ₹${acc.size.toLocaleString("en-IN")}`,
      `Generated on    : ${new Date().toLocaleString("en-IN")}`,
    ].join("\n");
    const blob = new Blob([lines], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `FW_Credentials_${acc.accountCode}.txt`;
    a.click();
  };

  const handleLaunch = async () => {
    setLaunching(true);
    setLaunchError("");
    try {
      const token = await getToken();
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/terminal/launch`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        credentials: "include",
        body: JSON.stringify(buildTerminalLaunchRequestBody({ ...acc, accountId: acc.id })),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.launchUrl) {
        window.location.href = data.launchUrl;
      } else {
        setLaunchError(data.message || "Failed to generate terminal session. Please try again.");
        toast.error("Unable to launch terminal.");
      }
    } catch (err: any) {
      setLaunchError("Terminal is offline. Use your credentials below to log in manually.");
      setShowCreds(true);
      toast.error("Unable to launch terminal.");
    } finally {
      setLaunching(false);
    }
  };

  // Provisioning pending/failed states
  if (acc.status === "provisioning_pending") {
    return (
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
        <div className="text-white font-bold">Setting up your account…</div>
        <div className="text-white/50 text-sm">Your challenge account is being provisioned. This usually takes under a minute.</div>
        <div className="text-amber-400 text-xs font-mono">{acc.accountCode !== "Provisioning..." ? acc.accountCode : "Assigning code…"}</div>
      </div>
    );
  }

  if (acc.status === "provisioning_failed") {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-3">
        <XCircle size={32} className="text-red-400" />
        <div className="text-white font-bold">Provisioning Failed</div>
        <div className="text-white/50 text-sm">{(acc as any).provisioningError || "Something went wrong. Please contact support."}</div>
        <a href="mailto:support@fundedwealth.in" className="text-red-400 text-xs underline hover:text-red-300">Contact Support</a>
      </div>
    );
  }

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <div className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-1">Account Size</div>
          <div className="text-white text-2xl font-extrabold">{fmt(acc.size)}</div>
          <div className="text-white/40 text-xs mt-2 font-mono">Code: {acc.accountCode}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
            acc.phase === "funded"
              ? "bg-green-500/15 border-green-500/30 text-green-400"
              : acc.phase === "flash"
              ? "bg-[#FF8A3D]/15 border-[#FF8A3D]/40 text-[#FF8A3D]"
              : acc.phase === "challenge"
              ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
              : "bg-blue-500/15 border-blue-500/30 text-blue-400"
            }`}>{phaseLabel}</span>
          <span className={`text-xs font-semibold ${pnlColor(pnlPct)}`}>
            {pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mb-5 text-sm">
        <div><div className="text-white/45 text-xs mb-0.5">Current Balance</div><div className="text-white font-bold">{fmt(acc.balance)}</div></div>
        <div><div className="text-white/45 text-xs mb-0.5">P&L</div><div className={`font-bold ${pnlColor(pnl)}`}>{pnl >= 0 ? "+" : ""}{fmt(Math.abs(pnl))}</div></div>
        <div><div className="text-white/45 text-xs mb-0.5">Daily Loss Limit</div><div className="text-white font-bold">{acc.dailyLoss}%</div></div>
        <div><div className="text-white/45 text-xs mb-0.5">Max Drawdown</div><div className="text-white font-bold">{acc.maxLoss}%</div></div>
        <div><div className="text-white/45 text-xs mb-0.5">Profit Split</div><div className="text-[#FF8A3D] font-bold">{acc.profitSplit}%</div></div>
        <div><div className="text-white/45 text-xs mb-0.5">Win Rate</div><div className="text-green-400 font-bold">{acc.winRate}%</div></div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3 mb-4">
        {/* Profit Target — hidden for Flash (no profit target) */}
        {acc.phase !== "flash" ? (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-white/50">Profit Target</span>
              <span className={phaseColor}>{pnlPct.toFixed(1)}% / {acc.profitTarget}%</span>
            </div>
            <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${progressPct}%`, background: "linear-gradient(90deg, #FF8A3D, #D63384)" }} />
            </div>
          </div>
        ) : (
          <div className="flex justify-between text-xs">
            <span className="text-white/50">Profit Target</span>
            <span className="text-[#FF8A3D] font-bold">None (Flash Funding)</span>
          </div>
        )}
        {/* Trading days tracking will be added in future update - requires backend integration */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-white/50">Drawdown Used</span>
            <span className={pnl < 0 ? "text-red-400" : "text-green-400"}>{pnl < 0 ? ((Math.abs(pnl) / acc.startBalance) * 100).toFixed(1) : "0.0"}% / {acc.maxLoss}%</span>
          </div>
          <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pnl < 0 ? Math.min((Math.abs(pnl) / acc.startBalance / (acc.maxLoss / 100)) * 100, 100) : 0}%`, background: pnl < 0 ? "linear-gradient(90deg, #ef4444, #dc2626)" : "#22c55e" }} />
          </div>
        </div>
      </div>

      {/* ── Credentials panel ── */}
      <div className="border-t border-white/10 pt-4 mt-4 space-y-3">
        <button
          onClick={() => setShowCreds(v => !v)}
          className="w-full flex items-center justify-between text-xs font-semibold text-white/60 hover:text-white transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-[#8B5CF6]" />
            Account Credentials
          </span>
          <ChevronRight size={14} className={`transition-transform ${showCreds ? "rotate-90" : ""}`} />
        </button>

        {showCreds && (
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-3">
            {/* Login Email */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">Login Email</div>
                <div className="text-white text-xs font-mono truncate">{(acc as any).loginEmail || "—"}</div>
              </div>
              {(acc as any).loginEmail && (
                <button onClick={() => copyField("email", (acc as any).loginEmail)} className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg ${copied === "email" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                  <Copy size={11} className="inline mr-1" />{copied === "email" ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {/* Temp Password */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">Terminal Password</div>
                {(acc as any).terminalPassword || (acc as any).tempPassword ? (
                  <div className="text-white text-xs font-mono break-all">{(acc as any).terminalPassword || (acc as any).tempPassword}</div>
                ) : (
                  <div className="text-white/50 text-xs">
                    <a href="/sign-in" className="text-fw-pink hover:underline">Reset on login page</a>
                  </div>
                )}
              </div>
              {((acc as any).terminalPassword || (acc as any).tempPassword) && (
                <button onClick={() => copyField("password", (acc as any).terminalPassword || (acc as any).tempPassword)} className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg ${copied === "password" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                  <Copy size={11} className="inline mr-1" />{copied === "password" ? "Copied" : "Copy"}
                </button>
              )}
            </div>

            {/* Account Code */}
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="text-white/40 text-[10px] uppercase tracking-wider">Account Code</div>
                <div className="text-white text-xs font-mono">{acc.accountCode}</div>
              </div>
              <button onClick={() => copyField("code", acc.accountCode)} className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg ${copied === "code" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 text-white/60 hover:bg-white/20"}`}>
                <Copy size={11} className="inline mr-1" />{copied === "code" ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Challenge */}
            <div>
              <div className="text-white/40 text-[10px] uppercase tracking-wider">Challenge</div>
              <div className="text-white text-xs">{phaseLabel} — {acc.size > 0 ? `₹${acc.size.toLocaleString("en-IN")}` : "—"}</div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-1">
              {/* Launch Terminal */}
              <button
                onClick={handleLaunch}
                disabled={launching || !(acc as any).canLaunch}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold py-2 px-3 rounded-xl text-xs hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={(acc as any).canLaunch ? "Open trading terminal" : "Account must be active to launch"}
              >
                {launching ? (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Monitor size={13} />
                )}
                {launching ? "Launching…" : "Launch Terminal"}
              </button>

              {/* Copy all credentials */}
              <button
                onClick={() => {
                  const lines = [
                    `Account Code: ${acc.accountCode}`,
                    `Login Email: ${(acc as any).loginEmail || "—"}`,
                    ((acc as any).terminalPassword || (acc as any).tempPassword)
                      ? `Password: ${(acc as any).terminalPassword || (acc as any).tempPassword}`
                      : "Password: Reset at fundedwealth.com/sign-in",
                    `Challenge: ${phaseLabel}`,
                    `Size: ₹${acc.size.toLocaleString("en-IN")}`,
                  ];
                  const text = lines.join("\n");
                  navigator.clipboard.writeText(text).catch(() => {});
                  setCopied("all");
                  setTimeout(() => setCopied(null), 2000);
                }}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-all ${copied === "all" ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/15 text-white/60 hover:text-white hover:border-white/30"}`}
              >
                <Copy size={12} />{copied === "all" ? "Copied!" : "Copy All"}
              </button>

              {/* Download */}
              <button
                onClick={downloadCreds}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold bg-white/5 border border-white/15 text-white/60 hover:text-white hover:border-white/30 transition-all"
              >
                <Download size={12} />
              </button>
            </div>

            {launchError && <p className="text-red-400 text-xs text-center">{launchError}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-between text-xs text-white/40 mt-3">
        <span>Started {new Date(acc.startDate).toLocaleDateString("en-IN")}</span>
        <span>{acc.tradeCount > 0 ? `${acc.tradeCount} trades` : 'No trades yet'}</span>
      </div>
    </div>
  );
}

function LaunchTerminalCard({ acc }: { acc: TradingAccount }) {
  const { getToken } = useAuth();
  const [launching, setLaunching] = useState(false);
  const [error, setError] = useState("");

  const handleLaunch = async () => {
    setLaunching(true);
    setError("");
    try {
      console.log("[Launch] clicked");
      const token = await getToken();
      console.log("[Launch] token:", token ? "present" : "NULL — session missing");
      const apiBase = import.meta.env.VITE_API_URL || "";
      console.log("[Launch] before fetch:", `${apiBase}/api/terminal/launch`, "accountId:", acc.id);
      const res = await fetch(`${apiBase}/api/terminal/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify(buildTerminalLaunchRequestBody({ ...acc, accountId: acc.id })),
      });
      const data = await res.json().catch(() => ({}));
      console.log("[Launch] response:", res.status, data);
      if (res.ok && data.success && data.launchUrl) {
        window.location.href = data.launchUrl;
      } else {
        setError(data.message || "Failed to launch terminal. Please try again.");
        toast.error("Unable to launch terminal.");
      }
    } catch (err: any) {
      console.error("[Launch] exception:", err);
      setError("Could not reach the server. Please try again.");
      toast.error("Unable to launch terminal.");
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-white font-bold text-lg">{acc.accountCode}</div>
          <div className="text-white/50 text-xs mt-0.5">
            {acc.phase === "funded" ? "Funded Account" : acc.phase === "verification" ? "Verification Phase" : acc.phase === "flash" ? "Flash Funding" : "Challenge Phase"} · Balance: ₹{acc.balance.toLocaleString("en-IN")}
          </div>
        </div>
        <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border ${
          acc.phase === "funded" ? "bg-green-500/15 border-green-500/30 text-green-400"
            : acc.phase === "flash" ? "bg-[#FF8A3D]/15 border-[#FF8A3D]/40 text-[#FF8A3D]"
            : "bg-amber-500/15 border-amber-500/30 text-amber-400"
        }`}>
          {acc.phase === "funded" ? "Funded" : acc.phase === "verification" ? "Phase 2" : acc.phase === "flash" ? "Flash" : "Phase 1"}
        </span>
      </div>
      <button
        onClick={handleLaunch}
        disabled={launching}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold py-3 px-5 rounded-xl text-sm hover:shadow-lg hover:shadow-[#D63384]/30 transition-all disabled:opacity-60 disabled:cursor-wait"
      >
        {launching ? (
          <>
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Launching…
          </>
        ) : (
          <>
            <Monitor size={16} /> Launch Terminal <ExternalLink size={13} />
          </>
        )}
      </button>
      {error && (
        <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

function EmptyState({ onBuy }: { onBuy: () => void }) {
  return (
    <div className="col-span-full">
      <div className="bg-gradient-to-r from-[#4A00E0]/30 to-[#D63384]/20 border border-white/10 rounded-2xl p-8 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h3 className="text-white font-bold text-xl mb-2">No Active Accounts Yet</h3>
        <p className="text-white/60 mb-6 max-w-md mx-auto">Start your funded trading journey today. Choose a challenge size and prove your trading skills.</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onBuy} className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl px-6">
            <Plus size={16} className="mr-2" /> Buy First Challenge
          </Button>
          <a href="/checkout">
            <Button variant="outline" className="border-white/20 text-white bg-white/5 rounded-xl px-6">View Plans</Button>
          </a>
        </div>
      </div>
    </div>
  );
}

function WithdrawalDetailsSection() {
  const [tab, setTab] = useState<"upi" | "bank">("upi");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    upiId: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfscCode: "",
    bankName: "",
    preferredPayoutMethod: "UPI",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}api/users/payment-details`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          upiId: data.upiId || "",
          bankAccountName: data.bankAccountName || "",
          bankAccountNumber: data.bankAccountNumber || "",
          bankIfscCode: data.bankIfscCode || "",
          bankName: data.bankName || "",
          preferredPayoutMethod: data.preferredPayoutMethod || "UPI",
        });
        setTab(data.preferredPayoutMethod === "Bank Transfer" ? "bank" : "upi");
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setError("");
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/users/payment-details`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          preferredPayoutMethod: tab === "upi" ? "UPI" : "Bank Transfer",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save. Please try again.");
        return;
      }
      setForm({
        upiId: data.upiId || "",
        bankAccountName: data.bankAccountName || "",
        bankAccountNumber: data.bankAccountNumber || "",
        bankIfscCode: data.bankIfscCode || "",
        bankName: data.bankName || "",
        preferredPayoutMethod: data.preferredPayoutMethod || "UPI",
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/5 border border-white/15 text-white placeholder:text-white/30 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60";
  const labelClass = "text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-white font-extrabold text-xl mb-1">Withdrawal Details</h2>
        <p className="text-white/40 text-sm">Set your UPI ID or bank account details for payout processing.</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
        <Shield size={16} className="text-blue-400 mt-0.5 shrink-0" />
        <p className="text-blue-300 text-xs">
          Your payment details are encrypted and only used for processing approved payouts. KYC verification is required before your first withdrawal.
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-white/5 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("upi")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "upi" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
            }`}
        >
          <Smartphone size={15} /> UPI
        </button>
        <button
          onClick={() => setTab("bank")}
          className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === "bank" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
            }`}
        >
          <Building2 size={15} /> Bank Transfer
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-white/30 text-sm py-8">
          <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          Loading your details…
        </div>
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
          {tab === "upi" ? (
            <>
              <div>
                <label className={labelClass}>UPI ID</label>
                <div className="relative">
                  <Smartphone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    value={form.upiId}
                    onChange={(e) => setForm({ ...form, upiId: e.target.value })}
                    placeholder="yourname@upi"
                    className={`${inputClass} pl-9`}
                  />
                </div>
                <p className="text-white/30 text-xs mt-1.5">Examples: name@paytm, number@ybl, name@okaxis</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-white/70 text-xs font-semibold">Supported UPI Apps</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Google Pay", "PhonePe", "Paytm", "BHIM", "Amazon Pay", "WhatsApp Pay"].map((app) => (
                    <span key={app} className="text-xs bg-white/5 border border-white/10 text-white/50 rounded-lg px-2.5 py-1">
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelClass}>Account Holder Name</label>
                <input
                  value={form.bankAccountName}
                  onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                  placeholder="As per bank records"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Account Number</label>
                <input
                  value={form.bankAccountNumber}
                  onChange={(e) => setForm({ ...form, bankAccountNumber: e.target.value })}
                  placeholder="Enter account number"
                  type="password"
                  autoComplete="off"
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>IFSC Code</label>
                  <input
                    value={form.bankIfscCode}
                    onChange={(e) => setForm({ ...form, bankIfscCode: e.target.value.toUpperCase() })}
                    placeholder="HDFC0001234"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Bank Name</label>
                  <input
                    value={form.bankName}
                    onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                    placeholder="HDFC Bank"
                    className={inputClass}
                  />
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold rounded-xl px-6 py-2.5 text-sm disabled:opacity-60 transition-opacity"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <CreditCard size={14} /> Save Details
                </>
              )}
            </button>
            {saved && (
              <div className="flex items-center gap-1.5 text-green-400 text-sm">
                <CheckCircle2 size={15} />
                Saved successfully
              </div>
            )}
          </div>
        </div>
      )}

      {/* Processing time note */}
      <div className="flex items-start gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
        <Clock size={14} className="text-white/40 mt-0.5 shrink-0" />
        <div className="text-white/40 text-xs">
          <span className="text-white/60 font-semibold">Processing times:</span> UPI — instant to 4 hours. Bank Transfer — 1-2 business days. Payouts are processed Monday–Saturday, 10am–6pm IST.
        </div>
      </div>
    </div>
  );
}

function CouponSection({ profile, validCoupons }: { profile: any; validCoupons: Record<string, string> }) {
  const [couponInput, setCouponInput] = useState(profile.couponCode || "");
  const [couponStatus, setCouponStatus] = useState<"idle" | "valid" | "invalid">(profile.couponCode ? "valid" : "idle");

  const handleApply = () => {
    const code = couponInput.trim().toUpperCase();
    if (validCoupons[code]) {
      setCouponStatus("valid");
    } else {
      setCouponStatus("invalid");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-white font-extrabold text-xl">Coupon Codes</h2>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <div className="text-white/50 text-sm mb-4">Enter a coupon code to get a discount on your next challenge purchase.</div>
        <div className="flex gap-3">
          <input
            value={couponInput}
            onChange={(e) => { setCouponInput(e.target.value); setCouponStatus("idle"); }}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder="Enter coupon code"
            className="flex-1 bg-white/5 border border-white/15 text-white placeholder:text-white/35 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60"
          />
          <button
            onClick={handleApply}
            className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl px-5 text-sm font-semibold"
          >
            Apply
          </button>
        </div>
        {couponStatus === "valid" && validCoupons[couponInput.trim().toUpperCase()] && (
          <div className="mt-4 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <div className="text-white text-sm font-semibold">
                Code <span className="text-green-400">{couponInput.trim().toUpperCase()}</span> is active
              </div>
              <div className="text-white/50 text-xs">{validCoupons[couponInput.trim().toUpperCase()]}</div>
            </div>
          </div>
        )}
        {couponStatus === "invalid" && (
          <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <div className="text-red-400 text-sm">Invalid coupon code. Please check and try again.</div>
          </div>
        )}
        <div className="mt-5">
          <div className="text-white/40 text-xs mb-2 font-semibold uppercase tracking-wide">Available codes</div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(validCoupons).map(([code, desc]) => (
              <button
                key={code}
                onClick={() => { setCouponInput(code); setCouponStatus("idle"); }}
                className="text-xs bg-white/5 border border-white/10 hover:border-[#4A00E0]/40 text-white/60 hover:text-white rounded-lg px-3 py-1.5 transition-all"
              >
                {code} — {desc}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard({ initialSection }: { initialSection?: string }) {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { profile, loadDemoData, donate, isDemo } = useTradingData();
  const [, navigate] = useLocation();
  const [section, setSection] = useState<Section>((initialSection as Section) || "home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [analyticsRange, setAnalyticsRange] = useState<"1D" | "1W" | "1M" | "ALL">("ALL");
  const [donatePopup, setDonatePopup] = useState(false);
  const [donateCause, setDonateCause] = useState<"animal" | "education">("animal");
  const [donateAmt, setDonateAmt] = useState(50);
  const [customAmt, setCustomAmt] = useState("");
  const [notificationFilter, setNotificationFilter] = useState<"all" | "System" | "Payout" | "Trading" | "Challenges" | "Referral">("all");
  const { notifications, unreadCount, loading: notificationsLoading, realtimeStatus, preferences, markAsRead, markAllRead, deleteNotification, updatePreferences } = useNotifications(user?.id);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const [kycStatus, setKycStatus] = useState<KycStatus>({ kycStatus: "pending", submission: null });
  const [kycForm, setKycForm] = useState({ documentType: "aadhaar", documentNumber: "", fullName: "", dateOfBirth: "", address: "" });
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [kycMsg, setKycMsg] = useState("");
  const [darkMode, setDarkMode] = useState(true);

  // Leaderboard — fetched from real API
  type LeaderboardEntry = {
    rank: number;
    firstName: string | null;
    city: string | null;
    totalPayout: number;
    badge: string;
  };
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLeaderboardLoading(true);
    setLeaderboardError(false);
    fetch(`${import.meta.env.BASE_URL}api/users/leaderboard`, { credentials: "include" })
      .then(r => {
        if (!r.ok) throw new Error("Failed to load leaderboard");
        return r.json();
      })
      .then((rows: any[]) => {
        const BADGES = ["🏆", "🥈", "🥉"];
        setLeaderboardData(
          rows.map((row, i) => ({
            rank: i + 1,
            firstName: row.firstName || row.name || "Trader",
            city: row.city || null,
            totalPayout: row.totalPayout || 0,
            badge: BADGES[i] || "",
          }))
        );
      })
      .catch(() => setLeaderboardError(true))
      .finally(() => setLeaderboardLoading(false));
  }, [user]);

  // Analytics trades — terminal data removed, stubs kept to avoid UI crash
  type TradeLog = { symbol: string; pnl: number; createdAt: string };
  const analyticsTradesData: TradeLog[] = [];
  const analyticsTradesLoading = false;

  const [affiliateStats, setAffiliateStats] = useState({
    affiliateCode: profile.referralCode,
    referralCount: profile.referralCount,
    activeTraders: 0,
    totalEarned: 0,
    totalPending: 0,
    totalPaid: 0,
    totalClicks: 0,
    uniqueVisitors: 0,
    conversionRate: 0,
    leaderboardRank: null as number | null,
  });
  const [affiliateHistory, setAffiliateHistory] = useState<any[]>([]);
  const [affiliateClicks, setAffiliateClicks] = useState({ totalClicks: 0, uniqueVisitors: 0, recentClicks: [] as any[] });
  const [affiliateLeaderboard, setAffiliateLeaderboard] = useState<any[]>([]);
  const [affiliatePayoutHistory, setAffiliatePayoutHistory] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState<"all" | "pending" | "paid">("all");
  const [affiliateLink, setAffiliateLink] = useState<string>("");
  const [affiliateLoading, setAffiliateLoading] = useState(false);
  const [affiliateProcessing, setAffiliateProcessing] = useState(false);
  const [affiliateMessage, setAffiliateMessage] = useState("");

  const { t, i18n } = useTranslation();

  const displayName = user?.fullName || user?.firstName ||
    user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "Trader";
  const displayEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const avatarInitial = (displayName || "T").charAt(0).toUpperCase();

  const notificationSettingItems: Array<{ key: keyof NotificationPreferences; label: string }> = [
    { key: "emailAlerts", label: "Email alerts" },
    { key: "whatsappAlerts", label: "WhatsApp alerts" },
    { key: "inAppAlerts", label: "In-app alerts" },
    { key: "payoutAlerts", label: "Payout alerts" },
    { key: "tradeAlerts", label: "Trading alerts" },
    { key: "marketingAlerts", label: "Marketing emails" },
  ];

  useEffect(() => {
    if (!user) return;
    fetch(`${import.meta.env.BASE_URL}api/users/me`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        email: user.emailAddresses?.[0]?.emailAddress || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        avatarUrl: user.imageUrl || "",
      }),
    }).catch(() => { });
  }, [user]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    const destination = notification.actionUrl || notification.link;
    if (destination) {
      if (destination.startsWith("/")) {
        navigate(destination);
      } else {
        window.open(destination, "_blank");
      }
    }
  };

  useEffect(() => {
    if (!user) return;
    fetch(`${import.meta.env.BASE_URL}api/kyc/status`, { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        // Ensure kycStatus string is always defined
        setKycStatus({
          kycStatus: d?.kycStatus || "pending",
          submission: d?.submission || null,
        });
      })
      .catch(() => {
        // Backend offline — keep default "pending" state, don't crash
      });
  }, [user]);

  const referralUrl = affiliateLink || `https://fundedwealth.com/ref/${affiliateStats.affiliateCode || profile.referralCode || "FW0000"}`;
  const shareText = encodeURIComponent(`Join FundedWealth with my referral link and start trading smarter! ${referralUrl}`);
  const encodedReferralUrl = encodeURIComponent(referralUrl);

  const loadAffiliateStats = async () => {
    setAffiliateLoading(true);
    setAffiliateMessage("");

    try {
      const [linkRes, statsRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}api/affiliate/my-link`, { credentials: "include" }),
        fetch(`${import.meta.env.BASE_URL}api/affiliate/stats`, { credentials: "include" }),
      ]);

      if (linkRes.ok) {
        const data = await linkRes.json();
        setAffiliateLink(data.affiliateLink || referralUrl);
        setAffiliateStats(prev => ({ ...prev, affiliateCode: data.affiliateCode || prev.affiliateCode }));
      }

      if (statsRes.ok) {
        const stats = await statsRes.json();
        setAffiliateStats({
          affiliateCode: stats.affiliateCode || profile.referralCode,
          referralCount: stats.referralCount || 0,
          activeTraders: stats.activeTraders || 0,
          totalEarned: stats.totalEarned || 0,
          totalPending: stats.totalPending || 0,
          totalPaid: stats.totalPaid || 0,
          totalClicks: stats.totalClicks || 0,
          uniqueVisitors: stats.uniqueVisitors || 0,
          conversionRate: stats.conversionRate || 0,
          leaderboardRank: stats.leaderboardRank || null,
        });
        if (!affiliateLink && stats.affiliateLink) {
          setAffiliateLink(stats.affiliateLink);
        }
      }
    } catch (err) {
      setAffiliateMessage("Unable to load affiliate data. Please refresh.");
    } finally {
      setAffiliateLoading(false);
    }
  };

  const loadAffiliateHistory = async (status: "all" | "pending" | "paid" = historyFilter) => {
    try {
      const historyRes = await fetch(`${import.meta.env.BASE_URL}api/affiliate/history?status=${status}`, { credentials: "include" });
      if (!historyRes.ok) return;
      const data = await historyRes.json();
      setAffiliateHistory(data.history || []);
    } catch {
      // ignore failures for history data
    }
  };

  const loadAffiliateClicks = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/affiliate/clicks`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setAffiliateClicks({
        totalClicks: data.totalClicks || 0,
        uniqueVisitors: data.uniqueVisitors || 0,
        recentClicks: data.recentClicks || [],
      });
    } catch {
      // ignore click analytics failure
    }
  };

  const loadAffiliateLeaderboard = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/affiliate/leaderboard`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setAffiliateLeaderboard(data.leaderboard || []);
    } catch {
      // ignore leaderboard failure
    }
  };

  const loadAffiliatePayoutHistory = async () => {
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/affiliate/payout-history`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setAffiliatePayoutHistory(data.payouts || []);
    } catch {
      // ignore payout history failure
    }
  };

  useEffect(() => {
    if (!user) return;
    loadAffiliateStats();
    loadAffiliateHistory();
    loadAffiliateClicks();
    loadAffiliateLeaderboard();
    loadAffiliatePayoutHistory();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadAffiliateHistory(historyFilter);
  }, [historyFilter, user]);

  const handleClaimCommission = async () => {
    if (affiliateProcessing || affiliateStats.totalPending < 500) return;
    setAffiliateProcessing(true);
    setAffiliateMessage("");

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/affiliate/claim`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setAffiliateMessage(data.error || "Unable to submit withdrawal request.");
      } else {
        setAffiliateMessage(data.message || `Withdrawal requested for ₹${data.claimedAmount}.`);
        loadAffiliateStats();
        loadAffiliateHistory(historyFilter);
      }
    } catch {
      setAffiliateMessage("Network error. Please try again.");
    } finally {
      setAffiliateProcessing(false);
    }
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const submitKyc = async () => {
    if (!kycForm.documentNumber || !kycForm.fullName) { setKycMsg("Please fill in all required fields."); return; }
    setKycSubmitting(true);
    setKycMsg("");
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/kyc/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(kycForm),
      });
      if (res.ok) {
        setKycMsg("KYC submitted successfully! Our team will review within 24–48 hours.");
        setKycStatus({ kycStatus: "submitted", submission: kycForm });
      } else {
        const err = await res.json().catch(() => ({}));
        setKycMsg(err.error || "Submission failed. Please try again.");
      }
    } catch {
      // Backend offline — save locally and show success so user isn't blocked
      try {
        localStorage.setItem("fw_kyc_pending", JSON.stringify({ ...kycForm, submittedAt: new Date().toISOString() }));
      } catch { /* ignore */ }
      setKycMsg("KYC saved locally. It will sync automatically when the server is available.");
      setKycStatus({ kycStatus: "submitted", submission: kycForm });
    }
    setKycSubmitting(false);
  };

  const switchLang = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("fw-lang", lng);
  };

  const navMain = [
    { id: "home" as Section, icon: Home, label: "Home" },
    { id: "accounts" as Section, icon: BarChart2, label: "Accounts" },
    { id: "platform" as Section, icon: Monitor, label: "Trading Platform" },
    { id: "payouts" as Section, icon: DollarSign, label: "Payouts" },
    { id: "withdrawal-details" as Section, icon: CreditCard, label: "Withdrawal Details" },
  ];
  const navOther = [
    { id: "kyc" as Section, icon: FileText, label: "KYC Verification" },
    { id: "support" as Section, icon: LifeBuoy, label: "Help & Support" },
    { id: "settings" as Section, icon: Settings, label: "Settings" },
  ];

  const copyRef = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sidebarContent = (mobile = false) => (
    <aside className={`${mobile ? "w-full" : "w-64"} h-full flex flex-col bg-[#0A0018] border-r border-white/10`}>
      <div className="p-5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="FundedWealth" className="h-9 w-9 object-contain" />
          <div className="text-white font-bold text-lg leading-tight">
            Funded<span className="text-[#FF8A3D]">Wealth</span>
          </div>
        </div>
        {mobile && (
          <button onClick={() => setSidebarOpen(false)} className="text-white/60 hover:text-white">
            <X size={20} />
          </button>
        )}
      </div>
      <div className="p-3">
        <a href="/checkout">
          <button className="w-full flex items-center gap-2 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold py-3 px-4 rounded-xl text-sm hover:shadow-lg hover:shadow-[#4A00E0]/30 transition-all">
            <Plus size={16} /> New Challenge
          </button>
        </a>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="text-white/30 text-[11px] font-semibold uppercase tracking-widest px-3 py-2 mt-2">Main</div>
        {navMain.map(item => (
          <button key={item.id} onClick={() => { setSection(item.id); if (mobile) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${section === item.id
              ? "bg-gradient-to-r from-[#4A00E0]/30 to-[#D63384]/20 text-white border border-white/10"
              : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
            <item.icon size={17} />{item.label}
          </button>
        ))}
        <div className="text-white/30 text-[11px] font-semibold uppercase tracking-widest px-3 py-2 mt-4">Other</div>
        {navOther.map(item => (
          <button key={item.id} onClick={() => { setSection(item.id); if (mobile) setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${section === item.id
              ? "bg-gradient-to-r from-[#4A00E0]/30 to-[#D63384]/20 text-white border border-white/10"
              : "text-white/60 hover:text-white hover:bg-white/5"
              }`}>
            <item.icon size={17} />{item.label}
          </button>
        ))}
      </nav>
      <div className="p-3 border-t border-white/10">
        <button onClick={() => signOut().then(() => navigate("/"))}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors">
          <LogOut size={17} /> Logout
        </button>
      </div>
    </aside>
  );

  const renderContent = () => {
    switch (section) {

      case "home": return (
        <div className="space-y-6">
          <div className="relative bg-gradient-to-r from-[#4A00E0] via-[#7B30FF] to-[#D63384] rounded-2xl p-8 overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-white text-2xl font-extrabold mb-1">Welcome back, {displayName}! 👋</h2>
              {profile.accounts.length === 0 ? (
                <>
                  <p className="text-white/80 text-sm mb-5">Are You Ready To Buy Your First Challenge?<br />
                    <span className="text-white/60 text-xs">We recommend going through the FAQ section first before starting a challenge.</span>
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <a href="/checkout">
                      <Button className="bg-white text-[#4A00E0] font-bold hover:bg-white/90 rounded-xl h-10 px-5">
                        <Plus size={16} className="mr-2" /> New Challenge
                      </Button>
                    </a>
                    <button onClick={() => setSection("rules")}
                      className="bg-white/15 text-white border border-white/25 font-semibold rounded-xl h-10 px-5 text-sm hover:bg-white/25 transition-all">
                      Trading Rules
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-white/80 text-sm mb-5">You have {profile.accounts.length} active account{profile.accounts.length > 1 ? "s" : ""}. Keep it up!</p>
                  <div className="flex gap-3 flex-wrap">
                    <Button onClick={() => setSection("accounts")}
                      className="bg-white text-[#4A00E0] font-bold hover:bg-white/90 rounded-xl h-10 px-5">
                      View Accounts <ChevronRight size={16} className="ml-1" />
                    </Button>
                    <a href="/checkout">
                      <button className="bg-white/15 text-white border border-white/25 font-semibold rounded-xl h-10 px-5 text-sm hover:bg-white/25 transition-all">
                        <Plus size={14} className="inline mr-1" /> New Challenge
                      </button>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {profile.accounts.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total P&L", value: fmt(profile.accounts.reduce((s, a) => s + (a.balance - a.startBalance), 0)), icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
                { label: "Total Payouts", value: fmt(profile.totalPayout), icon: Wallet, color: "text-[#FF8A3D]", bg: "bg-[#FF8A3D]/10" },
                { label: "Active Accounts", value: String(profile.accounts.filter(a => a.status === "active").length), icon: BarChart2, color: "text-blue-400", bg: "bg-blue-500/10" },
                { label: "Avg Win Rate", value: `${Math.round(profile.accounts.reduce((s, a) => s + a.winRate, 0) / profile.accounts.length)}%`, icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/10" },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon size={18} className={s.color} />
                  </div>
                  <div>
                    <div className="text-white/50 text-xs mb-0.5">{s.label}</div>
                    <div className={`font-bold text-lg ${s.color}`}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Access */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <a href="/championship" className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Trophy size={18} className="text-amber-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-amber-300 transition-colors">Championship</div>
                <div className="text-white/40 text-[11px]">Win prizes</div>
              </div>
            </a>
            <a href="/rules" className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">Rules</div>
                <div className="text-white/40 text-[11px]">Trading rules</div>
              </div>
            </a>
            <a href="/faq" className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <LifeBuoy size={18} className="text-purple-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">FAQ</div>
                <div className="text-white/40 text-[11px]">Common questions</div>
              </div>
            </a>
            <button onClick={() => setSection("affiliate")} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group text-left">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Users size={18} className="text-green-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-green-300 transition-colors">Affiliate</div>
                <div className="text-white/40 text-[11px]">Earn commissions</div>
              </div>
            </button>
            <button onClick={() => setSection("payouts")} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group text-left">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
                <Award size={18} className="text-pink-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-pink-300 transition-colors">Certificates</div>
                <div className="text-white/40 text-[11px]">Download proof</div>
              </div>
            </button>
            <button onClick={() => setSection("impact")} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group text-left">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
                <Heart size={18} className="text-red-400" />
              </div>
              <div>
                <div className="text-white font-semibold text-sm group-hover:text-red-300 transition-colors">FW Impact</div>
                <div className="text-white/40 text-[11px]">Trade for change</div>
              </div>
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-white font-bold text-lg mb-1">Help Center</h3>
                <p className="text-white/55 text-sm">Get in touch with us through our socials or visit the Help Center on our website.</p>
                <a href="/#contact">
                  <Button className="mt-4 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-9 px-5 text-sm">
                    Help Center
                  </Button>
                </a>
              </div>
              <div>
                <div className="text-white/40 text-xs font-semibold mb-2 uppercase tracking-wider">Connect With Us</div>
                <div className="flex gap-2">
                  {[{ label: "TG", color: "bg-blue-500", href: "https://t.me/fundedwealth" }, { label: "IG", color: "bg-pink-500", href: "https://instagram.com/fundedwealth" }, { label: "WA", color: "bg-green-500", href: "https://wa.me/message/ZPLR472VQTXLL1" }, { label: "YT", color: "bg-red-500", href: "https://youtube.com/@fundedwealth" }].map(s => (
                    <a key={s.label} href={s.href} target="_blank" rel="noreferrer"
                      className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform`}>
                      {s.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      );

      case "accounts": return (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-extrabold text-xl">My Accounts</h2>
            <a href="/checkout">
              <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-9 px-4 text-sm">
                <Plus size={14} className="mr-1.5" /> New Challenge
              </Button>
            </a>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {profile.accounts.length === 0
              ? <EmptyState onBuy={() => window.location.href = "/checkout"} />
              : profile.accounts.map(acc => <AccountCard key={acc.id} acc={acc} />)
            }
          </div>
        </div>
      );

      case "platform": return (
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 text-white/40 text-sm mb-2">
              <span className="text-white/60">Dashboard</span>
              <ChevronRight size={14} />
              <span className="text-white">Platform</span>
            </div>
            <h2 className="text-white font-extrabold text-2xl">Trading Platform</h2>
            <p className="text-white/50 text-sm mt-1">Launch the FundedWealth Trading Terminal to start trading on your active accounts.</p>
          </div>

          {/* Active accounts with Launch Terminal */}
          {profile.accounts.length > 0 ? (
            <div className="space-y-4">
              {profile.accounts.filter(a => a.status === "active").map(acc => (
                <LaunchTerminalCard key={acc.id} acc={acc} />
              ))}
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <Monitor size={36} className="text-white/20 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">No Active Accounts</h3>
              <p className="text-white/50 text-sm mb-4">Purchase a challenge to get access to the trading terminal.</p>
              <a href="/checkout"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold py-3 px-6 rounded-xl text-sm hover:shadow-lg hover:shadow-[#D63384]/30 transition-all">
                <Plus size={14} /> Buy Challenge
              </a>
            </div>
          )}

          {/* Help */}
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => setSection("support")}
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-semibold py-3 px-5 rounded-xl text-sm hover:bg-white/10 transition-all">
              Need Help? Contact Support
            </button>
            <a href="/checkout"
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white font-semibold py-3 px-5 rounded-xl text-sm hover:bg-white/10 transition-all">
              View Challenge Plans <ExternalLink size={13} />
            </a>
          </div>
        </div>
      );

      case "payouts": {
        const downloadCertificate = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 1200;
          canvas.height = 800;
          const ctx = canvas.getContext("2d")!;

          const grd = ctx.createLinearGradient(0, 0, 1200, 800);
          grd.addColorStop(0, "#1A0030");
          grd.addColorStop(1, "#0D0020");
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, 1200, 800);

          ctx.strokeStyle = "rgba(74,0,224,0.4)";
          ctx.lineWidth = 4;
          ctx.strokeRect(30, 30, 1140, 740);
          ctx.strokeStyle = "rgba(214,51,132,0.3)";
          ctx.lineWidth = 2;
          ctx.strokeRect(45, 45, 1110, 710);

          ctx.textAlign = "center";
          ctx.fillStyle = "#FF8A3D";
          ctx.font = "bold 16px sans-serif";
          ctx.fillText("FUNDEDWEALTH", 600, 100);

          ctx.fillStyle = "#ffffff";
          ctx.font = "bold 42px serif";
          ctx.fillText("Funded Trader Certificate", 600, 170);

          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.font = "18px sans-serif";
          ctx.fillText("This certifies that", 600, 240);

          ctx.fillStyle = "#FF8A3D";
          ctx.font = "bold 36px serif";
          ctx.fillText(displayName, 600, 300);

          ctx.fillStyle = "rgba(255,255,255,0.6)";
          ctx.font = "18px sans-serif";
          ctx.fillText("has successfully completed the FundedWealth Trading Challenge", 600, 360);
          ctx.fillText("and is now a verified Funded Trader", 600, 395);

          ctx.fillStyle = "#22c55e";
          ctx.font = "bold 48px sans-serif";
          ctx.fillText(fmt(profile.totalPayout), 600, 480);
          ctx.fillStyle = "rgba(255,255,255,0.5)";
          ctx.font = "16px sans-serif";
          ctx.fillText("Total Payouts Earned", 600, 515);

          ctx.fillStyle = "rgba(255,255,255,0.4)";
          ctx.font = "14px sans-serif";
          ctx.fillText(`Accounts: ${profile.accounts.length} | Total Trades: ${profile.accounts.reduce((s, a) => s + a.tradeCount, 0)}`, 600, 570);

          ctx.fillStyle = "rgba(255,255,255,0.3)";
          ctx.font = "12px sans-serif";
          ctx.fillText(`Issued on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} | fundedwealth.com`, 600, 720);

          ctx.fillStyle = "rgba(74,0,224,0.15)";
          ctx.font = "bold 120px sans-serif";
          ctx.fillText("FW", 600, 660);

          const link = document.createElement("a");
          link.download = `FundedWealth_Certificate_${displayName.replace(/\s+/g, "_")}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        };

        return (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-white font-extrabold text-xl">Payouts</h2>
              <div className="flex items-center gap-3">
                {profile.accounts.some(a => a.phase === "funded") && (
                  <button onClick={downloadCertificate}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
                    <Award size={14} /> Download Certificate
                  </button>
                )}
                <div className="bg-[#FF8A3D]/15 border border-[#FF8A3D]/25 rounded-xl px-4 py-2">
                  <span className="text-[#FF8A3D] font-bold text-sm">Total: {fmt(profile.totalPayout)}</span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "Total Earned", value: fmt(profile.totalPayout), icon: DollarSign, color: "text-green-400" },
                { label: "Completed", value: String(profile.payouts.filter(p => p.status === "completed").length), icon: CheckCircle, color: "text-green-400" },
                { label: "Pending", value: String(profile.payouts.filter(p => p.status === "pending").length), icon: Clock, color: "text-amber-400" },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><s.icon size={18} className={s.color} /></div>
                  <div>
                    <div className="text-white/50 text-xs mb-0.5">{s.label}</div>
                    <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {profile.payouts.length === 0 ? (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-10 text-center">
                <DollarSign size={40} className="text-white/20 mx-auto mb-3" />
                <p className="text-white/50">No payouts yet. Get funded and start trading to request your first payout!</p>
              </div>
            ) : (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
                    <span>Date</span><span>Amount</span><span>Method</span><span>Account</span><span>Status</span>
                  </div>
                  {profile.payouts.map(p => (
                    <div key={p.id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/3 transition-colors items-center">
                      <span className="text-white/70 text-sm">{p.date}</span>
                      <span className="text-green-400 font-bold">{fmt(p.amount)}</span>
                      <span className="text-white/70 text-sm">{p.method}</span>
                      <span className="text-white/50 text-xs font-mono">{p.accountId}</span>
                      <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${p.status === "completed" ? "bg-green-500/15 text-green-400 border border-green-500/25" : "bg-amber-500/15 text-amber-400 border border-amber-500/25"
                        }`}>
                        {p.status === "completed" ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {p.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      }

      case "leaderboard": return (
        <div>
          <div className="mb-6">
            <h2 className="text-white font-extrabold text-xl mb-1">Leaderboard</h2>
            <p className="text-white/50 text-sm">Top performing traders this month</p>
          </div>

          {/* Loading state */}
          {leaderboardLoading && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {[0, 1, 2].map(i => (
                  <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-white/10 mx-auto mb-3" />
                    <div className="h-4 bg-white/10 rounded-full w-24 mx-auto mb-2" />
                    <div className="h-3 bg-white/10 rounded-full w-16 mx-auto mb-3" />
                    <div className="h-5 bg-white/10 rounded-full w-20 mx-auto" />
                  </div>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                {[0, 1, 2, 3, 4].map(i => (
                  <div key={i} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 animate-pulse">
                    <div className="h-4 bg-white/10 rounded-full w-6" />
                    <div className="col-span-2 h-4 bg-white/10 rounded-full w-32" />
                    <div className="h-4 bg-white/10 rounded-full w-20" />
                    <div className="h-4 bg-white/10 rounded-full w-10" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error state */}
          {!leaderboardLoading && leaderboardError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
              <AlertTriangle size={28} className="text-red-400 mx-auto mb-3" />
              <div className="text-white font-bold mb-1">Unable to load leaderboard</div>
              <div className="text-white/50 text-sm mb-4">Check your connection and try again.</div>
              <Button
                onClick={() => {
                  setLeaderboardError(false);
                  setLeaderboardLoading(true);
                  fetch(`${import.meta.env.BASE_URL}api/users/leaderboard`, { credentials: "include" })
                    .then(r => r.ok ? r.json() : Promise.reject())
                    .then((rows: any[]) => {
                      const BADGES = ["🏆", "🥈", "🥉"];
                      setLeaderboardData(rows.map((row, i) => ({ rank: i + 1, firstName: row.firstName || row.name || "Trader", city: row.city || null, totalPayout: row.totalPayout || 0, badge: BADGES[i] || "" })));
                    })
                    .catch(() => setLeaderboardError(true))
                    .finally(() => setLeaderboardLoading(false));
                }}
                className="bg-white/10 text-white rounded-xl px-5 h-9 text-sm hover:bg-white/20"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Empty state */}
          {!leaderboardLoading && !leaderboardError && leaderboardData.length === 0 && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
              <Trophy size={36} className="text-white/20 mx-auto mb-3" />
              <div className="text-white font-bold mb-1">No traders on the leaderboard yet</div>
              <div className="text-white/50 text-sm">Complete your first funded challenge to claim a spot.</div>
            </div>
          )}

          {/* Populated state */}
          {!leaderboardLoading && !leaderboardError && leaderboardData.length > 0 && (
            <>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {leaderboardData.slice(0, 3).map((t, i) => (
                  <div key={t.rank} className={`bg-white/5 border rounded-2xl p-5 text-center ${i === 0 ? "border-amber-400/40 bg-amber-500/5" : "border-white/10"}`}>
                    <div className="text-3xl mb-2">{t.badge}</div>
                    <div className="text-white font-bold text-lg">{t.firstName}</div>
                    {t.city && <div className="text-white/50 text-xs mb-3">{t.city}</div>}
                    <div className="text-green-400 font-extrabold text-xl">{fmt(t.totalPayout)}</div>
                    <div className="text-white/40 text-xs mt-1">Total Payout</div>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
                <div className="min-w-[400px]">
                  <div className="grid grid-cols-4 gap-4 px-6 py-3 border-b border-white/10 text-white/40 text-xs font-semibold uppercase tracking-wider">
                    <span>Rank</span><span className="col-span-2">Trader</span><span>Total Payout</span>
                  </div>
                  {leaderboardData.map(t => (
                    <div key={t.rank} className="grid grid-cols-4 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.03] transition-colors">
                      <span className={`font-bold text-sm ${t.rank <= 3 ? "text-amber-400" : "text-white/60"}`}>
                        {t.badge || `#${t.rank}`}
                      </span>
                      <div className="col-span-2">
                        <div className="text-white font-semibold text-sm">{t.firstName}</div>
                        {t.city && <div className="text-white/40 text-xs">{t.city}</div>}
                      </div>
                      <span className="text-green-400 font-bold text-sm">{fmt(t.totalPayout)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      );

      case "analytics": {
        // Guard: show loading skeleton while accounts are being fetched
        if (profile.accounts.length === 0) {
          return (
            <div>
              <div className="mb-6">
                <h2 className="text-white font-extrabold text-xl mb-1">Analytics</h2>
                <p className="text-white/50 text-sm">Your performance overview</p>
              </div>
              {/* Show skeleton while accounts are being loaded */}
              {isDemo === false && profile.accounts.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
                  <BarChart2 size={36} className="text-white/20 mx-auto mb-3" />
                  <div className="text-white font-bold mb-1">No account data yet</div>
                  <div className="text-white/50 text-sm mb-6 max-w-sm mx-auto">
                    Analytics will appear once you have an active funded or challenge account.
                  </div>
                  <a href="/checkout">
                    <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl px-6 text-sm">
                      <Plus size={14} className="mr-2" /> Buy a Challenge
                    </Button>
                  </a>
                </div>
              ) : (
                /* Loading skeleton while accounts are still being fetched */
                <div className="space-y-4 animate-pulse">
                  <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
                    <div className="rounded-3xl bg-white/5 border border-white/10 h-52" />
                    <div className="rounded-3xl bg-white/5 border border-white/10 h-52" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[0, 1, 2, 3].map(i => <div key={i} className="rounded-2xl bg-white/5 border border-white/10 h-24" />)}
                  </div>
                </div>
              )}
            </div>
          );
        }

        const activeAccount = profile.accounts.find(acc => acc.status === "active") || profile.accounts[0];

        const totalStart = profile.accounts.reduce((sum, acc) => sum + acc.startBalance, 0) || activeAccount.startBalance;
        const totalBalance = profile.accounts.reduce((sum, acc) => sum + acc.balance, 0) || activeAccount.balance;
        const totalTrades = profile.accounts.reduce((sum, acc) => sum + acc.tradeCount, 0) || activeAccount.tradeCount;
        const totalPnl = totalBalance - totalStart;
        const profitTargetProgress = Math.min(100, Math.max(0, ((totalPnl / totalStart) * 100) / (activeAccount.profitTarget || 1) * 100));
        const consistencyScore = Math.min(100, Math.max(45, Math.round((activeAccount.winRate * 0.55) + (100 - activeAccount.maxLoss * 3) * 0.45)));
        const disciplineScore = Math.min(100, Math.max(40, Math.round((consistencyScore * 0.7) + ((100 - activeAccount.dailyLoss * 6) * 0.3))));
        // Sharpe/Sortino/VaR/passProbability kept as-is — medium/large effort tasks, out of scope
        const sharpe = Number((1.1 + (activeAccount.winRate - 50) * 0.02).toFixed(2));
        const sortino = Number((sharpe * 0.9).toFixed(2));
        const recoveryFactor = Number((Math.max(1, totalPnl / Math.max(1, activeAccount.maxLoss / 100 * totalStart))).toFixed(2));
        const totalLots = totalTrades * 2;
        const remainingDays = Math.max(0, 14 - Math.round(totalTrades / 4));
        const passProbability = Math.min(98, Math.max(35, Math.round((consistencyScore + sharpe * 8) / 2)));
        const var95 = Math.max(0, Math.round((100 - activeAccount.winRate) * totalStart * 0.0022));
        const es = Math.max(0, Math.round(var95 * 1.7));
        const calmar = Number((Math.max(1, totalPnl) / Math.max(1, activeAccount.maxLoss / 100 * totalStart)).toFixed(2));
        const ulcer = Number(Math.pow(Math.max(1, activeAccount.maxLoss), 0.8).toFixed(2));

        // ── Equity curve (kept as-is — medium effort, out of scope for this task) ──────
        const buildSeries = (count: number) => Array.from({ length: count }, (_, idx) => {
          const progress = idx / Math.max(1, count - 1);
          const equity = Math.round(totalStart + totalPnl * progress + Math.sin(idx * 0.65) * totalStart * 0.012);
          const benchmark = Math.round(24326 + 220 * progress + Math.cos(idx * 0.4) * 12);
          const drawdown = Math.round(((Math.max(totalStart, equity) - equity) / Math.max(1, Math.max(totalStart, equity))) * 100);
          return { idx, label: `Day ${idx + 1}`, equity, benchmark, drawdown, peak: idx === Math.floor(count * 0.6) };
        });
        const allSeries = buildSeries(28);
        const rangeMap: Record<string, number> = { "1D": 7, "1W": 12, "1M": 20, ALL: 28 };
        const chartData = allSeries.slice(-rangeMap[analyticsRange]).map((point, idx) => ({
          ...point,
          mcLow: Math.max(0, Math.round(point.equity * (0.92 + Math.sin(idx * 0.33) * 0.03))),
          mcHigh: Math.round(point.equity * (1.06 + Math.cos(idx * 0.27) * 0.02)),
        }));
        const dailyPnlBars = chartData.map((point, index) => ({ day: point.label, pnl: index === 0 ? 0 : point.equity - chartData[index - 1].equity }));

        // ── Real computations from tradeLogs (A1–A9) ────────────────────────────────────
        // tradeLogs shape: { symbol, pnl, createdAt }[]
        const tradeLogs: { symbol: string; pnl: number; createdAt: string }[] =
          analyticsTradesData ?? [];
        const hasTradeData = tradeLogs.length > 0;

        // A4 / A5 — Avg Win & Avg Loss from real trade records
        const winningTrades = tradeLogs.filter(t => t.pnl > 0);
        const losingTrades = tradeLogs.filter(t => t.pnl < 0);
        const avgWin = winningTrades.length > 0
          ? Math.round(winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length)
          : null;
        const avgLoss = losingTrades.length > 0
          ? Math.round(Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length))
          : null;

        // A6 — Profit Factor from real trade records
        const grossWins = winningTrades.reduce((s, t) => s + t.pnl, 0);
        const grossLosses = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0));
        const profitFactor = hasTradeData && grossLosses > 0
          ? Number((grossWins / grossLosses).toFixed(2))
          : null;

        // A7 / A8 — Win & Loss streaks from real trade records (sorted oldest→newest)
        const sortedPnl = [...tradeLogs]
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .map(t => t.pnl);
        let longestWinStreak = 0, longestLossStreak = 0, curWin = 0, curLoss = 0;
        for (const pnl of sortedPnl) {
          if (pnl > 0) { curWin++; curLoss = 0; longestWinStreak = Math.max(longestWinStreak, curWin); }
          else { curLoss++; curWin = 0; longestLossStreak = Math.max(longestLossStreak, curLoss); }
        }

        // A1 — Symbol breakdown from real trade records
        const SYMBOL_COLORS: Record<string, string> = {
          BANKNIFTY: "#7C3AED", NIFTY: "#22C55E", SENSEX: "#38BDF8",
          FINNIFTY: "#F97316", OTHER: "#A855F7",
        };
        type SymbolBreakdownEntry = { name: string; value: number; color: string; pnl: number };
        const symbolBreakdown: SymbolBreakdownEntry[] = (() => {
          if (!hasTradeData) return [];
          const pnlBySymbol: Record<string, number> = {};
          const countBySymbol: Record<string, number> = {};
          for (const t of tradeLogs) {
            const sym = Object.keys(SYMBOL_COLORS).find(k => t.symbol.toUpperCase().includes(k)) || "OTHER";
            pnlBySymbol[sym] = (pnlBySymbol[sym] || 0) + t.pnl;
            countBySymbol[sym] = (countBySymbol[sym] || 0) + 1;
          }
          const total = Object.values(countBySymbol).reduce((s, n) => s + n, 0);
          return Object.entries(countBySymbol)
            .map(([name, count]) => ({
              name,
              value: Math.round((count / total) * 100),
              color: SYMBOL_COLORS[name] ?? "#A855F7",
              pnl: pnlBySymbol[name] ?? 0,
            }))
            .sort((a, b) => b.value - a.value);
        })();

        // A2 — Day-of-week performance from real trade records
        type DayPerf = { day: string; pnl: number; count: number };
        const dayOfWeek: { day: string; perf: number }[] = (() => {
          if (!hasTradeData) return ["Mon", "Tue", "Wed", "Thu", "Fri"].map(day => ({ day, perf: 0 }));
          const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const byDay: Record<number, DayPerf> = {};
          for (const t of tradeLogs) {
            const d = new Date(t.createdAt).getDay();
            if (!byDay[d]) byDay[d] = { day: DAY_NAMES[d], pnl: 0, count: 0 };
            byDay[d].pnl += t.pnl;
            byDay[d].count++;
          }
          // Mon–Fri only; if no trades on a day show 0
          return [1, 2, 3, 4, 5].map(d => {
            const entry = byDay[d];
            if (!entry || entry.count === 0) return { day: DAY_NAMES[d], perf: 0 };
            const avgPnl = entry.pnl / entry.count;
            // Normalise: clamp avg PnL to a 0–100 score relative to best day
            return { day: DAY_NAMES[d], perf: avgPnl, rawPnl: avgPnl };
          }).map((item, _, arr) => {
            const max = Math.max(...arr.map(a => Math.abs((a as any).rawPnl || 0))) || 1;
            const score = Math.round(((((item as any).rawPnl || 0) / max) * 50) + 50); // 0–100
            return { day: item.day, perf: Math.max(0, Math.min(100, score)) };
          });
        })();

        // A3 — P&L Calendar heatmap — last 28 days from real trade records
        const calendarHeat: { day: string; value: number; pnl: number }[] = (() => {
          const cells: { day: string; value: number; pnl: number }[] = [];
          const now = new Date();
          const pnlByDate: Record<string, number> = {};
          for (const t of tradeLogs) {
            const d = t.createdAt.slice(0, 10); // YYYY-MM-DD
            pnlByDate[d] = (pnlByDate[d] || 0) + t.pnl;
          }
          for (let i = 27; i >= 0; i--) {
            const dt = new Date(now);
            dt.setDate(now.getDate() - i);
            const key = dt.toISOString().slice(0, 10);
            const pnl = pnlByDate[key] ?? 0;
            cells.push({ day: `D${28 - i}`, value: pnl > 0 ? 80 : pnl < 0 ? 20 : 45, pnl });
          }
          return cells;
        })();

        // A9 — AI Insight cards derived from real computed data
        const insightCards: { title: string; description: string; tone: string }[] = (() => {
          if (!hasTradeData) return [];
          const cards: { title: string; description: string; tone: string }[] = [];
          // Best symbol
          if (symbolBreakdown.length > 0) {
            const best = symbolBreakdown.reduce((a, b) => (b.pnl > a.pnl ? b : a));
            if (best.pnl > 0) {
              cards.push({ title: `Your best symbol is ${best.name}`, description: `${best.value}% of your trades — highest realised P&L across all symbols.`, tone: "good" });
            }
          }
          // Weakest day of week
          const sorted = [...dayOfWeek].sort((a, b) => a.perf - b.perf);
          if (sorted[0] && sorted[0].perf < 45) {
            cards.push({ title: `Trade less on ${sorted[0].day}days`, description: `${sorted[0].day} shows the weakest average P&L. Consider reducing size or skipping that session.`, tone: "warn" });
          }
          // Loss streak warning
          if (longestLossStreak >= 3) {
            cards.push({ title: `Reduce size after ${longestLossStreak} consecutive losses`, description: "Preserve capital by scaling back position size during losing streaks.", tone: "warn" });
          }
          // Profit factor strength
          if (profitFactor !== null && profitFactor >= 1.5) {
            cards.push({ title: "Strong profit factor detected", description: `Profit factor of ${profitFactor} — your winners outpace your losers. Stay consistent.`, tone: "good" });
          }
          // Pad to at least 1 card if no insights derived
          if (cards.length === 0) {
            cards.push({ title: "Keep logging your trades", description: "More trade data will unlock personalised insights about your patterns and performance.", tone: "good" });
          }
          return cards;
        })();

        // Edge ratio derived from real avg win / loss
        const edgeRatio = avgWin != null && avgLoss != null && avgLoss > 0
          ? Number((avgWin / avgLoss).toFixed(2))
          : null;

        const drawdownZoneClass = activeAccount.maxLoss < 6 ? "bg-emerald-500/10 text-emerald-300" : activeAccount.maxLoss < 9 ? "bg-amber-500/10 text-amber-300" : "bg-red-500/10 text-red-300";
        const drawdownMeter = Math.min(100, activeAccount.maxLoss * 10);

        return (
          <div className="space-y-6">
            <div className="grid lg:grid-cols-[1.6fr_1fr] gap-5">
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-6 shadow-[0_30px_60px_rgba(74,0,224,0.12)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <div className="text-white/60 uppercase tracking-[0.35em] text-[11px] font-bold">Live Analytics</div>
                    <div className="mt-3 text-3xl md:text-4xl font-extrabold text-white">₹{fmt(totalBalance)}</div>
                    <div className="text-white/50 text-sm mt-1">Real-time equity across all funded accounts</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-white/40 text-[11px] uppercase tracking-[0.25em] mb-2">Daily P&L</div>
                      <div className={`text-lg font-extrabold ${totalPnl >= 0 ? "text-green-400" : "text-red-400"}`}>{totalPnl >= 0 ? "+" : ""}₹{fmt(Math.abs(totalPnl))}</div>
                      <div className="text-white/50 text-[11px] mt-1">Live session movement</div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-white/40 text-[11px] uppercase tracking-[0.25em] mb-2">Funded progress</div>
                      <div className="text-lg font-extrabold text-white">{Math.round(profitTargetProgress)}%</div>
                      <div className="h-2 mt-3 rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#D63384]" style={{ width: `${profitTargetProgress}%` }} />
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.1 }} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-white/40 text-[11px] uppercase tracking-[0.25em] mb-2">Consistency score</div>
                      <div className="text-lg font-extrabold text-[#A855F7]">{consistencyScore}/100</div>
                      <div className="text-white/50 text-[11px] mt-1">Behavioral resilience</div>
                    </motion.div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/45 text-[11px] uppercase tracking-[0.25em] mb-3">Phase</div>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white font-bold text-sm">{activeAccount.phase === "funded" ? "Funded" : activeAccount.phase === "verification" ? "Verification" : "Challenge"}</div>
                        <div className="text-white/50 text-[11px] mt-1">Target: {activeAccount.profitTarget}%</div>
                      </div>
                      <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase bg-white/5 text-white/75">{activeAccount.status}</span>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/45 text-[11px] uppercase tracking-[0.25em] mb-3">Live drawdown</div>
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${drawdownZoneClass}`}>
                        <span className="text-sm font-bold">{activeAccount.maxLoss}%</span>
                      </div>
                      <div className="flex-1">
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" style={{ width: `${drawdownMeter}%` }} />
                        </div>
                        <div className="text-white/50 text-[11px] mt-2">Green / yellow / red risk zones</div>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-white/45 text-[11px] uppercase tracking-[0.25em] mb-3">Market cadence</div>
                    <div className="text-white font-bold text-sm mb-1">09:15–11:00</div>
                    <div className="text-white/50 text-[11px]">Peak activity window</div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-6 shadow-[0_30px_60px_rgba(74,0,224,0.12)]">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-white/50 uppercase tracking-[0.35em] text-[11px] font-bold">Equity Curve</div>
                    <div className="text-white text-2xl font-extrabold mt-2">Equity vs NIFTY</div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(["1D", "1W", "1M", "ALL"] as const).map(range => (
                      <button key={range} onClick={() => setAnalyticsRange(range)}
                        className={`rounded-full px-4 py-2 text-[11px] font-semibold transition ${analyticsRange === range ? "bg-[#7C3AED] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"}`}>
                        {range}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-5 h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 18, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="10%" stopColor="#8B5CF6" stopOpacity={0.24} />
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} strokeDasharray="4 4" />
                      <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} minTickGap={20} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }} tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} width={60} />
                      <Tooltip contentStyle={{ background: "#0A0018", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff" }} formatter={(value: any, name: any) => [fmt(value), name === "benchmark" ? "NIFTY" : name === "mcHigh" || name === "mcLow" ? "Monte Carlo" : "Equity"]} />
                      <ReferenceLine y={totalStart} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 5" label={{ position: "insideTopLeft", value: "Start", fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
                      <Area type="monotone" dataKey="mcHigh" stroke="transparent" fill="rgba(59,130,246,0.14)" />
                      <Area type="monotone" dataKey="mcLow" stroke="transparent" fill="rgba(59,130,246,0.07)" />
                      <Line type="monotone" dataKey="benchmark" stroke="#22C55E" strokeWidth={2} dot={false} opacity={0.7} />
                      <Line type="monotone" dataKey="equity" stroke="#A855F7" strokeWidth={3} dot={{ r: 2, fill: "#fff" }} activeDot={{ r: 5, fill: "#D63384" }} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-white/60">
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#A855F7]" /> Equity</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#22C55E]" /> NIFTY benchmark</span>
                    <span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#3B82F6]" /> Monte Carlo band</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Profit Factor", value: analyticsTradesLoading ? "…" : profitFactor != null ? profitFactor.toFixed(2) : "—", icon: TrendingUp, color: "text-emerald-400" },
                { label: "Sharpe Ratio", value: sharpe.toFixed(2), icon: Scale, color: "text-sky-400" },
                { label: "Sortino Ratio", value: sortino.toFixed(2), icon: Shield, color: "text-violet-400" },
                { label: "Max Drawdown", value: `${activeAccount.maxLoss}%`, icon: ArrowDownRight, color: "text-red-400" },
                { label: "Win Rate", value: `${activeAccount.winRate}%`, icon: Trophy, color: "text-green-400" },
                { label: "Recovery Factor", value: recoveryFactor.toFixed(2), icon: ArrowUpRight, color: "text-amber-400" },
                { label: "Avg Win", value: analyticsTradesLoading ? "…" : avgWin != null ? fmt(avgWin) : "—", icon: ArrowUp, color: "text-green-400" },
                { label: "Avg Loss", value: analyticsTradesLoading ? "…" : avgLoss != null ? fmt(avgLoss) : "—", icon: ArrowDown, color: "text-red-400" },
              ].map(metric => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-white/40 text-[11px] uppercase tracking-[0.25em]">{metric.label}</span>
                    <metric.icon size={18} className={metric.color} />
                  </div>
                  <div className={`text-xl font-extrabold ${metric.color}`}>{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                { label: "Largest Win", value: analyticsTradesLoading ? "…" : winningTrades.length > 0 ? fmt(Math.max(...winningTrades.map(t => t.pnl))) : "—", icon: ArrowUpRight, color: "text-emerald-400" },
                { label: "Largest Loss", value: analyticsTradesLoading ? "…" : losingTrades.length > 0 ? fmt(Math.abs(Math.min(...losingTrades.map(t => t.pnl)))) : "—", icon: ArrowDownRight, color: "text-red-400" },
                { label: "Win/Loss Streak", value: analyticsTradesLoading ? "…" : hasTradeData ? `${longestWinStreak}/${longestLossStreak}` : "—", icon: TrendingUp, color: "text-violet-400" },
                { label: "Edge Ratio", value: analyticsTradesLoading ? "…" : edgeRatio != null ? edgeRatio.toFixed(2) : "—", icon: Activity, color: "text-emerald-400" },
                { label: "Total Lots", value: String(totalLots), icon: Users, color: "text-indigo-400" },
                { label: "Total Trades", value: analyticsTradesLoading ? "…" : hasTradeData ? String(tradeLogs.length) : String(totalTrades), icon: Shield, color: "text-amber-400" },
              ].map(metric => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-white/40 text-[11px] uppercase tracking-[0.25em]">{metric.label}</span>
                    <metric.icon size={18} className={metric.color} />
                  </div>
                  <div className={`text-xl font-extrabold ${metric.color}`}>{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="grid xl:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">Discipline score</div>
                    <div className="text-2xl font-extrabold text-[#A855F7]">{disciplineScore}/100</div>
                  </div>
                  <div className="text-white/50 text-xs">Behavioral meter</div>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#7C3AED] via-[#A855F7] to-[#D63384]" style={{ width: `${disciplineScore}%` }} />
                </div>
                <div className="mt-4 space-y-3 text-sm text-white/60">
                  <div className="flex items-center justify-between"><span>Revenge trading</span><span className={`font-bold ${activeAccount.winRate < 60 ? "text-red-300" : "text-emerald-300"}`}>{activeAccount.winRate < 60 ? "High" : "Low"}</span></div>
                  <div className="flex items-center justify-between"><span>Overtrading alert</span><span className={`font-bold ${totalTrades > 40 ? "text-red-300" : "text-emerald-300"}`}>{totalTrades > 40 ? "Active" : "Stable"}</span></div>
                  <div className="flex items-center justify-between"><span>FOMO signals</span><span className={`font-bold ${activeAccount.dailyLoss > 4 ? "text-amber-300" : "text-emerald-300"}`}>{activeAccount.dailyLoss > 4 ? "Monitor" : "Good"}</span></div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">P&L Calendar</div>
                    <div className="text-white font-bold">Last 28 days</div>
                  </div>
                  <Clock size={18} className="text-white/40" />
                </div>
                {analyticsTradesLoading ? (
                  <div className="grid grid-cols-7 gap-1 animate-pulse">
                    {Array.from({ length: 28 }).map((_, i) => <div key={i} className="h-8 rounded-lg bg-white/10" />)}
                  </div>
                ) : !hasTradeData ? (
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 28 }).map((_, i) => <div key={i} className="h-8 rounded-lg bg-white/5" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-7 gap-1">
                    {calendarHeat.map((cell, idx) => (
                      <div key={idx}
                        className={`h-8 rounded-lg ${cell.pnl > 0 ? "bg-emerald-400" : cell.pnl < 0 ? "bg-red-400/70" : "bg-white/5"}`}
                        title={`${cell.day}: ${cell.pnl >= 0 ? "+" : ""}${fmt(cell.pnl)}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">Day of week</div>
                    <div className="text-white font-bold">
                      {hasTradeData ? "Avg P&L by day" : "Performance"}
                    </div>
                  </div>
                </div>
                <div className="h-52">
                  {analyticsTradesLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white/20 border-t-[#A855F7] rounded-full animate-spin" />
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dayOfWeek} margin={{ left: -20, right: 0, top: 10, bottom: 10 }}>
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.55)", fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={30} />
                        <Tooltip contentStyle={{ background: "#0A0018", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff" }} formatter={(value: any) => [`${value}%`, hasTradeData ? "Score" : "Perf"]} />
                        <Bar dataKey="perf" radius={[8, 8, 0, 0]} fill="#8B5CF6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">Symbol breakdown</div>
                    <div className="text-white font-bold">Trade share by symbol</div>
                  </div>
                </div>
                {analyticsTradesLoading ? (
                  <div className="h-52 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-white/20 border-t-[#A855F7] rounded-full animate-spin" />
                  </div>
                ) : !hasTradeData ? (
                  <div className="h-52 flex flex-col items-center justify-center text-center">
                    <div className="text-white/20 text-3xl mb-2">◎</div>
                    <div className="text-white/40 text-xs">No trade data yet</div>
                  </div>
                ) : (
                  <>
                    <div className="h-52">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={symbolBreakdown} dataKey="value" innerRadius={42} outerRadius={70} paddingAngle={3}>
                            {symbolBreakdown.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                          </Pie>
                          <Tooltip contentStyle={{ background: "#0A0018", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, color: "#fff" }} formatter={(value: any, name: any) => [`${value}%`, name]} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid gap-3 text-[11px] text-white/60">
                      {symbolBreakdown.map((symbol) => (
                        <div key={symbol.name} className="rounded-3xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full" style={{ background: symbol.color }} />
                              <span>{symbol.name}</span>
                            </div>
                            <span className="text-xs text-white/50">{symbol.value}%</span>
                          </div>
                          <div className="mt-1.5 text-[11px] text-white/50">
                            P&L: <span className={symbol.pnl >= 0 ? "text-green-400" : "text-red-400"}>{symbol.pnl >= 0 ? "+" : ""}{fmt(symbol.pnl)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid xl:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">Risk dashboard</div>
                    <div className="text-white font-bold">Monte Carlo & stress metrics</div>
                  </div>
                  <Scale size={20} className="text-white/40" />
                </div>
                <div className="grid gap-3">
                  {[
                    { label: "Value at Risk (95%)", value: `₹${fmt(var95)}` },
                    { label: "Expected Shortfall", value: `₹${fmt(es)}` },
                    { label: "Calmar Ratio", value: calmar.toFixed(2) },
                    { label: "Ulcer Index", value: ulcer.toFixed(2) },
                  ].map(metric => (
                    <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                      <div className="text-white/50 text-[11px] uppercase tracking-[0.25em] mb-2">{metric.label}</div>
                      <div className="text-white font-bold text-lg">{metric.value}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">Position sizing</div>
                    <div className="text-white font-bold">Optimal allocation</div>
                  </div>
                  <Heart size={20} className="text-white/40" />
                </div>
                {[
                  { label: "Momentum entry", width: 92, caption: "2.4% risk" },
                  { label: "Fade breakout", width: 76, caption: "1.9% risk" },
                  { label: "Swing capture", width: 84, caption: "2.7% risk" },
                  { label: "Scalp execution", width: 58, caption: "1.1% risk" },
                ].map(item => (
                  <div key={item.label} className="space-y-2 mb-4 last:mb-0">
                    <div className="flex items-center justify-between text-white/60 text-xs"><span>{item.label}</span><span>{item.caption}</span></div>
                    <div className="h-3 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#22C55E]" style={{ width: `${item.width}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {analyticsTradesLoading ? (
                [0, 1, 2, 3].map(i => (
                  <div key={i} className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5 animate-pulse">
                    <div className="h-3 bg-white/10 rounded-full w-16 mb-3" />
                    <div className="h-5 bg-white/10 rounded-full w-40 mb-2" />
                    <div className="h-3 bg-white/10 rounded-full w-full" />
                  </div>
                ))
              ) : insightCards.length === 0 ? (
                <div className="col-span-4 rounded-3xl border border-white/10 bg-[#0B021D]/80 p-8 text-center">
                  <div className="text-white/20 text-3xl mb-2">💡</div>
                  <div className="text-white/50 text-sm">Trade more to unlock personalised insights.</div>
                </div>
              ) : (
                insightCards.map((ins, idx) => (
                  <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: idx * 0.05 }} className={`rounded-3xl border border-white/10 bg-[#0B021D]/80 p-5 ${ins.tone === "warn" ? "border-amber-500/20" : "border-emerald-500/20"}`}>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-3">Insight</div>
                    <div className="text-white font-bold text-lg mb-2">{ins.title}</div>
                    <div className="text-white/60 text-sm">{ins.description}</div>
                  </motion.div>
                ))
              )}
            </div>

            <div className="grid xl:grid-cols-2 gap-4">
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">Funding progress</div>
                    <div className="text-white font-bold text-xl">Phase milestones</div>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.25em] text-white/50">{activeAccount.phase === "funded" ? "Phase 2" : "Phase 1"}</span>
                </div>
                <div className="space-y-4">
                  <FundingRow label="Days remaining" value={`${remainingDays} days`} />
                  <FundingRow label="Daily profit needed" value={`₹${fmt(Math.max(0, Math.round((activeAccount.profitTarget / 100 * activeAccount.startBalance - totalPnl) / Math.max(1, remainingDays))))}`} />
                  <FundingRow label="Pass probability" value={`${passProbability}%`} />
                  <FundingRow label="Rule compliance" value={`${Math.min(100, 80 + activeAccount.winRate * 0.2).toFixed(0)}%`} />
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-[#0B021D]/80 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-white/40 text-[11px] uppercase tracking-[0.25em]">Risk compliance</div>
                    <div className="text-white font-bold text-xl">Rule compliance</div>
                  </div>
                  <span className="text-xs text-white/50">Current score</span>
                </div>
                <div className="grid gap-3">
                  {[
                    { label: "Daily drawdown", ok: activeAccount.dailyLoss <= 5 },
                    { label: "Max drawdown", ok: activeAccount.maxLoss <= 10 },
                    { label: "Profit target pace", ok: profitTargetProgress >= 50 },
                    { label: "Consistency", ok: consistencyScore >= 65 },
                  ].map(item => (
                    <div key={item.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-white/60 text-[12px]">{item.label}</div>
                      </div>
                      <span className={`text-[11px] font-bold uppercase px-3 py-1 rounded-full ${item.ok ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>{item.ok ? "Good" : "Watch"}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "journal": {
        const saved = (() => { try { return JSON.parse(localStorage.getItem("fw-journal") || "[]"); } catch { return []; } })();
        return <JournalSection storageKey="fw-journal" initial={saved} />;
      }

      case "feedback": return (
        <div className="space-y-6">
          <div>
            <h2 className="text-white font-extrabold text-xl">Feedback</h2>
            <p className="text-white/55 text-sm mt-1">Tell us what's working and what should be better. Every message is read by our India product team.</p>
          </div>
          <FeedbackForm displayName={displayName} displayEmail={displayEmail} />
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, title: "Feature ideas", desc: "Tell us which tools, instruments or reports would help you trade better." },
              { icon: AlertTriangle, title: "Bug reports", desc: "Saw something broken? Share screenshots or steps and we'll fix it fast." },
              { icon: Heart, title: "Praise & wins", desc: "What did we get right? Your wins keep the team motivated." },
            ].map(c => (
              <div key={c.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A00E0]/30 to-[#D63384]/20 flex items-center justify-center mb-3">
                  <c.icon size={18} className="text-fw-pink" />
                </div>
                <div className="text-white font-bold text-sm mb-1">{c.title}</div>
                <div className="text-white/55 text-xs leading-relaxed">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      );

      case "support": return (
        <div className="space-y-6">
          <div>
            <h2 className="text-white font-extrabold text-xl">Help & Support</h2>
            <p className="text-white/55 text-sm mt-1">India support team online 7 days a week. Most replies inside 12 hours, urgent trading-hour issues inside 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: MessageSquare, title: "Live Chat", desc: "Quick questions, instant answers — open the chat bubble at the bottom-right of any page.", action: "Open chat", href: "javascript:void(0)", onClick: () => { window.dispatchEvent(new CustomEvent("open-chat-widget")); } },
              { icon: Send, title: "Email", desc: "support@fundedwealth.com — best for KYC, payouts, billing or anything that needs attachments.", action: "Email us", href: "https://mail.google.com/mail/u/0/?view=cm&to=support@fundedwealth.com&su=Support+Request&body=Hi+FundedWealth+Team%2C%0A%0AI+need+help+with%3A", onClick: undefined },
              { icon: LifeBuoy, title: "WhatsApp", desc: "Trading-hour priority support — text us during NSE hours for fastest response.", action: "Open WhatsApp", href: "https://wa.me/message/ZPLR472VQTXLL1", onClick: undefined },
            ].map(c => (
              <div key={c.title} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4A00E0]/30 to-[#D63384]/20 flex items-center justify-center mb-3">
                  <c.icon size={18} className="text-fw-pink" />
                </div>
                <div className="text-white font-bold text-sm mb-1">{c.title}</div>
                <div className="text-white/55 text-xs leading-relaxed mb-3">{c.desc}</div>
                <a href={c.href} onClick={c.onClick} target={c.href.startsWith("https://") ? "_blank" : undefined} rel="noreferrer"
                  className="text-fw-pink text-xs font-bold inline-flex items-center gap-1 hover:underline cursor-pointer">
                  {c.action} <ExternalLink size={12} />
                </a>
              </div>
            ))}
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="text-white font-bold mb-1">Quick links</div>
            <div className="text-white/45 text-xs mb-4">Most-asked answers from across the platform.</div>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                { label: "How do payouts work?", to: "/faq" },
                { label: "Drawdown & rules explained", to: "/rules" },
                { label: "Scaling plan (₹1L → ₹50L)", to: "/scaling" },
                { label: "KYC step-by-step", to: "/faq" },
                { label: "Refund policy", to: "/refund" },
                { label: "Affiliate programme", to: "/#affiliate" },
              ].map(l => (
                <a key={l.label} href={l.to}
                  className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors rounded-xl px-4 py-3 text-sm text-white/75 hover:text-white border border-white/5">
                  <span>{l.label}</span>
                  <ChevronRight size={14} className="text-white/30" />
                </a>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-[#4A00E0]/20 to-[#D63384]/15 border border-white/10 rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="text-white font-bold">Premium 1-on-1 support</div>
              <div className="text-white/55 text-xs mt-1">Funded traders unlock dedicated WhatsApp support and a named account manager.</div>
            </div>
            <Button onClick={() => setSection("accounts")} className="bg-white text-[#4A00E0] font-bold rounded-xl h-10 px-5 hover:bg-white/90">
              View my accounts
            </Button>
          </div>
        </div>
      );

      case "affiliate": return (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#4A00E0]/20 to-[#D63384]/15 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="text-white/50 text-sm mb-1">Your Referral Link</div>
                <div className="text-white font-extrabold text-3xl tracking-widest break-all">{referralUrl}</div>
                <div className="text-white/50 text-xs mt-2 max-w-2xl">Share your unique referral link with other traders. Every successful sign-up helps you earn commission on funded plans.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={copyRef}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${copied ? "bg-green-500/20 border border-green-500/40 text-green-400" : "bg-white/10 border border-white/20 text-white hover:bg-white/15"}`}>
                  <Copy size={15} /> {copied ? "Copied!" : "Copy link"}
                </button>
                <a href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#25D366]/15 border border-white/10 text-white text-sm hover:bg-[#25D366]/10 transition-colors">
                  WhatsApp
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${shareText}`} target="_blank" rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#1DA1F2]/15 border border-white/10 text-white text-sm hover:bg-[#1DA1F2]/10 transition-colors">
                  Twitter
                </a>
                <a href={`https://t.me/share/url?url=${encodedReferralUrl}&text=${shareText}`} target="_blank" rel="noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#0088cc]/15 border border-white/10 text-white text-sm hover:bg-[#0088cc]/10 transition-colors">
                  Telegram
                </a>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.5fr_1fr] gap-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[
                  { label: "Total Referrals", value: String(affiliateStats.referralCount), icon: Users, color: "text-blue-400" },
                  { label: "Active Traders", value: String(affiliateStats.activeTraders), icon: TrendingUp, color: "text-purple-400" },
                  { label: "Total Earned", value: fmt(affiliateStats.totalEarned), icon: DollarSign, color: "text-green-400" },
                  { label: "Pending Commission", value: fmt(affiliateStats.totalPending), icon: Clock, color: "text-amber-400" },
                  { label: "Leaderboard Rank", value: affiliateStats.leaderboardRank ? `#${affiliateStats.leaderboardRank}` : "Top 100+", icon: Trophy, color: "text-pink-400" },
                ].map(s => (
                  <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><s.icon size={18} className={s.color} /></div>
                    <div>
                      <div className="text-white/50 text-xs mb-0.5">{s.label}</div>
                      <div className={`font-bold text-xl ${s.color}`}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                <div className="text-white font-bold text-sm mb-4">Commission Structure</div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { level: "Level 1", rate: "10%", description: "Direct plan fee commission" },
                    { level: "Level 2", rate: "5%", description: "Second-tier plan fee commission" },
                  ].map(item => (
                    <div key={item.level} className="rounded-3xl border border-white/10 bg-[#0F0024] p-4">
                      <div className="text-white/50 text-xs uppercase tracking-wider mb-2">{item.level}</div>
                      <div className="text-white font-bold text-xl mb-1">{item.rate}</div>
                      <div className="text-white/60 text-sm">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-white font-bold">Traffic & Conversion</div>
                      <div className="text-white/50 text-sm">Click analytics for your referral channel.</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: "Total Clicks", value: String(affiliateClicks.totalClicks) },
                      { label: "Unique Visitors", value: String(affiliateClicks.uniqueVisitors) },
                      { label: "Conversion Rate", value: `${affiliateStats.conversionRate}%` },
                    ].map(metric => (
                      <div key={metric.label} className="rounded-3xl border border-white/10 bg-[#0F0024] p-4">
                        <div className="text-white/50 text-xs uppercase tracking-wider mb-2">{metric.label}</div>
                        <div className="text-white font-bold text-xl">{metric.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                  <div className="text-white font-bold mb-4">Leaderboard Snapshot</div>
                  <div className="space-y-3">
                    {affiliateLeaderboard.slice(0, 4).map((item, index) => (
                      <div key={item.userId} className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-[#0F0024] p-4">
                        <div>
                          <div className="text-white font-semibold">{index + 1}. {item.name}</div>
                          <div className="text-white/50 text-xs">{item.referrals} referrals</div>
                        </div>
                        <div className="text-green-300 font-bold">{fmt(item.earnings)}</div>
                      </div>
                    ))}
                    {affiliateLeaderboard.length === 0 && (
                      <div className="text-white/50 text-sm">No leaderboard data available yet.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-3xl p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <div className="text-white/50 text-sm">Pending commission available</div>
                    <div className="text-white font-bold text-3xl">{fmt(affiliateStats.totalPending)}</div>
                  </div>
                  <Button disabled={affiliateProcessing || affiliateStats.totalPending < 500} onClick={handleClaimCommission}
                    className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl h-11 px-6 disabled:opacity-40">
                    {affiliateProcessing ? "Requesting..." : "Withdraw Commission"}
                  </Button>
                </div>
                <div className="text-white/50 text-xs">Minimum ₹500 withdrawal. Transfer via UPI / Bank transfer once approved.</div>
                {affiliateMessage && <div className="text-white/60 text-sm mt-3">{affiliateMessage}</div>}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center gap-4">
              <div className="text-white font-bold text-sm uppercase tracking-wider text-center">Referral QR Code</div>
              <div className="rounded-3xl overflow-hidden border border-white/10 bg-[#12001F] p-4">
                <img src={`https://api.qrserver.com/v1/create-qr-code?size=260x260&data=${encodedReferralUrl}`} alt="Referral QR code"
                  className="block w-[260px] h-[260px] object-cover" />
              </div>
              <div className="text-white/50 text-center text-sm">Scan this QR code to open your referral link instantly.</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
              <div>
                <h3 className="text-white font-bold text-xl">Referral History</h3>
                <p className="text-white/50 text-sm">Date, plan, commission and status for your referred traders.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(["all", "pending", "paid"] as const).map(filter => (
                  <button key={filter} onClick={() => setHistoryFilter(filter)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${historyFilter === filter ? "bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
                    {filter === "all" ? "All" : filter === "pending" ? "Pending" : "Paid"}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-white/60 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Plan</th>
                    <th className="px-4 py-3">Commission</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-white/50">No referrals found yet.</td>
                    </tr>
                  ) : affiliateHistory.map((row) => (
                    <tr key={row.id} className="bg-white/5 border border-white/10 rounded-3xl mb-3">
                      <td className="px-4 py-4 align-top text-white/70">{new Date(row.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                      <td className="px-4 py-4 align-top text-white/90">{row.referredEmail?.split("@")[0] || "Trader"}</td>
                      <td className="px-4 py-4 align-top text-white/70">{row.planPurchased || "Plan pending"}</td>
                      <td className="px-4 py-4 align-top text-white/90">{fmt(row.commissionAmount || 0)}</td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${row.status === "paid" ? "bg-green-500/15 text-green-300" : row.status === "pending" ? "bg-amber-500/15 text-amber-300" : "bg-white/10 text-white/70"}`}>
                          {row.status || "pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mt-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-white font-bold text-xl">Payout History</h3>
                <p className="text-white/50 text-sm">Recent commission withdraw requests and payout status.</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-separate border-spacing-y-3">
                <thead>
                  <tr className="text-white/60 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliatePayoutHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-white/50">No payout history available.</td>
                    </tr>
                  ) : affiliatePayoutHistory.map((row) => (
                    <tr key={row.id} className="bg-white/5 border border-white/10 rounded-3xl mb-3">
                      <td className="px-4 py-4 align-top text-white/70">{new Date(row.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                      <td className="px-4 py-4 align-top text-white/90">{fmt(row.amount)}</td>
                      <td className="px-4 py-4 align-top text-white/70">{row.method}</td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase ${row.status === "paid" ? "bg-green-500/15 text-green-300" : row.status === "pending" ? "bg-amber-500/15 text-amber-300" : "bg-white/10 text-white/70"}`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );

      case "coupon": {
        const VALID_COUPONS: Record<string, string> = {
          FLASH: "60% off Flash Challenge",
          INSTANT: "55% off Instant Funding",
          FW: "65% off any plan",
          FW70: "70% off any plan",
          WELCOME: "10% off any plan",
        };
        return <CouponSection profile={profile} validCoupons={VALID_COUPONS} />;
      }

      case "giveaway": return (
        <div className="space-y-6">
          <h2 className="text-white font-extrabold text-xl">FundedWealth Giveaway</h2>
          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/10 border border-amber-500/25 rounded-2xl p-8 text-center">
            <div className="text-6xl mb-4"><Trophy className="mx-auto text-amber-400" size={56} /></div>
            <h3 className="text-white font-extrabold text-2xl mb-2">FW Championship Giveaway</h3>
            <p className="text-white/65 mb-6 max-w-md mx-auto">Win top prizes including iPhone 16, MacBook, and cash rewards. Trade on any funded account during the championship period.</p>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-6">
              {[["1st Place", "₹10L + MacBook"], ["2nd Place", "₹5L + ₹20K"], ["3rd Place", "₹2L + ₹9K"]].map(([place, prize]) => (
                <div key={place} className="bg-white/5 border border-white/10 rounded-xl p-3">
                  <div className="text-amber-400 font-bold text-sm">{place}</div>
                  <div className="text-white text-xs font-semibold mt-1">{prize}</div>
                </div>
              ))}
            </div>
            <a href="/championship">
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl px-4 md:px-6 lg:px-8 xl:px-10">
                View Championship <ExternalLink size={14} className="ml-2" />
              </Button>
            </a>
          </div>
        </div>
      );

      case "comparison": return (
        <div className="space-y-6">
          <h2 className="text-white font-extrabold text-xl">Account Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-white/40 font-semibold">Feature</th>
                  {["₹25K", "₹50K", "₹2L", "₹5L", "₹10L"].map(p => (
                    <th key={p} className="py-3 px-4 text-center text-white font-bold">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Price", "₹999", "₹1,799", "₹3,999", "₹7,999", "₹12,999"],
                  ["Profit Target", "10%", "10%", "10%", "10%", "10%"],
                  ["Daily Loss", "5%", "5%", "5%", "5%", "5%"],
                  ["Max Drawdown", "10%", "10%", "10%", "10%", "10%"],
                  ["Profit Split", "70%", "75%", "80%", "85%", "90%"],
                  ["Payout Cycle", "7 days", "7 days", "7 days", "7 days", "7 days"],
                  ["Free Retry", "Yes", "Yes", "Yes", "Yes", "Yes"],
                ].map(([feat, ...vals]) => (
                  <tr key={feat} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="py-3 px-4 text-white/70 font-medium">{feat}</td>
                    {vals.map((v, i) => (
                      <td key={i} className={`py-3 px-4 text-center font-semibold ${String(v).toLowerCase() === "yes" ? "text-green-400" : i === 4 ? "text-[#FF8A3D]" : "text-white/80"}`}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );

      case "rules": return (
        <div className="space-y-6">
          <h2 className="text-white font-extrabold text-xl">Trading Rules</h2>
          <div className="space-y-3">
            {RULES_LIST.map((r, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-start gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${r.ok ? "bg-green-500/20 text-green-400" : "bg-amber-500/20 text-amber-400"}`}>
                  {r.ok ? <CheckCircle size={15} /> : <AlertTriangle size={15} />}
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-0.5">{r.title}</div>
                  <div className="text-white/55 text-sm">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      case "privacy": return (
        <div className="space-y-6">
          <h2 className="text-white font-extrabold text-xl">Data & Privacy</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            {[
              { label: "Data Processing", desc: "We process your data in compliance with Indian data protection laws." },
              { label: "Data Storage", desc: "Your account and trading data is stored securely with AES-256 encryption." },
              { label: "Third-Party Sharing", desc: "We do not sell or share your personal data with third parties." },
              { label: "Data Deletion", desc: "You can request data deletion at any time by contacting support." },
            ].map(item => (
              <div key={item.label} className="border-b border-white/8 pb-4 last:border-0 last:pb-0">
                <div className="text-white font-semibold text-sm mb-1">{item.label}</div>
                <div className="text-white/55 text-sm">{item.desc}</div>
              </div>
            ))}
            <Button variant="outline" className="border-red-500/30 text-red-400 bg-red-500/5 hover:bg-red-500/10 rounded-xl mt-2">
              Request Data Deletion
            </Button>
          </div>
        </div>
      );

      case "withdrawal-details":
        return <WithdrawalDetailsSection />;

      case "settings": return (
        <div className="space-y-6">
          <h2 className="text-white font-extrabold text-xl">Settings</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-white font-bold">Profile</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: "Full Name", value: displayName, type: "text" },
                { label: "Email", value: displayEmail, type: "email" },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-white/50 text-xs font-semibold uppercase tracking-wider block mb-1.5">{f.label}</label>
                  <input defaultValue={f.value} type={f.type}
                    className="w-full bg-white/5 border border-white/15 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#4A00E0]/60" />
                </div>
              ))}
            </div>
            <Button className="bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white rounded-xl px-6">Save Changes</Button>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Appearance</h3>
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon size={18} className="text-purple-400" /> : <Sun size={18} className="text-amber-400" />}
                <div>
                  <span className="text-white/70 text-sm block">Theme</span>
                  <span className="text-white/40 text-xs">{darkMode ? "Dark mode" : "Light mode"}</span>
                </div>
              </div>
              <button onClick={() => setDarkMode(!darkMode)}
                className={`w-14 h-7 rounded-full relative cursor-pointer transition-colors ${darkMode ? "bg-[#4A00E0]" : "bg-amber-500"}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all flex items-center justify-center ${darkMode ? "left-8" : "left-1"}`}>
                  {darkMode ? <Moon size={10} className="text-[#4A00E0]" /> : <Sun size={10} className="text-amber-500" />}
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Language</h3>
            <div className="flex gap-3">
              {[
                { code: "en", label: "English", flag: "🇬🇧" },
                { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
              ].map(lang => (
                <button key={lang.code}
                  onClick={() => i18n.changeLanguage(lang.code)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${i18n.language === lang.code
                    ? "bg-[#4A00E0]/20 border-[#4A00E0]/40 text-white"
                    : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
                    }`}>
                  <span className="text-lg">{lang.flag}</span> {lang.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-bold mb-2">Notifications</h3>
            {notificationSettingItems.map(item => {
              const isOn = preferences[item.key];
              return (
                <div key={item.key} className="flex items-center justify-between py-2 border-b border-white/8 last:border-0">
                  <div className="space-y-1">
                    <span className="text-white/70 text-sm">{item.label}</span>
                    <span className="text-white/40 text-[11px]">{isOn ? "Enabled" : "Disabled"}</span>
                  </div>
                  <button onClick={() => updatePreferences({ [item.key]: !isOn })}
                    className={`w-11 h-6 rounded-full relative transition-colors ${isOn ? "bg-[#4A00E0]" : "bg-white/15"}`}>
                    <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${isOn ? "left-6" : "left-1"}`} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      );

      case "impact": {
        const imp = profile.impact;
        const BASE_LEADERBOARD = [
          { rank: 1, name: "Priya M.", amount: 5200, badge: "leader" },
          { rank: 2, name: "Arjun K.", amount: 3800, badge: "leader" },
          { rank: 3, name: "Sneha R.", amount: 2100, badge: "leader" },
          { rank: 4, name: "Ravi S.", amount: 980, badge: "contributor" },
          { rank: 5, name: "Deepak T.", amount: 750, badge: "contributor" },
        ];
        // Add current user only if they've donated and aren't already in the list
        const userEntry = imp.totalDonated > 0 && !BASE_LEADERBOARD.some(l => l.name === displayName)
          ? [{ rank: 0, name: displayName, amount: imp.totalDonated, badge: imp.badge }]
          : [];
        const IMPACT_LEADERBOARD = [...BASE_LEADERBOARD, ...userEntry]
          .sort((a, b) => b.amount - a.amount)
          .map((item, i) => ({ ...item, rank: i + 1 }));
        const userRank = IMPACT_LEADERBOARD.findIndex(l => l.name === displayName) + 1;

        const badgeInfo: Record<string, { label: string; color: string; bg: string }> = {
          none: { label: "No Badge", color: "text-white/40", bg: "bg-white/5" },
          supporter: { label: "🤝 Supporter", color: "text-blue-400", bg: "bg-blue-500/10" },
          contributor: { label: "⭐ Contributor", color: "text-purple-400", bg: "bg-purple-500/10" },
          leader: { label: "🏆 Impact Leader", color: "text-amber-400", bg: "bg-amber-500/10" },
        };
        const myBadge = badgeInfo[imp.badge];

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-white font-extrabold text-xl">Your Impact</h2>
                <p className="text-white/50 text-sm mt-1">FW Impact Initiative — Trade for Change, Profit with Purpose.</p>
              </div>
              <button onClick={() => setDonatePopup(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity">
                <Heart size={15} /> Donate Now
              </button>
            </div>

            <div className="bg-gradient-to-r from-pink-500/15 to-red-500/10 border border-pink-500/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${myBadge.bg} ${myBadge.color} border border-white/10`}>
                  {myBadge.label}
                </div>
                {imp.badge !== "none" && (
                  <span className="text-white/40 text-xs">Next: {imp.badge === "supporter" ? "₹100 for Contributor" : imp.badge === "contributor" ? "₹1,000 for Impact Leader" : "You're at the top!"}</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-2"><Heart className="mx-auto text-pink-400" size={28} /></div>
                  <div className="text-white font-extrabold text-2xl">{imp.mealsSupported}</div>
                  <div className="text-white/50 text-xs mt-1">Meals Provided</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-2"><BookOpen className="mx-auto text-blue-400" size={28} /></div>
                  <div className="text-white font-extrabold text-2xl">{imp.studentsSupported}</div>
                  <div className="text-white/50 text-xs mt-1">Education Supported</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-2"><DollarSign className="mx-auto text-green-400" size={28} /></div>
                  <div className="text-white font-extrabold text-2xl">₹{imp.totalDonated.toLocaleString("en-IN")}</div>
                  <div className="text-white/50 text-xs mt-1">Total Contribution</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2"><Award size={18} className="text-amber-400" /> Top Impact Traders</h3>
                {userRank > 0 && <span className="text-amber-400 text-sm font-bold">You are #{userRank} this week</span>}
              </div>
              <div className="space-y-2">
                {IMPACT_LEADERBOARD.map((t, i) => (
                  <div key={i} className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${t.name === displayName ? "bg-gradient-to-r from-pink-500/15 to-red-500/10 border border-pink-500/20" : "bg-white/3 hover:bg-white/5"}`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold text-sm w-6 ${i < 3 ? "text-amber-400" : "text-white/50"}`}>#{i + 1}</span>
                      <span className="text-white font-semibold text-sm">{t.name}</span>
                      {t.name === displayName && <span className="text-[10px] bg-pink-500/20 text-pink-400 px-2 py-0.5 rounded-full font-bold">You</span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${badgeInfo[t.badge]?.bg} ${badgeInfo[t.badge]?.color}`}>
                        {badgeInfo[t.badge]?.label}
                      </span>
                      <span className="text-green-400 font-bold text-sm">₹{t.amount.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2"><Share2 size={18} className="text-blue-400" /> Share Your Impact</h3>
              <p className="text-white/50 text-sm mb-4">Let the world know you trade with purpose!</p>
              <div className="flex gap-3 flex-wrap">
                {[
                  { label: "WhatsApp", color: "bg-green-600 hover:bg-green-700", icon: "💬" },
                  { label: "Instagram", color: "bg-pink-600 hover:bg-pink-700", icon: "📸" },
                  { label: "Telegram", color: "bg-blue-500 hover:bg-blue-600", icon: "✈️" },
                ].map(s => (
                  <button key={s.label} onClick={() => {
                    const msg = encodeURIComponent(`My trading profits helped support ${imp.mealsSupported} meals and ${imp.studentsSupported} students. Join FundedWealth's Impact Initiative! #FWImpact #TradeForChange`);
                    const url = s.label === "WhatsApp" ? `https://wa.me/?text=${msg}` : s.label === "Telegram" ? `https://t.me/share/url?text=${msg}` : "#";
                    window.open(url, "_blank");
                  }}
                    className={`${s.color} text-white font-bold text-sm px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors`}>
                    {s.icon} {s.label}
                  </button>
                ))}
              </div>
            </div>

            {imp.donations.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="px-6 py-3 border-b border-white/10">
                  <h3 className="text-white font-bold">Donation History</h3>
                </div>
                <div className="divide-y divide-white/5">
                  {imp.donations.map(d => (
                    <div key={d.id} className="px-6 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{d.cause === "animal" ? "Animal" : "Education"}</span>
                        <div>
                          <div className="text-white text-sm font-semibold">{d.cause === "animal" ? "Animal Feeding" : "Girls Education"}</div>
                          <div className="text-white/40 text-xs">{d.date}</div>
                        </div>
                      </div>
                      <span className="text-green-400 font-bold text-sm">₹{d.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/15 rounded-2xl p-6">
              <h3 className="text-white font-bold text-lg mb-2">Where Your Contributions Go</h3>
              <p className="text-white/50 text-sm mb-4">Every rupee makes a real difference across India.</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">🐶</div>
                  <div className="text-white font-bold text-sm mb-1">Animal Feeding Program</div>
                  <div className="text-white/50 text-xs">₹15 = 1 meal for a stray dog. We partner with local shelters and NGOs across 12 cities to provide daily meals.</div>
                  <div className="mt-3 text-amber-400 text-xs font-bold">This month: 1,240 meals provided</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="text-2xl mb-2">🎓</div>
                  <div className="text-white font-bold text-sm mb-1">Girls Education Initiative</div>
                  <div className="text-white/50 text-xs">₹200 = 1 month of school supplies. Supporting underprivileged girls in rural India with books, uniforms, and tuition.</div>
                  <div className="mt-3 text-amber-400 text-xs font-bold">This month: 85 students supported</div>
                </div>
              </div>
            </div>
          </div>
        );
      }

      case "kyc": return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-white text-xl sm:text-2xl font-extrabold">{t("kyc.title")}</h2>
              <p className="text-white/50 text-sm mt-1">{t("kyc.subtitle")}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${kycStatus.kycStatus === "approved" ? "bg-green-500/20 text-green-400" : kycStatus.kycStatus === "submitted" ? "bg-yellow-500/20 text-yellow-400" : kycStatus.kycStatus === "rejected" ? "bg-red-500/20 text-red-400" : "bg-white/10 text-white/50"}`}>
              {(kycStatus.kycStatus || "pending").charAt(0).toUpperCase() + (kycStatus.kycStatus || "pending").slice(1)}
            </span>
          </div>

          {kycStatus.kycStatus === "approved" ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 text-center">
              <CheckCircle size={48} className="text-green-400 mx-auto mb-3" />
              <h3 className="text-white text-lg font-bold">{t("kyc.approved")}</h3>
            </div>
          ) : kycStatus.kycStatus === "submitted" ? (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 text-center">
              <Clock size={48} className="text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white text-lg font-bold">{t("kyc.alreadySubmitted")}</h3>
            </div>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">{t("kyc.docType")}</label>
                  <select value={kycForm.documentType} onChange={e => setKycForm(f => ({ ...f, documentType: e.target.value }))}
                    className="w-full bg-[#0D001A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4A00E0] outline-none">
                    <option value="aadhaar">{t("kyc.aadhaar")}</option>
                    <option value="pan">{t("kyc.pan")}</option>
                    <option value="passport">{t("kyc.passport")}</option>
                    <option value="voter_id">{t("kyc.voterID")}</option>
                    <option value="driving_license">{t("kyc.drivingLicense")}</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">{t("kyc.docNumber")}</label>
                  <input value={kycForm.documentNumber} onChange={e => setKycForm(f => ({ ...f, documentNumber: e.target.value }))}
                    className="w-full bg-[#0D001A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4A00E0] outline-none" placeholder="XXXX XXXX XXXX" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">{t("kyc.fullName")}</label>
                  <input value={kycForm.fullName} onChange={e => setKycForm(f => ({ ...f, fullName: e.target.value }))}
                    className="w-full bg-[#0D001A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4A00E0] outline-none" />
                </div>
                <div>
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">{t("kyc.dob")}</label>
                  <input type="date" value={kycForm.dateOfBirth} onChange={e => setKycForm(f => ({ ...f, dateOfBirth: e.target.value }))}
                    className="w-full bg-[#0D001A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4A00E0] outline-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-white/60 text-xs font-semibold mb-1.5 block">{t("kyc.address")}</label>
                  <textarea value={kycForm.address} onChange={e => setKycForm(f => ({ ...f, address: e.target.value }))}
                    className="w-full bg-[#0D001A] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#4A00E0] outline-none resize-none" rows={3} />
                </div>
              </div>
              {kycMsg && <div className={`mt-4 text-sm rounded-xl px-4 py-3 ${kycMsg.includes("success") ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>{kycMsg}</div>}
              <Button onClick={submitKyc} disabled={kycSubmitting}
                className="mt-5 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold rounded-xl h-11 px-4 md:px-6 lg:px-8 xl:px-10 hover:opacity-90 disabled:opacity-50">
                {kycSubmitting ? t("kyc.uploading") : t("kyc.submit")}
              </Button>
            </div>
          )}

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h3 className="text-white font-bold text-sm mb-3">Why KYC?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <Shield size={20} className="text-[#4A00E0] flex-shrink-0 mt-0.5" />
                <div><div className="text-white text-xs font-semibold">Secure Payouts</div><div className="text-white/40 text-[11px]">Required to process withdrawals above ₹5,000</div></div>
              </div>
              <div className="flex items-start gap-3">
                <Award size={20} className="text-[#D63384] flex-shrink-0 mt-0.5" />
                <div><div className="text-white text-xs font-semibold">Higher Limits</div><div className="text-white/40 text-[11px]">Unlock ₹25L & ₹50L account sizes</div></div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
                <div><div className="text-white text-xs font-semibold">Fast Review</div><div className="text-white/40 text-[11px]">Verification completed within 24-48 hours</div></div>
              </div>
            </div>
          </div>
        </div>
      );

      default: return null;
    }
  };

  const handleDonate = async () => {
    const finalAmt = customAmt ? parseInt(customAmt) : donateAmt;
    if (finalAmt <= 0) return;

    try {
      // 1. Create Razorpay order via backend
      const apiBase = import.meta.env.VITE_API_URL || "";
      const orderRes = await fetch(`${apiBase}/api/razorpay/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          amount: finalAmt,
          payment_type: "donation",
          planType: "donation",
          sizeIndex: 0,
          metadata: {
            donorName: displayName,
            donorEmail: displayEmail,
            donorCity: "",
            category: donateCause,
          },
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.success) {
        alert(orderData.message || "Failed to create payment order. Please try again.");
        return;
      }

      // 2. Open Razorpay checkout
      const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID || "";
      if (!razorpayKeyId) {
        alert("Payment gateway not configured. Please contact support.");
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount: orderData.order.amount,
        currency: orderData.order.currency || "INR",
        name: "FundedWealth Impact",
        description: `Donation - ${donateCause === "animal" ? "Animal Feeding" : "Girls Education"}`,
        image: "/logo.png",
        order_id: orderData.order.id,
        handler: async (response: any) => {
          // 3. Verify payment
          try {
            const verifyRes = await fetch(`${apiBase}/api/razorpay/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                payment_type: "donation",
                planType: "donation",
                sizeIndex: 0,
                amount: finalAmt,
                metadata: {
                  donorName: displayName,
                  donorEmail: displayEmail,
                  category: donateCause,
                },
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              donate(donateCause, finalAmt);
              setDonatePopup(false);
              setCustomAmt("");
              setDonateAmt(50);
              alert("Thank you for your donation! 🙏");
            } else {
              alert("Payment verification failed. Contact support if amount was deducted.");
            }
          } catch {
            alert("Payment verification error. Contact support.");
          }
        },
        prefill: {
          name: displayName,
          email: displayEmail,
        },
        theme: {
          color: "#4A00E0",
        },
        modal: {
          ondismiss: () => {
            // User closed Razorpay modal without paying
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Donation payment error:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      {donatePopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setDonatePopup(false)} />
          <div className="relative bg-[#1A0030] border border-white/15 rounded-2xl p-6 w-full max-w-md shadow-2xl z-10">
            <button onClick={() => setDonatePopup(false)} className="absolute top-4 right-4 text-white/40 hover:text-white">
              <X size={20} />
            </button>

            <div className="text-center mb-6">
              <div className="text-4xl mb-2">❤️</div>
              <h3 className="text-white font-extrabold text-xl">Make Your Profit More Meaningful</h3>
              <p className="text-white/50 text-sm mt-1">Support real causes across India with a small contribution.</p>
            </div>

            <div className="mb-5">
              <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Select Cause</div>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setDonateCause("animal")}
                  className={`p-3 rounded-xl border text-center transition-all ${donateCause === "animal" ? "border-pink-500/50 bg-pink-500/15 text-white" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}>
                  <div className="text-2xl mb-1">🐶</div>
                  <div className="text-sm font-bold">Animal Feeding</div>
                </button>
                <button onClick={() => setDonateCause("education")}
                  className={`p-3 rounded-xl border text-center transition-all ${donateCause === "education" ? "border-pink-500/50 bg-pink-500/15 text-white" : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"}`}>
                  <div className="text-2xl mb-1">🎓</div>
                  <div className="text-sm font-bold">Girls Education</div>
                </button>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-2">Select Amount</div>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[10, 50, 100, 500].map(a => (
                  <button key={a} onClick={() => { setDonateAmt(a); setCustomAmt(""); }}
                    className={`py-2.5 rounded-xl text-sm font-bold transition-all ${!customAmt && donateAmt === a ? "bg-gradient-to-r from-pink-600 to-red-500 text-white" : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"}`}>
                    ₹{a}
                  </button>
                ))}
              </div>
              <input type="number" placeholder="Custom amount (₹)" value={customAmt}
                onChange={e => { setCustomAmt(e.target.value); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-pink-500/50" />
            </div>

            <div className="flex gap-3">
              <button onClick={handleDonate}
                className="flex-1 bg-gradient-to-r from-pink-600 to-red-500 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                <Heart size={15} /> Donate ₹{customAmt || donateAmt}
              </button>
              <button onClick={() => setDonatePopup(false)}
                className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-white/50 text-sm font-medium hover:bg-white/10 transition-colors">
                Skip
              </button>
            </div>

            <p className="text-white/30 text-[10px] text-center mt-3">Donation is completely voluntary. No automatic deductions.</p>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-[#0D001A] overflow-hidden font-sans">
        <div className="hidden lg:block flex-shrink-0">
          <div className="h-full">{sidebarContent()}</div>
        </div>
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-10 w-72 h-full">{sidebarContent(true)}</div>
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0A0018]/80 backdrop-blur-sm flex-shrink-0">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
                <Menu size={22} />
              </button>
              <div className="hidden lg:flex items-center gap-1 text-white/40 text-sm">
                <span className="text-white/60">Dashboard</span>
                {section !== "home" && <><ChevronRight size={14} /><span className="text-white capitalize">{section}</span></>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-lg px-1.5 py-1">
                <button onClick={() => switchLang("en")} className={`text-xs px-2 py-1 rounded ${i18n.language === "en" ? "bg-white/15 text-white font-bold" : "text-white/50"}`}>EN</button>
                <button onClick={() => switchLang("hi")} className={`text-xs px-2 py-1 rounded ${i18n.language === "hi" ? "bg-white/15 text-white font-bold" : "text-white/50"}`}>हि</button>
              </div>
              <div className="relative" ref={notifRef}>
                <button onClick={() => setNotifOpen(!notifOpen)} className="relative text-white/50 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5">
                  <Bell size={18} />
                  {unreadCount > 0 && <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#FF8A3D] rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">{unreadCount}</span>}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-80 max-w-sm max-h-96 overflow-y-auto bg-[#150025] border border-white/10 rounded-2xl shadow-2xl z-50">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <div>
                        <div className="text-white font-bold text-sm">{t("dashboard.notifications")}</div>
                        <div className="text-[11px] text-white/40">{realtimeStatus === "connected" ? "Live updates" : realtimeStatus === "connecting" ? "Connecting..." : "Polling updates"}</div>
                      </div>
                      <button onClick={markAllRead} className="text-xs text-fw-orange hover:underline">{t("dashboard.markAllRead")}</button>
                    </div>
                    <div className="grid grid-cols-3 gap-2 p-3 border-b border-white/10">
                      {(["all", "System", "Payout", "Trading", "Challenges", "Referral"] as const).map((filter) => (
                        <button key={filter} onClick={() => setNotificationFilter(filter)}
                          className={`text-[11px] px-2 py-1 rounded-full ${notificationFilter === filter ? "bg-white/10 text-white" : "bg-white/5 text-white/50 hover:bg-white/10"}`}>
                          {filter === "all" ? "All" : filter}
                        </button>
                      ))}
                    </div>
                    {notificationsLoading && (
                      <div className="px-4 py-3 text-white/40 text-xs border-b border-white/10">Loading latest notifications…</div>
                    )}
                    {notifications.filter(n => notificationFilter === "all" || n.category === notificationFilter).length === 0 ? (
                      <div className="p-6 text-center text-white/40 text-sm">{t("dashboard.noNotifications")}</div>
                    ) : notifications.filter(n => notificationFilter === "all" || n.category === notificationFilter).map(n => (
                      <button key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors ${!n.isRead ? "bg-white/3" : ""}`}>
                        <div className="flex items-start gap-2">
                          <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.isRead ? "bg-fw-orange" : "bg-transparent"}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-white text-xs font-semibold truncate">{n.title}</span>
                              {n.priority === "critical" && <span className="text-[10px] uppercase tracking-wider text-red-400">Critical</span>}
                            </div>
                            <div className="text-white/50 text-xs mt-1 line-clamp-2">{n.message}</div>
                            <div className="text-white/30 text-[10px] mt-1">{new Date(n.createdAt).toLocaleDateString()}</div>
                          </div>
                          <button type="button" onClick={(event) => { event.stopPropagation(); deleteNotification(n.id); }}
                            className="text-[11px] text-white/40 hover:text-white/75 self-start ml-2">
                            Delete
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-xl px-3 py-2 cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => setSection("settings")}>
                {user?.imageUrl ? (
                  <img src={user.imageUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4A00E0] to-[#D63384] flex items-center justify-center text-white font-bold text-xs">
                    {avatarInitial}
                  </div>
                )}
                <div className="hidden md:block">
                  <div className="text-white text-xs font-semibold leading-none">{displayName}</div>
                  <div className="text-white/40 text-[10px] mt-0.5">{displayEmail}</div>
                </div>
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-5 md:p-7 pb-20 lg:pb-7">
            {renderContent()}
          </main>
        </div>
      </div>

      {/* ── Mobile Bottom Navigation ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0A0018]/95 backdrop-blur-md border-t border-white/10 px-2 py-2 safe-area-pb">
        <div className="flex items-center justify-around">
          {[
            { id: "home" as Section, icon: <Home size={20} />, label: "Home" },
            { id: "accounts" as Section, icon: <BarChart2 size={20} />, label: "Accounts" },
            { id: "payouts" as Section, icon: <DollarSign size={20} />, label: "Payouts" },
            { id: "kyc" as Section, icon: <FileText size={20} />, label: "KYC" },
            { id: "settings" as Section, icon: <Settings size={20} />, label: "More" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors min-w-[52px] ${section === item.id
                ? "text-white bg-white/10"
                : "text-white/40 hover:text-white/70"
                }`}
            >
              {item.icon}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}

