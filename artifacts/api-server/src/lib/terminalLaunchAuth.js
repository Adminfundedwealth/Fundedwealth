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

  if (user && authUserId && (!user.clerkId || user.clerkId !== authUserId)) {
    await linkUserToAuth(user);
  }

  return user;
}
