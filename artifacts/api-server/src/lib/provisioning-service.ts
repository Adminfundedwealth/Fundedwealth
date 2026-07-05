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

  // ── 6. Create trading_accounts using raw SQL (real columns: trader_id, account_code, plan, …)
  const tradingResult = await db.execute(sql`
    INSERT INTO trading_accounts (
      account_code, trader_id, order_id, plan, phase, status,
      virtual_balance, profit_target, max_drawdown, daily_loss_limit,
      profit_split, trading_days, fee_paid, is_funded, expires_at,
      created_at, updated_at
    ) VALUES (
      ${accountCode}, ${traderId}::uuid, ${orderId},
      ${planType}, 'phase_1', 'active',
      ${initialBalance}, ${Math.round(initialBalance * rules.profitTargetPct  / 100)},
      ${Math.round(initialBalance * rules.maxDrawdownPct    / 100)},
      ${Math.round(initialBalance * rules.dailyLossLimitPct / 100)},
      80, 0, 0, false,
      ${expiresAt.toISOString()}::timestamptz,
      now(), now()
    )
    RETURNING id
  `);

  const tradingAccountId = (tradingResult.rows[0] as any).id as string;

  // ── 7. Update provisioning_logs → completed ────────────────────────────────
  await db.execute(sql`
    UPDATE provisioning_logs
    SET status              = 'completed',
        trader_id           = ${traderId}::uuid,
        trading_account_id  = ${tradingAccountId}::uuid,
        completed_at        = now()
    WHERE id = ${provId}::uuid
  `);

  // ── 7. Confirm order + store credentials ───────────────────────────────────
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
    `accountCode=${accountCode} traderId=${traderId} tradingId=${tradingAccountId}`,
  );

  return {
    provisioningLogId: provId,
    traderId,
    challengeAccountId: "",         // terminal will set this
    tradingAccountId,
    accountCode,
    accountSize: initialBalance,
  };
}
