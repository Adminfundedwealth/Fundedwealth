import { sql } from "drizzle-orm";
import type { SQL } from "drizzle-orm";

const TERMINAL_API_URL = "https://new-terminal-production.up.railway.app";

type TerminalAccountSource = {
  customer: {
    id: string;
    email: string;
    name: string;
  };
  account: {
    id: string;
    traderId: string;
    accountCode: string;
    status: string;
    balance: number;
    availableMargin: number | null;
    usedMargin: number | null;
  };
  challenge: {
    id: string;
    traderId: string;
    status: string;
    type: string;
    plan: string;
    initialBalance: number;
    currentBalance: number;
    peakBalance: number;
    profitTargetPct: number;
    dailyLossLimitPct: number;
    maxDrawdownPct: number;
    minTradingDays: number;
  };
  provisioning: {
    status: string;
    traderId: string;
    tradingAccountId: string;
    challengeAccountId: string;
  };
};

export async function loadVerifiedTerminalAccountSource(
  db: { execute: (query: SQL<unknown>) => Promise<{ rows?: Record<string, unknown>[] }> },
  userId: string,
  tradingAccountId: string,
): Promise<TerminalAccountSource> {
  const result = await db.execute(sql`
    SELECT
      u.id::text AS customer_id,
      u.email AS customer_email,
      concat_ws(' ', u.first_name, u.last_name) AS customer_name,
      ta.id::text AS trading_account_id,
      ta.trader_id::text AS trader_id,
      ta.account_code,
      ta.status AS trading_status,
      ta.balance AS trading_balance,
      ta.available_margin,
      ca.id::text AS challenge_account_id,
      ca.trader_id::text AS challenge_trader_id,
      ca.status AS challenge_status,
      ca.type AS challenge_type,
      ca.plan,
      ca.initial_balance,
      ca.current_balance,
      ca.peak_balance,
      ca.profit_target_pct,
      ca.daily_loss_limit_pct,
      ca.max_drawdown_pct,
      ca.min_trading_days,
      pl.status AS provisioning_status,
      pl.trader_id::text AS provisioning_trader_id,
      pl.trading_account_id::text AS provisioning_trading_account_id,
      pl.challenge_account_id::text AS provisioning_challenge_account_id
    FROM trading_accounts ta
    JOIN challenge_accounts ca ON ca.id = ta.challenge_id
    JOIN terminal_traders tt
      ON tt.id = ta.trader_id
      AND tt.external_id = ${String(userId)}
    JOIN users u
      ON u.id = ${String(userId)}::uuid
      AND u.is_active IS TRUE
      AND u.account_status = 'active'
    JOIN LATERAL (
      SELECT status, trader_id, trading_account_id, challenge_account_id
      FROM provisioning_logs
      WHERE trading_account_id = ta.id
      ORDER BY created_at DESC
      LIMIT 1
    ) pl ON true
    WHERE ta.id = ${String(tradingAccountId)}::uuid
    LIMIT 2
  `);
  const rows = result.rows ?? [];
  if (rows.length !== 1) {
    throw Object.assign(new Error("A unique owner-linked account with provisioning history could not be verified."), {
      status: 409,
    });
  }

  const row = rows[0];
  if (row.provisioning_status !== "completed" ||
      row.provisioning_trader_id !== row.trader_id ||
      row.provisioning_trading_account_id !== row.trading_account_id ||
      row.provisioning_challenge_account_id !== row.challenge_account_id) {
    throw Object.assign(new Error("The latest provisioning record does not match this account and owner."), {
      status: 409,
    });
  }

  const number = (value: unknown): number => Number(value);
  const optionalNumber = (value: unknown): number | null =>
    value === null || value === undefined ? null : number(value);

  return {
    customer: {
      id: String(row.customer_id),
      email: String(row.customer_email ?? ""),
      name: String(row.customer_name ?? ""),
    },
    account: {
      id: String(row.trading_account_id),
      traderId: String(row.trader_id),
      accountCode: String(row.account_code ?? ""),
      status: String(row.trading_status ?? ""),
      balance: number(row.trading_balance),
      availableMargin: optionalNumber(row.available_margin),
      usedMargin: null,
    },
    challenge: {
      id: String(row.challenge_account_id),
      traderId: String(row.challenge_trader_id ?? ""),
      status: String(row.challenge_status ?? ""),
      type: String(row.challenge_type ?? ""),
      plan: String(row.plan ?? ""),
      initialBalance: number(row.initial_balance),
      currentBalance: number(row.current_balance),
      peakBalance: number(row.peak_balance),
      profitTargetPct: number(row.profit_target_pct),
      dailyLossLimitPct: number(row.daily_loss_limit_pct),
      maxDrawdownPct: number(row.max_drawdown_pct),
      minTradingDays: number(row.min_trading_days),
    },
    provisioning: {
      status: String(row.provisioning_status ?? ""),
      traderId: String(row.provisioning_trader_id ?? ""),
      tradingAccountId: String(row.provisioning_trading_account_id ?? ""),
      challengeAccountId: String(row.provisioning_challenge_account_id ?? ""),
    },
  };
}

export async function ensureTerminalAccountLink(source: TerminalAccountSource): Promise<void> {
  const sharedKey = process.env.SSO_API_KEY || process.env.SSO_SHARED_SECRET;
  if (!sharedKey) {
    throw Object.assign(new Error("Terminal account linking is not configured."), { status: 503 });
  }

  let response: Response;
  try {
    response = await fetch(`${process.env.TERMINAL_API_URL || TERMINAL_API_URL}/api/admin/account-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sso-api-key": sharedKey,
      },
      body: JSON.stringify({ mode: "ensure", source }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    throw Object.assign(new Error("Terminal account-link service is unavailable."), { status: 503 });
  }

  if (!response.ok) {
    throw Object.assign(new Error("Terminal account-link preflight or reconciliation was rejected."), {
      status: response.status,
    });
  }

  let body: { success?: boolean; result?: unknown };
  try {
    body = await response.json() as { success?: boolean; result?: unknown };
  } catch {
    throw Object.assign(new Error("Terminal account-link service returned an invalid response."), { status: 502 });
  }
  if (body.success !== true || !body.result) {
    throw Object.assign(new Error("Terminal account-link service returned an incomplete result."), { status: 502 });
  }
}
