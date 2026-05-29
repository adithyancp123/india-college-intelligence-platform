'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { X, GitCompare, Trash2 } from 'lucide-react';
import { getSafeLogoSrc, getFallbackLogoUrl } from '@/lib/image-mapper';

export default function CompareDrawer() {
  const router = useRouter();
  const { comparisonColleges, removeFromComparison, clearComparison } = useApp();

  if (comparisonColleges.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#151521]/95 border-t border-[#2A2A40] shadow-2xl backdrop-blur-md p-4 transform transition-all duration-300">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
            <GitCompare className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-[#F5F5F5] text-sm">Compare Colleges</h4>
            <p className="text-xs text-[#B0B0C0]">
              Select 2 to 3 colleges to compare side-by-side ({comparisonColleges.length}/3 selected)
            </p>
          </div>
        </div>

        {/* Selected Colleges Row */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {comparisonColleges.map((college) => (
            <div
              key={college.id}
              className="flex items-center gap-2 rounded-full bg-[#0A0A0F] border border-[#2A2A40] pl-2 pr-3 py-1 text-xs text-[#F5F5F5] shadow-sm hover:border-[#8B5CF6]/40 transition-colors"
            >
              <img
                src={getSafeLogoSrc(college)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = getFallbackLogoUrl();
                }}
                alt={college.name}
                className="h-5 w-5 rounded-full object-cover object-center border border-[#2A2A40]"
              />
              <span className="max-w-[120px] truncate font-medium">{college.name}</span>
              <button
                onClick={() => removeFromComparison(college.id)}
                className="rounded-full p-0.5 hover:bg-[#2A2A40] text-[#B0B0C0] hover:text-[#F5F5F5] transition-colors cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={clearComparison}
            className="flex items-center gap-1.5 text-xs font-bold text-[#B0B0C0] hover:text-red-400 transition-colors px-3 py-2 cursor-pointer"
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </button>
          <button
            disabled={comparisonColleges.length < 2}
            onClick={() => router.push('/compare')}
            className={`rounded-lg px-5 py-2.5 text-xs font-bold text-white shadow-lg transition-all ${
              comparisonColleges.length >= 2
                ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:shadow-purple-500/25 cursor-pointer hover:opacity-90'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed'
            }`}
          >
            Compare Now
          </button>
        </div>
      </div>
    </div>
  );
}
