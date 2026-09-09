import { create } from 'zustand';
import type { Call } from '@/types/call';
import { api } from '@/lib/api';

interface Stats {
  total_calls: number;
  active_calls: number;
  flagged_calls: number;
  completed_calls: number;
  avg_risk_score: number;
}

interface CallState {
  calls: Call[];
  stats: Stats | null;
  isLoading: boolean;
  error: string | null;
  fetchCalls: (skip?: number, limit?: number) => Promise<void>;
  fetchStats: () => Promise<void>;
  updateCall: (callId: string, updates: Partial<Call>) => void;
  addCall: (call: Call) => void;
}

export const useCallStore = create<CallState>()((set, get) => ({
  calls: [],
  stats: null,
  isLoading: false,
  error: null,
  fetchCalls: async (skip = 0, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<{ items: Call[]; total: number }>('/api/calls', {
        params: { skip, limit },
      });
      set({ calls: response.data.items || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  fetchStats: async () => {
    try {
      const response = await api.get<Stats>('/api/calls/stats');
      set({ stats: response.data });
    } catch (err: any) {
      console.error('[VoxGuard] Failed to fetch stats:', err);
    }
  },
  updateCall: (callId, updates) => {
    set((state) => ({
      calls: state.calls.map((c) =>
        c.id === callId ? { ...c, ...updates } : c
      ),
    }));
  },
  addCall: (call) => {
    set((state) => ({
      calls: [call, ...state.calls],
    }));
  },
}));
