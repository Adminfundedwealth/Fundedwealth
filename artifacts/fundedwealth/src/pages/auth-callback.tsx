import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import SEOHead from "@/components/SEOHead";

/**
 * Supabase may return either an implicit-flow token in the URL fragment or a
 * PKCE code in the query string, so handle both callback shapes.
 */
export default function AuthCallbackPage() {
    useEffect(() => {
        const handleCallback = async () => {
            try {
                const hasAccessToken = new URLSearchParams(
                    window.location.hash.slice(1)
                ).has("access_token");

                if (hasAccessToken) {
                    const { data: { session }, error } = await supabase.auth.getSession();
                    if (error) throw error;
                    if (session) {
                        window.location.replace("/dashboard");
                        return;
                    }
                }

                if (new URLSearchParams(window.location.search).has("code")) {
                    const { error } = await supabase.auth.exchangeCodeForSession(
                        window.location.href
                    );
                    if (error) throw error;
                    window.location.replace("/dashboard");
                    return;
                }

                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                if (session) {
                    window.location.replace("/dashboard");
                    return;
                }

                window.location.replace("/sign-in?error=callback_failed");
            } catch (error) {
                console.error("Auth callback error:", error);
                window.location.replace("/sign-in?error=callback_failed");
            }
        };

        handleCallback();
    }, []);

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center"
            style={{ background: "radial-gradient(ellipse at 60% 20%,#1a0040 0%,#0D0020 55%,#050010 100%)" }}
        >
            <SEOHead title="Completing Sign-In" noindex={true} />
            <div className="flex flex-col items-center gap-4 text-white/50 text-sm">
                <div className="w-10 h-10 border-2 border-[#7C3AED]/30 border-t-[#7C3AED] rounded-full animate-spin" />
                <span>Completing sign-in…</span>
            </div>
        </div>
    );
}
