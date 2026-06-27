import { pgTable, serial, integer, text, timestamp, index, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const paymentFingerprints = pgTable(
    "payment_fingerprints",
    {
        id: serial("id").primaryKey(),
        userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        fingerprintType: text("fingerprint_type").notNull(), // upi, bank_account, crypto_wallet, razorpay_customer
        fingerprintHash: text("fingerprint_hash").notNull(), // SHA-256
        source: text("source"), // payout, payment_details, checkout
        createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    },
    (table) => ({
        userIdx: index("payment_fp_user_idx").on(table.userId),
        hashIdx: index("payment_fp_hash_idx").on(table.fingerprintHash),
        typeHashIdx: index("payment_fp_type_hash_idx").on(table.fingerprintType, table.fingerprintHash),
        userTypeHashUniq: uniqueIndex("payment_fp_user_type_hash_uniq").on(table.userId, table.fingerprintType, table.fingerprintHash),
    })
);

export const insertPaymentFingerprintSchema = createInsertSchema(paymentFingerprints).omit({ id: true, createdAt: true });
export type PaymentFingerprint = typeof paymentFingerprints.$inferSelect;
export type InsertPaymentFingerprint = z.infer<typeof insertPaymentFingerprintSchema>;
