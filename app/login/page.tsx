'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ROLE_REDIRECTS: Record<string, string> = {
  customer: '/',
  waiter: '/dashboard/waiter',
  cashier: '/dashboard/cashier',
  admin: '/dashboard/admin',
  'super-admin': '/dashboard/admin',
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const supabase = createClient();

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !data.user) {
      setError(authError?.message ?? 'Login failed. Please try again.');
      setLoading(false);
      return;
    }

    // Fetch role from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile?.role) {
      setError('Could not load your profile. Contact an administrator.');
      setLoading(false);
      return;
    }

    const redirectTo = ROLE_REDIRECTS[profile.role] ?? '/dashboard';
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#F9F8F6' }}
    >
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-bold mb-2"
            style={{ color: '#2D2D2D' }}
          >
            ከነአን Café
          </h1>
          <p className="text-sm" style={{ color: '#6B6B6B' }}>
            Staff & Management Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2
            className="text-xl font-semibold mb-6"
            style={{ color: '#2D2D2D' }}
          >
            Sign in to your account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#2D2D2D' }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:ring-2"
                style={
                  {
                    '--tw-ring-color': '#C9A961',
                    color: '#2D2D2D',
                    backgroundColor: '#FAFAFA',
                  } as React.CSSProperties
                }
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-1.5"
                style={{ color: '#2D2D2D' }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none transition-all focus:ring-2"
                style={
                  {
                    '--tw-ring-color': '#C9A961',
                    color: '#2D2D2D',
                    backgroundColor: '#FAFAFA',
                  } as React.CSSProperties
                }
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#C9A961', color: '#2D2D2D' }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: '#9B9B9B' }}>
          Customer ordering does not require login —{' '}
          <a href="/" className="underline" style={{ color: '#C9A961' }}>
            browse the menu
          </a>
        </p>
      </div>
    </div>
  );
}
