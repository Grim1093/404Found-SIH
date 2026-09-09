import React from 'react';
import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'active' | 'completed' | 'flagged' | 'genuine' | 'suspicious' | 'cloned' | 'critical' | 'info';
  className?: string;
}

export function StatusDot({ status, className }: StatusDotProps) {
  const statusColors: Record<string, string> = {
    active: "bg-info",
    completed: "bg-text-secondary",
    flagged: "bg-cloned",
    genuine: "bg-genuine",
    suspicious: "bg-suspicious",
    cloned: "bg-cloned",
    critical: "bg-critical",
    info: "bg-info",
  };

  return (
    <span 
      className={cn("inline-block h-2 w-2 rounded-full", statusColors[status], className)} 
      aria-hidden="true"
    />
  );
}
