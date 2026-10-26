import assert from "node:assert/strict";
import test from "node:test";
import { sql } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import {
  buildOrderOwnerPredicate,
  fetchUserLiveAccounts,
  resolveUserAccountOwnership,
} from "../lib/accountOwnershipCompat.ts";

const dialect = new PgDialect();

test("resolves purchase ownership through the authenticated user's canonical profile", () => {
  const query = dialect.sqlToQuery(
    buildOrderOwnerPredicate(sql`orders.user_id`, "profile-1", "auth-1"),
  );

  assert.match(query.sql, /orders\.user_id::text/);
  assert.match(query.sql, /purchase_owner\.id::text/);
  assert.match(query.sql, /purchase_owner\.clerk_id/);
  assert.ok(query.params.includes("profile-1"));
  assert.ok(query.params.includes("auth-1"));
});

test("returns all accounts linked to an owned purchase, including multiple accounts", async () => {
  const statements = [];
  const accounts = [
    { trading_account_id: "account-1" },
    { trading_account_id: "account-2" },
  ];
  const db = {
    async execute(query) {
      const statement = dialect.sqlToQuery(query);
      statements.push(statement);
      if (statement.sql.includes("information_schema.columns")) return { rows: [] };
      return { rows: accounts };
    },
  };

  const result = await fetchUserLiveAccounts(db, "profile-1", null, "auth-1");
  const accountQuery = statements.at(-1);

  assert.deepEqual(result, accounts);
  assert.equal(result.length, 2);
  assert.match(accountQuery.sql, /FROM public\.orders o/);
  assert.match(accountQuery.sql, /FROM public\.provisioning_logs pl/);
  assert.match(accountQuery.sql, /NOT EXISTS/);
  assert.ok(accountQuery.params.includes("profile-1"));
  assert.ok(accountQuery.params.includes("auth-1"));
  assert.ok(!accountQuery.params.includes("profile-2"));
});

test("returns an empty list for a user with no linked accounts", async () => {
  const db = {
    async execute(query) {
      const statement = dialect.sqlToQuery(query);
      if (statement.sql.includes("information_schema.columns")) return { rows: [] };
      return { rows: [] };
    },
  };

  assert.deepEqual(await fetchUserLiveAccounts(db, "profile-empty", null, "auth-empty"), []);
});

test("prevents a foreign purchase link from granting access through a stale direct owner", async () => {
  const statements = [];
  const columnsByTable = {
    trading_accounts: ["trader_id", "user_id"],
    challenge_accounts: ["trader_id", "user_id"],
    terminal_traders: ["external_id"],
  };
  const db = {
    async execute(query) {
      const statement = dialect.sqlToQuery(query);
      statements.push(statement);
      if (statement.sql.includes("information_schema.columns")) {
        const tableName = statement.params.at(-1);
        return { rows: (columnsByTable[tableName] || []).map((column_name) => ({ column_name })) };
      }
      return { rows: [] };
    },
  };

  const result = await fetchUserLiveAccounts(db, "profile-a", "trader-a", "auth-a");
  const accountQuery = statements.at(-1);

  assert.deepEqual(result, []);
  assert.match(accountQuery.sql, /FROM public\.orders linked_order/);
  assert.match(accountQuery.sql, /FROM public\.provisioning_logs linked_log/);
  assert.match(accountQuery.sql, /NOT EXISTS/);
  assert.ok(accountQuery.params.includes("profile-a"));
  assert.ok(accountQuery.params.includes("auth-a"));
  assert.ok(!accountQuery.params.includes("profile-b"));
});

test("uses the same purchase ownership guard for account and terminal launch lookup", async () => {
  const statements = [];
  const db = {
    async execute(query) {
      const statement = dialect.sqlToQuery(query);
      statements.push(statement);
      if (statement.sql.includes("information_schema.columns")) return { rows: [] };
      return { rows: [] };
    },
  };

  await resolveUserAccountOwnership(db, "profile-a", "account-a", "auth-a");
  const ownershipQuery = statements.at(-1);

  assert.match(ownershipQuery.sql, /FROM public\.orders o/);
  assert.match(ownershipQuery.sql, /FROM public\.provisioning_logs pl/);
  assert.match(ownershipQuery.sql, /purchase_owner\.clerk_id/);
  assert.match(ownershipQuery.sql, /NOT EXISTS/);
  assert.ok(ownershipQuery.params.includes("profile-a"));
  assert.ok(ownershipQuery.params.includes("auth-a"));
});
