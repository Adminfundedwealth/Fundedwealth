import React from "react";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { PlanConfig } from "../../config/checkout";

interface CheckoutSummaryProps {
  productName: string;
  size: { origFee: string; fee: number; discFee: string; popular?: boolean };
  plan: PlanConfig;
  selectedAddonData: { label: string; price: string } | null;
  finalTotal: number;
  /** Live discount percentage from Admin config */
  discountPct: number;
  /** Live discounted price (pre-computed from base fee × discount) */
  discountedPriceLabel: string;
  onNext: () => void;
}

export const CheckoutSummary = ({
  productName,
  size,
  plan,
  selectedAddonData,
  finalTotal,
  discountPct,
  discountedPriceLabel,
  onNext,
}: CheckoutSummaryProps) => (
  <div className="bg-[#1A0030] border border-white/10 rounded-2xl p-6 sticky top-24">
    <h3 className="text-white font-heading font-bold text-lg text-center mb-2">
      {productName}
    </h3>
    <div className="flex items-center justify-center gap-3 mb-4">
      <span className="text-white/30 line-through text-lg">{size.origFee}</span>
      <span className="text-3xl font-heading font-extrabold text-white">
        {discountedPriceLabel}
      </span>
    </div>
    <div className="flex items-center justify-center gap-2 mb-6">
      <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded">
        {discountPct}% OFF
      </span>
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-yellow-400/20 border border-yellow-400/40">
        <span className="text-[9px] text-yellow-200/70 uppercase tracking-wider font-medium">CODE:</span>
        <span className="text-xs text-yellow-300 font-extrabold tracking-wide">{plan.code}</span>
      </span>
    </div>

    <div className="flex gap-2 mb-6">
      <Button
        variant="outline"
        className="flex-1 h-11 border-[#8E2DE2] text-[#8E2DE2] hover:bg-[#4A00E0]/10 font-bold"
        onClick={onNext}
      >
        Add to Cart
      </Button>
      <Button
        className="flex-1 h-11 bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white border-0 font-bold shadow-lg"
        onClick={onNext}
      >
        Buy Now
      </Button>
    </div>

    <div className="border-t border-white/10 pt-4 mb-4">
      <h4 className="text-white font-bold text-sm mb-3">Your Order</h4>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/60">Product</span>
        <span className="text-white/60">Subtotal</span>
      </div>
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white/80">{productName}</span>
        <span className="text-white font-bold">{discountedPriceLabel}</span>
      </div>
      {selectedAddonData && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-white/80">{selectedAddonData.label}</span>
          <span className="text-white font-bold">{selectedAddonData.price}</span>
        </div>
      )}
      <div className="flex justify-between text-sm font-bold border-t border-white/10 pt-2">
        <span className="text-white">Total</span>
        <span className="text-[#8E2DE2] text-lg">
          ₹{finalTotal.toLocaleString("en-IN")}
        </span>
      </div>
    </div>

    <div className="border-t border-white/10 pt-4">
      <h4 className="text-white font-bold text-sm mb-3 text-center">
        Challenge Info
      </h4>
      <div className="space-y-2.5">
        {[
          { label: "Profit Target", value: plan.profitTarget },
          { label: "Maximum Loss", value: plan.maxLoss },
          { label: "Max Daily Loss", value: plan.dailyLoss },
          { label: "Min Trading Days", value: plan.minDays },
          { label: "Leverage", value: plan.leverage },
          { label: "Profit Split", value: plan.profitSplit },
          { label: "Duration", value: plan.duration },
        ].map((row, i) => (
          <div key={i} className="flex justify-between text-xs">
            <span className="text-white/50">{row.label}</span>
            <span className="text-white font-bold">{row.value}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Compliance Disclosure */}
    <div className="mt-4 border-t border-yellow-500/20 pt-4 flex items-start gap-2">
      <FileText size={14} className="text-yellow-400 mt-0.5 shrink-0" />
      <div className="text-[11px] leading-relaxed text-white/60">
        <span className="text-yellow-400 font-semibold block mb-1">Compliance Disclosure</span>
        All Instant Funding accounts are{" "}
        <span className="font-semibold text-white/80">simulated funded accounts</span>. No real capital is at risk. Any performance-based reward is subject to the applicable program terms and is not a withdrawal of live trading capital.{" "}
        KYC verification and e-Sign are mandatory before account activation. By purchasing, you agree to the firm's{" "}
        <a href="/terms" className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300">Terms of Service</a>{" "}
        and{" "}
        <a href="/trading-rules" className="text-yellow-400 underline underline-offset-2 hover:text-yellow-300">Trading Rules</a>.
      </div>
    </div>
  </div>
);
