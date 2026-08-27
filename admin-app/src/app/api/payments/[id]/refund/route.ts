export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthenticatedStaff } from '@/lib/auth/get-staff';
import { auditLogger } from '@/lib/audit/logger';
import { z } from 'zod';

const refundSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
  amount: z.number().positive().optional(),
});

/**
 * POST /api/payments/[id]/refund
 *
 * Compatibility endpoint: initiates a refund from the payments detail view.
 * Creates a refund_request case with APPROVED status and marks the order
 * as refunded. This is the "admin direct refund" path for Finance/Founder.
 *
 * Canonical table: public.refund_requests (NOT the nonexistent refund_records)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const actor = await getAuthenticatedStaff();
    if (!actor) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    if (!actor.isFullAccess && !actor.permissions.includes('payments.manage')) {
      return NextResponse.json(
        { error: { code: 'FORBIDDEN', message: 'payments.manage permission required' } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = refundSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const orderId = params.id;

    // Fetch the order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Order not found' } },
        { status: 404 }
      );
    }

    if (['refunded', 'failed'].includes(order.status)) {
      return NextResponse.json(
        { error: { code: 'INVALID_STATE', message: `Order is already ${order.status}` } },
        { status: 400 }
      );
    }

    // Check for existing active refund case for this order
    const { data: existingCase } = await supabase
      .from('refund_requests')
      .select('id, status')
      .eq('order_id', orderId)
      .not('status', 'in', '("REFUNDED","REJECTED","CANCELLED","FAILED")')
      .maybeSingle();

    if (existingCase) {
      return NextResponse.json(
        {
          error: {
            code: 'DUPLICATE_CASE',
            message: `An active refund case (${existingCase.id}) already exists for this order with status ${existingCase.status}.`,
          },
        },
        { status: 409 }
      );
    }

    const refundAmount = parsed.data.amount ?? order.amount;
    const now = new Date().toISOString();

    // Create the refund_request record (canonical table)
    // NOTE: support_agent_id and support_note don't exist as columns,
    // they are stored inside the metadata JSONB field.
    const { data: refundCase, error: insertError } = await supabase
      .from('refund_requests')
      .insert({
        order_id: orderId,
        user_id: order.user_id,
        refund_amount: refundAmount,
        reason: parsed.data.reason,
        status: 'APPROVED',
        payment_method: order.payment_method,
        payment_reference: order.utr_reference,
        reviewed_by: actor.id,
        reviewed_at: now,
        requested_at: now,
        metadata: {
          source: 'admin_payments_direct',
          support_agent_id: actor.id,
          support_note: 'Direct admin refund via payments view',
          initiated_by: actor.id,
          initiated_by_email: actor.email,
          approved_by: actor.id,
          approved_at: now,
        },
      })
      .select()
      .single();

    if (insertError || !refundCase) {
      return NextResponse.json(
        { error: { code: 'INSERT_ERROR', message: insertError?.message ?? 'Failed to create refund case' } },
        { status: 500 }
      );
    }

    // Mark order as refunded
    await supabase
      .from('orders')
      .update({ status: 'refunded', updated_at: now })
      .eq('id', orderId);

    // Audit log — uses canonical audit_records table
    await auditLogger.log({
      actorId: actor.id,
      actorRole: actor.roles[0] ?? 'staff',
      action: 'refund.approved',
      targetEntityType: 'refund_requests',
      targetEntityId: refundCase.id,
      previousState: { order_status: order.status, order_amount: order.amount } as any,
      newState: {
        refund_case_id: refundCase.id,
        status: 'APPROVED',
        refund_amount: refundAmount,
        reason: parsed.data.reason,
      } as any,
      ipAddress:
        request.headers.get('x-forwarded-for')?.split(',')[0] ?? '127.0.0.1',
      deviceInfo: { userAgent: request.headers.get('user-agent') ?? '' } as any,
      metadata: { order_id: orderId } as any,
    });

    return NextResponse.json({
      success: true,
      refundCaseId: refundCase.id,
      orderId,
      refundAmount,
      message: 'Refund case created and approved. Process payment through the Refund Operations panel.',
    });
  } catch (err) {
    console.error('[payments/refund] error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to process refund' } },
      { status: 500 }
    );
  }
}
