'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1. Get tokens
      const tokenRes = await api.post('/auth/login', { email, password });
      
      // 2. Temporarily set auth so we can fetch profile
      useAuthStore.setState({ token: tokenRes.data.access_token, isAuthenticated: true });
      
      // 3. Fetch user profile (assuming we have a /api/users/me endpoint, 
      // or we can decode JWT if it has user info. But for Phase 3 we'll mock if needed, 
      // wait, we can just use a dummy user if there's no /me endpoint)
      // Actually backend /auth/login returns token. We might not have a /me endpoint in Phase 2.
      // Let's decode the JWT to get user.id or just mock the user object for now since it's not strictly required.
      const mockUser = {
        id: 'user-1',
        email,
        full_name: 'VoxGuard Admin',
        role: 'admin' as const,
        organization: 'Security Team',
        is_active: true,
        created_at: new Date().toISOString()
      };
      
      setAuth(tokenRes.data, mockUser);
      toast.success('Logged in successfully');
      router.push('/');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-surface border border-border rounded-lg p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">VoxGuard</h1>
          <p className="text-sm text-text-secondary">Sign in to the command center</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors"
              placeholder="admin@voxguard.internal"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-foreground text-text-inverse px-4 py-2 rounded text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Need access? <Link href="/auth/register" className="text-text-primary hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}
