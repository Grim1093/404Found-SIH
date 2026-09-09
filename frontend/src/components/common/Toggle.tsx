import React from 'react';
import { cn } from '@/lib/utils';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: ToggleProps) {
  return (
    <label className={cn(
      "flex items-center justify-between cursor-pointer",
      disabled && "opacity-50 cursor-not-allowed"
    )}>
      {(label || description) && (
        <div className="flex flex-col mr-4">
          {label && <span className="text-sm font-medium text-text-primary">{label}</span>}
          {description && <span className="text-xs text-text-muted mt-0.5">{description}</span>}
        </div>
      )}
      
      <div className="relative inline-flex items-center">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => !disabled && onChange(e.target.checked)}
          disabled={disabled}
        />
        <div className={cn(
          "w-9 h-5 rounded-full transition-colors",
          "peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-ring peer-focus:ring-offset-1 peer-focus:ring-offset-background",
          checked ? "bg-foreground" : "bg-border",
        )}></div>
        <span className={cn(
          "absolute left-0.5 top-0.5 bg-background rounded-full h-4 w-4 transition-transform",
          checked ? "translate-x-4" : "translate-x-0"
        )}></span>
      </div>
    </label>
  );
}
