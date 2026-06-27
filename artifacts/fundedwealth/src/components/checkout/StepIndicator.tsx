import React from "react";
import { CheckCircle2 } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
}

export const StepIndicator = ({ currentStep }: StepIndicatorProps) => (
  <div className="flex items-center justify-center gap-0 mb-10">
    {[
      { num: 1, label: "Configure", icon: "Cart" },
      { num: 2, label: "Verify", icon: "Verify" },
      { num: 3, label: "Pay", icon: "₹" },
    ].map((step, i) => (
      <div key={step.num} className="flex items-center">
        <div className="flex flex-col items-center gap-1.5">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              currentStep >= step.num
                ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white shadow-lg shadow-[#4A00E0]/30"
                : "bg-white/5 border border-white/20 text-white/40"
            }`}
          >
            {currentStep > step.num ? (
              <CheckCircle2 size={18} />
            ) : (
              <span>{step.icon}</span>
            )}
          </div>
          <span
            className={`text-xs font-semibold ${
              currentStep >= step.num ? "text-white" : "text-white/40"
            }`}
          >
            {step.num} {step.label}
          </span>
        </div>
        {i < 2 && (
          <div
            className={`w-16 sm:w-24 h-0.5 mx-2 mt-[-18px] transition-all ${
              currentStep > step.num
                ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2]"
                : "bg-white/10"
            }`}
          />
        )}
      </div>
    ))}
  </div>
);
