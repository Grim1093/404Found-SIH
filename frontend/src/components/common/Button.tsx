import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'default' | 'lg';
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'default',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors rounded focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-foreground text-text-inverse hover:bg-foreground/90",
    secondary: "border border-border text-text-primary bg-transparent hover:bg-surface-hover",
    ghost: "text-text-secondary bg-transparent hover:bg-surface-hover hover:text-text-primary",
    danger: "bg-cloned text-white hover:bg-cloned/90",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    default: "px-4 py-2 text-sm",
    lg: "px-6 py-2.5 text-base",
  };

  return (
    <button
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  );
}
