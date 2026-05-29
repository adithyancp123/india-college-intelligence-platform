'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, College } from '@/context/AppContext';
import { 
  getSafeLogoSrc, 
  getSafeBannerSrc, 
  getFallbackLogoUrl, 
  getFallbackBannerUrl 
} from '@/lib/image-mapper';
import { 
  Bookmark, 
  GitCompare, 
  Trash2, 
  ArrowRight, 
  ShieldAlert, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Eye, 
  Sliders, 
  History, 
  TrendingUp, 
  Sparkles,
  Download,
  GraduationCap,
  Award,
  MessageSquare,
  BarChart3,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { findMatchingScholarships } from '@/lib/intelligence/scholarships';
import { ROADMAP_TEMPLATES } from '@/lib/intelligence/roadmaps';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loadingUser, toggleSaveCollege, setComparisonColleges, recentlyViewedIds } = useApp();

  const [savedColleges, setSavedColleges] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [activeTab, setActiveTab] = useState<'colleges' | 'comparisons' | 'history'>('colleges');
  const [recentlyViewedColleges, setRecentlyViewedColleges] = useState<any[]>([]);
  const [recommendedColleges, setRecommendedColleges] = useState<any[]>([]);
  const [predictorHistory, setPredictorHistory] = useState<any[]>([]);
  
  // PDF download state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');

  // Protect route
  useEffect(() => {
    if (!loadingUser && !user) {
      router.push('/login');
    }
  }, [user, loadingUser, router]);

  // Load local predictor history
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('predictor_history');
      if (historyStr) {
        const parsed = JSON.parse(historyStr);
        if (Array.isArray(parsed)) {
          setPredictorHistory(parsed);
        } else {
          setPredictorHistory([]);
          localStorage.removeItem('predictor_history');
        }
      }
    } catch (e) {
      console.error('Failed to load history:', e);
      try { localStorage.removeItem('predictor_history'); } catch (err) {}
    }
  }, []);

  const fetchData = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const collegesRes = await fetch('/api/saved-colleges');
      const collegesData = await collegesRes.json();
      if (collegesData.savedColleges) {
        setSavedColleges(collegesData.savedColleges);
      }

      const comparisonsRes = await fetch('/api/saved-comparisons');
      const comparisonsData = await comparisonsRes.json();
      if (comparisonsData.comparisons) {
        setComparisons(comparisonsData.comparisons);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Load recently viewed
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (recentlyViewedIds.length === 0) {
        setRecentlyViewedColleges([]);
        return;
      }
      try {
        const list = [];
        for (const id of recentlyViewedIds.slice(0, 3)) {
          const res = await fetch(`/api/colleges/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.college) list.push(data.college);
          }
        }
        setRecentlyViewedColleges(list);
      } catch (e) {
        console.error(e);
      }
    };
    if (user) fetchRecentlyViewed();
  }, [recentlyViewedIds, user]);

  // Load recommendations based on search/history
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        let exam = 'JEE Main';
        if (predictorHistory.length > 0) {
          exam = predictorHistory[0].exam;
        } else if (savedColleges.length > 0) {
          exam = savedColleges[0].exams?.[0] || 'JEE Main';
        }
        const res = await fetch(`/api/colleges?exams=${encodeURIComponent(exam)}&limit=3`);
        if (res.ok) {
          const data = await res.json();
          if (data.colleges) {
            setRecommendedColleges(data.colleges);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    if (user && (predictorHistory.length > 0 || savedColleges.length > 0)) {
      fetchRecommendations();
    } else if (user) {
      // Fallback: load best ROI options
      const fetchBestROI = async () => {
        try {
          const res = await fetch('/api/colleges?sortBy=roiScore&limit=3');
          if (res.ok) {
            const data = await res.json();
            if (data.colleges) setRecommendedColleges(data.colleges);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchBestROI();
    }
  }, [predictorHistory, savedColleges, user]);

  const handleUnsaveCollege = async (collegeId: string) => {
    const success = await toggleSaveCollege(collegeId);
    if (success) {
      setSavedColleges(prev => prev.filter(c => c.id !== collegeId));
    }
  };

  const handleDeleteComparison = async (id: string) => {
    try {
      const res = await fetch(`/api/saved-comparisons?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setComparisons(prev => prev.filter(c => c.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLaunchComparison = async (collegeIds: string[], comparisonName: string) => {
    try {
      const collegesToCompare = [];
      for (const id of collegeIds) {
        const res = await fetch(`/api/colleges/${id}`);
        const data = await res.json();
        if (data.college) {
          collegesToCompare.push(data.college);
        }
      }
      if (collegesToCompare.length > 0) {
        setComparisonColleges(collegesToCompare);
        try {
          localStorage.setItem('college_comparisons', JSON.stringify(collegesToCompare));
        } catch (e) {
          console.error('Failed to save comparisons to localStorage:', e);
        }
        router.push('/compare');
      } else {
        alert('Could not launch comparison. The selected colleges may no longer exist.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Compile and stream PDF Strategy Report
  const triggerPdfDownload = async () => {
    setIsGenerating(true);
    setGenStatus('Building report inputs...');
    try {
      let exam = 'JEE Main';
      let rank = 15000;
      let budget = 300000;
      let branch = 'Computer Science & Engineering';
      let state = 'Maharashtra';
      let category = 'General';
      let gender = 'Male';

      // Load parameters from planner profile or history
      try {
        const storedProfile = localStorage.getItem('planner_profile');
        if (storedProfile) {
          const p = JSON.parse(storedProfile);
          exam = p.exam || exam;
          rank = p.rank || rank;
          budget = p.budget || budget;
          branch = p.branch || branch;
          state = p.state || state;
          category = p.category || category;
          gender = p.gender || gender;
        } else if (predictorHistory.length > 0) {
          const run = predictorHistory[0];
          exam = run.exam || exam;
          rank = Number(run.rank) || rank;
          budget = Number(run.budget) || budget;
          branch = run.branch || branch;
          state = run.preferredState || state;
        }
      } catch (err) {}

      // Get planner columns
      let plannerColleges = { dream: [], target: [], safe: [] };
      try {
        const storedPlanner = localStorage.getItem('planner_colleges');
        if (storedPlanner) {
          plannerColleges = JSON.parse(storedPlanner);
        }
      } catch (err) {}

      // If planner is empty, seed it with saved colleges as targets
      if (plannerColleges.dream.length === 0 && plannerColleges.target.length === 0 && plannerColleges.safe.length === 0 && savedColleges.length > 0) {
        (plannerColleges as any).target = savedColleges.slice(0, 3);
      }

      // Map columns
      const mapCol = (c: any) => ({
        name: c.name,
        location: `${c.city || 'India'}, ${c.state || ''}`,
        fees: c.fees || 120000,
        averagePackage: c.averagePackage || 6.5,
        probability: c.probability || 75
      });

      // Find scholarships matching filters
      setGenStatus('Matching financial aid schemes...');
      const matchedSch = findMatchingScholarships({
        state,
        category,
        income: budget,
        gender
      }).slice(0, 3).map(s => ({
        name: s.name,
        eligibility: s.eligibility,
        benefits: s.benefits
      }));

      // Assemble career roadmap milestones
      const roadmapTemplate = ROADMAP_TEMPLATES['software-engineer'];
      const formatMilestones = (milestones: any[]) => milestones.map(m => `${m.title}: ${m.desc}`);
      
      const roadmapData = {
        course: branch,
        targetRole: roadmapTemplate.role,
        year1: formatMilestones(roadmapTemplate.years.year1),
        year2: formatMilestones(roadmapTemplate.years.year2),
        year3: formatMilestones(roadmapTemplate.years.year3),
        year4: formatMilestones(roadmapTemplate.years.year4)
      };

      const payload = {
        studentName: user ? user.name : 'Candidate Guest User',
        studentEmail: user ? user.email : 'guest.student@collegehub.in',
        academicProfile: {
          exam,
          rank: rank.toLocaleString('en-IN'),
          percentile: exam.toUpperCase().includes('JEE') ? (100 - (rank / 12000)).toFixed(2) : '95.5',
          budget: budget.toLocaleString('en-IN'),
          branch
        },
        planner: {
          dream: plannerColleges.dream.map(mapCol),
          target: plannerColleges.target.map(mapCol),
          safe: plannerColleges.safe.map(mapCol)
        },
        scholarships: matchedSch,
        counselorNotes: `Automated Strategy Snapshot: Evaluated for ${exam} rank ${rank}. Course specialization is targeted towards ${branch}. Pre-screened matching active scholarships are attached in report appendices.`,
        roadmap: roadmapData
      };

      setGenStatus('Compiling ReportLab PDF...');
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Backend failed to generate PDF.');
      }

      setGenStatus('Downloading file...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Student_College_Intelligence_Report.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error(e);
      alert('Failed to generate PDF Report: ' + e.message);
    } finally {
      setIsGenerating(false);
      setGenStatus('');
    }
  };

  if (loadingUser) {
    return (
      <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] flex items-center justify-center min-h-[60vh]">
        <div className="h-10 w-10 rounded-full border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Insights Calculations
  const avgPackage = savedColleges.length > 0
    ? parseFloat((savedColleges.reduce((acc, c) => acc + c.averagePackage, 0) / savedColleges.length).toFixed(1))
    : 0;

  const avgFees = savedColleges.length > 0
    ? Math.floor(savedColleges.reduce((acc, c) => acc + c.fees, 0) / savedColleges.length)
    : 0;

  const avgRoiScore = savedColleges.length > 0
    ? parseFloat((savedColleges.reduce((acc, c) => acc + (c.roiScore || 5), 0) / savedColleges.length).toFixed(1))
    : 0;

  const topRoiCollege = savedColleges.length > 0
    ? savedColleges.reduce((prev, current) => ((prev.roiScore || 0) > (current.roiScore || 0)) ? prev : current)
    : null;

  // Best Match Fit Score Heuristic
  const bestMatchFit = predictorHistory.length > 0 
    ? Math.floor(predictorHistory.reduce((acc, r) => acc + (r.confidenceScore || 85), 0) / predictorHistory.length)
    : 88;

  // State Counts
  const stateDistribution: { [key: string]: number } = {};
  savedColleges.forEach(c => {
    if (c.state) {
      stateDistribution[c.state] = (stateDistribution[c.state] || 0) + 1;
    }
  });

  // Calculate scholarship count based on default params
  const matchedScholarshipsCount = findMatchingScholarships({
    state: 'Maharashtra',
    category: 'General',
    income: 300000,
    gender: 'Male'
  }).length;

  return (
    <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] py-12 relative overflow-hidden">
      {/* Glow decorations */}
      <div className="absolute top-0 left-[10%] bg-glow-purple"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* User Greeting Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#151521] via-[#1b1b2d] to-[#0A0A0F] border border-[#2A2A40] p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5CF6]">Student Console</span>
              <h2 className="text-3xl font-extrabold mt-1">Hello, {user.name}!</h2>
              <p className="text-xs text-[#B0B0C0] mt-1 font-light">
                Analyze your saved target institutions, explore customized scholarships, and compile your AI career roadmaps.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-5 py-3 text-xs font-bold text-white hover:opacity-90 transition-all shadow hover:scale-[1.01] cursor-pointer"
            >
              Discover More Colleges
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Upgraded Glassmorphic KPI Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          
          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-5 flex items-center justify-between shadow-md hover:border-[#8B5CF6]/30 transition-all backdrop-blur-sm">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#B0B0C0]/65">Placement Average</span>
              <div className="mt-1.5 text-2xl font-extrabold text-[#8B5CF6]">{avgPackage} LPA</div>
              <p className="text-[9px] text-[#B0B0C0]/50 mt-0.5 font-light">Mean salary of bookmarks</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
              <Briefcase className="h-5 w-5" />
            </div>
          </div>
          
          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-5 flex items-center justify-between shadow-md hover:border-[#8B5CF6]/30 transition-all backdrop-blur-sm">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#B0B0C0]/65">Best Match Fit</span>
              <div className="mt-1.5 text-2xl font-extrabold text-[#F5F5F5]">{bestMatchFit}%</div>
              <p className="text-[9px] text-[#B0B0C0]/50 mt-0.5 font-light">Admission confidence coefficient</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-5 flex items-center justify-between shadow-md hover:border-[#A855F7]/30 transition-all backdrop-blur-sm">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#B0B0C0]/65">Aid Opportunities</span>
              <div className="mt-1.5 text-2xl font-extrabold text-[#A855F7]">{matchedScholarshipsCount} matched</div>
              <p className="text-[9px] text-[#B0B0C0]/50 mt-0.5 font-light">Active financial aid schemes</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-[#A855F7]/10 text-[#A855F7] flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
          </div>
          
          <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-5 flex items-center justify-between shadow-md hover:border-[#8B5CF6]/30 transition-all backdrop-blur-sm">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#B0B0C0]/65">Avg ROI Multiplier</span>
              <div className="mt-1.5 text-2xl font-extrabold text-[#10B981]">{avgRoiScore}x</div>
              <p className="text-[9px] text-[#B0B0C0]/50 mt-1 font-light">Placement vs fees value index</p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Quick Actions Control Center */}
        <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/30 p-5 mt-8 backdrop-blur-sm shadow-sm">
          <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#B0B0C0] mb-4 flex items-center gap-1.5">
            <Sliders className="h-4 w-4 text-[#8B5CF6]" />
            Quick Actions Control Center
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/college-predictor"
              className="flex items-center justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/50 hover:bg-[#151521] hover:border-[#8B5CF6]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Run Predictor</h4>
                  <p className="text-[9px] text-[#B0B0C0] font-light">Check admission cutoffs</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#B0B0C0] group-hover:text-white transition-colors" />
            </Link>

            <Link 
              href="/planner"
              className="flex items-center justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/50 hover:bg-[#151521] hover:border-[#8B5CF6]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                  <Sliders className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Admissions Planner</h4>
                  <p className="text-[9px] text-[#B0B0C0] font-light">Dream / Safe board advisor</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#B0B0C0] group-hover:text-white transition-colors" />
            </Link>

            <button 
              onClick={triggerPdfDownload}
              disabled={isGenerating}
              className="flex items-center justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/50 hover:bg-[#151521] hover:border-[#8B5CF6]/50 transition-all group text-left cursor-pointer w-full"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                  <Download className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">
                    {isGenerating ? 'Compiling...' : 'Download Report'}
                  </h4>
                  <p className="text-[9px] text-[#B0B0C0] font-light truncate max-w-[120px]">
                    {genStatus || 'PDF strategic summary'}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#B0B0C0] group-hover:text-white transition-colors" />
            </button>

            <Link 
              href="/chat-counselor"
              className="flex items-center justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/50 hover:bg-[#151521] hover:border-[#8B5CF6]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                  <MessageSquare className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Consult Counselor</h4>
                  <p className="text-[9px] text-[#B0B0C0] font-light">Chat recommendations</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-[#B0B0C0] group-hover:text-white transition-colors" />
            </Link>
          </div>
        </div>

        {/* 3-Column layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Left Columns (Tab switcher + listing) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Tabs switcher */}
            <div className="border-b border-[#2A2A40] flex space-x-6">
              {[
                { id: 'colleges', name: `Saved Colleges (${savedColleges.length})`, icon: Bookmark },
                { id: 'comparisons', name: `Saved Comparisons (${comparisons.length})`, icon: GitCompare },
                { id: 'history', name: `Predictor History (${predictorHistory.length})`, icon: Sliders }
              ].map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id as any)}
                    className={`flex items-center gap-2 border-b-2 pb-4 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                      activeTab === t.id
                        ? 'border-[#8B5CF6] text-[#8B5CF6]'
                        : 'border-transparent text-neutral-500 hover:text-neutral-300 dark:text-neutral-450 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {t.name}
                  </button>
                );
              })}
            </div>

            {/* Tab content panel */}
            <div className="mt-4">
              {activeTab === 'colleges' ? (
                savedColleges.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#2A2A40]/80 bg-[#151521]/30 p-12 text-center backdrop-blur-md animate-fade-in flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6] mb-4">
                      <Bookmark className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-[#F5F5F5]">Start building your dream college portfolio</h4>
                    <p className="mt-2 text-xs text-[#B0B0C0]/80 max-w-xs mx-auto font-light leading-relaxed">
                      Bookmark campuses on the Discover listing catalog to build a secure portfolio and analyze admissions paths.
                    </p>
                    <Link
                      href="/"
                      className="mt-6 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 text-white rounded-xl px-5 py-2.5 text-xs font-extrabold shadow-md shadow-purple-500/10 transition-all hover:scale-[1.01] active:scale-95"
                    >
                      Explore College Directory
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {savedColleges.map((college: any) => (
                      <div
                        key={college.id}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-[#2A2A40]/80 bg-[#151521]/50 shadow-sm hover:border-[#8B5CF6]/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 backdrop-blur-sm animate-fade-in hover-lift"
                      >
                        <div className="relative h-32 bg-[#0A0A0F] overflow-hidden">
                           <img 
                             src={getSafeBannerSrc(college)} 
                             onError={(e) => {
                               e.currentTarget.onerror = null;
                               e.currentTarget.src = getFallbackBannerUrl(college.name, college.exams);
                             }}
                             alt="" 
                             className="h-full w-full object-cover object-center opacity-70 transition-transform duration-500 group-hover:scale-105" 
                           />
                          <button
                            onClick={() => handleUnsaveCollege(college.id)}
                            className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#0A0A0F]/80 text-[#B0B0C0] hover:text-red-400 border border-[#2A2A40] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h4 className="font-bold text-[#F5F5F5] text-sm line-clamp-1 hover:text-[#8B5CF6] transition-colors">
                              <Link href={`/college/${college.id}`}>{college.name}</Link>
                            </h4>
                            <p className="text-[10px] text-[#B0B0C0] flex items-center gap-1 mt-1 font-light">
                              <MapPin className="h-3.5 w-3.5 text-[#8B5CF6]" />
                              {college.location}
                            </p>
                            
                            <div className="grid grid-cols-2 gap-4 border-t border-[#2A2A40]/40 pt-4 mt-4 text-xs">
                              <div>
                                <span className="text-[#B0B0C0]/50 block text-[9px] uppercase tracking-wider font-bold">Fees (Annual)</span>
                                <span className="font-bold text-[#F5F5F5]">
                                  ₹{college.fees.toLocaleString('en-IN')}
                                </span>
                              </div>
                              <div>
                                <span className="text-[#B0B0C0]/50 block text-[9px] uppercase tracking-wider font-bold">Avg Package</span>
                                <span className="font-bold text-[#F5F5F5]">
                                  {college.averagePackage} LPA
                                </span>
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/college/${college.id}`}
                            className="mt-5 w-full flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] py-2.5 text-xs font-bold text-white hover:opacity-90 transition-all shadow shadow-purple-500/5"
                          >
                            <Eye className="h-4 w-4" />
                            View College
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : activeTab === 'comparisons' ? (
                comparisons.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#2A2A40]/80 bg-[#151521]/30 p-12 text-center backdrop-blur-md animate-fade-in flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
                      <GitCompare className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-[#F5F5F5]">Create side-by-side college evaluations</h4>
                    <p className="mt-2 text-xs text-[#B0B0C0]/80 max-w-xs mx-auto leading-relaxed font-light">
                      Compare 2-3 institutions side-by-side across ROI scores, cutoffs, and verified placement benchmarks, then save them.
                    </p>
                    <Link
                      href="/compare"
                      className="mt-6 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 text-white rounded-xl px-5 py-2.5 text-xs font-extrabold shadow-md shadow-purple-500/10 transition-all hover:scale-[1.01] active:scale-95"
                    >
                      Launch Comparison Matrix
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {comparisons.map((comp: any) => (
                      <div
                        key={comp.id}
                        className="rounded-2xl border border-[#2A2A40] bg-[#151521]/50 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#8B5CF6]/40 backdrop-blur-sm hover-lift"
                      >
                        <div className="space-y-1">
                          <h4 className="font-extrabold text-[#F5F5F5] text-sm">{comp.name}</h4>
                          <p className="text-[10px] text-[#B0B0C0] font-light">
                            Saved on {new Date(comp.createdAt).toLocaleDateString()} &bull;{' '}
                            {comp.collegeIds.length} Colleges compared
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            onClick={() => handleLaunchComparison(comp.collegeIds, comp.name)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] px-4 py-2 text-xs font-bold border border-[#8B5CF6]/35 hover:bg-[#8B5CF6]/20 transition-all cursor-pointer hover:scale-[1.01]"
                          >
                            <GitCompare className="h-4 w-4" />
                            Run Comparison
                          </button>
                          <button
                            onClick={() => handleDeleteComparison(comp.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2A2A40] px-4 py-2 text-xs font-bold text-[#B0B0C0] hover:bg-[#151521]/30 hover:text-[#F5F5F5] transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4 text-[#B0B0C0]" />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                predictorHistory.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[#2A2A40]/80 bg-[#151521]/30 p-12 text-center backdrop-blur-md animate-fade-in flex flex-col items-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-4">
                      <Sliders className="h-6 w-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-[#F5F5F5]">Benchmark your scores against cutoff matrices</h4>
                    <p className="mt-2 text-xs text-[#B0B0C0]/80 max-w-xs mx-auto font-light leading-relaxed">
                      Run the Admissions Predictor wizard using your actual exam ranks to map target, stretch, and safe outcomes.
                    </p>
                    <Link
                      href="/college-predictor"
                      className="mt-6 inline-flex items-center gap-1.5 bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 text-white rounded-xl px-5 py-2.5 text-xs font-extrabold shadow-md shadow-purple-500/10 transition-all hover:scale-[1.01] active:scale-95"
                    >
                      Predict College Fits
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fade-in">
                    {predictorHistory.map((run: any) => (
                      <div
                        key={run.id}
                        className="rounded-2xl border border-[#2A2A40] bg-[#151521]/50 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-[#8B5CF6]/40 backdrop-blur-sm hover-lift"
                      >
                        <div>
                          <h4 className="font-extrabold text-[#F5F5F5] text-sm">
                            {run.exam} &bull; Rank/Percentile {run.rank}
                          </h4>
                          <p className="text-[10px] text-[#B0B0C0] mt-1 font-light leading-normal">
                            Branch: {run.branch} &bull; Budget: ₹{run.budget.toLocaleString('en-IN')}/yr &bull; Placements: {run.placementExpectation} LPA+
                          </p>
                          <span className="text-[9px] text-[#B0B0C0]/40 block mt-1.5 font-light">
                            Evaluated on {new Date(run.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            const searchStr = new URLSearchParams({
                              rerun: 'true',
                              exam: run.exam,
                              rank: String(run.rank),
                              budget: String(run.budget),
                              branch: run.branch,
                              type: run.collegeType || 'All',
                              state: run.preferredState || 'All',
                              city: run.preferredCity || '',
                              placement: String(run.placementExpectation || 0)
                            }).toString();
                            router.push(`/college-predictor?${searchStr}`);
                          }}
                          className="inline-flex items-center gap-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/35 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer hover:scale-[1.01]"
                        >
                          <History className="h-4 w-4" />
                          Rerun Predictor
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Saved College Insights Panel (Ad-hoc chart representation) */}
            {savedColleges.length > 0 && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-6 backdrop-blur-sm shadow-sm space-y-5 mt-8 animate-fade-in">
                <h3 className="text-xs uppercase font-extrabold tracking-widest text-[#B0B0C0] flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-[#8B5CF6]" />
                  Saved College Insights Panel
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1 text-xs">
                  {/* Fee vs Placement comparative breakdown */}
                  <div className="bg-[#0A0A0F]/45 p-4 rounded-xl border border-[#2A2A40]/45 space-y-3">
                    <h4 className="font-bold text-[#F5F5F5] uppercase text-[9px] tracking-wider text-[#B0B0C0]/65">Financial Breakdown</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#B0B0C0] font-light">Average Fees:</span>
                        <span className="font-bold text-white">₹{avgFees.toLocaleString('en-IN')}/yr</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#2A2A40] rounded-full overflow-hidden">
                        <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${Math.min(100, (avgFees / 400000) * 100)}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[#B0B0C0] font-light">Average Salary:</span>
                        <span className="font-bold text-emerald-400">{avgPackage} LPA</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#2A2A40] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, (avgPackage / 25) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* State breakdown */}
                  <div className="bg-[#0A0A0F]/45 p-4 rounded-xl border border-[#2A2A40]/45 space-y-3">
                    <h4 className="font-bold text-[#F5F5F5] uppercase text-[9px] tracking-wider text-[#B0B0C0]/65">Geographic Distribution</h4>
                    <div className="space-y-2">
                      {Object.keys(stateDistribution).length === 0 ? (
                        <p className="text-[10px] text-[#B0B0C0]/50 italic font-light pt-2">No regional distribution logged.</p>
                      ) : (
                        Object.entries(stateDistribution).slice(0, 3).map(([st, count]) => (
                          <div key={`geo-dist-${st}`} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-white truncate font-medium">{st}</span>
                              <span className="text-[#8B5CF6] font-bold">{count} campus{count > 1 ? 'es' : ''}</span>
                            </div>
                            <div className="h-1 w-full bg-[#2A2A40] rounded-full overflow-hidden">
                              <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${(count / savedColleges.length) * 100}%` }}></div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Recommendations & Recently Viewed */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* "Your Best Matches" Section */}
            <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-5 backdrop-blur-sm shadow-sm space-y-4 animate-fade-in">
              <h4 className="font-bold text-xs text-[#F5F5F5] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#8B5CF6] animate-pulse" />
                Your Best Matches
              </h4>
              
              <div className="space-y-3.5">
                {recommendedColleges.length === 0 ? (
                  <p className="text-[11px] text-[#B0B0C0]/60 italic font-light">Loading target matches...</p>
                ) : (
                  recommendedColleges.map((col: any) => {
                    // Fit reason calculations
                    let matchReason = "Fits Rank Metrics";
                    if (col.roiScore > 7.5) {
                      matchReason = "Outstanding ROI Match";
                    } else if (col.averagePackage > 12) {
                      matchReason = "Premium Placement campus";
                    } else if (col.scholarshipFriendly) {
                      matchReason = "Highly Scholarship Friendly";
                    }

                    return (
                      <div 
                        key={`match-col-${col.id}`}
                        onClick={() => router.push(`/college/${col.id}`)}
                        className="group p-3 rounded-xl border border-[#2A2A40]/40 bg-[#0A0A0F]/20 hover:border-[#8B5CF6]/40 hover:bg-[#151521]/40 transition-all cursor-pointer space-y-2.5"
                      >
                        <div className="flex gap-3">
                          <img 
                         src={getSafeLogoSrc(col)} 
                         onError={(e) => {
                           e.currentTarget.onerror = null;
                           e.currentTarget.src = getFallbackLogoUrl();
                         }}
                         alt="" 
                         className="h-9 w-9 rounded-lg object-cover object-center border border-[#2A2A40]" 
                       />
                          <div className="overflow-hidden flex-1">
                            <h5 className="font-bold text-[11px] text-[#F5F5F5] truncate group-hover:text-[#8B5CF6] transition-colors">{col.name}</h5>
                            <div className="flex justify-between items-center text-[9px] text-[#B0B0C0] mt-0.5 font-light">
                              <span>{col.city}</span>
                              <span className="font-bold text-[#8B5CF6]">{col.averagePackage} LPA avg</span>
                            </div>
                          </div>
                        </div>

                        {/* Match tag explanation */}
                        <div className="flex items-center gap-1 bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 rounded-lg px-2 py-0.5 text-[9px] text-[#8B5CF6] w-fit font-bold">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{matchReason}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Scholarship Recommendations Card */}
            <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-5 backdrop-blur-sm shadow-sm space-y-4 animate-fade-in">
              <h4 className="font-bold text-xs text-[#F5F5F5] uppercase tracking-wider flex items-center gap-1.5">
                <Award className="h-4 w-4 text-[#A855F7]" />
                Scholarship Matches
              </h4>
              
              <div className="space-y-3">
                {findMatchingScholarships({
                  state: 'Maharashtra',
                  category: 'General',
                  income: 300000,
                  gender: 'Male'
                }).slice(0, 2).map((sch) => (
                  <div 
                    key={`sch-rec-${sch.id}`}
                    onClick={() => router.push('/scholarships')}
                    className="group p-3 rounded-xl border border-[#2A2A40]/40 bg-[#0A0A0F]/20 hover:border-[#A855F7]/40 hover:bg-[#151521]/40 transition-all cursor-pointer space-y-1.5"
                  >
                    <h5 className="font-bold text-[10px] text-[#F5F5F5] truncate group-hover:text-[#A855F7] transition-colors">{sch.name}</h5>
                    <p className="text-[9px] text-[#B0B0C0] font-light leading-normal line-clamp-2">{sch.eligibility}</p>
                    <div className="text-[9px] text-emerald-400 font-bold mt-1 block">{sch.benefits}</div>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/scholarships"
                className="text-[10px] font-bold text-[#8B5CF6] hover:text-white transition-colors flex items-center gap-1 pt-1"
              >
                View all matching schemes
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Recently Viewed */}
            {recentlyViewedColleges.length > 0 && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-5 backdrop-blur-sm shadow-sm space-y-4 animate-fade-in">
                <h4 className="font-bold text-xs text-[#F5F5F5] uppercase tracking-wider flex items-center gap-1.5">
                  <History className="h-4 w-4 text-[#8B5CF6]" />
                  Recently Viewed
                </h4>
                <div className="space-y-3">
                  {recentlyViewedColleges.map((col: any) => (
                    <div 
                      key={`viewed-${col.id}`}
                      onClick={() => router.push(`/college/${col.id}`)}
                      className="group flex gap-3 p-2.5 rounded-xl border border-[#2A2A40]/40 bg-[#0A0A0F]/20 hover:border-[#8B5CF6]/30 hover:bg-[#151521]/40 transition-all cursor-pointer"
                    >
                      <img 
                        src={getSafeLogoSrc(col)} 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = getFallbackLogoUrl();
                        }}
                        alt="" 
                        className="h-9 w-9 rounded-lg object-cover object-center border border-[#2A2A40]" 
                      />
                      <div className="overflow-hidden flex-1">
                        <h5 className="font-bold text-[11px] text-[#F5F5F5] truncate group-hover:text-[#8B5CF6] transition-colors">{col.name}</h5>
                        <p className="text-[9px] text-[#B0B0C0]/50 mt-0.5 truncate font-light">{col.location}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
