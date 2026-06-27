import { z } from "zod";
import { logger } from "./logger";

export class ValidationService {
  // Email validation
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 255;
  }

  // Password validation - strong password requirements
  static validatePassword(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 12) {
      errors.push("Password must be at least 12 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Phone validation
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\D/g, ""));
  }

  // URL validation
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Numeric ID validation
  static validateNumericId(id: string | number): boolean {
    const num = Number(id);
    return Number.isInteger(num) && num > 0;
  }

  // File size validation (in MB)
  static validateFileSize(sizeInBytes: number, maxSizeMb: number): boolean {
    return sizeInBytes <= maxSizeMb * 1024 * 1024;
  }

  // File type validation
  static validateFileType(
    filename: string,
    allowedTypes: string[],
  ): boolean {
    const ext = filename.split(".").pop()?.toLowerCase();
    return ext ? allowedTypes.includes(ext) : false;
  }

  // KYC document validation
  static validateKycDocument(file: {
    name: string;
    size: number;
    type: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const allowedTypes = ["pdf", "jpg", "jpeg", "png"];
    if (
      !this.validateFileType(file.name, allowedTypes)
    ) {
      errors.push(
        `Invalid file type. Allowed: ${allowedTypes.join(", ")}`,
      );
    }

    if (!this.validateFileSize(file.size, 10)) {
      errors.push("File size cannot exceed 10MB");
    }

    const maxDimensions = { width: 4000, height: 4000 };
    // Note: Actual image dimension validation would need to be done server-side with image library

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Payout request validation
  static validatePayoutRequest(data: {
    amount: number;
    bankAccount?: string;
    upiId?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!Number.isFinite(data.amount) || data.amount <= 0) {
      errors.push("Payout amount must be positive number");
    }

    if (data.amount > 1000000) {
      errors.push("Payout amount exceeds maximum limit");
    }

    if (!data.bankAccount && !data.upiId) {
      errors.push("Bank account or UPI ID required");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Affiliate code validation
  static validateAffiliateCode(code: string): boolean {
    // Alphanumeric, 5-10 chars
    return /^[A-Z0-9]{5,10}$/i.test(code);
  }

  // Trading account validation
  static validateTradingAccountId(accountId: string): boolean {
    return /^[A-Z0-9]{8,20}$/.test(accountId);
  }

  // Certificate validation
  static validateCertificateId(certId: string): boolean {
    return /^CERT-[0-9]{10}$/i.test(certId);
  }

  // Referral code validation
  static validateReferralCode(code: string): boolean {
    return /^[A-Z0-9]{6,8}$/i.test(code);
  }

  // Sanitize input to prevent XSS
  static sanitizeInput(input: string): string {
    return input
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  }

  // Validate and normalize email
  static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  // Validate request payload size
  static validatePayloadSize(
    payload: unknown,
    maxSizeBytes: number = 1024 * 1024,
  ): boolean {
    try {
      const size = JSON.stringify(payload).length;
      return size <= maxSizeBytes;
    } catch {
      return false;
    }
  }

  // Comprehensive user registration validation
  static validateRegistration(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email
    if (!this.validateEmail(data.email)) {
      errors.push("Invalid email format");
    }

    // Password
    const passwordValidation = this.validatePassword(data.password);
    if (!passwordValidation.valid) {
      errors.push(...passwordValidation.errors);
    }

    // Names
    if (!data.firstName || data.firstName.trim().length < 2) {
      errors.push("First name must be at least 2 characters");
    }

    if (!data.lastName || data.lastName.trim().length < 2) {
      errors.push("Last name must be at least 2 characters");
    }

    // Phone (optional but if provided, must be valid)
    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push("Invalid phone number");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // IP address validation
  static validateIpAddress(ip: string): boolean {
    const ipv4Regex =
      /^(\d{1,3}\.){3}\d{1,3}$|^(::)?([0-9a-fA-F]{0,4}:){1,7}[0-9a-fA-F]{0,4}$/;
    return ipv4Regex.test(ip);
  }

  // Risk score validation (0-100)
  static validateRiskScore(score: number): boolean {
    return Number.isFinite(score) && score >= 0 && score <= 100;
  }

  // Severity level validation
  static validateSeverity(severity: string): boolean {
    return ["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(
      severity.toUpperCase(),
    );
  }

  // Status validation
  static validateStatus(
    status: string,
    validStatuses: string[],
  ): boolean {
    return validStatuses.includes(status.toUpperCase());
  }

  // Create Zod schema for common validations
  static schemas = {
    email: z
      .string()
      .email()
      .max(255),
    password: z
      .string()
      .min(12)
      .regex(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
        "Password must contain uppercase, lowercase, number, and special character",
      ),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/),
    userId: z
      .number()
      .int()
      .positive(),
    fileSize: (maxMb: number) =>
      z
        .number()
        .max(maxMb * 1024 * 1024),
    url: z
      .string()
      .url(),
    riskScore: z
      .number()
      .min(0)
      .max(100),
  };
}
