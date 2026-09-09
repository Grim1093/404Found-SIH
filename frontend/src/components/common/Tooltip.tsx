'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    const spacing = 8;
    let top = 0;
    let left = 0;
    
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - spacing;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'bottom':
        top = triggerRect.bottom + spacing;
        left = triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.left - tooltipRect.width - spacing;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2);
        left = triggerRect.right + spacing;
        break;
    }
    
    setCoords({ top, left });
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isVisible, position]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  const clonedChild = React.cloneElement(children as React.ReactElement<any>, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      if ((children.props as any).onMouseEnter) {
        (children.props as any).onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      if ((children.props as any).onMouseLeave) {
        (children.props as any).onMouseLeave(e);
      }
    },
    onFocus: (e: React.FocusEvent) => {
      handleMouseEnter();
      if ((children.props as any).onFocus) {
        (children.props as any).onFocus(e);
      }
    },
    onBlur: (e: React.FocusEvent) => {
      handleMouseLeave();
      if ((children.props as any).onBlur) {
        (children.props as any).onBlur(e);
      }
    }
  });

  return (
    <>
      {clonedChild}
      {isVisible && typeof document !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-[100] px-2 py-1 text-xs font-medium text-text-inverse bg-foreground rounded shadow-sm whitespace-nowrap pointer-events-none animate-in fade-in zoom-in-95 duration-200",
            className
          )}
          style={{
            top: `${coords.top}px`,
            left: `${coords.left}px`,
          }}
          role="tooltip"
        >
          {content}
        </div>,
        document.body
      )}
    </>
  );
}
