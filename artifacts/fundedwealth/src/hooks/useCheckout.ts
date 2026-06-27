import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { PLANS, PlanType, COUPON_CODES } from "../config/checkout";

export const useCheckout = () => {
  const { isLoaded, getToken } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("1step");
  const [selectedSizeIdx, setSelectedSizeIdx] = useState(0);
  const [selectedAddon, setSelectedAddon] = useState<string | null>(null);
  const AUTO_COUPON = "FW";
  const [appliedCoupon] = useState<string>(AUTO_COUPON);
  const [couponDiscount] = useState<number>(COUPON_CODES[AUTO_COUPON] ?? 0);
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
    referralCode,
    billingValid,
    isLoaded,
    getToken,
  };
};
