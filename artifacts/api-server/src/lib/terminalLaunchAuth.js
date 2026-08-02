export async function resolveTerminalLaunchUser({
  authUserId,
  authEmail,
  lookupByClerkId,
  lookupByEmail,
  linkUserToAuth,
}) {
  if (!authUserId) {
    return null;
  }

  let user = await lookupByClerkId(authUserId);

  if (!user && authEmail) {
    user = await lookupByEmail(authEmail);
  }

  // If the user row exists but isn't linked to this auth ID yet, attempt to
  // link it. A unique-constraint conflict (another row already holds this
  // authUserId) or any other transient DB error must NOT abort the launch —
  // the user is still authenticated and identified, so we continue with the
  // row we already found.
  if (user && authUserId && (!user.clerkId || user.clerkId !== authUserId)) {
    try {
      await linkUserToAuth(user);
    } catch (linkErr) {
      console.warn("[resolveTerminalLaunchUser] linkUserToAuth failed (non-fatal):", {
        message: linkErr?.message || String(linkErr),
        userId: user.id,
        authUserId,
      });
      // Continue — user is resolved, link failure is non-fatal
    }
  }

  return user;
}
