'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, RefreshCw, User, ShoppingCart, CreditCard,
  BarChart2, ShieldCheck, AlertTriangle, CheckCircle2,
  XCircle, Clock, MessageSquare, Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { RefundStatusBadge } from '@/components/shared/refund-status-badge';
import {
  getRefundCase, getTradingEvidence, startReview, requestMoreInfo,
  approveRefund, rejectRefund, processRefund, completeRefund,
  failRefund, cancelRefund,
  type RefundCaseDetail, type TradingEvidence, REJECTION_REASONS, type RejectionReason,
} from '@/lib/api/refunds';
import { formatCurrency } from '@/lib/utils';

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">{children}</CardContent>
    </Card>
  );
}

function Field({ label, value, mono = false }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1 border-b border-border/40 last:border-0">
      <span className="text-muted-foreground shrink-0 w-40 text-xs">{label}</span>
      <span className={`text-right text-xs font-medium break-all ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-muted-foreground/50">—</span>}
      </span>
    </div>
  );
}

function EligibilityRow({ label, pass, fail, warning }: { label: string; pass: boolean; fail?: boolean; warning?: boolean }) {
  const icon = fail
    ? <XCircle className="h-3.5 w-3.5 text-red-500" />
    : warning
    ? <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
    : pass
    ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
    : <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />;
  const color = fail ? 'text-red-600' : warning ? 'text-amber-600' : pass ? 'text-emerald-600' : 'text-amber-600';
  const verdict = fail ? 'FAIL' : warning ? 'REVIEW' : pass ? 'PASS' : 'REVIEW';
  return (
    <div className="flex items-center justify-between py-1 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`flex items-center gap-1 text-xs font-semibold ${color}`}>
        {icon} {verdict}
      </span>
    </div>
  );
}

// ─── Action Panels ────────────────────────────────────────────────────────────

function ActionPanel({
  detail,
  onAction,
  busy,
}: {
  detail: RefundCaseDetail;
  onAction: (action: string, payload?: Record<string, string>) => Promise<void>;
  busy: boolean;
}) {
  const { status } = detail.refundCase;
  const [note,           setNote]           = useState('');
  const [rejReason,      setRejReason]      = useState<RejectionReason>(REJECTION_REASONS[0]);
  const [rejNote,        setRejNote]        = useState('');
  const [infoText,       setInfoText]       = useState('');
  const [gatewayRef,     setGatewayRef]     = useState('');
  const [refundMethod,   setRefundMethod]   = useState('');

  if (['REFUNDED', 'CANCELLED'].includes(status)) {
    return (
      <div className="rounded-md border bg-muted/30 px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
        This case is in a terminal state: <strong>{status}</strong>. No further actions available.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* PENDING → begin review */}
      {status === 'PENDING' && (
        <div className="rounded-md border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Begin Review</p>
          <p className="text-sm text-muted-foreground">Mark this case as Under Review to begin your assessment.</p>
          <Button size="sm" disabled={busy} onClick={() => onAction('review')}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Start Review
          </Button>
        </div>
      )}

      {/* Request More Info */}
      {['PENDING', 'UNDER_REVIEW'].includes(status) && (
        <div className="rounded-md border p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Request More Information</p>
          <Textarea
            className="text-sm h-20 resize-none"
            placeholder="Describe what additional information is needed from the customer..."
            value={infoText}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInfoText(e.target.value)}
          />
          <Button size="sm" variant="outline" disabled={busy || infoText.length < 10}
            onClick={() => onAction('request-info', { infoRequested: infoText })}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Request Information
          </Button>
        </div>
      )}

      {/* Approve */}
      {['PENDING', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'].includes(status) && (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            Approve Refund
          </p>
          <Textarea
            className="text-sm h-16 resize-none"
            placeholder="Optional internal approval note..."
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
          />
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={busy} onClick={() => onAction('approve', { approveNote: note })}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Approve Refund
          </Button>
        </div>
      )}

      {/* Reject */}
      {['PENDING', 'UNDER_REVIEW', 'MORE_INFORMATION_REQUIRED'].includes(status) && (
        <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
            Reject Refund
          </p>
          <select
            className="w-full text-sm border border-border rounded-md px-3 py-2 bg-background"
            value={rejReason}
            onChange={e => setRejReason(e.target.value as RejectionReason)}
          >
            {REJECTION_REASONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <Textarea
            className="text-sm h-16 resize-none"
            placeholder="Optional explanation to include in customer email..."
            value={rejNote}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejNote(e.target.value)}
          />
          <Button size="sm" variant="destructive" disabled={busy}
            onClick={() => onAction('reject', { rejectionReason: rejReason, rejectionNote: rejNote })}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Reject Refund
          </Button>
        </div>
      )}

      {/* Process (APPROVED → PROCESSING) */}
      {status === 'APPROVED' && (
        <div className="rounded-md border border-purple-500/20 bg-purple-500/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
            Initiate Processing
          </p>
          <p className="text-xs text-muted-foreground">
            Record the gateway refund ID after initiating through your payment gateway/dashboard.
            Leave blank for manual/UPI refunds.
          </p>
          <Input className="text-sm h-8" placeholder="Gateway Refund ID (optional)"
            value={gatewayRef} onChange={e => setGatewayRef(e.target.value)} />
          <Input className="text-sm h-8" placeholder="Refund method (e.g. UPI, Razorpay, Bank Transfer)"
            value={refundMethod} onChange={e => setRefundMethod(e.target.value)} />
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white"
            disabled={busy}
            onClick={() => onAction('process', { gatewayRefundId: gatewayRef, refundMethod })}>
            {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Mark as Processing
          </Button>
        </div>
      )}

      {/* Complete (PROCESSING → REFUNDED) */}
      {status === 'PROCESSING' && (
        <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-2">
          <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
            Confirm Completion
          </p>
          <p className="text-xs text-muted-foreground">
            Only mark complete after the payment gateway confirms the refund was successfully processed.
          </p>
          <Input className="text-sm h-8" placeholder="Gateway Refund ID (if not set above)"
            value={gatewayRef} onChange={e => setGatewayRef(e.target.value)} />
          <div className="flex gap-2">
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={busy}
              onClick={() => onAction('complete', { gatewayRefundId: gatewayRef, completionNote: note })}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Mark Refunded
            </Button>
            <Button size="sm" variant="destructive" disabled={busy}
              onClick={() => onAction('fail', { failureNote: note })}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
              Mark Failed
            </Button>
          </div>
        </div>
      )}

      {/* Cancel */}
      {!['REFUNDED', 'CANCELLED', 'PROCESSING'].includes(status) && (
        <div className="pt-1">
          <Button size="sm" variant="ghost" className="text-muted-foreground text-xs"
            disabled={busy}
            onClick={() => onAction('cancel', { cancelNote: 'Cancelled by admin' })}>
            Cancel Case
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function RefundCaseDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [detail,   setDetail]   = useState<RefundCaseDetail | null>(null);
  const [evidence, setEvidence] = useState<TradingEvidence | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState('');
  const [busy,     setBusy]     = useState(false);
  const [toast,    setToast]    = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [d, ev] = await Promise.all([
        getRefundCase(id),
        getTradingEvidence(id).catch(() => null),
      ]);
      setDetail(d);
      setEvidence(ev);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleAction(action: string, payload: Record<string, string> = {}) {
    setBusy(true);
    try {
      switch (action) {
        case 'review':       await startReview(id); break;
        case 'request-info': await requestMoreInfo(id, payload.infoRequested); break;
        case 'approve':      await approveRefund(id, payload.approveNote); break;
        case 'reject':       await rejectRefund(id, payload.rejectionReason as RejectionReason, payload.rejectionNote); break;
        case 'process':      await processRefund(id, { gatewayRefundId: payload.gatewayRefundId, refundMethod: payload.refundMethod }); break;
        case 'complete':     await completeRefund(id, { gatewayRefundId: payload.gatewayRefundId, completionNote: payload.completionNote }); break;
        case 'fail':         await failRefund(id, payload.failureNote); break;
        case 'cancel':       await cancelRefund(id, payload.cancelNote); break;
      }
      showToast('Case updated successfully', 'success');
      await load();
    } catch (e: any) {
      showToast(e.message ?? 'Action failed', 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingState rows={12} />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (!detail) return null;

  const { refundCase, customer, order, eligibility, previousRefunds } = detail;
  const elig = eligibility;
  // Access metadata-stored fields via _meta or metadata
  const meta = (refundCase as any)._meta ?? refundCase.metadata ?? {};

  return (
    <div className="space-y-5 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-md px-4 py-2.5 text-sm font-medium shadow-lg
          ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/finance/refunds')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold">
              Refund Case <span className="font-mono text-base">{refundCase.id.slice(0, 8).toUpperCase()}</span>
            </h1>
            <RefundStatusBadge status={refundCase.status} size="md" />
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Requested {new Date(refundCase.requestedAt).toLocaleString('en-IN')}
            {meta.support_agent_id && ` · Created by support agent`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={busy}>
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${busy ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* LEFT COLUMN — context data */}
        <div className="lg:col-span-2 space-y-4">

          {/* Customer */}
          <Section title="Customer" icon={User}>
            <Field label="Name"           value={customer?.name} />
            <Field label="Email"          value={customer?.email} />
            <Field label="User ID"        value={customer?.id}    mono />
            <Field label="Phone"          value={customer?.phone} />
            <Field label="Role"           value={customer?.role} />
            <Field label="Account Status" value={customer?.accountStatus} />
          </Section>

          {/* Order */}
          <Section title="Order" icon={ShoppingCart}>
            <Field label="Order ID"      value={order?.id?.slice(0, 8).toUpperCase()} mono />
            <Field label="Full Order ID" value={order?.id} mono />
            <Field label="Purchase Date" value={order?.createdAt ? new Date(order.createdAt).toLocaleString('en-IN') : undefined} />
            <Field label="Plan"          value={order?.planType} />
            <Field label="Payment Type"  value={order?.paymentType} />
            <Field label="Account Size"  value={order?.accountSize ? `₹${Number(order.accountSize).toLocaleString('en-IN')}` : undefined} />
            <Field label="Purchase Amount" value={order?.amount != null ? formatCurrency(order.amount) : undefined} />
            <Field label="Order Status"  value={order?.status} />
          </Section>

          {/* Payment */}
          <Section title="Payment" icon={CreditCard}>
            <Field label="Payment Method"    value={order?.paymentMethod} />
            <Field label="Payment Reference" value={order?.utrReference} mono />
            <Field label="Original Amount"   value={order?.amount != null ? formatCurrency(order.amount) : undefined} />
            <Field label="Refund Amount"     value={formatCurrency(Number(refundCase.refundAmount))} />
            <Field label="Gateway Refund ID" value={refundCase.gatewayRefundId} mono />
            <Field label="Refund Method"     value={meta.refund_method as string} />
          </Section>

          {/* Refund case meta */}
          <Section title="Refund Case" icon={MessageSquare}>
            <Field label="Case ID"         value={refundCase.id} mono />
            <Field label="Status"          value={refundCase.status} />
            <Field label="Reason"          value={refundCase.reason} />
            <Field label="Support Ticket"  value={meta.support_ticket_id as string} />
            <Field label="Support Note"    value={meta.support_note as string} />
            <Field label="Rejection Reason" value={refundCase.rejectionReason} />
            <Field label="Rejection Note"  value={meta.rejection_note as string} />
            <Field label="Processed At"    value={refundCase.processedAt ? new Date(refundCase.processedAt).toLocaleString('en-IN') : undefined} />
            <Field label="Completed At"    value={meta.completed_at ? new Date(meta.completed_at as string).toLocaleString('en-IN') : undefined} />
          </Section>

          {/* Trading Evidence */}
          <Section title="Trading Evidence (Read-Only)" icon={BarChart2}>
            {!evidence || !evidence.available ? (
              <p className="text-xs text-muted-foreground italic">
                {evidence?.reason ?? 'Trading evidence unavailable'}
              </p>
            ) : (
              <div className="space-y-1">
                <Field label="Account Status"       value={evidence.summary?.accountStatus} />
                <Field label="Current Balance"      value={evidence.summary?.currentBalance != null ? formatCurrency(evidence.summary.currentBalance) : undefined} />
                <Field label="Trading Days"         value={String(evidence.summary?.tradingDaysCompleted ?? 0)} />
                <Field label="Has Trade Activity"   value={evidence.summary?.hasTradeActivity ? 'YES — trades placed' : 'NO — no trades'} />
                <Field label="Profit %"             value={evidence.summary?.profitPct != null ? `${Number(evidence.summary.profitPct).toFixed(2)}%` : undefined} />
                <Field label="Provisioning Status"  value={evidence.provisioningStatus} />
                {evidence.challengeAccount && (
                  <>
                    <Field label="Initial Balance"  value={formatCurrency(Number((evidence.challengeAccount as any).initial_balance))} />
                    <Field label="Max DD %"         value={String((evidence.challengeAccount as any).max_drawdown_limit_pct)} />
                    <Field label="Daily DD %"       value={String((evidence.challengeAccount as any).daily_drawdown_limit_pct)} />
                  </>
                )}
                {evidence.recentTrades && evidence.recentTrades.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">
                      Recent Trades ({evidence.recentTrades.length})
                    </p>
                    <div className="rounded border overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/30">
                          <tr>
                            {['Symbol','Dir','P&L','Status','Opened'].map(h => (
                              <th key={h} className="px-2 py-1 text-left font-medium text-muted-foreground">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {evidence.recentTrades.slice(0, 5).map((t: any, i) => (
                            <tr key={i} className="border-t border-border/40">
                              <td className="px-2 py-1 font-mono">{t.symbol}</td>
                              <td className="px-2 py-1 capitalize">{t.direction}</td>
                              <td className={`px-2 py-1 font-medium ${Number(t.profit_loss) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {t.profit_loss != null ? formatCurrency(Number(t.profit_loss)) : '—'}
                              </td>
                              <td className="px-2 py-1">{t.status}</td>
                              <td className="px-2 py-1 text-muted-foreground">
                                {new Date(t.opened_at).toLocaleDateString('en-IN')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </Section>

        </div>

        {/* RIGHT COLUMN — eligibility + actions */}
        <div className="space-y-4">

          {/* Eligibility Panel */}
          <Section title="Eligibility Assessment" icon={ShieldCheck}>
            <p className="text-xs text-muted-foreground mb-2">
              Evidence-based assessment. Admin makes the final decision.
            </p>
            <EligibilityRow
              label="Policy Window (48h)"
              pass={elig.withinPolicyWindow}
              fail={!elig.withinPolicyWindow}
            />
            <EligibilityRow
              label="No Previous Refund"
              pass={!elig.hasPreviousRefund}
              fail={elig.hasPreviousRefund}
            />
            <EligibilityRow
              label="Trading Activity"
              pass={!(evidence?.summary?.hasTradeActivity ?? false)}
              fail={evidence?.summary?.hasTradeActivity ?? false}
              warning={!evidence?.available}
            />
            <EligibilityRow
              label="Order Status"
              pass={elig.orderStatus === 'confirmed'}
              warning={elig.orderStatus === 'pending'}
            />
            <EligibilityRow
              label="Payment Verified"
              pass={!!order?.utrReference}
              warning={!order?.utrReference}
            />
          </Section>

          {/* Previous Refund Cases */}
          {previousRefunds.length > 0 && (
            <Section title="Previous Cases (Same Order)" icon={Clock}>
              {previousRefunds.map(r => (
                <div key={r.id} className="flex items-center justify-between py-1 text-xs border-b border-border/40 last:border-0">
                  <span className="font-mono text-muted-foreground">{r.id.slice(0, 8).toUpperCase()}</span>
                  <RefundStatusBadge status={r.status} size="sm" />
                </div>
              ))}
            </Section>
          )}

          {/* Decision Panel */}
          <Card className="border-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                Admin Decision
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActionPanel detail={detail} onAction={handleAction} busy={busy} />
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
