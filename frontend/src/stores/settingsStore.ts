import { create } from 'zustand';
import type { Configuration } from '@/types/call';
import { api } from '@/lib/api';

export interface ApiKey {
  id: string;
  key_prefix: string;
  name: string;
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
}

interface SettingsState {
  config: Configuration | null;
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSettings: (updates: Partial<Configuration>) => Promise<void>;
  fetchApiKeys: () => Promise<void>;
  createApiKey: (name: string) => Promise<string | null>; // Returns raw key
  revokeApiKey: (keyId: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set, get) => ({
  config: null,
  apiKeys: [],
  isLoading: false,
  error: null,
  
  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<Configuration>('/api/settings');
      set({ config: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },
  
  updateSettings: async (updates) => {
    try {
      const response = await api.put<Configuration>('/api/settings', updates);
      set({ config: response.data });
    } catch (err: any) {
      console.error('[VoxGuard] Failed to update settings:', err);
      throw err;
    }
  },
  
  fetchApiKeys: async () => {
    try {
      const response = await api.get<ApiKey[]>('/api/settings/api-keys');
      set({ apiKeys: response.data });
    } catch (err: any) {
      console.error('[VoxGuard] Failed to fetch API keys:', err);
    }
  },
  
  createApiKey: async (name: string) => {
    try {
      const response = await api.post('/api/settings/api-keys', { name });
      // The response includes raw_key
      const newKey = response.data;
      set((state) => ({ apiKeys: [newKey, ...state.apiKeys] }));
      return newKey.raw_key;
    } catch (err: any) {
      console.error('[VoxGuard] Failed to create API key:', err);
      throw err;
    }
  },
  
  revokeApiKey: async (keyId: string) => {
    try {
      await api.delete(`/api/settings/api-keys/${keyId}`);
      set((state) => ({
        apiKeys: state.apiKeys.filter((k) => k.id !== keyId),
      }));
    } catch (err: any) {
      console.error('[VoxGuard] Failed to revoke API key:', err);
      throw err;
    }
  },
}));
