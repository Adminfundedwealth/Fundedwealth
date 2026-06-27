#!/usr/bin/env node
/**
 * Safely apply migrations in UUID-safe order
 * Skip integer-keyed migrations that reference users.id as INTEGER
 */

import pg from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsDir = path.join(__dirname, "../migrations");
const envPath = path.join(__dirname, '..', '..', '..', 'artifacts', 'api-server', '.env');
if (!fs.existsSync(envPath)) {
  throw new Error(`.env not found at ${envPath}`);
}

const rawEnv = fs.readFileSync(envPath, 'utf8');
for (const line of rawEnv.split(/\r?\n/)) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) continue;
  const idx = trimmed.indexOf('=');
  if (idx === -1) continue;
  const key = trimmed.slice(0, idx);
  let value = trimmed.slice(idx + 1).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  process.env[key] = process.env[key] ?? value;
}

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// UUID-safe migrations (in apply order)
const SAFE_MIGRATIONS = [
  "20260519_create_trading_orders_uuid.sql", // already applied, but idempotent
  "20260518_terminal_tables.sql", // create positions/executions/trade_logs/challenge_state with UUIDs
  "20260518_phase5_options.sql",
  "20260518_phase4_advanced_orders.sql", // PATCHED to UUID
  "20260518_phase6_challenge_engine.sql",
  "20260518_phase7_risk_engine.sql",
  "20260518_phase8_account_lifecycle.sql",
  "20260519_create_support_tickets.sql",
];

// Migrations to skip (contain INTEGER FKs to users or depend on missing alert_rules)
const SKIP_MIGRATIONS = [
  "001_fraud_detection_system.sql",
  "002_observability_monitoring_system.sql",
  "003_security_auth_rbac_phase1.sql",
  "20260518_phase9_infrastructure_reliability.sql",
  "20260519_add_alert_targets.sql",
];

async function applyMigration(filename) {
  try {
    const filepath = path.join(migrationsDir, filename);
    if (!fs.existsSync(filepath)) {
      console.log(`⏭️  Migration not found: ${filename}`);
      return { success: null, filename, reason: "not_found" };
    }

    const sql = fs.readFileSync(filepath, "utf-8");
    const client = await pool.connect();
    try {
      console.log(`\n📝 Applying: ${filename}`);
      await client.query(sql);
      console.log(`✅ Success: ${filename}`);
      return { success: true, filename };
    } catch (err) {
      console.error(`❌ Failed: ${filename}`);
      console.error(`   Error: ${err?.stack || err?.message || String(err)}`);
      return { success: false, filename, error: err?.stack || err?.message || String(err) };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(`Error processing ${filename}:`, err.message);
    return { success: false, filename, error: err.message };
  }
}

async function main() {
  console.log("=== UUID-Safe Migration Apply ===\n");

  const results = [];

  console.log("Applying safe migrations...");
  for (const migration of SAFE_MIGRATIONS) {
    const result = await applyMigration(migration);
    results.push(result);
  }

  console.log("\n\n=== Skipped Migrations ===");
  for (const migration of SKIP_MIGRATIONS) {
    console.log(`⏭️  SKIPPED: ${migration} (contains INTEGER FK to users)`);
  }

  console.log("\n\n=== Summary ===");
  const applied = results.filter((r) => r.success === true);
  const failed = results.filter((r) => r.success === false);
  const notFound = results.filter((r) => r.success === null);

  console.log(`Applied: ${applied.length}`);
  console.log(`Failed: ${failed.length}`);
  console.log(`Not found: ${notFound.length}`);

  if (failed.length > 0) {
    console.log("\n❌ Failed migrations:");
    failed.forEach((r) => console.log(`  - ${r.filename}: ${r.error}`));
  }

  await pool.end();
  process.exit(failed.length > 0 ? 1 : 0);
}

main().catch(console.error);
