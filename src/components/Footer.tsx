'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { GraduationCap, Globe, Mail, Send, Sparkles } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="border-t border-[#2A2A40]/70 bg-[#0D0D15]/95 pb-24 md:pb-12 pt-16 relative overflow-hidden backdrop-blur-xl mt-auto z-20">
      {/* Background ambient glow inside footer */}
      <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-gradient-to-tr from-[#8B5CF6]/5 to-transparent rounded-full blur-[60px] pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-[#2A2A40]/40">
          
          {/* Brand & Social Column */}
          <div className="col-span-1 md:col-span-4 space-y-5">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-300">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-black tracking-wider bg-gradient-to-r from-[#F5F5F5] via-purple-100 to-[#C084FC] bg-clip-text text-transparent">
                CollegeHub
              </span>
            </Link>
            
            <p className="text-xs text-[#B0B0C0]/85 leading-relaxed font-light pr-4">
              Empowering Indian students with recruiter-grade college discovery, JoSAA admissions predictors, ROI analytics, and custom career pathway roadmaps.
            </p>
            
            {/* Social Icons with custom bulletproof SVGs */}
            <div className="flex items-center gap-3">
              {/* GitHub */}
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="h-8.5 w-8.5 rounded-lg border border-[#2A2A40] bg-[#151521]/40 flex items-center justify-center text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="h-8.5 w-8.5 rounded-lg border border-[#2A2A40] bg-[#151521]/40 flex items-center justify-center text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>

              {/* Website */}
              <a
                href="https://globe.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Website"
                className="h-8.5 w-8.5 rounded-lg border border-[#2A2A40] bg-[#151521]/40 flex items-center justify-center text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Globe className="h-4 w-4" />
              </a>

              {/* Email */}
              <a
                href="mailto:contact@collegehub.com"
                aria-label="Email"
                className="h-8.5 w-8.5 rounded-lg border border-[#2A2A40] bg-[#151521]/40 flex items-center justify-center text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/10 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">Platform</h4>
            <ul className="space-y-2.5 text-xs text-[#B0B0C0]/80">
              <li>
                <Link href="/" className="hover:text-[#F5F5F5] transition-colors">Discover Colleges</Link>
              </li>
              <li>
                <Link href="/college-predictor" className="hover:text-[#F5F5F5] transition-colors">Admission Predictor</Link>
              </li>
              <li>
                <Link href="/compare" className="hover:text-[#F5F5F5] transition-colors">Compare Tool</Link>
              </li>
              <li>
                <Link href="/planner" className="hover:text-[#F5F5F5] transition-colors">Portfolio Planner</Link>
              </li>
            </ul>
          </div>

          {/* AI Intelligence Suite Column */}
          <div className="col-span-1 md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6]">AI Tools & Guides</h4>
            <ul className="space-y-2.5 text-xs text-[#B0B0C0]/80">
              <li>
                <Link href="/career-roadmap" className="hover:text-[#F5F5F5] transition-colors">Career Path Roadmaps</Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-[#F5F5F5] transition-colors">Scholarships Matcher</Link>
              </li>
              <li>
                <Link href="/chat-counselor" className="hover:text-[#F5F5F5] transition-colors">AI Admission Counselor</Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-[#F5F5F5] transition-colors">Shareable PDF Strategy</Link>
              </li>
            </ul>
          </div>

          {/* Premium Newsletter Box */}
          <div className="col-span-1 md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B5CF6] flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-[#A855F7]" />
              Newsletter
            </h4>
            <p className="text-xs text-[#B0B0C0]/70 leading-relaxed font-light">
              Get raw insights on Indian admissions, cutoffs, and ROI analytics delivered monthly.
            </p>
            
            <form onSubmit={handleSubscribe} className="space-y-2">
              <div className="flex rounded-xl border border-[#2A2A40] bg-[#0A0A0F] p-1.5 focus-within:border-[#8B5CF6]/50 transition-colors">
                <input
                  type="email"
                  placeholder="Enter email..."
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-transparent border-none text-xs text-[#F5F5F5] outline-none placeholder:text-[#B0B0C0]/30 pl-2 pr-1"
                />
                <button
                  type="submit"
                  className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white flex items-center justify-center shadow hover:opacity-90 active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
              
              {subscribed && (
                <p className="text-[10px] text-emerald-400 font-bold animate-pulse">
                  ✓ Successfully subscribed! Check your inbox.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom copyright details */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 text-[11px] text-[#B0B0C0]/50 font-light gap-4">
          <p>&copy; {new Date().getFullYear()} CollegeHub. All rights reserved. Recruiter & Assignment Showcase.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-[#F5F5F5] transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#F5F5F5] transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#F5F5F5] transition-colors cursor-pointer">Developer API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
