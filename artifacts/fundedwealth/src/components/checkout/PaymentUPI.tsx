import React from "react";
import { CheckCircle2, Copy, Info, ArrowDown } from "lucide-react";
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
  utrPendingOrderId?: string | null;
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
  utrPendingOrderId,
  handleVerifyUtr,
  onCancel,
}: PaymentUPIProps) => {
  const utrReady = utrInput.length >= 10 && utrStatus === "idle";
  const utrIdle = utrStatus !== "verifying" && utrStatus !== "success" && utrStatus !== "pending";

  return (
    <div className="relative grid lg:grid-cols-[auto_1fr] gap-6 items-start">
      {/* ── Left: QR code column ── */}
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

      {/* ── Right: details + UTR column ── */}
      <div className="space-y-3">
        {/* UPI ID copy */}
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

        {/* Amount copy */}
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

        {/* Exact amount warning */}
        <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-2">
          <Info size={14} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-xs">
            Pay <strong>EXACT amount</strong> (including decimals). Wrong amount = payment will fail.
          </p>
        </div>

        {/* ── "Paid? Do this next" call-to-action banner ── */}
        {utrIdle && utrStatus !== "success" && (
          <div
            className="rounded-xl bg-emerald-500/10 border border-emerald-400/40 p-3 flex items-center gap-3"
            style={{ animation: "fw-glow-pulse 2.5s ease-in-out infinite" }}
          >
            {/* animated bouncing arrow */}
            <span className="shrink-0 flex flex-col items-center gap-0.5">
              <ArrowDown size={18} className="text-emerald-400 animate-bounce" />
            </span>
            <p className="text-emerald-300 text-sm font-semibold leading-snug">
              Paid? Fill in your UTR number below &amp; click <span className="text-white font-extrabold">Verify</span> to confirm your payment.
            </p>
          </div>
        )}

        {/* keyframe injected once — lightweight, no Tailwind config change needed */}
        <style>{`
          @keyframes fw-glow-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); border-color: rgba(52,211,153,0.4); }
            50%       { box-shadow: 0 0 14px 2px rgba(52,211,153,0.25); border-color: rgba(52,211,153,0.75); }
          }
        `}</style>

        {/* ── UTR section ── */}
        <div className={`pt-4 border-t mt-4 transition-colors duration-300 ${utrReady ? "border-emerald-500/40" : "border-white/10"}`}>
          {/* Step label */}
          <div className="flex items-center gap-2 mb-3">
            <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-extrabold shrink-0 ${utrReady ? "bg-emerald-500 text-white" : "bg-white/10 text-white/50"}`}>
              2
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest ${utrReady ? "text-emerald-400" : "text-white/40"}`}>
              Enter Reference Number (UTR) &amp; Verify
            </span>
          </div>

          <div className="flex gap-2">
            {/* Input — glows when focused and ready */}
            <div className={`flex-1 relative rounded-lg transition-all duration-300 ${utrReady ? "ring-2 ring-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.25)]" : utrInput.length > 0 ? "ring-1 ring-[#8E2DE2]/50" : ""}`}>
              <Input
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                placeholder="Enter 10-12 digit UTR number"
                className="bg-black/30 border-white/10 text-white placeholder:text-white/30 font-mono w-full"
                disabled={!utrIdle}
              />
            </div>

            {/* Verify button — pulses when ready */}
            <Button
              onClick={handleVerifyUtr}
              disabled={!utrIdle || utrInput.length < 10}
              className={`font-bold px-6 min-w-[90px] transition-all duration-300 ${
                utrReady
                  ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] animate-pulse"
                  : "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white"
              }`}
            >
              {utrStatus === "verifying"
                ? <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full border-2 border-white/40 border-t-white animate-spin inline-block" />Checking</span>
                : utrStatus === "success"
                ? "✓ Verified"
                : utrStatus === "pending"
                ? "Pending…"
                : "Verify"}
            </Button>
          </div>

          {/* Hint text below input */}
          {utrIdle && utrInput.length === 0 && (
            <p className="text-white/35 text-[11px] mt-2 leading-snug">
              After paying, open your UPI app → check the transaction receipt → copy the 10–12 digit UTR / Reference No. and paste it above.
            </p>
          )}
          {utrIdle && utrInput.length > 0 && utrInput.length < 10 && (
            <p className="text-amber-400/80 text-[11px] mt-2">UTR must be at least 10 digits</p>
          )}
          {utrError && <p className="text-red-400 text-xs mt-2">{utrError}</p>}
          {utrStatus === "pending" && !utrError && (
            <p className="text-amber-400 text-xs mt-2">
              Payment received — your account is being set up.{" "}
              {utrPendingOrderId ? (
                <a
                  href={`/payment-pending?orderId=${encodeURIComponent(utrPendingOrderId)}&method=upi`}
                  className="underline hover:text-amber-300"
                >
                  Track provisioning status →
                </a>
              ) : (
                "Please wait a moment and try again."
              )}
            </p>
          )}
          {utrStatus === "success" && (
            <p className="text-emerald-400 text-xs mt-2">Payment verified! Redirecting to your dashboard…</p>
          )}
        </div>

        <div className="text-center pt-2">
          <button onClick={onCancel} className="text-red-400 hover:text-red-300 text-xs font-semibold">Cancel Payment</button>
        </div>
      </div>
    </div>
  );
};
