import { useAuth } from "@/contexts/SupabaseAuthContext";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Smartphone, Download } from "lucide-react";

// Force fresh deployment
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ─── Inject keyframes once ─────────────────────────────────────────────── */
if (typeof document !== "undefined" && !document.getElementById("fw-signin-style")) {
  const s = document.createElement("style");
  s.id = "fw-signin-style";
  s.textContent = `
    @keyframes fw-float {
      0%,100% { transform: translateY(0px) scale(1); }
      50%      { transform: translateY(-18px) scale(1.04); }
    }
    @keyframes fw-pulse-glow {
      0%,100% { opacity: 0.55; }
      50%      { opacity: 1; }
    }
    @keyframes fw-card-glow {
      0%,100% { box-shadow:
        0 0 0 1px rgba(139,92,246,0.35),
        0 0 40px 8px rgba(139,92,246,0.25),
        0 0 80px 20px rgba(74,0,224,0.15),
        0 32px 64px rgba(0,0,0,0.55); }
      50% { box-shadow:
        0 0 0 1px rgba(255,138,61,0.4),
        0 0 50px 14px rgba(139,92,246,0.35),
        0 0 100px 30px rgba(74,0,224,0.22),
        0 32px 64px rgba(0,0,0,0.55); }
    }
    @keyframes fw-border-spin {
      0%   { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    @keyframes installBounce {
      0%,100% { transform: translateY(0); }
      45%     { transform: translateY(3px); }
      65%     { transform: translateY(-2px); }
    }
    @keyframes fw-shimmer {
      0%   { transform: translateX(-100%) skewX(-12deg); }
      100% { transform: translateX(250%) skewX(-12deg); }
    }
  `;
  document.head.appendChild(s);
}

/* ─── Shared input style (dark theme) ───────────────────────────────────── */
const INPUT =
  "w-full h-12 px-4 rounded-xl text-sm text-white placeholder-white/30 outline-none transition " +
  "bg-white/[0.07] border border-white/[0.12] " +
  "focus:border-[#8B5CF6] focus:bg-white/[0.11] focus:ring-2 focus:ring-[#8B5CF6]/25";

const LABEL = "block text-[12px] font-semibold text-white/60 mb-1.5 tracking-wide uppercase";

/* ─── Spinner ────────────────────────────────────────────────────────────── */
function Spinner() {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      Please wait…
    </span>
  );
}

/* ─── Google icon ────────────────────────────────────────────────────────── */
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

/* ─── Install App button ─────────────────────────────────────────────────── */
function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [bounce, setBounce] = useState(false);

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  useEffect(() => {
    const id = setInterval(() => { setBounce(true); setTimeout(() => setBounce(false), 600); }, 3500);
    return () => clearInterval(id);
  }, []);

  async function handleInstall() {
    if (installed) return;
    setPressed(true); setTimeout(() => setPressed(false), 180);
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      alert("Tap the Share button in your browser then 'Add to Home Screen'.");
    }
  }

  return (
    <button
      onClick={handleInstall}
      aria-label="Install FundedWealth app"
      style={{
        background: installed
          ? "linear-gradient(135deg,#22c55e,#16a34a)"
          : "linear-gradient(135deg,#FF8A3D 0%,#e05a10 40%,#c94400 100%)",
        boxShadow: pressed
          ? "0 2px 0 #7a2500, 0 0 12px rgba(255,138,61,0.3), inset 0 1px 3px rgba(0,0,0,0.3)"
          : "0 6px 0 #7a2500, 0 8px 24px rgba(255,138,61,0.45), 0 0 0 1px rgba(255,138,61,0.2), inset 0 1px 0 rgba(255,255,255,0.15)",
        transform: pressed
          ? "translateY(5px) scale(0.98)"
          : bounce ? "translateY(-3px) scale(1.015)" : "translateY(0) scale(1)",
        transition: "box-shadow 0.15s ease, transform 0.15s cubic-bezier(.34,1.56,.64,1)",
      }}
      className="w-full h-12 rounded-full relative overflow-hidden flex items-center justify-center gap-0 text-white font-bold text-[14px] select-none cursor-pointer border-0 outline-none focus-visible:ring-2 focus-visible:ring-[#FF8A3D]/60"
    >
      <span
        className="absolute top-0 left-0 w-1/3 h-full pointer-events-none"
        style={{
          background: "linear-gradient(90deg,transparent,rgba(255,255,255,0.22),transparent)",
          animation: "fw-shimmer 2.8s ease-in-out infinite",
        }}
        aria-hidden
      />
      <span
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.18) 0%,transparent 50%)" }}
        aria-hidden
      />
      <span className="relative z-10 flex items-center gap-2.5">
        <Smartphone size={17} strokeWidth={2.2} />
        <span>{installed ? "App Installed ✓" : "Install App"}</span>
        {!installed && (
          <Download size={14} strokeWidth={2.4}
            style={{ animation: bounce ? "none" : "installBounce 1.2s ease-in-out infinite" }} />
        )}
      </span>
    </button>
  );
}

/* ─── Forgot-password view ───────────────────────────────────────────────── */
const RESET_COOLDOWN_SECS = 60;

function friendlyResetError(raw: string): string {
  const msg = raw.toLowerCase();
  if (msg.includes("rate limit") || msg.includes("too many") || msg.includes("exceeded")) {
    return `Too many reset attempts. Please wait a minute before trying again.`;
  }
  if (msg.includes("user not found") || msg.includes("no user found")) {
    return "No account found with that email address.";
  }
  if (msg.includes("invalid email")) {
    return "Please enter a valid email address.";
  }
  return raw;
}

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const { isLoaded } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  async function handleRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoaded || cooldown > 0) return;
    setError(""); setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "https://fundedwealth-api-production.up.railway.app";
      const res = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(friendlyResetError(data?.error || "Failed to send reset email. Please try again."));
      } else {
        setSuccess("Password reset link sent! Check your email (including spam folder).");
        setCooldown(RESET_COOLDOWN_SECS);
      }
    } catch (err: any) {
      setError(friendlyResetError(err?.message || "Network error. Please check your connection and try again."));
    } finally { setLoading(false); }
  }

  return (
    <div className="w-full flex flex-col">
      <button onClick={onBack} className="self-start text-[12px] text-[#A78BFA] hover:text-white mb-4 flex items-center gap-1 transition">
        ← Back to login
      </button>
      <h2 className="text-[20px] font-bold text-white mb-1">Forgot Password?</h2>
      <p className="text-[12px] text-white/40 mb-5">We'll email you a password reset link.</p>
      {error && <div className="w-full mb-3 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
      {success && <div className="w-full mb-3 px-4 py-2.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}
      <form onSubmit={handleRequest} className="flex flex-col gap-4">
        <div>
          <label className={LABEL}>Email Address</label>
          <input type="email" autoComplete="email" required placeholder="your@email.com"
            value={email} onChange={e => setEmail(e.target.value)} className={INPUT} />
        </div>
        <button type="submit" disabled={loading || !isLoaded || cooldown > 0}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-[#4A00E0] to-[#7C3AED] hover:from-[#5510f0] hover:to-[#8B4FF0] text-white font-bold text-[14px] transition disabled:opacity-50">
          {loading ? <Spinner /> : cooldown > 0 ? `Resend in ${cooldown}s` : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function SignInPage() {
  const { isSignedIn, isLoaded, signIn, signInWithGoogle, accountSuspended } = useAuth();

  const [view, setView] = useState<"login" | "forgot">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isSignedIn) window.location.replace(`${basePath}/dashboard`);
  }, [isSignedIn]);

  // Check for reset password flow — redirect to dedicated page
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "true") {
      window.location.replace(`${basePath}/reset-password`);
    }
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); if (!isLoaded) return;
    setError(""); setLoading(true);
    try {
      const { error: err } = await signIn(identifier, password);
      if (err) { setError(err); }
      else { window.location.replace(`${basePath}/dashboard`); }
    } catch (err: any) {
      setError(err?.message || "Invalid credentials.");
    } finally { setLoading(false); }
  }

  async function handleGoogle() {
    if (!isLoaded) return; setError("");
    try {
      const { error: err } = await signInWithGoogle();
      if (err) setError(err);
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed.");
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 60% 20%, #1a0040 0%, #0D0020 55%, #050010 100%)" }}
    >
      {/* ── Animated background blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
        <div style={{ position: "absolute", top: "-120px", left: "-100px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(74,0,224,0.45) 0%, transparent 70%)", animation: "fw-float 7s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-80px", right: "-80px", width: "380px", height: "380px", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,138,61,0.3) 0%, transparent 70%)", animation: "fw-float 9s ease-in-out infinite reverse" }} />
        <div style={{ position: "absolute", top: "40%", right: "15%", width: "220px", height: "220px", borderRadius: "50%", background: "radial-gradient(circle, rgba(214,51,132,0.2) 0%, transparent 70%)", animation: "fw-float 11s ease-in-out infinite 2s" }} />
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{ position: "absolute", top: `${Math.sin(i * 2.3) * 45 + 50}%`, left: `${Math.cos(i * 1.7) * 45 + 50}%`, width: i % 3 === 0 ? "3px" : "2px", height: i % 3 === 0 ? "3px" : "2px", borderRadius: "50%", background: "white", opacity: 0.15 + (i % 5) * 0.08, animation: `fw-pulse-glow ${2 + (i % 4)}s ease-in-out infinite ${i * 0.3}s` }} />
        ))}
      </div>

      {/* ── Brand mark above card ── */}
      <div className="relative z-10 mb-6 flex items-center gap-2.5">
        <img src="/logo.png" alt="FundedWealth" className="h-8 w-8 object-contain" />
        <span className="text-white font-bold text-lg tracking-tight">
          Funded<span className="text-[#FF8A3D]">Wealth</span>
        </span>
      </div>

      {/* ── 3-D Glowing Card ── */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-2xl px-8 py-8 flex flex-col items-center"
        style={{
          background: "linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 100%)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(139,92,246,0.3)",
          animation: "fw-card-glow 4s ease-in-out infinite",
        }}
      >
        <div className="absolute top-0 left-6 right-6 h-px pointer-events-none" style={{ background: "linear-gradient(90deg,transparent,rgba(139,92,246,0.8),rgba(255,138,61,0.6),transparent)" }} aria-hidden />

        {/* Logo ring */}
        <div className="mb-4 flex items-center justify-center w-16 h-16 rounded-full" style={{ background: "linear-gradient(135deg,rgba(74,0,224,0.4),rgba(139,92,246,0.2))", border: "1px solid rgba(139,92,246,0.5)", boxShadow: "0 0 20px rgba(139,92,246,0.4), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
          <img src="/logo.png" alt="FundedWealth" className="w-10 h-10 object-contain" />
        </div>

        {view === "forgot" ? (
          <ForgotPasswordView onBack={() => { setView("login"); setError(""); }} />
        ) : (
          <>
            <h1 className="text-[22px] font-bold text-white mt-1">Welcome back</h1>
            <p className="text-[13px] text-white/40 mb-6">Login to continue trading</p>

            {accountSuspended && (
              <div className="w-full mb-4 px-4 py-3 rounded-xl bg-red-600/20 border border-red-500/50 text-red-300 text-sm font-semibold text-center">
                🚫 Account suspended. Contact support for assistance.
              </div>
            )}

            {error && (
              <div className="w-full mb-4 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              <div>
                <label className={LABEL}>Email</label>
                <input type="email" autoComplete="username" required
                  placeholder="Enter your email"
                  value={identifier} onChange={e => setIdentifier(e.target.value)}
                  className={INPUT} />
              </div>

              <div>
                <label className={LABEL}>Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} autoComplete="current-password" required
                    placeholder="Enter your password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    className={INPUT + " pr-11"} />
                  <button type="button" tabIndex={-1} onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition"
                    aria-label={showPw ? "Hide password" : "Show password"}>
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between -mt-1">
                <label className="flex items-center gap-2 text-[12px] text-white/40 cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 rounded border-white/20 accent-[#7C3AED]" />
                  Remember me
                </label>
                <button type="button" onClick={() => { setView("forgot"); setError(""); }}
                  className="text-[12px] font-semibold text-[#A78BFA] hover:text-white transition">
                  Forgot Password?
                </button>
              </div>

              {/* Login button */}
              <button type="submit"
                disabled={loading || !isLoaded}
                className="w-full h-12 rounded-xl font-bold text-[15px] text-white transition disabled:opacity-50 disabled:cursor-not-allowed mt-1 relative overflow-hidden"
                style={{ background: "linear-gradient(135deg,#4A00E0 0%,#7C3AED 60%,#9333EA 100%)", boxShadow: "0 4px 20px rgba(74,0,224,0.5), 0 0 0 1px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.15)" }}>
                <span className="relative z-10">{loading ? <Spinner /> : "Login"}</span>
                <span className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg,rgba(255,255,255,0.1) 0%,transparent 50%)" }} aria-hidden />
              </button>

              <InstallAppButton />
            </form>



            {/* Divider */}
            <div className="flex items-center gap-3 w-full my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[11px] text-white/30">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Google — disabled on localhost with tooltip */}
            {(window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? (
              <div className="w-full">
                <button disabled
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-[13px] font-semibold text-white/40 cursor-not-allowed opacity-50"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <GoogleIcon />
                  Google OAuth (unavailable on localhost)
                </button>
                <p className="text-[10px] text-white/30 text-center mt-2">
                  Add <code className="text-amber-300/60">http://localhost:5200</code> to Supabase → Auth → URL Config → Redirect URLs to enable
                </p>
              </div>
            ) : (
              <button onClick={handleGoogle} disabled={!isLoaded}
                className="w-full h-12 rounded-xl flex items-center justify-center gap-3 text-[13px] font-semibold text-white/80 hover:text-white transition disabled:opacity-50"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}>
                <GoogleIcon />
                Continue with Google
              </button>
            )}

            <div className="w-full h-px bg-white/[0.06] my-5" />

            <p className="text-[13px] text-white/40">
              Don't have an account?{" "}
              <a href="/sign-up" className="font-semibold text-[#A78BFA] hover:text-white transition">
                Register Now
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
