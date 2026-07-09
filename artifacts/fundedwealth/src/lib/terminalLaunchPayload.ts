import { resolveLaunchAccountId } from "./accountLaunchIdentity.js";

export function buildTerminalLaunchRequestBody(accountLike: Record<string, any> | null | undefined) {
  if (!accountLike || typeof accountLike !== "object") {
    return {};
  }

  const accountId = resolveLaunchAccountId((accountLike as any).accountId || null, accountLike);

  return accountId ? { accountId } : {};
}
