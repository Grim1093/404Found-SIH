'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface DropdownItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  disabled?: boolean;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export function DropdownMenu({
  trigger,
  items,
  align = 'right',
  className
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {isOpen && (
        <div 
          className={cn(
            "absolute z-50 mt-2 w-56 rounded-md shadow-lg bg-surface-elevated border border-border ring-1 ring-black ring-opacity-5 focus:outline-none animate-in fade-in zoom-in-95 duration-100",
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            className
          )}
        >
          <div className="py-1" role="menu" aria-orientation="vertical">
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
                className={cn(
                  "w-full text-left flex items-center px-4 py-2 text-sm transition-colors",
                  item.disabled ? "opacity-50 cursor-not-allowed text-text-muted" : 
                  item.danger 
                    ? "text-cloned hover:bg-surface-hover" 
                    : "text-text-primary hover:bg-surface-hover hover:text-foreground"
                )}
                role="menuitem"
              >
                {item.icon && <span className="mr-2">{item.icon}</span>}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
