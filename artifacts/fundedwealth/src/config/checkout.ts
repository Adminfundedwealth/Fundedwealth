// Checkout display config for the Main Website.
//
// The challenge catalog (types, sizes, fees, drawdown, daily loss, profit
// target, leverage, payout rules, coupons) lives in the shared single source
// of truth: @workspace/products. This file only adapts that canonical data
// into the display shape the checkout UI already expects, plus website-only
// presentation config (add-ons, payment methods).
//
// CANONICAL PLAN SALE DISCOUNTS (from @workspace/products):
//   Flash   = 50%  |  Instant = 45%  |  1-Step = 55%  |  2-Step = 60%
//
// These are BASE PLAN DISCOUNTS — do NOT confuse with coupon codes.
import { PRODUCTS, COUPONS, PLAN_TYPES, type PlanType } from "@workspace/products";

export type { PlanType };

export interface PlanConfig {
  label: string;
  sizes: { size: string; fee: number; origFee: string; discFee: string; popular?: boolean }[];
  /** Plan sale discount as string e.g. "50%" */
  discount: string;
  /** Plan sale discount as number e.g. 50 — use this for calculations */
  discountPct: number;
  /** Promotional code shown in "Use code" banner — display only, NOT a price driver */
  code: string;
  profitTarget: string;
  maxLoss: string;
  dailyLoss: string;
  minDays: string;
  leverage: string;
  profitSplit: string;
  duration: string;
}

// Derived from the shared catalog — same shape/values the UI consumed before.
export const PLANS: Record<PlanType, PlanConfig> = PLAN_TYPES.reduce((acc, key) => {
  const p = PRODUCTS[key];
  acc[key] = {
    label: p.displayLabel,
    discount: p.discount,
    discountPct: p.discountPct,
    code: p.code,
    profitTarget: p.profitTarget,
    maxLoss: p.maxLoss,
    dailyLoss: p.dailyLoss,
    minDays: p.minDays,
    leverage: p.leverage,
    profitSplit: p.profitSplit,
    duration: p.duration,
    sizes: p.sizes.map((s) => ({
      size: s.sizeLabel,
      fee: s.fee,
      origFee: s.origFeeLabel,
      discFee: s.discFeeLabel,
      ...(s.popular ? { popular: true } : {}),
    })),
  };
  return acc;
}, {} as Record<PlanType, PlanConfig>);

export const ADDONS = [
  { id: "lifetime", label: "90% Lifetime Payout", price: "₹999/mo" },
  { id: "biweekly", label: "Bi-Weekly Payout", price: "₹499" },
  { id: "weekly", label: "Weekly Payout", price: "₹799" },
];

// ---------------------------------------------------------------------------
// Payment provider availability flags
// Set to false to temporarily disable a provider at the checkout UI level.
// The underlying integration code is preserved and can be re-enabled by
// setting the flag back to true.
// ---------------------------------------------------------------------------
export const RAZORPAY_PAYMENT_ENABLED = false;

export const PAYMENT_METHODS = [
  { id: "razorpay-card", label: "Debit / Credit Card", icon: "CreditCard", desc: "Visa, Mastercard, RuPay — via Razorpay", group: "fiat" },
  { id: "razorpay-netbanking", label: "Net Banking", icon: "Building2", desc: "All major Indian banks — via Razorpay", group: "fiat" },
  { id: "razorpay-wallet", label: "Wallets", icon: "CreditCard", desc: "Paytm, PhonePe, Amazon Pay — via Razorpay", group: "fiat" },
  { id: "oxapay-usdt-trc20", label: "USDT TRC20", icon: "TRC20", desc: "Tron network — via OxaPay", group: "crypto" },
  { id: "oxapay-usdt-bep20", label: "USDT BEP20", icon: "BEP20", desc: "BSC network — via OxaPay", group: "crypto" },
  { id: "oxapay-usdt-erc20", label: "USDT ERC20", icon: "ERC20", desc: "Ethereum network — via OxaPay", group: "crypto" },
  { id: "oxapay-btc", label: "Bitcoin (BTC)", icon: "BTC", desc: "Bitcoin network — via OxaPay", group: "crypto" },
  { id: "oxapay-eth", label: "Ethereum (ETH)", icon: "ETH", desc: "Ethereum network — via OxaPay", group: "crypto" },
  { id: "oxapay-ltc", label: "Litecoin (LTC)", icon: "LTC", desc: "Litecoin network — via OxaPay", group: "crypto" },
];

// Coupon code → discount %, sourced from the shared catalog.
export const COUPON_CODES: Record<string, number> = COUPONS;
