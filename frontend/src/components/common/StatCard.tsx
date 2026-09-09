import React from 'react';
import { Card } from './Card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  metric: string | number;
  subtitle?: string;
  icon: LucideIcon;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatCard({
  label,
  metric,
  subtitle,
  icon: Icon,
  className,
  trend,
}: StatCardProps) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-text-secondary">{label}</h3>
        <div className="p-2 bg-surface-elevated rounded-md border border-border">
          <Icon size={16} className="text-text-muted" />
        </div>
      </div>
      
      <div className="flex items-baseline gap-2">
        <div className="text-3xl font-bold text-text-primary font-mono">{metric}</div>
        {trend && (
          <span className={cn(
            "text-xs font-medium",
            trend.isPositive ? "text-genuine" : "text-critical"
          )}>
            {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
          </span>
        )}
      </div>
      
      {subtitle && (
        <p className="text-xs text-text-muted mt-2">{subtitle}</p>
      )}
    </Card>
  );
}
