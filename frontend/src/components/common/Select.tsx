import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, options, error, id, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const isError = Boolean(error);

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={selectId} 
            className="block text-sm font-medium text-text-secondary mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "w-full bg-surface border border-border rounded px-3 py-2 text-sm text-text-primary appearance-none focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors",
              isError && "border-cloned focus:border-cloned focus:ring-cloned/30",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-secondary">
            <ChevronDown size={16} />
          </div>
        </div>
        {isError && (
          <p className="text-xs text-cloned mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
