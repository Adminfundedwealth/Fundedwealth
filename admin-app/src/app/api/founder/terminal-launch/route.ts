export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireFounderInHandler } from '@/lib/security/require-auth';

const TERMINAL_API_URL = 'https://new-terminal-production.up.railway.app';
const TERMINAL_PUBLIC_URL = 'https://charts.fundedwealth.com';

/**
 * POST /api/founder/terminal-launch
 *
 * Generates a short-lived SSO handoff for an existing trading account.
 *
 * Flow:
 *   1. Founder auth
 *   2. Resolve trading_account and verify the requested account
 *   3. Ask the active terminal service to create a one-time handoff
 *   4. Return the token for a POST to charts.fundedwealth.com
 *
 * Env required:
 *   SSO_API_KEY or SSO_SHARED_SECRET — server-to-server trust key
 */
export async function POST(request: NextRequest) {
  try {
    // ── 1. Auth ──────────────────────────────────────────────────────────────
    const { error: authError } = await requireFounderInHandler();
    if (authError) return authError;

    const body = await request.json();
    const { trading_account_id } = body as {
      trading_account_id?: string;
    };

    const accountId = trading_account_id?.trim();
    if (!accountId || accountId.length > 128) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Provide a valid trading_account_id' } },
        { status: 400 },
      );
    }

    const SSO_API_KEY = process.env.SSO_API_KEY || process.env.SSO_SHARED_SECRET || '';

    if (!SSO_API_KEY) {
      return NextResponse.json(
        { error: { code: 'CONFIGURATION_ERROR', message: 'SSO_API_KEY not configured. Add it to environment variables.' } },
        { status: 500 },
      );
    }

    const supabase = createAdminClient();
    const { data: account, error: accountError } = await supabase
      .from('trading_accounts')
      .select('account_code')
      .eq('id', accountId)
      .single();

    if (accountError || !account?.account_code) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Trading account or terminal account mapping not found' } },
        { status: 404 },
      );
    }

    try {
      const terminalRes = await fetch(`${TERMINAL_API_URL}/auth/sso/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-sso-api-key': SSO_API_KEY,
        },
        body: JSON.stringify({ accountId: account.account_code }),
        signal: AbortSignal.timeout(10000),
      });

      if (!terminalRes.ok) {
        console.error('[terminal-launch] Terminal SSO generation rejected', { status: terminalRes.status });
        return NextResponse.json(
          {
            error: {
              code: 'SSO_GENERATE_FAILED',
              message: 'Terminal SSO is temporarily unavailable. Please try again later.',
            },
          },
          { status: 502 },
        );
      }

      const terminalData = await terminalRes.json() as {
        success?: boolean;
        token?: string;
        expiresIn?: number;
      };

      if (!terminalData.success || !terminalData.token) {
        return NextResponse.json(
          {
            error: {
              code: 'SSO_GENERATE_FAILED',
              message: 'Terminal SSO returned an invalid handoff. Contact support.',
            },
          },
          { status: 502 },
        );
      }

      return NextResponse.json({
        success: true,
        sso_token: terminalData.token,
        terminal_url: TERMINAL_PUBLIC_URL,
        expires_in: terminalData.expiresIn ?? 60,
      });
    } catch {
      console.error('[terminal-launch] Terminal SSO service unavailable');
      return NextResponse.json(
        {
          error: {
            code: 'TERMINAL_UNREACHABLE',
            message: 'Terminal SSO is temporarily unavailable. Please try again later.',
          },
        },
        { status: 502 },
      );
    }

  } catch (err) {
    console.error('[terminal-launch] Unhandled error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to generate terminal launch URL' } },
      { status: 500 },
    );
  }
}
