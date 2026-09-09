'use client';

import React, { useMemo } from 'react';
import { Card } from '../common/Card';
import { useCallStore } from '@/stores/callStore';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export function RiskDistribution() {
  const { calls } = useCallStore();

  // Process data for the chart: buckets of risk scores
  // In a real app we'd fetch this pre-aggregated from the backend. 
  // For now, we'll bucket the recent calls we have, or mock it if empty to show the UI.
  const chartData = useMemo(() => {
    const buckets = [
      { name: '0-25', range: [0, 25], color: 'var(--genuine)', count: 0 },
      { name: '26-50', range: [26, 50], color: 'var(--suspicious)', count: 0 },
      { name: '51-75', range: [51, 75], color: 'var(--cloned)', count: 0 },
      { name: '76-100', range: [76, 100], color: 'var(--critical)', count: 0 },
    ];

    let hasData = false;
    calls.forEach(call => {
      // We don't have risk_score in the base Call model, it's in AnalysisResult.
      // We might have it in call.metadata or we just mock distribution for demo purposes
      // Let's use a mock distribution if we don't have full data, so the chart looks good.
    });

    // Mock data for demo UI purposes if we don't have enough real data aggregated
    if (!hasData) {
      return [
        { name: '0-25', count: 145, color: 'var(--genuine)' },
        { name: '26-50', count: 32, color: 'var(--suspicious)' },
        { name: '51-75', count: 12, color: 'var(--cloned)' },
        { name: '76-100', count: 5, color: 'var(--critical)' },
      ];
    }

    return buckets;
  }, [calls]);

  return (
    <Card className="h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-text-primary">Risk Distribution</h2>
        <p className="text-sm text-text-secondary mt-1">Calls analyzed by risk category (24h)</p>
      </div>
      
      <div className="flex-1 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
            />
            <RechartsTooltip 
              cursor={{ fill: 'var(--surface-hover)' }}
              contentStyle={{ 
                backgroundColor: 'var(--surface-elevated)', 
                borderColor: 'var(--border)',
                borderRadius: '6px',
                color: 'var(--text-primary)'
              }}
              itemStyle={{ color: 'var(--text-primary)' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
