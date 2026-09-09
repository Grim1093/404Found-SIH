'use client';

import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Alert } from '@/types/call';
import { format } from 'date-fns';
import { ShieldAlert, Info } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface AlertDetailProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}

export function AlertDetail({ alert, isOpen, onClose, onAcknowledge, onResolve }: AlertDetailProps) {
  const router = useRouter();

  if (!alert) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Alert Details"
      maxWidth="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Close</Button>
          <Button 
            variant="secondary" 
            onClick={() => router.push(`/analysis?callId=${alert.call_id}`)}
          >
            Full Analysis
          </Button>
          {alert.status === 'open' && (
            <Button onClick={() => { onAcknowledge(alert.id); onClose(); }}>
              Acknowledge
            </Button>
          )}
          {alert.status === 'acknowledged' && (
            <Button onClick={() => { onResolve(alert.id); onClose(); }}>
              Resolve
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-surface-hover rounded-lg border border-border">
          <div className="p-2 bg-critical-muted text-critical rounded-full shrink-0">
            <ShieldAlert size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-medium text-text-primary">Voice Cloning Suspected</h3>
              <Badge variant="critical">{alert.severity}</Badge>
            </div>
            <p className="text-sm text-text-secondary">{alert.message}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-surface rounded-lg border border-border">
            <p className="text-xs text-text-muted mb-1">Risk Score</p>
            <p className="text-2xl font-bold font-mono text-critical">{alert.risk_score.toFixed(1)}</p>
          </div>
          <div className="p-4 bg-surface rounded-lg border border-border">
            <p className="text-xs text-text-muted mb-1">Call ID</p>
            <p className="text-sm font-medium font-mono text-text-primary break-all">{alert.call_id}</p>
          </div>
          <div className="p-4 bg-surface rounded-lg border border-border">
            <p className="text-xs text-text-muted mb-1">Created At</p>
            <p className="text-sm font-medium text-text-primary">
              {format(new Date(alert.created_at), 'MMM d, yyyy HH:mm:ss')}
            </p>
          </div>
          <div className="p-4 bg-surface rounded-lg border border-border">
            <p className="text-xs text-text-muted mb-1">Status</p>
            <p className="text-sm font-medium text-text-primary capitalize">{alert.status}</p>
          </div>
        </div>

        <div className="p-4 bg-info-muted/30 border border-info/20 rounded-lg flex items-start gap-3">
          <Info size={16} className="text-info mt-0.5 shrink-0" />
          <p className="text-sm text-text-secondary">
            This alert was automatically generated because the call's risk score exceeded the configured threshold for {alert.severity} severity.
          </p>
        </div>
      </div>
    </Modal>
  );
}
