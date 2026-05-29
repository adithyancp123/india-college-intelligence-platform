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
    <header className="sticky top-0 z-40 w-full border-b border-[#2A2A40]/60 bg-[#0A0A0F]/85 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo and Status Badge */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-350">
              <span className="font-extrabold text-base">C</span>
            </div>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#9F7AEA] via-[#B7791F]/0 to-[#D53F8C]/0 bg-clip-text text-transparent group-hover:opacity-95 transition-all">
              <span className="bg-gradient-to-r from-[#A855F7] to-[#C084FC] bg-clip-text text-transparent">College</span>
              <span className="font-semibold text-[#F5F5F5]">Hub</span>
            </span>
          </Link>

          {/* Fallback Mode Indicator / Admin Link */}
          {isFallbackMode ? (
            <Link 
              href="/admin/data-health" 
              className="hidden sm:flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-400 border border-amber-500/25 hover:bg-amber-500/25 transition-all select-none"
              title="Click to view Data Health & Credibility Console"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
              </span>
              <span>Demo Mode</span>
            </Link>
          ) : (
            <Link 
              href="/admin/data-health" 
              className="hidden sm:flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/25 transition-all select-none"
              title="Click to view Data Health & Credibility Console"
            >
              <span className="relative flex h-1.5 w-1.5">
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400"></span>
              </span>
              <span>Production Mode</span>
            </Link>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 text-xs font-semibold text-[#B0B0C0]">
          {/* Primary cluster */}
          <div className="flex items-center gap-4 lg:gap-5">
            <Link
              href="/"
              className={`flex items-center gap-1.5 py-1 px-1.5 hover:text-white transition-all duration-350 relative group ${
                pathname === '/' ? 'text-[#C084FC]' : ''
              }`}
            >
              <Search className="h-3.5 w-3.5" />
              <span>Discover Colleges</span>
              {pathname === '/' && (
                <span className="absolute bottom-[-22px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full shadow-[0_0_8px_#8B5CF6]" />
              )}
            </Link>
            <Link
              href="/college-predictor"
              className={`flex items-center gap-1.5 py-1 px-1.5 hover:text-white transition-all duration-350 relative group ${
                pathname === '/college-predictor' ? 'text-[#C084FC]' : ''
              }`}
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C084FC]" />
              <span>Predictor</span>
              {pathname === '/college-predictor' && (
                <span className="absolute bottom-[-22px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full shadow-[0_0_8px_#8B5CF6]" />
              )}
            </Link>
            <Link
              href="/compare"
              className={`flex items-center gap-1.5 py-1 px-1.5 hover:text-white transition-all duration-350 relative group ${
                pathname === '/compare' ? 'text-[#C084FC]' : ''
              }`}
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span>Compare</span>
              {comparisonColleges.length > 0 && (
                <span className="ml-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#8B5CF6]/20 text-[9px] font-bold text-[#C084FC] border border-[#8B5CF6]/30">
                  {comparisonColleges.length}
                </span>
              )}
              {pathname === '/compare' && (
                <span className="absolute bottom-[-22px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full shadow-[0_0_8px_#8B5CF6]" />
              )}
            </Link>
            <Link
              href="/planner"
              className={`flex items-center gap-1.5 py-1 px-1.5 hover:text-white transition-all duration-350 relative group ${
                pathname === '/planner' ? 'text-[#C084FC]' : ''
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>Planner</span>
              {pathname === '/planner' && (
                <span className="absolute bottom-[-22px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full shadow-[0_0_8px_#8B5CF6]" />
              )}
            </Link>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-[#2A2A40]/80" />

          {/* AI Section with subtle premium purple glassmorphic pill */}
          <div className="flex items-center gap-1 bg-[#8B5CF6]/5 border border-[#8B5CF6]/15 rounded-full p-0.5 pr-2.5 shadow-inner">
            <span className="text-[8px] uppercase tracking-widest font-extrabold text-[#C084FC] bg-[#8B5CF6]/20 px-2 py-0.5 rounded-full mr-1 animate-pulse">
              AI
            </span>
            <div className="flex items-center gap-2 lg:gap-3">
              <Link
                href="/career-roadmap"
                className={`transition-colors py-0.5 hover:text-white ${
                  pathname === '/career-roadmap' ? 'text-[#C084FC] font-bold' : 'text-[#B0B0C0]'
                }`}
              >
                Roadmaps
              </Link>
              <Link
                href="/scholarships"
                className={`transition-colors py-0.5 hover:text-white ${
                  pathname === '/scholarships' ? 'text-[#C084FC] font-bold' : 'text-[#B0B0C0]'
                }`}
              >
                Scholarships
              </Link>
              <Link
                href="/chat-counselor"
                className={`transition-colors py-0.5 hover:text-white ${
                  pathname === '/chat-counselor' ? 'text-[#C084FC] font-bold' : 'text-[#B0B0C0]'
                }`}
              >
                Counselor
              </Link>
            </div>
          </div>

          {user && (
            <>
              <div className="h-4 w-px bg-[#2A2A40]/80" />
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 py-1 px-1.5 hover:text-white transition-all duration-350 relative group ${
                  pathname === '/dashboard' ? 'text-[#C084FC]' : ''
                }`}
              >
                <Bookmark className="h-3.5 w-3.5" />
                <span>Saved Items</span>
                {pathname === '/dashboard' && (
                  <span className="absolute bottom-[-22px] left-0 right-0 h-[2px] bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full shadow-[0_0_8px_#8B5CF6]" />
                )}
              </Link>
            </>
          )}
        </nav>

        {/* Auth / User Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Compare Count Shortcut (mobile) */}
          <Link
            href="/compare"
            className="relative p-2 text-[#B0B0C0] hover:text-[#F5F5F5] md:hidden"
          >
            <GitCompare className="h-5 w-5" />
            {comparisonColleges.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#8B5CF6] text-[9px] font-bold text-white shadow-sm">
                {comparisonColleges.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center gap-1.5 rounded-lg bg-[#151521]/60 border border-[#2A2A40]/80 px-3 py-1.5 text-xs font-semibold text-[#F5F5F5] hover:bg-[#1a1a2b] hover:border-[#8B5CF6]/40 transition-colors duration-250"
              >
                <UserIcon className="h-3.5 w-3.5 text-[#C084FC]" />
                <span>{user.name}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-[#2A2A40]/85 px-3 py-1.5 text-xs font-semibold text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 transition-colors duration-250 cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[#B0B0C0] hover:text-white transition-colors duration-250"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-4 py-1.5 text-xs font-bold text-white hover:opacity-90 shadow-md shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02] transition-all duration-250"
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
