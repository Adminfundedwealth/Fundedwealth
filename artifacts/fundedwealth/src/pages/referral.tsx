import { useEffect, useState } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";

export default function ReferralLandingPage() {
  const [match, params] = useRoute("/ref/:code");
  const code = params?.code;
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!code) {
      setStatus("error");
      setMessage("Referral code is missing from the URL.");
      return;
    }

    const savedCode = window.localStorage.getItem("fw_referral_code");
    if (savedCode !== code) {
      window.localStorage.setItem("fw_referral_code", code);
    }

    const trackClick = async () => {
      setStatus("saving");
      try {
        const apiBase = import.meta.env.VITE_API_URL || "https://fundedwealth-api-production.up.railway.app";
        const res = await fetch(`${apiBase}/api/affiliate/click`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ referralCode: code }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Unable to record referral.");
        }
        setStatus("success");
        setMessage("Referral code saved. Start with sign-up or checkout to claim rewards.");
      } catch (error) {
        setStatus("error");
        setMessage(
          error instanceof Error ? error.message : "Failed to save referral code. You can still continue to checkout."
        );
      }
    };

    void trackClick();
  }, [code]);

  return (
    <div className="min-h-screen bg-[#0D0020] text-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-purple-900/10 backdrop-blur-sm">
        <div className="mb-8">
          <p className="mb-4 text-sm uppercase tracking-[0.4em] text-[#A085FF]">Referral landing page</p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">You’ve been referred.</h1>
          <p className="mt-4 text-base leading-7 text-slate-300">
            Your referral code <span className="font-semibold text-white">{code}</span> has been stored. Complete your signup or checkout to make it count.
          </p>
        </div>

        <div className="space-y-4 rounded-3xl bg-slate-950/80 p-6">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#A085FF]">Status</p>
            <p className="mt-2 text-lg font-medium text-slate-100">{status === "saving" ? "Recording your referral..." : status === "success" ? "Referral captured." : "Ready to continue."}</p>
            {message ? <p className="mt-3 text-sm text-slate-300">{message}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <a href="/sign-up" className="block">
              <Button className="w-full">Sign up now</Button>
            </a>
            <a href="/checkout" className="block">
              <Button variant="secondary" className="w-full">Continue to checkout</Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
