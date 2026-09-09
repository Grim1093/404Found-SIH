import React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  className,
  disabled = false,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-sm font-medium text-text-secondary">{label}</label>
          <span className="text-xs text-text-primary font-mono">{value}</span>
        </div>
      )}
      <div className="relative h-4 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          disabled={disabled}
          className={cn(
            "absolute w-full h-1 appearance-none bg-border rounded-full outline-none z-10",
            "focus:ring-2 focus:ring-ring focus:ring-offset-1 focus:ring-offset-background",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            background: `linear-gradient(to right, var(--foreground) ${percentage}%, var(--border) ${percentage}%)`,
          }}
        />
        {/* Custom thumb styles using Tailwind are tricky with range inputs, 
            so we often rely on standard globals.css or styled appearance-none overrides. 
            For this simplified version, standard browser thumb inherits nicely, 
            but we can add a specific style in globals.css if needed. */}
      </div>
    </div>
  );
}
