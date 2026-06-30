import { useState, useEffect } from "react";
import SEOHead from "@/components/SEOHead";
import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  QrCode,
  Building2,
  ExternalLink,
  Smartphone,
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

// Local Components
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { StepIndicator } from "@/components/checkout/StepIndicator";
import { TermsModal } from "@/components/checkout/TermsModal";
import { CheckoutSummary } from "@/components/checkout/CheckoutSummary";
import { PaymentSidebar } from "@/components/checkout/PaymentSidebar";
import { PaymentUPI } from "@/components/checkout/PaymentUPI";

// Hooks & Config
import { useCheckout } from "@/hooks/useCheckout";
import { usePayment } from "@/hooks/usePayment";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { PLANS, ADDONS, PAYMENT_METHODS, PlanType } from "@/config/checkout";

const RazorpayLogo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const h = size === "sm" ? 16 : size === "lg" ? 36 : 22;
  return (
    <span className="inline-flex items-center gap-[6px] select-none" style={{ height: h }}>
      {/* Razorpay official logo mark - angular arrow */}
      <svg width={h * 0.75} height={h} viewBox="0 0 30 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M17.5 0L30 13.5H22.5L17.5 8L5 22H0L17.5 0Z" fill="#528FF0"/>
        <path d="M22.5 13.5L17.5 40H24L30 13.5H22.5Z" fill="#528FF0"/>
        <path d="M5 22L8 40H17.5L22.5 13.5H13L5 22Z" fill="#072654"/>
      </svg>
      <span
        style={{
          fontSize: h * 1.0,
          fontWeight: 800,
          fontStyle: "italic",
          letterSpacing: "-0.02em",
          background: "linear-gradient(90deg, #3395FF 0%, #72BBFF 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1,
        }}
      >
        Razorpay
      </span>
    </span>
  );
};

export default function Checkout() {
  const {
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
    credentialsValid,
    referralCode,
    billingValid,
    getToken,
    isLoaded,
  } = useCheckout();

  const {
    oxapayLoading,
    oxapayError,
    razorpayLoading,
    razorpayError,
    handleOxaPayPayment,
    handleRazorpayPayment,
  } = usePayment(getToken, isLoaded);

  const { signIn, isSignedIn } = useAuth();

  const [payCategory, setPayCategory] = useState<"upi" | "card" | "crypto" | null>(null);
  const [utrInput, setUtrInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [utrStatus, setUtrStatus] = useState<"idle" | "verifying" | "pending" | "success" | "failed">("idle");
  const [utrError, setUtrError] = useState("");
  const [paySecondsLeft, setPaySecondsLeft] = useState(900);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const plan = PLANS[selectedPlan];
  const size = plan.sizes[selectedSizeIdx];
  const priceNum = parseInt(size.discFee.replace(/[₹,]/g, ""));
  const selectedAddonData = ADDONS.find((a) => a.id === selectedAddon) ?? null;
  const addonPrice = selectedAddonData ? parseInt(selectedAddonData.price.replace(/[₹,/a-zA-Z]/g, "")) : 0;
  const finalTotal = priceNum + addonPrice;
  const origNum = parseInt(size.origFee.replace(/[₹,]/g, ""));
  const productName = `${size.size} ${plan.label} (FundedWealth IND)`;

  const FW_UPI_ID = "s8257683769651514@slc";
  const FW_MERCHANT_NAME = "AMAN KUMAR SINGH";

  useEffect(() => {
    if (step !== 3 || payCategory !== "upi") return;
    setPaySecondsLeft(900);
    const t = setInterval(() => {
      setPaySecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [step, payCategory]);

  const handleVerifyUtr = async () => {
    if (utrInput.trim().length < 10) {
      setUtrError("Please enter a valid 10-12 digit UTR/Reference Number");
      return;
    }
    setUtrError("");
    setUtrStatus("verifying");
    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const token = isLoaded ? await getToken().catch(() => null) : null;
      const res = await fetch(`${apiBase}/api/payments/verify-utr`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          utr: utrInput.trim(),
          amount: finalTotal,
          planType: selectedPlan,
          sizeIndex: selectedSizeIdx,
          couponCode: appliedCoupon || undefined,
          referralCode: referralCode || undefined,
          // Guest-chosen account password — backend creates the Supabase auth
          // identity with this exact password so we can auto-login below.
          password: !isSignedIn ? password : undefined,
          billing: {
            firstName: billing.firstName,
            lastName: billing.lastName,
            email: billing.email,
            phone: billing.phone,
            city: billing.city,
            state: billing.country,
            zipcode: billing.postalCode,
            address: billing.street,
          },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setUtrStatus("success");
        // First-time guest purchaser: the backend created a Supabase auth identity
        // using the password they chose in Billing Details. Sign them in now with
        // that same password so they land directly in the dashboard. We fall back to
        // any server-issued credentials (legacy temp-password path) if present.
        if (!isSignedIn) {
          const loginEmail = data.loginEmail || billing.email;
          const loginPassword = password || data.tempPassword;
          if (loginEmail && loginPassword) {
            await signIn(loginEmail, loginPassword).catch(() => {});
          }
        }
        // Redirect to pending page for provisioning polling
        const params = new URLSearchParams({
          orderId: data.orderId || "",
          plan: selectedPlan,
          amount: String(finalTotal),
          method: "upi",
        });
        window.location.href = `/payment-pending?${params.toString()}`;
      }
      else if (res.status === 202 || data.status === "pending") setUtrStatus("pending");
      else { setUtrStatus("failed"); setUtrError(data.message || data.error || "Verification failed. Please try again or contact support."); }
    } catch { setUtrStatus("pending"); }
  };

  const fmtTimer = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const upiPayUrl = `upi://pay?pa=${encodeURIComponent(FW_UPI_ID)}&pn=${encodeURIComponent(FW_MERCHANT_NAME)}&am=${finalTotal}&cu=INR&tn=${encodeURIComponent(productName)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=8&data=${encodeURIComponent(upiPayUrl)}`;

  const copyToField = (field: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0D0020] text-white">
      <SEOHead
        title="Buy Prop Trading Challenge — Secure Checkout"
        description="Purchase your FundedWealth prop trading evaluation."
        canonical="/checkout"
        noindex={true}
      />

      <CheckoutHeader />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 xl:px-10 max-w-[1600px] py-8">
        <StepIndicator currentStep={step} />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-[#1A0030] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Choose your account type</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {(Object.keys(PLANS) as PlanType[]).map((key) => (
                      <button key={key} onClick={() => setSelectedPlan(key)} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedPlan === key ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white shadow-lg" : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"}`}>
                        {PLANS[key].label}
                        {key === "instant" && <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">New</span>}
                      </button>
                    ))}
                  </div>
                  <h3 className="text-white font-bold text-lg mb-3">Choose account size</h3>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {plan.sizes.map((s, i) => (
                      <button key={i} onClick={() => setSelectedSizeIdx(i)} className={`relative px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedSizeIdx === i ? "bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white shadow-lg" : "bg-white/5 border border-white/10 text-white/60 hover:bg-white/10"}`}>
                        {s.popular && <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-0.5 rounded-full font-bold whitespace-nowrap">Most Popular</span>}
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1A0030] border border-white/10 rounded-2xl p-6">
                  <h3 className="text-white font-bold text-lg mb-4">Select Add-on <span className="text-white/40 text-sm font-normal">(Optional)</span></h3>
                  <div className="space-y-3">
                    {ADDONS.map((addon) => (
                      <label key={addon.id} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${selectedAddon === addon.id ? "border-[#8E2DE2] bg-[#4A00E0]/10" : "border-white/10 hover:border-white/20"}`} onClick={() => setSelectedAddon(selectedAddon === addon.id ? null : addon.id)}>
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddon === addon.id ? "border-[#8E2DE2] bg-[#8E2DE2]" : "border-white/30"}`}>
                            {selectedAddon === addon.id && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                          <span className="text-white/80 text-sm font-medium">{addon.label}</span>
                        </div>
                        <span className="text-white/50 text-sm">{addon.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <CheckoutSummary
                productName={productName}
                size={size}
                plan={plan}
                selectedAddonData={selectedAddonData}
                finalTotal={finalTotal}
                onNext={() => setStep(2)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="max-w-2xl mx-auto">
              <div className="bg-[#1A0030] border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                  <button onClick={() => setStep(1)} className="text-white/60 hover:text-white transition-colors flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back</button>
                  <h3 className="text-white font-bold text-lg">Billing Details</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Title</label>
                    <div className="relative">
                      <select
                        value={billing.title}
                        onChange={(e) => setBilling({ ...billing, title: e.target.value })}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white appearance-none focus:border-[#8E2DE2] focus:outline-none transition-colors"
                      >
                        <option value="" className="bg-[#1A0030]">Title</option>
                        <option value="Mr" className="bg-[#1A0030]">Mr</option>
                        <option value="Mrs" className="bg-[#1A0030]">Mrs</option>
                        <option value="Ms" className="bg-[#1A0030]">Ms</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">First Name</label>
                      <Input value={billing.firstName} onChange={(e) => setBilling({ ...billing, firstName: e.target.value })} placeholder="First Name" className="h-11 bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Last Name</label>
                      <Input value={billing.lastName} onChange={(e) => setBilling({ ...billing, lastName: e.target.value })} placeholder="Last Name" className="h-11 bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Street</label>
                    <Input value={billing.street} onChange={(e) => setBilling({ ...billing, street: e.target.value })} placeholder="Enter Street" className="h-11 bg-white/5 border-white/10 text-white" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">City</label>
                      <Input value={billing.city} onChange={(e) => setBilling({ ...billing, city: e.target.value })} placeholder="City" className="h-11 bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Postal Code</label>
                      <Input value={billing.postalCode} onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })} placeholder="Postal Code" className="h-11 bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>
                  <div>
                    <label className="text-white/60 text-sm mb-1.5 block">Country</label>
                    <div className="relative">
                      <select
                        value={billing.country}
                        onChange={(e) => setBilling({ ...billing, country: e.target.value })}
                        className="w-full h-11 bg-white/5 border border-white/10 rounded-xl px-4 text-white appearance-none focus:border-[#8E2DE2] focus:outline-none transition-colors"
                      >
                        <option value="India" className="bg-[#1A0030]">India</option>
                        <option value="Nepal" className="bg-[#1A0030]">Nepal</option>
                        <option value="Sri Lanka" className="bg-[#1A0030]">Sri Lanka</option>
                        <option value="Bangladesh" className="bg-[#1A0030]">Bangladesh</option>
                        <option value="Other" className="bg-[#1A0030]">Other</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Phone Number</label>
                      <Input value={billing.phone} onChange={(e) => setBilling({ ...billing, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="h-11 bg-white/5 border-white/10 text-white" />
                    </div>
                    <div>
                      <label className="text-white/60 text-sm mb-1.5 block">Email</label>
                      <Input value={billing.email} onChange={(e) => setBilling({ ...billing, email: e.target.value })} placeholder="you@example.com" type="email" className="h-11 bg-white/5 border-white/10 text-white" />
                    </div>
                  </div>

                  {!isSignedIn && (
                    <div className="pt-2 mt-2 border-t border-white/10">
                      <p className="text-white/70 text-sm font-semibold mb-1">Create your account password</p>
                      <p className="text-white/40 text-xs mb-4">You'll be signed in automatically after payment and taken to your dashboard.</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Password</label>
                          <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                            <Input
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="At least 8 characters"
                              type={showPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="h-11 bg-white/5 border-white/10 text-white pl-9 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword((s) => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                              aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="text-white/60 text-sm mb-1.5 block">Confirm Password</label>
                          <div className="relative">
                            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                            <Input
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              className="h-11 bg-white/5 border-white/10 text-white pl-9 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((s) => !s)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                      {password.length > 0 && password.length < 8 && (
                        <p className="text-amber-400/80 text-xs mt-2">Password must be at least 8 characters.</p>
                      )}
                      {confirmPassword.length > 0 && password !== confirmPassword && (
                        <p className="text-red-400/80 text-xs mt-2">Passwords do not match.</p>
                      )}
                    </div>
                  )}
                </div>

                <Button onClick={() => setTermsOpen(true)} disabled={!billingValid || !credentialsValid} className="w-full h-12 mt-6 text-base font-bold bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white border-0 disabled:opacity-40">Proceed To Pay</Button>
              </div>

              <TermsModal open={termsOpen} onClose={() => setTermsOpen(false)} onAgree={() => setStep(3)} />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5 relative">
              <PaymentSidebar
                finalTotal={finalTotal}
                origNum={origNum}
                productName={productName}
                couponDiscount={couponDiscount}
                appliedCoupon={appliedCoupon}
              />

              <div className="relative">
                <div className="bg-gradient-to-b from-[#0e0930] to-[#070218] border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="relative flex items-center gap-4 mb-6">
                    <button onClick={() => { setStep(2); setPayCategory(null); }} className="text-white/50 hover:text-white transition-colors flex items-center gap-1 text-sm"><ArrowLeft size={16} /> Back</button>
                    <div className="h-4 w-px bg-white/10" />
                    <h3 className="text-white font-bold text-lg">
                      {payCategory === "upi" ? "Scan QR to Pay" : payCategory === "card" ? "Card Payment" : payCategory === "crypto" ? "Crypto Payment" : "Select Payment Method"}
                    </h3>
                  </div>

                  {!payCategory ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <button onClick={() => { setPayCategory("upi"); setSelectedPayment("upi-qr"); }} className="group relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-[#4A00E0]/15 hover:to-[#8E2DE2]/10 border border-white/10 hover:border-[#8E2DE2]/40 rounded-2xl p-5 text-left transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#4A00E0] to-[#8E2DE2] flex items-center justify-center"><QrCode size={22} className="text-white" /></div>
                        </div>
                        <div className="text-white font-extrabold text-base mb-1">UPI / QR Code</div>
                        <div className="text-[#c79bff] font-bold text-lg">₹{finalTotal.toLocaleString("en-IN")}</div>
                      </button>

                      <button onClick={() => { setPayCategory("card"); setSelectedPayment("razorpay-card"); }} className="group relative bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-blue-600/15 hover:to-indigo-600/10 border border-white/10 hover:border-blue-500/40 rounded-2xl p-5 text-left transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <RazorpayLogo size="lg" />
                          <span className="bg-emerald-500/15 text-emerald-400 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-500/30">RECOMMENDED</span>
                        </div>
                        <div className="text-white font-extrabold text-sm mb-1">Card &amp; Netbanking</div>
                        <div className="text-white font-extrabold text-sm mb-2">UPI / QR Code</div>
                        <div className="text-blue-300 font-bold text-lg">₹{finalTotal.toLocaleString("en-IN")}</div>
                      </button>

                      <button onClick={() => setPayCategory("crypto")} className="group relative sm:col-span-2 bg-gradient-to-br from-white/[0.06] to-white/[0.02] hover:from-emerald-600/15 hover:to-teal-600/10 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-5 text-left transition-all">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"><span className="text-white font-extrabold text-lg">₿</span></div>
                        </div>
                        <div className="text-white font-extrabold text-base mb-1">Crypto (USDT, BTC, ETH)</div>
                        <div className="text-emerald-300 font-bold text-lg">≈ ₹{finalTotal.toLocaleString("en-IN")}</div>
                      </button>
                    </div>
                  ) : payCategory === "upi" ? (
                    <PaymentUPI
                      paySecondsLeft={paySecondsLeft}
                      fmtTimer={fmtTimer}
                      qrSrc={qrSrc}
                      FW_MERCHANT_NAME={FW_MERCHANT_NAME}
                      FW_UPI_ID={FW_UPI_ID}
                      finalTotal={finalTotal}
                      copiedField={copiedField}
                      copyToField={copyToField}
                      utrInput={utrInput}
                      setUtrInput={(v) => { setUtrInput(v); setUtrError(""); }}
                      utrStatus={utrStatus}
                      utrError={utrError}
                      handleVerifyUtr={handleVerifyUtr}
                      onCancel={() => { setPayCategory(null); setUtrStatus("idle"); setUtrInput(""); setUtrError(""); }}
                    />
                  ) : payCategory === "card" ? (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-3 gap-3 mb-6">
                        {[
                          { id: "razorpay-card", label: "Debit / Credit Card", icon: <CreditCard size={20} />, desc: "Visa, Mastercard, RuPay, Amex" },
                          { id: "razorpay-netbanking", label: "Net Banking", icon: <Building2 size={20} />, desc: "All major Indian banks" },
                          { id: "razorpay-wallet", label: "Wallets & UPI / QR Code", icon: <Smartphone size={20} />, desc: "Paytm, Amazon Pay, Mobikwik" },
                        ].map(o => (
                          <button
                            key={o.id}
                            onClick={() => setSelectedPayment(o.id)}
                            className={`p-4 rounded-xl text-left border transition-all ${selectedPayment === o.id ? "bg-blue-500/10 border-blue-400 shadow-lg shadow-blue-500/20" : "bg-white/3 border-white/10 hover:border-white/30"}`}
                          >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${selectedPayment === o.id ? "bg-blue-500/20 text-blue-300" : "bg-white/5 text-white/60"}`}>{o.icon}</div>
                            <div className="text-white font-bold text-sm">{o.label}</div>
                            <div className="text-white/40 text-[11px] mt-0.5">{o.desc}</div>
                          </button>
                        ))}
                      </div>
                      <Button onClick={() => handleRazorpayPayment(selectedPayment, selectedPlan, selectedSizeIdx, appliedCoupon, billing, finalTotal, productName)} disabled={razorpayLoading || !selectedPayment?.startsWith("razorpay-")} className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold gap-2">
                        {razorpayLoading ? "Opening Razorpay…" : <><ExternalLink size={16} /> Pay ₹{finalTotal.toLocaleString("en-IN")} via <RazorpayLogo size="md" /></>}
                      </Button>
                      {razorpayError && <p className="text-red-400 text-xs">{razorpayError}</p>}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-3 mb-6">
                        {PAYMENT_METHODS.filter(m => m.group === "crypto").map((method) => (
                          <button key={method.id} onClick={() => setSelectedPayment(method.id)} className={`flex items-center gap-3 p-4 rounded-xl border transition-all text-left w-full ${selectedPayment === method.id ? "border-emerald-400 bg-emerald-500/10" : "border-white/10 bg-white/3"}`}>
                            <span className="text-[11px] font-bold text-white/70 bg-white/10 rounded-md px-2 py-1.5 min-w-[52px] text-center shrink-0">{method.icon}</span>
                            <div className="flex-1 min-w-0"><div className="text-white font-bold text-sm">{method.label}</div><div className="text-white/40 text-[11px] truncate">{method.desc}</div></div>
                          </button>
                        ))}
                      </div>
                      <Button onClick={() => handleOxaPayPayment(selectedPayment, selectedPlan, selectedSizeIdx, appliedCoupon, referralCode, billing, finalTotal, !isSignedIn ? password : undefined)} disabled={oxapayLoading || !selectedPayment?.startsWith("oxapay-")} className="w-full h-12 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold gap-2">
                        {oxapayLoading ? "Redirecting…" : <><ExternalLink size={16} /> Continue with OxaPay</>}
                      </Button>
                      {oxapayError && <p className="text-red-400 text-xs">{oxapayError}</p>}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
