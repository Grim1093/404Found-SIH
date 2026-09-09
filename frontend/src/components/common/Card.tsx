import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

export function Card({
  padding = 'default',
  className,
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    default: "p-6",
    lg: "p-8",
  };

  return (
    <div
      className={cn("bg-surface border border-border rounded-md", paddings[padding], className)}
      {...props}
    >
      {children}
    </div>
  );
}
