'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Command, X, Sparkles, GitCompare, GraduationCap, ArrowRight, User, MapPin } from 'lucide-react';
import { getSafeLogoSrc, getFallbackLogoUrl } from '@/lib/image-mapper';

export default function CommandPalette() {
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Toggle palette on Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/colleges?search=${encodeURIComponent(query)}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          if (data.colleges) {
            setResults(data.colleges);
          }
        }
      } catch (error) {
        console.error('Command palette search error:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounce);
  }, [query]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSelectedIndex(0);
      setQuery('');
    }
  }, [isOpen]);

  // Handle clicking outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleCollegeSelect = (collegeId: string) => {
    router.push(`/college/${collegeId}`);
    setIsOpen(false);
  };

  // Keyboard navigation inside list
  const handleKeyDownList = (e: React.KeyboardEvent) => {
    const totalItems = results.length + 4; // results + 4 shortcuts
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % totalItems);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Execute selection
      if (selectedIndex < results.length) {
        handleCollegeSelect(results[selectedIndex].id);
      } else {
        const shortcutIdx = selectedIndex - results.length;
        if (shortcutIdx === 0) handleNavigate('/');
        else if (shortcutIdx === 1) handleNavigate('/college-predictor');
        else if (shortcutIdx === 2) handleNavigate('/compare');
        else if (shortcutIdx === 3) handleNavigate('/dashboard');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/85 backdrop-blur-sm p-4 md:p-24 animate-in fade-in duration-200">
      <div
        ref={modalRef}
        onKeyDown={handleKeyDownList}
        className="w-full max-w-2xl rounded-2xl border border-[#2A2A40] bg-[#151521] overflow-hidden shadow-2xl shadow-purple-500/10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
      >
        {/* Search header bar */}
        <div className="flex items-center border-b border-[#2A2A40] px-4 py-3.5 bg-[#151521]">
          <Search className="h-5 w-5 text-[#B0B0C0] mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type to search colleges, courses, or shortcuts..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent border-none text-[#F5F5F5] outline-none text-sm placeholder:text-[#B0B0C0]/30"
          />
          <span className="hidden sm:inline-flex items-center gap-0.5 rounded-md bg-[#0A0A0F] px-2 py-1 text-[10px] font-bold text-[#B0B0C0] border border-[#2A2A40] mr-3">
            ESC
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-[#2A2A40] rounded-full text-[#B0B0C0] hover:text-[#F5F5F5] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results / Suggestions panel */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 max-h-[60vh]">
          {/* Dynamic College Results */}
          {query.trim() && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]/50 mb-2.5">
                Matched Institutions ({results.length})
              </div>
              {loading ? (
                <div className="py-8 text-center text-xs text-[#B0B0C0] animate-pulse">
                  Querying database...
                </div>
              ) : results.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#B0B0C0]/60">
                  No colleges match "{query}"
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((col, idx) => {
                    const isSelected = selectedIndex === idx;
                    return (
                      <div
                        key={col.id}
                        onClick={() => handleCollegeSelect(col.id)}
                        className={`flex items-center justify-between rounded-xl px-3.5 py-3 transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#8B5CF6]/15 text-white border border-[#8B5CF6]/30' : 'text-[#B0B0C0] hover:bg-[#2A2A40]/30 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getSafeLogoSrc(col)}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getFallbackLogoUrl();
                            }}
                            alt=""
                            className="h-8 w-8 rounded-lg object-cover object-center border border-[#2A2A40]"
                          />
                          <div>
                            <div className="font-semibold text-xs text-[#F5F5F5]">{col.name}</div>
                            <div className="text-[9px] mt-0.5 text-[#B0B0C0]/60 flex items-center gap-1.5">
                              <MapPin className="h-3 w-3 text-[#8B5CF6]" />
                              {col.location}
                              &bull;
                              <span>Fees: ₹{(col.fees / 100000).toFixed(1)}L/yr</span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className={`h-4 w-4 text-[#8B5CF6] transition-transform ${isSelected ? 'translate-x-1' : 'opacity-0'}`} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Quick Shortcuts */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]/50 mb-2.5">
              Quick Shortcuts & Navigation
            </div>
            <div className="space-y-1">
              {[
                { label: 'Discover Colleges (Search & Filter)', path: '/', icon: GraduationCap, idx: results.length + 0 },
                { label: 'College Predictor (Admission Wizard)', path: '/college-predictor', icon: Sparkles, idx: results.length + 1 },
                { label: 'Compare Colleges (Side-by-side)', path: '/compare', icon: GitCompare, idx: results.length + 2 },
                { label: 'Student Dashboard (Bookmarks)', path: '/dashboard', icon: User, idx: results.length + 3 },
              ].map(shortcut => {
                const Icon = shortcut.icon;
                const isSelected = selectedIndex === shortcut.idx;
                return (
                  <button
                    key={shortcut.path}
                    onClick={() => handleNavigate(shortcut.path)}
                    className={`w-full flex items-center justify-between rounded-xl px-3.5 py-3 transition-colors text-left cursor-pointer border ${
                      isSelected ? 'bg-[#8B5CF6]/15 text-white border-[#8B5CF6]/30' : 'text-[#B0B0C0] border-transparent hover:bg-[#2A2A40]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3 text-xs">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-[#0A0A0F] text-[#B0B0C0]'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span>{shortcut.label}</span>
                    </div>
                    <ArrowRight className={`h-4 w-4 text-[#8B5CF6] transition-transform ${isSelected ? 'translate-x-1' : 'opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-[#2A2A40] px-4 py-2.5 bg-[#0A0A0F]/60 text-[10px] text-[#B0B0C0]/50">
          <div className="flex items-center gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span className="font-semibold text-[#8B5CF6] flex items-center gap-1">
            <Command className="h-3.5 w-3.5" />
            CollegeHub Intelligence
          </span>
        </div>
      </div>
    </div>
  );
}
