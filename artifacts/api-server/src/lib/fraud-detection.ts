import { db } from "@workspace/db";
import { kycProfiles, kycDocuments } from "@workspace/db";
import { eq, and } from "drizzle-orm";

export interface RiskFlags {
  multipleAccounts?: boolean;
  vpnDetected?: boolean;
  referralAbuse?: boolean;
  countryMismatch?: boolean;
  duplicateDocuments?: boolean;
  blurredDocuments?: boolean;
  expiredDocuments?: boolean;
}

/**
 * Calculate risk score for a KYC profile
 * Risk Score: 0-100
 * Low Risk: 0-30
 * Medium Risk: 31-70
 * High Risk: 71-100
 */
export async function calculateRiskScore(
  userId: string,
  profileData: any
): Promise<{ score: number; level: string; flags: string[] }> {
  let score = 0;
  const flags: string[] = [];

  // Check for multiple accounts with same email/phone
  // (In production, integrate with external verification services)

  // VPN/Proxy detection would require IP geolocation service
  // Skip for MVP, add in Phase 5

  // Check for duplicate documents
  const documents = await db
    .select()
    .from(kycDocuments)
    .where(and(eq(kycDocuments.userId, userId), eq(kycDocuments.isLatestVersion, true)));

  // Check for blurred or low-quality documents
  const blurredDocs = documents.filter((d) => d.isBlurred);
  if (blurredDocs.length > 0) {
    score += 15;
    flags.push("blurred_documents");
  }

  // Check for expired documents
  const expiredDocs = documents.filter((d) => {
    if (!d.expiryDate) return false;
    return new Date(d.expiryDate) < new Date();
  });

  if (expiredDocs.length > 0) {
    score += 20;
    flags.push("expired_documents");
  }

  // Country mismatch checks (basic)
  // Compare profile country with document country (if available)
  // Skip for MVP

  // Document quality scoring
  const lowQualityDocs = documents.filter((d) => d.qualityScore && d.qualityScore < 50);
  if (lowQualityDocs.length > 0) {
    score += 10;
    flags.push("low_quality_documents");
  }

  // Face matching failures
  const faceMatchFailures = documents.filter(
    (d) => d.documentType === "SELFIE" && d.faceMatch === false
  );
  if (faceMatchFailures.length > 0) {
    score += 25;
    flags.push("face_match_failure");
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine risk level
  let riskLevel = "LOW";
  if (score > 70) {
    riskLevel = "HIGH";
  } else if (score > 30) {
    riskLevel = "MEDIUM";
  }

  return { score, level: riskLevel, flags };
}

/**
 * Validate document quality
 * Checks for blurriness, legibility, and resolution
 */
export async function validateDocumentQuality(
  documentBuffer: Buffer,
  documentType: string
): Promise<{ isValid: boolean; issues: string[]; qualityScore: number }> {
  const issues: string[] = [];
  let qualityScore = 100;

  // In production, use ML models like:
  // - TensorFlow.js for blur detection
  // - Google Vision API for document validation
  // - AWS Rekognition for face detection

  // For MVP, perform basic validations
  if (documentBuffer.length < 50000) {
    // Less than 50KB
    issues.push("File too small - may be low resolution");
    qualityScore -= 20;
  }

  if (documentBuffer.length > 15 * 1024 * 1024) {
    // More than 15MB
    issues.push("File too large");
    qualityScore -= 10;
  }

  return {
    isValid: issues.length === 0,
    issues,
    qualityScore: Math.max(qualityScore, 0),
  };
}

/**
 * Detect fake/AI-generated photos
 * In production, integrate with services like:
 * - AWS Rekognition
 * - Microsoft Azure Face API
 * - Truepic
 */
export async function detectFakeImage(
  imageBuffer: Buffer
): Promise<{ isFake: boolean; confidence: number }> {
  // MVP: Return false
  // Phase 5: Integrate with face detection service
  return { isFake: false, confidence: 0 };
}

/**
 * Check for duplicate documents across the platform
 * In production, hash documents and check against DB
 */
export async function checkDuplicateDocuments(
  documentBuffer: Buffer
): Promise<{ isDuplicate: boolean; existingUserId?: number }> {
  // MVP: Skip
  // Phase 5: Implement document hashing and deduplication
  return { isDuplicate: false };
}
