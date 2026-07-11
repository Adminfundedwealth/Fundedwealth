import {
  TrendingUp, Wallet, BarChart2, Trophy, LifeBuoy,
  Heart, Award, Users, BookOpen, Plus, ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Section } from "./types";

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

interface Props {
  displayName: string;
  accounts: any[];
  totalPayout: number;
  setSection: (s: Section) => void;
}

export function OverviewSection({ displayName, accounts, totalPayout, setSection }: Props) {
  return (
    <div className="space-y-6">
      <div className="relative bg-gradient-to-r from-[#4A00E0] via-[#7B30FF] to-[#D63384] rounded-2xl p-8 overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-white text-2xl font-extrabold mb-1">Welcome back, {displayName}! 👋</h2>
          {accounts.length === 0 ? (
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
              <p className="text-white/80 text-sm mb-5">You have {accounts.length} active account{accounts.length > 1 ? "s" : ""}. Keep it up!</p>
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

      {accounts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total P&L", value: fmt(accounts.reduce((s: number, a: any) => s + (a.balance - a.startBalance), 0)), icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Total Payouts", value: fmt(totalPayout), icon: Wallet, color: "text-[#FF8A3D]", bg: "bg-[#FF8A3D]/10" },
            { label: "Active Accounts", value: String(accounts.filter((a: any) => a.status === "active").length), icon: BarChart2, color: "text-blue-400", bg: "bg-blue-500/10" },
            { label: "Avg Win Rate", value: `${Math.round(accounts.reduce((s: number, a: any) => s + a.winRate, 0) / accounts.length)}%`, icon: Trophy, color: "text-purple-400", bg: "bg-purple-500/10" },
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <a href="/championship" className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center"><Trophy size={18} className="text-amber-400" /></div>
          <div><div className="text-white font-semibold text-sm group-hover:text-amber-300 transition-colors">Championship</div><div className="text-white/40 text-[11px]">Win prizes</div></div>
        </a>
        <a href="/rules" className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><BookOpen size={18} className="text-blue-400" /></div>
          <div><div className="text-white font-semibold text-sm group-hover:text-blue-300 transition-colors">Rules</div><div className="text-white/40 text-[11px]">Trading rules</div></div>
        </a>
        <a href="/faq" className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center"><LifeBuoy size={18} className="text-purple-400" /></div>
          <div><div className="text-white font-semibold text-sm group-hover:text-purple-300 transition-colors">FAQ</div><div className="text-white/40 text-[11px]">Common questions</div></div>
        </a>
        <button onClick={() => setSection("affiliate")} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group text-left">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center"><Users size={18} className="text-green-400" /></div>
          <div><div className="text-white font-semibold text-sm group-hover:text-green-300 transition-colors">Affiliate</div><div className="text-white/40 text-[11px]">Earn commissions</div></div>
        </button>
        <button onClick={() => setSection("payouts")} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group text-left">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center"><Award size={18} className="text-pink-400" /></div>
          <div><div className="text-white font-semibold text-sm group-hover:text-pink-300 transition-colors">Certificates</div><div className="text-white/40 text-[11px]">Download proof</div></div>
        </button>
        <button onClick={() => setSection("impact")} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/10 transition-colors group text-left">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center"><Heart size={18} className="text-red-400" /></div>
          <div><div className="text-white font-semibold text-sm group-hover:text-red-300 transition-colors">FW Impact</div><div className="text-white/40 text-[11px]">Trade for change</div></div>
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
                  className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform`}>{s.label}</a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
