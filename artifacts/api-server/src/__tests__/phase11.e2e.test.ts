// Phase 11: E2E Test Suite
// Tests the complete user journey: Signup → Challenge → Payment → Trading → Payout

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

interface TestContext {
  userId: string;
  accountId: string;
  challengeId: string;
  paymentId: string;
  sessionToken: string;
}

const API_BASE = process.env.API_URL || 'http://localhost:3000';
const ctx: TestContext = {} as TestContext;

const api = async (method: string, path: string, body?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
  };
  if (ctx.sessionToken) {
    headers['Authorization'] = `Bearer ${ctx.sessionToken}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json();
  return { status: response.status, data };
};

describe('Phase 11: E2E User Journey', () => {
  
  describe('1. Authentication & Signup', () => {
    it('should register a new user via Clerk', async () => {
      const { status, data } = await api('POST', '/api/auth/register', {
        email: `test-${Date.now()}@example.com`,
        firstName: 'Test',
        lastName: 'User',
        password: 'SecurePass123!',
      });

      expect(status).toBe(201);
      expect(data.userId).toBeDefined();
      ctx.userId = data.userId;
      ctx.sessionToken = data.sessionToken;
    });

    it('should fetch user profile', async () => {
      const { status, data } = await api('GET', '/api/users/me');
      expect(status).toBe(200);
      expect(data.id).toBe(ctx.userId);
    });
  });

  describe('2. Challenge Selection & Purchase', () => {
    it('should list available challenges', async () => {
      const { status, data } = await api('GET', '/api/challenge');
      expect(status).toBe(200);
      expect(Array.isArray(data.challenges)).toBe(true);
      expect(data.challenges.length).toBeGreaterThan(0);
      ctx.challengeId = data.challenges[0].id;
    });

    it('should fetch challenge rules', async () => {
      const { status, data } = await api('GET', `/api/challenge/${ctx.challengeId}`);
      expect(status).toBe(200);
      expect(data.maxLossPercent).toBeDefined();
      expect(data.dailyLossLimit).toBeDefined();
      expect(data.minBalance).toBeDefined();
    });

    it('should create a challenge account', async () => {
      const { status, data } = await api('POST', '/api/challenge', {
        challengeId: ctx.challengeId,
        accountType: 'LIVE', // or PAPER
      });

      expect(status).toBe(201);
      expect(data.accountId).toBeDefined();
      ctx.accountId = data.accountId;
    });
  });

  describe('3. Payment Processing', () => {
    it('should create a payment intent', async () => {
      const { status, data } = await api('POST', '/api/payments/intent', {
        accountId: ctx.accountId,
        amount: 50000, // INR
        currency: 'INR',
        challengeId: ctx.challengeId,
      });

      expect(status).toBe(201);
      expect(data.paymentId).toBeDefined();
      expect(data.amount).toBe(50000);
      ctx.paymentId = data.paymentId;
    });

    it('should verify payment completion', async () => {
      // Simulate Razorpay webhook
      const { status, data } = await api('POST', '/api/payments/webhook', {
        event: 'payment.authorized',
        payload: {
          payment_id: ctx.paymentId,
          amount: 50000,
          status: 'captured',
        },
      });

      expect(status).toBe(200);
    });

    it('should check account is funded', async () => {
      const { status, data } = await api('GET', `/api/accounts/${ctx.accountId}`);
      expect(status).toBe(200);
      expect(data.status).toBe('FUNDED');
      expect(data.balance).toBe(50000);
    });
  });

  describe('4. Account Lifecycle', () => {
    it('should provision trading account', async () => {
      const { status, data } = await api('POST', `/api/accounts/${ctx.accountId}/provision`, {});
      expect(status).toBe(200);
      expect(data.status).toMatch(/ACTIVE|PROVISIONING/);
    });

    it('should sync account with broker', async () => {
      const { status, data } = await api('POST', `/api/accounts/${ctx.accountId}/sync`, {});
      expect(status).toBe(200);
    });
  });

  describe('5. Trading & Order Execution', () => {
    it('should place a buy order', async () => {
      const { status, data } = await api('POST', '/api/orders', {
        accountId: ctx.accountId,
        symbol: 'INFY',
        side: 'BUY',
        quantity: 10,
        price: 1500,
        orderType: 'LIMIT',
      });

      expect(status).toBe(201);
      expect(data.orderId).toBeDefined();
      expect(data.status).toMatch(/PENDING|ACCEPTED/);
    });

    it('should place a sell order', async () => {
      const { status, data } = await api('POST', '/api/orders', {
        accountId: ctx.accountId,
        symbol: 'INFY',
        side: 'SELL',
        quantity: 5,
        price: 1550,
        orderType: 'LIMIT',
      });

      expect(status).toBe(201);
    });

    it('should fetch account positions', async () => {
      const { status, data } = await api('GET', `/api/accounts/${ctx.accountId}/positions`);
      expect(status).toBe(200);
      expect(Array.isArray(data.positions)).toBe(true);
    });

    it('should calculate PnL', async () => {
      const { status, data } = await api('GET', `/api/accounts/${ctx.accountId}/pnl`);
      expect(status).toBe(200);
      expect(data.totalPnL).toBeDefined();
      expect(data.unrealizedPnL).toBeDefined();
    });
  });

  describe('6. Challenge Progress Tracking', () => {
    it('should track daily PnL', async () => {
      const { status, data } = await api('GET', `/api/challenge/${ctx.accountId}/progress`);
      expect(status).toBe(200);
      expect(data.daysPassed).toBeDefined();
      expect(data.currentPnL).toBeDefined();
    });

    it('should detect breach (if loss exceeds limit)', async () => {
      // This test assumes the account has exceeded the loss limit
      const { status, data } = await api('GET', `/api/challenge/${ctx.accountId}/status`);
      expect(status).toBe(200);
      if (data.status === 'BREACHED') {
        expect(data.breachReason).toBeDefined();
      }
    });

    it('should determine pass/fail on completion', async () => {
      const { status, data } = await api('GET', `/api/challenge/${ctx.accountId}/result`);
      expect(status).toBe(200);
      expect(['PASSED', 'FAILED', 'PENDING']).toContain(data.result);
    });
  });

  describe('7. KYC Process', () => {
    it('should initiate KYC submission', async () => {
      const { status, data } = await api('POST', '/api/kyc', {
        accountId: ctx.accountId,
      });

      expect(status).toBe(201);
      expect(data.kycId).toBeDefined();
    });

    it('should upload KYC documents', async () => {
      const { status, data } = await api('POST', '/api/kyc/documents', {
        kycId: data.kycId,
        documentType: 'PAN',
        fileUrl: 'https://example.com/pan.pdf',
      });

      expect(status).toBe(201);
    });

    it('should track KYC status', async () => {
      const { status, data } = await api('GET', `/api/kyc/${data.kycId}`);
      expect(status).toBe(200);
      expect(['PENDING', 'APPROVED', 'REJECTED']).toContain(data.status);
    });
  });

  describe('8. Payout Request & Approval', () => {
    it('should check payout eligibility', async () => {
      const { status, data } = await api('GET', `/api/challenge/${ctx.accountId}/payout-eligibility`);
      expect(status).toBe(200);
      expect(data.eligible).toBeDefined();
    });

    it('should create payout request', async () => {
      const { status, data } = await api('POST', '/api/payouts', {
        accountId: ctx.accountId,
        amount: 50000,
        bankAccountId: 'bank-123',
      });

      expect(status).toBe(201);
      expect(data.payoutId).toBeDefined();
      expect(data.status).toBe('PENDING_REVIEW');
    });

    it('should approve payout (as admin)', async () => {
      // Switch to admin token
      const adminToken = process.env.ADMIN_TOKEN;
      const { status, data } = await api('PATCH', `/api/admin/payouts/${data.payoutId}`, {
        status: 'APPROVED',
        notes: 'Approved for launch testing',
      });

      expect(status).toBe(200);
      expect(data.status).toBe('APPROVED');
    });
  });

  describe('9. Payout Completion', () => {
    it('should trigger payout disbursement', async () => {
      const { status, data } = await api('POST', '/api/payouts/execute', {
        payoutId: data.payoutId,
      });

      expect(status).toBe(200);
    });

    it('should track payout status', async () => {
      const { status, data } = await api('GET', `/api/payouts/${data.payoutId}`);
      expect(status).toBe(200);
      expect(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).toContain(data.status);
    });

    it('should verify funds received (after webhook)', async () => {
      // Simulate bank webhook
      await api('POST', '/api/payouts/webhook', {
        event: 'payout.completed',
        payload: {
          payout_id: data.payoutId,
          status: 'completed',
        },
      });

      const { status: checkStatus, data: payoutData } = await api('GET', `/api/payouts/${data.payoutId}`);
      expect(checkStatus).toBe(200);
      expect(payoutData.status).toBe('COMPLETED');
    });
  });

  describe('10. Notifications Verification', () => {
    it('should have sent signup confirmation email', async () => {
      const { status, data } = await api('GET', `/api/notifications?userId=${ctx.userId}&type=EMAIL`);
      expect(status).toBe(200);
      expect(data.some((n: any) => n.subject.includes('signup'))).toBe(true);
    });

    it('should have sent payout confirmation email', async () => {
      const { status, data } = await api('GET', `/api/notifications?accountId=${ctx.accountId}&type=PAYOUT`);
      expect(status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
    });
  });
});
