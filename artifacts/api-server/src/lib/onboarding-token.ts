/**
 * One-time onboarding (password-setup) token.
 *
 * Issued by the purchase flow (verify-utr) and consumed by /auth/create-password.
 * Stateless + signed (HMAC-SHA256) so no extra storage is needed. Effective
 * one-time use is enforced by users.onboarding_completed: once the password is
 * set, the flag flips to true and the create-password endpoint refuses to run
 * again — so even a replayed token is inert.
 */
import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function secret(): string {
  return process.env.SESSION_SECRET || process.env.JWT_SECRET || "fundedwealth-onboarding-fallback";
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

export interface OnboardingTokenPayload {
  userId: string;
  email: string;
  exp: number;
}

/** Create a signed onboarding token for a user. */
export function signOnboardingToken(userId: string, email: string): string {
  const payload: OnboardingTokenPayload = {
    userId,
    email: email.toLowerCase(),
    exp: Date.now() + TOKEN_TTL_MS,
  };
  const body = b64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

/** Verify a signed onboarding token. Returns the payload or null if invalid/expired. */
export function verifyOnboardingToken(token: string | undefined | null): OnboardingTokenPayload | null {
  if (!token || typeof token !== "string" || !token.includes(".")) return null;
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;

  const expected = createHmac("sha256", secret()).update(body).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as OnboardingTokenPayload;
    if (!payload.userId || !payload.email || !payload.exp) return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}
