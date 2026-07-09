export function resolveLaunchAccountId(accountId: string | null | undefined, accountLike: Record<string, any> | null | undefined) {
  if (typeof accountId === 'string' && accountId.trim()) {
    return accountId.trim();
  }

  if (!accountLike || typeof accountLike !== 'object') {
    return null;
  }

  const nestedAccount = (accountLike as any).account;
  const candidate = (accountLike as any).accountId
    || (accountLike as any).id
    || (accountLike as any).tradingAccountId
    || (accountLike as any).challengeAccountId
    || (nestedAccount && (nestedAccount.accountId || nestedAccount.id || nestedAccount.tradingAccountId || nestedAccount.challengeAccountId))
    || null;

  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}
