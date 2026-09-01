import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { PLANS, PlanType, COUPON_CODES } from "../config/checkout";
import { getApiBase } from "../lib/api-base";

/** Shape returned by GET /api/discount-config */
interface LiveDiscountEntry {
  planType: string;
  code: string;
  discountPct: number;
  active: boolean;
}

export const useCheckout = () => {
  const { isLoaded, getToken, isSignedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("1step");
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);

  // Live discount config fetched from the API (admin-controlled).
  // Falls back to the static @workspace/products values if the fetch fails.
  const [liveDiscounts, setLiveDiscounts] = useState<LiveDiscountEntry[]>([]);

  useEffect(() => {
    const apiBase = getApiBase();
    fetch(`${apiBase}/api/discount-config`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((data) => { if (Array.isArray(data?.data)) setLiveDiscounts(data.data); })
      .catch(() => { /* silently use static fallback */ });
  }, []);

  // ─── Resolve plan sale discount (Tier 1) ────────────────────────────────────
  // The liveEntry.discountPct IS the plan sale discount percentage (50/45/55/60).
  // It is NOT a coupon. We use it directly as the base discount applied to the fee.
  //
  // FALLBACK hierarchy (most specific first):
  //   1. API live discount for this plan  (liveEntry.discountPct)
  //   2. Static PLANS[plan].discount string parsed as number
  //
  // NOTE: We intentionally do NOT fall back to COUPON_CODES[liveEntry.code] here.
  // That was the P0 bug — the plan code was "INDIA80" and COUPON_CODES["INDIA80"]=80,
  // which made every plan show 80% off regardless of the plan sale discount.
  const liveEntry = liveDiscounts.find((e) => e.planType === selectedPlan && e.active);

  // planSaleDiscount = the canonical plan discount (50 for Flash, 45 for Instant, etc.)
  const planSaleDiscount: number = liveEntry?.discountPct
    ?? parseInt(PLANS[selectedPlan].discount, 10)  // "50%" → 50
    ?? 0;

  // appliedCoupon = the PROMOTIONAL code shown in the "Use code" banner (display only).
  // This does NOT change the planSaleDiscount.
  const appliedCoupon = liveEntry?.code ?? PLANS[selectedPlan].code;

  // ─── Coupon discount (Tier 2) ────────────────────────────────────────────────
  // A promo coupon entered by the user provides an ADDITIONAL discount on top of
  // the plan sale price. The user has NOT entered a coupon code yet at this point
  // (that feature is applied at checkout step 3). For now, couponDiscount = 0.
  //
  // If a separate coupon-input field is added to checkout, look it up via:
  //   COUPON_CODES[enteredCode] → additional %
  // and stack it on top of planSaleDiscount.
  //
  // For backwards compatibility with components that receive `couponDiscount` to
  // compute the final price, we expose planSaleDiscount as couponDiscount so no
  // other component needs to change.
  const couponDiscount = planSaleDiscount;

  const [termsOpen, setTermsOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  const [billing, setBilling] = useState({
    title: "",
    firstName: "",
    lastName: "",
    street: "",
    city: "",
    postalCode: "",
    country: "India",
    phone: "",
    email: "",
  });

  // Account credentials — only relevant for guest checkout. A signed-in user
  // already has a Supabase auth identity, so these stay empty and unused.
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Detect whether the billing email already has an account.
  // If true → user enters their existing password (no confirm field).
  // If false → user creates a new password (with confirm field).
  const [emailExists, setEmailExists] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);

  // Debounced email-exists check
  useEffect(() => {
    if (isSignedIn) return; // No need — already authenticated
    const email = billing.email.trim().toLowerCase();
    if (!email || !email.includes("@") || email.length < 5) {
      setEmailExists(false);
      return;
    }

    setEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const data = await res.json().catch(() => ({ exists: false }));
        setEmailExists(!!data.exists);
      } catch {
        setEmailExists(false);
      } finally {
        setEmailChecking(false);
      }
    }, 600);

    return () => { clearTimeout(timer); setEmailChecking(false); };
  }, [billing.email, isSignedIn]);

  useEffect(() => {
    const storedCode = window.localStorage.getItem("fw_referral_code");
    if (storedCode) {
      setReferralCode(storedCode);
    }
  }, []);

  useEffect(() => {
    const plan = PLANS[selectedPlan];
    const popularIdx = plan.sizes.findIndex((s) => s.popular);
    setSelectedSizeIdx(popularIdx >= 0 ? popularIdx : 0);
  }, [selectedPlan]);

  const billingValid =
    billing.firstName.trim() &&
    billing.lastName.trim() &&
    billing.city.trim() &&
    billing.postalCode.trim() &&
    billing.email.trim() &&
    billing.phone.trim();

  // Guests must set a password (min 8 chars) that matches the confirmation.
  // For existing accounts, only the password field is required (no confirm).
  // Signed-in users already have an account, so the password is not required.
  const passwordValid = emailExists
    ? password.length >= 8
    : password.length >= 8 && password === confirmPassword;
  const credentialsValid = isSignedIn ? true : passwordValid;

  return {
    step,
    setStep,
    selectedPlan,
    setSelectedPlan,
    selectedSizeIdx,
    setSelectedSizeIdx,
    selectedAddon,
    setSelectedAddon,
    appliedCoupon,
    couponDiscount,
    planSaleDiscount,
    termsOpen,
    setTermsOpen,
    selectedPayment,
    setSelectedPayment,
    billing,
    setBilling,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordValid,
    credentialsValid,
    emailExists,
    emailChecking,
    referralCode,
    billingValid,
    isLoaded,
    isSignedIn,
    getToken,
  };
};
