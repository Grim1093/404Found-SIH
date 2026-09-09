import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/call';
import type { TokenResponse } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (data: TokenResponse, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (data, user) => set({
        token: data.access_token,
        refreshToken: data.refresh_token,
        user,
        isAuthenticated: true,
      }),
      setUser: (user) => set({ user }),
      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'voxguard-auth',
    }
  )
);
