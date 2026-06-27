/**
 * AES-256-GCM Encryption Service
 *
 * Used for encrypting sensitive financial data at rest:
 * - Bank account numbers
 * - UPI IDs
 * - IFSC codes
 *
 * Key derivation: ENCRYPTION_KEY env var (64-char hex = 32 bytes)
 * Algorithm: AES-256-GCM with 12-byte random IV and 16-byte auth tag
 * Format: base64(iv + authTag + ciphertext)
 */

import crypto from "crypto";
import { logger } from "./logger";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;
const ENCODING: BufferEncoding = "base64";

function getEncryptionKey(): Buffer {
  const keyHex = process.env.ENCRYPTION_KEY;
  if (!keyHex || keyHex.length !== 64) {
    throw new Error(
      "ENCRYPTION_KEY must be a 64-character hex string (32 bytes). " +
        "Generate with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"",
    );
  }
  return Buffer.from(keyHex, "hex");
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns a base64-encoded string containing: IV + AuthTag + Ciphertext
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return "";

  try {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);

    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    // Pack: IV (12) + AuthTag (16) + Ciphertext (variable)
    const packed = Buffer.concat([iv, authTag, encrypted]);
    return packed.toString(ENCODING);
  } catch (error: any) {
    logger.error({ error: error.message }, "Encryption failed — ENCRYPTION_KEY may not be configured");
    // In development without key, return plaintext (log warning)
    if (process.env.NODE_ENV !== "production") return plaintext;
    throw new Error("Encryption failed — ENCRYPTION_KEY must be configured in production");
  }
}

/**
 * Decrypt a base64-encoded AES-256-GCM ciphertext.
 * Input format: base64(IV + AuthTag + Ciphertext)
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext) return "";

  try {
    const key = getEncryptionKey();
    const packed = Buffer.from(ciphertext, ENCODING);

    if (packed.length < IV_LENGTH + AUTH_TAG_LENGTH + 1) {
      // Not encrypted data — return as-is (migration compatibility)
      return ciphertext;
    }

    const iv = packed.subarray(0, IV_LENGTH);
    const authTag = packed.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = packed.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  } catch (error: any) {
    // If decryption fails, the data might be unencrypted (pre-migration)
    logger.warn(
      { error: error.message },
      "Decryption failed — data may be unencrypted (pre-migration)",
    );
    return ciphertext;
  }
}

/**
 * Mask a sensitive value for display (e.g., "****1234")
 */
export function maskValue(value: string | null | undefined, visibleChars: number = 4): string {
  if (!value) return "";
  const decrypted = isEncrypted(value) ? decrypt(value) : value;
  if (decrypted.length <= visibleChars) return "****";
  return "****" + decrypted.slice(-visibleChars);
}

/**
 * Check if a value appears to be encrypted (base64 with sufficient length)
 */
export function isEncrypted(value: string): boolean {
  if (!value || value.length < 40) return false; // Minimum: 12 IV + 16 tag + 1 byte = 29 bytes → ~40 base64 chars
  try {
    const buf = Buffer.from(value, "base64");
    return buf.length >= IV_LENGTH + AUTH_TAG_LENGTH + 1;
  } catch {
    return false;
  }
}

/**
 * Encrypt financial fields of a user object (mutates in place).
 * Call before DB insert/update.
 */
export function encryptFinancialFields(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ["upiId", "bankAccountNumber", "bankIfscCode", "bankAccountName"];
  for (const field of sensitiveFields) {
    if (data[field] && typeof data[field] === "string" && !isEncrypted(data[field])) {
      data[field] = encrypt(data[field]);
    }
  }
  return data;
}

/**
 * Encrypt KYC-sensitive fields.
 */
export function encryptKycFields(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ["panNumber", "aadhaarNumber", "documentNumber", "fullName", "dateOfBirth", "address"];
  for (const field of sensitiveFields) {
    if (data[field] && typeof data[field] === "string" && !isEncrypted(data[field])) {
      data[field] = encrypt(data[field]);
    }
  }
  return data;
}

/**
 * Encrypt a single sensitive value if not already encrypted.
 */
export function encryptIfNeeded(value: string | null | undefined): string | null {
  if (!value) return null;
  if (isEncrypted(value)) return value;
  return encrypt(value);
}

/**
 * Decrypt financial fields of a user object for internal use.
 * Call after DB read when processing payouts.
 */
export function decryptFinancialFields(data: Record<string, any>): Record<string, any> {
  const sensitiveFields = ["upiId", "bankAccountNumber", "bankIfscCode", "bankAccountName"];
  for (const field of sensitiveFields) {
    if (data[field] && typeof data[field] === "string") {
      data[field] = decrypt(data[field]);
    }
  }
  return data;
}

/**
 * Mask financial fields for API response (never send raw values to frontend).
 */
export function maskFinancialFields(data: Record<string, any>): Record<string, any> {
  const result = { ...data };
  if (result.bankAccountNumber) {
    result.bankAccountNumber = maskValue(result.bankAccountNumber);
  }
  if (result.upiId) {
    const decrypted = isEncrypted(result.upiId) ? decrypt(result.upiId) : result.upiId;
    // Show first part + masked domain: "abc****@ybl"
    const parts = decrypted.split("@");
    result.upiId = parts.length === 2
      ? maskValue(parts[0], 3) + "@" + parts[1]
      : maskValue(decrypted);
  }
  if (result.bankIfscCode) {
    result.bankIfscCode = maskValue(result.bankIfscCode, 4);
  }
  return result;
}

export const EncryptionService = {
  encrypt,
  decrypt,
  maskValue,
  isEncrypted,
  encryptFinancialFields,
  decryptFinancialFields,
  maskFinancialFields,
};
