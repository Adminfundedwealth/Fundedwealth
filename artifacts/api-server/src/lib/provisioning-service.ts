/**
 * Provisioning Service — the SINGLE account-creation path.
 *
 * Both the Main Website checkout (Razorpay / OxaPay crypto / manual UPI / bank)
 * and the Founder Emergency Provision call `provisionChallenge`. Because they
 * share this function AND the shared product catalog (@workspace/products),
 * every path creates IDENTICAL challenge_accounts, trading_accounts and risk
 * settings for the same plan + size.
 *
 * Steps:
 *   1. Insert provisioning_logs (status='processing')
 *   2. Resolve user + account size (from the order, or from plan+sizeIndex)
 *   3. Get/create terminal_traders
 *   4. Create challenge_accounts (risk settings from @workspace/products)
 *   5. Create trading_accounts
 *   6. Update provisioning_logs → 'completed'
 *   7. Confirm the order (when an order is involved)
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
  /** Plan to provision. */
  planType: PlanType;
  /** Existing order id. When provided, user + account size are read from it. */
  orderId?: string | null;
  /** Internal users.id — required when no orderId is supplied. */
  userId?: string | null;
  /** Used to resolve the account size when there is no order. */
  sizeIndex?: number | null;
  /** Explicit account size override (INR). Falls back to order/size resolution. */
  accountSize?: number | null;
  paymentMethod: string;
  paymentRef?: string | null;
  source?: ProvisioningSource;
  /** Temporary password generated during auth identity creation (stored for display on Accounts page). */
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

  // 1. Insert provisioning_logs row (use orderId when present, else a synthetic ref)
  const logOrderRef = orderId ?? `emergency-${randomUUID()}`;
  const provResult = await db.execute(sql`
    INSERT INTO provisioning_logs (order_id, plan, payment_method, payment_ref, source, status, started_at, created_at)
    VALUES (${logOrderRef}, ${planType}, ${paymentMethod}, ${paymentRef}, ${source}, 'processing', now(), now())
    RETURNING id
  `);
  const provId = (provResult.rows[0] as any).id;

  // 2. Resolve user id + account size
  let userId = input.userId ?? null;
  let accountSize = input.accountSize ?? null;
  let tempPassword = input.tempPassword ?? null;

  if (orderId) {
    const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
    if (!order) throw new Error(`Order ${orderId} not found during provisioning`);
    userId = userId ?? order.userId;
    accountSize = accountSize ?? order.accountSize ?? null;
    
    // Read tempPassword from existing order metadata if not provided in input
    if (!tempPassword && order.metadata) {
      try {
        const meta = JSON.parse(order.metadata as string);
        tempPassword = meta.tempPassword ?? null;
      } catch { /* ignore parse errors */ }
    }
  }

  if (accountSize == null && sizeIndex != null) {
    accountSize = resolveAccountSize(planType, sizeIndex);
  }
  if (!userId) throw new Error("provisionChallenge requires a userId (directly or via orderId)");
  if (!accountSize) accountSize = resolveAccountSize(planType, 0) ?? 50000;

  // 3. Load user + get/create terminal_traders (terminal schema: external_id links to users.id)
  const userResult = await db.execute(sql`
    SELECT id, first_name, last_name, email FROM users WHERE id = ${userId}::uuid LIMIT 1
  `);
  const user = (userResult.rows as any[])[0];
  if (!user) throw new Error(`User ${userId} not found during provisioning`);

  const existingTrader = await db.execute(sql`
    SELECT id FROM terminal_traders WHERE external_id = ${String(user.id)} LIMIT 1
  `);
  let traderId: string;
  if (existingTrader.rows && existingTrader.rows.length > 0) {
    traderId = (existingTrader.rows[0] as any).id;
  } else {
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Trader";
    const traderInsert = await db.execute(sql`
      INSERT INTO terminal_traders (external_id, email, display_name, plan, status, created_at, updated_at)
      VALUES (${String(user.id)}, ${user.email}, ${displayName}, ${planType}, 'active', now(), now())
      RETURNING id
    `);
    traderId = (traderInsert.rows[0] as any).id;
  }

  // 4. Risk settings come from the shared catalog — identical for every path.
  const rules = getProvisioningRules(planType);
  const initialBalance = accountSize;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + rules.maxDaysAllowed);

  // Map the product catalog discriminator to the challenge_accounts.type check
  // constraint (allowed: evaluation_phase1 | evaluation_phase2 | funded).
  const challengeType = planType === "instant" ? "funded" : "evaluation_phase1";

  // 5. Create challenge_accounts (terminal schema: trader_id, not user_id)
  const challengeResult = await db.execute(sql`
    INSERT INTO challenge_accounts (
      trader_id, type, plan, initial_balance, current_balance, peak_balance,
      profit_target_pct, daily_loss_limit_pct, max_drawdown_pct,
      min_trading_days, status, started_at, expires_at, created_at, updated_at
    ) VALUES (
      ${traderId}::uuid, ${challengeType}, ${planType},
      ${initialBalance}, ${initialBalance}, ${initialBalance},
      ${rules.profitTargetPct}, ${rules.dailyLossLimitPct}, ${rules.maxDrawdownPct},
      ${rules.minTradingDays}, 'active', now(),
      ${expiresAt.toISOString()}::timestamptz, now(), now()
    )
    RETURNING id
  `);
  const challengeAccountId = (challengeResult.rows[0] as any).id;

  // 6. Create trading_accounts (terminal schema: trader_id + challenge_id, broker_provider must
  //    be one of angelone|dhan|upstox|shoonya|paper). Virtual challenge accounts use 'paper'.
  const accountCode = generateAccountCode();
  const tradingResult = await db.execute(sql`
    INSERT INTO trading_accounts (
      trader_id, challenge_id, account_code, broker_provider, broker_client_id,
      balance, available_margin, status, created_at, updated_at
    ) VALUES (
      ${traderId}::uuid, ${challengeAccountId}::uuid, ${accountCode}, 'paper', ${accountCode},
      ${initialBalance}, ${initialBalance}, 'active', now(), now()
    )
    RETURNING id
  `);
  const tradingAccountId = (tradingResult.rows[0] as any).id;

  // 7. Update provisioning_logs → completed
  await db.execute(sql`
    UPDATE provisioning_logs
    SET status = 'completed',
        trader_id = ${traderId}::uuid,
        challenge_account_id = ${challengeAccountId}::uuid,
        trading_account_id = ${tradingAccountId}::uuid,
        completed_at = now()
    WHERE id = ${provId}::uuid
  `);

  // 8. Confirm the originating order (website paths only) and store initial
  //    login credentials in order.metadata so the accounts page can surface them.
  if (orderId) {
    // Load user email for credential storage
    const loginEmail = user?.email ?? null;

    // Merge new credential info into any existing metadata on the order
    let existingMeta: Record<string, unknown> = {};
    try {
      const [ord] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (ord?.metadata) {
        existingMeta = JSON.parse(ord.metadata as string);
      }
    } catch { /* ignore parse errors */ }

    const updatedMeta = JSON.stringify({
      ...existingMeta,
      loginEmail,
      accountCode,
      // Store temp password — either from input param (QR/UPI flow) or from existing metadata (crypto/Razorpay)
      tempPassword: tempPassword ?? existingMeta.tempPassword ?? null,
    });

    await db.execute(sql`
      UPDATE orders
      SET status = 'confirmed', metadata = ${updatedMeta}, updated_at = now()
      WHERE id = ${orderId} AND status IN ('paid', 'pending', 'confirmed')
    `);
  }

  console.log(
    `[Provisioning] COMPLETED source=${source} order=${orderId ?? "-"} plan=${planType} ` +
    `accountCode=${accountCode} challengeId=${challengeAccountId} tradingId=${tradingAccountId}`,
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
