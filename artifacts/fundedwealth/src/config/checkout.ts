import { CreditCard, Building2 } from "lucide-react";
import React from "react";

export type PlanType = "flash" | "instant" | "1step" | "2step";

export interface PlanConfig {
  label: string;
  sizes: { size: string; origFee: string; discFee: string; popular?: boolean }[];
  discount: string;
  code: string;
  profitTarget: string;
  maxLoss: string;
  dailyLoss: string;
  minDays: string;
  leverage: string;
  profitSplit: string;
  duration: string;
}

export const PLANS: Record<PlanType, PlanConfig> = {
  flash: {
    label: "Flash",
    discount: "60%",
    code: "Flash",
    profitTarget: "—",
    maxLoss: "4%",
    dailyLoss: "2%",
    minDays: "—",
    leverage: "1:100",
    profitSplit: "80%",
    duration: "24 Hours",
    sizes: [
      { size: "₹50,000", origFee: "₹1,999", discFee: "₹799" },
      { size: "₹1,00,000", origFee: "₹3,499", discFee: "₹1,399" },
      { size: "₹2,50,000", origFee: "₹7,499", discFee: "₹2,999", popular: true },
      { size: "₹5,00,000", origFee: "₹11,499", discFee: "₹4,599" },
      { size: "₹10,00,000", origFee: "₹19,499", discFee: "₹7,799" },
    ],
  },
  instant: {
    label: "Instant",
    discount: "55%",
    code: "Instant",
    profitTarget: "—",
    maxLoss: "6%",
    dailyLoss: "3%",
    minDays: "1",
    leverage: "1:100",
    profitSplit: "80%",
    duration: "Unlimited",
    sizes: [
      { size: "₹1,00,000", origFee: "₹4,999", discFee: "₹2,749" },
      { size: "₹5,00,000", origFee: "₹11,999", discFee: "₹6,049", popular: true },
      { size: "₹10,00,000", origFee: "₹21,999", discFee: "₹9,899" },
    ],
  },
  "1step": {
    label: "1-Step",
    discount: "65%",
    code: "FW",
    profitTarget: "10%",
    maxLoss: "6%",
    dailyLoss: "3%",
    minDays: "3",
    leverage: "1:100",
    profitSplit: "90%",
    duration: "30 Days",
    sizes: [
      { size: "₹1,00,000", origFee: "₹2,999", discFee: "₹1,049" },
      { size: "₹5,00,000", origFee: "₹11,999", discFee: "₹4,199", popular: true },
      { size: "₹10,00,000", origFee: "₹21,999", discFee: "₹7,699" },
      { size: "₹25,00,000", origFee: "₹48,499", discFee: "₹16,974" },
    ],
  },
  "2step": {
    label: "2-Step",
    discount: "70%",
    code: "FW",
    profitTarget: "8% + 5%",
    maxLoss: "8%",
    dailyLoss: "4%",
    minDays: "5",
    leverage: "1:100",
    profitSplit: "90%",
    duration: "60 Days",
    sizes: [
      { size: "₹5,00,000", origFee: "₹11,999", discFee: "₹3,599" },
      { size: "₹10,00,000", origFee: "₹21,999", discFee: "₹6,599", popular: true },
      { size: "₹25,00,000", origFee: "₹48,499", discFee: "₹14,549" },
    ],
  },
};

export const ADDONS = [
  { id: "lifetime", label: "90% Lifetime Payout", price: "₹999/mo" },
  { id: "biweekly", label: "Bi-Weekly Payout", price: "₹499" },
  { id: "weekly", label: "Weekly Payout", price: "₹799" },
];

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

export const COUPON_CODES: Record<string, number> = {
  FLASH: 60,
  INSTANT: 55,
  FW: 65,
  FW70: 70,
  WELCOME: 10,
};
