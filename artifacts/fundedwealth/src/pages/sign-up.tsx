import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useState, useEffect } from "react";
import { Eye, EyeOff, User, Mail, Phone, Lock, ShieldCheck } from "lucide-react";
import { TurnstileWidget } from "@/components/TurnstileWidget";
import { useCaptcha } from "@/hooks/useCaptcha";
import { FEATURES } from "@/config/features";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const INPUT =
  "w-full h-12 px-4 rounded-xl text-sm text-white placeholder-white/30 outline-none transition " +
  "bg-white/[0.07] border border-white/[0.12] " +
  "focus:border-[#8B5CF6] focus:bg-white/[0.11] focus:ring-2 focus:ring-[#8B5CF6]/25";
const LABEL = "block text-[11px] font-semibold text-white/50 mb-1.5 tracking-widest uppercase";

function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Please wait…
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-7.9 19.6-20 0-1.3-.1-2.7-.4-4z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.8-11.3-7H6.3C9.6 39.6 16.3 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.4-2.3 4.4-4.3 5.8l6.2 5.2C41.1 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z" />
    </svg>
  );
}

function PasswordStrength({ password }: { password: string }) {
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[0-9]/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "#ef4444", "#f97316", "#eab308", "#22c55e"];
  if (!password) return null;
  return (
    <div className="mt-1.5 flex items-center gap-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex-1 h-1 rounded-full transition-all"
          style={{ background: i <= score ? colors[score] : "rgba(255,255,255,0.1)" }} />
      ))}
      <span className="text-[11px] font-semibold" style={{ color: colors[score] || "transparent" }}>
        {labels[score]}
      </span>
    </div>
  );
}

function VerifyStep() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg,rgba(74,0,224,0.4),rgba(139,92,246,0.2))",
          border: "1px solid rgba(139,92,246,0.5)",
          boxShadow: "0 0 20px rgba(139,92,246,0.4)",
        }}>
        <ShieldCheck size={28} className="text-[#A78BFA]" />
      </div>
      <h2 className="text-[20px] font-bold text-white mb-1">Check your email</h2>
      <p className="text-[12px] text-white/40 mb-6 text-center">
        We sent a confirmation link to your email address.<br />
        Click the link to verify your account and start trading.
      </p>
      <a
        href="/sign-in"
        className="w-full h-12 rounded-xl font-bold text-[15px] text-white flex items-center justify-center transition relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#4A00E0 0%,#7C3AED 60%,#9333EA 100%)",
          boxShadow: "0 4px 20px rgba(74,0,224,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        Go to Login
      </a>
      <p className="mt-4 text-[12px] text-white/30">
        Didn't receive it? Check your spam folder.
      </p>
    </div>
  );
}

function WaitingListStep() {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(135deg,rgba(16,185,129,0.4),rgba(5,150,105,0.2))",
          border: "1px solid rgba(16,185,129,0.5)",
          boxShadow: "0 0 20px rgba(16,185,129,0.4)",
        }}>
        <ShieldCheck size={28} className="text-emerald-400" />
      </div>
      <h2 className="text-[22px] font-bold text-white mb-2">Thank You for Your Interest! 🎉</h2>
      <p className="text-[13px] text-white/50 mb-2 text-center leading-relaxed">
        You are now on the <span className="text-emerald-400 font-bold">Free Trial Waiting List</span>.
      </p>
      <p className="text-[12px] text-white/40 mb-6 text-center leading-relaxed">
        We'll notify you as soon as a free trial slot opens up.<br />
        Meanwhile, check your email to verify your account.
      </p>
      <div className="w-full bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-400 text-sm">✓</span>
          </div>
          <div>
            <div className="text-white text-sm font-semibold">You're on the list!</div>
            <div className="text-white/40 text-[11px]">We'll email you when your free trial is ready.</div>
          </div>
        </div>
      </div>
      <a
        href="/"
        className="w-full h-12 rounded-xl font-bold text-[15px] text-white flex items-center justify-center transition relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg,#10B981 0%,#059669 100%)",
          boxShadow: "0 4px 20px rgba(16,185,129,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
        }}
      >
        Back to Home
      </a>
      <a href="/sign-in" className="mt-3 text-[12px] text-[#A78BFA] hover:text-white transition font-semibold">
        Already have an account? Login
      </a>
    </div>
  );
}

export default function SignUpPage() {
  const { isSignedIn, isLoaded, signUp, signInWithGoogle } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [agree, setAgree] = useState(false);

  const [step, setStep] = useState<"form" | "verify" | "waitlist">("form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const captcha = useCaptcha();

  const isTrial = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("trial") === "true";

  useEffect(() => {
    if (isSignedIn) window.location.replace(`${basePath}/dashboard`);
  }, [isSignedIn]);

  async function handleGoogle() {
    if (!isLoaded) return; setError("");
    try {
      const { error: err } = await signInWithGoogle();
      if (err) setError(err);
    } catch (err: any) {
      setError(err?.message || "Google sign-up failed.");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded) return;
    if (password !== confirmPw) { setError("Passwords do not match."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (!agree) { setError("Please accept the terms to continue."); return; }

    // CAPTCHA verification (only if enabled)
    if (FEATURES.ENABLE_TURNSTILE) {
      const captchaOk = await captcha.verifyCaptcha("signup");
      if (!captchaOk) {
        setError(captcha.error || "CAPTCHA verification failed. Please try again.");
        return;
      }
    }

    setError(""); setLoading(true);
    try {
      const { error: err } = await signUp({
        email,
        password,
        firstName,
        lastName,
        phone: phone ? `+91${phone}` : undefined,
      });
      if (err) { setError(err); }
      else { setStep(isTrial ? "waitlist" : "verify"); }
    } catch (err: any) {
      setError(err?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 60% 20%,#1a0040 0%,#0D0020 55%,#050010 100%)" }}
    >
      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div style={{
          position: "absolute", top: "-120px", left: "-100px", width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle,rgba(74,0,224,0.45) 0%,transparent 70%)",
          animation: "fw-float 7s ease-in-out infinite"
        }} />
        <div style={{
          position: "absolute", bottom: "-80px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%",
          background: "radial-gradient(circle,rgba(255,138,61,0.3) 0%,transparent 70%)",
          animation: "fw-float 9s ease-in-out infinite reverse"
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "15%", width: "220px", height: "220px", borderRadius: "50%",
          background: "radial-gradient(circle,rgba(214,51,132,0.2) 0%,transparent 70%)",
          animation: "fw-float 11s ease-in-out infinite 2s"
        }} />
      </div>

      {/* Brand */}
      <div className="relative z-10 mb-5 flex items-center gap-2.5">
        <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 object-contain" />
        <span className="text-white font-bold text-lg tracking-tight">
          Funded<span className="text-[#FF8A3D]">Wealth</span>
        </span>
      </div>

      {/* Card */}
      <div
        className="relative z-10 w-full max-w-[460px] rounded-2xl px-8 py-8 flex flex-col items-center"
        style={{
          background: "linear-gradient(145deg,rgba(255,255,255,0.07) 0%,rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.3)",
          animation: "fw-card-glow 4s ease-in-out infinite",
        }}
      >
        <div className="absolute top-0 left-6 right-6 h-px pointer-events-none"
          style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),rgba(255,138,61,0.6),transparent)" }}
          aria-hidden />

        {step === "verify" ? (
          <VerifyStep />
        ) : step === "waitlist" ? (
          <WaitingListStep />
        ) : (
          <>
            <h1 className="text-[22px] font-bold text-white mt-1">Create your account</h1>
            <p className="text-[13px] text-white/40 mb-5">Start trading in minutes</p>

            {/* Google */}
            <button onClick={handleGoogle} disabled={!isLoaded}
              className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-[13px] font-semibold text-white/80 hover:text-white transition disabled:opacity-50 mb-4"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
              <GoogleIcon />
              Sign up with Google
            </button>

            <div className="flex items-center gap-3 w-full mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-white/30">or fill the form</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {error && (
              <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={LABEL}>First Name <span className="text-[#FF8A3D]">*</span></label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input type="text" autoComplete="given-name" required placeholder="Aman"
                      value={firstName} onChange={e => setFirstName(e.target.value)}
                      className={INPUT + " pl-9"} />
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Last Name</label>
                  <input type="text" autoComplete="family-name" placeholder="Kumar"
                    value={lastName} onChange={e => setLastName(e.target.value)}
                    className={INPUT} />
                </div>
              </div>

              <div>
                <label className={LABEL}>Email Address <span className="text-[#FF8A3D]">*</span></label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input type="email" autoComplete="email" required placeholder="you@example.com"
                    value={email} onChange={e => setEmail(e.target.value)}
                    className={INPUT + " pl-9"} />
                </div>
              </div>

              <div>
                <label className={LABEL}>Phone Number <span className="text-white/30 normal-case tracking-normal text-[10px]">(optional)</span></label>
                <div className="flex gap-2">
                  <div className="h-12 px-3 rounded-xl flex items-center gap-1.5 text-sm font-semibold text-white/80 shrink-0"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    <span className="text-base">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <div className="relative flex-1">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                    <input type="tel" autoComplete="tel" inputMode="numeric" maxLength={10}
                      placeholder="9876543210"
                      value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ""))}
                      className={INPUT + " pl-9"} />
                  </div>
                </div>
                {phone.length > 0 && phone.length !== 10 && (
                  <p className="mt-1 text-[11px] text-yellow-400/70">Enter a valid 10-digit mobile number</p>
                )}
              </div>

              <div>
                <label className={LABEL}>Password <span className="text-[#FF8A3D]">*</span></label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input type={showPw ? "text" : "password"} autoComplete="new-password" required
                    placeholder="Min. 8 characters"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className={INPUT + " pl-9 pr-11"} />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                    aria-label={showPw ? "Hide" : "Show"}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>

              <div>
                <label className={LABEL}>Confirm Password <span className="text-[#FF8A3D]">*</span></label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input type={showCpw ? "text" : "password"} autoComplete="new-password" required
                    placeholder="Re-enter password"
                    value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    className={INPUT + " pl-9 pr-11 " +
                      (confirmPw && password !== confirmPw ? "border-red-500/50" :
                        confirmPw && password === confirmPw ? "border-green-500/50" : "")} />
                  <button type="button" tabIndex={-1} onClick={() => setShowCpw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                    aria-label={showCpw ? "Hide" : "Show"}>
                    {showCpw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPw && password !== confirmPw && (
                  <p className="mt-1 text-[11px] text-red-400">Passwords do not match</p>
                )}
                {confirmPw && password === confirmPw && (
                  <p className="mt-1 text-[11px] text-green-400">✓ Passwords match</p>
                )}
              </div>

              <div className="flex items-start gap-2.5 mt-1">
                <input id="agree" type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded border-white/20 accent-[#7C3AED] shrink-0" />
                <div className="text-[12px] text-white/40 leading-relaxed">
                  <label htmlFor="agree" className="cursor-pointer select-none">I agree to the</label>
                  <span className="ml-1">
                    <a href="/terms" className="text-[#A78BFA] hover:text-white transition">Terms of Service</a>
                    {" "}and{" "}
                    <a href="/privacy" className="text-[#A78BFA] hover:text-white transition">Privacy Policy</a>
                  </span>
                </div>
              </div>

              {/* Cloudflare Turnstile CAPTCHA - Feature Flag Controlled */}
              {FEATURES.ENABLE_TURNSTILE && (
                <>
                  <TurnstileWidget
                    onVerify={captcha.onVerify}
                    onExpire={captcha.onExpire}
                    onError={captcha.onError}
                    action="signup"
                    theme="dark"
                    size="normal"
                    className="flex justify-center my-2"
                  />
                  {captcha.error && (
                    <p className="text-red-400 text-xs text-center">{captcha.error}</p>
                  )}
                </>
              )}

              <button type="submit" disabled={loading || !isLoaded || (FEATURES.ENABLE_TURNSTILE && !captcha.isVerified)}
                className="w-full h-12 rounded-xl font-bold text-[15px] text-white transition disabled:opacity-50 disabled:cursor-not-allowed mt-1 relative overflow-hidden"
                style={{
                  background: "linear-gradient(135deg,#4A00E0 0%,#7C3AED 60%,#9333EA 100%)",
                  boxShadow: "0 4px 20px rgba(74,0,224,0.5), 0 0 0 1px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)",
                }}>
                <span className="relative z-10">{loading ? <Spinner /> : "Create Account →"}</span>
                <span className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.1) 0%,transparent 50%)" }} aria-hidden />
              </button>
            </form>

            <div className="w-full h-px bg-white/[0.06] my-5" />

            <p className="text-[13px] text-white/40">
              Already have an account?{" "}
              <a href="/sign-in" className="font-semibold text-[#A78BFA] hover:text-white transition">
                Login
              </a>
            </p>
          </>
        )}

        <a href="/" className="mt-5 text-[12px] text-white/25 hover:text-white/60 transition">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
