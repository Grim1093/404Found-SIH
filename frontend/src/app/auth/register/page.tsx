'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // We simulate registration for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Registration request submitted. Pending admin approval.');
      router.push('/auth/login');
    } catch (err: any) {
      toast.error('Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-surface border border-border rounded-lg p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Create Account</h1>
          <p className="text-sm text-text-secondary">Request access to VoxGuard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="fullName">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors"
              placeholder="Jane Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="organization">
              Organization (Optional)
            </label>
            <input
              id="organization"
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors"
              placeholder="Acme Corp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5" htmlFor="email">
              Work Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-hover border border-border rounded px-3 py-2 text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-border-hover focus:ring-1 focus:ring-ring transition-colors"
              placeholder="jane@example.com"
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
            className="w-full bg-foreground text-text-inverse px-4 py-2 rounded text-sm font-medium hover:bg-foreground/90 transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Submitting...' : 'Request Access'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-text-secondary">
          Already have an account? <Link href="/auth/login" className="text-text-primary hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
