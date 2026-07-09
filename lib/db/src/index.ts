import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/postgres";

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 8000,   // fail fast if DB unreachable
  idleTimeoutMillis: 30000,
  max: 10,                          // enough for production load
  statement_timeout: 30000,         // kill queries running > 30s
  query_timeout: 30000,             // node-postgres client-side timeout
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
