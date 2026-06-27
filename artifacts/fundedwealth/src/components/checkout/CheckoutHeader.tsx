import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Lock } from "lucide-react";

export const CheckoutHeader = () => (
  <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
    <div className="container mx-auto px-4 flex items-center justify-between">
      <Link
        href="/"
        className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
        <span className="font-heading font-bold">FundedWealth</span>
      </Link>
      <div className="flex items-center gap-2 text-xs text-white/40">
        <Lock size={14} />
        <span>256-bit SSL Secured</span>
      </div>
    </div>
  </div>
);
