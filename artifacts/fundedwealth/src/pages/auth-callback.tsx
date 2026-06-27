import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Auth Callback page — Supabase redirects here after Google OAuth.
 * Handles the code exchange and redirects to dashboard.
 */
export default function AuthCallbackPage() {
    useEffect(() => {
        const handleCallback = async () => {
            const { error } = await supabase.auth.exchangeCodeForSession(
                window.location.href
            );
            if (error) {
                console.error("Auth callback error:", error);
                window.location.replace("/sign-in?error=callback_failed");
            } else {
                window.location.replace("/dashboard");
            }
        };
        handleCallback();
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: "radial-gradient(ellipse at 60% 20%,#1a0040 0%,#0D0020 55%,#050010 100%)" }}
        >
            <div className="flex flex-col items-center gap-4 text-white/50 text-sm">
                <div className="w-10 h-10 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
                <span>Completing sign-in…</span>
            </div>
        </div>
    );
}
