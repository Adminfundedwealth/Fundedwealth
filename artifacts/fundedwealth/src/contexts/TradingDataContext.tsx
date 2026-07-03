import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useAuth } from "./SupabaseAuthContext";

/**
 * TradingDataContext — provides the user's purchased trading accounts to the dashboard.
 *
 * OWNERSHIP RULES:
 * - This context reads from GET /api/accounts/my (same shared Supabase records)
 * - MAIN SITE: reads accounts for dashboard display
 * - ADMIN: will later read/update the same records
 * - TERMINAL: will later read the same records + update balance/pnl during trading
 *
 * TERMINAL HANDOFF:
 * Each account has id + accountCode that terminal will use to open the correct account.
 * The "Launch Terminal" action uses account.id to generate an SSO token later.
 */

export interface TradingAccount {
  id: string;
  accountCode: string | null;
  brokerLogin: string | null;
  planType: string;
  phase: string;
  status: string;
  // Balance
  currentBalance: number;
  startBalance: number;
  profitLoss: number;
  // Challenge rules (terminal enforces these)
  profitTarget: number;
  maxDrawdown: number;
  dailyLossLimit: number;
  dailyDrawdown: number;
  // Stats
  profitSplit: number;
  tradingDays: number;
  scalingLevel: number;
  // Funded
  isFunded: boolean;
  fundedAt: string | null;
  // Fee info
  feePaid: number;
  couponUsed: string | null;
  // Dates
  createdAt: string;
  updatedAt: string;
  expiresAt: string | null;
  // Provisioning state (new — from terminal-owned model)
  orderId?: string;
  provisioningStatus?: "pending" | "completed" | "failed";
  provisioningError?: string;
  canLaunch?: boolean;
  // Login credentials (available right after provisioning)
  loginEmail?: string | null;
  tempPassword?: string | null;
}

export interface TradingProfile {
  accounts: DashboardAccount[];
  totalPayout: number;
  referralCode: string;
  referralCount: number;
  couponCode: string;
  payouts: Array<{ id: string; date: string; amount: number; method: string; accountId: string; status: string }>;
  impact: { mealsSupported: number; studentsSupported: number; totalDonated: number; badge: string; donations: Array<{ id: string; date: string; amount: number; cause: string }> };
}

/** Shape expected by dashboard AccountCard component */
export interface DashboardAccount {
  id: string;
  phase: "challenge" | "verification" | "funded";
  status: string;
  balance: number;
  startBalance: number;
  size: number;
  profitTarget: number;
  dailyLoss: number;
  maxLoss: number;
  profitSplit: number;
  winRate: number;
  tradeCount: number;
  startDate: string;
  accountCode: string;
  brokerLogin: string | null;
  pnlPercent: number;
  canLaunch?: boolean;
  provisioningStatus?: string;
  provisioningError?: string;
  // Credentials surfaced from provisioning
  loginEmail?: string | null;
  tempPassword?: string | null;
}

interface TradingDataContextType {
  profile: TradingProfile;
  loadDemoData: () => void;
  donate: (cause: string, amount: number) => void;
  isDemo: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const defaultProfile: TradingProfile = {
  accounts: [],
  totalPayout: 0,
  referralCode: "",
  referralCount: 0,
  couponCode: "",
  payouts: [],
  impact: { mealsSupported: 0, studentsSupported: 0, totalDonated: 0, badge: "none", donations: [] },
};

const TradingDataCtx = createContext<TradingDataContextType | null>(null);

function mapPhase(phase: string): "challenge" | "verification" | "funded" {
  if (phase === "funded" || phase === "phase_funded") return "funded";
  if (phase === "phase_2" || phase === "verification") return "verification";
  return "challenge";
}

function mapApiAccountToDashboard(acc: TradingAccount): DashboardAccount {
  const balance = acc.currentBalance || 0;
  const startBalance = acc.startBalance || balance;
  const pnl = balance - startBalance;
  const pnlPercent = startBalance > 0 ? (pnl / startBalance) * 100 : 0;

  // Map provisioning states to dashboard phase
  let phase: "challenge" | "verification" | "funded";
  if (acc.status === "provisioning_pending" || acc.status === "provisioning_failed") {
    phase = "challenge"; // show as challenge card with special status
  } else {
    phase = mapPhase(acc.phase);
  }

  return {
    id: acc.id,
    phase,
    status: acc.status,
    balance,
    startBalance,
    size: startBalance,
    profitTarget: acc.profitTarget > 0 && startBalance > 0
      ? (acc.profitTarget / startBalance) * 100
      : 10,
    dailyLoss: acc.dailyLossLimit > 0 && startBalance > 0
      ? (acc.dailyLossLimit / startBalance) * 100
      : 3,
    maxLoss: acc.maxDrawdown > 0 && startBalance > 0
      ? (acc.maxDrawdown / startBalance) * 100
      : 6,
    profitSplit: acc.profitSplit || 80,
    winRate: 0, // Terminal will populate this later
    tradeCount: acc.tradingDays || 0,
    startDate: acc.createdAt,
    accountCode: acc.accountCode || "Provisioning...",
    brokerLogin: acc.brokerLogin || acc.accountCode || null,
    pnlPercent,
    canLaunch: acc.canLaunch,
    provisioningStatus: acc.provisioningStatus,
    provisioningError: acc.provisioningError,
    loginEmail: acc.loginEmail || null,
    tempPassword: acc.tempPassword || null,
  };
}

export function TradingDataProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, getToken } = useAuth();
  const [profile, setProfile] = useState<TradingProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const fetchAccounts = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(defaultProfile);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await getToken();
      const apiBase = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiBase}/api/accounts/my`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          // User exists but has no accounts yet
          setProfile(defaultProfile);
        } else {
          throw new Error(`Failed to fetch accounts: ${res.status}`);
        }
      } else {
        const data = await res.json();
        const accounts: TradingAccount[] = data.accounts || [];
        const dashAccounts = accounts.map(mapApiAccountToDashboard);

        setProfile({
          accounts: dashAccounts,
          totalPayout: 0,   // fetched separately from user profile
          referralCode: "",
          referralCount: 0,
          couponCode: "",
          payouts: [],
          impact: { mealsSupported: 0, studentsSupported: 0, totalDonated: 0, badge: "none", donations: [] },
        });
      }
    } catch (err: any) {
      console.error("[TradingData] Failed to fetch accounts:", err);
      setError(err.message || "Failed to load trading data");
      // Don't clear profile on transient errors
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, getToken]);

  // Fetch user profile metadata (totalPayout, referralCode)
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchMeta = async () => {
      try {
        const token = await getToken();
        const apiBase = import.meta.env.VITE_API_URL || "";
        const res = await fetch(`${apiBase}/api/users/me`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: "include",
        });
        if (res.ok) {
          const user = await res.json();
          setProfile((prev) => ({
            ...prev,
            totalPayout: user.totalPayout || 0,
            referralCode: user.affiliateCode || "",
            referralCount: 0,
          }));
        }
      } catch {
        // Non-critical — profile meta is supplementary
      }
    };

    fetchMeta();
  }, [isSignedIn, getToken]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const loadDemoData = useCallback(() => {
    setIsDemo(true);
    setProfile({
      accounts: [
        {
          id: "demo-1",
          phase: "challenge",
          status: "active",
          balance: 510000,
          startBalance: 500000,
          size: 500000,
          profitTarget: 10,
          dailyLoss: 3,
          maxLoss: 6,
          profitSplit: 80,
          winRate: 62,
          tradeCount: 12,
          startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
          accountCode: "FW-DEMO01",
          brokerLogin: "FW-DEMO01",
          pnlPercent: 2.0,
          canLaunch: true,
        },
      ],
      totalPayout: 0,
      referralCode: "FWDEMO",
      referralCount: 0,
      couponCode: "",
      payouts: [],
      impact: { mealsSupported: 0, studentsSupported: 0, totalDonated: 0, badge: "none", donations: [] },
    });
  }, []);

  const donate = useCallback((_cause: string, _amount: number) => {
    // Donation logic — non-critical, placeholder
  }, []);

  return (
    <TradingDataCtx.Provider
      value={{
        profile,
        loadDemoData,
        donate,
        isDemo,
        loading,
        error,
        refetch: fetchAccounts,
      }}
    >
      {children}
    </TradingDataCtx.Provider>
  );
}

/**
 * useTradingData — hook to access trading account data in the dashboard.
 * Must be used within TradingDataProvider.
 */
export const useTradingData = () => {
  const ctx = useContext(TradingDataCtx);
  if (!ctx) throw new Error("useTradingData must be used within TradingProvider");
  return ctx;
};
