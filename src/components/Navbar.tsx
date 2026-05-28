'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, GitCompare, Bookmark, LogOut, User as UserIcon, Database, Sparkles, MessageSquare, Award, Sliders } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, comparisonColleges, isFallbackMode, setUser, checkUserSession } = useApp();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      await checkUserSession();
      router.push('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#2A2A40] bg-[#0A0A0F]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <span className="font-bold text-lg">C</span>
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] bg-clip-text text-transparent">
              College<span className="font-medium text-[#F5F5F5]">Hub</span>
            </span>
          </Link>

          {/* Fallback Mode Indicator / Admin Link */}
          {isFallbackMode ? (
            <Link 
              href="/admin/data-health" 
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-all select-none"
              title="Click to view Data Health & Credibility Console"
            >
              <Database className="h-3.5 w-3.5 animate-pulse" />
              <span>Demo Mode (Fallback Active)</span>
            </Link>
          ) : (
            <Link 
              href="/admin/data-health" 
              className="hidden sm:flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all select-none"
              title="Click to view Data Health & Credibility Console"
            >
              <Database className="h-3.5 w-3.5" />
              <span>Production Mode (PG Online)</span>
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#B0B0C0]">
          <Link
            href="/"
            className={`flex items-center gap-1.5 hover:text-[#F5F5F5] transition-colors ${
              pathname === '/' ? 'text-[#8B5CF6]' : ''
            }`}
          >
            <Search className="h-4 w-4" />
            Discover Colleges
          </Link>
          <Link
            href="/college-predictor"
            className={`flex items-center gap-1.5 hover:text-[#F5F5F5] transition-colors ${
              pathname === '/college-predictor' ? 'text-[#8B5CF6]' : ''
            }`}
          >
            <Sparkles className="h-4 w-4" />
            College Predictor
          </Link>
          <Link
            href="/compare"
            className={`flex items-center gap-1.5 hover:text-[#F5F5F5] transition-colors ${
              pathname === '/compare' ? 'text-[#8B5CF6]' : ''
            }`}
          >
            <GitCompare className="h-4 w-4" />
            Compare
            {comparisonColleges.length > 0 && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8B5CF6]/20 text-xs font-bold text-[#A855F7] border border-[#8B5CF6]/30">
                {comparisonColleges.length}
              </span>
            )}
          </Link>
          <Link
            href="/planner"
            className={`flex items-center gap-1.5 hover:text-[#F5F5F5] transition-colors ${
              pathname === '/planner' ? 'text-[#8B5CF6]' : ''
            }`}
          >
            <Sliders className="h-4 w-4" />
            Admissions Planner
          </Link>
          <Link
            href="/career-roadmap"
            className={`flex items-center gap-1 hover:text-[#F5F5F5] transition-colors ${
              pathname === '/career-roadmap' ? 'text-[#8B5CF6]' : ''
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#8B5CF6]" />
            AI Roadmaps
          </Link>
          <Link
            href="/scholarships"
            className={`flex items-center gap-1 hover:text-[#F5F5F5] transition-colors ${
              pathname === '/scholarships' ? 'text-[#8B5CF6]' : ''
            }`}
          >
            <Award className="h-4 w-4 text-[#A855F7]" />
            Scholarships
          </Link>
          <Link
            href="/chat-counselor"
            className={`flex items-center gap-1 hover:text-[#F5F5F5] transition-colors ${
              pathname === '/chat-counselor' ? 'text-[#8B5CF6]' : ''
            }`}
          >
            <MessageSquare className="h-4 w-4 text-[#8B5CF6]" />
            AI Counselor
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className={`flex items-center gap-1.5 hover:text-[#F5F5F5] transition-colors ${
                pathname === '/dashboard' ? 'text-[#8B5CF6]' : ''
              }`}
            >
              <Bookmark className="h-4 w-4" />
              Saved Items
            </Link>
          )}
        </nav>

        {/* Auth / User Actions */}
        <div className="flex items-center gap-4">
          {/* Compare Count Shortcut (mobile) */}
          <Link
            href="/compare"
            className="relative p-2 text-[#B0B0C0] hover:text-[#F5F5F5] md:hidden"
          >
            <GitCompare className="h-5 w-5" />
            {comparisonColleges.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5CF6] text-[10px] font-bold text-white">
                {comparisonColleges.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-2 rounded-lg bg-[#151521] border border-[#2A2A40] px-3.5 py-1.5 text-sm font-semibold text-[#F5F5F5] hover:bg-[#1a1a2b] hover:border-[#8B5CF6]/40 transition-colors"
              >
                <UserIcon className="h-4 w-4 text-[#8B5CF6]" />
                <span>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-[#2A2A40] px-3.5 py-1.5 text-sm font-semibold text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-[#B0B0C0] hover:text-[#F5F5F5] transition-colors"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-4.5 py-2 text-sm font-bold text-white hover:opacity-90 shadow-md shadow-purple-500/10 hover:shadow-purple-500/25 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
