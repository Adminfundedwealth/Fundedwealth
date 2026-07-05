/**
 * Provisioning Service — the SINGLE account-creation path.
 *
 * Uses only tables that exist in the main site's Supabase DB:
 *   - provisioning_logs  (bridge: main site writes, terminal reads)
 *   - trading_accounts   (Drizzle schema: user_id, plan, virtual_balance, …)
 *   - orders             (confirm + store credentials in metadata)
 *   - users              (resolve user)
 *
 * terminal_traders and challenge_accounts are TERMINAL-OWNED tables that do
 * NOT exist in this DB. The terminal picks up provisioning_logs rows with
 * status='pending' and creates those records in its own DB.
 *
 * Steps:
 *   1. Insert provisioning_logs (status='processing')
 *   2. Resolve user + account size
 *   3. Create trading_accounts (using Drizzle schema columns)
 *   4. Update provisioning_logs → 'completed' (tradingAccountId filled)
 *   5. Confirm the order + store credentials in metadata
 */
import { randomUUID } from "crypto";
import { db, orders } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  getProvisioningRules,
  resolveAccountSize,
  type PlanType,
} from "@workspace/products";

export type ProvisioningSource = "website" | "founder_emergency";

export interface ProvisionChallengeInput {
  planType: PlanType;
  orderId?: string | null;
  userId?: string | null;
  sizeIndex?: number | null;
  accountSize?: number | null;
  paymentMethod: string;
  paymentRef?: string | null;
  source?: ProvisioningSource;
  tempPassword?: string | null;
}

export interface ProvisionChallengeResult {
  provisioningLogId: string;
  traderId: string;
  challengeAccountId: string;
  tradingAccountId: string;
  accountCode: string;
  accountSize: number;
}

function generateAccountCode(): string {
  const prefix = "FW";
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `${prefix}-${ts}${rand}`;
}

export async function provisionChallenge(
  input: ProvisionChallengeInput,
): Promise<ProvisionChallengeResult> {
  const {
    planType,
    orderId = null,
    sizeIndex = null,
    paymentMethod,
    paymentRef = null,
    source = "website",
  } = input;

  // ── 1. Insert provisioning_logs row ────────────────────────────────────────
  const logOrderRef = orderId ?? `emergency-${randomUUID()}`;
  const provResult = await db.execute(sql`
    INSERT INTO provisioning_logs
      (order_id, plan, payment_method, payment_ref, source, status, started_at, created_at)
    VALUES
      (${logOrderRef}, ${planType}, ${paymentMethod}, ${paymentRef},
       ${source}, 'processing', now(), now())
    RETURNING id
  `);
  const provId = (provResult.rows[0] as any).id as string;

  // ── 2. Resolve user id + account size ──────────────────────────────────────
  let userId    = input.userId ?? null;
  let accountSize = input.accountSize ?? null;
  let tempPassword = input.tempPassword ?? null;

  if (orderId) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new Error(`Order ${orderId} not found during provisioning`);
    userId      = userId      ?? order.userId;
    accountSize = accountSize ?? order.accountSize ?? null;

    if (!tempPassword && order.metadata) {
      try {
        const meta = JSON.parse(order.metadata as string);
        tempPassword = meta.tempPassword ?? null;
      } catch { /* ignore */ }
    }
  }

  if (accountSize == null && sizeIndex != null) {
    accountSize = resolveAccountSize(planType, sizeIndex);
  }
  if (!userId)      throw new Error("provisionChallenge requires a userId (directly or via orderId)");
  if (!accountSize) accountSize = resolveAccountSize(planType, 0) ?? 50000;

  // ── 3. Load user ────────────────────────────────────────────────────────────
  const userResult = await db.execute(sql`
    SELECT id, first_name, last_name, email FROM users WHERE id = ${userId}::uuid LIMIT 1
  `);
  const user = (userResult.rows as any[])[0];
  if (!user) throw new Error(`User ${userId} not found during provisioning`);

  // ── 4. Risk settings from shared catalog ───────────────────────────────────
  const rules       = getProvisioningRules(planType);
  const initialBalance = accountSize;
  const expiresAt   = new Date();
  expiresAt.setDate(expiresAt.getDate() + rules.maxDaysAllowed);

  const accountCode = generateAccountCode();

  // ── 5. Get or create terminal_traders (real DB uses trader_id, not user_id) ─
  const existingTrader = await db.execute(sql`
    SELECT id FROM terminal_traders WHERE external_id = ${String(userId)} LIMIT 1
  `);
  let traderId: string;
  if (existingTrader.rows && existingTrader.rows.length > 0) {
    traderId = (existingTrader.rows[0] as any).id;
  } else {
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Trader";
    const traderInsert = await db.execute(sql`
      INSERT INTO terminal_traders (external_id, email, display_name, plan, status, created_at, updated_at)
      VALUES (${String(userId)}, ${user.email}, ${displayName}, ${planType}, 'active', now(), now())
      RETURNING id
    `);
    traderId = (traderInsert.rows[0] as any).id;
  }

  // ── 6. Create challenge_accounts (confirmed real columns from DB)
  // type CHECK constraint allows: evaluation_phase1 | evaluation_phase2 | funded
  const challengeType = planType === "instant" ? "funded" : "evaluation_phase1";
  const challengeResult = await db.execute(sql`
    INSERT INTO challenge_accounts (
      trader_id, type, plan,
      initial_balance, current_balance, peak_balance,
      profit_target_pct, daily_loss_limit_pct, max_drawdown_pct,
      min_trading_days, status, started_at, expires_at,
      created_at, updated_at
    ) VALUES (
      ${traderId}::uuid, ${challengeType}, ${planType},
      ${initialBalance}, ${initialBalance}, ${initialBalance},
      ${rules.profitTargetPct}, ${rules.dailyLossLimitPct}, ${rules.maxDrawdownPct},
      ${rules.minTradingDays}, 'active', now(),
      ${expiresAt.toISOString()}::timestamptz,
      now(), now()
    )
    RETURNING id
  `);
  const challengeAccountId = (challengeResult.rows[0] as any).id as string;

  // ── 7. Create trading_accounts (confirmed real columns: trader_id, challenge_id, broker_provider, …)
  const tradingResult = await db.execute(sql`
    INSERT INTO trading_accounts (
      trader_id, challenge_id, account_code,
      broker_provider, broker_client_id,
      balance, available_margin, status,
      created_at, updated_at
    ) VALUES (
      ${traderId}::uuid, ${challengeAccountId}::uuid, ${accountCode},
      'paper', ${accountCode},
      ${initialBalance}, ${initialBalance}, 'active',
      now(), now()
    )
    RETURNING id
  `);

  const tradingAccountId = (tradingResult.rows[0] as any).id as string;

  // ── 8. Update provisioning_logs → completed ────────────────────────────────
  await db.execute(sql`
    UPDATE provisioning_logs
    SET status                = 'completed',
        trader_id             = ${traderId}::uuid,
        challenge_account_id  = ${challengeAccountId}::uuid,
        trading_account_id    = ${tradingAccountId}::uuid,
        completed_at          = now()
    WHERE id = ${provId}::uuid
  `);

  // ── 9. Confirm order + store credentials ───────────────────────────────────
  if (orderId) {
    const loginEmail = user?.email ?? null;

    let existingMeta: Record<string, unknown> = {};
    try {
      const [ord] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (ord?.metadata) existingMeta = JSON.parse(ord.metadata as string);
    } catch { /* ignore */ }

    const updatedMeta = JSON.stringify({
      ...existingMeta,
      loginEmail,
      accountCode,
      tempPassword: tempPassword ?? existingMeta.tempPassword ?? null,
    });

    await db.execute(sql`
      UPDATE orders
      SET status   = 'confirmed',
          metadata = ${updatedMeta},
          updated_at = now()
      WHERE id = ${orderId}
        AND status IN ('paid', 'pending', 'confirmed')
    `);
  }

  console.log(
    `[Provisioning] COMPLETED source=${source} order=${orderId ?? "-"} plan=${planType} ` +
    `accountCode=${accountCode} traderId=${traderId} challengeId=${challengeAccountId} tradingId=${tradingAccountId}`,
  );

  return {
    provisioningLogId: provId,
    traderId,
    challengeAccountId,
    tradingAccountId,
    accountCode,
    accountSize: initialBalance,
  };
}
