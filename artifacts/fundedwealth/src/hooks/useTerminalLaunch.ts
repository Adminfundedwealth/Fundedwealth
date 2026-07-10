import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";

interface LaunchResult {
  success: boolean;
  launchUrl?: string;
  message?: string;
}

interface UseTerminalLaunch {
  launching: boolean;
  launchError: string;
  launchTerminal: (accountId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * useTerminalLaunch
 *
 * THE single hook for launching the trading terminal.
 * All challenge types (Flash / Instant / 1-Step / 2-Step) use this.
 * No special-casing per challenge type — only accountId differs.
 *
 * Flow:
 *   1. Get Supabase JWT
 *   2. POST /api/terminal/launch  { accountId }
 *   3. Receive launchUrl
 *   4. window.open → terminal.fundedwealth.com → SSO → auto-login
 */
export function useTerminalLaunch(): UseTerminalLaunch {
  const { getToken } = useAuth();
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");

  const launchTerminal = async (accountId: string) => {
    setLaunching(true);
    setLaunchError("");
    try {
      // Try refreshing session first to get a fresh token
      const token = await getToken();
      const apiBase = import.meta.env.VITE_API_URL ?? "";

      if (!token) {
        // No session — redirect to sign-in
        setLaunchError("Please log out and log in again to refresh your session.");
        setLaunching(false);
        return;
      }

      const res = await fetch(`${apiBase}/api/terminal/launch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({ accountId }),
      });
      const data: LaunchResult = await res.json().catch(() => ({ success: false }));

      if (res.status === 401) {
        // Token expired — tell user to re-login
        setLaunchError("Session expired. Please log out and log in again.");
        return;
      }

      if (res.ok && data.success && data.launchUrl) {
        // Use location.assign for immediate navigation — avoids popup blockers
        // and minimises the window between token generation and browser redirect
        window.location.assign(data.launchUrl);
      } else {
        setLaunchError(data.message ?? "Failed to launch terminal. Please try again.");
      }
    } catch {
      setLaunchError("Could not reach the server. Please try again.");
    } finally {
      setLaunching(false);
    }
  };

  const clearError = () => setLaunchError("");

  return { launching, launchError, launchTerminal, clearError };
}
