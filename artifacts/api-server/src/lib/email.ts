interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendResendEmail(options: EmailOptions): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log(`[EMAIL] Missing RESEND_API_KEY. Falling back to log-only email.`);
    console.log(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`);
    console.log(options.html);
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "no-reply@fundedwealth.com",
      to: options.to,
      subject: options.subject,
      html: options.html,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error(`[EMAIL] Resend send failed: ${response.status} ${response.statusText}`);
    console.error(detail);
    return false;
  }

  return true;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (process.env.RESEND_API_KEY) {
    return sendResendEmail(options);
  }

  console.log(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`);
  console.log(`[EMAIL] Note: Email sending is in log-only mode. Connect a real email provider (Resend, SendGrid, etc.) to enable delivery.`);
  return true;
}

export async function sendTradingAccountRuleEmail(
  name: string,
  email: string,
  result: "breached" | "passed",
  account: { id: number; planType: string; currentBalance: number; profitLoss: number; dailyDrawdown: number; maxDrawdown: number; profitTarget: number },
) {
  const subject = result === "passed"
    ? "Congratulations — Your Trading Account Passed"
    : "Alert — Your Trading Account Has Breached The Rules";

  const message = result === "passed"
    ? `Your account has reached its target profit and is now marked as passed.`
    : `Your account has exceeded a drawdown limit and is now marked as breached.`;

  return sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 32px; border-radius: 16px;">
        <h1 style="color: #FF8A3D;">FundedWealth Account Status Update</h1>
        <p style="color: rgba(255,255,255,0.8);">Hi ${name},</p>
        <p style="color: rgba(255,255,255,0.8);">${message}</p>
        <ul style="color: rgba(255,255,255,0.8); line-height: 1.7;">
          <li><strong>Account ID:</strong> ${account.id}</li>
          <li><strong>Plan type:</strong> ${account.planType}</li>
          <li><strong>Current balance:</strong> ₹${account.currentBalance.toFixed(2)}</li>
          <li><strong>Total P&L:</strong> ₹${account.profitLoss.toFixed(2)}</li>
          <li><strong>Today loss:</strong> ₹${account.dailyDrawdown.toFixed(2)}</li>
          <li><strong>Max drawdown:</strong> ₹${account.maxDrawdown.toFixed(2)}</li>
          <li><strong>Profit target:</strong> ₹${account.profitTarget.toFixed(2)}</li>
        </ul>
        <p style="color: rgba(255,255,255,0.7);">If you have any questions, please reach out to our support team.</p>
      </div>
    `,
  });
}

export function contactConfirmationEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: "We received your message — FundedWealth",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #FF8A3D; margin-bottom: 16px;">Thank you, ${name}!</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">We've received your message and our team will get back to you within 24 hours.</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">In the meantime, feel free to explore our trading plans or join our community on WhatsApp.</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function championshipRegistrationEmail(name: string, email: string, challengeType: string) {
  return sendEmail({
    to: email,
    subject: `Championship Registration Confirmed — FundedWealth`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #FF8A3D; margin-bottom: 16px;">You're In, ${name}! 🏆</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">You've successfully registered for the <strong style="color: white;">${challengeType}</strong> FW Championship.</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Get ready to compete with India's best traders and win incredible prizes including iPhone 16, MacBook, and more!</p>
        <div style="background: rgba(74,0,224,0.2); border: 1px solid rgba(74,0,224,0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">📅 Challenge starts soon. Keep an eye on your email for the exact start date and rules.</p>
        </div>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function affiliateWelcomeEmail(name: string, email: string, affiliateCode: string) {
  return sendEmail({
    to: email,
    subject: "Welcome to FundedWealth Affiliate Program!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #FF8A3D; margin-bottom: 16px;">Welcome Aboard, ${name}! 🎉</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Your affiliate application has been received. Here's your unique affiliate code:</p>
        <div style="background: rgba(74,0,224,0.2); border: 1px solid rgba(74,0,224,0.3); border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
          <p style="color: rgba(255,255,255,0.5); margin: 0 0 8px 0; font-size: 12px;">YOUR AFFILIATE CODE</p>
          <p style="color: #FF8A3D; font-size: 24px; font-weight: bold; margin: 0;">${affiliateCode}</p>
        </div>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Share your code with traders and earn up to 50% commission on every sale. The more referrals, the higher your tier!</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function paymentConfirmationEmail(name: string, email: string, txnId: string, amount: string, productInfo: string) {
  return sendEmail({
    to: email,
    subject: `Payment Confirmed — ${productInfo} | FundedWealth`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #22c55e; margin-bottom: 16px;">Payment Successful! ✅</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Hi <strong style="color: white;">${name}</strong>, your payment has been confirmed.</p>
        <div style="background: rgba(74,0,224,0.2); border: 1px solid rgba(74,0,224,0.3); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="color: rgba(255,255,255,0.5); padding: 6px 0; font-size: 13px;">Plan</td><td style="color: white; font-weight: bold; text-align: right; font-size: 13px;">${productInfo}</td></tr>
            <tr><td style="color: rgba(255,255,255,0.5); padding: 6px 0; font-size: 13px;">Amount</td><td style="color: #FF8A3D; font-weight: bold; text-align: right; font-size: 13px;">₹${amount}</td></tr>
            <tr><td style="color: rgba(255,255,255,0.5); padding: 6px 0; font-size: 13px;">Transaction ID</td><td style="color: rgba(255,255,255,0.7); text-align: right; font-size: 12px; font-family: monospace;">${txnId}</td></tr>
          </table>
        </div>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Your trading account credentials will be sent to your email within 12 hours. If you chose an instant plan, check your dashboard now!</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function challengeStartedEmail(name: string, email: string, accountSize: string, phase: string) {
  return sendEmail({
    to: email,
    subject: `Your ${phase} Challenge Has Started! | FundedWealth`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #FF8A3D; margin-bottom: 16px;">Your Challenge is Live! 🚀</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Hi <strong style="color: white;">${name}</strong>, your <strong style="color: #FF8A3D;">${accountSize}</strong> ${phase} account is now active.</p>
        <div style="background: rgba(74,0,224,0.2); border: 1px solid rgba(74,0,224,0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">📊 Log into your dashboard to start trading and track your progress.</p>
        </div>
        <p style="color: rgba(255,255,255,0.6); line-height: 1.6; font-size: 13px;">Remember: Min 5 trading days, max 5% daily loss, max 10% drawdown. Trade smart!</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function kycStatusEmail(name: string, email: string, status: "submitted" | "approved" | "rejected", reason?: string) {
  const titles: Record<string, string> = {
    submitted: "KYC Received — Under Review",
    approved: "KYC Approved! ✅",
    rejected: "KYC Update Required",
  };
  const bodies: Record<string, string> = {
    submitted: "We've received your KYC documents and they are currently under review. This usually takes 24-48 hours.",
    approved: "Your identity has been verified! You now have full access to payouts and higher account limits.",
    rejected: `Unfortunately, we couldn't verify your documents. ${reason || "Please re-submit with clearer copies."}`,
  };
  const colors: Record<string, string> = { submitted: "#3b82f6", approved: "#22c55e", rejected: "#ef4444" };

  return sendEmail({
    to: email,
    subject: `${titles[status]} | FundedWealth`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: ${colors[status]}; margin-bottom: 16px;">${titles[status]}</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Hi <strong style="color: white;">${name}</strong>,</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">${bodies[status]}</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export async function sendKycStatusEmail(name: string, email: string, subject: string) {
  return sendEmail({
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <h2 style="color: #FF8A3D; margin-bottom: 16px;">${subject}</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Hi ${name},</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Your KYC application has been submitted and is under review.</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India\'s #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export async function sendKycApprovedEmail(name: string, email: string) {
  return sendEmail({
    to: email,
    subject: "KYC Approved — Welcome to FundedWealth! ✅",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #22c55e; margin-bottom: 16px;">Congratulations! Your KYC is Approved ✅</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Hi <strong style="color: white;">${name}</strong>,</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Your identity verification has been completed successfully. You now have <strong>full access</strong> to:</p>
        <ul style="color: rgba(255,255,255,0.7); line-height: 1.8; margin: 20px 0; padding-left: 24px;">
          <li>💰 Request and receive payouts</li>
          <li>📈 Access all trading accounts</li>
          <li>🎯 Participate in all challenges</li>
          <li>🏆 Higher account limits</li>
        </ul>
        <div style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;">🔒 Your identity information is encrypted and secure. Your data will never be shared with third parties.</p>
        </div>
        <p style="color: rgba(255,255,255,0.6); line-height: 1.6; margin-top: 20px;">This verification is valid for 12 months. We'll notify you when it's time to renew.</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export async function sendKycRejectedEmail(name: string, email: string, reason: string) {
  return sendEmail({
    to: email,
    subject: "KYC Verification Update — Action Required",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #ef4444; margin-bottom: 16px;">KYC Verification Update</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Hi <strong style="color: white;">${name}</strong>,</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">We were unable to verify your identity documents at this time. This could be due to:</p>
        <div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 16px; margin: 20px 0;">
          <p style="color: rgba(255,255,255,0.8); margin: 0; font-size: 14px;"><strong>Reason:</strong> ${reason}</p>
        </div>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;"><strong>What to do next:</strong></p>
        <ul style="color: rgba(255,255,255,0.7); line-height: 1.8; padding-left: 24px;">
          <li>📸 Upload clearer, higher-resolution photos</li>
          <li>✅ Ensure all details match your official documents</li>
          <li>💡 Make sure text is legible and documents aren't expired</li>
          <li>🔄 You can resubmit your documents immediately</li>
        </ul>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Once you resubmit, our team will review your application again within 24-48 hours.</p>
        <p style="color: rgba(255,255,255,0.6); line-height: 1.6; font-size: 13px;">If you have questions, reach out to our support team at <strong>support@fundedwealth.com</strong></p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FundedWealth — India's #1 Prop Trading Firm</p>
      </div>
    `,
  });
}

export function donationThankYouEmail(name: string, email: string, amount: number, category: string) {
  return sendEmail({
    to: email,
    subject: "Thank You for Your Donation — FW Impact Initiative",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1A0030; color: white; padding: 40px; border-radius: 16px;">
        <img src="https://fundedwealth.com/logo.png" alt="FundedWealth" style="height: 40px; margin-bottom: 24px;" />
        <h2 style="color: #D63384; margin-bottom: 16px;">Thank You, ${name}! ❤️</h2>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">Your donation of <strong style="color: #FF8A3D;">₹${amount}</strong> towards <strong style="color: white;">${category}</strong> has been received.</p>
        <p style="color: rgba(255,255,255,0.7); line-height: 1.6;">You're making a real difference in someone's life. Every contribution counts!</p>
        <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 24px 0;" />
        <p style="color: rgba(255,255,255,0.4); font-size: 12px;">FW Impact Initiative — Making Profits Meaningful</p>
      </div>
    `,
  });
}
