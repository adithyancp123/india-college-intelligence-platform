'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, College } from '@/context/AppContext';
import { GraduationCap, Sparkles, Sliders, Briefcase, Award, TrendingUp, MapPin, IndianRupee, ArrowRight, ArrowLeft, CheckCircle, HelpCircle, Check, GitCompare, Bookmark } from 'lucide-react';

export default function CollegePredictor() {
  const router = useRouter();
  const { user, addToComparison, comparisonColleges, toggleSaveCollege, savedCollegeIds } = useApp();

  // Wizard state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [predictionData, setPredictionData] = useState<any>(null);

  // Form Inputs
  const [exam, setExam] = useState('JEE Main');
  const [rank, setRank] = useState(12000);
  const [budget, setBudget] = useState(400000);
  const [branch, setBranch] = useState('Computer Science');
  const [collegeType, setCollegeType] = useState('All');
  const [preferredState, setPreferredState] = useState('All');
  const [preferredCity, setPreferredCity] = useState('');
  const [placementExpectation, setPlacementExpectation] = useState(8);

  const [activeResultTab, setActiveResultTab] = useState<'all' | 'roi' | 'placement' | 'affordable' | 'scholarship'>('all');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const isRerun = params.get('rerun');
    if (isRerun) {
      const pExam = params.get('exam');
      const pRank = params.get('rank');
      const pBudget = params.get('budget');
      const pBranch = params.get('branch');
      const pType = params.get('type');
      const pState = params.get('state');
      const pCity = params.get('city');
      const pPlacement = params.get('placement');

      if (pExam) setExam(pExam);
      if (pRank) setRank(Number(pRank));
      if (pBudget) setBudget(Number(pBudget));
      if (pBranch) setBranch(pBranch);
      if (pType) setCollegeType(pType);
      if (pState) setPreferredState(pState);
      if (pCity) setPreferredCity(pCity);
      if (pPlacement) setPlacementExpectation(Number(pPlacement));

      setStep(3); // Jump to step 3 (confirmation page)
    }
  }, []);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPredictionData(null);
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          exam,
          rank: Number(rank),
          budget: Number(budget),
          preferredState,
          preferredCity,
          branch,
          collegeType,
          placementExpectation: Number(placementExpectation),
        }),
      });

      const data = await res.json();
      setPredictionData(data);

      // Save to localStorage history
      try {
        const historyStr = localStorage.getItem('predictor_history');
        let historyList: any[] = [];
        if (historyStr) {
          const parsed = JSON.parse(historyStr);
          if (Array.isArray(parsed)) {
            historyList = parsed;
          }
        }
        const filteredHistory = historyList.filter((run: any) => 
          run && !(run.exam === exam && run.rank === Number(rank) && run.branch === branch && run.budget === Number(budget))
        );
        const newRun = {
          id: 'pred-' + Date.now(),
          exam,
          rank: Number(rank),
          budget: Number(budget),
          preferredState,
          preferredCity,
          branch,
          collegeType,
          placementExpectation: Number(placementExpectation),
          timestamp: new Date().toISOString()
        };
        const updatedHistory = [newRun, ...filteredHistory].slice(0, 10);
        localStorage.setItem('predictor_history', JSON.stringify(updatedHistory));
      } catch (e) {
        console.error('Failed to save predictor history:', e);
      }

      setStep(4); // Move to results step
    } catch (e) {
      console.error(e);
      alert('Failed to generate predictions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPredictor = () => {
    setStep(1);
    setPredictionData(null);
  };

  const getResultList = () => {
    if (!predictionData) return [];
    switch (activeResultTab) {
      case 'roi': return predictionData.roiAlternatives || [];
      case 'placement': return predictionData.placementFocused || [];
      case 'affordable': return predictionData.affordableOptions || [];
      case 'scholarship': return predictionData.scholarshipOptions || [];
      default: return predictionData.recommendations || [];
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-100px] right-[5%] bg-glow-purple"></div>
      <div className="absolute bottom-[200px] left-[5%] bg-glow-purple" style={{ animationDelay: '-4s' }}></div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#8B5CF6]/10 px-4 py-1.5 text-xs font-semibold text-[#8B5CF6] border border-[#8B5CF6]/20 mb-4 animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Advanced Admission Intelligence</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-[#F5F5F5] via-purple-300 to-[#A855F7] bg-clip-text text-transparent">
            Smart College Predictor
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-xs sm:text-sm text-[#B0B0C0] leading-relaxed">
            Specify your competitive exam rank, branch preference, and target budget to let our intelligence matching engine predict your best fits.
          </p>
        </div>

        {/* Wizard Progress Bar */}
        {step < 4 && (
          <div className="mb-12 max-w-md mx-auto">
            <div className="flex items-center justify-between text-xs text-[#B0B0C0] font-bold mb-2">
              <span className={step >= 1 ? 'text-[#8B5CF6]' : ''}>1. Score Details</span>
              <span className={step >= 2 ? 'text-[#8B5CF6]' : ''}>2. Branch & Fees</span>
              <span className={step >= 3 ? 'text-[#8B5CF6]' : ''}>3. Location & Packages</span>
            </div>
            <div className="h-1.5 w-full bg-[#151521] rounded-full overflow-hidden border border-[#2A2A40]">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full transition-all duration-300"
                style={{ width: `${(step / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Wizard Panels */}
        {loading ? (
          /* Predictor Loading screen */
          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/60 p-12 text-center backdrop-blur-md shadow-xl max-w-xl mx-auto space-y-6">
            <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] animate-spin"></div>
              <GraduationCap className="h-7 w-7 text-[#8B5CF6]" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-[#F5F5F5]">Predicting Admissions...</h4>
              <p className="text-xs text-[#B0B0C0] leading-relaxed">
                Analyzing historical cutoffs, ROI ratios, placement metrics, and campus criteria to find your matching universities.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {step === 1 && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/60 p-8 backdrop-blur-md shadow-xl max-w-xl mx-auto animate-fade-in">
                <h3 className="text-lg font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
                  <Award className="h-5 w-5 text-[#8B5CF6]" />
                  Enter Exam & Rank
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">Select Competitive Exam</label>
                    <select
                      value={exam}
                      onChange={e => {
                        setExam(e.target.value);
                        setRank(e.target.value === 'CAT' ? 95 : 12000);
                      }}
                      className="w-full rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    >
                      <option value="JEE Main">JEE Main (B.Tech - NITs/IIITs/State)</option>
                      <option value="JEE Advanced">JEE Advanced (B.Tech - IITs)</option>
                      <option value="BITSAT">BITSAT (B.Tech - BITS Campuses)</option>
                      <option value="CAT">CAT Percentile (MBA - IIMs/Top B-Schools)</option>
                      <option value="CUET">CUET (UG Science/Commerce/Arts)</option>
                      <option value="GATE">GATE Score (M.Tech - IISc/IITs/NITs)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">
                      {exam === 'CAT' ? 'Your CAT Percentile (0 - 100)' : 'Your All India Rank (AIR)'}
                    </label>
                    <input
                      type="number"
                      value={rank}
                      onChange={e => setRank(Math.max(0, Number(e.target.value)))}
                      className="w-full rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    />
                    <p className="text-[10px] text-[#B0B0C0]/50 mt-1.5">
                      {exam === 'CAT' 
                        ? 'Enter your percentile, e.g. 98.5.' 
                        : 'Enter your overall category/general rank, e.g. 15400.'}
                    </p>
                  </div>

                  <button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] py-3 text-xs font-bold text-white hover:opacity-90 shadow-md shadow-purple-500/10 cursor-pointer"
                  >
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/60 p-8 backdrop-blur-md shadow-xl max-w-xl mx-auto animate-fade-in">
                <h3 className="text-lg font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-[#8B5CF6]" />
                  Branch & Budget Preferences
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">Course / Branch Area</label>
                    <select
                      value={branch}
                      onChange={e => setBranch(e.target.value)}
                      className="w-full rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    >
                      <option value="Computer Science">Computer Science & Engineering (CSE / IT)</option>
                      <option value="Electronics">Electronics & Communication (ECE / EE)</option>
                      <option value="Management">Management (MBA / PGDM)</option>
                      <option value="Commerce">Commerce & Economics (B.Com / B.A.)</option>
                      <option value="All">All Branches</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">Maximum Annual Budget (INR)</label>
                    <div className="flex items-center rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-3 py-1 focus-within:border-[#8B5CF6]/50 transition-colors">
                      <IndianRupee className="h-4 w-4 text-[#8B5CF6]" />
                      <input
                        type="number"
                        value={budget}
                        onChange={e => setBudget(Math.max(0, Number(e.target.value)))}
                        className="w-full border-none bg-transparent py-3 pl-2 text-sm text-[#F5F5F5] outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-[#B0B0C0]/50 mt-1.5">
                      Specifies maximum target annual tuition fee, e.g. 3,50,000.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">College Type</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['All', 'Government', 'Private'].map(type => (
                        <button
                          key={type}
                          onClick={() => setCollegeType(type)}
                          className={`rounded-xl py-2.5 text-xs font-bold border transition-all cursor-pointer ${
                            collegeType === type
                              ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#8B5CF6]'
                              : 'border-[#2A2A40] bg-[#0A0A0F] text-[#B0B0C0] hover:bg-[#151521]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#2A2A40] py-3 text-xs font-bold text-[#B0B0C0] hover:bg-[#151521] transition-all cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] py-3 text-xs font-bold text-white hover:opacity-90 shadow-md shadow-purple-500/10 cursor-pointer"
                    >
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/60 p-8 backdrop-blur-md shadow-xl max-w-xl mx-auto animate-fade-in">
                <h3 className="text-lg font-bold text-[#F5F5F5] mb-6 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-[#8B5CF6]" />
                  Location & Placement Expectations
                </h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">Preferred State</label>
                    <select
                      value={preferredState}
                      onChange={e => setPreferredState(e.target.value)}
                      className="w-full rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    >
                      <option value="All">All States</option>
                      <option value="Maharashtra">Maharashtra</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Karnataka">Karnataka</option>
                      <option value="Tamil Nadu">Tamil Nadu</option>
                      <option value="Telangana">Telangana</option>
                      <option value="Gujarat">Gujarat</option>
                      <option value="Uttar Pradesh">Uttar Pradesh</option>
                      <option value="West Bengal">West Bengal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">Preferred City (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Bangalore"
                      value={preferredCity}
                      onChange={e => setPreferredCity(e.target.value)}
                      className="w-full rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors placeholder:text-[#B0B0C0]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">Placement expectation (Avg LPA)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="3"
                        max="25"
                        step="1"
                        value={placementExpectation}
                        onChange={e => setPlacementExpectation(Number(e.target.value))}
                        className="w-full h-1.5 bg-[#0A0A0F] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                      />
                      <span className="text-xs font-bold text-[#8B5CF6] whitespace-nowrap">{placementExpectation} LPA+</span>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-2">
                    <button
                      onClick={handleBack}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-[#2A2A40] py-3 text-xs font-bold text-[#B0B0C0] hover:bg-[#151521] transition-all cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] py-3 text-xs font-bold text-white hover:opacity-90 shadow-md shadow-purple-500/20 cursor-pointer"
                    >
                      Predict Fits
                      <CheckCircle className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === 4 && predictionData && (
              /* Predictor Results */
              <div className="space-y-8 animate-fade-in">
                {/* Back Link */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={resetPredictor}
                    className="flex items-center gap-1 text-xs font-bold text-[#B0B0C0] hover:text-[#F5F5F5] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Configure Predictor Inputs
                  </button>
                  <span className="text-xs text-[#B0B0C0] bg-[#151521] border border-[#2A2A40] px-3.5 py-1.5 rounded-full font-medium">
                    Found <span className="font-bold text-[#8B5CF6]">{predictionData.count}</span> matching courses
                  </span>
                </div>

                {/* Outcome Category Tabs */}
                <div className="flex flex-wrap items-center justify-center gap-2 border-b border-[#2A2A40] pb-4">
                  {[
                    { id: 'all', label: 'All Recommended' },
                    { id: 'roi', label: 'Best ROI Matches' },
                    { id: 'placement', label: 'Highest Placements' },
                    { id: 'affordable', label: 'Most Affordable' },
                    { id: 'scholarship', label: 'Scholarship Friendly' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveResultTab(tab.id as any)}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                        activeResultTab === tab.id
                          ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40'
                          : 'text-[#B0B0C0] border border-transparent hover:text-[#F5F5F5] hover:bg-[#151521]/60'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Results Grid */}
                {getResultList().length === 0 ? (
                  <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/30 p-16 text-center backdrop-blur-md">
                    <HelpCircle className="mx-auto h-12 w-12 text-[#B0B0C0]/60 animate-bounce" />
                    <h3 className="mt-4 text-base font-bold text-[#F5F5F5]">No Recommendations Found</h3>
                    <p className="mt-2 text-xs text-[#B0B0C0] max-w-sm mx-auto leading-relaxed">
                      We couldn't find colleges matching your exact rank range or budget limits. Try increasing your maximum budget or modifying the exam details.
                    </p>
                    <button
                      onClick={resetPredictor}
                      className="mt-6 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 cursor-pointer"
                    >
                      Adjust Predictor
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getResultList().map((rec: any, idx: number) => {
                      const isSaved = savedCollegeIds.includes(rec.collegeId);
                      const isInCompare = comparisonColleges.some(c => c.id === rec.collegeId);

                      return (
                        <div
                          key={`${rec.collegeId}-${rec.courseName}-${idx}`}
                          className="group rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-6 flex flex-col justify-between hover:border-[#8B5CF6]/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
                        >
                          <div>
                            {/* Card Header (Category Badge + Confidence) */}
                            <div className="flex items-center justify-between mb-4">
                              <span
                                className={`rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-wider border ${
                                  rec.category === 'Safe'
                                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                                    : rec.category === 'Target'
                                    ? 'bg-purple-500/10 border-[#8B5CF6]/35 text-[#8B5CF6]'
                                    : 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                                }`}
                              >
                                {rec.category} Match
                              </span>
                              <div className="text-[10px] font-bold text-[#B0B0C0] flex items-center gap-1.5">
                                Match Score:
                                <span className="text-[#8B5CF6] text-xs font-extrabold">{rec.confidenceScore}%</span>
                              </div>
                            </div>

                            {/* College Logo and Name */}
                            <div className="flex items-start gap-3">
                              <img
                                src={rec.logoUrl}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover border border-[#2A2A40]"
                              />
                              <div>
                                <h4 className="font-extrabold text-[#F5F5F5] text-sm line-clamp-1 hover:text-[#8B5CF6] transition-colors">
                                  <Link href={`/college/${rec.collegeId}`}>{rec.collegeName}</Link>
                                </h4>
                                <p className="text-[10px] text-[#B0B0C0] flex items-center gap-1 mt-0.5">
                                  <MapPin className="h-3 w-3 text-[#8B5CF6]" />
                                  {rec.location}
                                </p>
                              </div>
                            </div>

                            {/* Recommended Course & Fees */}
                            <div className="mt-4 bg-[#0A0A0F]/60 border border-[#2A2A40]/40 rounded-xl p-3.5 space-y-2 text-xs">
                              <div className="flex justify-between items-start">
                                <span className="text-[#B0B0C0]/85 font-medium max-w-[70%] line-clamp-1">{rec.courseName}</span>
                                <span className="font-bold text-[#8B5CF6]">₹{rec.courseFees.toLocaleString('en-IN')}/yr</span>
                              </div>
                              <div className="flex justify-between text-[10px] border-t border-[#2A2A40]/30 pt-2 text-[#B0B0C0]">
                                <span>Cutoff Rank: <strong className="text-[#F5F5F5] font-semibold">{rec.courseCutoff}</strong></span>
                                <span>Exam: <strong className="text-[#F5F5F5] font-semibold">{rec.exam}</strong></span>
                              </div>
                            </div>

                            {/* Explanation Paragraphs */}
                            <p className="mt-4 text-xs text-[#B0B0C0]/90 leading-relaxed font-light line-clamp-3">
                              {rec.explanation}
                            </p>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-3 border-t border-[#2A2A40]/40 pt-4 mt-4 text-[10px] text-center">
                              <div>
                                <span className="block text-[#B0B0C0]/50 font-bold uppercase tracking-wider">Avg LPA</span>
                                <span className="font-extrabold text-[#F5F5F5] text-xs">{rec.averagePackage} LPA</span>
                              </div>
                              <div>
                                <span className="block text-[#B0B0C0]/50 font-bold uppercase tracking-wider">NIRF Rank</span>
                                <span className="font-extrabold text-[#F5F5F5] text-xs">{rec.nirfRank || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[#B0B0C0]/50 font-bold uppercase tracking-wider">ROI Rating</span>
                                <span className="font-extrabold text-[#8B5CF6] text-xs">{rec.roiScore}/10</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-3 pt-6 border-t border-[#2A2A40]/30 mt-5">
                            <button
                              onClick={() => {
                                const college: College = {
                                  id: rec.collegeId,
                                  name: rec.collegeName,
                                  location: rec.location,
                                  state: rec.state || '',
                                  city: rec.city || '',
                                  ownership: rec.ownership || 'Private',
                                  nirfRank: rec.nirfRank || null,
                                  fees: rec.courseFees,
                                  rating: rec.rating,
                                  description: rec.description || '',
                                  established: rec.established || 2000,
                                  logoUrl: rec.logoUrl,
                                  bannerUrl: rec.bannerUrl,
                                  placementRate: rec.placementRate,
                                  averagePackage: rec.averagePackage,
                                  highestPackage: rec.highestPackage,
                                  accreditation: rec.accreditation || null,
                                  website: rec.website || null,
                                  exams: rec.exams || [rec.exam],
                                  facilities: rec.facilities || [],
                                  collegeIntelligenceScore: rec.collegeIntelligenceScore || 70,
                                  roiScore: rec.roiScore || 7.0,
                                  scholarshipFriendly: rec.scholarshipFriendly || false,
                                  trending: rec.trending || false
                                };
                                const success = addToComparison(college);
                                if (!success) {
                                  alert('You can compare a maximum of 3 colleges.');
                                }
                              }}
                              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 text-[10px] font-bold border rounded-lg transition-colors cursor-pointer ${
                                isInCompare
                                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#8B5CF6]'
                                  : 'border-[#2A2A40] text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5]'
                              }`}
                            >
                              <GitCompare className="h-3.5 w-3.5" />
                              {isInCompare ? 'In Compare' : 'Compare'}
                            </button>

                            <Link
                              href={`/college/${rec.collegeId}`}
                              className="flex-1 text-center bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white px-3 py-2 text-[10px] font-bold rounded-lg hover:opacity-95 shadow transition-colors"
                            >
                              Explore College
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
