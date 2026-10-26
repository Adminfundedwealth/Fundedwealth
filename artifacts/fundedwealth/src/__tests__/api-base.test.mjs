import assert from "node:assert/strict";
import test from "node:test";
import { resolveApiBase } from "../lib/api-base.ts";

const RAILWAY_API = "https://fundedwealth-api-production.up.railway.app";

test("defaults to the production Railway API", () => {
  assert.equal(resolveApiBase(), RAILWAY_API);
});

test("rewrites the broken production API hostname to Railway", () => {
  assert.equal(resolveApiBase("https://api.fundedwealth.com"), RAILWAY_API);
  assert.equal(
    resolveApiBase("https://api.fundedwealth.com/v1"),
    `${RAILWAY_API}/v1`,
  );
});

test("rewrites legacy and suspended API hosts to Railway", () => {
  assert.equal(resolveApiBase("https://api.fundedwealth11.com"), RAILWAY_API);
  assert.equal(resolveApiBase("https://fundedwealth-api.onrender.com"), RAILWAY_API);
});

test("preserves a non-broken explicitly configured API host", () => {
  assert.equal(resolveApiBase("https://api-staging.example.com"), "https://api-staging.example.com");
});
