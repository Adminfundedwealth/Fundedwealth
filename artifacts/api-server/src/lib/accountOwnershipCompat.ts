import { sql, type SQL, type SQLWrapper } from "drizzle-orm";

type DbLike = { execute: (query: SQL<unknown> | string) => Promise<{ rows?: any[] }>; };

type ColumnSet = Set<string>;

export function buildOrderOwnerPredicate(orderUserId: SQLWrapper, userId: string, authUserId: string) {
  return sql`(
    ${orderUserId}::text = ${String(userId)}::text
    OR (
      ${orderUserId}::text = ${String(authUserId)}::text
      AND EXISTS (
        SELECT 1
        FROM public.users purchase_owner
        WHERE purchase_owner.id::text = ${String(userId)}::text
          AND purchase_owner.clerk_id = ${String(authUserId)}
      )
    )
  )`;
}

function buildNoForeignPurchaseLinks(userId: string, authUserId: string) {
  return sql`NOT EXISTS (
    SELECT 1
    FROM public.orders linked_order
    WHERE (
      NULLIF(to_jsonb(ta)->>'order_id', '') = linked_order.id::text
      OR NULLIF(to_jsonb(ca)->>'order_id', '') = linked_order.id::text
      OR EXISTS (
        SELECT 1
        FROM public.provisioning_logs linked_log
        WHERE linked_log.order_id::text = linked_order.id::text
          AND (
            linked_log.trading_account_id::text = ta.id::text
            OR linked_log.challenge_account_id::text = ca.id::text
          )
      )
    )
      AND NOT ${buildOrderOwnerPredicate(sql`linked_order.user_id`, userId, authUserId)}
  )`;
}

function buildOwnedPurchaseAccountPredicate(userId: string, authUserId: string) {
  return sql`(
    EXISTS (
      SELECT 1
      FROM public.orders o
      WHERE ${buildOrderOwnerPredicate(sql`o.user_id`, userId, authUserId)}
        AND (
          (
            COALESCE(
              NULLIF(to_jsonb(ta)->>'order_id', ''),
              NULLIF(to_jsonb(ca)->>'order_id', '')
            ) IS NOT NULL
            AND (
              NULLIF(to_jsonb(ta)->>'order_id', '') IS NULL
              OR NULLIF(to_jsonb(ta)->>'order_id', '') = o.id::text
            )
            AND (
              NULLIF(to_jsonb(ca)->>'order_id', '') IS NULL
              OR NULLIF(to_jsonb(ca)->>'order_id', '') = o.id::text
            )
          )
          OR (
            NULLIF(to_jsonb(ta)->>'order_id', '') IS NULL
            AND NULLIF(to_jsonb(ca)->>'order_id', '') IS NULL
            AND EXISTS (
              SELECT 1
              FROM public.provisioning_logs pl
              WHERE pl.order_id::text = o.id::text
                AND (
                  pl.trading_account_id::text = ta.id::text
                  OR pl.challenge_account_id::text = ca.id::text
                )
            )
          )
        )
    )
      AND ${buildNoForeignPurchaseLinks(userId, authUserId)}
  )`;
}

function buildOwnedAccountOrderId(userId: string, authUserId: string) {
  return sql`COALESCE(
    NULLIF(to_jsonb(ta)->>'order_id', ''),
    NULLIF(to_jsonb(ca)->>'order_id', ''),
    (
      SELECT pl.order_id::text
      FROM public.provisioning_logs pl
      WHERE (
        pl.trading_account_id::text = ta.id::text
        OR pl.challenge_account_id::text = ca.id::text
      )
        AND EXISTS (
          SELECT 1
          FROM public.orders linked_order
          WHERE linked_order.id::text = pl.order_id::text
            AND ${buildOrderOwnerPredicate(sql`linked_order.user_id`, userId, authUserId)}
        )
      ORDER BY pl.created_at DESC
      LIMIT 1
    )
  )`;
}

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

export async function fetchUserLiveAccounts(
  db: DbLike,
  userId: string,
  traderId: string | null,
  authUserId: string = userId
): Promise<any[]> {
  const tradingColumns = await getTableColumns(db, "trading_accounts");
  const challengeColumns = await getTableColumns(db, "challenge_accounts");
  const terminalColumns = await getTableColumns(db, "terminal_traders");
  const hasTradingTrader = tradingColumns.has("trader_id");
  const hasChallengeTrader = challengeColumns.has("trader_id");
  const hasTradingUser = tradingColumns.has("user_id");
  const hasChallengeUser = challengeColumns.has("user_id");

  const joinClauses: SQL<unknown>[] = [];
  const whereClauses: SQL<unknown>[] = [];

  // Orders have historically stored either public.users.id or auth.users.id.
  // Ownership remains anchored to the authenticated user's canonical profile.
  whereClauses.push(buildOwnedPurchaseAccountPredicate(userId, authUserId));

  if (terminalColumns.has("external_id") || terminalColumns.has("user_id")) {
    joinClauses.push(sql`LEFT JOIN terminal_traders tt ON tt.id = ta.trader_id`);
  }

  const traderOwnerClauses: SQL<unknown>[] = [];
  if (traderId && hasTradingTrader) {
    traderOwnerClauses.push(sql`ta.trader_id = ${String(traderId)}::uuid`);
  }
  if (traderId && hasChallengeTrader) {
    traderOwnerClauses.push(sql`ca.trader_id = ${String(traderId)}::uuid`);
  }
  if (traderOwnerClauses.length > 0) {
    whereClauses.push(sql`
      ((${sql.join(traderOwnerClauses, sql` OR `)})
        AND ${buildNoForeignPurchaseLinks(userId, authUserId)})
    `);
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
    whereClauses.push(sql`
      ((${sql.join(directOwnerClauses, sql` OR `)})
        AND ${buildNoForeignPurchaseLinks(userId, authUserId)})
    `);
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
      ${buildOwnedAccountOrderId(userId, authUserId)} AS linked_order_id,
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

export async function resolveUserAccountOwnership(
  db: DbLike,
  userId: string,
  accountId: string,
  authUserId: string = userId
) {
  const tradingColumns = await getTableColumns(db, "trading_accounts");
  const challengeColumns = await getTableColumns(db, "challenge_accounts");
  const terminalColumns = await getTableColumns(db, "terminal_traders");
  const ownerClauses: SQL<unknown>[] = [];

  const directOwnerClauses: SQL<unknown>[] = [];
  if (terminalColumns.has("external_id")) directOwnerClauses.push(sql`tt.external_id = ${String(userId)}`);
  if (terminalColumns.has("user_id")) directOwnerClauses.push(sql`tt.user_id = ${String(userId)}::uuid`);
  if (tradingColumns.has("user_id")) directOwnerClauses.push(sql`ta.user_id = ${String(userId)}::uuid`);
  if (challengeColumns.has("user_id")) directOwnerClauses.push(sql`ca.user_id = ${String(userId)}::uuid`);
  if (directOwnerClauses.length > 0) {
    ownerClauses.push(sql`
      ((${sql.join(directOwnerClauses, sql` OR `)})
        AND ${buildNoForeignPurchaseLinks(userId, authUserId)})
    `);
  }

  ownerClauses.push(buildOwnedPurchaseAccountPredicate(userId, authUserId));

  const result = await db.execute(sql`
    SELECT
      tt.id AS trader_id,
      ca.id AS challenge_account_id,
      ta.id AS trading_account_id,
      ta.trader_id AS account_trader_id,
      ta.balance AS account_balance,
      ta.available_margin AS available_margin,
      ta.used_margin AS used_margin,
      ca.status AS challenge_status,
      ca.trader_id AS challenge_trader_id,
      ca.type AS challenge_type,
      ca.plan AS plan,
      ca.initial_balance AS initial_balance,
      ca.current_balance AS current_balance,
      ca.peak_balance AS peak_balance,
      ca.profit_target_pct AS profit_target_pct,
      ca.daily_loss_limit_pct AS daily_loss_limit_pct,
      ca.max_drawdown_pct AS max_drawdown_pct,
      ca.min_trading_days AS min_trading_days,
      ca.expires_at AS expires_at,
      ta.account_code AS account_code,
      ta.status AS trading_status,
      ${buildOwnedAccountOrderId(userId, authUserId)} AS order_id,
      pl.status AS provisioning_status,
      pl.trading_account_id AS provisioning_trading_account_id,
      pl.challenge_account_id AS provisioning_challenge_account_id,
      pl.trader_id AS provisioning_trader_id
    FROM trading_accounts ta
    LEFT JOIN terminal_traders tt ON tt.id = ta.trader_id
    LEFT JOIN challenge_accounts ca ON ca.id = ta.challenge_id
    LEFT JOIN LATERAL (
      SELECT pl.status, pl.trading_account_id, pl.challenge_account_id, pl.trader_id
      FROM public.provisioning_logs pl
      WHERE (
          pl.trading_account_id::text = ta.id::text
          OR pl.challenge_account_id::text = ca.id::text
        )
        AND EXISTS (
          SELECT 1
          FROM public.orders linked_order
          WHERE linked_order.id::text = pl.order_id::text
            AND ${buildOrderOwnerPredicate(sql`linked_order.user_id`, userId, authUserId)}
        )
      ORDER BY pl.completed_at DESC NULLS LAST, pl.created_at DESC
      LIMIT 1
    ) pl ON true
    WHERE (ta.id = ${accountId}::uuid OR ca.id = ${accountId}::uuid)
      AND (${sql.join(ownerClauses, sql` OR `)})
    LIMIT 1
  `);

  return result || { rows: [] };
}
