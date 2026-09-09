'use client';

import React from 'react';
import { DataTable } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { formatDistanceToNow } from 'date-fns';
import { Alert } from '@/types/call';

interface AlertTableProps {
  alerts: Alert[];
  isLoading: boolean;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onViewDetails: (alert: Alert) => void;
  pagination: any;
}

export function AlertTable({ 
  alerts, 
  isLoading, 
  onAcknowledge, 
  onResolve, 
  onViewDetails,
  pagination
}: AlertTableProps) {
  
  const getSeverityVariant = (severity: string) => {
    switch(severity) {
      case 'critical': return 'critical';
      case 'high': return 'cloned';
      case 'medium': return 'suspicious';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const columns = [
    {
      header: 'Severity',
      cell: (alert: Alert) => (
        <Badge variant={getSeverityVariant(alert.severity)}>
          {alert.severity}
        </Badge>
      )
    },
    {
      header: 'Call / Caller ID',
      cell: (alert: Alert) => (
        <span className="font-medium font-mono text-text-primary">
          {alert.call_id.substring(0, 8)}...
        </span>
      )
    },
    {
      header: 'Risk Score',
      cell: (alert: Alert) => (
        <span className={alert.risk_score > 75 ? 'text-critical font-medium' : 'text-text-primary'}>
          {alert.risk_score.toFixed(1)}
        </span>
      )
    },
    {
      header: 'Time',
      cell: (alert: Alert) => (
        <span className="text-text-secondary" title={new Date(alert.created_at).toLocaleString()}>
          {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
        </span>
      )
    },
    {
      header: 'Status',
      cell: (alert: Alert) => (
        <Badge variant={alert.status === 'open' ? 'critical' : alert.status === 'acknowledged' ? 'suspicious' : 'default'}>
          {alert.status}
        </Badge>
      )
    },
    {
      header: 'Actions',
      cell: (alert: Alert) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {alert.status === 'open' && (
            <Button variant="secondary" size="sm" onClick={() => onAcknowledge(alert.id)}>
              Ack
            </Button>
          )}
          {alert.status !== 'resolved' && (
            <Button variant="ghost" size="sm" onClick={() => onResolve(alert.id)}>
              Resolve
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(alert)}>
            Details
          </Button>
        </div>
      )
    }
  ];

  return (
    <DataTable
      data={alerts}
      columns={columns}
      keyExtractor={(a) => a.id}
      isLoading={isLoading}
      emptyMessage="No alerts found matching the current filters."
      onRowClick={onViewDetails}
      pagination={pagination}
    />
  );
}
