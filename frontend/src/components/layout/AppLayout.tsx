'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useAuthStore } from '@/stores/authStore';
import { wsClient } from '@/lib/websocket';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isAuthenticated && !pathname?.startsWith('/auth')) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, pathname, router, isMounted]);

  useEffect(() => {
    if (isMounted && isAuthenticated) {
      wsClient.connect();
    }
    return () => {
      // We don't disconnect on unmount of layout to keep connection alive across page navigations.
      // TopBar logout will disconnect.
    };
  }, [isMounted, isAuthenticated]);

  // Don't render until mounted to prevent hydration mismatch with auth store
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-4 h-4 bg-foreground rounded-full"></div>
          <div className="w-4 h-4 bg-foreground rounded-full animation-delay-200"></div>
          <div className="w-4 h-4 bg-foreground rounded-full animation-delay-400"></div>
        </div>
      </div>
    );
  }

  // If we are redirecting, render empty to prevent flash of content
  if (!isAuthenticated && !pathname?.startsWith('/auth')) {
    return null;
  }

  // If we are on an auth page, don't show the app shell
  if (pathname?.startsWith('/auth')) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <TopBar />
      <div className="flex flex-1 pt-14">
        <Sidebar />
        <main className="flex-1 ml-16 lg:ml-64 p-4 sm:p-8 overflow-y-auto min-h-[calc(100vh-3.5rem)] transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}
