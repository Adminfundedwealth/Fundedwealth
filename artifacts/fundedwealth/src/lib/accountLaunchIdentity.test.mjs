import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveLaunchAccountId } from './accountLaunchIdentity.js';

test('prefers the account id from the URL when present', () => {
  assert.equal(resolveLaunchAccountId('acct-from-url', { id: 'acct-from-data' }), 'acct-from-url');
});

test('falls back to the account object when the URL has no id', () => {
  assert.equal(resolveLaunchAccountId(null, { id: 'acct-from-data' }), 'acct-from-data');
  assert.equal(resolveLaunchAccountId(null, { account: { id: 'acct-from-nested-data' } }), 'acct-from-nested-data');
});

test('returns null when neither source provides an id', () => {
  assert.equal(resolveLaunchAccountId(null, {}), null);
});
