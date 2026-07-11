import { DollarSign, CheckCircle, Clock, Award } from "lucide-react";

const fmt = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

interface Payout {
  id: string;
  date: string;
  amount: number;
  method: string;
  accountId: string;
  status: string;
}

interface Account {
  phase: string;
  tradeCount: number;
}

interface Props {
  displayName: string;
  totalPayout: number;
  payouts: Payout[];
  accounts: Account[];
}

export function PayoutsSection({ displayName, totalPayout, payouts, accounts }: Props) {
  const downloadCertificate = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200; canvas.height = 800;
    const ctx = canvas.getContext("2d")!;
    const grd = ctx.createLinearGradient(0, 0, 1200, 800);
    grd.addColorStop(0, "#1A0030"); grd.addColorStop(1, "#0D0020");
    ctx.fillStyle = grd; ctx.fillRect(0, 0, 1200, 800);
    ctx.strokeStyle = "rgba(74,0,224,0.4)"; ctx.lineWidth = 4; ctx.strokeRect(30, 30, 1140, 740);
    ctx.strokeStyle = "rgba(214,51,132,0.3)"; ctx.lineWidth = 2; ctx.strokeRect(45, 45, 1110, 710);
    ctx.textAlign = "center";
    ctx.fillStyle = "#FF8A3D"; ctx.font = "bold 16px sans-serif"; ctx.fillText("FUNDEDWEALTH", 600, 100);
    ctx.fillStyle = "#ffffff"; ctx.font = "bold 42px serif"; ctx.fillText("Funded Trader Certificate", 600, 170);
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "18px sans-serif"; ctx.fillText("This certifies that", 600, 240);
    ctx.fillStyle = "#FF8A3D"; ctx.font = "bold 36px serif"; ctx.fillText(displayName, 600, 300);
    ctx.fillStyle = "rgba(255,255,255,0.6)"; ctx.font = "18px sans-serif";
    ctx.fillText("has successfully completed the FundedWealth Trading Challenge", 600, 360);
    ctx.fillText("and is now a verified Funded Trader", 600, 395);
    ctx.fillStyle = "#22c55e"; ctx.font = "bold 48px sans-serif"; ctx.fillText(fmt(totalPayout), 600, 480);
    ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "16px sans-serif"; ctx.fillText("Total Payouts Earned", 600, 515);
    ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "14px sans-serif";
    ctx.fillText(`Accounts: ${accounts.length} | Total Trades: ${accounts.reduce((s, a) => s + a.tradeCount, 0)}`, 600, 570);
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "12px sans-serif";
    ctx.fillText(`Issued on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} | fundedwealth.com`, 600, 720);
    ctx.fillStyle = "rgba(74,0,224,0.15)"; ctx.font = "bold 120px sans-serif"; ctx.fillText("FW", 600, 660);
    const link = document.createElement("a");
    link.download = `FundedWealth_Certificate_${displayName.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png"); link.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-white font-extrabold text-xl">Payouts</h2>
        <div className="flex items-center gap-3">
          {accounts.some(a => a.phase === "funded") && (
            <button onClick={downloadCertificate} className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 transition-opacity">
              <Award size={14} /> Download Certificate
            </button>
          )}
          <div className="bg-[#FF8A3D]/15 border border-[#FF8A3D]/25 rounded-xl px-4 py-2">
            <span className="text-[#FF8A3D] font-bold text-sm">Total: {fmt(totalPayout)}</span>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Total Earned", value: fmt(totalPayout), icon: DollarSign, color: "text-green-400" },
          { label: "Completed", value: String(payouts.filter(p => p.status === "completed").length), icon: CheckCircle, color: "text-green-400" },
          { label: "Pending", value: String(payouts.filter(p => p.status === "pending").length), icon: Clock, color: "text-amber-400" },
        ].map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center"><s.icon size={18} className={s.color} /></div>
            <div><div className="text-white/50 text-xs mb-0.5">{s.label}</div><div className={`font-bold text-xl ${s.color}`}>{s.value}</div></div>
          </div>
        ))}
      </div>

      {payouts.length === 0 ? (
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
            {payouts.map(p => (
              <div key={p.id} className="grid grid-cols-5 gap-4 px-6 py-4 border-b border-white/5 hover:bg-white/[0.03] transition-colors items-center">
                <span className="text-white/70 text-sm">{p.date}</span>
                <span className="text-green-400 font-bold">{fmt(p.amount)}</span>
                <span className="text-white/70 text-sm">{p.method}</span>
                <span className="text-white/50 text-xs font-mono">{p.accountId}</span>
                <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${p.status === "completed" ? "bg-green-500/15 text-green-400 border border-green-500/25" : "bg-amber-500/15 text-amber-400 border border-amber-500/25"}`}>
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
