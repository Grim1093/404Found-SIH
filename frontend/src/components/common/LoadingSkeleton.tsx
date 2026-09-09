import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export function LoadingSkeleton({
  className,
  variant = 'rectangular',
  width,
  height,
}: LoadingSkeletonProps) {
  const baseClasses = "animate-pulse bg-surface-elevated border border-border/50";
  
  const variants = {
    rectangular: "rounded-md",
    circular: "rounded-full",
    text: "rounded h-4 w-full",
  };

  return (
    <div
      className={cn(baseClasses, variants[variant], className)}
      style={{ width, height }}
    />
  );
}
