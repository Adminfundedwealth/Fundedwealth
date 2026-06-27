/**
 * AWS S3 Storage Service
 * Handles file uploads for KYC, profiles, community, and blog images.
 * 
 * Required env vars:
 * - AWS_ACCESS_KEY_ID
 * - AWS_SECRET_ACCESS_KEY
 * - AWS_S3_BUCKET (e.g., "fundedwealth-uploads")
 * - AWS_S3_REGION (e.g., "ap-south-1")
 */

import { randomUUID } from "crypto";

const S3_BUCKET = process.env.AWS_S3_BUCKET || "fundedwealth-uploads";
const S3_REGION = process.env.AWS_S3_REGION || "ap-south-1";
const S3_BASE_URL = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com`;

// For now, we use pre-signed URL generation via the Supabase storage
// or direct S3 SDK. This module provides the interface.

export interface UploadResult {
    url: string;
    key: string;
    bucket: string;
}

export type UploadCategory = "kyc" | "profile" | "community" | "blog";

/**
 * Generate the S3 key for an upload based on category and user.
 */
export function generateS3Key(
    category: UploadCategory,
    userId: string,
    filename: string
): string {
    const ext = filename.split(".").pop() || "bin";
    const uniqueId = randomUUID();
    return `${category}/${userId}/${uniqueId}.${ext}`;
}

/**
 * Get the public URL for an S3 object.
 */
export function getS3Url(key: string): string {
    return `${S3_BASE_URL}/${key}`;
}

/**
 * Generate upload parameters for client-side direct upload.
 * In production, use AWS SDK to generate pre-signed URLs.
 */
export function getUploadConfig() {
    return {
        bucket: S3_BUCKET,
        region: S3_REGION,
        baseUrl: S3_BASE_URL,
    };
}

export default {
    generateS3Key,
    getS3Url,
    getUploadConfig,
};
