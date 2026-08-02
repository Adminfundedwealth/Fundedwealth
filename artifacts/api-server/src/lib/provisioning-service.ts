import { createHmac } from "crypto";
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
  terminalEmail: string;
  terminalPassword: string;
  activationToken: string;
}

function generateAccountCode(): string {
  const prefix = "FW";
  const ts = Date.now().toString(36).toUpperCase().slice(-4);
  const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
  return `${prefix}-${ts}${rand}`;
}

/**
 * Generate a strong terminal password: 16 chars, upper+lower+digit+special.
 * Format: Fw1!<12 random chars>
 */
function generateTerminalPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const special = "!@#$%";
  let pw = "Fw1" + special[Math.floor(Math.random() * special.length)];
  for (let i = 0; i < 12; i++) {
    pw += chars[Math.floor(Math.random() * chars.length)];
  }
  return pw;
}

const ACTIVATION_TOKEN_ALGORITHM = "HS256";

function getProvisioningTokenSecret(): { secret: string; source: string } {
  if (process.env.SSO_API_KEY) {
    return { secret: process.env.SSO_API_KEY, source: "SSO_API_KEY" };
  }
  if (process.env.INTERNAL_PROVISION_SECRET) {
    return { secret: process.env.INTERNAL_PROVISION_SECRET, source: "INTERNAL_PROVISION_SECRET" };
  }
  if (process.env.JWT_SECRET) {
    return { secret: process.env.JWT_SECRET, source: "JWT_SECRET" };
  }
  return { secret: "fw-dev-secret", source: "fallback" };
}

function signProvisioningJWT(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: ACTIVATION_TOKEN_ALGORITHM, typ: "JWT" };
  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signingInput = `${headerB64}.${payloadB64}`;
  const signature = createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${signature}`;
}

/**
 * Generate a signed activation token for terminal auto-login.
 * Format: JWT-like HMAC-SHA256 token with HS256 header.
 */
function generateActivationToken(tradingAccountId: string, email: string): string {
  const now = Date.now();
  const payload = {
    accountId: tradingAccountId,
    email,
    iat: Math.floor(now / 1000),
    exp: Math.floor((now + 7 * 24 * 60 * 60 * 1000) / 1000),
  };
  const { secret, source } = getProvisioningTokenSecret();
  console.info("[Provisioning] signing activation token", {
    secretSource: source,
    algorithm: ACTIVATION_TOKEN_ALGORITHM,
    payload,
  });
  return signProvisioningJWT(payload, secret);
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
  // order_id is nullable — emergency provisions have no real order row.
  // Must pass explicit SQL NULL (not empty string) to avoid FK constraint violation.
  const cleanOrderId = (typeof orderId === "string" && orderId.trim().length > 0)
    ? orderId.trim()
    : null;

  const provResult = await db.execute(
    cleanOrderId
      ? sql`
          INSERT INTO provisioning_logs
            (order_id, plan, payment_method, payment_ref, source, status, started_at, created_at)
          VALUES
            (${cleanOrderId}, ${planType}, ${paymentMethod}, ${paymentRef},
             ${source}, 'processing', now(), now())
          RETURNING id
        `
      : sql`
          INSERT INTO provisioning_logs
            (plan, payment_method, payment_ref, source, status, started_at, created_at)
          VALUES
            (${planType}, ${paymentMethod}, ${paymentRef},
             ${source}, 'processing', now(), now())
          RETURNING id
        `
  );
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
    SELECT id, first_name, last_name, email FROM users WHERE id = ${userId} LIMIT 1
  `);
  const user = (userResult.rows as any[])[0];
  if (!user) throw new Error(`User ${userId} not found during provisioning`);

  // ── 4. Risk settings directly from product catalog — NO hardcoding ─────────
  // getProvisioningRules reads PRODUCTS[planType].rules exactly as defined.
  // Flash → profitTargetPct:0, dailyLossLimitPct:2, maxDrawdownPct:4
  // Instant → profitTargetPct:0, dailyLossLimitPct:3, maxDrawdownPct:5
  // 1-Step → profitTargetPct:10, dailyLossLimitPct:3, maxDrawdownPct:6
  // 2-Step → profitTargetPct:8, dailyLossLimitPct:3, maxDrawdownPct:8
  const rules = getProvisioningRules(planType);
  const initialBalance = accountSize;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + rules.maxDaysAllowed);

  const accountCode = generateAccountCode();

  // ── 5. Generate terminal credentials ───────────────────────────────────────
  // terminalEmail = user's email (same as dashboard login)
  // terminalPassword = strong random password generated fresh each provision
  // activationToken = signed JWT-like token for auto-login from dashboard
  const terminalEmail = user.email as string;
  const terminalPassword = generateTerminalPassword();
  // activationToken is generated after tradingAccountId is known (step 7)

  // ── 6. Get or create terminal_traders ──────────────────────────────────────
  // Look up by external_id first, then fall back to email — handles cases where
  // a prior provision used a different external_id (e.g. old Clerk ID) for this user.
  let existingTrader = await db.execute(sql`
    SELECT id FROM terminal_traders WHERE external_id = ${String(userId)} LIMIT 1
  `);

  // Fallback: find by email and re-link external_id to the current users.id
  if (!existingTrader.rows || existingTrader.rows.length === 0) {
    const traderByEmail = await db.execute(sql`
      SELECT id, external_id FROM terminal_traders WHERE email = ${user.email} LIMIT 1
    `);
    if (traderByEmail.rows && traderByEmail.rows.length > 0) {
      const row = traderByEmail.rows[0] as any;
      // Only update if external_id is different — avoids unique constraint violation
      if (row.external_id !== String(userId)) {
        await db.execute(sql`
          UPDATE terminal_traders SET external_id = ${String(userId)}, updated_at = now()
          WHERE id = ${row.id}::uuid
        `).catch(() => { /* concurrent update — re-read below */ });
      }
      // Re-read after potential update
      existingTrader = await db.execute(sql`
        SELECT id FROM terminal_traders WHERE external_id = ${String(userId)} LIMIT 1
      `);
    }
  }

  let traderId: string;
  if (existingTrader.rows && existingTrader.rows.length > 0) {
    traderId = (existingTrader.rows[0] as any).id;
  } else {
    const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Trader";
    const traderInsert = await db.execute(sql`
      INSERT INTO terminal_traders (external_id, email, display_name, plan, status, created_at, updated_at)
      VALUES (${String(userId)}, ${user.email}, ${displayName}, ${planType}, 'active', now(), now())
      ON CONFLICT (external_id) DO UPDATE SET email = EXCLUDED.email, updated_at = now()
      RETURNING id
    `);
    traderId = (traderInsert.rows[0] as any).id;
  }

  // ── 7. Create challenge_accounts ──────────────────────────────────────────
  // type CHECK constraint: evaluation_phase1 | evaluation_phase2 | funded
  // Flash & Instant are funded immediately. 1-Step & 2-Step are evaluation.
  const challengeType =
    planType === "instant" || planType === "flash" ? "funded" : "evaluation_phase1";

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

  // ── 8. Create trading_accounts ──────────────────────────────────────────────
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

  // ── 9. Generate activation token now that we have tradingAccountId ──────────
  const activationToken = generateActivationToken(tradingAccountId, terminalEmail);

  // ── 10. Update provisioning_logs → completed ────────────────────────────────
  await db.execute(sql`
    UPDATE provisioning_logs
    SET status                = 'completed',
        trader_id             = ${traderId}::uuid,
        challenge_account_id  = ${challengeAccountId}::uuid,
        trading_account_id    = ${tradingAccountId}::uuid,
        completed_at          = now()
    WHERE id = ${provId}::uuid
  `);

  // ── 11. Confirm order + store ALL credentials in metadata ───────────────────
  // loginEmail, accountCode, terminalPassword, activationToken all stored here.
  // Dashboard reads these from orders.metadata via GET /api/accounts/my.
  // Admin reads them from the same source via provisioning result.
  if (orderId) {
    let existingMeta: Record<string, unknown> = {};
    try {
      const [ord] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
      if (ord?.metadata) existingMeta = JSON.parse(ord.metadata as string);
    } catch { /* ignore */ }

    const updatedMeta = JSON.stringify({
      ...existingMeta,
      loginEmail: terminalEmail,
      accountCode,
      terminalPassword,
      activationToken,
      // Keep legacy tempPassword field for compatibility
      tempPassword: tempPassword ?? terminalPassword,
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
    `rules={profitTarget:${rules.profitTargetPct}%,dailyDD:${rules.dailyLossLimitPct}%,maxDD:${rules.maxDrawdownPct}%} ` +
    `accountCode=${accountCode} traderId=${traderId} challengeId=${challengeAccountId} tradingId=${tradingAccountId}`,
  );

  return {
    provisioningLogId: provId,
    traderId,
    challengeAccountId,
    tradingAccountId,
    accountCode,
    accountSize: initialBalance,
    terminalEmail,
    terminalPassword,
    activationToken,
  };
}
