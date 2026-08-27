'use client';

import type { RefundStatus } from '@/lib/api/refunds';

export const REFUND_STATUS_LABELS: Record<string, string> = {
  PENDING:                   'Pending',
  UNDER_REVIEW:              'Under Review',
  MORE_INFORMATION_REQUIRED: 'More Info Required',
  APPROVED:                  'Approved',
  REJECTED:                  'Rejected',
  PROCESSING:                'Processing',
  REFUNDED:                  'Refunded',
  FAILED:                    'Failed',
  CANCELLED:                 'Cancelled',
};

const STATUS_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  PENDING:                   { dot: 'bg-yellow-500',  bg: 'bg-yellow-500/10',  text: 'text-yellow-600 dark:text-yellow-400' },
  UNDER_REVIEW:              { dot: 'bg-blue-500',    bg: 'bg-blue-500/10',    text: 'text-blue-600 dark:text-blue-400' },
  MORE_INFORMATION_REQUIRED: { dot: 'bg-amber-500',   bg: 'bg-amber-500/10',   text: 'text-amber-600 dark:text-amber-400' },
  APPROVED:                  { dot: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  REJECTED:                  { dot: 'bg-red-500',     bg: 'bg-red-500/10',     text: 'text-red-600 dark:text-red-400' },
  PROCESSING:                { dot: 'bg-purple-500',  bg: 'bg-purple-500/10',  text: 'text-purple-600 dark:text-purple-400' },
  REFUNDED:                  { dot: 'bg-emerald-400', bg: 'bg-emerald-400/10', text: 'text-emerald-500 dark:text-emerald-300' },
  FAILED:                    { dot: 'bg-red-600',     bg: 'bg-red-600/10',     text: 'text-red-700 dark:text-red-500' },
  CANCELLED:                 { dot: 'bg-zinc-400',    bg: 'bg-zinc-400/10',    text: 'text-zinc-500 dark:text-zinc-400' },
};

const DEFAULT_STYLE = { dot: 'bg-zinc-400', bg: 'bg-zinc-400/10', text: 'text-zinc-500' };

interface RefundStatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function RefundStatusBadge({ status, size = 'sm' }: RefundStatusBadgeProps) {
  const style   = STATUS_STYLES[status] ?? DEFAULT_STYLE;
  const label   = REFUND_STATUS_LABELS[status] ?? status;
  const isSm    = size === 'sm';

  return (
    <span className={`inline-flex items-center rounded-full ${isSm ? 'gap-1 px-1.5' : 'gap-1.5 px-2 py-0.5'} ${style.bg} ${style.text}`}>
      <span className={`rounded-full ${isSm ? 'h-1 w-1' : 'h-1.5 w-1.5'} ${style.dot}`} />
      <span className={`font-medium capitalize ${isSm ? 'text-[10px]' : 'text-[11px]'}`}>
        {label}
      </span>
    </span>
  );
}
