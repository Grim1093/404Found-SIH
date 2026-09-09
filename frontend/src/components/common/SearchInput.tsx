import React, { forwardRef } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input, InputProps } from './Input';

export const SearchInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", className)}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-secondary">
          <Search size={16} />
        </div>
        <input
          ref={ref}
          type="text"
          className="w-full bg-surface border border-border rounded pl-10 pr-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors"
          {...props}
        />
      </div>
    );
  }
);

SearchInput.displayName = 'SearchInput';
