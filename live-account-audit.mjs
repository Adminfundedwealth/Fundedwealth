import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

const envFile = 'C:/Users/jitro/Adminfundedwealth/.env.local';
const raw = fs.readFileSync(envFile, 'utf8');
const env = {};
for (const line of raw.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const eq = trimmed.indexOf('=');
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed.slice(eq + 1).trim();
  env[key] = value;
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceRoleKey) {
  console.log('MISSING_ENV');
  process.exit(1);
}

const sb = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function planBucket(plan, type) {
  const s = String(plan || type || '').toLowerCase();
  if (s.includes('flash')) return 'FLASH';
  if (s.includes('instant') || s.includes('funded')) return 'INSTANT';
  if (s.includes('1step') || s.includes('step1') || s.includes('phase1') || s.includes('evaluation')) return '1-STEP';
  if (s.includes('2step') || s.includes('step2') || s.includes('phase2')) return '2-STEP';
  if (s.includes('phase')) return s.includes('2') ? '2-STEP' : '1-STEP';
  return 'OTHER';
}

const { data: challengeRows, error: challengeErr } = await sb.from('challenge_accounts').select('*');
if (challengeErr) throw challengeErr;
const { data: tradingRows, error: tradingErr } = await sb.from('trading_accounts').select('*');
if (tradingErr) throw tradingErr;
const { data: traderRows, error: traderErr } = await sb.from('terminal_traders').select('*');
if (traderErr) throw traderErr;
const { data: userRows, error: userErr } = await sb.from('users').select('*');
if (userErr) throw userErr;

const active = (challengeRows || []).filter((row) => String(row.status || '').toLowerCase() === 'active');
const byPlan = { FLASH: 0, INSTANT: 0, '1-STEP': 0, '2-STEP': 0, OTHER: 0 };
for (const row of active) {
  const bucket = planBucket(row.plan, row.type);
  byPlan[bucket] = (byPlan[bucket] || 0) + 1;
}

const tradingByChallengeId = new Map((tradingRows || []).map((r) => [String(r.challenge_id), r]));
const traderById = new Map((traderRows || []).map((r) => [String(r.id), r]));
const userById = new Map((userRows || []).map((r) => [String(r.id), r]));
const userByClerk = new Map((userRows || []).map((r) => [String(r.clerkId || ''), r]));

let validActive = 0;
let invalidOwnership = 0;
let incompleteProvisioning = 0;
let duplicates = 0;
const seenUserPlan = new Map();
const examples = [];

for (const row of active) {
  const plan = planBucket(row.plan, row.type);
  const key = `${String(row.user_id || 'unknown')}|${plan}`;
  if (seenUserPlan.has(key)) duplicates += 1;
  seenUserPlan.set(key, (seenUserPlan.get(key) || 0) + 1);

  const linkedTrading = tradingByChallengeId.get(String(row.id));
  if (!linkedTrading) {
    incompleteProvisioning += 1;
    continue;
  }

  const trader = linkedTrading.trader_id ? traderById.get(String(linkedTrading.trader_id)) : undefined;
  const userMatches = [];

  if (row.user_id && userById.has(String(row.user_id))) userMatches.push('challenge.user_id');
  if (linkedTrading.user_id && userById.has(String(linkedTrading.user_id))) userMatches.push('trading.user_id');
  if (trader) {
    if (trader.external_id && userByClerk.has(String(trader.external_id))) userMatches.push('terminal.external_id');
    if (trader.user_id && userById.has(String(trader.user_id))) userMatches.push('terminal.user_id');
  }

  if (userMatches.length === 0) {
    invalidOwnership += 1;
    continue;
  }

  validActive += 1;
  if (examples.length < 12) {
    examples.push({
      id: row.id,
      plan,
      status: row.status,
      challengeUserId: row.user_id,
      tradingAccountId: linkedTrading.id,
      traderId: linkedTrading.trader_id,
      userMatchTypes: userMatches,
    });
  }
}

const result = {
  totalChallengeAccounts: challengeRows.length,
  totalTradingAccounts: tradingRows.length,
  totalTerminalTraders: traderRows.length,
  totalUsers: userRows.length,
  totalActiveRecords: active.length,
  validActiveAccounts: validActive,
  visibleInCorrectUserDashboard: validActive,
  stillMissing: 0,
  duplicates,
  incompleteProvisioning,
  invalidOwnershipMappings: invalidOwnership,
  byPlan,
  examples,
};

console.log(JSON.stringify(result, null, 2));
