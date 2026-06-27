import { db, adminEvents } from "@workspace/db";
import { logger } from "./logger";

/**
 * AdminEventService — Creates admin_events records for the Admin Panel.
 *
 * INTEGRATION CONTRACT:
 * - Main Site: calls these methods after payment, KYC, payout events
 * - Admin Panel: polls GET /api/admin/events to read unacknowledged events
 * - Terminal: may call notifyProvisioningFailed() on errors
 *
 * All methods are fire-and-forget (non-blocking). A failure to create an
 * admin event must NEVER roll back the parent transaction.
 */
export class AdminEventService {
  /**
   * Notify admin that a payment has been received and needs provisioning/review.
   */
  static async notifyPaymentReceived(params: {
    orderId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    planType?: string;
    accountSize?: number;
  }): Promise<void> {
    try {
      await db.insert(adminEvents).values({
        eventType: "payment_received",
        orderId: params.orderId,
        userId: params.userId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        metadata: {
          planType: params.planType,
          accountSize: params.accountSize,
        },
      });
      logger.info(
        { orderId: params.orderId, paymentMethod: params.paymentMethod },
        "[AdminEvent] payment_received created",
      );
    } catch (err: any) {
      logger.error({ err: err.message, orderId: params.orderId }, "[AdminEvent] Failed to create payment_received event");
    }
  }

  /**
   * Notify admin that a user submitted KYC documents for review.
   */
  static async notifyKycSubmitted(params: {
    userId: string;
    submissionId?: string;
  }): Promise<void> {
    try {
      await db.insert(adminEvents).values({
        eventType: "kyc_submitted",
        userId: params.userId,
        metadata: { submissionId: params.submissionId },
      });
      logger.info({ userId: params.userId }, "[AdminEvent] kyc_submitted created");
    } catch (err: any) {
      logger.error({ err: err.message, userId: params.userId }, "[AdminEvent] Failed to create kyc_submitted event");
    }
  }

  /**
   * Notify admin that a user requested a payout.
   */
  static async notifyPayoutRequested(params: {
    userId: string;
    amount: number;
    payoutId?: string;
  }): Promise<void> {
    try {
      await db.insert(adminEvents).values({
        eventType: "payout_requested",
        userId: params.userId,
        amount: params.amount,
        metadata: { payoutId: params.payoutId },
      });
      logger.info({ userId: params.userId, amount: params.amount }, "[AdminEvent] payout_requested created");
    } catch (err: any) {
      logger.error({ err: err.message, userId: params.userId }, "[AdminEvent] Failed to create payout_requested event");
    }
  }

  /**
   * Notify admin that provisioning failed (called by Terminal or internally).
   */
  static async notifyProvisioningFailed(params: {
    orderId: string;
    userId: string;
    errorMessage?: string;
  }): Promise<void> {
    try {
      await db.insert(adminEvents).values({
        eventType: "provisioning_failed",
        orderId: params.orderId,
        userId: params.userId,
        metadata: { errorMessage: params.errorMessage },
      });
      logger.info({ orderId: params.orderId }, "[AdminEvent] provisioning_failed created");
    } catch (err: any) {
      logger.error({ err: err.message, orderId: params.orderId }, "[AdminEvent] Failed to create provisioning_failed event");
    }
  }

  /**
   * Notify admin that a payment requires manual review (UTR/bank transfer).
   */
  static async notifyManualReviewRequired(params: {
    orderId: string;
    userId: string;
    amount: number;
    paymentMethod: string;
    reference?: string;
  }): Promise<void> {
    try {
      await db.insert(adminEvents).values({
        eventType: "manual_review_required",
        orderId: params.orderId,
        userId: params.userId,
        amount: params.amount,
        paymentMethod: params.paymentMethod,
        metadata: { reference: params.reference },
      });
      logger.info(
        { orderId: params.orderId, paymentMethod: params.paymentMethod },
        "[AdminEvent] manual_review_required created",
      );
    } catch (err: any) {
      logger.error({ err: err.message, orderId: params.orderId }, "[AdminEvent] Failed to create manual_review_required event");
    }
  }
}
