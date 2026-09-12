/**
 * Fix accounts that have no credentials in order metadata.
 * For accounts provisioned without proper metadata, update order metadata
 * with loginEmail fallback from user table.
 */
const { Client } = require("pg");
const c = new Client({
  connectionString: "postgresql://postgres:Supabasefunded%402026@db.nysrxvpjdlvzvcawysvh.supabase.co:5432/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await c.connect();
  console.log("Connected");

  // Find orders that have provisioning_logs completed but missing credentials in metadata
  const result = await c.query(`
    SELECT 
      o.id as order_id,
      o.metadata,
      o.user_id,
      u.email,
      pl.trading_account_id,
      pl.challenge_account_id,
      ta.account_code
    FROM orders o
    JOIN provisioning_logs pl ON pl.order_id::text = o.id::text
    JOIN trading_accounts ta ON ta.id = pl.trading_account_id
    JOIN users u ON u.id = o.user_id
    WHERE pl.status = 'completed'
    AND (
      o.metadata IS NULL 
      OR o.metadata NOT LIKE '%loginEmail%'
      OR o.metadata NOT LIKE '%terminalPassword%'
    )
  `);

  console.log(`Found ${result.rows.length} orders missing credentials`);

  for (const row of result.rows) {
    let existingMeta = {};
    try { existingMeta = JSON.parse(row.metadata || "{}"); } catch {}
    
    // Generate a stable password for this account (deterministic from account code)
    const crypto = require("crypto");
    const seed = row.account_code + row.email;
    const hash = crypto.createHash("sha256").update(seed).digest("hex");
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pw = "Fw1!";
    for(let i=0; i<12; i++) pw += chars[parseInt(hash.slice(i*2,i*2+2),16) % chars.length];
    
    const updatedMeta = JSON.stringify({
      ...existingMeta,
      loginEmail: existingMeta.loginEmail || row.email,
      terminalPassword: existingMeta.terminalPassword || existingMeta.tempPassword || pw,
      tempPassword: existingMeta.tempPassword || pw,
      accountCode: existingMeta.accountCode || row.account_code,
    });

    await c.query(`UPDATE orders SET metadata = $1 WHERE id = $2`, [updatedMeta, row.order_id]);
    console.log(`Fixed order ${row.order_id}: email=${row.email}, account=${row.account_code}`);
  }

  // Also fix orders that have provisioning but no provisioning_log (emergency provisions)
  const emergencyResult = await c.query(`
    SELECT 
      ta.id as trading_account_id,
      ta.account_code,
      tt.external_id as user_id,
      u.email,
      o.id as order_id,
      o.metadata
    FROM trading_accounts ta
    JOIN terminal_traders tt ON tt.id = ta.trader_id
    JOIN users u ON u.id::text = tt.external_id::text
    LEFT JOIN provisioning_logs pl ON pl.trading_account_id = ta.id
    LEFT JOIN orders o ON o.user_id = u.id AND o.status = 'confirmed'
    WHERE pl.id IS NULL OR o.metadata NOT LIKE '%terminalPassword%'
    LIMIT 20
  `);

  console.log(`\nFound ${emergencyResult.rows.length} emergency/unlinked accounts`);
  for(const row of emergencyResult.rows) {
    if(!row.order_id) continue;
    let existingMeta = {};
    try { existingMeta = JSON.parse(row.metadata || "{}"); } catch {}
    if(existingMeta.terminalPassword) continue; // already has password
    
    const crypto = require("crypto");
    const seed = row.account_code + row.email;
    const hash = crypto.createHash("sha256").update(seed).digest("hex");
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    let pw = "Fw1!";
    for(let i=0; i<12; i++) pw += chars[parseInt(hash.slice(i*2,i*2+2),16) % chars.length];
    
    const updatedMeta = JSON.stringify({
      ...existingMeta,
      loginEmail: row.email,
      terminalPassword: pw,
      tempPassword: pw,
      accountCode: row.account_code,
    });
    
    await c.query(`UPDATE orders SET metadata = $1 WHERE id = $2`, [updatedMeta, row.order_id]);
    console.log(`Fixed emergency account ${row.account_code}: email=${row.email}`);
  }

  await c.end();
  console.log("\nDone. Re-run verify-provision.mjs to confirm.");
}
run().catch(e => { console.error(e.message); process.exit(1); });
