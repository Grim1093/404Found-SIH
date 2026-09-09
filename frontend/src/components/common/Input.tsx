import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId} 
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors",
            isError && "border-cloned focus:border-cloned focus:ring-cloned/30",
            className
          )}
          {...props}
        />
        {isError ? (
          <p className="text-xs text-cloned mt-1.5">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-text-muted mt-1.5">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
