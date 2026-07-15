/**
 * Email service — Resend API (transactional email).
 *
 * Provider:  https://resend.com
 * Env vars:  RESEND_API_KEY, EMAIL_FROM, EMAIL_FROM_NAME
 * From:      FundedWealth <support@fundedwealth.com>  (once domain verified)
 *
 * Fallback: if RESEND_API_KEY is not set, emails are logged to console only.
 */

import { logger } from "./logger";

// ── Configuration ─────────────────────────────────────────────────────────────

const RESEND_API_URL  = "https://api.resend.com/emails";
const RESEND_API_KEY  = (process.env.RESEND_API_KEY ?? "").trim();
const EMAIL_FROM      = (process.env.EMAIL_FROM ?? "FundedWealth <support@fundedwealth.com>").trim();
const EMAIL_FROM_NAME = (process.env.EMAIL_FROM_NAME ?? "FundedWealth").trim();

// ── Startup check ─────────────────────────────────────────────────────────────

export function verifySmtpConnection(): Promise<void> {
  // Kept for API compatibility — Resend doesn't need a persistent connection.
  if (!RESEND_API_KEY) {
    logger.warn("[Email] RESEND_API_KEY not set — email delivery disabled (log-only mode)");
  } else {
    logger.info({ from: EMAIL_FROM }, "[Email] Resend API configured ✓");
  }
  return Promise.resolve();
}

export function getSmtpConfig() {
  return {
    provider:  "resend",
    apiKeySet: !!RESEND_API_KEY,
    from:      EMAIL_FROM,
    verified:  !!RESEND_API_KEY,
  };
}

// ── Core send ─────────────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    logger.warn(
      { to: options.to, subject: options.subject },
      "[Email] RESEND_API_KEY not set — email not sent (log-only mode)",
    );
    return false;
  }

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        from:     EMAIL_FROM,
        to:       [options.to],
        subject:  options.subject,
        html:     options.html,
        text:     options.text,
        reply_to: options.replyTo,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      logger.error(
        { status: response.status, detail, to: options.to, subject: options.subject },
        "[Email] Resend API error",
      );
      return false;
    }

    const data = await response.json() as { id?: string };
    logger.info(
      { to: options.to, subject: options.subject, messageId: data.id },
      "[Email] Sent via Resend ✓",
    );
    return true;
  } catch (err: any) {
    logger.error(
      { err: err?.message, to: options.to, subject: options.subject },
      "[Email] Resend fetch failed",
    );
    return false;
  }
}

// ── Transactional email helpers ───────────────────────────────────────────────

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
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Share your code with traders and earn up to 50% commission on every sale.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function paymentConfirmationEmail(
  name: string, email: string, txnId: string, amount: string, productInfo: string,
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
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your trading account credentials will be sent to your email within 12 hours.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function challengeStartedEmail(name: string, email: string, accountSize: string, phase: string) {
  return sendEmail({
    to: email,
    subject: `Your ${phase} Challenge Has Started! | FundedWealth`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#FF8A3D;margin-bottom:16px;">Your Challenge is Live! 🚀</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Hi <strong style="color:white;">${name}</strong>, your <strong style="color:#FF8A3D;">${accountSize}</strong> ${phase} account is now active.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function kycStatusEmail(
  name: string, email: string, status: "submitted" | "approved" | "rejected", reason?: string,
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
  const colors: Record<string, string> = { submitted: "#3b82f6", approved: "#22c55e", rejected: "#ef4444" };

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
    to: email, subject,
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
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your identity verification has been completed successfully. You now have <strong>full access</strong> to payouts, all trading accounts, and higher limits.</p>
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
        <div style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:12px;padding:16px;margin:20px 0;">
          <p style="color:rgba(255,255,255,0.8);margin:0;font-size:14px;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p style="color:rgba(255,255,255,0.6);font-size:13px;">Questions? Contact <strong>support@fundedwealth.com</strong></p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function donationThankYouEmail(name: string, email: string, amount: number, category: string) {
  return sendEmail({
    to: email,
    subject: "Thank You for Your Donation — FW Impact Initiative",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#1A0030;color:white;padding:40px;border-radius:16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#D63384;margin-bottom:16px;">Thank You, ${name}! ❤️</h2>
        <p style="color:rgba(255,255,255,0.7);line-height:1.6;">Your donation of <strong style="color:#FF8A3D;">₹${amount}</strong> towards <strong style="color:white;">${category}</strong> has been received.</p>
        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
        <p style="color:rgba(255,255,255,0.4);font-size:12px;">FW Impact Initiative — Making Profits Meaningful</p>
      </div>
    `,
  });
}
