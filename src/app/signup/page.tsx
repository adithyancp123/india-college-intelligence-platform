'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { GraduationCap, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { checkUserSession, setIsFallbackMode } = useApp();

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed.');
      } else {
        if (data.isFallback) setIsFallbackMode(true);
        // Trigger session context update
        await checkUserSession();
        router.push('/dashboard');
      }
    } catch (e) {
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#0A0A0F] px-4 py-16 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[20%] left-[30%] bg-glow-purple"></div>

      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-xs font-semibold text-[#B0B0C0] hover:text-[#F5F5F5] transition-colors z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to search
      </Link>

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand logo */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white shadow-lg shadow-purple-500/20">
            <GraduationCap className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-[#F5F5F5]">
            Create Account
          </h2>
          <p className="mt-1.5 text-xs text-[#B0B0C0]">
            Sign up to bookmark colleges and save comparisons
          </p>
        </div>

        {/* Card Form */}
        <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/60 p-8 backdrop-blur-md shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-xs font-bold text-red-400">
                {error}
              </div>
            )}
            
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">
                Full Name
              </label>
              <div className="relative mt-2 flex items-center rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-3 py-0.5 focus-within:border-[#8B5CF6]/55 transition-colors">
                <UserIcon className="h-4.5 w-4.5 text-[#B0B0C0]/60" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full border-none bg-transparent py-2.5 pl-2 text-xs outline-none text-[#F5F5F5]"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">
                Email Address
              </label>
              <div className="relative mt-2 flex items-center rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-3 py-0.5 focus-within:border-[#8B5CF6]/55 transition-colors">
                <Mail className="h-4.5 w-4.5 text-[#B0B0C0]/60" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-none bg-transparent py-2.5 pl-2 text-xs outline-none text-[#F5F5F5]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">
                Password
              </label>
              <div className="relative mt-2 flex items-center rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-3 py-0.5 focus-within:border-[#8B5CF6]/55 transition-colors">
                <Lock className="h-4.5 w-4.5 text-[#B0B0C0]/60" />
                <input
                  id="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-none bg-transparent py-2.5 pl-2 text-xs outline-none text-[#F5F5F5]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] py-3 text-xs font-bold text-white hover:opacity-95 disabled:opacity-50 transition-all shadow shadow-purple-500/10 cursor-pointer"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-xs text-[#B0B0C0] border-t border-[#2A2A40]/50 pt-5">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#8B5CF6] hover:underline">
              Log in now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
