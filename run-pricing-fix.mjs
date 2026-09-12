/**
 * P0 Fix: Correct discount_config table values.
 * Run once: node run-pricing-fix.mjs
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://nysrxvpjdlvzvcawysvh.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY env var is required');
  console.error('Usage: SUPABASE_SERVICE_ROLE_KEY=<key> node run-pricing-fix.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const CORRECT_DISCOUNTS = [
  { plan_type: 'flash',   code: 'FLASH50',   discount_pct: 50, active: true },
  { plan_type: 'instant', code: 'INSTANT45', discount_pct: 45, active: true },
  { plan_type: '1step',   code: 'ONESTEP55', discount_pct: 55, active: true },
  { plan_type: '2step',   code: 'TWOSTEP60', discount_pct: 60, active: true },
];

async function run() {
  console.log('=== P0 Pricing Fix: Updating discount_config ===\n');

  // Show current state
  const { data: before, error: fetchErr } = await supabase
    .from('discount_config')
    .select('plan_type, code, discount_pct, active')
    .order('plan_type');

  if (fetchErr) {
    console.error('Failed to fetch current config:', fetchErr.message);
  } else {
    console.log('BEFORE:');
    (before || []).forEach(r => console.log(`  ${r.plan_type}: ${r.discount_pct}% (code: ${r.code}, active: ${r.active})`));
  }

  // Apply correct values
  const { error: upsertErr } = await supabase
    .from('discount_config')
    .upsert(CORRECT_DISCOUNTS, { onConflict: 'plan_type' });

  if (upsertErr) {
    console.error('\nFAILED to update discount_config:', upsertErr.message);
    process.exit(1);
  }

  // Show new state
  const { data: after, error: afterErr } = await supabase
    .from('discount_config')
    .select('plan_type, code, discount_pct, active')
    .order('plan_type');

  if (afterErr) {
    console.error('Failed to fetch updated config:', afterErr.message);
  } else {
    console.log('\nAFTER (corrected):');
    (after || []).forEach(r => console.log(`  ${r.plan_type}: ${r.discount_pct}% (code: ${r.code}, active: ${r.active})`));
  }

  console.log('\n✓ discount_config updated successfully.');
  console.log('  Flash=50%, Instant=45%, 1-Step=55%, 2-Step=60%');
}

run().catch(e => { console.error('Script failed:', e); process.exit(1); });
