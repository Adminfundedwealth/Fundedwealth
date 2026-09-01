import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import { useAuth } from "./SupabaseAuthContext";
import { getApiBase } from "@/lib/api-base";

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
  // Real trading statistics (from session_analytics)
  winRate?: number;
  totalTrades?: number;
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
  phase: "flash" | "challenge" | "verification" | "funded";
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

function mapPhase(phase: string): "flash" | "challenge" | "verification" | "funded" {
  if (phase === "flash_funding" || phase === "flash") return "flash";
  if (phase === "funded" || phase === "phase_funded") return "funded";
  if (phase === "phase_2" || phase === "verification") return "verification";
  return "challenge";
}

const planRuleDefaults = {
  flash: { profitTargetPct: 0, dailyLossLimitPct: 2, maxDrawdownPct: 4 },
  instant: { profitTargetPct: 0, dailyLossLimitPct: 3, maxDrawdownPct: 5 },
  '1step': { profitTargetPct: 10, dailyLossLimitPct: 3, maxDrawdownPct: 6 },
  '2step': { profitTargetPct: 8, dailyLossLimitPct: 3, maxDrawdownPct: 8 },
} as const;

function getPlanRuleDefault(planType: string | null | undefined, field: keyof (typeof planRuleDefaults)['flash']) {
  const normalizedPlan = String(planType || "").toLowerCase();
  const defaults = planRuleDefaults[normalizedPlan as keyof typeof planRuleDefaults] || planRuleDefaults.flash;
  return defaults[field];
}

function mapApiAccountToDashboard(acc: TradingAccount): DashboardAccount {
  const balance = acc.currentBalance ?? 0;
  const startBalance = acc.startBalance ?? balance;
  const pnl = balance - startBalance;
  const pnlPercent = startBalance > 0 ? (pnl / startBalance) * 100 : 0;

  // Map provisioning states to dashboard phase
  let phase: "flash" | "challenge" | "verification" | "funded";
  if (acc.status === "provisioning_pending" || acc.status === "provisioning_failed") {
    // Preserve correct phase type even for pending/failed — use planType as hint
    const pendingPlan = String(acc.planType ?? "").toLowerCase();
    phase = pendingPlan === "flash" ? "flash" : "challenge";
  } else {
    phase = mapPhase(acc.phase);
  }

  // Determine if this is a Flash account — Flash has no profit target, 2% daily DD, 4% max DD
  const planType = String(acc.planType ?? "").toLowerCase();
  const isFlash = phase === "flash" || planType === "flash";
  const fallbackProfitTargetPct = isFlash ? 0 : getPlanRuleDefault(planType, "profitTargetPct");
  const fallbackDailyLossPct = isFlash ? 2 : getPlanRuleDefault(planType, "dailyLossLimitPct");
  const fallbackMaxLossPct = isFlash ? 4 : getPlanRuleDefault(planType, "maxDrawdownPct");

  const profitTargetPct = isFlash
    ? 0
    : (startBalance > 0 && acc.profitTarget != null
      ? (acc.profitTarget / startBalance) * 100
      : fallbackProfitTargetPct);
  const dailyLossPct = isFlash
    ? 2
    : (startBalance > 0 && acc.dailyLossLimit != null
      ? (acc.dailyLossLimit / startBalance) * 100
      : fallbackDailyLossPct);
  const maxLossPct = isFlash
    ? 4
    : (startBalance > 0 && acc.maxDrawdown != null
      ? (acc.maxDrawdown / startBalance) * 100
      : fallbackMaxLossPct);

  return {
    id: acc.id,
    phase,
    status: acc.status,
    balance,
    startBalance,
    size: startBalance,
    profitTarget: profitTargetPct,
    dailyLoss: dailyLossPct,
    maxLoss: maxLossPct,
    profitSplit: acc.profitSplit ?? 80,
    winRate: acc.winRate ?? 0, // Real win rate from session_analytics (synced by terminal)
    tradeCount: acc.totalTrades ?? 0, // Real trade count from session_analytics (synced by terminal)
    startDate: acc.createdAt,
    accountCode: acc.accountCode ?? "Provisioning...",
    brokerLogin: acc.brokerLogin ?? acc.accountCode ?? null,
    pnlPercent,
    canLaunch: acc.canLaunch,
    provisioningStatus: acc.provisioningStatus,
    provisioningError: acc.provisioningError,
    loginEmail: acc.loginEmail ?? null,
    tempPassword: acc.tempPassword ?? null,
  };
}

export function TradingDataProvider({ children }: { children: ReactNode }) {
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [profile, setProfile] = useState<TradingProfile>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  // Keep a stable ref to getToken so it doesn't cause fetchAccounts to re-create
  const getTokenRef = useRef(getToken);
  getTokenRef.current = getToken;
  // Guard against concurrent fetches racing
  const fetchingRef = useRef(false);
  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchAccounts = useCallback(async () => {
    if (!isSignedIn) {
      setProfile(defaultProfile);
      setLoading(false);
      return;
    }
    // Prevent concurrent fetches
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      const token = await getTokenRef.current();
      const apiBase = getApiBase();
      const res = await fetch(`${apiBase}/api/accounts/my`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) {
          // Only reset to empty if we haven't loaded accounts yet —
          // never wipe already-loaded accounts on a transient 404
          setProfile(prev => prev.accounts.length > 0 ? prev : defaultProfile);
        } else {
          throw new Error(`Failed to fetch accounts: ${res.status}`);
        }
      } else {
        const data = await res.json();
        const accounts: TradingAccount[] = data.accounts || [];
        const dashAccounts = accounts.map(mapApiAccountToDashboard);

        setProfile(prev => ({
          ...prev,
          accounts: dashAccounts,
        }));
      }
    } catch (err: any) {
      console.error("[TradingData] Failed to fetch accounts:", err);
      setError(err.message || "Failed to load trading data");
      // Never clear profile on errors
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [isSignedIn]);

  // Fetch user profile metadata (totalPayout, referralCode)
  useEffect(() => {
    if (!isSignedIn) return;

    const fetchMeta = async () => {
      try {
        const token = await getToken();
        const apiBase = getApiBase();
        const res = await fetch(`${apiBase}/api/users/me`, {
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          credentials: "include",
        });
        if (res.ok) {
          const user = await res.json();
          setProfile((prev) => ({
            ...prev,
            totalPayout: user.totalPayout ?? 0,
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
    // Wait until Supabase auth is fully initialized before fetching
    if (!isLoaded) return;
    // Debounce: wait 300ms after the last isSignedIn change to avoid firing
    // during the INITIAL_SESSION → SIGNED_IN auth state sequence
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchAccounts();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fetchAccounts, isLoaded]);

  // Demo data loader disabled - all accounts must come from real provisioning
  const loadDemoData = useCallback(() => {
    console.warn("[TradingData] Demo data is disabled. All accounts must be provisioned via payments.");
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
