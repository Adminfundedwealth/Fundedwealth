/**
 * Payment Pending Page
 *
 * Supports two flows:
 * 1. OxaPay (crypto): Polls /api/payments/payment-status/:trackId
 *    URL: /payment-pending?trackId=xxx&plan=1step&amount=4999
 *
 * 2. UPI Manual (UTR): Polls /api/accounts/my for provisioning status
 *    URL: /payment-pending?orderId=xxx&plan=flash&amount=1999&method=upi
 *
 * Transitions to success or failure once the status is known.
 */

import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import {
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ShieldCheck,
  ArrowRight,
  Bitcoin,
  Loader2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

// ── Types ─────────────────────────────────────────────────────────────────────

type PayStatus =
  | "checking"    // initial / polling
  | "Waiting"     // OxaPay: address created, waiting for crypto to arrive
  | "Confirming"  // blockchain confirmations in progress
  | "Paid"        // confirmed → success
  | "Failed"      // payment failed
  | "Expired"     // invoice expired
  | "provisioning" // UTR: order paid, provisioning in progress
  | "completed"   // UTR: provisioning completed
  | "error";      // API call failed

type FlowType = "crypto" | "upi";

// ── Helpers ───────────────────────────────────────────────────────────────────

function getQueryParam(search: string, key: string): string | null {
  const params = new URLSearchParams(search);
  return params.get(key);
}

function getStatusConfig(status: PayStatus, flow: FlowType) {
  switch (status) {
    case "checking":
    case "Waiting":
      return {
        icon: <Clock size={56} className="text-amber-400" />,
        ring: "border-amber-400/40",
        bg: "from-amber-500/10 to-amber-500/5",
        title: flow === "upi" ? "Setting up your account" : "Waiting for your payment",
        subtitle: flow === "upi"
          ? "Your payment was verified. We're provisioning your trading account now…"
          : status === "checking"
            ? "Looking up your transaction…"
            : "Send crypto to the address shown on OxaPay. This page updates automatically.",
        color: "text-amber-400",
      };
    case "provisioning":
      return {
        icon: <RefreshCw size={56} className="text-blue-400 animate-spin" style={{ animationDuration: "2s" }} />,
        ring: "border-blue-400/40",
        bg: "from-blue-500/10 to-blue-500/5",
        title: "Provisioning your account",
        subtitle: "Your payment is confirmed. We're creating your trading account — this usually takes 30–60 seconds.",
        color: "text-blue-400",
      };
    case "Confirming":
      return {
        icon: <RefreshCw size={56} className="text-blue-400 animate-spin" style={{ animationDuration: "2s" }} />,
        ring: "border-blue-400/40",
        bg: "from-blue-500/10 to-blue-500/5",
        title: "Confirming on blockchain",
        subtitle: "Your crypto arrived — waiting for network confirmations. This usually takes 1–10 minutes.",
        color: "text-blue-400",
      };
    case "Paid":
    case "completed":
      return {
        icon: <CheckCircle2 size={56} className="text-emerald-400" />,
        ring: "border-emerald-400/40",
        bg: "from-emerald-500/15 to-emerald-500/5",
        title: "Account activated!",
        subtitle: "Your trading account is ready. You can now start trading on your challenge account.",
        color: "text-emerald-400",
      };
    case "Failed":
      return {
        icon: <XCircle size={56} className="text-red-400" />,
        ring: "border-red-400/40",
        bg: "from-red-500/10 to-red-500/5",
        title: "Provisioning failed",
        subtitle: flow === "upi"
          ? "Something went wrong while setting up your account. Please contact support — your payment is safe."
          : "Something went wrong with your crypto payment. Please try again or contact support.",
        color: "text-red-400",
      };
    case "Expired":
      return {
        icon: <XCircle size={56} className="text-orange-400" />,
        ring: "border-orange-400/40",
        bg: "from-orange-500/10 to-orange-500/5",
        title: "Payment expired",
        subtitle: "The payment invoice expired before funds arrived. Please start a new order.",
        color: "text-orange-400",
      };
    case "error":
    default:
      return {
        icon: <XCircle size={56} className="text-gray-400" />,
        ring: "border-gray-400/40",
        bg: "from-gray-500/10 to-gray-500/5",
        title: "Could not check status",
        subtitle: "We couldn't reach our server. Your payment may still be processing — check your email or contact support.",
        color: "text-gray-400",
      };
  }
}

const CRYPTO_POLL_INTERVAL_MS = 8000;
const UPI_POLL_INTERVAL_MS = 4000;
const MAX_POLLS = 150; // ~10 min for UPI at 4s intervals

// ── Component ─────────────────────────────────────────────────────────────────

export default function PaymentPending() {
  const [, navigate] = useLocation();
  const { getToken, isLoaded } = useAuth();

  const search = window.location.search;
  const initialTrackId = getQueryParam(search, "trackId");
  const initialOrderId = getQueryParam(search, "orderId");
  const initialPlan = getQueryParam(search, "plan") ?? "";
  const initialAmount = getQueryParam(search, "amount") ?? "";
  const initialMethod = getQueryParam(search, "method") ?? "";

  // Determine flow type
  const flow: FlowType = initialOrderId && initialMethod === "upi" ? "upi" : "crypto";

  const [trackId, setTrackId] = useState<string | null>(initialTrackId);
  const [orderId] = useState<string | null>(initialOrderId);
  const [plan, setPlan] = useState<string>(initialPlan);
  const [amount, setAmount] = useState<string>(initialAmount);
  const [status, setStatus] = useState<PayStatus>("checking");
  const [pollCount, setPollCount] = useState(0);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [apiError, setApiError] = useState("");

  // ── Crypto: recover from localStorage ──────────────────────────────────────
  useEffect(() => {
    if (flow !== "crypto" || trackId) return;

    const stored = window.localStorage.getItem("oxapay_pending") || window.sessionStorage.getItem("oxapay_pending");
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (!parsed?.trackId) return;

      setTrackId(parsed.trackId);
      if (parsed.plan) setPlan(parsed.plan);
      if (parsed.amount) setAmount(String(parsed.amount));

      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("trackId", parsed.trackId);
      if (parsed.plan) searchParams.set("plan", parsed.plan);
      if (parsed.amount) searchParams.set("amount", String(parsed.amount));
      const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
      window.history.replaceState({}, "", newUrl);
    } catch {
      // Ignore invalid stored state.
    }
  }, [flow, trackId]);

  // ── Cleanup storage on terminal state ──────────────────────────────────────
  useEffect(() => {
    if (flow === "crypto" && trackId && ["Paid", "Failed", "Expired", "error"].includes(status)) {
      window.localStorage.removeItem("oxapay_pending");
      window.sessionStorage.removeItem("oxapay_pending");
    }
  }, [flow, status, trackId]);

  // ── Poll: Crypto flow (OxaPay) ─────────────────────────────────────────────
  const checkCryptoStatus = useCallback(async () => {
    if (!trackId) {
      setStatus("error");
      setApiError("No trackId in URL — cannot check payment status.");
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || "";
      const token = isLoaded ? await getToken().catch(() => null) : null;

      const res = await fetch(`${apiBase}/api/payments/payment-status/${trackId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      });

      setLastChecked(new Date());

      if (res.status === 401 || res.status === 403) return;

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success && data.status) {
        const s = data.status as PayStatus;
        setStatus(s);

        if (s === "Paid") {
          setTimeout(() => navigate("/dashboard?payment=success&method=crypto"), 2500);
        }
      } else if (!res.ok) {
        setApiError(data.message || data.error || "Status check failed");
      }
    } catch {
      // Network error — keep polling silently
    }
  }, [trackId, isLoaded, getToken, navigate]);

  // ── Poll: UPI flow (provisioning status via public endpoint) ─────────────
  const checkUpiStatus = useCallback(async () => {
    if (!orderId) {
      setStatus("error");
      setApiError("No orderId — cannot check provisioning status.");
      return;
    }

    try {
      const apiBase = import.meta.env.VITE_API_URL || "";

      const res = await fetch(`${apiBase}/api/payments/provisioning-status/${orderId}`, {
        credentials: "include",
      });

      setLastChecked(new Date());

      if (res.status === 404) {
        setStatus("error");
        setApiError("Order not found. Please contact support.");
        return;
      }

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if (data.status === "completed") {
          setStatus("completed");
          setTimeout(() => navigate("/dashboard?payment=success&method=upi"), 2500);
        } else if (data.status === "failed") {
          setStatus("Failed");
          setApiError(data.error || "Provisioning failed. Contact support.");
        } else {
          // pending
          setStatus("provisioning");
        }
      } else if (!res.ok) {
        setApiError(data.message || data.error || "Status check failed");
      }
    } catch {
      // Network error — keep polling silently
    }
  }, [orderId, navigate]);

  // ── Unified check function ─────────────────────────────────────────────────
  const checkStatus = flow === "upi" ? checkUpiStatus : checkCryptoStatus;
  const pollInterval = flow === "upi" ? UPI_POLL_INTERVAL_MS : CRYPTO_POLL_INTERVAL_MS;

  // ── Effect: poll on mount + interval ───────────────────────────────────────
  useEffect(() => {
    if (flow === "crypto" && !trackId) {
      setStatus("error");
      return;
    }
    if (flow === "upi" && !orderId) {
      setStatus("error");
      return;
    }

    // Immediate first check
    checkStatus();

    const interval = setInterval(() => {
      setPollCount((c) => {
        const next = c + 1;
        if (next >= MAX_POLLS) {
          clearInterval(interval);
          return next;
        }
        checkStatus();
        return next;
      });
    }, pollInterval);

    return () => clearInterval(interval);
  }, [flow, trackId, orderId, checkStatus, pollInterval]);

  const cfg = getStatusConfig(status, flow);
  const isTerminal = ["Paid", "Failed", "Expired", "error", "completed"].includes(status);
  const isPending = ["checking", "Waiting", "Confirming", "provisioning"].includes(status);
  const referenceId = flow === "upi" ? orderId : trackId;

  return (
    <div className="min-h-screen bg-[#0D0020] text-white flex flex-col">
      <SEOHead
        title="Payment Processing — FundedWealth"
        description="Your payment is being processed."
        noindex={true}
      />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#1A0030]/95 backdrop-blur-md border-b border-white/10 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white/70 hover:text-white">
            <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 rounded-lg" />
            <span className="font-bold">FundedWealth</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-white/40">
            <ShieldCheck size={14} />
            <span>{flow === "upi" ? "UPI Payment Verified" : "Secured by OxaPay"}</span>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Status card */}
          <div className={`bg-gradient-to-br ${cfg.bg} border ${cfg.ring} rounded-3xl p-8 text-center mb-6`}>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`w-28 h-28 rounded-full border-4 ${cfg.ring} bg-[#0D0020]/60 flex items-center justify-center`}>
                {cfg.icon}
              </div>
            </div>

            {/* Title */}
            <h1 className={`text-2xl font-bold mb-2 ${cfg.color}`}>
              {cfg.title}
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {cfg.subtitle}
            </p>

            {/* Order summary */}
            {(plan || amount) && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 text-left space-y-2">
                {plan && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Plan</span>
                    <span className="text-white font-semibold capitalize">{plan}</span>
                  </div>
                )}
                {amount && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Amount</span>
                    <span className="text-white font-semibold">₹{Number(amount).toLocaleString("en-IN")}</span>
                  </div>
                )}
                {flow === "upi" && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Method</span>
                    <span className="text-white/70 font-semibold">UPI Manual Transfer</span>
                  </div>
                )}
                {referenceId && (
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">{flow === "upi" ? "Order ID" : "Track ID"}</span>
                    <span className="text-white/70 font-mono text-xs truncate max-w-[180px]">{referenceId}</span>
                  </div>
                )}
              </div>
            )}

            {/* Polling indicator */}
            {isPending && (
              <div className="flex items-center justify-center gap-2 text-white/40 text-xs mb-4">
                <Loader2 size={12} className="animate-spin" />
                <span>
                  Checking status automatically
                  {lastChecked && ` · last checked ${lastChecked.toLocaleTimeString()}`}
                </span>
              </div>
            )}

            {/* Pulse animation dots for pending */}
            {isPending && (
              <div className="flex justify-center gap-2 mb-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-white/30 animate-bounce"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Info box for pending states */}
          {isPending && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 mb-6">
              <div className="flex items-start gap-3">
                {flow === "upi" ? (
                  <Smartphone size={20} className="text-blue-400 shrink-0 mt-0.5" />
                ) : (
                  <Bitcoin size={20} className="text-blue-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-blue-300 text-sm font-semibold mb-1">
                    {flow === "upi" ? "What's happening now" : "How crypto payments work"}
                  </p>
                  <ul className="text-white/50 text-xs space-y-1 list-disc list-inside">
                    {flow === "upi" ? (
                      <>
                        <li>Your UPI payment has been verified</li>
                        <li>We're creating your challenge trading account</li>
                        <li>You'll get login credentials via email</li>
                        <li>This usually takes under 60 seconds</li>
                      </>
                    ) : (
                      <>
                        <li>You send crypto to the OxaPay address</li>
                        <li>Blockchain confirms the transaction (1–10 min)</li>
                        <li>We activate your account automatically</li>
                        <li>You get a confirmation email</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {(status === "Paid" || status === "completed") && (
              <Button
                onClick={() => navigate(`/dashboard?payment=success&method=${flow}`)}
                className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold"
              >
                Go to Dashboard <ArrowRight size={18} className="ml-2" />
              </Button>
            )}

            {(status === "Failed" || status === "Expired") && (
              <>
                <Button
                  onClick={() => navigate("/checkout")}
                  className="w-full h-12 bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold"
                >
                  Try Again <ArrowRight size={18} className="ml-2" />
                </Button>
                {flow === "upi" && (
                  <p className="text-center text-white/50 text-xs">
                    Your payment is safe. Contact{" "}
                    <a href="mailto:support@fundedwealth.in" className="text-white/70 underline">
                      support@fundedwealth.in
                    </a>{" "}
                    if you need help.
                  </p>
                )}
              </>
            )}

            {isPending && (
              <Button
                onClick={checkStatus}
                variant="outline"
                className="w-full h-12 border-white/20 text-white/70 hover:text-white hover:border-white/40"
              >
                <RefreshCw size={16} className="mr-2" />
                Check Now
              </Button>
            )}

            <Button
              onClick={() => navigate("/dashboard")}
              variant="ghost"
              className="w-full h-10 text-white/40 hover:text-white/60 text-sm"
            >
              Go to Dashboard
            </Button>
          </div>

          {/* Support line */}
          <p className="text-center text-white/30 text-xs mt-6">
            Questions?{" "}
            <a
              href="mailto:support@fundedwealth.in"
              className="text-white/50 hover:text-white underline"
            >
              support@fundedwealth.in
            </a>
            {referenceId && (
              <span className="block mt-1">Quote {flow === "upi" ? "Order" : "Track"} ID: {referenceId}</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
