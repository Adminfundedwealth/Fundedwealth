import { Router, Request, Response } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { users, kycProfiles, kycDocuments, kycReviews, auditLogs } from "@workspace/db";
import { eq, desc, and, inArray, sql } from "drizzle-orm";
import { supabaseAdmin } from "../lib/supabase";
import { logger } from "../lib/logger";
import { rateLimit } from "../lib/rate-limit";
import { sendKycStatusEmail, sendKycApprovedEmail, sendKycRejectedEmail } from "../lib/email";
import { KycDuplicateService } from "../lib/kyc-duplicate-service";
import { AdminEventService } from "../lib/admin-event-service";

const router = Router();
const kycUploadRateLimit = rateLimit(5, 60); // 5 uploads per minute

// ── Allowed document types for India KYC ──────────────────────────────────────
const REQUIRED_DOC_TYPES = ["PAN", "AADHAR_FRONT", "AADHAR_BACK"] as const;
type DocType = typeof REQUIRED_DOC_TYPES[number];

// ── Check if user has at least one active Challenge or Instant Funding account ─
async function hasActiveAccount(userId: string): Promise<boolean> {
  try {
    // Resolve terminal_traders.id for this user
    const traderRes = await db.execute(sql`
      SELECT id FROM terminal_traders WHERE external_id = ${userId} LIMIT 1
    `);
    const traderId = (traderRes.rows as any[])[0]?.id ?? null;
    if (!traderId) return false;

    // Check for any non-inactive trading account
    const accountRes = await db.execute(sql`
      SELECT 1
      FROM trading_accounts ta
      WHERE ta.trader_id = ${traderId}::uuid
        AND ta.status != 'inactive'
      LIMIT 1
    `);
    return (accountRes.rows as any[]).length > 0;
  } catch (err) {
    logger.error({ err }, "hasActiveAccount check failed");
    return false;
  }
}

// ============================================
// USER KYC ROUTES
// ============================================

/**
 * GET /api/kyc/eligibility
 * Check whether this user may access KYC (has ≥1 active account).
 */
router.get("/eligibility", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.clerkId, auth.userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const eligible = await hasActiveAccount(String(user.id));
    return res.json({ eligible });
  } catch (error) {
    logger.error({ error }, "Error checking KYC eligibility");
    return res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/kyc/start
 * Initialize KYC profile for user
 */
router.post("/start", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Require at least one active account before KYC can be started
    const eligible = await hasActiveAccount(String(user.id));
    if (!eligible) {
      return res.status(403).json({
        error: "KYC_NO_ACCOUNT",
        message:
          "KYC verification becomes available after your first Challenge or Instant Funding account is activated.",
      });
    }

    // Check if profile already exists
    const [existingProfile] = await db
      .select()
      .from(kycProfiles)
      .where(eq(kycProfiles.userId, user.id));

    if (existingProfile) {
      return res.json({ profile: existingProfile, message: "KYC profile already exists" });
    }

    // Create new profile
    const [profile] = await db
      .insert(kycProfiles)
      .values({
        userId: user.id,
        fullName: "",
        dateOfBirth: "",
        country: "",
        phone: user.phone || "",
        address: "",
        status: "NOT_STARTED",
        verificationLevel: 0,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      })
      .returning();

    res.json({ profile, message: "KYC profile created" });
  } catch (error) {
    logger.error({ error }, "Error starting KYC");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/kyc/status
 * Get user's KYC profile status
 */
router.get("/status", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [profile] = await db
      .select()
      .from(kycProfiles)
      .where(eq(kycProfiles.userId, user.id));

    const documents = await db
      .select()
      .from(kycDocuments)
      .where(and(eq(kycDocuments.userId, user.id), eq(kycDocuments.isLatestVersion, true)));

    res.json({
      profile: profile || null,
      documents,
      user: {
        id: user.id,
        email: user.email,
        kycStatus: user.kycStatus,
      },
    });
  } catch (error) {
    logger.error({ error }, "Error fetching KYC status");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PATCH /api/kyc/profile
 * Update KYC profile information
 */
router.patch("/profile", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const {
      fullName,
      dateOfBirth,
      country,
      countryCode,
      phone,
      address,
      addressCity,
      addressState,
      addressPostalCode,
    } = req.body;

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const [profile] = await db
      .select()
      .from(kycProfiles)
      .where(eq(kycProfiles.userId, user.id));

    if (!profile) {
      return res.status(404).json({ error: "KYC profile not found" });
    }

    // Only allow updates if status is NOT_STARTED or RESUBMISSION_REQUIRED or ADDITIONAL_DOCS_REQUIRED
    if (
      profile.status !== "NOT_STARTED" &&
      profile.status !== "RESUBMISSION_REQUIRED" &&
      profile.status !== "ADDITIONAL_DOCS_REQUIRED" &&
      profile.status !== "REJECTED"
    ) {
      return res
        .status(400)
        .json({ error: "Cannot update profile in current status", status: profile.status });
    }

    const [updated] = await db
      .update(kycProfiles)
      .set({
        fullName: fullName || profile.fullName,
        dateOfBirth: dateOfBirth || profile.dateOfBirth,
        country: country || profile.country,
        countryCode: countryCode || profile.countryCode,
        phone: phone || profile.phone,
        address: address || profile.address,
        addressCity: addressCity || profile.addressCity,
        addressState: addressState || profile.addressState,
        addressPostalCode: addressPostalCode || profile.addressPostalCode,
        updatedAt: new Date(),
      })
      .where(eq(kycProfiles.id, profile.id))
      .returning();

    res.json({ profile: updated, message: "Profile updated successfully" });
  } catch (error) {
    logger.error({ error }, "Error updating KYC profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/kyc/upload
 * Upload KYC documents to Supabase Storage
 */
router.post(
  "/upload",
  kycUploadRateLimit,
  async (req: Request, res: Response) => {
    try {
      const auth = getAuth(req);
      if (!auth?.userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      if (!supabaseAdmin) {
        return res.status(500).json({ error: "File storage not configured" });
      }

      const { documentType, fileBase64, fileName, mimeType } = req.body;

      if (!documentType || !fileBase64 || !fileName) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate document type
      const allowedDocTypes = ["PAN", "AADHAR_FRONT", "AADHAR_BACK"];
      if (!allowedDocTypes.includes(documentType)) {
        return res.status(400).json({
          error: `Invalid document type. Allowed: ${allowedDocTypes.join(", ")}`,
        });
      }

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, auth.userId));

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Enforce account eligibility
      const eligible = await hasActiveAccount(String(user.id));
      if (!eligible) {
        return res.status(403).json({
          error: "KYC_NO_ACCOUNT",
          message:
            "KYC verification becomes available after your first Challenge or Instant Funding account is activated.",
        });
      }

      const [profile] = await db
        .select()
        .from(kycProfiles)
        .where(eq(kycProfiles.userId, user.id));

      if (!profile) {
        return res.status(404).json({ error: "KYC profile not found" });
      }

      // Validate file
      const buffer = Buffer.from(fileBase64, "base64");
      const maxFileSize = 5 * 1024 * 1024; // 5 MB per requirements

      if (buffer.length > maxFileSize) {
        return res.status(400).json({ error: "File too large (max 5 MB)" });
      }

      // Validate file type — JPG, PNG, PDF only
      const allowedMimeTypes = ["image/png", "image/jpeg", "application/pdf"];
      if (mimeType && !allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({ error: "Invalid file type. Allowed: JPG, PNG, PDF" });
      }

      // ── DUPLICATE DOCUMENT HASH CHECK ──────────────────────────────
      const docHash = KycDuplicateService.hashDocument(buffer);
      const hashCheck = await KycDuplicateService.checkDocumentHash(docHash, user.id);
      if (hashCheck.isDuplicate) {
        logger.warn(
          { userId: user.id, duplicateUserId: hashCheck.duplicateUserId, documentType },
          "Duplicate document upload rejected"
        );
        return res.status(409).json({
          error: "This document file is already registered on another account.",
          code: "DUPLICATE_DOCUMENT",
        });
      }

      // Upload to Supabase Storage
      const storagePath = `kyc/${user.id}/${documentType}/${Date.now()}-${fileName}`;
      const { data, error: uploadError } = await supabaseAdmin.storage
        .from("kyc-documents")
        .upload(storagePath, buffer, {
          contentType: mimeType || "application/octet-stream",
        });

      if (uploadError) {
        logger.error({ error: uploadError }, "Supabase upload error");
        return res.status(500).json({ error: "Failed to upload file" });
      }

      // Get signed URL
      const { data: signedUrlData } = await supabaseAdmin.storage
        .from("kyc-documents")
        .createSignedUrl(storagePath, 60 * 60 * 24 * 365); // 1 year

      const fileUrl = signedUrlData?.signedUrl || data.path;

      // Check for existing document of same type
      const existingDoc = await db
        .select()
        .from(kycDocuments)
        .where(
          and(
            eq(kycDocuments.kycProfileId, profile.id),
            eq(kycDocuments.documentType, documentType),
            eq(kycDocuments.isLatestVersion, true)
          )
        )
        ;

      // Mark old version as non-latest if exists
      if (existingDoc.length > 0) {
        await db
          .update(kycDocuments)
          .set({ isLatestVersion: false })
          .where(
            and(
              eq(kycDocuments.kycProfileId, profile.id),
              eq(kycDocuments.documentType, documentType)
            )
          );
      }

      // Create document record
      const [document] = await db
        .insert(kycDocuments)
        .values({
          userId: user.id,
          kycProfileId: profile.id,
          documentType,
          documentFrontUrl: fileUrl,
          mimeType,
          fileSize: buffer.length,
          documentHash: docHash,
          verificationStatus: "PENDING",
          uploadedAt: new Date(),
          isLatestVersion: true,
          version: (existingDoc[0]?.version ?? 0) + 1,
        })
        .returning();

      res.json({
        document,
        fileUrl,
        message: "Document uploaded successfully",
      });
    } catch (error) {
      logger.error({ error }, "Error uploading KYC document");
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

/**
 * PATCH /api/kyc/submit
 * Submit KYC for review
 */
router.patch("/submit", async (req: Request, res: Response) => {
  try {
    const auth = getAuth(req);
    if (!auth?.userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, auth.userId));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Enforce account eligibility before submission
    const eligible = await hasActiveAccount(String(user.id));
    if (!eligible) {
      return res.status(403).json({
        error: "KYC_NO_ACCOUNT",
        message:
          "KYC verification becomes available after your first Challenge or Instant Funding account is activated.",
      });
    }

    const [profile] = await db
      .select()
      .from(kycProfiles)
      .where(eq(kycProfiles.userId, user.id));

    if (!profile) {
      return res.status(404).json({ error: "KYC profile not found" });
    }

    // Block re-submission when already pending/approved
    const nonResubmittableStatuses = ["PENDING", "UNDER_REVIEW", "APPROVED"];
    if (nonResubmittableStatuses.includes(profile.status)) {
      return res.status(400).json({
        error: "Cannot submit in current status",
        status: profile.status,
        message:
          profile.status === "APPROVED"
            ? "Your KYC is already approved."
            : "Your KYC is already under review.",
      });
    }

    // Validate required fields
    if (!profile.fullName || !profile.dateOfBirth || !profile.country || !profile.address) {
      return res.status(400).json({ error: "Please complete all required fields" });
    }

    // Validate all three required documents are uploaded
    const documents = await db
      .select()
      .from(kycDocuments)
      .where(
        and(
          eq(kycDocuments.kycProfileId, profile.id),
          eq(kycDocuments.isLatestVersion, true)
        )
      );

    const uploadedTypes = new Set(documents.map((d) => d.documentType));
    const missingDocs = (["PAN", "AADHAR_FRONT", "AADHAR_BACK"] as const).filter(
      (t) => !uploadedTypes.has(t)
    );

    if (missingDocs.length > 0) {
      return res.status(400).json({
        error: "Missing required documents",
        missing: missingDocs,
        message: `Please upload: ${missingDocs.join(", ")}`,
      });
    }

    // Update profile status
    const [updated] = await db
      .update(kycProfiles)
      .set({
        status: "PENDING",
        submittedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(kycProfiles.id, profile.id))
      .returning();

    // Update user KYC status
    await db
      .update(users)
      .set({ kycStatus: "pending" })
      .where(eq(users.id, user.id));

    // Log audit
    await db.insert(auditLogs).values({
      adminId: 0, // user-initiated, no admin integer ID available
      action: "KYC_SUBMITTED",
      entity: "kyc_profile",
      entityId: profile.id.toString(),
      ipAddress: req.ip || null,
      userAgent: (req.headers["user-agent"] as string) || null,
    });

    // Send email notification
    if (user.email) {
      sendKycStatusEmail(
        profile.fullName,
        user.email,
        "Your KYC has been submitted for review"
      ).catch((err) => logger.error({ error: err }, "Failed to send KYC email"));
    }

    // Notify admin panel of KYC submission
    AdminEventService.notifyKycSubmitted({
      userId: user.id,
      submissionId: profile.id.toString(),
    }).catch(() => {});

    res.json({ profile: updated, message: "KYC submitted for review" });
  } catch (error) {
    logger.error({ error }, "Error submitting KYC");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
