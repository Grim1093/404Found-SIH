'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, Shield, LogOut, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useAlertStore } from '@/stores/alertStore';
import { DropdownMenu } from '../common/DropdownMenu';
import { wsClient } from '@/lib/websocket';

export function TopBar() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { alerts } = useAlertStore();
  
  const unreadCount = alerts.filter(a => a.status === 'open').length;

  const handleLogout = () => {
    wsClient.disconnect();
    logout();
    router.push('/auth/login');
  };

  const userMenuItems = [
    {
      label: <div className="flex flex-col"><span className="font-medium text-text-primary">{user?.full_name || 'Admin'}</span><span className="text-xs text-text-secondary">{user?.email || 'admin@voxguard.internal'}</span></div>,
      onClick: () => {},
      disabled: true,
    },
    {
      label: 'Sign out',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
      danger: true,
    }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border z-50 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-foreground rounded p-1">
            <Shield size={20} className="text-background" />
          </div>
          <span className="text-lg font-bold text-text-primary tracking-tight group-hover:text-foreground transition-colors">
            VoxGuard
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <Link 
          href="/alerts"
          className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[9px] font-bold text-white ring-2 ring-background">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Link>

        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-surface-hover focus:outline-none focus:ring-2 focus:ring-ring transition-colors">
              <div className="h-8 w-8 rounded-full bg-surface-elevated border border-border flex items-center justify-center text-text-primary">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon size={16} />}
              </div>
            </button>
          }
          items={userMenuItems}
        />
      </div>
    </header>
  );
}
