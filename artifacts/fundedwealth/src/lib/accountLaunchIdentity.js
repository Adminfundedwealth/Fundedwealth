export function resolveLaunchAccountId(accountId, accountLike) {
  if (typeof accountId === 'string' && accountId.trim()) {
    return accountId.trim();
  }

  if (!accountLike || typeof accountLike !== 'object') {
    return null;
  }

  const nestedAccount = accountLike.account;
  const candidate = accountLike.accountId
    || accountLike.id
    || accountLike.tradingAccountId
    || accountLike.challengeAccountId
    || (nestedAccount && (nestedAccount.accountId || nestedAccount.id || nestedAccount.tradingAccountId || nestedAccount.challengeAccountId))
    || null;

  return typeof candidate === 'string' && candidate.trim() ? candidate.trim() : null;
}
