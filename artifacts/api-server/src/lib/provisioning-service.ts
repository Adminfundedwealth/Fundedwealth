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
import { db, orders, tradingAccounts } from "@workspace/db";
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

  // ── 5. Create trading_accounts using the Drizzle Supabase schema ───────────
  // Columns match trading-accounts.ts exactly:
  //   account_code, user_id, order_id, plan, phase, virtual_balance,
  //   profit_target, max_drawdown, daily_loss_limit, fee_paid, expires_at, status
  const [ta] = await db.insert(tradingAccounts).values({
    id:             randomUUID(),
    accountCode,
    userId:         String(userId),
    orderId:        orderId ?? null,
    planType,                                          // mapped to "plan" column
    phase:          "phase_1",
    status:         "active",
    currentBalance: initialBalance,                    // mapped to "virtual_balance"
    profitTarget:   Math.round(initialBalance * rules.profitTargetPct  / 100),
    maxDrawdown:    Math.round(initialBalance * rules.maxDrawdownPct    / 100),
    dailyLossLimit: Math.round(initialBalance * rules.dailyLossLimitPct / 100),
    profitSplit:    80,
    tradingDays:    0,
    feePaid:        0,
    isFunded:       false,
    expiresAt,
  }).returning();

  const tradingAccountId = ta.id;

  // ── 6. Update provisioning_logs → completed ────────────────────────────────
  // traderId / challengeAccountId are terminal-owned; leave as NULL here.
  // The terminal will fill them in when it processes this log.
  await db.execute(sql`
    UPDATE provisioning_logs
    SET status              = 'completed',
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
    `accountCode=${accountCode} tradingId=${tradingAccountId}`,
  );

  return {
    provisioningLogId: provId,
    traderId:          "",          // terminal will set this
    challengeAccountId: "",         // terminal will set this
    tradingAccountId,
    accountCode,
    accountSize: initialBalance,
  };
}
