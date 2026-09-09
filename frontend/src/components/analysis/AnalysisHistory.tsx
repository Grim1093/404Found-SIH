'use client';

import React, { useState } from 'react';
import { Card } from '../common/Card';
import { SearchInput } from '../common/SearchInput';
import { Badge } from '../common/Badge';
import { useCallStore } from '@/stores/callStore';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { Call } from '@/types/call';

export function AnalysisHistory() {
  const router = useRouter();
  const { calls } = useCallStore();
  const [search, setSearch] = useState('');

  // Filter out calls that don't have results or don't match search
  // In a real app we'd search via API.
  const filteredCalls = calls
    .filter(c => c.status === 'completed' || c.status === 'flagged')
    .filter(c => 
      c.caller_id?.toLowerCase().includes(search.toLowerCase()) || 
      c.caller_name?.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, 10);

  const getBadgeVariant = (status: string) => {
    if (status === 'flagged') return 'critical';
    return 'genuine';
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-text-primary mb-1">Analysis History</h3>
        <p className="text-xs text-text-secondary">Recent completed analysis</p>
      </div>

      <div className="mb-4">
        <SearchInput 
          placeholder="Search by caller ID..." 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {filteredCalls.length === 0 ? (
          <div className="text-center py-8 text-sm text-text-secondary">
            No past analysis found.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredCalls.map(call => (
              <div 
                key={call.id}
                onClick={() => router.push(`/analysis?callId=${call.id}`)}
                className="p-3 bg-surface-elevated hover:bg-surface-hover border border-border rounded-md cursor-pointer transition-colors flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary truncate max-w-[150px]">
                    {call.caller_id || 'Unknown'}
                  </span>
                  <span className="text-xs text-text-muted mt-0.5">
                    {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                <Badge variant={getBadgeVariant(call.status)}>
                  {call.status === 'flagged' ? 'CLONED' : 'GENUINE'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
