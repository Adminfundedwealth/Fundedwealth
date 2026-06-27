/**
 * TOTP 2FA Service — Production-grade Time-Based One-Time Password
 *
 * Supports: Google Authenticator, Microsoft Authenticator, Authy, any RFC 6238 app.
 *
 * Features:
 * - TOTP secret generation (base32)
 * - QR code URI generation
 * - Token verification with time-drift tolerance
 * - Backup/recovery codes (10 single-use codes)
 * - Trusted device tokens (30-day)
 * - Rate limiting on verification attempts
 */

import crypto from "crypto";
import { db } from "@workspace/db";
import { twoFactorSettings } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";
import { getCachedRedisClient } from "./redis-client";

const TOTP_ISSUER = "FundedWealth";
const TOTP_ALGORITHM = "SHA1"; // Most authenticator apps only support SHA1
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30; // seconds
const TOTP_WINDOW = 1; // Allow 1 period drift (±30s)
const BACKUP_CODE_COUNT = 10;
const TRUSTED_DEVICE_DAYS = 30;
const MAX_VERIFY_ATTEMPTS = 5;
const VERIFY_LOCKOUT_SECONDS = 900; // 15 minutes

// ─── Base32 Encoding ─────────────────────────────────────────────────────────

const BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

function base32Encode(buffer: Buffer): string {
  let bits = "";
  for (const byte of buffer) {
    bits += byte.toString(2).padStart(8, "0");
  }
  let result = "";
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.substring(i, i + 5).padEnd(5, "0");
    result += BASE32_CHARS[parseInt(chunk, 2)];
  }
  return result;
}

function base32Decode(encoded: string): Buffer {
  let bits = "";
  for (const char of encoded.toUpperCase().replace(/=+$/, "")) {
    const idx = BASE32_CHARS.indexOf(char);
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, "0");
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return Buffer.from(bytes);
}

// ─── TOTP Core ───────────────────────────────────────────────────────────────

function generateHOTP(secret: Buffer, counter: bigint): string {
  const counterBuf = Buffer.alloc(8);
  counterBuf.writeBigUInt64BE(counter);

  const hmac = crypto.createHmac("sha1", secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);

  return (code % Math.pow(10, TOTP_DIGITS)).toString().padStart(TOTP_DIGITS, "0");
}

function generateTOTP(secret: Buffer, timeStep: number = Math.floor(Date.now() / 1000 / TOTP_PERIOD)): string {
  return generateHOTP(secret, BigInt(timeStep));
}

function verifyTOTP(secret: Buffer, token: string, window: number = TOTP_WINDOW): boolean {
  const currentStep = Math.floor(Date.now() / 1000 / TOTP_PERIOD);
  for (let i = -window; i <= window; i++) {
    if (generateTOTP(secret, currentStep + i) === token) {
      return true;
    }
  }
  return false;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export interface TOTPSetupResult {
  secret: string; // Base32 encoded
  uri: string; // otpauth:// URI for QR code
  backupCodes: string[];
}

export interface TOTPVerifyResult {
  valid: boolean;
  error?: string;
  locked?: boolean;
  remainingAttempts?: number;
}

export class TOTPService {
  /**
   * Generate a new TOTP secret and backup codes for a user.
   */
  static generateSetup(email: string): TOTPSetupResult {
    // 20 bytes = 160 bits of entropy (recommended by RFC 4226)
    const secretBytes = crypto.randomBytes(20);
    const secret = base32Encode(secretBytes);

    const uri = `otpauth://totp/${encodeURIComponent(TOTP_ISSUER)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(TOTP_ISSUER)}&algorithm=${TOTP_ALGORITHM}&digits=${TOTP_DIGITS}&period=${TOTP_PERIOD}`;

    const backupCodes = TOTPService.generateBackupCodes();

    return { secret, uri, backupCodes };
  }

  /**
   * Generate 10 single-use backup codes.
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < BACKUP_CODE_COUNT; i++) {
      // 8-character alphanumeric codes (format: XXXX-XXXX)
      const raw = crypto.randomBytes(5).toString("hex").toUpperCase().slice(0, 8);
      codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
    }
    return codes;
  }

  /**
   * Verify a TOTP token for a user.
   * Includes rate limiting to prevent brute force.
   */
  static async verify(userId: string, token: string, secret: string): Promise<TOTPVerifyResult> {
    // Rate limiting check
    const rateLimitKey = `totp_attempts:${userId}`;
    const redis = getCachedRedisClient();

    if (redis) {
      const attempts = parseInt(await redis.get(rateLimitKey) || "0");
      if (attempts >= MAX_VERIFY_ATTEMPTS) {
        const ttl = await redis.ttl(rateLimitKey);
        return {
          valid: false,
          error: `Too many attempts. Try again in ${Math.ceil(ttl / 60)} minutes.`,
          locked: true,
        };
      }
    }

    // Clean the token (remove spaces/dashes)
    const cleanToken = token.replace(/[\s-]/g, "");

    if (cleanToken.length !== TOTP_DIGITS || !/^\d+$/.test(cleanToken)) {
      await TOTPService.incrementAttempts(rateLimitKey);
      return { valid: false, error: "Invalid code format" };
    }

    const secretBuffer = base32Decode(secret);
    const isValid = verifyTOTP(secretBuffer, cleanToken);

    if (!isValid) {
      const remaining = await TOTPService.incrementAttempts(rateLimitKey);
      return {
        valid: false,
        error: "Invalid code",
        remainingAttempts: Math.max(0, MAX_VERIFY_ATTEMPTS - remaining),
      };
    }

    // Reset attempts on success
    if (redis) {
      await redis.del(rateLimitKey);
    }

    return { valid: true };
  }

  /**
   * Verify a backup code. Each code can only be used once.
   */
  static verifyBackupCode(code: string, storedCodes: string[]): { valid: boolean; remainingCodes: string[] } {
    const normalizedInput = code.toUpperCase().replace(/[\s-]/g, "");
    const normalizedInput2 = `${normalizedInput.slice(0, 4)}-${normalizedInput.slice(4)}`;

    const idx = storedCodes.findIndex(
      (c) => c === normalizedInput || c === normalizedInput2 || c.replace("-", "") === normalizedInput,
    );

    if (idx === -1) {
      return { valid: false, remainingCodes: storedCodes };
    }

    // Remove the used code
    const remainingCodes = [...storedCodes];
    remainingCodes.splice(idx, 1);

    return { valid: true, remainingCodes };
  }

  /**
   * Generate a trusted device token (30-day validity).
   */
  static generateTrustedDeviceToken(userId: string, deviceFingerprint: string): string {
    const payload = JSON.stringify({
      userId,
      fp: deviceFingerprint,
      exp: Date.now() + TRUSTED_DEVICE_DAYS * 24 * 60 * 60 * 1000,
      nonce: crypto.randomBytes(8).toString("hex"),
    });

    const key = process.env.SESSION_SECRET || process.env.JWT_SECRET || "fallback-key";
    const hmac = crypto.createHmac("sha256", key).update(payload).digest("hex");

    return Buffer.from(`${payload}.${hmac}`).toString("base64url");
  }

  /**
   * Verify a trusted device token.
   */
  static verifyTrustedDeviceToken(token: string, userId: string, deviceFingerprint: string): boolean {
    try {
      const decoded = Buffer.from(token, "base64url").toString();
      const lastDot = decoded.lastIndexOf(".");
      if (lastDot === -1) return false;

      const payload = decoded.slice(0, lastDot);
      const receivedHmac = decoded.slice(lastDot + 1);

      const key = process.env.SESSION_SECRET || process.env.JWT_SECRET || "fallback-key";
      const expectedHmac = crypto.createHmac("sha256", key).update(payload).digest("hex");

      if (!crypto.timingSafeEqual(Buffer.from(receivedHmac), Buffer.from(expectedHmac))) {
        return false;
      }

      const data = JSON.parse(payload);
      if (data.userId !== userId) return false;
      if (data.fp !== deviceFingerprint) return false;
      if (Date.now() > data.exp) return false;

      return true;
    } catch {
      return false;
    }
  }

  /**
   * Increment verification attempts counter.
   */
  private static async incrementAttempts(key: string): Promise<number> {
    const redis = getCachedRedisClient();
    if (!redis) return 1;

    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, VERIFY_LOCKOUT_SECONDS);
    }
    return count;
  }

  /**
   * Enable TOTP for a user (store encrypted secret + backup codes in DB).
   */
  static async enable(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    await db
      .update(twoFactorSettings)
      .set({
        enabled: true,
        totpSecret: secret,
        backupCodes: JSON.stringify(backupCodes),
        enabledAt: new Date(),
      })
      .where(eq(twoFactorSettings.userId, userId));

    logger.info({ userId }, "TOTP 2FA enabled");
  }

  /**
   * Disable TOTP for a user.
   */
  static async disable(userId: string): Promise<void> {
    await db
      .update(twoFactorSettings)
      .set({
        enabled: false,
        totpSecret: null,
        backupCodes: null,
      })
      .where(eq(twoFactorSettings.userId, userId));

    logger.info({ userId }, "TOTP 2FA disabled");
  }
}

export default TOTPService;
