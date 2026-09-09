'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../common/Card';
import { DataTable } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { StatusDot } from '../common/StatusDot';
import { useCallStore } from '@/stores/callStore';
import { formatDistanceToNow } from 'date-fns';
import { Call } from '@/types/call';

export function LiveCallFeed() {
  const router = useRouter();
  const { calls, fetchCalls, isLoading } = useCallStore();

  useEffect(() => {
    fetchCalls(0, 10);
  }, [fetchCalls]);

  const activeCalls = calls.filter(c => c.status === 'active' || c.status === 'flagged').slice(0, 5);
  // If no active, just show recent 5
  const displayCalls = activeCalls.length > 0 ? activeCalls : calls.slice(0, 5);

  const columns = [
    {
      header: 'Status',
      cell: (call: Call) => (
        <div className="flex items-center gap-2">
          <StatusDot status={call.status} />
          <span className="capitalize">{call.status}</span>
        </div>
      )
    },
    {
      header: 'Caller ID',
      accessorKey: 'caller_id' as keyof Call,
      cell: (call: Call) => (
        <div className="flex flex-col">
          <span className="font-medium text-text-primary">{call.caller_id || 'Unknown'}</span>
          <span className="text-xs text-text-muted">{call.caller_name || ''}</span>
        </div>
      )
    },
    {
      header: 'Duration',
      cell: (call: Call) => {
        if (call.duration_seconds) {
          const mins = Math.floor(call.duration_seconds / 60);
          const secs = call.duration_seconds % 60;
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        }
        return 'Live';
      }
    },
    {
      header: 'Started',
      cell: (call: Call) => (
        <span className="text-text-secondary" title={new Date(call.created_at).toLocaleString()}>
          {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
        </span>
      )
    }
  ];

  return (
    <Card padding="none" className="overflow-hidden h-full flex flex-col">
      <div className="p-6 border-b border-border">
        <h2 className="text-lg font-medium text-text-primary">Live Call Feed</h2>
        <p className="text-sm text-text-secondary mt-1">Real-time active monitored calls</p>
      </div>
      <div className="flex-1 overflow-auto">
        <DataTable
          data={displayCalls}
          columns={columns}
          keyExtractor={(call) => call.id}
          isLoading={isLoading}
          emptyMessage="No active calls at the moment."
          onRowClick={(call) => router.push(`/analysis?callId=${call.id}`)}
        />
      </div>
    </Card>
  );
}
