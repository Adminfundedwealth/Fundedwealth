/**
 * @workspace/products — SINGLE SOURCE OF TRUTH for FundedWealth challenge products.
 *
 * This package is the ONLY place where the challenge catalog is defined:
 *   - Product types: Flash, Instant, 1-Step, 2-Step
 *   - Account sizes + fees
 *   - Drawdown, daily-loss, profit-target, leverage, min trading days
 *   - Payout / profit-split rules
 *   - Coupon codes
 *
 * Consumed by BOTH:
 *   - Main Website   (@workspace/fundedwealth)  → checkout display + pricing
 *   - API / Admin    (@workspace/api-server)    → order pricing + provisioning
 *
 * DO NOT duplicate any of these values anywhere else. Website checkout and
 * Founder Emergency Provision both read from here so they create identical
 * challenge_accounts, trading_accounts and risk settings.
 */

export type PlanType = "flash" | "instant" | "1step" | "2step";

export const PLAN_TYPES: PlanType[] = ["flash", "instant", "1step", "2step"];

/** Display + numeric definition for one purchasable account size. */
export interface ProductSize {
  /** Virtual challenge balance in INR (e.g. 500000) — the balance the trader gets. */
  accountSize: number;
  /** Base fee in INR (the original, pre-coupon price). */
  fee: number;
  /** Formatted account size for display, e.g. "₹50,000". */
  sizeLabel: string;
  /** Formatted original fee for display, e.g. "₹1,999". */
  origFeeLabel: string;
  /** Formatted (pre-)discounted fee for display, e.g. "₹799". */
  discFeeLabel: string;
  popular?: boolean;
}

/** Risk / evaluation rules applied when provisioning a challenge account. */
export interface ProvisioningRules {
  profitTargetPct: number;
  dailyLossLimitPct: number;
  maxDrawdownPct: number;
  minTradingDays: number;
  maxDaysAllowed: number;
  /** challenge_accounts.type discriminator. */
  type: string;
}

/** Full canonical definition for a product/plan. */
export interface ProductDefinition {
  key: PlanType;
  /** Short marketing label, e.g. "Flash". */
  displayLabel: string;
  /** Long server/admin label, e.g. "Flash Challenge". */
  serverLabel: string;
  discount: string;
  code: string;
  // Marketing rule strings shown on the website.
  profitTarget: string;
  maxLoss: string;
  dailyLoss: string;
  minDays: string;
  leverage: string;
  profitSplit: string;
  duration: string;
  sizes: ProductSize[];
  /** Numeric risk settings used for account provisioning. */
  rules: ProvisioningRules;
}

export const PRODUCTS: Record<PlanType, ProductDefinition> = {
  flash: {
    key: "flash",
    displayLabel: "Flash",
    serverLabel: "Flash Challenge",
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
      { accountSize: 50000, fee: 1999, sizeLabel: "₹50,000", origFeeLabel: "₹1,999", discFeeLabel: "₹799" },
      { accountSize: 100000, fee: 3499, sizeLabel: "₹1,00,000", origFeeLabel: "₹3,499", discFeeLabel: "₹1,399" },
      { accountSize: 250000, fee: 7499, sizeLabel: "₹2,50,000", origFeeLabel: "₹7,499", discFeeLabel: "₹2,999", popular: true },
      { accountSize: 500000, fee: 11499, sizeLabel: "₹5,00,000", origFeeLabel: "₹11,499", discFeeLabel: "₹4,599" },
      { accountSize: 1000000, fee: 19499, sizeLabel: "₹10,00,000", origFeeLabel: "₹19,499", discFeeLabel: "₹7,799" },
    ],
    rules: { profitTargetPct: 10, dailyLossLimitPct: 3, maxDrawdownPct: 6, minTradingDays: 3, maxDaysAllowed: 30, type: "flash_challenge" },
  },
  instant: {
    key: "instant",
    displayLabel: "Instant",
    serverLabel: "Instant Funding",
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
      { accountSize: 100000, fee: 4999, sizeLabel: "₹1,00,000", origFeeLabel: "₹4,999", discFeeLabel: "₹2,749" },
      { accountSize: 500000, fee: 11999, sizeLabel: "₹5,00,000", origFeeLabel: "₹11,999", discFeeLabel: "₹6,049", popular: true },
      { accountSize: 1000000, fee: 21999, sizeLabel: "₹10,00,000", origFeeLabel: "₹21,999", discFeeLabel: "₹9,899" },
    ],
    rules: { profitTargetPct: 10, dailyLossLimitPct: 3, maxDrawdownPct: 6, minTradingDays: 1, maxDaysAllowed: 60, type: "instant_funding" },
  },
  "1step": {
    key: "1step",
    displayLabel: "1-Step",
    serverLabel: "1-Step Evaluation",
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
      { accountSize: 100000, fee: 2999, sizeLabel: "₹1,00,000", origFeeLabel: "₹2,999", discFeeLabel: "₹1,049" },
      { accountSize: 500000, fee: 11999, sizeLabel: "₹5,00,000", origFeeLabel: "₹11,999", discFeeLabel: "₹4,199", popular: true },
      { accountSize: 1000000, fee: 21999, sizeLabel: "₹10,00,000", origFeeLabel: "₹21,999", discFeeLabel: "₹7,699" },
      { accountSize: 2500000, fee: 48499, sizeLabel: "₹25,00,000", origFeeLabel: "₹48,499", discFeeLabel: "₹16,974" },
    ],
    rules: { profitTargetPct: 10, dailyLossLimitPct: 4, maxDrawdownPct: 8, minTradingDays: 5, maxDaysAllowed: 45, type: "1step_evaluation" },
  },
  "2step": {
    key: "2step",
    displayLabel: "2-Step",
    serverLabel: "2-Step Evaluation",
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
      { accountSize: 500000, fee: 11999, sizeLabel: "₹5,00,000", origFeeLabel: "₹11,999", discFeeLabel: "₹3,599" },
      { accountSize: 1000000, fee: 21999, sizeLabel: "₹10,00,000", origFeeLabel: "₹21,999", discFeeLabel: "₹6,599", popular: true },
      { accountSize: 2500000, fee: 48499, sizeLabel: "₹25,00,000", origFeeLabel: "₹48,499", discFeeLabel: "₹14,549" },
    ],
    rules: { profitTargetPct: 8, dailyLossLimitPct: 4, maxDrawdownPct: 10, minTradingDays: 5, maxDaysAllowed: 60, type: "2step_evaluation_phase1" },
  },
};

/** Coupon code → percentage discount. Single source for website + server. */
export const COUPONS: Record<string, number> = {
  FLASH: 60,
  INSTANT: 55,
  FW: 65,
  FW70: 70,
  WELCOME: 10,
};

// ---------------------------------------------------------------------------
// Accessors / helpers
// ---------------------------------------------------------------------------

export function getProduct(planType: PlanType): ProductDefinition | null {
  return PRODUCTS[planType] ?? null;
}

export function getProductSize(planType: PlanType, sizeIndex: number): ProductSize | null {
  const product = PRODUCTS[planType];
  if (!product) return null;
  return product.sizes[sizeIndex] ?? null;
}

/**
 * Resolve the actual challenge account size (virtual balance) from plan + index.
 * This is the balance the trader trades with — NOT the fee they paid.
 */
export function resolveAccountSize(planType: PlanType, sizeIndex: number): number | null {
  const size = getProductSize(planType, sizeIndex);
  return size ? size.accountSize : null;
}

/** Resolve the base (pre-coupon) fee for a plan + size index. */
export function resolveFee(planType: PlanType, sizeIndex: number): number | null {
  const size = getProductSize(planType, sizeIndex);
  return size ? size.fee : null;
}

/** Get the numeric provisioning/risk rules for a plan (falls back to flash). */
export function getProvisioningRules(planType: PlanType): ProvisioningRules {
  const product = PRODUCTS[planType] ?? PRODUCTS.flash;
  return product.rules;
}

/** Resolve a coupon code to its discount percentage (0 if unknown). */
export function getCouponDiscount(couponCode?: string | null): number {
  if (!couponCode) return 0;
  const code = couponCode.trim().toUpperCase();
  return COUPONS[code] ?? 0;
}

/**
 * Server-authoritative pricing for a plan + size + optional coupon.
 * Returns null if the plan/size selection is invalid.
 */
export function computeTotal(
  planType: PlanType,
  sizeIndex: number,
  couponCode?: string | null,
): { baseFee: number; total: number; finalTotal: number; discount: number } | null {
  const size = getProductSize(planType, sizeIndex);
  if (!size) return null;

  const baseFee = size.fee;
  const total = baseFee;
  const discount = getCouponDiscount(couponCode);
  const finalTotal = discount > 0 ? Math.round(total * (1 - discount / 100)) : total;

  return { baseFee, total, finalTotal, discount };
}
