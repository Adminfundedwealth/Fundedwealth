import pg from "pg";
const { Client } = pg;
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000
});
console.log("START");
try {
  await client.connect();
  console.log("CONNECTED");
  const r = await client.query("SELECT NOW()");
  console.log(r.rows);
  await client.end();
  console.log("DONE");
} catch (e) {
  console.error("ERROR");
  console.error(e);
}
