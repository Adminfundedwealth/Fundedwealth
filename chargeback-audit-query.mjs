/**
 * CHARGEBACK AUDIT SCRIPT — READ ONLY
 * Razorpay Order: order_TMyxqgwah84K4
 * Razorpay Payment: pay_TMz0GdVF5y3AKb
 * Challenge ID: FW-CHALLENGE-1786128087833
 * Amount: ₹9,899
 *
 * NO WRITES. ALL QUERIES ARE SELECT ONLY.
 */

import pg from 'pg';
const { Pool } = pg;

const DB_URLS = [
  "postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabase%402026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  "postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabase%402026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
];

const PAYMENT_ID = 'pay_TMz0GdVF5y3AKb';
const RAZORPAY_ORDER_ID = 'order_TMyxqgwah84K4';
const CHALLENGE_ID_STR = 'FW-CHALLENGE-1786128087833';
const AMOUNT = 9899;

let pool;

async function connect() {
  for (const url of DB_URLS) {
    try {
      const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 8000 });
      await p.query('SELECT 1');
      console.log('✅ Connected to DB');
      pool = p;
      return;
    } catch (e) {
      console.log(`  ↳ Failed: ${e.message.split('\n')[0]}`);
    }
  }
  throw new Error('Could not connect to any DB URL');
}

async function q(label, sql, params = []) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`🔍 ${label}`);
  console.log(`${'─'.repeat(70)}`);
  try {
    const result = await pool.query(sql, params);
    if (result.rows.length === 0) {
      console.log('  (no rows returned)');
    } else {
      result.rows.forEach((row, i) => {
        console.log(`  Row ${i + 1}:`);
        for (const [k, v] of Object.entries(row)) {
          const val = v === null ? 'NULL' : (typeof v === 'object' && !(v instanceof Date) ? JSON.stringify(v) : String(v));
          console.log(`    ${k.padEnd(35)} = ${val}`);
        }
      });
    }
    return result.rows;
  } catch (e) {
    console.log(`  ❌ QUERY ERROR: ${e.message}`);
    return [];
  }
}

async function run() {
  console.log('='.repeat(70));
  console.log('FUNDEDWEALTH CHARGEBACK AUDIT — READ ONLY');
  console.log(`Razorpay Order ID : ${RAZORPAY_ORDER_ID}`);
  console.log(`Razorpay Payment ID: ${PAYMENT_ID}`);
  console.log(`Challenge ID String: ${CHALLENGE_ID_STR}`);
  console.log(`Amount             : ₹${AMOUNT}`);
  console.log(`Audit Run Time     : ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  await connect();

  // ── SECTION 0: Schema Introspection ─────────────────────────────────────
  await q('LIST ALL PUBLIC TABLES', `
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  await q('COLUMNS: orders table', `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders'
    ORDER BY ordinal_position
  `);

  await q('COLUMNS: trading_accounts table', `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'trading_accounts'
    ORDER BY ordinal_position
  `);

  await q('COLUMNS: provisioning_logs table', `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'provisioning_logs'
    ORDER BY ordinal_position
  `);

  // ── SECTION 1: PHASE 1 — Customer Identity ───────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 1 — CUSTOMER IDENTITY MAPPING');
  console.log('='.repeat(70));

  // 1a. Search orders by Razorpay Payment ID (stored as utr_reference)
  const ordersByPaymentId = await q('ORDER by Razorpay Payment ID (utr_reference)', `
    SELECT id, user_id, amount, account_size, plan_type, payment_type, status, 
           payment_method, utr_reference, metadata, created_at, updated_at
    FROM orders 
    WHERE utr_reference = $1
  `, [PAYMENT_ID]);

  // 1b. Search orders by Razorpay Order ID (may be in metadata)
  await q('ORDER by Razorpay Order ID in metadata', `
    SELECT id, user_id, amount, account_size, plan_type, payment_type, status, 
           payment_method, utr_reference, metadata, created_at, updated_at
    FROM orders 
    WHERE metadata::text LIKE $1
  `, [`%${RAZORPAY_ORDER_ID}%`]);

  // 1c. Search orders by Challenge ID string
  await q('ORDER by Challenge ID string in metadata', `
    SELECT id, user_id, amount, account_size, plan_type, payment_type, status, 
           payment_method, utr_reference, metadata, created_at, updated_at
    FROM orders 
    WHERE metadata::text LIKE $1
  `, [`%${CHALLENGE_ID_STR}%`]);

  // 1d. Search orders near the amount ₹9,899 (within ₹1)
  await q('ORDERS near ₹9899 with razorpay payment method', `
    SELECT id, user_id, amount, account_size, plan_type, payment_type, status, 
           payment_method, utr_reference, metadata, created_at, updated_at
    FROM orders 
    WHERE payment_method = 'razorpay'
      AND amount BETWEEN 9898 AND 9900
    ORDER BY created_at DESC
    LIMIT 20
  `);

  // Extract user_id if we got an order match
  let targetUserId = null;
  let targetOrderId = null;
  if (ordersByPaymentId.length > 0) {
    targetUserId = ordersByPaymentId[0].user_id;
    targetOrderId = ordersByPaymentId[0].id;
    console.log(`\n✅ FOUND ORDER via Payment ID: order_id=${targetOrderId}, user_id=${targetUserId}`);
  }

  // 1e. Get user record
  if (targetUserId) {
    await q(`USER RECORD for user_id=${targetUserId}`, `
      SELECT id, clerk_id, email, first_name, last_name, phone, city, state, 
             country, role, affiliate_code, referred_by, kyc_status, is_active,
             account_status, risk_score, risk_level, onboarding_completed,
             experience_points, current_level, created_at, updated_at
      FROM users 
      WHERE id = $1
    `, [targetUserId]);
  }

  // 1f. Also search by amount across all payment methods to catch any edge cases
  await q('ALL ORDERS ₹9899 (any payment method)', `
    SELECT id, user_id, amount, plan_type, payment_type, status, payment_method, 
           utr_reference, created_at
    FROM orders 
    WHERE amount BETWEEN 9898 AND 9900
    ORDER BY created_at DESC
    LIMIT 20
  `);

  // ── SECTION 2: PHASE 2 — Order + Purchase Fulfillment ───────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 2 — ORDER + PURCHASE FULFILLMENT');
  console.log('='.repeat(70));

  if (targetOrderId) {
    await q(`PROVISIONING LOGS for order_id=${targetOrderId}`, `
      SELECT id, order_id, plan, payment_method, payment_ref, source, status, 
             error_message, trader_id, challenge_account_id, trading_account_id,
             started_at, completed_at, created_at
      FROM provisioning_logs 
      WHERE order_id = $1
      ORDER BY created_at ASC
    `, [targetOrderId]);
  }

  // Search provisioning logs by payment ref (payment ID)
  await q(`PROVISIONING LOGS by payment_ref=${PAYMENT_ID}`, `
    SELECT id, order_id, plan, payment_method, payment_ref, source, status, 
           error_message, trader_id, challenge_account_id, trading_account_id,
           started_at, completed_at, created_at
    FROM provisioning_logs 
    WHERE payment_ref = $1
    ORDER BY created_at ASC
  `, [PAYMENT_ID]);

  // Search provisioning logs by challenge account ID string (partial match)
  await q(`PROVISIONING LOGS containing challenge ID string`, `
    SELECT id, order_id, plan, payment_method, payment_ref, source, status, 
           error_message, trader_id, challenge_account_id, trading_account_id,
           started_at, completed_at, created_at
    FROM provisioning_logs 
    WHERE payment_ref LIKE $1 
       OR order_id LIKE $1
    ORDER BY created_at ASC
  `, [`%1786128087833%`]);

  // All provisioning logs near purchase time (if we know the order time)
  if (ordersByPaymentId.length > 0) {
    const orderTime = ordersByPaymentId[0].created_at;
    await q(`PROVISIONING LOGS ±2 hours of order creation (${orderTime})`, `
      SELECT id, order_id, plan, payment_method, payment_ref, source, status, 
             error_message, trader_id, challenge_account_id, trading_account_id,
             started_at, completed_at, created_at
      FROM provisioning_logs 
      WHERE created_at BETWEEN $1::timestamptz - interval '2 hours'
                           AND $1::timestamptz + interval '2 hours'
      ORDER BY created_at ASC
    `, [orderTime]);
  }

  // ── SECTION 3: PHASE 2 — Trading Account ────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 2 (cont) — TRADING ACCOUNT PROVISIONING');
  console.log('='.repeat(70));

  if (targetOrderId) {
    await q(`TRADING ACCOUNT for order_id=${targetOrderId}`, `
      SELECT id, account_code, user_id, order_id, plan, phase, status,
             virtual_balance, profit_target, max_drawdown, daily_loss_limit,
             total_pnl, daily_drawdown, profit_split, trading_days, scaling_level,
             fee_paid, coupon_used, is_funded, funded_at, expires_at,
             created_at, updated_at
      FROM trading_accounts 
      WHERE order_id = $1
    `, [targetOrderId]);
  }

  if (targetUserId) {
    await q(`ALL TRADING ACCOUNTS for user_id=${targetUserId}`, `
      SELECT id, account_code, user_id, order_id, plan, phase, status,
             virtual_balance, profit_target, max_drawdown, daily_loss_limit,
             total_pnl, daily_drawdown, trading_days,
             fee_paid, coupon_used, is_funded, created_at, updated_at
      FROM trading_accounts 
      WHERE user_id = $1
      ORDER BY created_at DESC
    `, [targetUserId]);
  }

  // ── SECTION 4: PHASE 2 — Notifications / Email Delivery ─────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 2 (cont) — NOTIFICATION / EMAIL DELIVERY');
  console.log('='.repeat(70));

  if (targetUserId) {
    await q(`NOTIFICATIONS for user_id=${targetUserId}`, `
      SELECT id, user_id, type, title, message, category, priority, 
             delivery_channels, is_read, created_at
      FROM notifications
      WHERE user_id = $1::uuid
      ORDER BY created_at DESC
      LIMIT 50
    `, [targetUserId]);
  }

  // ── SECTION 5: PHASE 2 — Webhook Logs ───────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 2 (cont) — WEBHOOK LOGS');
  console.log('='.repeat(70));

  await q(`WEBHOOK LOGS for Payment ID ${PAYMENT_ID}`, `
    SELECT id, provider, event_type, webhook_id, idempotency_key, 
           is_signature_valid, payload, user_id, status, processed_at,
           error_message, retry_count, created_at
    FROM webhook_logs 
    WHERE payload::text LIKE $1
       OR idempotency_key LIKE $1
       OR webhook_id LIKE $1
    ORDER BY created_at ASC
  `, [`%${PAYMENT_ID}%`]);

  await q(`WEBHOOK LOGS for Razorpay Order ID ${RAZORPAY_ORDER_ID}`, `
    SELECT id, provider, event_type, webhook_id, idempotency_key, 
           is_signature_valid, payload, user_id, status, processed_at,
           error_message, retry_count, created_at
    FROM webhook_logs 
    WHERE payload::text LIKE $1
       OR idempotency_key LIKE $1
    ORDER BY created_at ASC
  `, [`%${RAZORPAY_ORDER_ID}%`]);

  // All Razorpay webhooks around the purchase time window
  if (ordersByPaymentId.length > 0) {
    const orderTime = ordersByPaymentId[0].created_at;
    await q(`WEBHOOK LOGS ±6 hours of purchase (razorpay)`, `
      SELECT id, provider, event_type, webhook_id, idempotency_key, 
             is_signature_valid, status, processed_at, error_message, 
             retry_count, created_at
      FROM webhook_logs 
      WHERE provider = 'razorpay'
        AND created_at BETWEEN $1::timestamptz - interval '6 hours'
                            AND $1::timestamptz + interval '6 hours'
      ORDER BY created_at ASC
    `, [orderTime]);
  }

  // ── SECTION 6: PHASE 3 — Access / Digital Service Delivery ──────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 3 — ACCESS / DIGITAL SERVICE DELIVERY');
  console.log('='.repeat(70));

  if (targetUserId) {
    await q(`LOGIN HISTORY for user_id=${targetUserId}`, `
      SELECT id, user_id, email, auth_method, ip_address, country, 
             user_agent, browser, os, success, failure_reason,
             mfa_required, mfa_verified, created_at
      FROM login_history 
      WHERE user_id = $1::uuid
      ORDER BY created_at ASC
    `, [targetUserId]);

    await q(`SESSIONS for user_id=${targetUserId}`, `
      SELECT id, user_id, ip_address, country, browser, os, device_name,
             is_active, is_trusted, created_at, last_activity_at, expires_at, revoked_at
      FROM sessions 
      WHERE user_id = $1::uuid
      ORDER BY created_at ASC
    `, [targetUserId]);

    await q(`SESSION ANALYTICS for user_id=${targetUserId}`, `
      SELECT id, user_id, session_id, start_at, end_at, trades, win_rate,
             loss_rate, avg_rr, best_trade_pnl, worst_trade_pnl, created_at
      FROM session_analytics
      WHERE user_id = $1
      ORDER BY start_at ASC
    `, [targetUserId]);
  }

  // ── SECTION 7: Terminal Tables ────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 3 (cont) — TERMINAL TABLES (challenge_accounts, traders)');
  console.log('='.repeat(70));

  // Check if challenge_accounts table exists (terminal-owned)
  await q('CHECK: challenge_accounts table exists', `
    SELECT table_name, table_schema
    FROM information_schema.tables
    WHERE table_name IN ('challenge_accounts', 'terminal_traders', 'traders', 
                         'risk_rules', 'orders_terminal', 'terminal_orders',
                         'positions', 'trades', 'order_history')
    ORDER BY table_name
  `);

  // Try to query challenge_accounts
  await q('challenge_accounts — all records (schema check)', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'challenge_accounts'
    ORDER BY ordinal_position
    LIMIT 50
  `);

  await q('terminal_traders — schema check', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'terminal_traders'
    ORDER BY ordinal_position
    LIMIT 50
  `);

  await q('traders — schema check', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'traders'
    ORDER BY ordinal_position
    LIMIT 50
  `);

  // Query challenge_accounts if it exists
  if (targetOrderId) {
    await q(`challenge_accounts linked to order_id=${targetOrderId}`, `
      SELECT * FROM challenge_accounts
      WHERE order_id = $1
         OR id IN (
           SELECT challenge_account_id FROM provisioning_logs WHERE order_id = $1
         )
    `, [targetOrderId]).catch(() => console.log('  (table may not exist in this schema)'));
  }

  if (targetUserId) {
    await q(`challenge_accounts for user_id=${targetUserId}`, `
      SELECT * FROM challenge_accounts
      WHERE user_id = $1
         OR trader_id IN (
           SELECT id FROM terminal_traders WHERE user_id = $1::uuid
         )
      ORDER BY created_at DESC
      LIMIT 20
    `, [targetUserId]).catch(() => console.log('  (table may not exist in this schema)'));
  }

  // Search by challenge ID string in all tables
  await q(`challenge_accounts: search by account_code containing 1786128087833`, `
    SELECT * FROM challenge_accounts
    WHERE account_code LIKE $1
       OR id::text LIKE $1
    LIMIT 10
  `, [`%1786128087833%`]).catch(() => console.log('  (table not accessible)'));

  // ── SECTION 8: PHASE 4 — Trading Audit ──────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 4 — COMPLETE TRADING AUDIT');
  console.log('='.repeat(70));

  // Check trade journal
  if (targetUserId) {
    await q(`TRADE JOURNAL for user_id=${targetUserId}`, `
      SELECT id, user_id, account_id, symbol, trade_type, entry_price, exit_price,
             pnl, lot_size, risk, notes, created_at, updated_at
      FROM trade_journal
      WHERE user_id = $1::uuid
      ORDER BY created_at ASC
    `, [targetUserId]);
  }

  // Check trades table if it exists
  await q('trades — schema check', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'trades'
    ORDER BY ordinal_position
    LIMIT 50
  `);

  await q('positions — schema check', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'positions'
    ORDER BY ordinal_position
    LIMIT 50
  `);

  await q('order_history — schema check', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'order_history'
    ORDER BY ordinal_position
    LIMIT 50
  `);

  // ── SECTION 9: PHASE 5 — Risk Rules ──────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 5 — RULE / BREACH AUDIT');
  console.log('='.repeat(70));

  await q('risk_rules — schema check', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'risk_rules'
    ORDER BY ordinal_position
    LIMIT 50
  `);

  await q('risk_violations — schema check', `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('risk_violations', 'rule_violations', 'breaches', 'violations')
    ORDER BY table_name, ordinal_position
    LIMIT 50
  `);

  // ── SECTION 10: PHASE 7 — Support / Communication ───────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 7 — SUPPORT / CUSTOMER COMMUNICATION');
  console.log('='.repeat(70));

  if (targetUserId) {
    await q(`SUPPORT TICKETS for user_id=${targetUserId}`, `
      SELECT t.id, t.external_id, t.user_id, t.subject, t.body, 
             t.status, t.assigned_to, t.created_at, t.updated_at
      FROM support_tickets t
      WHERE t.user_id = $1::uuid
      ORDER BY t.created_at ASC
    `, [targetUserId]);

    await q(`SUPPORT MESSAGES for tickets of user_id=${targetUserId}`, `
      SELECT m.id, m.ticket_id, m.author_name, m.body, m.is_internal, m.created_at
      FROM support_messages m
      WHERE m.ticket_id IN (
        SELECT id FROM support_tickets WHERE user_id = $1::uuid
      )
      ORDER BY m.created_at ASC
    `, [targetUserId]);
  }

  // Search support tickets containing payment/order ID
  await q(`SUPPORT TICKETS containing payment ID`, `
    SELECT t.id, t.user_id, t.subject, t.body, t.status, t.created_at
    FROM support_tickets t
    WHERE t.body LIKE $1 OR t.subject LIKE $1
    ORDER BY t.created_at ASC
  `, [`%${PAYMENT_ID}%`]);

  await q(`SUPPORT TICKETS containing razorpay order ID`, `
    SELECT t.id, t.user_id, t.subject, t.body, t.status, t.created_at
    FROM support_tickets t
    WHERE t.body LIKE $1 OR t.subject LIKE $1
    ORDER BY t.created_at ASC
  `, [`%${RAZORPAY_ORDER_ID}%`]);

  // Contact submissions
  await q(`CONTACT SUBMISSIONS (all recent)`, `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'contact_submissions'
    ORDER BY ordinal_position
  `);

  if (targetUserId) {
    await q(`CONTACT SUBMISSIONS for user or related email`, `
      SELECT *
      FROM contact_submissions
      WHERE user_id::text = $1
         OR email IN (SELECT email FROM users WHERE id = $1::uuid)
      ORDER BY created_at DESC
      LIMIT 20
    `, [targetUserId]).catch(() => console.log('  (contact_submissions not accessible)'));
  }

  // ── SECTION 11: PHASE 8 — Payment / Refund Audit ────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 8 — PAYMENT / REFUND AUDIT');
  console.log('='.repeat(70));

  await q(`PAYMENT FAILURES for payment_id=${PAYMENT_ID}`, `
    SELECT id, payment_id, user_id, payment_method, provider, status,
           failure_reason, amount, currency, metadata, created_at
    FROM payment_failures
    WHERE payment_id = $1
       OR payment_id LIKE $2
  `, [PAYMENT_ID, `%${PAYMENT_ID}%`]);

  if (targetUserId) {
    await q(`ALL PAYMENT FAILURES for user_id=${targetUserId}`, `
      SELECT id, payment_id, user_id, payment_method, provider, status,
             failure_reason, amount, currency, created_at
      FROM payment_failures
      WHERE user_id = $1::uuid
      ORDER BY created_at DESC
    `, [targetUserId]);
  }

  await q(`MANUAL PAYMENTS related`, `
    SELECT id, order_id, user_id, payment_method, amount, utr, status,
           rejection_reason, created_at
    FROM manual_payments
    WHERE utr = $1 OR order_id = $2
  `, [PAYMENT_ID, targetOrderId || 'N/A']);

  // ── SECTION 12: PHASE 9 — Technical Failure Audit ───────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 9 — TECHNICAL FAILURE AUDIT');
  console.log('='.repeat(70));

  // System errors around purchase time
  if (ordersByPaymentId.length > 0) {
    const orderTime = ordersByPaymentId[0].created_at;
    await q(`SYSTEM ERRORS ±6 hours of purchase`, `
      SELECT id, error_type, message, stack_trace, endpoint, user_id, created_at
      FROM system_errors
      WHERE created_at BETWEEN $1::timestamptz - interval '6 hours'
                           AND $1::timestamptz + interval '6 hours'
      ORDER BY created_at ASC
      LIMIT 50
    `, [orderTime]);
  } else {
    await q(`SYSTEM ERRORS — system_errors schema`, `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'system_errors'
      ORDER BY ordinal_position
    `);
  }

  // API logs around purchase time
  await q(`API LOGS schema check`, `
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name IN ('api_logs', 'api_request_logs', 'request_logs')
    ORDER BY table_name, ordinal_position
    LIMIT 50
  `);

  if (targetUserId && ordersByPaymentId.length > 0) {
    const orderTime = ordersByPaymentId[0].created_at;
    await q(`API LOGS for user ±2 hours of purchase`, `
      SELECT id, user_id, method, path, status_code, duration_ms, ip_address, created_at
      FROM api_logs
      WHERE (user_id = $1 OR user_id = $2::text)
        AND created_at BETWEEN $3::timestamptz - interval '2 hours'
                           AND $3::timestamptz + interval '2 hours'
      ORDER BY created_at ASC
      LIMIT 100
    `, [targetUserId, targetUserId, orderTime]).catch(() => console.log('  (api_logs not accessible or schema differs)'));
  }

  // Admin events
  if (targetOrderId) {
    await q(`ADMIN EVENTS for order_id=${targetOrderId}`, `
      SELECT id, event_type, order_id, user_id, amount, payment_method, 
             metadata, is_read, created_at
      FROM admin_events
      WHERE order_id = $1
      ORDER BY created_at ASC
    `, [targetOrderId]);
  }

  if (targetUserId) {
    await q(`ADMIN EVENTS for user_id=${targetUserId}`, `
      SELECT id, event_type, order_id, user_id, amount, payment_method, 
             metadata, is_read, created_at
      FROM admin_events
      WHERE user_id = $1::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `, [targetUserId]);
  }

  // Fraud events
  if (targetUserId) {
    await q(`FRAUD EVENTS for user_id=${targetUserId}`, `
      SELECT id, user_id, event_type, severity, description, metadata, created_at
      FROM fraud_events
      WHERE user_id = $1::uuid
      ORDER BY created_at DESC
      LIMIT 20
    `, [targetUserId]);
  }

  // Audit logs
  if (targetOrderId) {
    await q(`AUDIT LOGS for order`, `
      SELECT id, admin_id, action, entity, entity_id, details, created_at
      FROM audit_logs
      WHERE entity_id = $1
         OR details::text LIKE $2
      ORDER BY created_at ASC
      LIMIT 50
    `, [targetOrderId, `%${PAYMENT_ID}%`]);
  }

  // Provisioning failures (failed status)
  await q(`PROVISIONING FAILURES (status=failed)`, `
    SELECT id, order_id, plan, payment_method, payment_ref, status, error_message,
           started_at, completed_at, created_at
    FROM provisioning_logs
    WHERE status = 'failed'
    ORDER BY created_at DESC
    LIMIT 20
  `);

  // ── SECTION 13: All provisioning logs for completeness ──────────────────
  console.log('\n' + '='.repeat(70));
  console.log('PHASE 9 (cont) — ALL PROVISIONING LOGS (recent 30 records)');
  console.log('='.repeat(70));

  await q(`ALL RECENT PROVISIONING LOGS (last 30)`, `
    SELECT id, order_id, plan, payment_method, payment_ref, source, status, 
           error_message, trader_id, challenge_account_id, trading_account_id,
           started_at, completed_at, created_at
    FROM provisioning_logs
    ORDER BY created_at DESC
    LIMIT 30
  `);

  // ── SECTION 14: KYC Status ───────────────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('KYC / IDENTITY VERIFICATION');
  console.log('='.repeat(70));

  if (targetUserId) {
    await q(`KYC PROFILES for user_id=${targetUserId}`, `
      SELECT id, user_id, status, verified_at, created_at
      FROM kyc_profiles
      WHERE user_id = $1::uuid
      ORDER BY created_at DESC
    `, [targetUserId]).catch(() => console.log('  (kyc_profiles not accessible)'));

    await q(`KYC SUBMISSIONS for user_id=${targetUserId}`, `
      SELECT id, user_id, status, created_at
      FROM kyc_submissions
      WHERE user_id = $1::uuid
      ORDER BY created_at DESC
    `, [targetUserId]).catch(() => console.log('  (kyc_submissions not accessible)'));
  }

  // ── SECTION 15: Affiliate / Referral ─────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('AFFILIATE / REFERRAL');
  console.log('='.repeat(70));

  if (targetUserId) {
    await q(`AFFILIATE DATA for user_id=${targetUserId}`, `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'affiliates'
      LIMIT 20
    `);
  }

  // ── SECTION 16: Full user profile reprise ────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('SUMMARY — ALL ORDERS for identified user');
  console.log('='.repeat(70));

  if (targetUserId) {
    await q(`ALL ORDERS for user_id=${targetUserId}`, `
      SELECT id, user_id, amount, account_size, plan_type, payment_type, 
             status, payment_method, utr_reference, metadata, created_at, updated_at
      FROM orders
      WHERE user_id = $1
      ORDER BY created_at ASC
    `, [targetUserId]);
  }

  // ── FINAL: count rows in key tables ──────────────────────────────────────
  console.log('\n' + '='.repeat(70));
  console.log('TABLE ROW COUNTS (for context)');
  console.log('='.repeat(70));

  await q('ROW COUNTS', `
    SELECT 
      (SELECT COUNT(*) FROM orders) as orders_total,
      (SELECT COUNT(*) FROM users) as users_total,
      (SELECT COUNT(*) FROM trading_accounts) as trading_accounts_total,
      (SELECT COUNT(*) FROM provisioning_logs) as provisioning_logs_total,
      (SELECT COUNT(*) FROM webhook_logs) as webhook_logs_total,
      (SELECT COUNT(*) FROM support_tickets) as support_tickets_total,
      (SELECT COUNT(*) FROM login_history) as login_history_total,
      (SELECT COUNT(*) FROM sessions) as sessions_total,
      (SELECT COUNT(*) FROM notifications) as notifications_total
  `);

  console.log('\n' + '='.repeat(70));
  console.log('AUDIT COMPLETE — ALL QUERIES READ-ONLY — NO DATA MODIFIED');
  console.log(`Completed at: ${new Date().toISOString()}`);
  console.log('='.repeat(70));

  await pool.end();
}

run().catch(async (err) => {
  console.error('FATAL ERROR:', err.message);
  if (pool) await pool.end().catch(() => {});
  process.exit(1);
});
