/**
 * Refund Operations API client — Admin OS
 *
 * Thin typed wrappers around the backend /api/refunds/* endpoints.
 * All requests go through apiFetch() which automatically attaches
 * CSRF tokens and session cookies.
 */

import { apiFetch } from './fetch';

const API = process.env.NEXT_PUBLIC_API_URL ?? '';

// ─── Types ────────────────────────────────────────────────────────────────────

export const REFUND_STATUSES = [
  'PENDING',
  'UNDER_REVIEW',
  'MORE_INFORMATION_REQUIRED',
  'APPROVED',
  'REJECTED',
  'PROCESSING',
  'REFUNDED',
  'FAILED',
  'CANCELLED',
] as const;

export type RefundStatus = (typeof REFUND_STATUSES)[number];

export const REJECTION_REASONS = [
  'Refund policy window expired',
  'Trading activity already started',
  'Account not eligible under published policy',
  'Duplicate refund request',
  'Payment could not be verified',
  'Refund already processed',
  'Insufficient information',
  'Other',
] as const;

export type RejectionReason = (typeof REJECTION_REASONS)[number];

export interface RefundCase {
  id: string;
  orderId: string;
  userId: string;
  refundAmount: string | number;
  reason: string;
  status: RefundStatus;
  // Production columns
  paymentMethod: string | null;
  paymentReference: string | null;
  gatewayRefundId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  requestedAt: string;
  processedAt: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  // Enriched by backend
  _meta?: RefundMeta;
  user?: { email: string; firstName: string | null; lastName: string | null } | null;
}

/** Typed metadata fields stored in metadata JSONB */
export interface RefundMeta {
  support_ticket_id?: string;
  support_agent_id?: string;
  support_note?: string;
  refund_method?: string;
  rejection_note?: string;
  completed_at?: string;
  approve_note?: string;
  approved_by?: string;
  approved_at?: string;
  process_note?: string;
  processed_by?: string;
  failure_note?: string;
  failed_by?: string;
  failed_at?: string;
  cancel_note?: string;
  cancelled_by?: string;
  cancelled_at?: string;
  info_requested?: string;
  info_requested_by?: string;
  info_requested_at?: string;
  source?: string;
  created_by_role?: string;
  [key: string]: unknown;
}

export interface RefundCaseDetail {
  refundCase: RefundCase & { _meta?: RefundMeta };
  customer: {
    id: string;
    email: string;
    name: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    role: string;
    accountStatus: string | null;
  } | null;
  order: {
    id: string;
    createdAt: string;
    planType: string;
    paymentType: string;
    accountSize: number | null;
    amount: number;
    status: string;
    paymentMethod: string;
    utrReference: string | null;
    metadata: string | null;
  } | null;
  eligibility: {
    withinPolicyWindow: boolean;
    hasPreviousRefund: boolean;
    orderStatus: string;
  };
  previousRefunds: { id: string; status: string; createdAt: string }[];
}

export interface TradingEvidence {
  available: boolean;
  reason?: string;
  provisioningStatus?: string;
  tradingAccount?: Record<string, unknown> | null;
  challengeAccount?: Record<string, unknown> | null;
  recentTrades?: Record<string, unknown>[];
  summary?: {
    hasTradeActivity: boolean;
    tradingDaysCompleted: number;
    currentBalance: number | null;
    accountStatus: string;
    profitPct: number | null;
  };
}

// ─── API helpers ──────────────────────────────────────────────────────────────

async function backendFetch(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}/api/refunds${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  return res;
}

// ─── List cases ───────────────────────────────────────────────────────────────

export async function listRefundCases(params: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const qs = new URLSearchParams();
  if (params.status)           qs.set('status',  params.status);
  if (params.search)           qs.set('search',  params.search);
  if (params.limit  != null)   qs.set('limit',   String(params.limit));
  if (params.offset != null)   qs.set('offset',  String(params.offset));

  const res = await backendFetch(`/cases?${qs.toString()}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    cases: RefundCase[];
    total: number;
    limit: number;
    offset: number;
    statusCounts: Record<string, number>;
  }>;
}

// ─── Get single case ──────────────────────────────────────────────────────────

export async function getRefundCase(id: string) {
  const res = await backendFetch(`/cases/${id}`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<RefundCaseDetail>;
}

// ─── Create case (support) ────────────────────────────────────────────────────

export async function createRefundCase(body: {
  orderId: string;
  userId: string;
  refundAmount: number;
  reason: string;
  paymentMethod?: string;
  paymentReference?: string;
  supportTicketId?: string;
  supportNote?: string;
}) {
  const res = await backendFetch('/cases', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error ?? 'Failed to create refund case');
  }
  return res.json() as Promise<{ success: true; refundCase: RefundCase }>;
}

// ─── Check order for existing case ───────────────────────────────────────────

export async function checkOrderRefundCase(orderId: string) {
  const res = await backendFetch(`/orders/${orderId}/check`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<{
    hasActiveCase: boolean;
    activeCase: { id: string; status: string; createdAt: string } | null;
    allCases: { id: string; status: string; createdAt: string }[];
  }>;
}

// ─── Lifecycle mutations ──────────────────────────────────────────────────────

export async function startReview(id: string) {
  const res = await backendFetch(`/cases/${id}/review`, { method: 'PATCH', body: '{}' });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function requestMoreInfo(id: string, infoRequested: string) {
  const res = await backendFetch(`/cases/${id}/request-info`, {
    method: 'PATCH',
    body: JSON.stringify({ infoRequested }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function approveRefund(id: string, approveNote?: string) {
  const res = await backendFetch(`/cases/${id}/approve`, {
    method: 'PATCH',
    body: JSON.stringify({ approveNote }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function rejectRefund(id: string, rejectionReason: RejectionReason, rejectionNote?: string) {
  const res = await backendFetch(`/cases/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ rejectionReason, rejectionNote }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function processRefund(id: string, body: {
  gatewayRefundId?: string;
  refundMethod?: string;
  processNote?: string;
}) {
  const res = await backendFetch(`/cases/${id}/process`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function completeRefund(id: string, body: {
  gatewayRefundId?: string;
  completionNote?: string;
}) {
  const res = await backendFetch(`/cases/${id}/complete`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function failRefund(id: string, failureNote?: string) {
  const res = await backendFetch(`/cases/${id}/fail`, {
    method: 'PATCH',
    body: JSON.stringify({ failureNote }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function cancelRefund(id: string, cancelNote?: string) {
  const res = await backendFetch(`/cases/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ cancelNote }),
  });
  if (!res.ok) throw new Error((await res.json()).error ?? 'Failed');
  return res.json();
}

export async function getTradingEvidence(id: string) {
  const res = await backendFetch(`/cases/${id}/trading-evidence`);
  if (!res.ok) throw new Error(await res.text());
  return res.json() as Promise<TradingEvidence>;
}
