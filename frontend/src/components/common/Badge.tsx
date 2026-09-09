import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'genuine' | 'suspicious' | 'cloned' | 'critical' | 'info';
  children: React.ReactNode;
}

export function Badge({
  variant = 'default',
  className,
  children,
  ...props
}: BadgeProps) {
  const baseClasses = "inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium uppercase tracking-wide whitespace-nowrap";
  
  const variants = {
    default: "bg-surface-elevated text-text-primary",
    genuine: "bg-genuine-muted text-genuine",
    suspicious: "bg-suspicious-muted text-suspicious",
    cloned: "bg-cloned-muted text-cloned",
    critical: "bg-critical-muted text-critical",
    info: "bg-info-muted text-info",
  };

  return (
    <span
      className={cn(baseClasses, variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
}
