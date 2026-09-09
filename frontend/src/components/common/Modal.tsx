import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md',
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-[90vw]',
  };

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      <div className={cn(
        "relative bg-surface-elevated border border-border rounded-lg shadow-xl w-full flex flex-col max-h-[90vh]",
        maxWidthClasses[maxWidth]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-medium text-text-primary">{title}</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary hover:bg-surface-hover p-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-surface-elevated/50 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
