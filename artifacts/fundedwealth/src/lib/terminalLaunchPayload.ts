export function buildTerminalLaunchRequestBody(accountLike: Record<string, any> | null | undefined) {
  if (!accountLike || typeof accountLike !== "object") {
    return {};
  }

  const accountId =
    (accountLike as any).accountId ||
    (accountLike as any).id ||
    (accountLike as any).tradingAccountId ||
    (accountLike as any).challengeAccountId ||
    (accountLike as any).account?.id ||
    (accountLike as any).account?.accountId ||
    (accountLike as any).account?.tradingAccountId ||
    (accountLike as any).account?.challengeAccountId ||
    null;

  return accountId ? { accountId } : {};
}
