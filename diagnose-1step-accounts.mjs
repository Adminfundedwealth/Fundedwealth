/**
 * DIAGNOSTIC SCRIPT — 1-Step account risk rule audit
 *
 * Run with: node diagnose-1step-accounts.mjs
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment.
 *
 * Reports:
 *   1. How many 1-step challenge accounts have wrong daily_loss_limit (5% instead of 3%)
 *      or wrong max_drawdown (10% instead of 6%)
 *   2. How many 1-step accounts are currently on an incorrect phase
 *      (type = evaluation_phase2 or phase = phase_2 when plan = 1step)
 *   3. Does NOT modify anything — read-only audit
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.');
  process.exit(1);
}

const db = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function run() {
  console.log('=== 1-Step Account Risk Rule Audit ===\n');

  // ── 1. Fetch all challenge_accounts where plan = '1step' ──────────────────
  const { data: challenges, error: chErr } = await db
    .from('challenge_accounts')
    .select('id, plan, type, status, initial_balance, created_at')
    .eq('plan', '1step')
    .order('created_at', { ascending: false });

  if (chErr) {
    console.error('❌  Failed to fetch challenge_accounts:', chErr.message);
    process.exit(1);
  }

  console.log(`Found ${challenges.length} challenge_accounts with plan = '1step'\n`);

  if (challenges.length === 0) {
    console.log('No 1-step accounts in DB — no existing accounts affected.\n');
  } else {
    // ── 2. Phase transition bug check ────────────────────────────────────────
    const wrongPhase = challenges.filter(c =>
      c.status === 'active' &&
      (c.type === 'evaluation_phase2' || c.type?.includes('phase2'))
    );
    console.log(`Issue 1 — Phase transition bug:`);
    console.log(`  1-Step accounts on phase_2 (should not exist): ${wrongPhase.length}`);
    if (wrongPhase.length > 0) {
      wrongPhase.forEach(c => {
        console.log(`    - ${c.id} | type: ${c.type} | status: ${c.status} | created: ${c.created_at}`);
      });
    } else {
      console.log(`  ✅ None found — no live accounts stuck on wrong phase.\n`);
    }

    // ── 3. Wrong risk rules check ─────────────────────────────────────────────
    const challengeIds = challenges.map(c => c.id);

    // Get trading accounts linked to these challenges
    const { data: tradingAccts, error: taErr } = await db
      .from('trading_accounts')
      .select('id, challenge_id, account_code, status')
      .in('challenge_id', challengeIds);

    if (taErr) {
      console.error('❌  Failed to fetch trading_accounts:', taErr.message);
    } else {
      const taIds = tradingAccts.map(t => t.id);
      console.log(`Found ${tradingAccts.length} trading_accounts linked to 1-step challenges\n`);

      if (taIds.length > 0) {
        // Get risk rules for these accounts
        const { data: rules, error: rulesErr } = await db
          .from('risk_rules')
          .select('trading_account_id, rule_type, value, is_active')
          .in('trading_account_id', taIds)
          .in('rule_type', ['daily_loss_limit', 'max_drawdown']);

        if (rulesErr) {
          console.error('❌  Failed to fetch risk_rules:', rulesErr.message);
        } else {
          console.log(`Issue 2 — Wrong risk limits seeded:`);

          const wrongDailyLoss = rules.filter(r =>
            r.rule_type === 'daily_loss_limit' &&
            r.is_active &&
            r.value?.percent !== undefined &&
            r.value.percent !== 3
          );
          const wrongMaxDD = rules.filter(r =>
            r.rule_type === 'max_drawdown' &&
            r.is_active &&
            r.value?.percent !== undefined &&
            r.value.percent !== 6
          );

          console.log(`  Accounts with wrong daily_loss_limit (not 3%): ${wrongDailyLoss.length}`);
          wrongDailyLoss.forEach(r => {
            const acct = tradingAccts.find(t => t.id === r.trading_account_id);
            console.log(`    - trading_account: ${r.trading_account_id} | code: ${acct?.account_code} | current value: ${r.value?.percent}%`);
          });

          console.log(`  Accounts with wrong max_drawdown (not 6%): ${wrongMaxDD.length}`);
          wrongMaxDD.forEach(r => {
            const acct = tradingAccts.find(t => t.id === r.trading_account_id);
            console.log(`    - trading_account: ${r.trading_account_id} | code: ${acct?.account_code} | current value: ${r.value?.percent}%`);
          });

          // Also check for accounts with no rules at all
          const accountsWithRules = new Set(rules.map(r => r.trading_account_id));
          const noRules = taIds.filter(id => !accountsWithRules.has(id));
          console.log(`  Accounts with NO risk rules seeded: ${noRules.length}`);
          noRules.forEach(id => {
            const acct = tradingAccts.find(t => t.id === id);
            console.log(`    - trading_account: ${id} | code: ${acct?.account_code}`);
          });

          if (wrongDailyLoss.length === 0 && wrongMaxDD.length === 0 && noRules.length === 0) {
            console.log(`  ✅ All seeded rules look correct.\n`);
          }
        }
      }
    }
  }

  console.log('\n=== AUDIT COMPLETE — no data modified ===');
}

run().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
