'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { useAlertStore } from '@/stores/alertStore';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export function RecentAlerts() {
  const router = useRouter();
  const { alerts, fetchAlerts, acknowledgeAlert, isLoading } = useAlertStore();

  useEffect(() => {
    fetchAlerts({ limit: 5 });
  }, [fetchAlerts]);

  const recentAlerts = alerts.slice(0, 5);

  const getSeverityVariant = (severity: string) => {
    switch(severity) {
      case 'critical': return 'critical';
      case 'high': return 'cloned';
      case 'medium': return 'suspicious';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-medium text-text-primary">Recent Alerts</h2>
          <p className="text-sm text-text-secondary mt-1">High-priority flagged events</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/alerts')}>
          View All
        </Button>
      </div>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-text-secondary text-sm">
            Loading alerts...
          </div>
        ) : recentAlerts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-lg">
            <CheckCircle2 size={32} className="text-genuine mb-2" />
            <p className="text-sm font-medium text-text-primary">All clear</p>
            <p className="text-xs text-text-secondary mt-1">No recent alerts to display.</p>
          </div>
        ) : (
          recentAlerts.map(alert => (
            <div key={alert.id} className="p-4 rounded-lg bg-surface-elevated border border-border flex items-start gap-4">
              <div className="pt-1 shrink-0">
                <AlertTriangle size={20} className={
                  alert.severity === 'critical' ? 'text-critical' : 
                  alert.severity === 'high' ? 'text-cloned' : 'text-suspicious'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant={getSeverityVariant(alert.severity)}>
                    {alert.severity}
                  </Badge>
                  <span className="text-xs text-text-muted shrink-0">
                    {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm font-medium text-text-primary truncate">
                  Score: {alert.risk_score.toFixed(1)}
                </p>
                <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                  {alert.message}
                </p>
              </div>
              {alert.status === 'open' && (
                <div className="shrink-0 self-center">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      acknowledgeAlert(alert.id);
                    }}
                  >
                    Ack
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
