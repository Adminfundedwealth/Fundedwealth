export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAuthInHandler } from '@/lib/security/require-auth';

/**
 * GET /api/refunds/orders/[orderId]
 * Lookup a commerce order + its user for the Create Refund Case modal.
 * Also accepts an email address to find the most recent order.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  const { staff, error: authError } = await requireAuthInHandler();
  if (authError) return authError;

  // Check support or finance permission
  const allowed = staff.isFullAccess ||
    staff.permissions.includes('support.view') ||
    staff.permissions.includes('payments.view');

  if (!allowed) {
    return NextResponse.json(
      { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }

  const supabase = createAdminClient();
  const input = params.orderId.trim();

  let orderId: string | null = null;

  // If it looks like an email, resolve to user → latest order
  if (input.includes('@')) {
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .ilike('email', input)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No user found with that email' } },
        { status: 404 }
      );
    }

    const { data: latestOrder } = await supabase
      .from('orders')
      .select('id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latestOrder) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'No orders found for this user' } },
        { status: 404 }
      );
    }

    orderId = latestOrder.id;
  } else {
    orderId = input;
  }

  // Fetch the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, user_id, amount, plan_type, payment_type, payment_method, utr_reference, status, created_at, metadata')
    .eq('id', orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json(
      { error: { code: 'NOT_FOUND', message: 'Order not found' } },
      { status: 404 }
    );
  }

  // Fetch the user
  const { data: user } = await supabase
    .from('users')
    .select('id, email, first_name, last_name, phone, account_status')
    .eq('id', order.user_id)
    .maybeSingle();

  return NextResponse.json({ order, user: user ?? null });
}
