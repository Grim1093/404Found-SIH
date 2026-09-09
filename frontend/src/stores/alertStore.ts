import { create } from 'zustand';
import type { Alert } from '@/types/call';
import { api } from '@/lib/api';

interface AlertState {
  alerts: Alert[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchAlerts: (params?: { skip?: number; limit?: number; status?: string; severity?: string }) => Promise<void>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  prependAlert: (alert: Alert) => void;
}

export const useAlertStore = create<AlertState>()((set, get) => ({
  alerts: [],
  total: 0,
  isLoading: false,
  error: null,
  fetchAlerts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ items: Alert[]; total: number }>('/api/alerts', { params });
      set({ alerts: response.data.items, total: response.data.total, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  acknowledgeAlert: async (alertId) => {
    try {
      // In a real app we'd call an API here. Since we only have GET in Phase 2 for alerts,
      // we'll simulate the state update or assume there's a PATCH endpoint if added later.
      // For now, optimistic update:
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'acknowledged' } : a
        ),
      }));
    } catch (err: any) {
      console.error('[VoxGuard] Failed to acknowledge alert:', err);
    }
  },
  resolveAlert: async (alertId) => {
    try {
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, status: 'resolved' } : a
        ),
      }));
    } catch (err: any) {
      console.error('[VoxGuard] Failed to resolve alert:', err);
    }
  },
  prependAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts],
      total: state.total + 1,
    }));
  },
}));
