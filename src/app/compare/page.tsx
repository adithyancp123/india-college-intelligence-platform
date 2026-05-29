'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { GitCompare, Plus, Trash2, Bookmark, Save, X, ArrowRight, Star, MapPin, IndianRupee, Briefcase, Award, Sparkles, TrendingUp, Info } from 'lucide-react';
import { getSafeLogoSrc, getFallbackLogoUrl } from '@/lib/image-mapper';
import Link from 'next/link';

export default function ComparePage() {
  const router = useRouter();
  const { comparisonColleges, removeFromComparison, clearComparison, user } = useApp();

  // Search/Add addition colleges inside compare page
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { addToComparison } = useApp();

  // Save Comparison state
  const [saveName, setSaveName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/colleges?search=${search}&limit=5`);
        const data = await res.json();
        if (data.colleges) {
          const filtered = data.colleges.filter(
            (c: any) => !comparisonColleges.some(cc => cc.id === c.id)
          );
          setSearchResults(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const handler = setTimeout(fetchColleges, 300);
    return () => clearTimeout(handler);
  }, [search, comparisonColleges]);

  const handleAddCollege = (college: any) => {
    const success = addToComparison(college);
    if (!success) {
      alert('You can compare a maximum of 3 colleges. Remove one to add another.');
    } else {
      setSearch('');
      setShowSearchDropdown(false);
    }
  };

  const handleSaveComparison = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!saveName.trim()) {
      setSaveError('Please enter a name for this comparison.');
      return;
    }

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    try {
      const collegeIds = comparisonColleges.map(c => c.id);
      const res = await fetch('/api/saved-comparisons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: saveName,
          collegeIds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error || 'Failed to save comparison.');
      } else {
        setSaveSuccess(true);
        setSaveName('');
        setTimeout(() => {
          setShowSaveModal(false);
          setSaveSuccess(false);
        }, 1500);
      }
    } catch (e) {
      setSaveError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Determine category winners
  const getWinnerInfo = () => {
    if (comparisonColleges.length < 2) return null;
    
    let lowestFees = comparisonColleges[0];
    let highestPackage = comparisonColleges[0];
    let highestRating = comparisonColleges[0];
    let highestRoi = comparisonColleges[0];

    comparisonColleges.forEach(c => {
      if (c.fees < lowestFees.fees) lowestFees = c;
      if (c.averagePackage > highestPackage.averagePackage) highestPackage = c;
      if (c.rating > highestRating.rating) highestRating = c;
      
      const cRoi = c.roiScore || (c.averagePackage / (c.fees / 100000));
      const bestRoiVal = highestRoi.roiScore || (highestRoi.averagePackage / (highestRoi.fees / 100000));
      if (cRoi > bestRoiVal) highestRoi = c;
    });

    return {
      lowestFeesId: lowestFees.id,
      highestPackageId: highestPackage.id,
      highestRatingId: highestRating.id,
      highestRoiId: highestRoi.id
    };
  };

  const winners = getWinnerInfo();

  // Smart Comparison text generator
  const getSmartSummaryText = () => {
    if (comparisonColleges.length < 2) return '';
    let lowestFees = comparisonColleges[0];
    let highestPackage = comparisonColleges[0];
    let highestRoi = comparisonColleges[0];

    comparisonColleges.forEach(c => {
      if (c.fees < lowestFees.fees) lowestFees = c;
      if (c.averagePackage > highestPackage.averagePackage) highestPackage = c;
      
      const cRoi = c.roiScore || (c.averagePackage / (c.fees / 100000));
      const bestRoiVal = highestRoi.roiScore || (highestRoi.averagePackage / (highestRoi.fees / 100000));
      if (cRoi > bestRoiVal) highestRoi = c;
    });

    return `Among your compared selections, ${highestPackage.name} offers the best career prospects with an average placement package of ${highestPackage.averagePackage} LPA. If budget and cost efficiency are your primary parameters, ${lowestFees.name} is the most affordable choice at ₹${lowestFees.fees.toLocaleString('en-IN')}/year. However, for maximum return-on-investment, ${highestRoi.name} leads the list with an ROI rating of ${(highestRoi.roiScore || 0).toFixed(1)}x.`;
  };

  // Get dynamic verdict card
  const getVerdict = (college: any) => {
    if (comparisonColleges.length < 2) return '';
    const roi = college.roiScore || (college.averagePackage / (college.fees / 100000));
    if (winners?.highestPackageId === college.id) {
      return 'Premium Placement Leader';
    } else if (winners?.lowestFeesId === college.id) {
      return 'Budget Friendly Pick';
    } else if (winners?.highestRoiId === college.id || roi > 5.5) {
      return 'High ROI Value Pick';
    } else {
      return 'Balanced Academic Pick';
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] py-12 relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-[-50px] right-[10%] bg-glow-purple"></div>
      <div className="absolute bottom-[100px] left-[5%] bg-glow-purple" style={{ animationDelay: '-2s' }}></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-[#2A2A40]">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#F5F5F5] flex items-center gap-2.5">
              <GitCompare className="h-7 w-7 text-[#8B5CF6]" />
              Advanced Compare Hub
            </h2>
            <p className="mt-1.5 text-xs text-[#B0B0C0]">
              Side-by-side matrices mapping fees, ratings, placement benchmarks, ROI structures, and accredited metrics.
            </p>
          </div>
          
          {comparisonColleges.length > 0 && (
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={() => setShowSaveModal(true)}
                  disabled={comparisonColleges.length < 2}
                  className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-bold border transition-all cursor-pointer ${
                    comparisonColleges.length >= 2
                      ? 'border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 shadow shadow-purple-500/10'
                      : 'border-[#2A2A40] text-neutral-600 cursor-not-allowed'
                  }`}
                >
                  <Save className="h-4 w-4" />
                  Save Comparison
                </button>
              )}
              <button
                onClick={clearComparison}
                className="flex items-center gap-1.5 rounded-lg border border-[#2A2A40] px-4 py-2.5 text-xs font-bold text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5] transition-all cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-red-400" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Empty State / Select College to Start */}
        {comparisonColleges.length === 0 ? (
          <div className="mt-12 text-center rounded-2xl border border-dashed border-[#2A2A40]/80 bg-[#151521]/30 p-16 backdrop-blur-md animate-fade-in flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] mb-4">
              <GitCompare className="h-6 w-6" />
            </div>
            <h3 className="text-base font-extrabold text-[#F5F5F5]">Create Side-by-Side Evaluations</h3>
            <p className="mt-2 text-xs text-[#B0B0C0]/85 max-w-sm leading-relaxed font-light">
              Select 2 to 3 colleges from the directory or search for them below to compare ROI metrics, annual fees, and average placement salary packages.
            </p>
            
            {/* Quick Add search */}
            <div className="mx-auto mt-8 max-w-md relative">
              <div className="flex items-center rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-3 py-1 shadow-sm focus-within:border-[#8B5CF6]/60 transition-colors">
                <Plus className="h-5 w-5 text-[#B0B0C0]/50" />
                <input
                  type="text"
                  placeholder="Search and add a college..."
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  className="w-full border-none bg-transparent py-2.5 pl-2 text-xs outline-none placeholder:text-[#B0B0C0]/35 text-[#F5F5F5]"
                />
              </div>
              
              {/* Search dropdown results */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 z-25 max-h-60 overflow-y-auto rounded-xl border border-[#2A2A40] bg-[#151521] shadow-xl p-2 text-left backdrop-blur-md">
                  {searchResults.map(result => (
                    <button
                      key={result.id}
                      onClick={() => handleAddCollege(result)}
                      className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs text-[#B0B0C0] hover:bg-[#2A2A40]/40 hover:text-[#F5F5F5] text-left transition-colors cursor-pointer"
                    >
                      <img 
                        src={getSafeLogoSrc(result)} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackLogoUrl();
                        }}
                        alt="" 
                        className="h-7 w-7 rounded object-cover object-center border border-[#2A2A40]" 
                      />
                      <div>
                        <div className="font-semibold">{result.name}</div>
                        <div className="text-[9px] text-[#B0B0C0]/50 mt-0.5">{result.location}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 shadow-md transition-colors"
            >
              Browse Colleges
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-8 animate-fade-in">
            
            {/* Quick Add search inside compare view (up to 3 maximum) */}
            {comparisonColleges.length < 3 && (
              <div className="max-w-md relative">
                <div className="flex items-center rounded-xl border border-[#2A2A40] bg-[#151521]/60 px-3 py-1 shadow-sm focus-within:border-[#8B5CF6]/60 transition-colors">
                  <Plus className="h-4 w-4 text-[#B0B0C0]/50" />
                  <input
                    type="text"
                    placeholder="Search and add another college to compare..."
                    value={search}
                    onChange={e => {
                      setSearch(e.target.value);
                      setShowSearchDropdown(true);
                    }}
                    onFocus={() => setShowSearchDropdown(true)}
                    className="w-full border-none bg-transparent py-2.5 pl-2 text-xs outline-none placeholder:text-[#B0B0C0]/35 text-[#F5F5F5]"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}>
                      <X className="h-4 w-4 text-[#B0B0C0] hover:text-[#F5F5F5]" />
                    </button>
                  )}
                </div>

                {/* Dropdown results */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 z-25 max-h-60 overflow-y-auto rounded-xl border border-[#2A2A40] bg-[#151521] shadow-xl p-2 text-left">
                    {searchResults.map(result => (
                      <button
                        key={result.id}
                        onClick={() => handleAddCollege(result)}
                        className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-xs text-[#B0B0C0] hover:bg-[#2A2A40]/40 hover:text-[#F5F5F5] text-left transition-all cursor-pointer"
                      >
                        <img 
                          src={getSafeLogoSrc(result)} 
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackLogoUrl();
                          }}
                          alt="" 
                          className="h-7 w-7 rounded object-cover object-center border border-[#2A2A40]" 
                        />
                        <div>
                          <div className="font-semibold">{result.name}</div>
                          <div className="text-[9px] text-[#B0B0C0]/50 mt-0.5">{result.location}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Smart Summary Alert */}
            {comparisonColleges.length >= 2 && (
              <div className="rounded-xl border border-[#2A2A40] bg-[#8B5CF6]/5 p-5 text-xs backdrop-blur-sm flex gap-3.5 items-start">
                <div className="p-1.5 rounded-lg bg-[#8B5CF6]/20 text-[#8B5CF6] shrink-0 mt-0.5">
                  <Info className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#F5F5F5] mb-1.5 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6] animate-pulse" />
                    AI-Powered Comparison Analysis
                  </h4>
                  <p className="text-[#B0B0C0] leading-relaxed font-light">
                    {getSmartSummaryText()}
                  </p>
                </div>
              </div>
            )}

            {/* Side-by-Side Table Matrix */}
            <div className="overflow-x-auto rounded-2xl border border-[#2A2A40] bg-[#151521]/40 shadow-sm backdrop-blur-sm">
              <table className="min-w-full divide-y divide-[#2A2A40] text-left text-xs table-fixed">
                <thead className="bg-[#151521]/60">
                  <tr className="divide-x divide-[#2A2A40]">
                    {/* Metrics header */}
                    <th className="w-1/4 px-6 py-5 font-bold text-[#B0B0C0] uppercase tracking-wider text-[10px]">
                      Intelligence Metrics
                    </th>
                    {/* College headers */}
                    {comparisonColleges.map(college => (
                      <th key={college.id} className="px-6 py-5 align-top relative">
                        <button
                          onClick={() => removeFromComparison(college.id)}
                          className="absolute top-4 right-4 rounded-full p-1.5 hover:bg-[#2A2A40] text-[#B0B0C0] hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                        
                        <div className="flex flex-col items-center text-center mt-2">
                           <img
                             src={getSafeLogoSrc(college)}
                             onError={(e) => {
                               e.currentTarget.onerror = null;
                               e.currentTarget.src = getFallbackLogoUrl();
                             }}
                             alt=""
                             className="h-12 w-12 rounded-xl object-cover object-center border border-[#2A2A40] bg-[#0A0A0F] shadow"
                           />
                          <h4 className="mt-3 font-extrabold text-[#F5F5F5] line-clamp-2">
                            {college.name}
                          </h4>
                          <span className="text-[9px] text-[#B0B0C0] flex items-center gap-0.5 mt-1.5">
                            <MapPin className="h-3 w-3 text-[#8B5CF6]" />
                            {college.location}
                          </span>
                        </div>
                      </th>
                    ))}
                    {/* Placeholder if comparing less than 3 */}
                    {comparisonColleges.length < 3 && (
                      <th className="px-6 py-5 bg-[#0A0A0F]/20 text-center text-neutral-500 text-xs font-semibold select-none">
                        <div className="flex flex-col items-center justify-center min-h-[120px]">
                          <Plus className="h-8 w-8 text-[#2A2A40] animate-pulse mb-2" />
                          <span>Empty Slot</span>
                        </div>
                      </th>
                    )}
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#2A2A40] text-[#B0B0C0]">
                  {/* Verdict Row */}
                  {comparisonColleges.length >= 2 && (
                    <tr className="divide-x divide-[#2A2A40] bg-[#8B5CF6]/5">
                      <td className="px-6 py-4 font-bold text-[#F5F5F5]">Admission Verdict</td>
                      {comparisonColleges.map(college => (
                        <td key={college.id} className="px-6 py-4 text-center">
                          <span className="inline-flex rounded-full bg-[#8B5CF6]/20 px-2.5 py-1 text-[9px] font-bold text-white border border-[#8B5CF6]/35">
                            {getVerdict(college)}
                          </span>
                        </td>
                      ))}
                      {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                    </tr>
                  )}

                  {/* Rating row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Rating & Reviews</td>
                    {comparisonColleges.map(college => {
                      const isWinner = winners?.highestRatingId === college.id;
                      return (
                        <td key={college.id} className={`px-6 py-4 text-center font-bold ${isWinner ? 'bg-purple-500/5 text-[#8B5CF6]' : ''}`}>
                          <div className="flex items-center gap-1.5 justify-center">
                            <Star className={`h-3.5 w-3.5 fill-[#8B5CF6] text-[#8B5CF6] ${isWinner ? 'scale-110' : ''}`} />
                            <span>{college.rating} / 5</span>
                          </div>
                        </td>
                      );
                    })}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Intelligence Score Row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Intelligence Rating</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center font-extrabold text-[#F5F5F5]">
                        <span className="rounded-lg bg-[#151521] border border-[#2A2A40] px-2.5 py-1 text-xs text-[#8B5CF6]">
                          {college.collegeIntelligenceScore || 75.0} / 100
                        </span>
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* ROI Score Row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Value Yield (ROI)</td>
                    {comparisonColleges.map(college => {
                      const isWinner = winners?.highestRoiId === college.id;
                      return (
                        <td key={college.id} className={`px-6 py-4 text-center font-extrabold ${isWinner ? 'bg-purple-500/5 text-[#A855F7]' : ''}`}>
                          <span>{(college.roiScore || (college.averagePackage / (college.fees / 100000))).toFixed(1)}x ROI</span>
                        </td>
                      );
                    })}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Fees row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Annual Cost (Academic)</td>
                    {comparisonColleges.map(college => {
                      const isWinner = winners?.lowestFeesId === college.id;
                      return (
                        <td key={college.id} className={`px-6 py-4 text-center font-extrabold ${isWinner ? 'bg-purple-500/5 text-emerald-400' : 'text-[#F5F5F5]'}`}>
                          <div className="flex items-center gap-0.5 justify-center">
                            <IndianRupee className="h-3.5 w-3.5 text-[#8B5CF6]" />
                            {college.fees.toLocaleString('en-IN')}
                          </div>
                        </td>
                      );
                    })}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Placement Rate row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Placement Success Rate</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center font-bold text-[#F5F5F5]">
                        {college.placementRate}%
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Average Package row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Average Packages</td>
                    {comparisonColleges.map(college => {
                      const isWinner = winners?.highestPackageId === college.id;
                      return (
                        <td key={college.id} className={`px-6 py-4 text-center font-extrabold ${isWinner ? 'bg-purple-500/5 text-[#8B5CF6]' : ''}`}>
                          <div className="flex items-center gap-1 justify-center">
                            <Briefcase className="h-4 w-4" />
                            {college.averagePackage} LPA
                          </div>
                        </td>
                      );
                    })}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Highest Package row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Highest Packages</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center font-extrabold text-[#A855F7]">
                        {college.highestPackage} LPA
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Ownership type row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Ownership Status</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center font-medium">
                        {college.ownership || 'Private'}
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Accreditation row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Accreditation</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center font-semibold text-[#8B5CF6]">
                        {college.accreditation || 'NAAC A'}
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Accepted Exams row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Accepted Entrance Exams</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center text-xs">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {college.exams?.map((ex: string) => (
                            <span key={ex} className="rounded bg-[#0A0A0F] border border-[#2A2A40] px-2 py-0.5 text-[9px] font-medium">
                              {ex}
                            </span>
                          )) || 'JEE Main'}
                        </div>
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Facilities row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Campus Facilities</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-left text-xs font-light leading-relaxed">
                        <div className="flex flex-wrap gap-1.5">
                          {college.facilities?.map((f: string) => (
                            <span key={f} className="rounded-full bg-[#8B5CF6]/5 px-2 py-0.5 text-[9px] text-[#B0B0C0] border border-[#2A2A40]/40">
                              {f}
                            </span>
                          )) || 'Hostel, Library'}
                        </div>
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Established Year row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Established Year</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center">
                        {college.established} (Est.)
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>

                  {/* Action Link row */}
                  <tr className="divide-x divide-[#2A2A40] hover:bg-[#151521]/20">
                    <td className="px-6 py-4 font-bold text-[#F5F5F5]">Detail Link</td>
                    {comparisonColleges.map(college => (
                      <td key={college.id} className="px-6 py-4 text-center">
                        <Link
                          href={`/college/${college.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-4 py-2 text-xs font-bold text-white hover:opacity-90 shadow transition-colors"
                        >
                          View Details
                        </Link>
                      </td>
                    ))}
                    {comparisonColleges.length < 3 && <td className="bg-[#0A0A0F]/20"></td>}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Side-by-Side Visual Comparison Charts */}
            {comparisonColleges.length >= 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
                
                {/* 1. Placement Packages Grouped Chart */}
                <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm">
                  <h4 className="font-bold text-xs text-[#F5F5F5] uppercase tracking-wider mb-6 flex items-center gap-1.5">
                    <Briefcase className="h-4.5 w-4.5 text-[#8B5CF6]" />
                    Placement Packages Comparison (LPA)
                  </h4>
                  <div className="w-full flex justify-center py-2 bg-[#0A0A0F]/30 rounded-xl border border-[#2A2A40]/40">
                    <svg width="280" height="200" viewBox="0 0 280 200" className="text-xs">
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="260" y2="30" stroke="#2A2A40" strokeDasharray="3,3" />
                      <line x1="40" y1="80" x2="260" y2="80" stroke="#2A2A40" strokeDasharray="3,3" />
                      <line x1="40" y1="130" x2="260" y2="130" stroke="#2A2A40" strokeDasharray="3,3" />
                      <line x1="40" y1="170" x2="260" y2="170" stroke="#2A2A40" />

                      {/* Y Axis Labels */}
                      <text x="15" y="34" fill="#B0B0C0" fontSize="9">150 LPA</text>
                      <text x="15" y="84" fill="#B0B0C0" fontSize="9">80 LPA</text>
                      <text x="15" y="134" fill="#B0B0C0" fontSize="9">20 LPA</text>
                      <text x="15" y="174" fill="#B0B0C0" fontSize="9">0 LPA</text>

                      {/* Bar groups */}
                      {comparisonColleges.map((col, index) => {
                        const colWidth = 60;
                        const spacing = 15;
                        const xOffset = 50 + index * (colWidth + spacing);
                        
                        // Map packages to height (140px max height)
                        const avgHeight = Math.min(140, (col.averagePackage / 150) * 140);
                        const maxHeight = Math.min(140, (col.highestPackage / 150) * 140);

                        return (
                          <g key={`bars-${col.id}`}>
                            {/* Average package bar */}
                            <rect
                              x={xOffset}
                              y={170 - avgHeight}
                              width="16"
                              height={avgHeight}
                              fill="url(#purpleGrad)"
                              rx="3"
                            />
                            {/* Highest package bar */}
                            <rect
                              x={xOffset + 18}
                              y={170 - maxHeight}
                              width="16"
                              height={maxHeight}
                              fill="url(#accentGrad)"
                              rx="3"
                            />
                            {/* College short label */}
                            <text
                              x={xOffset + 17}
                              y="188"
                              fill="#B0B0C0"
                              fontSize="8"
                              textAnchor="middle"
                            >
                              {col.name.split(',')[0].substring(0, 10)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Definitions */}
                      <defs>
                        <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="accentGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="flex justify-center gap-6 mt-4 text-[10px] text-[#B0B0C0]">
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3.5 w-3.5 rounded bg-[#8B5CF6]"></span>
                      <span>Average LPA</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="inline-block h-3.5 w-3.5 rounded bg-[#A855F7]"></span>
                      <span>Highest LPA</span>
                    </div>
                  </div>
                </div>

                {/* 2. Fees Structure Comparison Chart */}
                <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm">
                  <h4 className="font-bold text-xs text-[#F5F5F5] uppercase tracking-wider mb-6 flex items-center gap-1.5">
                    <IndianRupee className="h-4.5 w-4.5 text-[#8B5CF6]" />
                    Annual Fee Structure Comparison
                  </h4>
                  <div className="w-full flex justify-center py-2 bg-[#0A0A0F]/30 rounded-xl border border-[#2A2A40]/40">
                    <svg width="280" height="200" viewBox="0 0 280 200" className="text-xs">
                      {/* Grid Lines */}
                      <line x1="40" y1="30" x2="260" y2="30" stroke="#2A2A40" strokeDasharray="3,3" />
                      <line x1="40" y1="80" x2="260" y2="80" stroke="#2A2A40" strokeDasharray="3,3" />
                      <line x1="40" y1="130" x2="260" y2="130" stroke="#2A2A40" strokeDasharray="3,3" />
                      <line x1="40" y1="170" x2="260" y2="170" stroke="#2A2A40" />

                      {/* Y Axis Labels */}
                      <text x="10" y="34" fill="#B0B0C0" fontSize="9">₹12 Lakhs</text>
                      <text x="10" y="84" fill="#B0B0C0" fontSize="9">₹6 Lakhs</text>
                      <text x="10" y="134" fill="#B0B0C0" fontSize="9">₹2 Lakhs</text>
                      <text x="10" y="174" fill="#B0B0C0" fontSize="9">₹0</text>

                      {/* Bars */}
                      {comparisonColleges.map((col, index) => {
                        const colWidth = 50;
                        const spacing = 20;
                        const xOffset = 60 + index * (colWidth + spacing);
                        
                        // Map fees to height (140px max height for 12 Lakhs)
                        const barHeight = Math.min(140, (col.fees / 1200000) * 140);
                        const isWinner = winners?.lowestFeesId === col.id;

                        return (
                          <g key={`fees-bar-${col.id}`}>
                            <rect
                              x={xOffset}
                              y={170 - barHeight}
                              width="26"
                              height={barHeight}
                              fill={isWinner ? 'url(#greenGrad)' : 'url(#purpleGrad)'}
                              rx="4"
                            />
                            {/* Fee Value text on top */}
                            <text
                              x={xOffset + 13}
                              y={164 - barHeight}
                              fill={isWinner ? '#10B981' : '#F5F5F5'}
                              fontSize="8"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              ₹{(col.fees / 100000).toFixed(1)}L
                            </text>
                            {/* College Label */}
                            <text
                              x={xOffset + 13}
                              y="188"
                              fill="#B0B0C0"
                              fontSize="8"
                              textAnchor="middle"
                            >
                              {col.name.split(',')[0].substring(0, 10)}
                            </text>
                          </g>
                        );
                      })}

                      {/* Definitions */}
                      <defs>
                        <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10B981" />
                          <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="text-center mt-4 text-[10px] text-[#B0B0C0]/60">
                    * Values represent annual tuition fee costs. Green bar highlights the most cost-effective choice.
                  </div>
                </div>

              </div>
            )}

          </div>
        )}
      </div>

      {/* Save Comparison Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-[#2A2A40] bg-[#151521] p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#2A2A40]/60 pb-4">
              <h3 className="font-bold text-[#F5F5F5] flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-[#8B5CF6]" />
                Save Current Comparison
              </h3>
              <button
                onClick={() => setShowSaveModal(false)}
                className="rounded-full p-1 hover:bg-[#2A2A40] text-[#B0B0C0] hover:text-[#F5F5F5] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {saveSuccess ? (
              <div className="my-6 text-center text-sm font-bold text-emerald-400 py-4">
                Comparison profile saved successfully!
              </div>
            ) : (
              <form onSubmit={handleSaveComparison} className="space-y-4 mt-4">
                {saveError && (
                  <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-xs text-red-400">
                    {saveError}
                  </div>
                )}
                
                <div>
                  <label htmlFor="comp-name" className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">
                    Comparison Name
                  </label>
                  <input
                    id="comp-name"
                    type="text"
                    placeholder="e.g. My Top Engineering Choices"
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-3.5 py-2.5 text-xs outline-none text-[#F5F5F5]"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[#2A2A40]/45">
                  <button
                    type="button"
                    onClick={() => setShowSaveModal(false)}
                    className="rounded-lg border border-[#2A2A40] px-4 py-2 text-xs font-bold text-[#B0B0C0] hover:bg-[#2A2A40]/30 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-5 py-2 text-xs font-bold text-white hover:opacity-90 shadow transition-colors cursor-pointer"
                  >
                    {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
