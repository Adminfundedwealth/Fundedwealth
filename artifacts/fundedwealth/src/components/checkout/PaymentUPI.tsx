import React from "react";
import { CheckCircle2, Copy, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PaymentUPIProps {
  paySecondsLeft: number;
  fmtTimer: (s: number) => string;
  qrSrc: string;
  FW_MERCHANT_NAME: string;
  FW_UPI_ID: string;
  finalTotal: number;
  copiedField: string | null;
  copyToField: (field: string, value: string) => void;
  utrInput: string;
  setUtrInput: (v: string) => void;
  utrStatus: string;
  utrError: string;
  handleVerifyUtr: () => void;
  onCancel: () => void;
}

export const PaymentUPI = ({
  paySecondsLeft,
  fmtTimer,
  qrSrc,
  FW_MERCHANT_NAME,
  FW_UPI_ID,
  finalTotal,
  copiedField,
  copyToField,
  utrInput,
  setUtrInput,
  utrStatus,
  utrError,
  handleVerifyUtr,
  onCancel,
}: PaymentUPIProps) => (
  <div className="relative grid lg:grid-cols-[auto_1fr] gap-6 items-start">
    <div className="flex flex-col items-center">
      <div className={`inline-flex items-center gap-1.5 mb-3 px-3 py-1.5 rounded-full text-xs font-bold ${paySecondsLeft < 120 ? "bg-red-500/15 text-red-400 border border-red-500/30" : "bg-amber-500/10 text-amber-300 border border-amber-500/30"}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        <span>Expires in {fmtTimer(paySecondsLeft)}</span>
      </div>

      <div className="relative bg-white p-4 rounded-2xl shadow-[0_0_60px_rgba(142,45,226,0.25)]">
        <img src={qrSrc} alt="UPI QR" width={240} height={240} className="rounded-md" />
        <div className="absolute inset-0 pointer-events-none rounded-2xl ring-1 ring-[#8E2DE2]/30" />
      </div>

      <div className="mt-3 text-center text-white/50 text-[10px] uppercase tracking-widest">Paying to merchant</div>
      <div className="mt-1 text-white font-bold text-sm flex items-center gap-2">
        {FW_MERCHANT_NAME} <CheckCircle2 size={14} className="text-emerald-400" />
      </div>
    </div>

    <div className="space-y-3">
      <button
        onClick={() => copyToField("upi", FW_UPI_ID)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/30 border border-white/10 hover:border-white/30 transition-colors"
      >
        <div className="text-left min-w-0">
          <div className="text-white/40 text-[10px] uppercase tracking-wider">UPI ID</div>
          <div className="text-white font-mono text-sm truncate">{FW_UPI_ID}</div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${copiedField === "upi" ? "bg-emerald-500/20 text-emerald-400" : "bg-[#4A00E0]/20 text-[#c79bff] hover:bg-[#4A00E0]/30"}`}>
          <Copy size={12} className="inline mr-1" />{copiedField === "upi" ? "Copied" : "Copy"}
        </span>
      </button>

      <button
        onClick={() => copyToField("amt", String(finalTotal))}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-black/30 border border-white/10 hover:border-white/30 transition-colors"
      >
        <div className="text-left">
          <div className="text-white/40 text-[10px] uppercase tracking-wider">Amount</div>
          <div className="text-white font-bold text-sm">₹{finalTotal.toLocaleString("en-IN")}</div>
        </div>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${copiedField === "amt" ? "bg-emerald-500/20 text-emerald-400" : "bg-[#4A00E0]/20 text-[#c79bff] hover:bg-[#4A00E0]/30"}`}>
          <Copy size={12} className="inline mr-1" />{copiedField === "amt" ? "Copied" : "Copy"}
        </span>
      </button>

      <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-2">
        <Info size={14} className="text-red-400 shrink-0 mt-0.5" />
        <p className="text-red-300 text-xs">
          Pay <strong>EXACT amount</strong> (including decimals). Wrong amount = payment will fail.
        </p>
      </div>

      <div className="pt-4 border-t border-white/10 mt-4">
        <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Reference Number (UTR)</div>
        <div className="flex gap-2">
          <Input
            value={utrInput}
            onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
            placeholder="Enter 10-12 digit UTR"
            className="bg-black/30 border-white/10 text-white placeholder:text-white/30 font-mono"
            disabled={utrStatus === "verifying" || utrStatus === "success"}
          />
          <Button
            onClick={handleVerifyUtr}
            disabled={utrStatus === "verifying" || utrStatus === "success" || utrInput.length < 10}
            className="bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold px-6"
          >
            {utrStatus === "verifying" ? "..." : utrStatus === "success" ? "Verified" : "Verify"}
          </Button>
        </div>
        {utrError && <p className="text-red-400 text-xs mt-2">{utrError}</p>}
      </div>

      <div className="text-center pt-2">
        <button onClick={onCancel} className="text-red-400 hover:text-red-300 text-xs font-semibold">Cancel Payment</button>
      </div>
    </div>
  </div>
);
