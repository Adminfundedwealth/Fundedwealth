/**
 * /reset-password — Password Reset Page
 *
 * Supabase sends the user here after clicking the reset link.
 * The URL will contain EITHER:
 *   - Fragment tokens:  #access_token=...&refresh_token=...&type=recovery  (implicit flow)
 *   - Query params:     ?code=...   (PKCE flow)
 *   - Query params:     ?token_hash=...&type=recovery   (email OTP)
 *
 * This page handles all three, establishes a valid session, then lets the
 * user enter their new password.
 */

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── Inject keyframes once ─────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("fw-reset-style")) {
  const s = document.createElement("style");
  s.id = "fw-reset-style";
  s.textContent = `
    @keyframes fw-float2 {
      0%,100% { transform: translateY(0px) scale(1); }
      50%      { transform: translateY(-18px) scale(1.04); }
    }
    @keyframes fw-pulse-glow2 {
      0%,100% { opacity: 0.55; }
      50%      { opacity: 1; }
    }
    @keyframes fw-card-glow2 {
      0%,100% { box-shadow: 0 0 0 1px rgba(139,92,246,0.35), 0 0 40px 8px rgba(139,92,246,0.25), 0 0 80px 20px rgba(74,0,224,0.15), 0 32px 64px rgba(0,0,0,0.55); }
      50%      { box-shadow: 0 0 0 1px rgba(255,138,61,0.4), 0 0 50px 14px rgba(139,92,246,0.35), 0 0 100px 30px rgba(74,0,224,0.22), 0 32px 64px rgba(0,0,0,0.55); }
    }
  `;
  document.head.appendChild(s);
}

const INPUT =
  "w-full h-12 px-4 rounded-xl text-sm text-white placeholder-white/30 outline-none transition " +
  "bg-white/[0.07] border border-white/[0.12] focus:border-[#8B5CF6] focus:bg-white/[0.11] focus:ring-2 focus:ring-[#8B5CF6]/25";

const LABEL = "block text-[12px] font-semibold text-white/60 mb-1.5 tracking-wide uppercase";

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Please wait…
    </span>
  );
}

type PageState = "loading" | "ready" | "expired" | "success" | "error";

export default function ResetPasswordPage() {
  const [pageState, setPageState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        // ── 1. PKCE flow: ?code=... ──────────────────────────────────────
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) {
            console.error("[reset-password] PKCE exchange failed:", error.message);
            setPageState(isExpiredError(error.message) ? "expired" : "error");
            setErrorMsg(error.message);
          } else {
            setPageState("ready");
          }
          return;
        }

        // ── 2. Email OTP / token_hash flow: ?token_hash=...&type=recovery ─
        const tokenHash = searchParams.get("token_hash");
        const type = searchParams.get("type");
        if (tokenHash && type === "recovery") {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "recovery",
          });
          if (error) {
            console.error("[reset-password] token_hash verify failed:", error.message);
            setPageState(isExpiredError(error.message) ? "expired" : "error");
            setErrorMsg(error.message);
          } else {
            setPageState("ready");
          }
          return;
        }

        // ── 3. Implicit / fragment flow: #access_token=...&type=recovery ──
        // Supabase's detectSessionInUrl handles this automatically via
        // onAuthStateChange. We just wait for the PASSWORD_RECOVERY event.
        const hash = window.location.hash;
        if (hash && hash.includes("type=recovery")) {
          // detectSessionInUrl=true already handled it; check session
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
            // Clean the ugly fragment from the URL without reloading
            window.history.replaceState({}, "", window.location.pathname);
            setPageState("ready");
            return;
          }
        }

        // ── 4. Listen for PASSWORD_RECOVERY event (fragment flow fallback) ─
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
          if (event === "PASSWORD_RECOVERY") {
            subscription.unsubscribe();
            window.history.replaceState({}, "", window.location.pathname);
            setPageState("ready");
          }
        });

        // Give the fragment flow 4 seconds before giving up
        const timeout = setTimeout(() => {
          subscription.unsubscribe();
          // One last check — maybe session was already set
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
              setPageState("ready");
            } else {
              setPageState("expired");
            }
          });
        }, 4000);

        return () => {
          clearTimeout(timeout);
          subscription.unsubscribe();
        };
      } catch (err: any) {
        console.error("[reset-password] unexpected error:", err);
        setPageState("error");
        setErrorMsg(err?.message || "An unexpected error occurred.");
      }
    })();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setErrorMsg(error.message.includes("session") || error.message.includes("Auth")
          ? "Your reset link has expired. Please request a new one."
          : error.message);
        if (error.message.includes("session") || error.message.includes("Auth")) {
          setPageState("expired");
        }
      } else {
        // Sign out so the user gets a clean login
        await supabase.auth.signOut();
        setPageState("success");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  function isExpiredError(msg: string) {
    const m = msg.toLowerCase();
    return m.includes("expired") || m.includes("invalid") || m.includes("used");
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 60% 20%, #1a0040 0%, #0D0020 55%, #050010 100%)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", top: "-120px", left: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(74,0,224,0.45) 0%, transparent 70%)", animation: "fw-float2 7s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,61,0.3) 0%, transparent 70%)", animation: "fw-float2 9s ease-in-out infinite reverse" }} />
        {[...Array(12)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${Math.sin(i * 2.3) * 45 + 50}%`, left: `${Math.cos(i * 1.7) * 45 + 50}%`, width: "2px", height: "2px", borderRadius: "50%", background: "white", opacity: 0.15 + (i % 5) * 0.08, animation: `fw-pulse-glow2 ${2 + (i % 4)}s ease-in-out infinite ${i * 0.3}s` }} />
        ))}
      </div>

      {/* Brand */}
      <div className="relative z-10 mb-6 flex items-center gap-2.5">
        <img src={`${basePath}/logo.png`} alt="FundedWealth" className="h-8 w-8 object-contain" />
        <span className="text-white font-bold text-lg tracking-tight">
          Funded<span className="text-[#FF8A3D]">Wealth</span>
        </span>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl px-8 py-8 flex flex-col items-center"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.3)",
          animation: "fw-card-glow2 4s ease-in-out infinite",
        }}
      >
        <div className="absolute top-0 left-6 right-6 h-px pointer-events-none" style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),rgba(255,138,61,0.6),transparent)" }} aria-hidden />

        {/* Logo ring */}
        <div className="mb-6 flex items-center justify-center w-16 h-16 rounded-full" style={{ background: "linear-gradient(135deg,rgba(74,0,224,0.4),rgba(139,92,246,0.2))", border: "1px solid rgba(139,92,246,0.5)", boxShadow: "0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
          <img src={`${basePath}/logo.png`} alt="FundedWealth" className="w-10 h-10 object-contain" />
        </div>

        <a href={`${basePath}/sign-in`} className="self-start text-[12px] text-[#A78BFA] hover:text-white mb-4 flex items-center gap-1 transition">
          ← Back to login
        </a>

        {/* ── Loading state ── */}
        {pageState === "loading" && (
          <div className="w-full flex flex-col items-center gap-4 py-8">
            <div className="w-10 h-10 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
            <p className="text-white/50 text-sm">Verifying reset link…</p>
          </div>
        )}

        {/* ── Expired state ── */}
        {pageState === "expired" && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-4xl">⏰</div>
            <h2 className="text-[20px] font-bold text-white">Link Expired</h2>
            <p className="text-[13px] text-white/50 text-center leading-relaxed">
              This reset link has expired or already been used. Reset links are valid for 1 hour.
            </p>
            <a
              href={`${basePath}/sign-in`}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4A00E0] to-[#7C3AED] hover:from-[#5510f0] hover:to-[#8B4FF0] text-white font-bold text-[14px] transition flex items-center justify-center mt-2"
            >
              Request a New Link
            </a>
          </div>
        )}

        {/* ── Error state ── */}
        {pageState === "error" && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-[20px] font-bold text-white">Something Went Wrong</h2>
            <p className="text-[13px] text-white/50 text-center leading-relaxed">
              {errorMsg || "We couldn't verify your reset link. Please try again."}
            </p>
            <a
              href={`${basePath}/sign-in`}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4A00E0] to-[#7C3AED] hover:from-[#5510f0] hover:to-[#8B4FF0] text-white font-bold text-[14px] transition flex items-center justify-center mt-2"
            >
              Back to Login
            </a>
          </div>
        )}

        {/* ── Success state ── */}
        {pageState === "success" && (
          <div className="w-full flex flex-col items-center gap-4">
            <div className="text-4xl">✅</div>
            <h2 className="text-[20px] font-bold text-white">Password Updated!</h2>
            <p className="text-[13px] text-white/50 text-center leading-relaxed">
              Your password has been changed successfully. You can now log in with your new password.
            </p>
            <a
              href={`${basePath}/sign-in`}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4A00E0] to-[#7C3AED] hover:from-[#5510f0] hover:to-[#8B4FF0] text-white font-bold text-[14px] transition flex items-center justify-center mt-2"
            >
              Login Now
            </a>
          </div>
        )}

        {/* ── Ready: enter new password ── */}
        {pageState === "ready" && (
          <div className="w-full flex flex-col">
            <h2 className="text-[20px] font-bold text-white mb-1">Set New Password</h2>
            <p className="text-[12px] text-white/40 mb-5">Enter a strong password for your account.</p>

            {errorMsg && (
              <div className="w-full mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className={LABEL}>New Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={INPUT + " pr-11"}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div>
                <label className={LABEL}>Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className={INPUT + " pr-11"}
                  />
                  <button type="button" tabIndex={-1} onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                    aria-label={showConfirm ? "Hide password" : "Show password"}>
                    {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Password strength indicator */}
              {password.length > 0 && (
                <div className="flex gap-1">
                  {[1,2,3,4].map(level => {
                    const strength = getStrength(password);
                    return (
                      <div key={level} className="flex-1 h-1 rounded-full transition-all"
                        style={{ background: strength >= level ? strengthColor(strength) : "rgba(255,255,255,0.1)" }} />
                    );
                  })}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4A00E0] to-[#7C3AED] hover:from-[#5510f0] hover:to-[#8B4FF0] text-white font-bold text-[14px] transition disabled:opacity-50 mt-1"
              >
                {loading ? <Spinner /> : "Update Password"}
              </button>
            </form>
          </div>
        )}

        <a href={`${basePath}/`} className="mt-6 text-[12px] text-white/25 hover:text-white/60 transition">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}

function getStrength(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.max(1, score);
}

function strengthColor(strength: number): string {
  return ["#ef4444", "#f97316", "#eab308", "#22c55e"][strength - 1] || "#22c55e";
}
