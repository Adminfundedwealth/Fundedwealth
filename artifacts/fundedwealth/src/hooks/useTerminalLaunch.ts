import { useState } from "react";
import { useAuth } from "@/contexts/SupabaseAuthContext";
import { getApiBase } from "../lib/api-base";
import { submitTerminalSSO } from "../lib/terminalSSO";

interface LaunchResult {
  success: boolean;
  ssoToken?: string;
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
 *   3. Receive a short-lived SSO handoff token
 *   4. POST it to charts.fundedwealth.com
 */
export function useTerminalLaunch(): UseTerminalLaunch {
  const { getFreshToken } = useAuth();
  const [launching, setLaunching] = useState(false);
  const [launchError, setLaunchError] = useState("");

  const launchTerminal = async (accountId: string) => {
    setLaunching(true);
    setLaunchError("");
    try {
      // Try refreshing session first to get a fresh token
      const token = await getFreshToken();
      const apiBase = getApiBase();

      if (!token) {
        setLaunchError("Your session expired. Please sign in again to launch the terminal.");
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
        setLaunchError("Your session expired. Please sign in again to launch the terminal.");
        return;
      }

      if (res.ok && data.success && data.ssoToken) {
        submitTerminalSSO(data.ssoToken);
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
