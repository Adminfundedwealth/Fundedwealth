import { useState } from "react";
import {
  Monitor, ChevronRight, XCircle, Shield, Copy, Download,
} from "lucide-react";
import { useTerminalLaunch } from "@/hooks/useTerminalLaunch";

export type TradingAccount = {
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

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

const pnlColor = (v: number) => v >= 0 ? "text-green-400" : "text-red-400";

export function AccountCard({ acc }: { acc: TradingAccount }) {
  const pnl = acc.balance - acc.startBalance;
  const pnlPct = (pnl / acc.startBalance) * 100;
  const profitDenom = acc.profitTarget === 0 ? 1 : (acc.profitTarget ?? 1);
  const progressPct = Math.min((pnlPct / profitDenom) * 100, 100);
  const phaseColor = {
    flash: "text-[#FF8A3D]",
    challenge: "text-amber-400",
    verification: "text-blue-400",
    funded: "text-green-400",
  }[acc.phase] ?? "text-amber-400";
  const phaseLabel = {
    flash: "Flash Funded",
    challenge: "Challenge",
    verification: "Verification",
    funded: "Funded",
  }[acc.phase] ?? "Challenge";

  const [copied, setCopied] = useState<string | null>(null);
  const [showCreds, setShowCreds] = useState(false);

  // ── THE ONE terminal launch hook ──────────────────────────────────────────
  const { launching, launchError, launchTerminal } = useTerminalLaunch();

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

      {/* Monetary left values for quick glance */}
      <div className="flex items-center justify-between text-xs text-white/50 mb-3">
        <div>Daily Left</div>
        <div className="font-bold text-white">{fmt(Math.max(0, Math.round(acc.startBalance * (acc.dailyLoss / 100))))} — {acc.dailyLoss}%</div>
      </div>
      <div className="flex items-center justify-between text-xs text-white/50 mb-2">
        <div>DD Left</div>
        <div className="font-bold text-white">{fmt(Math.max(0, Math.round(acc.startBalance * (acc.maxLoss / 100))))} — {acc.maxLoss}%</div>
      </div>

      {/* Progress bars */}
      <div className="space-y-3 mb-4">
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

      {/* Credentials panel */}
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

            {/* Terminal Password */}
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
              {/* THE ONE Launch Terminal button — calls useTerminalLaunch */}
              <button
                onClick={() => launchTerminal(acc.id)}
                disabled={launching || !(acc as any).canLaunch}
                className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#4A00E0] to-[#D63384] text-white font-bold py-2 px-3 rounded-xl text-xs hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={(acc as any).canLaunch ? "Open trading terminal" : "Account must be active to launch"}
              >
                {launching
                  ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <Monitor size={13} />
                }
                {launching ? "Launching…" : "Launch Terminal"}
              </button>

              {/* Copy all */}
              <button
                onClick={() => {
                  const text = [
                    `Account Code: ${acc.accountCode}`,
                    `Login Email: ${(acc as any).loginEmail || "—"}`,
                    ((acc as any).terminalPassword || (acc as any).tempPassword)
                      ? `Password: ${(acc as any).terminalPassword || (acc as any).tempPassword}`
                      : "Password: Reset at fundedwealth.com/sign-in",
                    `Challenge: ${phaseLabel}`,
                    `Size: ₹${acc.size.toLocaleString("en-IN")}`,
                  ].join("\n");
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
        <span>{acc.tradeCount > 0 ? `${acc.tradeCount} trades` : "No trades yet"}</span>
      </div>
    </div>
  );
}
