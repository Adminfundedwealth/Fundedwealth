/**
 * CHARGEBACK AUDIT SCRIPT — READ ONLY — NO WRITES
 * Razorpay Order ID : order_TMyxqgwah84K4
 * Razorpay Payment ID: pay_TMz0GdVF5y3AKb
 * Challenge ID String: FW-CHALLENGE-1786128087833
 * Amount             : Rs.9,899
 *
 * ALL QUERIES ARE SELECT ONLY. ZERO WRITES.
 */
'use strict';

const { Pool } = require('pg');

const DB_URLS = [
  "postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabase%402026@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  "postgresql://postgres.nysrxvpjdlvzvcawysvh:Supabase%402026@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
  "postgresql://postgres:Supabase%402026@db.nysrxvpjdlvzvcawysvh.supabase.co:5432/postgres",
];

const PAYMENT_ID        = 'pay_TMz0GdVF5y3AKb';
const RAZORPAY_ORDER_ID = 'order_TMyxqgwah84K4';
const CHALLENGE_NUM     = '1786128087833';
const CHALLENGE_ID_STR  = 'FW-CHALLENGE-1786128087833';
const AMOUNT            = 9899;

let pool;
const results = {};   // accumulate data for the final report

// ── helpers ──────────────────────────────────────────────────────────────────
function sep(title) {
  console.log('\n' + '═'.repeat(72));
  console.log('  ' + title);
  console.log('═'.repeat(72));
}

async function q(label, sql, params = []) {
  console.log(`\n── ${label}`);
  try {
    const r = await pool.query(sql, params);
    if (r.rows.length === 0) {
      console.log('   (no rows)');
    } else {
      r.rows.forEach((row, i) => {
        const lines = Object.entries(row).map(([k, v]) => {
          const val = v === null ? 'NULL'
            : v instanceof Date ? v.toISOString()
            : typeof v === 'object' ? JSON.stringify(v).substring(0, 300)
            : String(v).substring(0, 300);
          return `    ${k.padEnd(36)} = ${val}`;
        });
        if (r.rows.length > 1) console.log(`  ── row ${i + 1} ──`);
        lines.forEach(l => console.log(l));
      });
    }
    return r.rows;
  } catch (e) {
    console.log(`   !! QUERY ERROR: ${e.message}`);
    return [];
  }
}

async function tableExists(name) {
  const r = await pool.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name=$1`,
    [name]
  );
  return r.rows.length > 0;
}

async function columns(name) {
  const r = await pool.query(
    `SELECT column_name FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1 ORDER BY ordinal_position`,
    [name]
  );
  return r.rows.map(x => x.column_name);
}

// ─────────────────────────────────────────────────────────────────────────────
async function connect() {
  for (const url of DB_URLS) {
    try {
      const p = new Pool({ connectionString: url, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });
      await p.query('SELECT 1');
      console.log('✅ DB connected');
      pool = p;
      return;
    } catch (e) {
      console.log(`  ✗ ${url.split('@')[1]?.split('/')[0]} — ${e.message.split('\n')[0]}`);
    }
  }
  throw new Error('All DB connection attempts failed');
}

// ─────────────────────────────────────────────────────────────────────────────
async function run() {
  console.log('═'.repeat(72));
  console.log('  FUNDEDWEALTH — CHARGEBACK AUDIT — READ ONLY');
  console.log(`  Payment ID : ${PAYMENT_ID}`);
  console.log(`  Order ID   : ${RAZORPAY_ORDER_ID}`);
  console.log(`  Challenge  : ${CHALLENGE_ID_STR}`);
  console.log(`  Amount     : Rs.${AMOUNT}`);
  console.log(`  Run time   : ${new Date().toISOString()}`);
  console.log('═'.repeat(72));

  await connect();

  // ── 0. Schema inventory ──────────────────────────────────────────────────
  sep('0 — PUBLIC TABLE INVENTORY');
  const tables = await q('All public tables', `
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' ORDER BY table_name
  `);
  const tableNames = new Set(tables.map(t => t.table_name));

  // ── 1. ORDERS ────────────────────────────────────────────────────────────
  sep('PHASE 1 — CUSTOMER IDENTITY: ORDERS');

  await q('orders columns', `
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='orders' ORDER BY ordinal_position
  `);

  const ordersByPayId = await q(`Order by utr_reference = Payment ID`, `
    SELECT * FROM orders WHERE utr_reference = $1
  `, [PAYMENT_ID]);
  results.ordersByPayId = ordersByPayId;

  await q(`Order metadata containing Razorpay Order ID`, `
    SELECT id, user_id, amount, plan_type, status, payment_method, utr_reference, metadata, created_at
    FROM orders WHERE metadata::text LIKE $1
  `, [`%${RAZORPAY_ORDER_ID}%`]);

  await q(`Order metadata containing challenge number`, `
    SELECT id, user_id, amount, plan_type, status, payment_method, utr_reference, metadata, created_at
    FROM orders WHERE metadata::text LIKE $1 OR utr_reference LIKE $1
  `, [`%${CHALLENGE_NUM}%`]);

  await q(`All razorpay orders near Rs.9899 (9898-9900)`, `
    SELECT id, user_id, amount, plan_type, payment_type, status, payment_method, utr_reference, created_at
    FROM orders
    WHERE payment_method='razorpay' AND amount BETWEEN 9898 AND 9900
    ORDER BY created_at DESC LIMIT 20
  `);

  // Determine target user_id and order_id
  let userId = null, orderId = null, orderRow = null;
  if (ordersByPayId.length > 0) {
    orderRow = ordersByPayId[0];
    userId   = orderRow.user_id;
    orderId  = orderRow.id;
    console.log(`\n  >>> MATCHED: orderId=${orderId}  userId=${userId}`);
  } else {
    console.log('\n  >>> No order matched payment ID directly — see additional searches above');
  }
  results.userId  = userId;
  results.orderId = orderId;

  // ── 2. USER RECORD ───────────────────────────────────────────────────────
  sep('PHASE 1 (cont) — USER RECORD');
  if (userId) {
    const userRows = await q(`users record for id=${userId}`, `
      SELECT id, clerk_id, email, first_name, last_name, phone, city, state, country,
             role, affiliate_code, referred_by, kyc_status, is_active, account_status,
             onboarding_completed, experience_points, current_level,
             created_at, updated_at
      FROM users WHERE id=$1
    `, [userId]);
    results.user = userRows[0] || null;
  }

  // ── 3. PROVISIONING LOGS ─────────────────────────────────────────────────
  sep('PHASE 2 — ORDER PROVISIONING CHAIN');

  await q('provisioning_logs columns', `
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='provisioning_logs' ORDER BY ordinal_position
  `);

  const cols_prov = await columns('provisioning_logs');
  const hasProvCols = (c) => cols_prov.includes(c);

  if (orderId) {
    const provByOrder = await q(`provisioning_logs for order_id=${orderId}`, `
      SELECT * FROM provisioning_logs WHERE order_id=$1 ORDER BY created_at ASC
    `, [orderId]);
    results.provisioning = provByOrder;
  }

  await q(`provisioning_logs by payment_ref=${PAYMENT_ID}`, `
    SELECT * FROM provisioning_logs WHERE payment_ref=$1 ORDER BY created_at ASC
  `, [PAYMENT_ID]);

  await q(`provisioning_logs containing challenge number in any field`, `
    SELECT * FROM provisioning_logs
    WHERE order_id::text LIKE $1
       OR payment_ref LIKE $1
       OR (challenge_account_id IS NOT NULL AND challenge_account_id::text LIKE $1)
    ORDER BY created_at ASC
  `, [`%${CHALLENGE_NUM}%`]);

  await q(`ALL provisioning_logs (last 50, desc)`, `
    SELECT id, order_id, plan, payment_method, payment_ref, source, status,
           error_message, challenge_account_id, trading_account_id, trader_id,
           started_at, completed_at, created_at
    FROM provisioning_logs ORDER BY created_at DESC LIMIT 50
  `);

  // ── 4. TRADING ACCOUNTS ──────────────────────────────────────────────────
  sep('PHASE 2 (cont) — TRADING ACCOUNTS');

  await q('trading_accounts columns', `
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='trading_accounts' ORDER BY ordinal_position
  `);

  if (orderId) {
    await q(`trading_accounts for order_id=${orderId}`, `
      SELECT * FROM trading_accounts WHERE order_id=$1
    `, [orderId]);
  }
  if (userId) {
    await q(`ALL trading_accounts for user_id=${userId}`, `
      SELECT id, account_code, user_id, order_id, challenge_id, plan, phase, status,
             virtual_balance, profit_target, max_drawdown, daily_loss_limit,
             total_pnl, daily_drawdown, trading_days, fee_paid, coupon_used,
             is_funded, funded_at, expires_at, created_at, updated_at
      FROM trading_accounts WHERE user_id=$1::uuid ORDER BY created_at DESC
    `, [userId]);
  }

  // ── 5. CHALLENGE ACCOUNTS (terminal table) ───────────────────────────────
  sep('PHASE 2 (cont) — CHALLENGE ACCOUNTS (terminal)');

  if (tableNames.has('challenge_accounts')) {
    await q('challenge_accounts columns', `
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='challenge_accounts' ORDER BY ordinal_position
    `);

    if (orderId) {
      await q(`challenge_accounts for order_id=${orderId}`, `
        SELECT * FROM challenge_accounts WHERE order_id=$1
      `, [orderId]);
    }

    await q(`challenge_accounts with id/code containing challenge number`, `
      SELECT * FROM challenge_accounts
      WHERE id::text LIKE $1 OR account_code LIKE $1
    `, [`%${CHALLENGE_NUM}%`]);

    if (userId) {
      await q(`challenge_accounts for user_id=${userId}`, `
        SELECT * FROM challenge_accounts WHERE user_id=$1::uuid ORDER BY created_at DESC LIMIT 20
      `, [userId]);
    }

    // via provisioning link
    if (orderId) {
      await q(`challenge_accounts via provisioning_logs.challenge_account_id`, `
        SELECT ca.* FROM challenge_accounts ca
        WHERE ca.id IN (
          SELECT challenge_account_id FROM provisioning_logs
          WHERE order_id=$1 AND challenge_account_id IS NOT NULL
        )
      `, [orderId]);
    }
  } else {
    console.log('\n   challenge_accounts table: NOT FOUND in schema');
  }

  // ── 6. RISK RULES ────────────────────────────────────────────────────────
  sep('PHASE 5 — RISK RULES FOR THIS ACCOUNT');

  if (tableNames.has('risk_rules')) {
    await q('risk_rules columns', `
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='risk_rules' ORDER BY ordinal_position
    `);

    if (userId) {
      // Get trading account IDs for this user
      const taIds = await pool.query(
        `SELECT id FROM trading_accounts WHERE user_id=$1::uuid`,
        [userId]
      );
      const ids = taIds.rows.map(r => r.id);
      if (ids.length > 0) {
        await q(`risk_rules for user's trading accounts`, `
          SELECT * FROM risk_rules
          WHERE trading_account_id = ANY($1::uuid[])
          ORDER BY trading_account_id, rule_type
        `, [ids]);
      }
    }

    // Risk violations
    if (tableNames.has('risk_violations')) {
      if (userId) {
        const taIds = await pool.query(
          `SELECT id FROM trading_accounts WHERE user_id=$1::uuid`,
          [userId]
        );
        const ids = taIds.rows.map(r => r.id);
        if (ids.length > 0) {
          await q(`risk_violations for user's trading accounts`, `
            SELECT * FROM risk_violations
            WHERE trading_account_id = ANY($1::uuid[])
            ORDER BY created_at ASC
          `, [ids]);
        }
      }
    } else {
      console.log('\n   risk_violations table: NOT FOUND');
    }
  } else {
    console.log('\n   risk_rules table: NOT FOUND in schema');
  }

  // ── 7. TRADE JOURNAL / TRADES ────────────────────────────────────────────
  sep('PHASE 4 — TRADING ACTIVITY AUDIT');

  if (tableNames.has('trade_journal')) {
    await q('trade_journal columns', `
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='trade_journal' ORDER BY ordinal_position
    `);
    if (userId) {
      await q(`trade_journal for user_id=${userId}`, `
        SELECT * FROM trade_journal WHERE user_id=$1::uuid ORDER BY created_at ASC
      `, [userId]);
    }
  }

  if (tableNames.has('trades')) {
    await q('trades columns', `
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='trades' ORDER BY ordinal_position
    `);
    if (userId) {
      await q(`trades for user`, `
        SELECT * FROM trades WHERE user_id=$1::uuid OR user_id=$1::text ORDER BY created_at ASC LIMIT 200
      `, [userId]).catch(async () => {
        // try without cast
        await q(`trades (no cast)`, `
          SELECT * FROM trades LIMIT 10
        `);
      });
    }
  }

  if (tableNames.has('positions')) {
    await q('positions columns', `
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='positions' ORDER BY ordinal_position
    `);
  }

  if (tableNames.has('order_history')) {
    await q('order_history columns', `
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='order_history' ORDER BY ordinal_position
    `);
  }

  // ── 8. ACCOUNT STATUS HISTORY ────────────────────────────────────────────
  sep('PHASE 6 — ACCOUNT STATUS HISTORY');

  if (tableNames.has('account_status_history')) {
    if (userId) {
      await q(`account_status_history for user`, `
        SELECT * FROM account_status_history WHERE user_id=$1::uuid ORDER BY created_at ASC
      `, [userId]);
    }
  } else {
    console.log('\n   account_status_history: NOT FOUND — checking audit_logs instead');
  }

  if (tableNames.has('audit_logs')) {
    await q('audit_logs columns', `
      SELECT column_name, data_type FROM information_schema.columns
      WHERE table_schema='public' AND table_name='audit_logs' ORDER BY ordinal_position
    `);

    if (orderId) {
      await q(`audit_logs for orderId`, `
        SELECT * FROM audit_logs WHERE entity_id=$1 ORDER BY created_at ASC
      `, [orderId]);
    }
    if (userId) {
      await q(`audit_logs for userId`, `
        SELECT * FROM audit_logs WHERE admin_id=$1::uuid ORDER BY created_at DESC LIMIT 30
      `, [userId]);
    }
    await q(`audit_logs mentioning payment ID`, `
      SELECT * FROM audit_logs WHERE details::text LIKE $1 ORDER BY created_at ASC
    `, [`%${PAYMENT_ID}%`]);
  }

  // ── 9. LOGIN / SESSION ───────────────────────────────────────────────────
  sep('PHASE 3 — LOGIN / SESSION ACCESS RECORDS');

  if (userId) {
    if (tableNames.has('login_history')) {
      await q(`login_history for user_id=${userId}`, `
        SELECT id, user_id, email, auth_method, ip_address, country,
               user_agent, browser, os, success, failure_reason,
               mfa_required, mfa_verified, created_at
        FROM login_history WHERE user_id=$1::uuid ORDER BY created_at ASC
      `, [userId]);
    }

    if (tableNames.has('sessions')) {
      await q(`sessions for user_id=${userId}`, `
        SELECT id, user_id, ip_address, country, browser, os, device_name,
               is_active, is_trusted, created_at, last_activity_at, expires_at, revoked_at
        FROM sessions WHERE user_id=$1::uuid ORDER BY created_at ASC
      `, [userId]);
    }

    if (tableNames.has('session_analytics')) {
      await q(`session_analytics for user_id=${userId}`, `
        SELECT * FROM session_analytics WHERE user_id=$1 ORDER BY start_at ASC
      `, [userId]);
    }
  }

  // ── 10. NOTIFICATIONS (email delivery evidence) ──────────────────────────
  sep('PHASE 2 (cont) — NOTIFICATION / EMAIL DELIVERY EVIDENCE');

  if (userId) {
    await q(`notifications for user_id=${userId}`, `
      SELECT id, user_id, type, title, message, category, priority,
             delivery_channels, is_read, created_at
      FROM notifications WHERE user_id=$1::uuid ORDER BY created_at ASC LIMIT 50
    `, [userId]);
  }

  // ── 11. WEBHOOK LOGS ─────────────────────────────────────────────────────
  sep('PHASE 9 — WEBHOOK LOGS');

  await q('webhook_logs columns', `
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='webhook_logs' ORDER BY ordinal_position
  `);

  await q(`webhook_logs containing Payment ID`, `
    SELECT id, provider, event_type, webhook_id, is_signature_valid,
           status, processed_at, error_message, retry_count, created_at,
           payload
    FROM webhook_logs WHERE payload::text LIKE $1 ORDER BY created_at ASC
  `, [`%${PAYMENT_ID}%`]);

  await q(`webhook_logs containing Razorpay Order ID`, `
    SELECT id, provider, event_type, webhook_id, is_signature_valid,
           status, processed_at, error_message, retry_count, created_at
    FROM webhook_logs WHERE payload::text LIKE $1 ORDER BY created_at ASC
  `, [`%${RAZORPAY_ORDER_ID}%`]);

  // Razorpay webhooks in purchase window
  if (orderRow) {
    await q(`Razorpay webhook_logs ±12h of order creation`, `
      SELECT id, provider, event_type, webhook_id, is_signature_valid,
             status, processed_at, error_message, retry_count, created_at
      FROM webhook_logs
      WHERE provider='razorpay'
        AND created_at BETWEEN $1::timestamptz - interval '12 hours'
                           AND $1::timestamptz + interval '12 hours'
      ORDER BY created_at ASC
    `, [orderRow.created_at]);
  }

  // ── 12. SUPPORT TICKETS ──────────────────────────────────────────────────
  sep('PHASE 7 — SUPPORT / CUSTOMER COMMUNICATION');

  await q('support_tickets columns', `
    SELECT column_name, data_type FROM information_schema.columns
    WHERE table_schema='public' AND table_name='support_tickets' ORDER BY ordinal_position
  `);

  if (userId) {
    await q(`support_tickets for user_id=${userId}`, `
      SELECT * FROM support_tickets WHERE user_id=$1::uuid ORDER BY created_at ASC
    `, [userId]);
  }

  // Search for tickets referencing this payment
  await q(`support_tickets mentioning payment ID`, `
    SELECT * FROM support_tickets
    WHERE body LIKE $1 OR subject LIKE $1 ORDER BY created_at ASC
  `, [`%${PAYMENT_ID}%`]);

  await q(`support_tickets mentioning razorpay order ID`, `
    SELECT * FROM support_tickets
    WHERE body LIKE $1 OR subject LIKE $1 ORDER BY created_at ASC
  `, [`%${RAZORPAY_ORDER_ID}%`]);

  if (tableNames.has('support_messages')) {
    if (userId) {
      await q(`support_messages in user's tickets`, `
        SELECT m.* FROM support_messages m
        WHERE m.ticket_id IN (SELECT id FROM support_tickets WHERE user_id=$1::uuid)
        ORDER BY m.created_at ASC
      `, [userId]);
    }
  }

  if (tableNames.has('contact_submissions')) {
    if (userId) {
      await q(`contact_submissions for user`, `
        SELECT * FROM contact_submissions
        WHERE user_id=$1 OR email=(SELECT email FROM users WHERE id=$1::uuid)
        ORDER BY created_at DESC LIMIT 20
      `, [userId]);
    }
  }

  // ── 13. PAYMENT FAILURES ─────────────────────────────────────────────────
  sep('PHASE 8 — PAYMENT / REFUND AUDIT');

  if (tableNames.has('payment_failures')) {
    await q(`payment_failures for payment_id`, `
      SELECT * FROM payment_failures WHERE payment_id=$1 OR payment_id LIKE $2
    `, [PAYMENT_ID, `%${PAYMENT_ID}%`]);
    if (userId) {
      await q(`payment_failures for user_id`, `
        SELECT * FROM payment_failures WHERE user_id=$1::uuid ORDER BY created_at DESC
      `, [userId]);
    }
  }

  if (tableNames.has('manual_payments')) {
    await q(`manual_payments for payment_id`, `
      SELECT * FROM manual_payments WHERE utr=$1 ORDER BY created_at DESC
    `, [PAYMENT_ID]);
  }

  // ── 14. ADMIN EVENTS ─────────────────────────────────────────────────────
  sep('PHASE 9 (cont) — ADMIN EVENTS');

  if (tableNames.has('admin_events')) {
    if (orderId) {
      await q(`admin_events for order_id=${orderId}`, `
        SELECT * FROM admin_events WHERE order_id=$1 ORDER BY created_at ASC
      `, [orderId]);
    }
    if (userId) {
      await q(`admin_events for user_id=${userId}`, `
        SELECT * FROM admin_events WHERE user_id=$1::uuid ORDER BY created_at DESC LIMIT 30
      `, [userId]);
    }
    await q(`admin_events mentioning payment ID`, `
      SELECT * FROM admin_events WHERE metadata::text LIKE $1 ORDER BY created_at ASC
    `, [`%${PAYMENT_ID}%`]);
  }

  // ── 15. FRAUD EVENTS ─────────────────────────────────────────────────────
  if (tableNames.has('fraud_events') && userId) {
    await q(`fraud_events for user_id=${userId}`, `
      SELECT * FROM fraud_events WHERE user_id=$1::uuid ORDER BY created_at DESC
    `, [userId]);
  }

  // ── 16. SYSTEM ERRORS around purchase time ───────────────────────────────
  sep('PHASE 9 (cont) — SYSTEM ERRORS');

  if (tableNames.has('system_errors')) {
    if (orderRow) {
      await q(`system_errors ±6h of order creation`, `
        SELECT * FROM system_errors
        WHERE created_at BETWEEN $1::timestamptz - interval '6 hours'
                             AND $1::timestamptz + interval '6 hours'
        ORDER BY created_at ASC LIMIT 50
      `, [orderRow.created_at]);
    }
    await q(`system_errors mentioning payment ID`, `
      SELECT * FROM system_errors WHERE message LIKE $1 ORDER BY created_at ASC
    `, [`%${PAYMENT_ID}%`]);
  } else {
    console.log('\n   system_errors table: NOT FOUND');
  }

  // ── 17. API LOGS ─────────────────────────────────────────────────────────
  for (const tbl of ['api_logs', 'api_request_logs', 'request_logs']) {
    if (tableNames.has(tbl) && orderRow) {
      await q(`${tbl} ±2h of order creation`, `
        SELECT * FROM ${tbl}
        WHERE created_at BETWEEN $1::timestamptz - interval '2 hours'
                             AND $1::timestamptz + interval '2 hours'
        ORDER BY created_at ASC LIMIT 100
      `, [orderRow.created_at]);
    }
  }

  // ── 18. KYC ──────────────────────────────────────────────────────────────
  sep('KYC STATUS');
  for (const tbl of ['kyc_profiles', 'kyc_submissions']) {
    if (tableNames.has(tbl) && userId) {
      await q(`${tbl} for user_id`, `
        SELECT * FROM ${tbl} WHERE user_id=$1::uuid ORDER BY created_at DESC LIMIT 5
      `, [userId]);
    }
  }

  // ── 19. OVERALL USER ORDER HISTORY ───────────────────────────────────────
  sep('SUMMARY — ALL ORDERS FOR THIS USER');
  if (userId) {
    await q(`ALL orders for user_id=${userId}`, `
      SELECT id, user_id, amount, account_size, plan_type, payment_type,
             status, payment_method, utr_reference, metadata, created_at, updated_at
      FROM orders WHERE user_id=$1 ORDER BY created_at ASC
    `, [userId]);
  }

  // ── 20. ROW COUNTS ───────────────────────────────────────────────────────
  sep('ROW COUNTS (context)');
  const countTables = ['orders','users','trading_accounts','challenge_accounts',
    'provisioning_logs','webhook_logs','support_tickets','login_history',
    'sessions','notifications','trade_journal','risk_rules','audit_logs'];
  for (const t of countTables) {
    if (tableNames.has(t)) {
      const r = await pool.query(`SELECT COUNT(*) AS cnt FROM ${t}`);
      console.log(`  ${t.padEnd(28)} = ${r.rows[0].cnt}`);
    }
  }

  console.log('\n' + '═'.repeat(72));
  console.log('  AUDIT COMPLETE — READ ONLY — NO DATA MODIFIED');
  console.log(`  ${new Date().toISOString()}`);
  console.log('═'.repeat(72));

  await pool.end();
}

run().catch(async (err) => {
  console.error('\nFATAL:', err.message);
  if (pool) await pool.end().catch(() => {});
  process.exit(1);
});
