import React from "react";
import { ShieldCheck, CheckCircle2, Lock } from "lucide-react";

interface PaymentSidebarProps {
  finalTotal: number;
  origNum: number;
  productName: string;
  couponDiscount: number;
  appliedCoupon: string;
}

export const PaymentSidebar = ({
  finalTotal,
  origNum,
  productName,
  couponDiscount,
  appliedCoupon,
}: PaymentSidebarProps) => (
  <aside className="relative">
    <div className="bg-gradient-to-b from-[#0c0735] to-[#07021a] border border-white/10 rounded-2xl p-6 sticky top-24 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-30" style={{
        background: "radial-gradient(600px circle at 20% 0%, rgba(142,45,226,0.25), transparent 40%)",
      }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-5">
          <img src="/logo.png" alt="FundedWealth" className="h-9 w-9 rounded-lg" />
          <div>
            <div className="text-white font-extrabold leading-none">FundedWealth</div>
            <div className="text-white/40 text-[10px] mt-1 tracking-wider uppercase">Trader Funding · India</div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 mb-6 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
          <ShieldCheck size={12} className="text-emerald-400" />
          <span className="text-emerald-400 text-[10px] font-bold tracking-wide">VERIFIED MERCHANT</span>
        </div>

        <div className="text-white/40 text-[10px] uppercase tracking-widest mb-2">Amount to Pay</div>
        <div className="flex items-baseline gap-2 mb-1">
          <div className="text-white text-3xl font-extrabold leading-none">₹{finalTotal.toLocaleString("en-IN")}</div>
          <span className="text-white/40 text-xs">INR</span>
        </div>
        {origNum > finalTotal && (
          <div className="text-white/40 text-xs line-through">₹{origNum.toLocaleString("en-IN")}</div>
        )}

        <div className="my-5 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

        <div className="space-y-3 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-[#4A00E0]/20 border border-[#8E2DE2]/30 flex items-center justify-center shrink-0">
              <Lock size={13} className="text-[#c79bff]" />
            </div>
            <div>
              <div className="text-white text-xs font-semibold">Secure Payment</div>
              <div className="text-white/40 text-[10px]">256-bit SSL Encrypted</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <CheckCircle2 size={13} className="text-emerald-400" />
            </div>
            <div>
              <div className="text-white text-xs font-semibold">Instant Verification</div>
              <div className="text-white/40 text-[10px]">Auto confirmation</div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-3 mb-4">
          <div className="text-white text-xs font-semibold">{productName}</div>
          {couponDiscount > 0 && (
            <div className="text-emerald-400 text-[10px] mt-1">{appliedCoupon} · {couponDiscount}% off applied</div>
          )}
        </div>

        <div className="text-center text-white/30 text-[10px] tracking-wider">
          POWERED BY <span className="text-white/60 font-bold">FW PAYMENTS</span>
        </div>
      </div>
    </div>
  </aside>
);
