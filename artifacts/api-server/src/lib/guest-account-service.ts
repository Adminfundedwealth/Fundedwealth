/**
 * Guest Account Service
 *
 * Single source of truth for guest-checkout account creation, shared by every
 * payment method (UPI / crypto / Razorpay). Centralising these helpers here
 * guarantees there is exactly ONE account-creation + auth-identity flow — no
 * duplicated authentication logic across route files.
 *
 *   getOrCreateUser()            → ensures a public.users row exists
 *   ensureSupabaseAuthIdentity() → ensures a Supabase Auth identity exists
 *
 * Both are idempotent and safe to call from any payment verification path.
 */
import { randomUUID } from "crypto";
import { db, users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { supabaseAdmin } from "./supabase";

export interface BillingInfo {
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  phone?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  address?: string;
  country?: string;
}

export async function normalizeEmail(email: string | undefined): Promise<string | null> {
  if (!email) return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Resolve the purchaser to a public.users row. Order of resolution:
 *   1. By authenticated Supabase user id (clerkId column)
 *   2. By billing email (returning customer doing guest checkout)
 *   3. Create a brand-new guest row (clerkId = guest_<uuid>)
 *
 * Returns null only when there is neither an auth user nor a usable billing email.
 */
export async function getOrCreateUser(authUserId: string | undefined | null, billing: BillingInfo | null) {
  const normalizedEmail = await normalizeEmail(billing?.email);
  if (authUserId) {
    const existing = await db.select().from(users).where(eq(users.clerkId, authUserId)).limit(1);
    if (existing[0]) {
      // Update billing fields if provided
      if (billing) {
        await db.update(users).set({
          ...(billing.firstName && { firstName: billing.firstName }),
          ...(billing.lastName && { lastName: billing.lastName }),
          ...(billing.phone && { phone: billing.phone }),
          ...(billing.city && { city: billing.city }),
          ...(billing.state && { state: billing.state }),
          ...(billing.address && { addressLine1: billing.address }),
          ...(billing.zipcode && { postalCode: billing.zipcode }),
          ...(billing.country && { country: billing.country }),
          updatedAt: new Date(),
        }).where(eq(users.clerkId, authUserId));
      }
      return existing[0];
    }
  }

  if (normalizedEmail) {
    const existingByEmail = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
    if (existingByEmail[0]) {
      // Update billing fields on existing user
      if (billing) {
        await db.update(users).set({
          ...(billing.firstName && { firstName: billing.firstName }),
          ...(billing.lastName && { lastName: billing.lastName }),
          ...(billing.phone && { phone: billing.phone }),
          ...(billing.city && { city: billing.city }),
          ...(billing.state && { state: billing.state }),
          ...(billing.address && { addressLine1: billing.address }),
          ...(billing.zipcode && { postalCode: billing.zipcode }),
          ...(billing.country && { country: billing.country }),
          updatedAt: new Date(),
        }).where(eq(users.email, normalizedEmail));
      }
      return existingByEmail[0];
    }
  }

  if (!normalizedEmail) return null;

  const [newUser] = await db.insert(users).values({
    clerkId: `guest_${randomUUID()}`,
    email: normalizedEmail,
    firstName: billing?.firstName || billing?.name || "",
    lastName: billing?.lastName || "",
    phone: billing?.phone || "",
    city: billing?.city || "",
    state: billing?.state || "",
    addressLine1: billing?.address || "",
    postalCode: billing?.zipcode || "",
    country: billing?.country || "",
    role: "user",
  }).returning();

  return newUser;
}

/**
 * Ensure a Supabase Auth identity exists for a purchaser so they can log in to the
 * website after provisioning. A first-time guest checkout creates a public.users row
 * with clerk_id = "guest_*" but NO Supabase auth identity and NO password — meaning
 * the customer can never sign in. This bridges that gap.
 *
 * If the purchaser chose a password during checkout, that exact password is used so
 * they can be auto-logged-in client-side. Otherwise a strong temporary password is
 * generated and returned (ONLY in that case) so it can be emailed to them.
 *
 * Idempotent: if an auth identity already exists for the email, it returns that id with
 * no password (the customer signs in / resets normally).
 */
export async function ensureSupabaseAuthIdentity(params: {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  password?: string | null;
}): Promise<{ authUserId: string | null; tempPassword: string | null; created: boolean }> {
  if (!supabaseAdmin) {
    return { authUserId: null, tempPassword: null, created: false };
  }

  const email = params.email.trim().toLowerCase();
  const firstName = params.firstName || "";
  const lastName = params.lastName || "";

  // If the purchaser chose a password during checkout, use it so they can be
  // logged in immediately with credentials they already know. Otherwise fall
  // back to a strong auto-generated temporary password that we email to them.
  const chosenPassword =
    typeof params.password === "string" && params.password.length >= 8
      ? params.password
      : null;
  // Strong temporary password: upper + lower + digit + special, length 20.
  const tempPassword = chosenPassword ?? `Fw1!${randomUUID().replace(/-/g, "").slice(0, 16)}`;

  try {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true, // pre-confirm so the customer can log in immediately
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: params.phone || "",
      },
    });

    if (!error && data?.user) {
      // Only surface the password back to the caller when WE generated it (so it
      // can be emailed). A user-chosen password is never echoed back.
      return { authUserId: data.user.id, tempPassword: chosenPassword ? null : tempPassword, created: true };
    }

    // createUser failed (most commonly: email already registered) — find the existing
    // identity so we can at least link public.users.clerk_id to it.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existingUsers = (list?.users ?? []) as Array<{ id: string; email?: string | null }>;
    const existing = existingUsers.find((u) => (u.email || "").toLowerCase() === email);
    if (existing) {
      return { authUserId: existing.id, tempPassword: null, created: false };
    }
    return { authUserId: null, tempPassword: null, created: false };
  } catch {
    return { authUserId: null, tempPassword: null, created: false };
  }
}
