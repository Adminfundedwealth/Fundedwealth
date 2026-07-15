import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { supabase, siteUrl } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoaded: boolean;
    isSignedIn: boolean;
    userId: string | null;
    accountSuspended: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signUp: (data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    }) => Promise<{ error: string | null; needsVerification?: boolean }>;
    signInWithGoogle: () => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    getToken: () => Promise<string | null>;
    resetPassword: (email: string) => Promise<{ error: string | null }>;
    updatePassword: (newPassword: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function SupabaseAuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [accountSuspended, setAccountSuspended] = useState(false);

    useEffect(() => {
        // Get initial session — always resolve isLoaded even on error
        supabase.auth.getSession()
            .then(({ data: { session: s } }) => {
                setSession(s);
                setUser(s?.user ?? null);
                setIsLoaded(true);
            })
            .catch(() => {
                // Supabase unreachable or misconfigured — mark loaded so the app doesn't hang
                setIsLoaded(true);
            });

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, s) => {
                setSession(s);
                setUser(s?.user ?? null);
                setIsLoaded(true);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // Check account status after authentication
    useEffect(() => {
        if (!session?.access_token) {
            setAccountSuspended(false);
            return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "https://api.fundedwealth.com";
        fetch(`${apiUrl}/api/auth/account-status`, {
            headers: { Authorization: `Bearer ${session.access_token}` },
        })
            .then((res) => {
                // Only act on a clean 200 — never sign out due to network errors or non-200
                if (!res.ok) return null;
                return res.json();
            })
            .then((data) => {
                if (!data) return; // non-200 or parse failure — leave session intact
                if (data.accountStatus === "suspended" || data.accountStatus === "banned") {
                    setAccountSuspended(true);
                    supabase.auth.signOut();
                } else {
                    setAccountSuspended(false);
                }
            })
            .catch(() => {
                // Network error — leave session intact, do not change suspended state
            });
    }, [session?.access_token]);

    const signIn = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    }, []);

    const signUp = useCallback(async (data: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
    }) => {
        const { error } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    first_name: data.firstName || "",
                    last_name: data.lastName || "",
                    full_name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
                    phone: data.phone || "",
                },
                emailRedirectTo: `${siteUrl}/auth/callback`,
            },
        });
        if (error) return { error: error.message };
        return { error: null, needsVerification: true };
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${siteUrl}/auth/callback`,
            },
        });
        return { error: error?.message ?? null };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const getToken = useCallback(async () => {
        const { data: { session: s } } = await supabase.auth.getSession();
        return s?.access_token ?? null;
    }, []);

    const resetPassword = useCallback(async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/reset-password`,
        });
        return { error: error?.message ?? null };
    }, []);

    const updatePassword = useCallback(async (newPassword: string) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        return { error: error?.message ?? null };
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                isLoaded,
                isSignedIn: !!session && !accountSuspended,
                userId: user?.id ?? null,
                accountSuspended,
                signIn,
                signUp,
                signInWithGoogle,
                signOut,
                getToken,
                resetPassword,
                updatePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

/** Drop-in replacement for Clerk's useAuth */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within SupabaseAuthProvider");
    return ctx;
}

/** Drop-in replacement for Clerk's useUser */
export function useUser() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useUser must be used within SupabaseAuthProvider");

    const { user, isSignedIn } = ctx;

    // Provide a Clerk-like user object shape
    const mappedUser = user
        ? {
            id: user.id,
            firstName: user.user_metadata?.first_name || user.user_metadata?.name?.split(" ")[0] || "",
            lastName: user.user_metadata?.last_name || user.user_metadata?.name?.split(" ").slice(1).join(" ") || "",
            fullName: user.user_metadata?.full_name || user.user_metadata?.name || `${user.user_metadata?.first_name || ""} ${user.user_metadata?.last_name || ""}`.trim(),
            emailAddresses: [{ emailAddress: user.email || "" }],
            primaryEmailAddress: { emailAddress: user.email || "" },
            imageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || "",
            email: user.email || "",
        }
        : null;

    return { user: mappedUser, isSignedIn, isLoaded: ctx.isLoaded };
}
