import { useEffect } from "react";
import SEOHead from "@/components/SEOHead";

/**
 * Legacy SSO Callback — redirects to the new auth callback page.
 * Kept for backward compatibility with any existing bookmarks/links.
 */
export default function SSOCallbackPage() {
  useEffect(() => {
    window.location.replace("/auth/callback" + window.location.search + window.location.hash);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "radial-gradient(ellipse at 60% 20%,#1a0040 0%,#0D0020 55%,#050010 100%)" }}
    >
      <SEOHead title="Redirecting" noindex={true} />
      <div className="flex flex-col items-center gap-4 text-white/50 text-sm">
        <div className="w-10 h-10 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
        <span>Redirecting…</span>
      </div>
    </div>
  );
}
