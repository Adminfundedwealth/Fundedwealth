/**
 * test-smtp.mjs — Zoho SMTP integration smoke test
 *
 * Run from the api-server directory (nodemailer must be installed):
 *
 *   # With Railway env vars already set:
 *   node test-smtp.mjs <recipient@example.com>
 *
 *   # With .env file:
 *   node --env-file=../../.env.local test-smtp.mjs recipient@example.com
 *
 *   # Inline:
 *   SMTP_HOST=smtp.zoho.in SMTP_PORT=465 SMTP_USER=support@fundedwealth.com \
 *   SMTP_PASS=<app_password> SMTP_FROM=support@fundedwealth.com \
 *   SMTP_FROM_NAME=FundedWealth node test-smtp.mjs recipient@example.com
 *
 * Exit codes:
 *   0 — all checks passed
 *   1 — one or more failures
 */

import nodemailer from 'nodemailer';

const SMTP_HOST      = process.env.SMTP_HOST      ?? '';
const SMTP_PORT      = parseInt(process.env.SMTP_PORT ?? '465', 10);
const SMTP_SECURE    = process.env.SMTP_SECURE    !== 'false'; // default true
const SMTP_USER      = process.env.SMTP_USER      ?? '';
const SMTP_PASS      = process.env.SMTP_PASS      ?? '';
const SMTP_FROM      = process.env.SMTP_FROM      ?? SMTP_USER;
const SMTP_FROM_NAME = process.env.SMTP_FROM_NAME ?? 'FundedWealth';
const RECIPIENT      = process.argv[2] ?? '';

const FROM_HEADER = `${SMTP_FROM_NAME} <${SMTP_FROM}>`;

let passed = 0;
let failed = 0;

function ok(label, detail = '')   { console.log(`  ✅ PASS  ${label}${detail ? '  — ' + detail : ''}`); passed++; }
function fail(label, detail = '') { console.error(`  ❌ FAIL  ${label}${detail ? '  — ' + detail : ''}`); failed++; }
function check(label, cond, detail = '') { cond ? ok(label, detail) : fail(label, detail); }

console.log('\n══════════════════════════════════════════════════════');
console.log('  FundedWealth — Zoho SMTP Integration Test');
console.log('══════════════════════════════════════════════════════\n');

// ── 1. Env var checks ────────────────────────────────────────────────────────
console.log('① Environment variables');
check('SMTP_HOST set',             !!SMTP_HOST,                           SMTP_HOST || 'MISSING');
check('SMTP_HOST is smtp.zoho.in', SMTP_HOST === 'smtp.zoho.in',         SMTP_HOST);
check('SMTP_PORT is 465',          SMTP_PORT === 465,                     String(SMTP_PORT));
check('SMTP_SECURE is true',       SMTP_SECURE === true,                  String(SMTP_SECURE));
check('SMTP_USER set',             !!SMTP_USER,                           SMTP_USER || 'MISSING');
check('SMTP_USER domain correct',  SMTP_USER.endsWith('@fundedwealth.com'), SMTP_USER || 'MISSING');
check('SMTP_PASS set',             !!SMTP_PASS,                           SMTP_PASS ? '(hidden)' : 'MISSING');
check('SMTP_FROM set',             !!SMTP_FROM,                           SMTP_FROM || 'MISSING');
ok('From header',                  FROM_HEADER);
console.log();

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error('  Cannot continue — required SMTP env vars missing.\n');
  process.exit(1);
}

// ── 2. Transporter creation ──────────────────────────────────────────────────
console.log('② Transport configuration');
let transport;
try {
  transport = nodemailer.createTransport({
    host:  SMTP_HOST,
    port:  SMTP_PORT,
    secure: SMTP_SECURE,          // true → implicit SSL/TLS (port 465)
    auth:  { user: SMTP_USER, pass: SMTP_PASS },
    tls:   { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    connectionTimeout: 15_000,
    greetingTimeout:   15_000,
    socketTimeout:     30_000,
  });
  ok('Transporter created', `${SMTP_HOST}:${SMTP_PORT} secure=${SMTP_SECURE}`);
} catch (err) {
  fail('Transporter creation threw', err.message);
  process.exit(1);
}
console.log();

// ── 3. SMTP connection + AUTH verification ───────────────────────────────────
console.log('③ SMTP connection + authentication (may take a few seconds…)');
try {
  await transport.verify();
  ok('SMTP connect + AUTH', `connected to ${SMTP_HOST}:${SMTP_PORT} with TLS ✓`);
} catch (err) {
  fail('transport.verify()', err.message);
  console.error('\n  Likely causes:');
  console.error('    • Wrong SMTP_PASS — use Zoho App Password, not your account password');
  console.error('    • SMTP access not enabled in Zoho Mail → Settings → Mail Accounts → IMAP/SMTP');
  console.error('    • 2FA not enabled on Zoho (required to generate App Passwords)');
  console.error('    • IP filtering / security policy blocking Railway IPs\n');
  process.exit(1);
}
console.log();

// ── 4. Test email delivery ────────────────────────────────────────────────────
console.log('④ Test email delivery');
if (!RECIPIENT || !RECIPIENT.includes('@')) {
  console.log(`  ⚠️  SKIP  No recipient supplied.\n  Run:  node test-smtp.mjs yourname@example.com\n`);
} else {
  try {
    const info = await transport.sendMail({
      from:    FROM_HEADER,
      to:      RECIPIENT,
      subject: '[FundedWealth SMTP Test] Zoho SMTP verified ✓',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;
                    background:#1A0030;color:white;padding:40px;border-radius:16px;">
          <img src="https://fundedwealth.com/logo.png" alt="FundedWealth"
               style="height:40px;margin-bottom:24px;" />
          <h2 style="color:#22c55e;">SMTP Test Successful ✅</h2>
          <p style="color:rgba(255,255,255,0.8);">
            This email confirms that <strong>FundedWealth</strong> is correctly
            configured to send transactional email via <strong>Zoho SMTP</strong>.
          </p>
          <table style="width:100%;color:rgba(255,255,255,0.7);font-size:14px;margin-top:16px;">
            <tr>
              <td style="padding:4px 0;color:rgba(255,255,255,0.4);">SMTP Host</td>
              <td style="text-align:right;">${SMTP_HOST}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:rgba(255,255,255,0.4);">Port</td>
              <td style="text-align:right;">${SMTP_PORT} (implicit TLS)</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:rgba(255,255,255,0.4);">From</td>
              <td style="text-align:right;">${FROM_HEADER}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.1);margin:24px 0;" />
          <p style="color:rgba(255,255,255,0.4);font-size:12px;">
            FundedWealth — India's #1 Prop Trading Firm
          </p>
        </div>
      `,
      text:
        `SMTP Test Successful\n\n` +
        `Host: ${SMTP_HOST}:${SMTP_PORT} (implicit TLS)\n` +
        `From: ${FROM_HEADER}\n\n` +
        `FundedWealth — India's #1 Prop Trading Firm`,
    });
    ok('Test email sent', `messageId=${info.messageId}  to=${RECIPIENT}`);
  } catch (err) {
    fail('sendMail()', err.message);
  }
}
console.log();

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('══════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('══════════════════════════════════════════════════════\n');

process.exit(failed > 0 ? 1 : 0);
