'use client';

import React, { useEffect } from 'react';
import { Phone, PhoneCall, AlertTriangle, Activity } from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { useCallStore } from '@/stores/callStore';

export function DashboardStats() {
  const { stats, fetchStats, isLoading } = useCallStore();

  useEffect(() => {
    fetchStats();
    // In a real app we might set up an interval here or rely on websockets
    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30s auto-refresh
    
    return () => clearInterval(interval);
  }, [fetchStats]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        label="Total Calls (24h)"
        metric={isLoading && !stats ? '-' : (stats?.total_calls || 0)}
        icon={Phone}
        trend={{ value: 12, isPositive: true }}
      />
      <StatCard
        label="Active Monitored"
        metric={isLoading && !stats ? '-' : (stats?.active_calls || 0)}
        icon={PhoneCall}
      />
      <StatCard
        label="Flagged Issues"
        metric={isLoading && !stats ? '-' : (stats?.flagged_calls || 0)}
        icon={AlertTriangle}
        trend={{ value: 4, isPositive: false }}
      />
      <StatCard
        label="Avg Risk Score"
        metric={isLoading && !stats ? '-' : (stats?.avg_risk_score ? stats.avg_risk_score.toFixed(1) : 0)}
        icon={Activity}
      />
    </div>
  );
}
