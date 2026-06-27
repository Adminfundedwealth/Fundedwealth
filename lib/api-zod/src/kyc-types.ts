/**
 * KYC System Type Definitions
 * Comprehensive TypeScript types for KYC system
 */

// Status Types
export type KYCStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED"
  | "RESUBMISSION_REQUIRED";

export type VerificationStatus = "PENDING" | "VERIFIED" | "REJECTED";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type AdminAction = "APPROVED" | "REJECTED" | "RESUBMISSION_REQUESTED" | "NOTES_ADDED";

export type DocumentType =
  | "PASSPORT"
  | "PAN"
  | "AADHAR"
  | "DRIVING_LICENSE"
  | "NATIONAL_ID"
  | "BANK_STATEMENT"
  | "UTILITY_BILL"
  | "SELFIE";

// KYC Profile
export interface KYCProfile {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth: string;
  country: string;
  countryCode?: string;
  phone: string;
  address: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;

  // Status
  status: KYCStatus;
  verificationLevel: number;

  // Risk
  riskScore: number;
  riskLevel: RiskLevel;
  riskFlags: string[];

  // Timeline
  submittedAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
  expiresAt?: Date;

  // Admin
  reviewedBy?: number;
  reviewNotes?: string;
  rejectionReason?: string;
  resubmissionCount: number;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// KYC Document
export interface KYCDocument {
  id: number;
  userId: number;
  kycProfileId: number;

  // Document
  documentType: DocumentType;
  documentNumber?: string;
  documentFrontUrl?: string;
  documentBackUrl?: string;

  // File
  mimeType?: string;
  fileSize?: number;
  fileResolution?: string;

  // Verification
  verificationStatus: VerificationStatus;
  verificationNotes?: string;

  // Validity
  expiryDate?: Date;
  isExpired: boolean;

  // Quality
  isBlurred: boolean;
  isLegible: boolean;
  qualityScore?: number;

  // Face
  faceDetected?: boolean;
  faceMatch?: boolean;
  faceMatchScore?: number;

  // Version
  version: number;
  isLatestVersion: boolean;

  // Timeline
  uploadedAt: Date;
  verifiedAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// KYC Review
export interface KYCReview {
  id: number;
  adminId: number;
  userId: number;

  // Action
  action: AdminAction;
  reason?: string;
  notes?: string;

  // Risk
  riskScore?: number;
  riskLevel?: RiskLevel;
  riskFactors?: string[];

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// API Request/Response Types
export interface StartKYCResponse {
  profile: KYCProfile;
  message: string;
}

export interface KYCStatusResponse {
  profile: KYCProfile | null;
  documents: KYCDocument[];
  user: {
    id: number;
    email: string;
    kycStatus: string;
  };
}

export interface UpdateProfileRequest {
  fullName?: string;
  dateOfBirth?: string;
  country?: string;
  countryCode?: string;
  phone?: string;
  address?: string;
  addressCity?: string;
  addressState?: string;
  addressPostalCode?: string;
}

export interface UploadDocumentRequest {
  documentType: DocumentType;
  fileBase64: string;
  fileName: string;
  mimeType: string;
}

export interface UploadDocumentResponse {
  document: KYCDocument;
  fileUrl: string;
  message: string;
}

export interface ApproveKYCRequest {
  notes?: string;
}

export interface RejectKYCRequest {
  reason: string;
  notes?: string;
}

export interface RequestResubmissionRequest {
  reason: string;
}

export interface AdminKYCFilters {
  status?: KYCStatus;
  riskLevel?: RiskLevel;
  country?: string;
  page?: number;
  limit?: number;
}

export interface PendingKYCItem {
  profile: KYCProfile;
  user: {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  };
  documents: KYCDocument[];
}

export interface PendingKYCResponse {
  data: PendingKYCItem[];
  pagination: {
    page: number;
    limit: number;
  };
}

export interface KYCAnalytics {
  total: number;
  pending: number;
  underReview: number;
  approved: number;
  rejected: number;
  resubmissionRequired: number;
  expired: number;
  highRisk: number;
  approvalRate: number | string;
}

// Fraud Detection Types
export interface RiskFlags {
  multipleAccounts?: boolean;
  vpnDetected?: boolean;
  referralAbuse?: boolean;
  countryMismatch?: boolean;
  duplicateDocuments?: boolean;
  blurredDocuments?: boolean;
  expiredDocuments?: boolean;
  lowQualityDocuments?: boolean;
  faceMatchFailure?: boolean;
}

export interface RiskScoreResult {
  score: number;
  level: RiskLevel;
  flags: string[];
}

export interface DocumentQualityResult {
  isValid: boolean;
  issues: string[];
  qualityScore: number;
}

export interface FakeImageDetectionResult {
  isFake: boolean;
  confidence: number;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingUserId?: number;
}

// Email Types
export type KYCEmailStatus = "submitted" | "approved" | "rejected";

// Component Props
export interface KYCFlowProps {}

export interface DocumentUploadProps {
  documentType: string;
  title: string;
  description: string;
  acceptedTypes: DocumentType[];
}

export interface AdminKYCDashboardProps {}

export interface KYCStatusProps {}

// Utility Types
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total?: number;
  hasMore?: boolean;
}

// Error Handling
export interface KYCError {
  code: string;
  message: string;
  status: number;
}

export const KYC_ERROR_CODES = {
  PROFILE_NOT_FOUND: "PROFILE_NOT_FOUND",
  INVALID_STATUS: "INVALID_STATUS",
  MISSING_DOCUMENTS: "MISSING_DOCUMENTS",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  INVALID_FILE: "INVALID_FILE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  ALREADY_APPROVED: "ALREADY_APPROVED",
  RESUBMISSION_LIMIT_EXCEEDED: "RESUBMISSION_LIMIT_EXCEEDED",
} as const;

// Constant Definitions
export const VERIFICATION_LEVELS = {
  NONE: 0,
  BASIC: 1,
  ADDRESS: 2,
  FULL: 3,
  ENHANCED: 4,
} as const;

export const RISK_SCORE_RANGES = {
  LOW: { min: 0, max: 30 },
  MEDIUM: { min: 31, max: 70 },
  HIGH: { min: 71, max: 100 },
} as const;

export const DOCUMENT_TYPES_BY_CATEGORY = {
  identity: ["PASSPORT", "PAN", "AADHAR", "DRIVING_LICENSE", "NATIONAL_ID"],
  address: ["BANK_STATEMENT", "UTILITY_BILL"],
  selfie: ["SELFIE"],
} as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
] as const;

export const KYC_EXPIRY_MONTHS = 12;
export const MAX_RESUBMISSION_ATTEMPTS = 3;

// Rate Limiting
export const RATE_LIMITS = {
  UPLOAD: { requests: 5, window: 60 }, // 5 requests per minute
  SUBMIT: { requests: 1, window: 3600 }, // 1 request per hour
} as const;
