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

  // Wrap every DB call — any transient error must not abort the launch
  let user = null;
  try {
    user = await lookupByClerkId(authUserId);
  } catch (e) {
    console.warn("[resolveTerminalLaunchUser] lookupByClerkId failed:", e?.message || String(e));
  }

  if (!user && authEmail) {
    try {
      user = await lookupByEmail(authEmail);
    } catch (e) {
      console.warn("[resolveTerminalLaunchUser] lookupByEmail failed:", e?.message || String(e));
    }
  }

  // If the user row exists but isn't linked to this auth ID yet, attempt to
  // link it. A unique-constraint conflict or any other DB error must NOT
  // abort the launch — the user is identified, just continue.
  if (user && authUserId && (!user.clerkId || user.clerkId !== authUserId)) {
    try {
      await linkUserToAuth(user);
    } catch (linkErr) {
      console.warn("[resolveTerminalLaunchUser] linkUserToAuth failed (non-fatal):", {
        message: linkErr?.message || String(linkErr),
        userId: user.id,
        authUserId,
      });
    }
  }

  return user;
}
