import { sql, type SQL } from "drizzle-orm";

type DbLike = { execute: (query: SQL<unknown> | string) => Promise<{ rows?: any[] }>; };

type ColumnSet = Set<string>;

export function normalizeColumns(rows: Array<Record<string, unknown>> = []): ColumnSet {
  return new Set(
    (rows || [])
      .map((row) => String(row?.column_name || row?.COLUMN_NAME || row?.name || "").toLowerCase())
      .filter(Boolean)
  );
}

export async function getTableColumns(db: DbLike, tableName: string): Promise<ColumnSet> {
  try {
    const result = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${tableName}
    `);
    return normalizeColumns((result?.rows || []) as Array<Record<string, unknown>>);
  } catch {
    return new Set();
  }
}

export function getTerminalTraderOwnerClauses(columns: ColumnSet, userId: string) {
  const clauses: Array<{ column: string; value: string; type: string }> = [];
  if (columns.has("external_id")) {
    clauses.push({ column: "external_id", value: userId, type: "uuid" });
  }
  if (columns.has("user_id")) {
    clauses.push({ column: "user_id", value: userId, type: "uuid" });
  }
  return clauses;
}

export function getAccountOwnerClauses(columns: ColumnSet, userId: string, traderId: string | null) {
  const clauses: Array<{ column: string; value: string; type: string }> = [];
  if (columns.has("trader_id") && traderId) {
    clauses.push({ column: "trader_id", value: traderId, type: "uuid" });
  }
  if (columns.has("user_id")) {
    clauses.push({ column: "user_id", value: userId, type: "uuid" });
  }
  return clauses;
}

export async function resolveUserTraderId(db: DbLike, userId: string): Promise<string | null> {
  const terminalColumns = await getTableColumns(db, "terminal_traders");
  if (terminalColumns.size > 0) {
    if (terminalColumns.has("external_id")) {
      const result = await db.execute(sql`
        SELECT id FROM terminal_traders
        WHERE external_id = ${String(userId)}
        LIMIT 1
      `);
      if ((result?.rows || []).length > 0) return (result.rows?.[0] as any)?.id || null;
    }
    if (terminalColumns.has("user_id")) {
      const result = await db.execute(sql`
        SELECT id FROM terminal_traders
        WHERE user_id = ${String(userId)}::uuid
        LIMIT 1
      `);
      if ((result?.rows || []).length > 0) return (result.rows?.[0] as any)?.id || null;
    }
  }

  return null;
}

export async function fetchUserLiveAccounts(db: DbLike, userId: string, traderId: string | null): Promise<any[]> {
  const tradingColumns = await getTableColumns(db, "trading_accounts");
  const challengeColumns = await getTableColumns(db, "challenge_accounts");
  const terminalColumns = await getTableColumns(db, "terminal_traders");
  const hasTradingTrader = tradingColumns.has("trader_id");
  const hasChallengeTrader = challengeColumns.has("trader_id");
  const hasTradingUser = tradingColumns.has("user_id");
  const hasChallengeUser = challengeColumns.has("user_id");

  const joinClauses: SQL<unknown>[] = [];
  const whereClauses: SQL<unknown>[] = [];

  // Admin OS resolves ownership through the purchase chain:
  // users -> orders -> provisioning_logs -> challenge/trading account IDs.
  // This is the authoritative link for provisioned accounts and must be part
  // of the dashboard query, even when trader identity columns have drifted.
  whereClauses.push(sql`
    EXISTS (
      SELECT 1
      FROM orders o
      INNER JOIN provisioning_logs pl ON pl.order_id::text = o.id::text
      WHERE o.user_id::text = ${String(userId)}::text
        AND (
          pl.trading_account_id::text = ta.id::text
          OR pl.challenge_account_id::text = ca.id::text
        )
    )
  `);

  if (terminalColumns.has("external_id") || terminalColumns.has("user_id")) {
    joinClauses.push(sql`LEFT JOIN terminal_traders tt ON tt.id = ta.trader_id`);
  }

  if (hasTradingTrader || hasChallengeTrader) {
    if (traderId) {
      whereClauses.push(sql`(ta.trader_id = ${String(traderId)}::uuid OR ca.trader_id = ${String(traderId)}::uuid)`);
    }
  }

  const directOwnerClauses: SQL<unknown>[] = [];
  if (terminalColumns.has("external_id")) {
    directOwnerClauses.push(sql`tt.external_id = ${String(userId)}`);
  }
  if (terminalColumns.has("user_id")) {
    directOwnerClauses.push(sql`tt.user_id = ${String(userId)}::uuid`);
  }
  if (hasTradingUser) {
    directOwnerClauses.push(sql`ta.user_id = ${String(userId)}::uuid`);
  }
  if (hasChallengeUser) {
    directOwnerClauses.push(sql`ca.user_id = ${String(userId)}::uuid`);
  }
  if (directOwnerClauses.length > 0) {
    whereClauses.push(sql`(${sql.join(directOwnerClauses, sql` OR `)})`);
  }

  if (whereClauses.length === 0) {
    return [];
  }

  const query = sql`
    SELECT
      ta.id               AS trading_account_id,
      ta.account_code     AS account_code,
      ta.broker_provider  AS broker_provider,
      ta.broker_client_id AS broker_client_id,
      ta.balance          AS ta_balance,
      ta.available_margin AS available_margin,
      ta.status           AS trading_status,
      ta.broker_credentials_encrypted AS broker_credentials_encrypted,
      ca.id               AS challenge_account_id,
      ca.type             AS challenge_type,
      ca.plan             AS plan,
      ca.initial_balance  AS initial_balance,
      ca.current_balance  AS current_balance,
      ca.profit_target_pct    AS profit_target_pct,
      ca.daily_loss_limit_pct AS daily_loss_limit_pct,
      ca.max_drawdown_pct     AS max_drawdown_pct,
      ca.min_trading_days     AS min_trading_days,
      ca.status           AS challenge_status,
      ca.started_at       AS started_at,
      ca.expires_at       AS expires_at,
      ca.created_at       AS created_at,
      ca.updated_at       AS updated_at
    FROM trading_accounts ta
    LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
    ${sql.join(joinClauses, sql` `)}
    WHERE (${sql.join(whereClauses, sql` OR `)})
      AND ta.status != 'inactive'
    ORDER BY ca.created_at DESC NULLS LAST
  `;

  const result = await db.execute(query);
  return (result?.rows || []) as any[];
}

export async function resolveUserAccountOwnership(db: DbLike, userId: string, accountId: string) {
  const tradingColumns = await getTableColumns(db, "trading_accounts");
  const challengeColumns = await getTableColumns(db, "challenge_accounts");
  const terminalColumns = await getTableColumns(db, "terminal_traders");
  const ownerClauses: SQL<unknown>[] = [];

  if (terminalColumns.has("external_id")) ownerClauses.push(sql`tt.external_id = ${String(userId)}`);
  if (terminalColumns.has("user_id")) ownerClauses.push(sql`tt.user_id = ${String(userId)}::uuid`);
  if (tradingColumns.has("user_id")) ownerClauses.push(sql`ta.user_id = ${String(userId)}::uuid`);
  if (challengeColumns.has("user_id")) ownerClauses.push(sql`ca.user_id = ${String(userId)}::uuid`);

  if (ownerClauses.length === 0) {
    return { rows: [] };
  }

  const result = await db.execute(sql`
    SELECT
      tt.id AS trader_id,
      ca.id AS challenge_account_id,
      ta.id AS trading_account_id,
      ca.status AS challenge_status,
      ca.plan AS plan,
      ca.initial_balance AS initial_balance,
      ta.account_code AS account_code,
      ta.status AS trading_status
    FROM trading_accounts ta
    LEFT JOIN terminal_traders tt ON tt.id = ta.trader_id
    LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
    WHERE (ta.id = ${accountId}::uuid OR ca.id = ${accountId}::uuid)
      AND (${sql.join(ownerClauses, sql` OR `)})
    LIMIT 1
  `);

  return result || { rows: [] };
}
