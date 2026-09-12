/**
 * P0 Fix: Check current discount_config and apply correction.
 * Uses service role key from environment or falls back to checking current state.
 * 
 * Run: node run-pricing-fix-anon.mjs
 * Or with service key: SUPABASE_SERVICE_ROLE_KEY=<key> node run-pricing-fix-anon.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nysrxvpjdlvzvcawysvh.supabase.co';

// Try service role key first (needed for upsert), fall back to anon for read
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY 
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55c3J4dnBqZGx2enZjYXd5c3ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5OTY3MzYsImV4cCI6MjA5NDU3MjczNn0.8KUxnPOwbqKKVx-npld8InV2atB9m0aC-TeO9yqgEoY';

const supabase = createClient(SUPABASE_URL, KEY);

const CORRECT_DISCOUNTS = [
  { plan_type: 'flash',   code: 'FLASH50',   discount_pct: 50, active: true },
  { plan_type: 'instant', code: 'INSTANT45', discount_pct: 45, active: true },
  { plan_type: '1step',   code: 'ONESTEP55', discount_pct: 55, active: true },
  { plan_type: '2step',   code: 'TWOSTEP60', discount_pct: 60, active: true },
];

async function run() {
  console.log('=== P0 Pricing Fix: Checking discount_config ===\n');

  // Show current state
  const { data: current, error: fetchErr } = await supabase
    .from('discount_config')
    .select('plan_type, code, discount_pct, active')
    .order('plan_type');

  if (fetchErr) {
    console.error('❌ Failed to read discount_config:', fetchErr.message);
    console.error('   (This is expected if anon key lacks SELECT on discount_config)');
  } else {
    console.log('CURRENT discount_config:');
    if (!current || current.length === 0) {
      console.log('  (empty — no rows yet)');
    } else {
      current.forEach(r => {
        const correct = CORRECT_DISCOUNTS.find(c => c.plan_type === r.plan_type);
        const ok = correct && r.discount_pct === correct.discount_pct && r.code === correct.code;
        console.log(`  ${ok ? '✓' : '✗'} ${r.plan_type}: ${r.discount_pct}% (code: ${r.code}) ${ok ? '[CORRECT]' : '[NEEDS FIX]'}`);
      });
    }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('\n⚠️  SUPABASE_SERVICE_ROLE_KEY not set — cannot apply fix via this script.');
    console.log('   The fix is applied via Admin Panel → Founder → Discount Config, or');
    console.log('   run with: SUPABASE_SERVICE_ROLE_KEY=<key> node run-pricing-fix-anon.mjs');
    console.log('\n   Required values to set in Admin Panel:');
    CORRECT_DISCOUNTS.forEach(d => console.log(`     ${d.plan_type}: ${d.discount_pct}% OFF, code: ${d.code}`));
    return;
  }

  // Apply upsert with service key
  const { error: upsertErr } = await supabase
    .from('discount_config')
    .upsert(CORRECT_DISCOUNTS, { onConflict: 'plan_type' });

  if (upsertErr) {
    console.error('\n❌ Upsert failed:', upsertErr.message);
    process.exit(1);
  }

  const { data: after } = await supabase
    .from('discount_config')
    .select('plan_type, code, discount_pct, active')
    .order('plan_type');

  console.log('\nAFTER UPDATE:');
  (after || []).forEach(r => console.log(`  ✓ ${r.plan_type}: ${r.discount_pct}% (code: ${r.code})`));
  console.log('\n✅ discount_config corrected successfully.');
}

run().catch(e => { console.error('Script failed:', e); process.exit(1); });
