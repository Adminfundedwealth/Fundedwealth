'use client';

import { useState } from 'react';
import { Loader2, X, AlertTriangle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createRefundCase, checkOrderRefundCase } from '@/lib/api/refunds';
import { apiFetch } from '@/lib/api/fetch';

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface OrderLookup {
  id: string;
  user_id: string;
  amount: number;
  plan_type: string;
  payment_method: string;
  utr_reference: string | null;
  status: string;
  created_at: string;
}

interface UserLookup {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}export function CreateRefundCaseModal({ open, onClose, onCreated }: Props) {
  const [step,           setStep]          = useState<'lookup' | 'fill'>('lookup');
  const [lookupValue,    setLookupValue]   = useState('');
  const [lookupLoading,  setLookupLoading] = useState(false);
  const [lookupError,    setLookupError]   = useState('');
  const [order,          setOrder]         = useState<Record<string, any> | null>(null);
  const [user,           setUser]          = useState<Record<string, any> | null>(null);
  const [existingCase,   setExistingCase]  = useState<{ id: string; status: string } | null>(null);

  // Form fields
  const [refundAmount,    setRefundAmount]   = useState('');
  const [reason,          setReason]         = useState('');
  const [supportTicketId, setSupportTicketId]= useState('');
  const [supportNote,     setSupportNote]    = useState('');
  const [submitting,      setSubmitting]     = useState(false);
  const [submitError,     setSubmitError]    = useState('');

  function reset() {
    setStep('lookup');
    setLookupValue('');
    setLookupError('');
    setOrder(null);
    setUser(null);
    setExistingCase(null);
    setRefundAmount('');
    setReason('');
    setSupportTicketId('');
    setSupportNote('');
    setSubmitError('');
  }

  async function handleLookup() {
    if (!lookupValue.trim()) return;
    setLookupLoading(true);
    setLookupError('');
    setOrder(null);
    setUser(null);
    setExistingCase(null);

    try {
      // Lookup via Admin OS server-side API (uses service role, no RLS issues)
      const encoded = encodeURIComponent(lookupValue.trim());
      const res = await apiFetch(`/api/refunds/orders/${encoded}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: { message: 'Lookup failed' } }));
        setLookupError(err?.error?.message ?? 'Order not found');
        return;
      }
      const { order: foundOrder, user: foundUser } = await res.json();

      if (!foundOrder) {
        setLookupError('Order not found. Enter a valid Order ID or the customer\'s email address.');
        return;
      }

      // Check for existing active refund case
      const check = await checkOrderRefundCase(foundOrder.id);

      setOrder(foundOrder);
      setUser(foundUser ?? null);
      setRefundAmount(String(foundOrder.amount));
      if (check.hasActiveCase && check.activeCase) {
        setExistingCase(check.activeCase);
      }
      setStep('fill');
    } catch (e: any) {
      setLookupError(e.message ?? 'Lookup failed');
    } finally {
      setLookupLoading(false);
    }
  }

  async function handleSubmit() {
    if (!order || !user) return;
    if (!reason.trim() || reason.length < 5) {
      setSubmitError('Reason must be at least 5 characters.');
      return;
    }
    const amount = parseFloat(refundAmount);
    if (!amount || amount <= 0) {
      setSubmitError('Enter a valid refund amount.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      await createRefundCase({
        orderId:          order.id,
        userId:           user.id,
        refundAmount:     amount,
        reason:           reason.trim(),
        paymentMethod:    order.payment_method,
        paymentReference: order.utr_reference ?? undefined,
        supportTicketId:  supportTicketId.trim() || undefined,
        supportNote:      supportNote.trim() || undefined,
      });
      reset();
      onCreated();
    } catch (e: any) {
      setSubmitError(e.message ?? 'Failed to create refund case');
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
        onClick={() => { reset(); onClose(); }}
        aria-hidden
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-label="Create Refund Case"
        className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border rounded-xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0">
          <div>
            <h2 className="text-sm font-semibold">Create Refund Case</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Support-first: convert customer complaint to formal refund case</p>
          </div>
          <button
            onClick={() => { reset(); onClose(); }}
            className="p-1.5 rounded-md hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Step 1: Order lookup */}
          {step === 'lookup' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Enter the <strong>Order ID</strong> or <strong>customer email</strong> to look up the order.
              </p>
              <div className="flex gap-2">
                <Input
                  className="flex-1 text-sm"
                  placeholder="Order ID or customer email..."
                  value={lookupValue}
                  onChange={e => setLookupValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleLookup()}
                  autoFocus
                />
                <Button size="sm" onClick={handleLookup} disabled={lookupLoading || !lookupValue.trim()}>
                  {lookupLoading
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    : <Search className="h-3.5 w-3.5" />
                  }
                </Button>
              </div>
              {lookupError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {lookupError}
                </p>
              )}
            </div>
          )}

          {/* Step 2: Fill case details */}
          {step === 'fill' && order && user && (
            <div className="space-y-4">
              {/* Existing case warning */}
              {existingCase && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Active Refund Case Exists
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Case <span className="font-mono">{existingCase.id.slice(0, 8).toUpperCase()}</span> is already{' '}
                    <strong>{existingCase.status}</strong> for this order.
                    Creating another case will fail. Review the existing case instead.
                  </p>
                </div>
              )}

              {/* Order summary */}
              <div className="rounded-md border bg-muted/20 p-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">{order.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Plan</span>
                  <span>{order.plan_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Amount</span>
                  <span className="font-semibold">₹{Number(order.amount).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment</span>
                  <span>{order.payment_method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Order Status</span>
                  <span>{order.status}</span>
                </div>
              </div>

              {/* Refund amount */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Refund Amount (₹)</label>
                <Input
                  type="number"
                  className="text-sm"
                  value={refundAmount}
                  onChange={e => setRefundAmount(e.target.value)}
                  min={1}
                  max={order.amount}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">Maximum: ₹{Number(order.amount).toLocaleString('en-IN')}</p>
              </div>

              {/* Reason */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Customer Reason <span className="text-red-500">*</span></label>
                <Textarea
                  className="text-sm h-20 resize-none"
                  placeholder="Describe the customer's reason as conveyed via support channel..."
                  value={reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
                />
              </div>

              {/* Support ticket ID */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Support Ticket / Conversation ID</label>
                <Input
                  className="text-sm"
                  placeholder="Ticket #, conversation ID, or chat reference (optional)"
                  value={supportTicketId}
                  onChange={e => setSupportTicketId(e.target.value)}
                />
              </div>

              {/* Internal note */}
              <div className="space-y-1">
                <label className="text-xs font-medium">Internal Support Note</label>
                <Textarea
                  className="text-sm h-16 resize-none"
                  placeholder="Internal context for the Finance team (not sent to customer)..."
                  value={supportNote}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSupportNote(e.target.value)}
                />
              </div>

              {submitError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {submitError}
                </p>
              )}

              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setStep('lookup')}>
                  ← Back
                </Button>
                <Button
                  size="sm"
                  disabled={submitting || !!existingCase || reason.length < 5}
                  onClick={handleSubmit}
                  className="flex-1"
                >
                  {submitting
                    ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Creating…</>
                    : 'Create Refund Case'
                  }
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
