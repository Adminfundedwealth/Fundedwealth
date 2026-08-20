/**
 * REGRESSION TEST — Pricing Discount Correctness
 *
 * PURPOSE: Prevent a recurrence of the P0 bug where checkout applied 80% OFF
 * for every plan (caused by conflating the "INDIA80" coupon code with the base
 * plan sale discount).
 *
 * These tests assert the canonical plan discounts and computed prices.
 * If someone accidentally:
 *   - sets a global 80% discount
 *   - changes plan discounts to the wrong values
 *   - re-introduces INDIA80=80 as a coupon that affects base pricing
 *   - changes computeTotal to use coupon lookup instead of plan discount
 *
 * ...then these tests will fail loudly.
 */

import { describe, it, expect } from "vitest";
import {
  PRODUCTS,
  PLAN_TYPES,
  getPlanDiscountPct,
  getCouponDiscount,
  computeTotal,
  computeDiscountedFee,
  getProductSize,
  type PlanType,
} from "./index";

// ─── 1. Canonical plan sale discounts ─────────────────────────────────────────
describe("Canonical plan sale discounts", () => {
  it("Flash = 50% OFF", () => {
    expect(PRODUCTS.flash.discountPct).toBe(50);
    expect(PRODUCTS.flash.discount).toBe("50%");
    expect(getPlanDiscountPct("flash")).toBe(50);
  });

  it("Instant = 45% OFF", () => {
    expect(PRODUCTS.instant.discountPct).toBe(45);
    expect(PRODUCTS.instant.discount).toBe("45%");
    expect(getPlanDiscountPct("instant")).toBe(45);
  });

  it("1-Step = 55% OFF", () => {
    expect(PRODUCTS["1step"].discountPct).toBe(55);
    expect(PRODUCTS["1step"].discount).toBe("55%");
    expect(getPlanDiscountPct("1step")).toBe(55);
  });

  it("2-Step = 60% OFF", () => {
    expect(PRODUCTS["2step"].discountPct).toBe(60);
    expect(PRODUCTS["2step"].discount).toBe("60%");
    expect(getPlanDiscountPct("2step")).toBe(60);
  });

  // Regression guard: no plan may have an 80% plan sale discount
  it("NO plan has 80% plan sale discount", () => {
    for (const planType of PLAN_TYPES) {
      expect(PRODUCTS[planType].discountPct).not.toBe(80);
      expect(getPlanDiscountPct(planType)).not.toBe(80);
    }
  });
});

// ─── 2. Computed discounted prices (known examples from requirements) ──────────
describe("Computed plan prices — known examples", () => {
  it("Flash ₹50K: 50% OFF ₹1,999 = ₹1,000 (NOT ₹400)", () => {
    // Base: 1999, 50% off → Math.round(1999 * 0.50) = 1000 (rounding: 999.5 → 1000)
    const result = computeTotal("flash", 0); // index 0 = ₹50K
    expect(result).not.toBeNull();
    expect(result!.baseFee).toBe(1999);
    expect(result!.planDiscountPct).toBe(50);
    expect(result!.planPrice).toBe(1000);
    expect(result!.finalTotal).toBe(1000);
    // Regression guard: must NOT be ₹400 (the 80%-off bug value)
    expect(result!.finalTotal).not.toBe(400);
  });

  it("Flash ₹1L: 50% OFF ₹3,499 = ₹1,750", () => {
    const result = computeTotal("flash", 1); // index 1 = ₹1L
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(1750);
    expect(result!.finalTotal).toBe(1750);
  });

  it("Flash ₹2.5L: 50% OFF ₹7,499 = ₹3,750 (NOT ₹1,500)", () => {
    const result = computeTotal("flash", 2); // index 2 = ₹2.5L
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(3750);
    expect(result!.finalTotal).toBe(3750);
    expect(result!.finalTotal).not.toBe(1500);
  });

  it("Flash ₹5L: 50% OFF ₹11,499 = ₹5,750 (NOT ₹2,300)", () => {
    const result = computeTotal("flash", 3); // index 3 = ₹5L
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(5750);
    expect(result!.finalTotal).toBe(5750);
    expect(result!.finalTotal).not.toBe(2300);
  });

  it("Flash ₹10L: 50% OFF ₹19,499 = ₹9,750 (NOT ₹3,900)", () => {
    const result = computeTotal("flash", 4); // index 4 = ₹10L
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(9750);
    expect(result!.finalTotal).toBe(9750);
    expect(result!.finalTotal).not.toBe(3900);
  });

  it("Instant ₹5L: 45% OFF ₹10,999 ≈ ₹6,049 (NOT ₹2,200)", () => {
    // Math.round(10999 * 0.55) = Math.round(6049.45) = 6049
    const result = computeTotal("instant", 1); // index 1 = ₹5L popular
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(6049);
    expect(result!.finalTotal).toBe(6049);
    expect(result!.finalTotal).not.toBe(2200);
  });

  it("1-Step ₹5L: 55% OFF ₹11,999 = ₹5,400 (NOT ₹2,400)", () => {
    // Math.round(11999 * 0.45) = Math.round(5399.55) = 5400
    const result = computeTotal("1step", 1); // index 1 = ₹5L popular
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(5400);
    expect(result!.finalTotal).toBe(5400);
    expect(result!.finalTotal).not.toBe(2400);
  });

  it("2-Step ₹10L: 60% OFF ₹21,999 = ₹8,800 (NOT ₹4,400)", () => {
    // Math.round(21999 * 0.40) = Math.round(8799.6) = 8800
    const result = computeTotal("2step", 1); // index 1 = ₹10L popular
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(8800);
    expect(result!.finalTotal).toBe(8800);
    expect(result!.finalTotal).not.toBe(4400);
  });
});

// ─── 3. discFeeLabel pre-computed values ──────────────────────────────────────
describe("Product size discFeeLabel pre-computed values", () => {
  it("Flash ₹50K discFeeLabel = ₹1,000", () => {
    const size = getProductSize("flash", 0);
    expect(size).not.toBeNull();
    expect(size!.discFeeLabel).toBe("₹1,000");
  });

  it("Flash ₹1L discFeeLabel = ₹1,750", () => {
    const size = getProductSize("flash", 1);
    expect(size!.discFeeLabel).toBe("₹1,750");
  });

  it("Flash ₹2.5L discFeeLabel = ₹3,750", () => {
    const size = getProductSize("flash", 2);
    expect(size!.discFeeLabel).toBe("₹3,750");
  });

  it("Flash ₹5L discFeeLabel = ₹5,750", () => {
    const size = getProductSize("flash", 3);
    expect(size!.discFeeLabel).toBe("₹5,750");
  });

  it("Flash ₹10L discFeeLabel = ₹9,750", () => {
    const size = getProductSize("flash", 4);
    expect(size!.discFeeLabel).toBe("₹9,750");
  });

  it("Instant ₹5L discFeeLabel = ₹6,049", () => {
    const size = getProductSize("instant", 1);
    expect(size!.discFeeLabel).toBe("₹6,049");
  });

  it("1-Step ₹5L discFeeLabel = ₹5,400", () => {
    const size = getProductSize("1step", 1);
    expect(size!.discFeeLabel).toBe("₹5,400");
  });

  it("2-Step ₹10L discFeeLabel = ₹8,800", () => {
    const size = getProductSize("2step", 1);
    expect(size!.discFeeLabel).toBe("₹8,800");
  });

  // Regression: no discFeeLabel should correspond to 80% off
  it("NO size has a discFeeLabel matching the 80%-off bug price", () => {
    for (const planType of PLAN_TYPES) {
      const product = PRODUCTS[planType];
      for (const size of product.sizes) {
        const bugPrice80 = Math.round(size.fee * 0.20); // fee × (1 - 0.80)
        const actualDiscounted = computeDiscountedFee(size.fee, product.discountPct);
        expect(actualDiscounted).not.toBe(bugPrice80);
      }
    }
  });
});

// ─── 4. Coupon system — coupons are ADDITIONAL, not base discounts ─────────────
describe("Coupon system — additional discount on top of plan price", () => {
  it("INDIA80 is NOT a valid coupon (removed to prevent the 80% bug)", () => {
    expect(getCouponDiscount("INDIA80")).toBe(0);
  });

  it("WELCOME coupon gives 10% OFF on top of plan price", () => {
    expect(getCouponDiscount("WELCOME")).toBe(10);
  });

  it("Flash ₹50K with WELCOME coupon: plan 50% → ₹1,000 then 10% coupon → ₹900", () => {
    const result = computeTotal("flash", 0, "WELCOME");
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(1000);
    expect(result!.couponDiscountPct).toBe(10);
    expect(result!.couponDiscountAmount).toBe(100);
    expect(result!.finalTotal).toBe(900);
  });

  it("1-Step ₹5L with WELCOME coupon: plan 55% → ₹5,400 then 10% coupon → ₹4,860", () => {
    const result = computeTotal("1step", 1, "WELCOME");
    expect(result).not.toBeNull();
    expect(result!.planPrice).toBe(5400);
    expect(result!.couponDiscountPct).toBe(10);
    expect(result!.finalTotal).toBe(4860);
  });

  it("Unknown coupon gives 0% additional discount", () => {
    expect(getCouponDiscount("INVALID_CODE")).toBe(0);
    expect(getCouponDiscount("")).toBe(0);
    expect(getCouponDiscount(null)).toBe(0);
    expect(getCouponDiscount(undefined)).toBe(0);
  });

  it("No coupon — base plan price is NOT double-discounted", () => {
    const result = computeTotal("2step", 1, null);
    expect(result).not.toBeNull();
    expect(result!.couponDiscountPct).toBe(0);
    expect(result!.couponDiscountAmount).toBe(0);
    expect(result!.finalTotal).toBe(result!.planPrice);
  });
});

// ─── 5. Admin override (planDiscountOverride) safety ───────────────────────────
describe("planDiscountOverride — admin can adjust, but 80% is never the default", () => {
  it("Admin override of 50% keeps Flash ₹50K at ₹1,000", () => {
    const result = computeTotal("flash", 0, null, 50);
    expect(result!.planPrice).toBe(1000);
  });

  it("Admin override of 40% for Flash ₹50K gives ₹1,199", () => {
    // Math.round(1999 * (1 - 0.40)) = Math.round(1999 * 0.60) = Math.round(1199.4) = 1199
    const result = computeTotal("flash", 0, null, 40);
    expect(result!.planPrice).toBe(1199);
  });

  it("Default (no override) for Flash = 50%", () => {
    const result = computeTotal("flash", 0);
    expect(result!.planDiscountPct).toBe(50);
  });
});

// ─── 6. Profit split is not affected ──────────────────────────────────────────
describe("Profit split (80%) must remain unchanged", () => {
  it("Flash profit split is 80% (not plan discount)", () => {
    expect(PRODUCTS.flash.profitSplit).toBe("80%");
    expect(PRODUCTS.flash.discountPct).not.toBe(80); // plan discount ≠ profit split
  });

  it("All plans have 80% profit split", () => {
    for (const planType of PLAN_TYPES) {
      expect(PRODUCTS[planType].profitSplit).toBe("80%");
    }
  });
});
