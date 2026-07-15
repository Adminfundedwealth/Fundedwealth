/**
 * Email service — Zoho SMTP via Nodemailer.
 *
 * Transport: SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS
 * Sender:    SMTP_FROM_NAME <SMTP_FROM>   (falls back to SMTP_USER)
 *
 * Port 465 → implicit TLS (secure: true)
 * Port 587 → STARTTLS   (secure: false)
 *
 * The transporter is created once and verified at startup.
 * All callers import `sendEmail()`; every email flows through one place.
 */

import nodemailer, { type Transporter } from "nodemailer";
import { logger } from "./logger";

// ── Configuration ────────────────────────────────────────────────────────────

const SMTP_HOST     = process.env.SMTP_HOST     ?? "";
const SMTP_PORT     = parseInt(process.env.SMTP_PORT ?? "465", 10);
const SMTP_SECURE   = process.env.SMTP_SECURE   !== "false"; // default true (port 465)
const SMTP_USER     = process.env.SMTP_USER     ?? "";
const SMTP_PASS     = process.env.SMTP_PASS     ?? "";
const SMTP_FROM     = process.env.SMTP_FROM     ?? SMTP_USER;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME ?? "FundedWealth";

const FROM_HEADER = `${SMTP_FROM_NAME} <${SMTP_FROM}>`;

// ── Transporter singleton ────────────────────────────────────────────────────

let _transporter: Transporter | null = null;
let _transporterVerified = false;

function buildTransporter(): Transporter {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "[Email] SMTP_HOST, SMTP_USER, and SMTP_PASS must all be set. " +
      "Configure them in Railway environment variables.",
    );
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,          // true → SSL/TLS on connect (port 465)
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    tls: {
      // Zoho India (smtp.zoho.in) uses a valid cert — enforce verification
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
    },
    connectionTimeout: 10_000,    // 10 s
    greetingTimeout:   10_000,
    socketTimeout:     30_000,
  });
}

function getTransporter(): Transporter {
  if (!_transporter) {
    _transporter = buildTransporter();
  }
  return _transporter;
}

/**
 * Verify SMTP credentials by opening a connection.
 * Called once at server startup.  Non-fatal — logs the error and continues.
 */
export async function verifySmtpConnection(): Promise<void> {
  if (_transporterVerified) return;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn(
      "[Email] SMTP not configured (SMTP_HOST/SMTP_USER/SMTP_PASS missing). " +
      "Email delivery is disabled — running in log-only mode.",
    );
    return;
  }

  try {
    const t = getTransporter();
    await t.verify();
    _transporterVerified = true;
    logger.info(
      { host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER, from: FROM_HEADER },
      "[Email] SMTP connection verified — Zoho SMTP ready ✓",
    );
  } catch (err: any) {
    logger.error(
      { err: err?.message, host: SMTP_HOST, port: SMTP_PORT, user: SMTP_USER },
      "[Email] SMTP connection verification FAILED — check credentials and host",
    );
    // Reset so the next send attempt re-tries the connection
    _transporter = null;
  }
}

// ── Core send ────────────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // Log-only mode when SMTP is not configured
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    logger.warn(
      { to: options.to, subject: options.subject },
      "[Email] SMTP not configured — email not sent (log-only mode)",
    );
    return false;
  }

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from:    FROM_HEADER,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
      text:    options.text,
      replyTo: options.replyTo,
    });

    logger.info(
      { to: options.to, subject: options.subject, messageId: info.messageId },
      "[Email] Sent via Zoho SMTP ✓",
    );
    return true;
  } catch (err: any) {
    logger.error(
      { err: err?.message, to: options.to, subject: options.subject },
      "[Email] Failed to send via Zoho SMTP",
    );
    return false;
  }
}

// ── Helper: return current SMTP config (no secrets) ─────────────────────────

export function getSmtpConfig() {
  return {
    host:      SMTP_HOST  || "NOT SET",
    port:      SMTP_PORT,
    secure:    SMTP_SECURE,
    user:      SMTP_USER  ? `${SMTP_USER.slice(0, 4)}…` : "NOT SET",
    from:      FROM_HEADER,
    passSet:   !!SMTP_PASS,
    verified:  _transporterVerified,
  };
}

// ── Transactional email helpers ──────────────────────────────────────────────
// All functions below compose the HTML body and delegate to sendEmail().

export async function sendTradingAccountRuleEmail(
  name: string,
  email: string,
  result: "breached" | "passed",
  account: {
    id: number;
    planType: string;
    currentBalance: number;
    profitLoss: number;
    dailyDrawdown: number;
    maxDrawdown: number;
    profitTarget: number;
  },
) {
  const subject =
    result === "passed"
      ? "Congratulations — Your Trading Account Passed"
      : "Alert — Your Trading Account Has Breached The Rules";

  const message =
    result === "passed"
      ? "Your account has reached its target profit and is now marked as passed."
      : "Your account has exceeded a drawdown limit and is now marked as breached.";

  return sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:32px;border-radius:16px;">
        <h1 style="color:#FF8A3D;">FundedWealth Account Status Update</h1>
        <p style="color:rgba(255,255,255,0.8);">Hi ${name},</p>
        <p style="color:rgba(255,255,255,0.8);">${message}</p>
        <ul style="color:rgba(255,255,255,0.8);line-height:1.7;">
          <li><strong>Account ID:</strong> ${account.id}</li>
          <li><strong>Plan type:</strong> ${account.planType}</li>
          <li><strong>Current balance:</strong> ₹${account.currentBalance.toFixed(2)}</li>
          <li><strong>Total P&L:</strong> ₹${account.profitLoss.toFixed(2)}</li>
          <li><strong>Today loss:</strong> ₹${account.dailyDrawdown.toFixed(2)}</li>
          <li><strong>Max drawdown:</strong> ₹${account.maxDrawdown.toFixed(2)}</li>
          <li><strong>Profit target:</strong> ₹${account.profitTarget.toFixed(2)}</li>
        </ul>
        <p style="color:rgba(255,255,255,0.7);">If you have any questions, please reach out to our support team.</p>
      </div>
    `,
  });
}

export function contactConfirmationEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: "We received your message — FundedWealth",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#FF8A3D;margin-bottom:16px;">Thank you, ${name}!</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">We've received your message and our team will get back to you within 24 hours.</p>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">In the meantime, feel free to explore our trading plans or join our community on WhatsApp.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function championshipRegistrationEmail(name: string, email: string, challengeType: string) {
  return sendEmail({
    to: email,
    subject: `Championship Registration Confirmed — FundedWealth`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#FF8A3D;margin-bottom:16px;">You're In, ${name}! 🏆</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">You've successfully registered for the <strong style="color:white;">${challengeType}</strong> FW Championship.</p>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Get ready to compete with India's best traders and win incredible prizes including iPhone 16, MacBook, and more!</p>
        <div style="background:rgba(74,0,224,0.2);border:1px solid rgba(74,0,224,0.3);border-radius:12px;padding:16px;margin:20px 0;">
          <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">📅 Challenge starts soon. Keep an eye on your email for the exact start date and rules.</p>
        </div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function affiliateWelcomeEmail(name: string, email: string, affiliateCode: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to FundedWealth Affiliate Program!",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#FF8A3D;margin-bottom:16px;">Welcome Aboard, ${name}! 🎉</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your affiliate application has been received. Here's your unique affiliate code:</p>
        <div style="background:rgba(74,0,224,0.2);border:1px solid rgba(74,0,224,0.3);border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
          <p style="color:rgba(255,255,255,0.5);margin:0 0 8px 0;font-size:12px;">YOUR AFFILIATE CODE</p>
          <p style="color:#FF8A3D;font-size:24px;font-weight:bold;margin:0;">${affiliateCode}</p>
        </div>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Share your code with traders and earn up to 50% commission on every sale. The more referrals, the higher your tier!</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function paymentConfirmationEmail(
  name: string,
  email: string,
  txnId: string,
  amount: string,
  productInfo: string,
) {
  return sendEmail({
    to: email,
    subject: `Payment Confirmed — ${productInfo} | FundedWealth`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#22c55e;margin-bottom:16px;">Payment Successful! ✅</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hi <strong style="color:white;">${name}</strong>, your payment has been confirmed.</p>
        <div style="background:rgba(74,0,224,0.2);border:1px solid rgba(74,0,224,0.3);border-radius:12px;padding:20px;margin:20px 0;">
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;font-size:13px;">Plan</td><td style="color:white;font-weight:bold;text-align:right;font-size:13px;">${productInfo}</td></tr>
            <tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;font-size:13px;">Amount</td><td style="color:#FF8A3D;font-weight:bold;text-align:right;font-size:13px;">₹${amount}</td></tr>
            <tr><td style="color:rgba(255,255,255,0.5);padding:6px 0;font-size:13px;">Transaction ID</td><td style="color:rgba(255,255,255,0.7);text-align:right;font-size:12px;font-family:monospace;">${txnId}</td></tr>
          </table>
        </div>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your trading account credentials will be sent to your email within 12 hours. If you chose an instant plan, check your dashboard now!</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function challengeStartedEmail(
  name: string,
  email: string,
  accountSize: string,
  phase: string,
) {
  return sendEmail({
    to: email,
    subject: `Your ${phase} Challenge Has Started! | FundedWealth`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#FF8A3D;margin-bottom:16px;">Your Challenge is Live! 🚀</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hi <strong style="color:white;">${name}</strong>, your <strong style="color:#FF8A3D;">${accountSize}</strong> ${phase} account is now active.</p>
        <div style="background:rgba(74,0,224,0.2);border:1px solid rgba(74,0,224,0.3);border-radius:12px;padding:16px;margin:20px 0;">
          <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">📊 Log into your dashboard to start trading and track your progress.</p>
        </div>
        <p style="color:rgba(255,255,255,0.6);line-height:1.6;font-size:13px;">Remember: Min 5 trading days, max 5% daily loss, max 10% drawdown. Trade smart!</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function kycStatusEmail(
  name: string,
  email: string,
  status: "submitted" | "approved" | "rejected",
  reason?: string,
) {
  const titles: Record<string, string> = {
    submitted: "KYC Received — Under Review",
    approved:  "KYC Approved! ✅",
    rejected:  "KYC Update Required",
  };
  const bodies: Record<string, string> = {
    submitted: "We've received your KYC documents and they are currently under review. This usually takes 24-48 hours.",
    approved:  "Your identity has been verified! You now have full access to payouts and higher account limits.",
    rejected:  `Unfortunately, we couldn't verify your documents. ${reason || "Please re-submit with clearer copies."}`,
  };
  const colors: Record<string, string> = {
    submitted: "#3b82f6",
    approved:  "#22c55e",
    rejected:  "#ef4444",
  };

  return sendEmail({
    to: email,
    subject: `${titles[status]} | FundedWealth`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:${colors[status]};margin-bottom:16px;">${titles[status]}</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hi <strong style="color:white;">${name}</strong>,</p>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">${bodies[status]}</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export async function sendKycStatusEmail(name: string, email: string, subject: string) {
  return sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <h2 style="color:#FF8A3D;margin-bottom:16px;">${subject}</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hi ${name},</p>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your KYC application has been submitted and is under review.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export async function sendKycApprovedEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: "KYC Approved — Welcome to FundedWealth! ✅",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#22c55e;margin-bottom:16px;">Congratulations! Your KYC is Approved ✅</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hi <strong style="color:white;">${name}</strong>,</p>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your identity verification has been completed successfully. You now have <strong>full access</strong> to:</p>
        <ul style="color:rgba(255,255,255,0.7);line-height:1.8;margin:20px 0;padding-left:24px;">
          <li>💰 Request and receive payouts</li>
          <li>📈 Access all trading accounts</li>
          <li>🎯 Participate in all challenges</li>
          <li>🏆 Higher account limits</li>
        </ul>
        <div style="background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:12px;padding:16px;margin:20px 0;">
          <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;">🔒 Your identity information is encrypted and secure.</p>
        </div>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export async function sendKycRejectedEmail(name: string, email: string, reason: string) {
  return sendEmail({
    to: email,
    subject: "KYC Verification Update — Action Required",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#ef4444;margin-bottom:16px;">KYC Verification Update</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hi <strong style="color:white;">${name}</strong>,</p>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">We were unable to verify your identity documents at this time.</p>
        <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;margin:20px 0;">
          <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <ul style="color:rgba(255,255,255,0.7);line-height:1.8;padding-left:24px;">
          <li>📸 Upload clearer, higher-resolution photos</li>
          <li>✅ Ensure all details match your official documents</li>
          <li>💡 Make sure text is legible and documents aren't expired</li>
          <li>🔄 You can resubmit your documents immediately</li>
        </ul>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;">Questions? Contact <strong>support@fundedwealth.com</strong></p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function donationThankYouEmail(
  name: string,
  email: string,
  amount: number,
  category: string,
) {
  return sendEmail({
    to: email,
    subject: "Thank You for Your Donation — FW Impact Initiative",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#D63384;margin-bottom:16px;">Thank You, ${name}! ❤️</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your donation of <strong style="color:#FF8A3D;">₹${amount}</strong> towards <strong style="color:white;">${category}</strong> has been received.</p>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">You're making a real difference in someone's life. Every contribution counts!</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FW Impact Initiative — Making Profits Meaningful</p>
      </div>
    `,
  });
}
