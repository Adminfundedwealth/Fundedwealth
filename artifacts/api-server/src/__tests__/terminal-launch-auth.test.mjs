import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveTerminalLaunchUser } from '../lib/terminalLaunchAuth.js';

test('falls back to email lookup when clerkId lookup misses', async () => {
  let clerkLookupCalls = 0;
  let emailLookupCalls = 0;

  const user = await resolveTerminalLaunchUser({
    authUserId: 'supabase-user-123',
    authEmail: 'trader@example.com',
    lookupByClerkId: async () => {
      clerkLookupCalls += 1;
      return null;
    },
    lookupByEmail: async () => {
      emailLookupCalls += 1;
      return { id: 42, email: 'trader@example.com', clerkId: 'supabase-user-123' };
    },
    linkUserToAuth: async () => {},
  });

  assert.equal(user?.id, 42);
  assert.equal(clerkLookupCalls, 1);
  assert.equal(emailLookupCalls, 1);
});
