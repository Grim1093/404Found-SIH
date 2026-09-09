'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  AudioWaveform, 
  AlertTriangle, 
  Settings, 
  FileCode,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/analysis', label: 'Call Analysis', icon: AudioWaveform },
  { href: '/alerts', label: 'Alerts', icon: AlertTriangle },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/api-docs', label: 'API Docs', icon: FileCode },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-14 bottom-0 left-0 z-40 bg-background border-r border-border transition-all w-16 lg:w-64 flex flex-col group hover:w-64 lg:hover:w-64"
    >
      <nav className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-colors border-l-2 relative overflow-hidden",
                isActive 
                  ? "border-foreground bg-surface-hover text-foreground" 
                  : "border-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary"
              )}
              title={item.label}
            >
              <Icon size={20} className="shrink-0 mr-4" />
              <span className="whitespace-nowrap opacity-0 lg:opacity-100 group-hover:opacity-100 transition-opacity">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
