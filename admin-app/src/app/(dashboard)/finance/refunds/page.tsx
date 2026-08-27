'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, X, Plus } from 'lucide-react';
import { DataTable } from '@/components/shared/data-table';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefundStatusBadge, REFUND_STATUS_LABELS } from '@/components/shared/refund-status-badge';
import { CreateRefundCaseModal } from '@/components/shared/create-refund-case-modal';
import { listRefundCases, type RefundCase, REFUND_STATUSES } from '@/lib/api/refunds';
import { formatCurrency } from '@/lib/utils';
import type { ColumnDef } from '@tanstack/react-table';

const STATUS_TABS = [
  { key: 'all',                      label: 'All' },
  { key: 'PENDING',                  label: 'Pending' },
  { key: 'UNDER_REVIEW',             label: 'Under Review' },
  { key: 'MORE_INFORMATION_REQUIRED',label: 'More Info' },
  { key: 'APPROVED',                 label: 'Approved' },
  { key: 'REJECTED',                 label: 'Rejected' },
  { key: 'PROCESSING',               label: 'Processing' },
  { key: 'REFUNDED',                 label: 'Refunded' },
  { key: 'FAILED',                   label: 'Failed' },
] as const;

const columns: ColumnDef<RefundCase, any>[] = [
  {
    accessorKey: 'id',
    header: 'Case ID',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{(getValue() as string).slice(0, 8).toUpperCase()}</span>
    ),
  },
  {
    id: 'customer',
    header: 'Customer',
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span className="text-muted-foreground text-xs">—</span>;
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';
      return (
        <div>
          <p className="text-[13px] font-medium truncate max-w-[160px]">{user.email}</p>
          <p className="text-xs text-muted-foreground">{name}</p>
        </div>
      );
    },
  },
  {
    accessorKey: 'orderId',
    header: 'Order',
    cell: ({ getValue }) => (
      <span className="font-mono text-xs">{(getValue() as string).slice(0, 8).toUpperCase()}</span>
    ),
  },
  {
    accessorKey: 'refundAmount',
    header: 'Amount',
    cell: ({ getValue }) => (
      <span className="font-semibold">{formatCurrency(Number(getValue()))}</span>
    ),
  },
  {
    accessorKey: 'paymentMethod',
    header: 'Payment',
    cell: ({ getValue }) => (
      <span className="text-xs capitalize text-muted-foreground">{(getValue() as string) ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ getValue }) => <RefundStatusBadge status={getValue() as string} />,
  },
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ getValue }) => (
      <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
        {getValue() as string}
      </span>
    ),
  },
  {
    accessorKey: 'requestedAt',
    header: 'Requested',
    cell: ({ getValue }) =>
      new Date(getValue() as string).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      }),
  },
];

export default function RefundOperationsPage() {
  const router  = useRouter();
  const [cases,        setCases]        = useState<RefundCase[]>([]);
  const [total,        setTotal]        = useState(0);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [activeTab,    setActiveTab]    = useState<string>('all');
  const [search,       setSearch]       = useState('');
  const [searchInput,  setSearchInput]  = useState('');
  const [offset,       setOffset]       = useState(0);
  const [showCreate,   setShowCreate]   = useState(false);
  const limit = 50;

  const fetchCases = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await listRefundCases({
        status: activeTab === 'all' ? undefined : activeTab,
        search: search || undefined,
        limit,
        offset,
      });
      setCases(data.cases);
      setTotal(data.total);
      setStatusCounts(data.statusCounts);
    } catch (e: any) {
      setError(e.message ?? 'Failed to load refund cases');
    } finally {
      setLoading(false);
    }
  }, [activeTab, search, offset]);

  useEffect(() => { fetchCases(); }, [fetchCases]);

  function handleSearch() {
    setSearch(searchInput.trim());
    setOffset(0);
  }

  function clearSearch() {
    setSearchInput('');
    setSearch('');
    setOffset(0);
  }

  // KPI counts from statusCounts
  const kpis = [
    { label: 'Pending',     value: statusCounts['PENDING']     ?? 0, color: 'text-yellow-600' },
    { label: 'Under Review',value: statusCounts['UNDER_REVIEW'] ?? 0, color: 'text-blue-600' },
    { label: 'Approved',    value: statusCounts['APPROVED']    ?? 0, color: 'text-emerald-600' },
    { label: 'Processing',  value: statusCounts['PROCESSING']  ?? 0, color: 'text-purple-600' },
    { label: 'Refunded',    value: statusCounts['REFUNDED']    ?? 0, color: 'text-emerald-500' },
    { label: 'Failed',      value: statusCounts['FAILED']      ?? 0, color: 'text-red-600' },
  ];

  if (error && !loading) return <ErrorState message={error} onRetry={fetchCases} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Refund Operations</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            Support-first refund lifecycle management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCases} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create Case
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {kpis.map(kpi => (
          <Card key={kpi.label} className="cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => { setActiveTab(kpi.label === 'Under Review' ? 'UNDER_REVIEW' : kpi.label.toUpperCase()); setOffset(0); }}>
            <CardHeader className="pb-1 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-3 px-4">
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-1 border-b overflow-x-auto pb-px">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setOffset(0); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-t transition-colors whitespace-nowrap
              ${activeTab === tab.key
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.label}
            {tab.key !== 'all' && statusCounts[tab.key] != null && (
              <span className="ml-1.5 text-[10px] bg-muted rounded-full px-1.5 py-0.5">
                {statusCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Email, Order ID, Case ID, payment ref..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          {searchInput && (
            <button onClick={clearSearch} className="absolute right-2 top-2">
              <X className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        <Button size="sm" variant="outline" onClick={handleSearch}>Search</Button>
      </div>

      {/* Table */}
      {loading ? (
        <LoadingState rows={8} />
      ) : cases.length === 0 ? (
        <EmptyState message="No refund cases match the current filters." />
      ) : (
        <DataTable
          columns={columns}
          data={cases}
          totalCount={total}
          pageSize={limit}
          onRowClick={row => router.push(`/finance/refunds/${row.id}`)}
        />
      )}

      {/* Create Refund Case Modal */}
      <CreateRefundCaseModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={() => { setShowCreate(false); fetchCases(); }}
      />
    </div>
  );
}
