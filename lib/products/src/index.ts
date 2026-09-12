/**
 * @workspace/products — SINGLE SOURCE OF TRUTH for FundedWealth challenge products.
 *
 * This package is the ONLY place where the challenge catalog is defined:
 *   - Product types: Flash, Instant, 1-Step, 2-Step
 *   - Account sizes + fees
 *   - Drawdown, daily-loss, profit-target, leverage, min trading days
 *   - Payout / profit-split rules
 *   - Plan-sale discounts (SEPARATE from coupon codes)
 *   - Coupon codes
 *
 * Consumed by BOTH:
 *   - Main Website   (@workspace/fundedwealth)  → checkout display + pricing
 *   - API / Admin    (@workspace/api-server)    → order pricing + provisioning
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * CANONICAL PLAN SALE DISCOUNTS (DO NOT CHANGE WITHOUT UPDATING ALL LAYERS):
 *
 *   Flash   = 50% OFF
 *   Instant = 45% OFF
 *   1-Step  = 55% OFF
 *   2-Step  = 60% OFF
 *
 * These are BASE PLAN DISCOUNTS — the sale price shown on the pricing page.
 * They are NOT coupons. A coupon is an ADDITIONAL promo code (see COUPONS below).
 * ─────────────────────────────────────────────────────────────────────────────
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
  /** Base fee in INR (the original, pre-discount price). */
  fee: number;
  /** Formatted account size for display, e.g. "₹50,000". */
  sizeLabel: string;
  /** Formatted original fee for display, e.g. "₹1,999". */
  origFeeLabel: string;
  /**
   * Formatted plan-sale-discounted fee for display.
   * Computed as: Math.round(fee * (1 - planDiscountPct/100))
   * e.g. Flash ₹50K: Math.round(1999 * 0.50) = ₹1,000
   */
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
  // Extended fields (optional — used by Instant Funding and future plans)
  consistencyRulePct?: number;       // best trade ≤ X% of total profit
  dailyProfitCapPct?: number;        // kill-switch at X% daily profit
  riskPerTradeIdeaPct?: number;      // max 1% of starting balance per trade idea
  payoutThresholdPct?: number;       // net profit ≥ X% before payout
  scalingTriggerPct?: number;        // grow balance X% over 90 days → scale
  scalingRewardPct?: number;         // +X% of starting balance added
  scalingCapPct?: number;            // total scale cap
  scalingCycleDays?: number;         // days per scaling cycle
  inactivityCloseDays?: number;      // auto-close if no trades in X days
  noOvernight?: boolean;             // block overnight positions
  leverage?: string;                 // display leverage string
  profitSplit?: number;              // % profit split to trader
}

/** Full canonical definition for a product/plan. */
export interface ProductDefinition {
  key: PlanType;
  /** Short marketing label, e.g. "Flash". */
  displayLabel: string;
  /** Long server/admin label, e.g. "Flash Challenge". */
  serverLabel: string;
  /**
   * Plan sale discount as a string, e.g. "50%".
   * This is the BASE DISCOUNT applied to the original fee.
   * It is NOT the coupon code discount.
   * Canonical values: Flash=50%, Instant=45%, 1step=55%, 2step=60%
   */
  discount: string;
  /**
   * Plan sale discount as a number, e.g. 50.
   * This is the primary numeric field used for all calculations.
   */
  discountPct: number;
  /**
   * The promotional coupon code currently active for this plan.
   * NOTE: This is a DISPLAY-ONLY field (shown in the "Use code" banner).
   * The backend MUST NOT apply this code automatically as a discount —
   * it is only applied when the user explicitly enters it at checkout.
   * The plan discountPct is ALWAYS applied regardless of any coupon.
   */
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
  /** Numeric risk settings used for account provisioning — Phase 1 (or only phase). */
  rules: ProvisioningRules;
  /** Phase 2 rules (2-Step only). Undefined for Flash/Instant/1-Step. */
  rulesPhase2?: ProvisioningRules;
  /** Funded-trader rules (after passing all eval phases). */
  rulesFunded?: ProvisioningRules;
}

// ---------------------------------------------------------------------------
// Helper used inline to pre-compute discFeeLabel values.
// Math.round(fee * (1 - pct/100))
// ---------------------------------------------------------------------------
function discFee(fee: number, pct: number): string {
  return "₹" + Math.round(fee * (1 - pct / 100)).toLocaleString("en-IN");
}

export const PRODUCTS: Record<PlanType, ProductDefinition> = {
  // ─── FLASH — 50% OFF ───────────────────────────────────────────────────────
  flash: {
    key: "flash",
    displayLabel: "Flash",
    serverLabel: "Flash Funding",
    discount: "50%",
    discountPct: 50,
    code: "FLASH50",
    profitTarget: "—",
    maxLoss: "4%",
    dailyLoss: "2%",
    minDays: "—",
    leverage: "1:100",
    profitSplit: "80%",
    duration: "24 Hours",
    sizes: [
      // Math.round(1999 * 0.50) = 1000 (→ ₹1,000)
      { accountSize:   50000, fee:  1999, sizeLabel: "₹50,000",     origFeeLabel: "₹1,999",  discFeeLabel: discFee( 1999, 50) },
      // Math.round(3499 * 0.50) = 1750 (→ ₹1,750)
      { accountSize:  100000, fee:  3499, sizeLabel: "₹1,00,000",   origFeeLabel: "₹3,499",  discFeeLabel: discFee( 3499, 50) },
      // Math.round(7499 * 0.50) = 3750 (→ ₹3,750)
      { accountSize:  250000, fee:  7499, sizeLabel: "₹2,50,000",   origFeeLabel: "₹7,499",  discFeeLabel: discFee( 7499, 50), popular: true },
      // Math.round(11499 * 0.50) = 5750 (→ ₹5,750)
      { accountSize:  500000, fee: 11499, sizeLabel: "₹5,00,000",   origFeeLabel: "₹11,499", discFeeLabel: discFee(11499, 50) },
      // Math.round(19499 * 0.50) = 9750 (→ ₹9,750)
      { accountSize: 1000000, fee: 19499, sizeLabel: "₹10,00,000",  origFeeLabel: "₹19,499", discFeeLabel: discFee(19499, 50) },
    ],
    rules: { profitTargetPct: 0, dailyLossLimitPct: 2, maxDrawdownPct: 4, minTradingDays: 0, maxDaysAllowed: 1, type: "flash_funding" },
  },

  // ─── INSTANT — 45% OFF ─────────────────────────────────────────────────────
  instant: {
    key: "instant",
    displayLabel: "Instant",
    serverLabel: "Instant Funding",
    discount: "45%",
    discountPct: 45,
    code: "INSTANT45",
    profitTarget: "N/A",
    maxLoss: "5%",
    dailyLoss: "3%",
    minDays: "7",
    leverage: "1:50",
    profitSplit: "80%",
    duration: "Unlimited",
    sizes: [
      // Math.round(4999 * 0.55) = 2750 (→ ₹2,750)
      { accountSize:  100000, fee:  4999, sizeLabel: "₹1,00,000",   origFeeLabel: "₹4,999",  discFeeLabel: discFee( 4999, 45) },
      // Math.round(10999 * 0.55) = 6049 (→ ₹6,049) — note: 10999*0.55=6049.45 → rounds to 6049
      { accountSize:  500000, fee: 10999, sizeLabel: "₹5,00,000",   origFeeLabel: "₹10,999", discFeeLabel: discFee(10999, 45), popular: true },
      // Math.round(17999 * 0.55) = 9899 (→ ₹9,899)
      { accountSize: 1000000, fee: 17999, sizeLabel: "₹10,00,000",  origFeeLabel: "₹17,999", discFeeLabel: discFee(17999, 45) },
      // Math.round(29999 * 0.55) = 16499 (→ ₹16,499)
      { accountSize: 2000000, fee: 29999, sizeLabel: "₹20,00,000",  origFeeLabel: "₹29,999", discFeeLabel: discFee(29999, 45) },
    ],
    rules: {
      profitTargetPct: 0,
      dailyLossLimitPct: 3,
      maxDrawdownPct: 5,
      minTradingDays: 7,
      maxDaysAllowed: 365,
      type: "instant_funding",
      consistencyRulePct: 15,
      dailyProfitCapPct: 4,
      riskPerTradeIdeaPct: 1,
      payoutThresholdPct: 5,
      scalingTriggerPct: 10,
      scalingRewardPct: 25,
      scalingCapPct: 100,
      scalingCycleDays: 90,
      inactivityCloseDays: 60,
      noOvernight: true,
      leverage: "1:50",
      profitSplit: 80,
    },
  },

  // ─── 1-STEP — 55% OFF ──────────────────────────────────────────────────────
  "1step": {
    key: "1step",
    displayLabel: "1-Step",
    serverLabel: "1-Step Evaluation",
    discount: "55%",
    discountPct: 55,
    code: "ONESTEP55",
    profitTarget: "10%",
    maxLoss: "6%",
    dailyLoss: "3%",
    minDays: "5",
    leverage: "1:30",
    profitSplit: "80%",
    duration: "Unlimited",
    sizes: [
      // Math.round(2999 * 0.45) = 1350 (→ ₹1,350)
      { accountSize:  100000, fee:  2999, sizeLabel: "₹1,00,000",   origFeeLabel: "₹2,999",  discFeeLabel: discFee( 2999, 55) },
      // Math.round(11999 * 0.45) = 5400 (→ ₹5,400)
      { accountSize:  500000, fee: 11999, sizeLabel: "₹5,00,000",   origFeeLabel: "₹11,999", discFeeLabel: discFee(11999, 55), popular: true },
      // Math.round(21999 * 0.45) = 9900 (→ ₹9,900)
      { accountSize: 1000000, fee: 21999, sizeLabel: "₹10,00,000",  origFeeLabel: "₹21,999", discFeeLabel: discFee(21999, 55) },
      // Math.round(48499 * 0.45) = 21825 (→ ₹21,825)
      { accountSize: 2500000, fee: 48499, sizeLabel: "₹25,00,000",  origFeeLabel: "₹48,499", discFeeLabel: discFee(48499, 55) },
    ],
    rules: { profitTargetPct: 10, dailyLossLimitPct: 3, maxDrawdownPct: 6, minTradingDays: 5, maxDaysAllowed: 365, type: "1step_evaluation" },
  },

  // ─── 2-STEP — 60% OFF ──────────────────────────────────────────────────────
  "2step": {
    key: "2step",
    displayLabel: "2-Step",
    serverLabel: "2-Step Evaluation",
    discount: "60%",
    discountPct: 60,
    code: "TWOSTEP60",
    profitTarget: "8% + 5%",
    maxLoss: "8%",
    dailyLoss: "3%",
    minDays: "5",
    leverage: "1:30",
    profitSplit: "80%",
    duration: "Unlimited",
    sizes: [
      // Math.round(11999 * 0.40) = 4800 (→ ₹4,800)
      { accountSize:  500000, fee: 11999, sizeLabel: "₹5,00,000",   origFeeLabel: "₹11,999", discFeeLabel: discFee(11999, 60) },
      // Math.round(21999 * 0.40) = 8800 (→ ₹8,800)
      { accountSize: 1000000, fee: 21999, sizeLabel: "₹10,00,000",  origFeeLabel: "₹21,999", discFeeLabel: discFee(21999, 60), popular: true },
      // Math.round(48499 * 0.40) = 19400 (→ ₹19,400)
      { accountSize: 2500000, fee: 48499, sizeLabel: "₹25,00,000",  origFeeLabel: "₹48,499", discFeeLabel: discFee(48499, 60) },
    ],
    rules: { profitTargetPct: 8, dailyLossLimitPct: 3, maxDrawdownPct: 8, minTradingDays: 5, maxDaysAllowed: 365, type: "2step_evaluation_phase1" },
    rulesPhase2: { profitTargetPct: 5, dailyLossLimitPct: 3, maxDrawdownPct: 8, minTradingDays: 5, maxDaysAllowed: 365, type: "evaluation_phase2" },
    rulesFunded: { profitTargetPct: 0, dailyLossLimitPct: 3, maxDrawdownPct: 6, minTradingDays: 3, maxDaysAllowed: 365, type: "funded" },
  },
};

// ---------------------------------------------------------------------------
// COUPON CODES
//
// IMPORTANT: These are PROMOTIONAL coupons — additional discounts stacked on
// top of the plan sale price. They are SEPARATE from the base plan discounts
// defined in PRODUCTS above.
//
// A coupon is only applied when the user explicitly enters a promo code.
// The base plan discountPct (50/45/55/60) is ALWAYS applied first.
//
// Example: Flash ₹50K
//   Base plan discount: 50%  → ₹1,999 → ₹1,000 (plan sale price)
//   Additional coupon WELCOME 10% → ₹1,000 → ₹900 (final price with coupon)
//
// DO NOT put INDIA80 here as a 80% discount — that was the root cause of the
// pricing bug (plan codes matched "INDIA80" which looked up 80% in this map).
// ---------------------------------------------------------------------------
export const COUPONS: Record<string, number> = {
  // Promotional coupons (applied on top of plan sale price, not instead of it)
  WELCOME: 10,
  // NOTE: INDIA80 intentionally removed. It was being used as both a plan code
  // and a coupon code (returning 80%), which caused the entire checkout to apply
  // 80% OFF for every plan. The per-plan sale discounts (50/45/55/60) are now
  // defined in PRODUCTS[planType].discountPct and are resolved server-side
  // without a coupon code lookup.
  // If a promotional INDIA80 code is still needed, add it back here with the
  // correct percentage, e.g.: INDIA80: 5,
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

/** Resolve the base (pre-discount) fee for a plan + size index. */
export function resolveFee(planType: PlanType, sizeIndex: number): number | null {
  const size = getProductSize(planType, sizeIndex);
  return size ? size.fee : null;
}

/** Get the numeric provisioning/risk rules for a plan (falls back to flash). */
export function getProvisioningRules(planType: PlanType): ProvisioningRules {
  const product = PRODUCTS[planType] ?? PRODUCTS.flash;
  return product.rules;
}

/**
 * Resolve the plan's canonical sale discount percentage.
 * This is the BASE discount (50/45/55/60) — NOT a coupon lookup.
 *
 * Flash   → 50
 * Instant → 45
 * 1-Step  → 55
 * 2-Step  → 60
 */
export function getPlanDiscountPct(planType: PlanType): number {
  return PRODUCTS[planType]?.discountPct ?? 0;
}

/**
 * Resolve a coupon code to its ADDITIONAL discount percentage (0 if unknown).
 * Coupons are applied ON TOP of the plan sale price, not instead of it.
 */
export function getCouponDiscount(couponCode?: string | null): number {
  if (!couponCode) return 0;
  const code = couponCode.trim().toUpperCase();
  return COUPONS[code] ?? 0;
}

/**
 * Server-authoritative pricing for a plan + size + optional coupon.
 * Returns null if the plan/size selection is invalid.
 *
 * Pricing logic:
 *   1. baseFee       = original fee from product catalog
 *   2. planDiscount  = plan's canonical sale discount (50/45/55/60)
 *   3. planPrice     = Math.round(baseFee * (1 - planDiscount/100))
 *   4. couponDiscount = additional coupon % (0 if no coupon)
 *   5. finalTotal    = couponDiscount > 0
 *                        ? Math.round(planPrice * (1 - couponDiscount/100))
 *                        : planPrice
 *
 * @param planDiscountOverride — If provided (e.g. from admin DB config),
 *   uses this percentage instead of the static product planDiscount.
 *   This allows the admin to temporarily adjust the plan sale discount.
 * @param couponCode — Optional promo code for ADDITIONAL discount on top
 *   of the already-discounted plan price.
 */
export function computeTotal(
  planType: PlanType,
  sizeIndex: number,
  couponCode?: string | null,
  planDiscountOverride?: number | null,
): {
  baseFee: number;
  planDiscountPct: number;
  planPrice: number;
  couponDiscountPct: number;
  couponDiscountAmount: number;
  finalTotal: number;
  // Legacy alias — equals planPrice (for backwards-compat with callers using .total)
  total: number;
  // Legacy alias — equals finalTotal
  discount: number;
} | null {
  const size = getProductSize(planType, sizeIndex);
  if (!size) return null;

  const baseFee = size.fee;
  const planDiscountPct = planDiscountOverride != null ? planDiscountOverride : getPlanDiscountPct(planType);
  const planPrice = Math.round(baseFee * (1 - planDiscountPct / 100));

  const couponDiscountPct = getCouponDiscount(couponCode);
  const couponDiscountAmount = couponDiscountPct > 0 ? Math.round(planPrice * (couponDiscountPct / 100)) : 0;
  const finalTotal = planPrice - couponDiscountAmount;

  return {
    baseFee,
    planDiscountPct,
    planPrice,
    couponDiscountPct,
    couponDiscountAmount,
    finalTotal,
    // Legacy aliases (old callers expect .total and .discount)
    total: planPrice,
    discount: planDiscountPct,
  };
}

/**
 * Format a number as INR price string using Indian numbering (lakh/crore).
 * E.g., 1999 → "₹1,999", 16974 → "₹16,974", 100000 → "₹1,00,000"
 */
export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

/**
 * Compute the discounted fee for a given base fee and discount percentage.
 * Returns the rounded integer amount.
 */
export function computeDiscountedFee(baseFee: number, discountPct: number): number {
  return Math.round(baseFee * (1 - discountPct / 100));
}
