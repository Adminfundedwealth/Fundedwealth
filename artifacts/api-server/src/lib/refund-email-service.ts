/**
 * Refund Email Service
 *
 * Transactional emails for the support-first refund lifecycle.
 * Uses the existing Resend-backed sendEmail() from email.ts — no second infrastructure.
 *
 * Emails sent:
 *   1. refundCaseCreatedEmail       — case opened, customer notified
 *   2. refundMoreInfoEmail          — admin needs more information
 *   3. refundApprovedEmail          — decision: approved
 *   4. refundRejectedEmail          — decision: rejected (requires reason)
 *   5. refundProcessingEmail        — payment initiated
 *   6. refundCompletedEmail         — gateway confirmed completion
 *   7. refundFailedEmail            — processing failed, customer to contact support
 */

import { sendEmail } from "./email";
import { logger } from "./logger";

const BRAND_HEADER = `
  <div style="margin-bottom:24px;">
    <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:36px;" />
  </div>
`;

const BRAND_FOOTER = `
  <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:32px 0 16px;" />
  <p style="color:rgba(255,255,255,0.4);font-size:11px;margin:0;">
    FundedWealth — India's Leading Proprietary Trading Evaluation Platform<br/>
    Questions? Contact <a href="mailto:support@fundedwealth.com" style="color:#FF8A3D;">support@fundedwealth.com</a>
  </p>
`;

function container(inner: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;background:#0D0020;color:white;padding:40px;border-radius:16px;">
      ${BRAND_HEADER}
      ${inner}
      ${BRAND_FOOTER}
    </div>
  `;
}

function infoRow(label: string, value: string): string {
  return `
    <tr>
      <td style="color:rgba(255,255,255,0.5);padding:5px 0;font-size:13px;white-space:nowrap;width:40%;">${label}</td>
      <td style="color:rgba(255,255,255,0.9);padding:5px 0;font-size:13px;font-weight:500;">${value}</td>
    </tr>
  `;
}

function infoTable(rows: string): string {
  return `
    <div style="background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;padding:20px;margin:20px 0;">
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    </div>
  `;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Refund Case Created
// ─────────────────────────────────────────────────────────────────────────────

export interface RefundCaseCreatedParams {
  customerName: string;
  customerEmail: string;
  refundCaseId: string;
  orderId: string;
  refundAmount: number;
  reason: string;
}

export function refundCaseCreatedEmail(p: RefundCaseCreatedParams): Promise<boolean> {
  logger.info({ refundCaseId: p.refundCaseId, email: p.customerEmail }, "[RefundEmail] sending case-created");

  return sendEmail({
    to: p.customerEmail,
    subject: `Refund Request Received — Order ${p.orderId.slice(0, 8).toUpperCase()} | FundedWealth`,
    html: container(`
      <h2 style="color:#3b82f6;margin-top:0;">Refund Request Received</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
        Hi <strong style="color:white;">${p.customerName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
        We have received your refund request. Our team will review it within <strong>24–48 business hours</strong>
        and notify you of the outcome by email.
      </p>
      ${infoTable(
        infoRow("Case Reference", p.refundCaseId.slice(0, 8).toUpperCase()) +
        infoRow("Order ID", p.orderId.slice(0, 8).toUpperCase()) +
        infoRow("Requested Amount", `₹${Number(p.refundAmount).toLocaleString("en-IN")}`) +
        infoRow("Reason", p.reason)
      )}
      <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">
        You do not need to take any further action at this stage. If we require additional information,
        we will contact you at this email address.
      </p>
      <p style="color:rgba(255,255,255,0.6);font-size:13px;">
        To follow up, contact <a href="mailto:support@fundedwealth.com" style="color:#FF8A3D;">support@fundedwealth.com</a>
        and quote your Case Reference above.
      </p>
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. More Information Required
// ─────────────────────────────────────────────────────────────────────────────

export interface RefundMoreInfoParams {
  customerName: string;
  customerEmail: string;
  refundCaseId: string;
  orderId: string;
  infoRequested: string;
}

export function refundMoreInfoEmail(p: RefundMoreInfoParams): Promise<boolean> {
  logger.info({ refundCaseId: p.refundCaseId, email: p.customerEmail }, "[RefundEmail] sending more-info-required");

  return sendEmail({
    to: p.customerEmail,
    subject: `Additional Information Required — Refund Case ${p.refundCaseId.slice(0, 8).toUpperCase()} | FundedWealth`,
    html: container(`
      <h2 style="color:#f59e0b;margin-top:0;">Additional Information Required</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
        Hi <strong style="color:white;">${p.customerName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
        We are reviewing your refund request but require some additional information before we can proceed.
      </p>
      <div style="background:rgba(245,158,11,0.1);border:1px solid rgba(245,158,11,0.3);border-radius:12px;padding:20px;margin:20px 0;">
        <p style="color:rgba(255,255,255,0.9);margin:0;font-size:14px;line-height:1.6;">
          <strong>Information Requested:</strong><br/>${p.infoRequested}
        </p>
      </div>
      ${infoTable(
        infoRow("Case Reference", p.refundCaseId.slice(0, 8).toUpperCase()) +
        infoRow("Order ID", p.orderId.slice(0, 8).toUpperCase())
      )}
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;">
        Please reply to <a href="mailto:support@fundedwealth.com" style="color:#FF8A3D;">support@fundedwealth.com</a>
        with the requested information, quoting your Case Reference above.
      </p>
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Refund Approved
// ─────────────────────────────────────────────────────────────────────────────

export interface RefundApprovedParams {
  customerName: string;
  customerEmail: string;
  refundCaseId: string;
  orderId: string;
  approvedAmount: number;
  paymentMethod: string;
}

export function refundApprovedEmail(p: RefundApprovedParams): Promise<boolean> {
  logger.info({ refundCaseId: p.refundCaseId, email: p.customerEmail }, "[RefundEmail] sending approved");

  return sendEmail({
    to: p.customerEmail,
    subject: `Refund Approved — Order ${p.orderId.slice(0, 8).toUpperCase()} | FundedWealth`,
    html: container(`
      <h2 style="color:#22c55e;margin-top:0;">Refund Approved ✓</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
        Hi <strong style="color:white;">${p.customerName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
        Your refund request has been <strong style="color:#22c55e;">approved</strong>.
        We will process the refund within <strong>5–7 business days</strong>.
      </p>
      ${infoTable(
        infoRow("Case Reference", p.refundCaseId.slice(0, 8).toUpperCase()) +
        infoRow("Order ID", p.orderId.slice(0, 8).toUpperCase()) +
        infoRow("Approved Amount", `₹${Number(p.approvedAmount).toLocaleString("en-IN")}`) +
        infoRow("Refund To", p.paymentMethod)
      )}
      <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">
        Refunds are returned to the original payment method. Actual crediting depends on your
        bank or payment provider and may take additional time beyond our processing period.
      </p>
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Refund Rejected
// ─────────────────────────────────────────────────────────────────────────────

export interface RefundRejectedParams {
  customerName: string;
  customerEmail: string;
  refundCaseId: string;
  orderId: string;
  rejectionReason: string;
  adminNote?: string;
}

export function refundRejectedEmail(p: RefundRejectedParams): Promise<boolean> {
  logger.info({ refundCaseId: p.refundCaseId, email: p.customerEmail }, "[RefundEmail] sending rejected");

  return sendEmail({
    to: p.customerEmail,
    subject: `Refund Request Update — Order ${p.orderId.slice(0, 8).toUpperCase()} | FundedWealth`,
    html: container(`
      <h2 style="color:#ef4444;margin-top:0;">Refund Request Update</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
        Hi <strong style="color:white;">${p.customerName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
        After reviewing your refund request, we are unable to process a refund in this instance.
      </p>
      <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:12px;padding:20px;margin:20px 0;">
        <p style="color:rgba(255,255,255,0.9);margin:0 0 8px;font-size:14px;">
          <strong>Reason:</strong> ${p.rejectionReason}
        </p>
        ${p.adminNote ? `<p style="color:rgba(255,255,255,0.7);margin:0;font-size:13px;">${p.adminNote}</p>` : ""}
      </div>
      ${infoTable(
        infoRow("Case Reference", p.refundCaseId.slice(0, 8).toUpperCase()) +
        infoRow("Order ID", p.orderId.slice(0, 8).toUpperCase()) +
        infoRow("Decision", "Not Eligible for Refund")
      )}
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;">
        If you believe this decision is incorrect, or if you have additional information to provide,
        please contact <a href="mailto:support@fundedwealth.com" style="color:#FF8A3D;">support@fundedwealth.com</a>
        quoting your Case Reference above.
      </p>
      <p style="color:rgba(255,255,255,0.6);font-size:12px;line-height:1.6;">
        Please review our <a href="https://fundedwealth.com/refund" style="color:#FF8A3D;">Refund Policy</a>
        for full details of eligible refund conditions.
      </p>
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Refund Processing (initiated at gateway)
// ─────────────────────────────────────────────────────────────────────────────

export interface RefundProcessingParams {
  customerName: string;
  customerEmail: string;
  refundCaseId: string;
  orderId: string;
  refundAmount: number;
  paymentMethod: string;
  gatewayRefundId?: string;
}

export function refundProcessingEmail(p: RefundProcessingParams): Promise<boolean> {
  logger.info({ refundCaseId: p.refundCaseId, email: p.customerEmail }, "[RefundEmail] sending processing");

  return sendEmail({
    to: p.customerEmail,
    subject: `Refund Processing — Order ${p.orderId.slice(0, 8).toUpperCase()} | FundedWealth`,
    html: container(`
      <h2 style="color:#3b82f6;margin-top:0;">Refund Being Processed</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
        Hi <strong style="color:white;">${p.customerName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
        Your refund has been initiated and is now being processed by the payment gateway.
        Please allow up to 7 business days for the funds to reflect in your account.
      </p>
      ${infoTable(
        infoRow("Case Reference", p.refundCaseId.slice(0, 8).toUpperCase()) +
        infoRow("Order ID", p.orderId.slice(0, 8).toUpperCase()) +
        infoRow("Refund Amount", `₹${Number(p.refundAmount).toLocaleString("en-IN")}`) +
        infoRow("Payment Method", p.paymentMethod) +
        (p.gatewayRefundId ? infoRow("Gateway Reference", p.gatewayRefundId) : "")
      )}
      <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">
        You will receive a final confirmation email once the refund is complete.
      </p>
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Refund Completed (gateway confirmed)
// ─────────────────────────────────────────────────────────────────────────────

export interface RefundCompletedParams {
  customerName: string;
  customerEmail: string;
  refundCaseId: string;
  orderId: string;
  refundAmount: number;
  paymentMethod: string;
  gatewayRefundId?: string;
  completedAt: string;
}

export function refundCompletedEmail(p: RefundCompletedParams): Promise<boolean> {
  logger.info({ refundCaseId: p.refundCaseId, email: p.customerEmail }, "[RefundEmail] sending completed");

  return sendEmail({
    to: p.customerEmail,
    subject: `Refund Completed — Order ${p.orderId.slice(0, 8).toUpperCase()} | FundedWealth`,
    html: container(`
      <h2 style="color:#22c55e;margin-top:0;">Refund Completed ✓</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
        Hi <strong style="color:white;">${p.customerName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
        Your refund has been successfully processed. The funds should be reflected in your
        original payment account within your bank or provider's standard processing time.
      </p>
      ${infoTable(
        infoRow("Case Reference", p.refundCaseId.slice(0, 8).toUpperCase()) +
        infoRow("Order ID", p.orderId.slice(0, 8).toUpperCase()) +
        infoRow("Refund Amount", `₹${Number(p.refundAmount).toLocaleString("en-IN")}`) +
        infoRow("Payment Method", p.paymentMethod) +
        (p.gatewayRefundId ? infoRow("Gateway Reference", p.gatewayRefundId) : "") +
        infoRow("Completed", new Date(p.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }))
      )}
      <p style="color:rgba(255,255,255,0.6);font-size:13px;line-height:1.6;">
        If you do not see the refund within 10 business days, contact your bank or UPI provider
        with the Gateway Reference above. For further assistance, email
        <a href="mailto:support@fundedwealth.com" style="color:#FF8A3D;">support@fundedwealth.com</a>.
      </p>
    `),
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Refund Failed
// ─────────────────────────────────────────────────────────────────────────────

export interface RefundFailedParams {
  customerName: string;
  customerEmail: string;
  refundCaseId: string;
  orderId: string;
  refundAmount: number;
}

export function refundFailedEmail(p: RefundFailedParams): Promise<boolean> {
  logger.info({ refundCaseId: p.refundCaseId, email: p.customerEmail }, "[RefundEmail] sending failed");

  return sendEmail({
    to: p.customerEmail,
    subject: `Refund Processing Issue — Order ${p.orderId.slice(0, 8).toUpperCase()} | FundedWealth`,
    html: container(`
      <h2 style="color:#ef4444;margin-top:0;">Refund Processing Issue</h2>
      <p style="color:rgba(255,255,255,0.8);line-height:1.6;">
        Hi <strong style="color:white;">${p.customerName}</strong>,
      </p>
      <p style="color:rgba(255,255,255,0.7);line-height:1.6;">
        We encountered an issue while processing your refund. Our team has been notified and
        will investigate this as a priority. We will contact you with an update within
        <strong>1–2 business days</strong>.
      </p>
      ${infoTable(
        infoRow("Case Reference", p.refundCaseId.slice(0, 8).toUpperCase()) +
        infoRow("Order ID", p.orderId.slice(0, 8).toUpperCase()) +
        infoRow("Refund Amount", `₹${Number(p.refundAmount).toLocaleString("en-IN")}`)
      )}
      <p style="color:rgba(255,255,255,0.7);font-size:13px;line-height:1.6;">
        No action is required from you at this time. If you wish to follow up,
        contact <a href="mailto:support@fundedwealth.com" style="color:#FF8A3D;">support@fundedwealth.com</a>
        quoting your Case Reference.
      </p>
    `),
  });
}
