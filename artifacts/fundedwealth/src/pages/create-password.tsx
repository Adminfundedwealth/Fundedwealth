/**
 * /auth/create-password?token=<onboarding-token>
 *
 * One-time page shown to first-time purchasers so they can set their
 * website password.  After the password is saved the user is auto-signed-in
 * and redirected to the dashboard.  onboarding_completed is flipped on the
 * backend so the token (and this page) can never be used again.
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff, Lock, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SEOHead from "@/components/SEOHead";
import { getApiBase } from "@/lib/api-base";

type PageState = "idle" | "submitting" | "done" | "error" | "already_done" | "invalid_token";

export default function CreatePasswordPage() {  const [, navigate] = useLocation();

  // Extract token from URL
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [state, setState] = useState<PageState>(token ? "idle" : "invalid_token");
  const [errorMsg, setErrorMsg] = useState("");
  const isSubmitting = state === "submitting";

  // If no token: check if user is already signed in → redirect to dashboard
  // If token present but user already onboarded → redirect to dashboard  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // Not signed in - if no token, show invalid link
        if (!token) setState("invalid_token");
        return;
      }
      
      // Signed in - check onboarding status
      const apiUrl = getApiBase();
      fetch(`${apiUrl}/api/auth/onboarding-status`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
        .then((r) => r.json())
        .then((d) => {
          if (d.onboardingCompleted) {
            // Already onboarded - redirect to dashboard
            navigate("/dashboard", { replace: true });
          } else if (!token) {
            // Not onboarded but no token - invalid state
            setState("invalid_token");
          }
        })
        .catch(() => {
          // Error checking status - if no token, show invalid
          if (!token) setState("invalid_token");
        });
    });
  }, [token, navigate]);

  const pwOk = password.length >= 8;
  const match = password === confirm;
  const canSubmit = pwOk && match && (state === "idle" || state === "error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setState("submitting");
    setErrorMsg("");

    try {      const apiUrl = getApiBase();
      const res = await fetch(`${apiUrl}/api/auth/create-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.alreadyCompleted) {
          setState("already_done");
        } else {
          setErrorMsg(data.error || "Something went wrong. Please try again.");
          setState("idle");
        }
        return;
      }

      // Set the Supabase session in the client so the user is logged in
      if (data.session?.access_token && data.session?.refresh_token) {
        await supabase.auth.setSession({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }

      setState("done");
      setTimeout(() => navigate("/dashboard?payment=success", { replace: true }), 1500);
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setState("idle");
    }
  }

  /* ── Render ────────────────────────────────────────────────────────── */

  if (state === "invalid_token") {
    return <StatusCard icon="error" title="Invalid link" body="This password setup link requires a valid setup token from your purchase confirmation email.">
      <div className="mt-4 space-y-2">
        <p className="text-white/50 text-xs text-left">If you need to reset your password:</p>
        <Button onClick={() => navigate("/sign-in", { replace: true })} className="w-full bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold">
          Go to Sign In → Use "Forgot Password"
        </Button>
      </div>
    </StatusCard>;
  }
  if (state === "already_done") {
    return (
      <StatusCard icon="ok" title="Password already set" body="Your account is ready to go.">
        <Button onClick={() => navigate("/sign-in", { replace: true })} className="mt-4 w-full bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold">
          Sign in
        </Button>
      </StatusCard>
    );
  }
  if (state === "done") {
    return <StatusCard icon="ok" title="Password set! Taking you to your dashboard…" body="" />;
  }

  return (
    <div className="min-h-screen bg-[#0D0020] flex items-center justify-center px-4">
      <SEOHead title="Set your password — FundedWealth" description="Create your account password to access your dashboard." noindex />

      <div className="w-full max-w-md bg-[#1A0030] border border-white/10 rounded-2xl p-8">
        <div className="flex justify-center mb-6">
          <img src="/logo.png" alt="FundedWealth" className="h-10 w-10 rounded-xl" />
        </div>
        <h1 className="text-2xl font-bold text-white text-center mb-1">Create your password</h1>
        <p className="text-white/50 text-sm text-center mb-8">
          One-time setup — you'll use this to sign in going forward.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Password */}
          <div>
            <label className="text-white/60 text-sm mb-1.5 block">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={showPw ? "text" : "password"}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                className="h-11 bg-white/5 border-white/10 text-white pl-9 pr-10"
              />
              <button type="button" onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showPw ? "Hide password" : "Show password"}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && !pwOk && (
              <p className="text-amber-400/80 text-xs mt-1">Minimum 8 characters.</p>
            )}
          </div>

          {/* Confirm */}
          <div>
            <label className="text-white/60 text-sm mb-1.5 block">Confirm password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                type={showCf ? "text" : "password"}
                placeholder="Re-enter password"
                autoComplete="new-password"
                className="h-11 bg-white/5 border-white/10 text-white pl-9 pr-10"
              />
              <button type="button" onClick={() => setShowCf((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
                aria-label={showCf ? "Hide password" : "Show password"}>
                {showCf ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirm.length > 0 && !match && (
              <p className="text-red-400/80 text-xs mt-1">Passwords do not match.</p>
            )}
          </div>

          {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}

          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="w-full h-12 mt-2 bg-gradient-to-r from-[#4A00E0] to-[#8E2DE2] text-white font-bold text-base"
          >
            {isSubmitting
              ? <><Loader2 size={18} className="animate-spin mr-2" /> Setting password…</>
              : "Set password & open dashboard"}
          </Button>
        </form>
      </div>
    </div>
  );
}

/* ── Shared status card ───────────────────────────────────────────────── */
function StatusCard({ icon, title, body, children }: {
  icon: "ok" | "error";
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0D0020] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#1A0030] border border-white/10 rounded-2xl p-8 text-center">
        {icon === "ok"
          ? <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-4" />
          : <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400 text-2xl font-bold">!</div>}
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        {body && <p className="text-white/50 text-sm">{body}</p>}
        {children}
      </div>
    </div>
  );
}
