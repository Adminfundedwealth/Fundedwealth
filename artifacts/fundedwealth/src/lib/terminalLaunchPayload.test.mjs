import test from 'node:test';
import assert from 'node:assert/strict';
import { buildTerminalLaunchRequestBody } from './terminalLaunchPayload.mjs';

test('uses a direct accountId when available', () => {
  assert.deepEqual(buildTerminalLaunchRequestBody({ accountId: 'acct-123' }), { accountId: 'acct-123' });
});

test('falls back to other common account identifiers', () => {
  assert.deepEqual(buildTerminalLaunchRequestBody({ id: 'acct-456' }), { accountId: 'acct-456' });
  assert.deepEqual(buildTerminalLaunchRequestBody({ tradingAccountId: 'acct-789' }), { accountId: 'acct-789' });
  assert.deepEqual(buildTerminalLaunchRequestBody({ challengeAccountId: 'acct-000' }), { accountId: 'acct-000' });
});

test('returns an empty body when no identifier is present', () => {
  assert.deepEqual(buildTerminalLaunchRequestBody({}), {});
});
