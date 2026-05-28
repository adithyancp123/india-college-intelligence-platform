'use client';

import React, { useState, useEffect } from 'react';
import { findMatchingScholarships, SCHOLARSHIPS_DATA, Scholarship } from '@/lib/intelligence/scholarships';
import { Sparkles, MapPin, IndianRupee, ShieldAlert, Award, Calendar, Search, Heart, ExternalLink, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ScholarshipsPage() {
  const [state, setState] = useState('All States');
  const [category, setCategory] = useState('General');
  const [income, setIncome] = useState(600000);
  const [gender, setGender] = useState('Male');
  const [examScore, setExamScore] = useState(85);

  const [matches, setMatches] = useState<Scholarship[]>(SCHOLARSHIPS_DATA);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Hydrate saved bookmarks
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved_scholarships');
      if (saved) {
        setSavedIds(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleSave = (id: string) => {
    const updated = savedIds.includes(id) 
      ? savedIds.filter(x => x !== id) 
      : [...savedIds, id];
    setSavedIds(updated);
    try {
      localStorage.setItem('saved_scholarships', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleMatch = (e: React.FormEvent) => {
    e.preventDefault();
    const results = findMatchingScholarships({
      state,
      category,
      income,
      gender,
      examScore
    });
    setMatches(results);
  };

  const filteredMatches = matches.filter(sch => 
    sch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    sch.eligibility.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Glow Ambient Backdrop */}
      <div className="absolute top-[-10%] right-[-5%] bg-glow-purple"></div>
      <div className="absolute bottom-[-10%] left-[-5%] bg-glow-purple" style={{ animationDelay: '-3s' }}></div>

      <div className="mx-auto max-w-7xl space-y-8 relative z-10 animate-fade-in">
        
        {/* Header Block */}
        <div className="border-b border-[#2A2A40]/40 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Scholarship IQ
              </span>
              <span className="text-[10px] bg-[#151521] text-[#B0B0C0] border border-[#2A2A40] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Heuristic Matcher
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#F5F5F5] flex items-center gap-2">
              <Award className="h-8 w-8 text-[#8B5CF6]" />
              Scholarship Intelligence Finder
            </h1>
            <p className="mt-2 text-xs text-[#B0B0C0] max-w-2xl leading-relaxed">
              Match your demographic, household income, academic cutoffs, and domicile parameters against real Post-Matric government allocations and private MCM merit sponsorships.
            </p>
          </div>
          <Link
            href="/"
            className="self-start md:self-auto rounded-xl bg-[#151521]/60 border border-[#2A2A40] text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 transition-all font-bold text-xs px-5 py-3 cursor-pointer"
          >
            Back Home
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Side Eligibility Questionnaire */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-6 space-y-6 backdrop-blur-sm shadow-sm select-none">
              <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <Filter className="h-4.5 w-4.5 text-[#8B5CF6]" />
                Eligibility Parameters
              </h3>

              <form onSubmit={handleMatch} className="space-y-4 text-xs">
                
                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">1. State Domicile</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                  >
                    <option value="All States">All India (Central Schemes)</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Jharkhand">Jharkhand</option>
                    <option value="Delhi">Delhi</option>
                    <option value="Karnataka">Karnataka</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">2. Category Classification</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">Economically Weaker Section (EWS)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">3. Annual Family Income (INR)</label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="100000"
                      max="2000000"
                      step="50000"
                      value={income}
                      onChange={(e) => setIncome(Number(e.target.value))}
                      className="w-full h-1 bg-[#2A2A40] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                    />
                    <div className="flex justify-between font-mono text-[10px] text-purple-300">
                      <span>Max Income Limit:</span>
                      <span className="font-bold">₹{income.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">4. Gender Identification</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Male', 'Female', 'Other'].map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`rounded-lg py-2 border font-bold text-center transition-all cursor-pointer ${
                          gender === g 
                            ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-purple-300' 
                            : 'border-[#2A2A40] text-[#B0B0C0] hover:text-[#F5F5F5]'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">5. Exam Performance Percentile (or % Score)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={examScore}
                    onChange={(e) => setExamScore(Number(e.target.value))}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 font-bold py-3.5 text-white shadow shadow-purple-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Evaluate Eligibility
                </button>
              </form>
            </div>
          </div>

          {/* Matches List Grid */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search filter bar */}
            <div className="flex items-center gap-3 bg-[#151521]/60 border border-[#2A2A40]/80 rounded-xl px-4 py-3 text-xs backdrop-blur-sm select-none">
              <Search className="h-4 w-4 text-[#B0B0C0]" />
              <input
                type="text"
                placeholder="Search scheme name or key criteria..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-[#F5F5F5] focus:outline-none placeholder-[#B0B0C0]/50"
              />
            </div>

            {/* Scheme Cards */}
            {filteredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMatches.map((sch) => {
                  const isSaved = savedIds.includes(sch.id);
                  return (
                    <div 
                      key={sch.id} 
                      className="rounded-xl border border-[#2A2A40] bg-[#151521]/30 p-5 backdrop-blur-sm hover:border-[#8B5CF6]/35 transition-all select-none space-y-4 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start gap-3">
                          <span className="flex items-center gap-1.5 text-[9px] font-extrabold bg-[#8B5CF6]/15 text-[#8B5CF6] border border-[#8B5CF6]/25 px-2 py-0.5 rounded">
                            <Sparkles className="h-3 w-3" />
                            Match Index: {sch.confidenceScore}%
                          </span>
                          
                          <button
                            onClick={() => toggleSave(sch.id)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              isSaved 
                                ? 'text-pink-400 border-pink-500/35 bg-pink-500/10' 
                                : 'border-[#2A2A40] text-[#B0B0C0] hover:text-[#F5F5F5]'
                            }`}
                          >
                            <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>
                        </div>

                        <h4 className="font-extrabold text-[#F5F5F5] text-xs leading-snug">{sch.name}</h4>
                        
                        <p className="text-[10px] text-[#B0B0C0] font-light leading-relaxed">
                          <span className="font-bold text-[#F5F5F5]">Eligibility:</span> {sch.eligibility}
                        </p>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-[#2A2A40]/40 text-[10px]">
                        <div className="flex items-center justify-between">
                          <span className="text-[#B0B0C0] flex items-center gap-1">
                            <IndianRupee className="h-3.5 w-3.5 text-purple-400" /> Benefits
                          </span>
                          <span className="font-bold text-purple-300">{sch.benefits}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[#B0B0C0] flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5 text-purple-400" /> Deadline
                          </span>
                          <span className="font-semibold text-neutral-350">{sch.deadline}</span>
                        </div>

                        <a
                          href={sch.applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 w-full rounded-lg bg-[#151521] hover:bg-[#1a1a2b] border border-[#2A2A40] hover:border-[#8B5CF6]/35 font-bold py-2 text-center text-[#F5F5F5] flex items-center justify-center gap-1.5 transition-all text-[9px]"
                        >
                          Official Portal
                          <ExternalLink className="h-3 w-3 text-purple-400" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2A2A40] bg-[#151521]/10 p-12 text-center flex flex-col items-center justify-center space-y-4 h-96 select-none">
                <ShieldAlert className="h-16 w-16 text-amber-500/20" />
                <h3 className="text-base font-bold text-[#F5F5F5]">No Matching Schemes Located</h3>
                <p className="text-xs text-[#B0B0C0] max-w-sm leading-relaxed">
                  We couldn't locate any scholarships matching your currently set eligibility metrics. Try adjusting your domicile selection, category limits, or lowering the household income limit slider.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
