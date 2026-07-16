import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { PLANS, PlanType, COUPON_CODES } from "../config/checkout";

export const useCheckout = () => {
  const { isLoaded, getToken, isSignedIn } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("1step");
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);
  // Use each plan's own coupon code so server validation matches displayed price
  const appliedCoupon = PLANS[selectedPlan].code;
  const couponDiscount = COUPON_CODES[appliedCoupon] ?? 0;
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
        const apiBase = import.meta.env.VITE_API_URL || "https://api.fundedwealth.com";
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
