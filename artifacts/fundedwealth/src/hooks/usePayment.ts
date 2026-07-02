import { useState } from "react";
import { PlanType } from "../config/checkout";

interface BillingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city?: string;
  state?: string;
  zipcode?: string;
  address?: string;
  title?: string;
  street?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Resolve the API base URL:
 * - In production: VITE_API_URL is set to the Render backend (e.g. https://fundedwealth-api.onrender.com)
 * - In development: Use empty string so requests go to /api/* which Vite proxies to localhost:9000
 *
 * The key insight: in dev, VITE_API_URL = "http://localhost:9000" but if that server
 * isn't running, fetch fails. Using "" lets Vite's built-in proxy handle it, OR
 * if the backend is on Render, we hit it directly in production.
 */
function getApiBase(): string {
  const configured = import.meta.env.VITE_API_URL || "";
  // In dev mode, prefer relative paths (Vite proxy handles /api → localhost:9000)
  // In production, use the configured URL directly
  if (import.meta.env.DEV) {
    return ""; // Vite proxy: /api → http://localhost:9000/api
  }
  return configured;
}

export const usePayment = (
  getToken: () => Promise<string | null>,
  isLoaded: boolean,
  signIn?: (email: string, password: string) => Promise<{ error: string | null }>
) => {
  const [oxapayLoading, setOxapayLoading] = useState(false);
  const [oxapayError, setOxapayError] = useState("");
  const [razorpayLoading, setRazorpayLoading] = useState(false);
  const [razorpayError, setRazorpayError] = useState("");

  const handleOxaPayPayment = async (
    selectedPayment: string | null,
    selectedPlan: PlanType,
    selectedSizeIdx: number,
    appliedCoupon: string,
    referralCode: string | null,
    billing: BillingInfo,
    finalTotal: number,
    password?: string
  ) => {
    if (!selectedPayment?.startsWith("oxapay-")) return;
    setOxapayLoading(true);
    setOxapayError("");
    try {
      const apiBase = getApiBase();
      const token = isLoaded ? await getToken().catch(() => null) : null;
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${apiBase}/api/payments/create-crypto-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        signal: controller.signal,
        body: JSON.stringify({
          paymentMethod: selectedPayment,
          planType: selectedPlan,
          sizeIndex: selectedSizeIdx,
          couponCode: appliedCoupon || undefined,
          referralCode: referralCode || undefined,
          billing,
          password: password || undefined,
          captchaToken: (window as any).__turnstileToken || undefined,
        }),
      });
      clearTimeout(timeout);
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success && data.payLink) {
        const pendingUrl = `${window.location.origin}/payment-pending?trackId=${encodeURIComponent(data.trackId)}&plan=${encodeURIComponent(selectedPlan)}&amount=${encodeURIComponent(finalTotal)}`;
        localStorage.setItem("oxapay_pending", JSON.stringify({
          trackId: data.trackId,
          plan: selectedPlan,
          amount: finalTotal,
          pendingUrl,
        }));
        window.location.href = data.payLink;
      } else {
        setOxapayError(data.message || data.error || "Payment creation failed. Please try again.");
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") {
        setOxapayError("Payment request timed out. The server may be starting up — please wait 30 seconds and try again.");
      } else {
        setOxapayError("Could not reach the payment server. If you're testing locally, ensure the backend is running on port 9000.");
      }
    } finally {
      setOxapayLoading(false);
    }
  };

  const handleRazorpayPayment = async (
    selectedPayment: string | null,
    selectedPlan: PlanType,
    selectedSizeIdx: number,
    appliedCoupon: string,
    billing: { firstName: string; lastName: string; email: string; phone: string },
    finalTotal: number,
    productName: string,
    password?: string
  ) => {
    if (!selectedPayment?.startsWith("razorpay-")) return;
    setRazorpayLoading(true);
    setRazorpayError("");
    try {
      const apiBase = getApiBase();
      const token = isLoaded ? await getToken().catch(() => null) : null;
      const res = await fetch(`${apiBase}/api/razorpay/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({ amount: finalTotal, planType: selectedPlan, sizeIndex: selectedSizeIdx, couponCode: appliedCoupon || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.order?.id) {
        setRazorpayError(data.message || data.error || "Could not create payment order. Please try again.");
        setRazorpayLoading(false);
        return;
      }

      const options: any = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
        amount: data.order.amount,
        currency: data.order.currency || "INR",
        name: "FundedWealth",
        description: productName,
        order_id: data.order.id,
        image: "/logo.png",
        prefill: {
          name: `${billing.firstName} ${billing.lastName}`.trim(),
          email: billing.email,
          contact: billing.phone,
        },
        theme: { color: "#4A00E0" },
        method: selectedPayment === "razorpay-netbanking" ? { netbanking: true } :
          selectedPayment === "razorpay-wallet" ? { wallet: true } :
            { card: true, upi: false },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${apiBase}/api/razorpay/verify-payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              credentials: "include",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount: finalTotal,
                planType: selectedPlan,
                sizeIndex: selectedSizeIdx,
                couponCode: appliedCoupon || undefined,
                billing,
                password: password || undefined,
              }),
            });
            const verifyData = await verifyRes.json().catch(() => ({}));
            if (verifyRes.ok && verifyData.success) {
              // Same guest flow as UPI: the backend created/linked the Supabase
              // auth identity using the chosen password. Sign in now so the user
              // lands authenticated on the dashboard — never the login page.
              const loginEmail = verifyData.loginEmail || billing.email;
              if (signIn && password && loginEmail) {
                const { error: signInError } = await signIn(loginEmail, password);
                if (!signInError) {
                  // Wait for session persistence before full-page nav
                  await new Promise((r) => setTimeout(r, 300));
                }
              }
              // Redirect to success page with orderId to display credentials
              const orderId = verifyData.orderId;
              if (orderId) {
                window.location.href = `/purchase-success?orderId=${encodeURIComponent(orderId)}`;
              } else {
                // Fallback to accounts page if no orderId
                window.location.href = "/dashboard/accounts";
              }
            } else {
              setRazorpayError("Payment verification failed. Contact support with your payment ID: " + response.razorpay_payment_id);
            }
          } catch {
            setRazorpayError("Could not verify payment. Contact support if amount was deducted.");
          }
          setRazorpayLoading(false);
        },
        modal: {
          ondismiss: () => {
            setRazorpayLoading(false);
            setRazorpayError("Payment cancelled. You can try again.");
          },
        },
      };
      if (typeof (window as any).Razorpay === "undefined") {
        setRazorpayError("Razorpay SDK is loading. Please wait a moment and try again.");
        setRazorpayLoading(false);
        return;
      }
      const rzp = new (window as any).Razorpay(options);      rzp.on("payment.failed", (response: any) => {
        setRazorpayError("Payment failed: " + (response.error?.description || "Unknown error"));
        setRazorpayLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      setRazorpayError("Could not reach the payment server. If you're testing locally, ensure the backend is running on port 9000.");
      setRazorpayLoading(false);
    }
  };

  return {
    oxapayLoading,
    oxapayError,
    razorpayLoading,
    razorpayError,
    handleOxaPayPayment,
    handleRazorpayPayment,
  };
};
