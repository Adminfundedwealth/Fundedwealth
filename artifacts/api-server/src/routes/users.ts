import { Router } from "express";
import { getAuth } from "../middlewares/supabaseAuth";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { PaymentFingerprintService } from "../lib/payment-fingerprint-service";
import { EncryptionService } from "../lib/encryption-service";
import { validateBody } from "../lib/api-security";
import { z } from "zod";

const router = Router();

const AUTO_ADMIN_EMAILS: string[] = []; // SECURITY: Auto-admin promotion removed. Assign roles via DB only.

router.get("/me", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  // First try by Supabase ID (clerkId column stores the auth provider's user ID)
  let [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));

  // If not found by ID, try linking by email (migration from Clerk → Supabase)
  if (!user && auth.email) {
    const [byEmail] = await db.select().from(users).where(eq(users.email, auth.email));
    if (byEmail) {
      // Auto-link: update the old Clerk ID to new Supabase ID
      try {
        const updated = await db
          .update(users)
          .set({ clerkId: auth.userId, updatedAt: new Date() })
          .where(eq(users.id, byEmail.id))
          .returning();
        user = updated[0] ?? byEmail;
      } catch {
        user = byEmail;
      }
    }
  }

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json(user);
});

router.post("/me", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const { email, firstName, lastName, phone, city, state, avatarUrl } = req.body;

  // Try to find by Supabase ID first
  let [existing] = await db.select().from(users).where(eq(users.clerkId, auth.userId));

  // If not found, try linking by email (Clerk → Supabase migration)
  if (!existing && (email || auth.email)) {
    const lookupEmail = email || auth.email;
    const [byEmail] = await db.select().from(users).where(eq(users.email, lookupEmail));
    if (byEmail) {
      // Auto-link existing user to new Supabase ID
      try {
        const updated = await db
          .update(users)
          .set({ clerkId: auth.userId, updatedAt: new Date() })
          .where(eq(users.id, byEmail.id))
          .returning();
        existing = updated[0] ?? byEmail;
      } catch {
        existing = byEmail;
      }
    }
  }

  const shouldBeAdmin = false; // SECURITY: Auto-admin removed. Roles assigned via DB only.

  if (existing) {
    const updateData: Record<string, any> = { email, firstName, lastName, phone, city, state, avatarUrl, updatedAt: new Date() };
    const [updated] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.clerkId, auth.userId))
      .returning();
    return res.json(updated);
  }

  const affiliateCode = `FW${auth.userId.slice(-6).toUpperCase()}`;
  const [created] = await db
    .insert(users)
    .values({
      clerkId: auth.userId,
      email: email || "",
      firstName,
      lastName,
      phone,
      city,
      state,
      avatarUrl,
      affiliateCode,
      referredBy: req.body.referredBy || null,
    })
    .returning();

  res.status(201).json(created);
});

router.get("/payment-details", async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const [user] = await db.select().from(users).where(eq(users.clerkId, auth.userId));
  if (!user) return res.status(404).json({ error: "User not found" });

  // SECURITY: Return masked financial data only — never expose full values to frontend
  const masked = EncryptionService.maskFinancialFields({
    upiId: user.upiId,
    bankAccountName: user.bankAccountName,
    bankAccountNumber: user.bankAccountNumber,
    bankIfscCode: user.bankIfscCode,
  });

  res.json({
    upiId: masked.upiId ?? null,
    bankAccountName: masked.bankAccountName ?? null,
    bankAccountNumber: masked.bankAccountNumber ?? null,
    bankIfscCode: masked.bankIfscCode ?? null,
    bankName: user.bankName ?? null,
    preferredPayoutMethod: user.preferredPayoutMethod ?? "UPI",
  });
});

const paymentDetailsSchema = z.object({
  upiId: z.string().max(100).optional(),
  bankAccountName: z.string().max(200).optional(),
  bankAccountNumber: z.string().max(30).optional(),
  bankIfscCode: z.string().max(11).optional(),
  bankName: z.string().max(100).optional(),
  preferredPayoutMethod: z.enum(["UPI", "Bank Transfer"]).optional(),
});

router.patch("/payment-details", validateBody(paymentDetailsSchema), async (req, res) => {
  const auth = getAuth(req);
  if (!auth?.userId) return res.status(401).json({ error: "Unauthorized" });

  const {
    upiId,
    bankAccountName,
    bankAccountNumber,
    bankIfscCode,
    bankName,
    preferredPayoutMethod,
  } = req.body;

  // Basic UPI format validation
  if (upiId && typeof upiId === "string") {
    const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    if (!upiRegex.test(upiId.trim())) {
      return res.status(400).json({ error: "Invalid UPI ID format. Example: name@upi" });
    }
  }

  // Basic IFSC validation
  if (bankIfscCode && typeof bankIfscCode === "string") {
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(bankIfscCode.trim().toUpperCase())) {
      return res.status(400).json({ error: "Invalid IFSC code format. Example: HDFC0001234" });
    }
  }

  const updateData: Record<string, any> = { updatedAt: new Date() };
  if (typeof upiId === "string") updateData.upiId = upiId.trim() || null;
  if (typeof bankAccountName === "string") updateData.bankAccountName = bankAccountName.trim() || null;
  if (typeof bankAccountNumber === "string") updateData.bankAccountNumber = bankAccountNumber.trim() || null;
  if (typeof bankIfscCode === "string") updateData.bankIfscCode = bankIfscCode.trim().toUpperCase() || null;
  if (typeof bankName === "string") updateData.bankName = bankName.trim() || null;
  if (typeof preferredPayoutMethod === "string" && ["UPI", "Bank Transfer"].includes(preferredPayoutMethod)) {
    updateData.preferredPayoutMethod = preferredPayoutMethod;
  }

  // SECURITY: Encrypt sensitive financial fields before storage
  EncryptionService.encryptFinancialFields(updateData);

  const [updated] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.clerkId, auth.userId))
    .returning();

  // Record payment fingerprints for fraud detection
  if (updated.upiId) {
    PaymentFingerprintService.record(updated.id as any, "upi", updated.upiId, "payment_details").catch(() => { });
  }
  if (updated.bankAccountNumber && updated.bankIfscCode) {
    PaymentFingerprintService.record(updated.id as any, "bank_account", `${updated.bankAccountNumber}:${updated.bankIfscCode}`, "payment_details").catch(() => { });
  }

  res.json({
    upiId: EncryptionService.maskValue(updated.upiId) || null,
    bankAccountName: EncryptionService.maskValue(updated.bankAccountName) || null,
    bankAccountNumber: EncryptionService.maskValue(updated.bankAccountNumber) || null,
    bankIfscCode: EncryptionService.maskValue(updated.bankIfscCode, 4) || null,
    bankName: updated.bankName ?? null,
    preferredPayoutMethod: updated.preferredPayoutMethod ?? "UPI",
  });
});

router.get("/leaderboard", async (_req, res) => {
  const topTraders = await db
    .select()
    .from(users)
    .where(eq(users.isActive, true))
    .orderBy(users.totalPayout)
    .limit(20);

  res.json(topTraders);
});

export default router;
