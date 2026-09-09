import React from 'react';
import { Button } from '../common/Button';
import { Alert } from '@/types/call';

interface AlertActionsProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onViewDetails: (alert: Alert) => void;
}

export function AlertActions({ alert, onAcknowledge, onResolve, onViewDetails }: AlertActionsProps) {
  return (
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
  );
}
