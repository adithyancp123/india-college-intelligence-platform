'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp, College } from '@/context/AppContext';
import { 
  Plus, 
  Search, 
  Trash2, 
  Download, 
  Sliders, 
  Sparkles, 
  IndianRupee, 
  Briefcase, 
  Award, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  MapPin,
  TrendingUp,
  User,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';

// Mock/Template logic helper for scholarships matching and roadmap generation on the fly
import { findMatchingScholarships } from '@/lib/intelligence/scholarships';
import { ROADMAP_TEMPLATES } from '@/lib/intelligence/roadmaps';

export default function PlannerPage() {
  const router = useRouter();
  const { user, loadingUser } = useApp();

  // Planner lanes state
  const [plannerColleges, setPlannerColleges] = useState<{
    dream: College[];
    target: College[];
    safe: College[];
  }>({
    dream: [],
    target: [],
    safe: [],
  });

  // Profile tuning state
  const [profile, setProfile] = useState({
    exam: 'JEE Main',
    rank: 15000,
    budget: 300000,
    branch: 'Computer Science & Engineering',
    state: 'Maharashtra',
    category: 'General',
    gender: 'Male',
    targetRole: 'software-engineer'
  });

  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<College[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // PDF generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');

  // Dragging states
  const [draggedCollegeId, setDraggedCollegeId] = useState<string | null>(null);
  const [draggedSourceLane, setDraggedSourceLane] = useState<'dream' | 'target' | 'safe' | null>(null);

  // Load state on mount
  useEffect(() => {
    // 1. Load profile
    try {
      const storedProfile = localStorage.getItem('planner_profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      } else {
        // Fallback to check predictor history for seed data
        const predictorHistoryStr = localStorage.getItem('predictor_history');
        if (predictorHistoryStr) {
          const parsed = JSON.parse(predictorHistoryStr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const lastRun = parsed[0];
            setProfile(prev => ({
              ...prev,
              exam: lastRun.exam || 'JEE Main',
              rank: Number(lastRun.rank) || 15000,
              budget: Number(lastRun.budget) || 300000,
              branch: lastRun.branch || 'Computer Science & Engineering',
              state: lastRun.preferredState || 'All States'
            }));
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Load planner colleges
    try {
      const storedPlanner = localStorage.getItem('planner_colleges');
      if (storedPlanner) {
        setPlannerColleges(JSON.parse(storedPlanner));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save profile changes
  const saveProfile = (newProfile: typeof profile) => {
    setProfile(newProfile);
    try {
      localStorage.setItem('planner_profile', JSON.stringify(newProfile));
    } catch (e) {
      console.error(e);
    }
  };

  // Save planner colleges
  const savePlannerColleges = (newPlanner: typeof plannerColleges) => {
    setPlannerColleges(newPlanner);
    try {
      localStorage.setItem('planner_colleges', JSON.stringify(newPlanner));
    } catch (e) {
      console.error(e);
    }
  };

  // Handle outside click to close search dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search colleges from Cache API
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/colleges?search=${encodeURIComponent(searchQuery)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          if (data.colleges) {
            setSearchResults(data.colleges);
            setShowSearchResults(true);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Admission Probability Heuristic (NIRF rank + rating based)
  const calculateProbability = (college: College) => {
    const { exam, rank } = profile;
    const isPercentile = exam.toUpperCase() === 'CAT' || exam.toUpperCase() === 'MAT' || exam.toUpperCase() === 'XAT';
    
    if (isPercentile) {
      let targetPercentile = 85;
      if (college.nirfRank) {
        if (college.nirfRank < 10) targetPercentile = 98;
        else if (college.nirfRank < 30) targetPercentile = 95;
        else if (college.nirfRank < 55) targetPercentile = 90;
      } else {
        targetPercentile = 80 + Math.floor(college.rating * 2);
      }
      const diff = rank - targetPercentile;
      let prob = 50;
      if (diff >= 5) prob = 85 + Math.min(14, Math.floor(diff * 1.5));
      else if (diff >= 0) prob = 65 + Math.floor(diff * 4);
      else prob = Math.max(10, 45 + Math.floor(diff * 6));
      
      return Math.min(99, Math.max(10, prob));
    } else {
      let baseCutoff = 35000;
      if (college.nirfRank) {
        if (college.nirfRank < 10) baseCutoff = 4000;
        else if (college.nirfRank < 25) baseCutoff = 9000;
        else if (college.nirfRank < 50) baseCutoff = 17000;
        else if (college.nirfRank < 100) baseCutoff = 28000;
      } else {
        baseCutoff = Math.max(5000, 75000 - Math.floor(college.rating * 14000));
      }
      
      if (college.ownership.toLowerCase() === 'government') {
        baseCutoff = Math.floor(baseCutoff * 0.7);
      }

      const ratio = rank / baseCutoff;
      let prob = 50;
      if (ratio <= 0.85) {
        prob = 85 + Math.min(14, Math.floor((1 - ratio) * 25));
      } else if (ratio <= 1.25) {
        prob = 55 + Math.floor((1.25 - ratio) * 75);
      } else {
        prob = Math.max(10, 40 - Math.floor((ratio - 1.25) * 12));
      }
      
      return Math.min(99, Math.max(10, prob));
    }
  };

  // Drag and Drop Event Handlers (HTML5 standard)
  const handleDragStart = (e: React.DragEvent, id: string, sourceLane: 'dream' | 'target' | 'safe') => {
    setDraggedCollegeId(id);
    setDraggedSourceLane(sourceLane);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetLane: 'dream' | 'target' | 'safe') => {
    e.preventDefault();
    if (!draggedCollegeId || !draggedSourceLane) return;
    if (draggedSourceLane === targetLane) return;

    // Find the college to move
    const collegeToMove = plannerColleges[draggedSourceLane].find(c => c.id === draggedCollegeId);
    if (!collegeToMove) return;

    // Create updated columns
    const updatedSource = plannerColleges[draggedSourceLane].filter(c => c.id !== draggedCollegeId);
    
    // Check for duplicates in target column
    if (plannerColleges[targetLane].some(c => c.id === draggedCollegeId)) {
      setDraggedCollegeId(null);
      setDraggedSourceLane(null);
      return;
    }

    const updatedTarget = [...plannerColleges[targetLane], collegeToMove];

    const newPlanner = {
      ...plannerColleges,
      [draggedSourceLane]: updatedSource,
      [targetLane]: updatedTarget
    };

    savePlannerColleges(newPlanner);
    setDraggedCollegeId(null);
    setDraggedSourceLane(null);
  };

  const removeCollege = (id: string, lane: 'dream' | 'target' | 'safe') => {
    const updated = plannerColleges[lane].filter(c => c.id !== id);
    savePlannerColleges({
      ...plannerColleges,
      [lane]: updated
    });
  };

  const addCollegeToLane = (college: College, targetLane: 'dream' | 'target' | 'safe') => {
    // Check if college is already in any column
    const isAdded = 
      plannerColleges.dream.some(c => c.id === college.id) ||
      plannerColleges.target.some(c => c.id === college.id) ||
      plannerColleges.safe.some(c => c.id === college.id);

    if (isAdded) {
      alert('This college is already mapped in your planning board.');
      return;
    }

    const newPlanner = {
      ...plannerColleges,
      [targetLane]: [...plannerColleges[targetLane], college]
    };
    savePlannerColleges(newPlanner);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  // Portfolio Statistics & Warnings
  const allPlannerColleges = [...plannerColleges.dream, ...plannerColleges.target, ...plannerColleges.safe];
  const totalFeesVal = allPlannerColleges.reduce((acc, c) => acc + c.fees, 0);

  const healthChecklist = {
    hasDream: plannerColleges.dream.length > 0,
    hasTarget: plannerColleges.target.length > 0,
    hasSafe: plannerColleges.safe.length > 0,
    underBudget: allPlannerColleges.every(c => c.fees <= profile.budget),
    balancedRatios: plannerColleges.safe.length >= 1 && plannerColleges.target.length >= 1
  };

  const getPortfolioAdvice = () => {
    if (allPlannerColleges.length === 0) {
      return "Your planning board is empty. Search for colleges and sort them into columns to begin analysis.";
    }
    if (!healthChecklist.hasSafe) {
      return "Critical Warning: You have no 'Safe' colleges. If board cutoffs tighten, you run a high risk of zero college allotments. Add at least 1 safe option.";
    }
    if (!healthChecklist.hasTarget) {
      return "Advisory: No middle-probability 'Target' colleges mapped. Add 1-2 targets matching your rank closely.";
    }
    if (!healthChecklist.underBudget) {
      return "Cost Warning: Some colleges in your planner exceed your annual target budget constraint of ₹" + profile.budget.toLocaleString('en-IN') + ". Review fee structures.";
    }
    return "Portfolio Healthy: Your portfolio is well-balanced with secure backups, reasonable stretch targets, and aligns with budget parameters!";
  };

  // Compile PDF via Next.js backend bridge
  const downloadReport = async () => {
    setIsGenerating(true);
    setGenStatus('Gathering data fields...');
    try {
      // 1. Calculate probabilities for each college in lanes
      const mapCol = (c: College) => ({
        name: c.name,
        location: `${c.city}, ${c.state}`,
        fees: c.fees,
        averagePackage: c.averagePackage,
        probability: calculateProbability(c)
      });

      // 2. Fetch scholarships matching filters
      setGenStatus('Matching financial aid scholarships...');
      const matchedSch = findMatchingScholarships({
        state: profile.state,
        category: profile.category,
        income: profile.budget,
        gender: profile.gender
      }).slice(0, 3).map(s => ({
        name: s.name,
        eligibility: s.eligibility,
        benefits: s.benefits
      }));

      // 3. Assemble career roadmap year milestones
      setGenStatus('Mapping AI career milestones...');
      const roadmapTemplate = ROADMAP_TEMPLATES[profile.targetRole] || ROADMAP_TEMPLATES['software-engineer'];
      const formatMilestones = (milestones: any[]) => milestones.map(m => `${m.title}: ${m.desc}`);
      
      const roadmapData = {
        course: profile.branch,
        targetRole: roadmapTemplate.role,
        year1: formatMilestones(roadmapTemplate.years.year1),
        year2: formatMilestones(roadmapTemplate.years.year2),
        year3: formatMilestones(roadmapTemplate.years.year3),
        year4: formatMilestones(roadmapTemplate.years.year4)
      };

      // 4. Advisor/Counselor notes summarizing health
      const advice = getPortfolioAdvice();

      const payload = {
        studentName: user ? user.name : 'Candidate Guest User',
        studentEmail: user ? user.email : 'guest.student@collegehub.in',
        academicProfile: {
          exam: profile.exam,
          rank: profile.rank.toLocaleString('en-IN'),
          percentile: profile.exam.toUpperCase().includes('JEE') ? (100 - (profile.rank / 12000)).toFixed(2) : '94.5',
          budget: profile.budget.toLocaleString('en-IN'),
          branch: profile.branch
        },
        planner: {
          dream: plannerColleges.dream.map(mapCol),
          target: plannerColleges.target.map(mapCol),
          safe: plannerColleges.safe.map(mapCol)
        },
        scholarships: matchedSch,
        counselorNotes: `Portfolio Analysis: ${advice} Academic Target Course: ${profile.branch}. Priority Career Target: ${roadmapTemplate.role}. Target annual budget ceiling is set to ₹${profile.budget.toLocaleString('en-IN')}.`,
        roadmap: roadmapData
      };

      setGenStatus('Spawning Python ReportLab engine...');
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server bridge failed to generate PDF.');
      }

      setGenStatus('Streaming PDF download...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Student_College_Intelligence_Report_${profile.exam}_${profile.rank}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setGenStatus('Completed!');
    } catch (e: any) {
      console.error(e);
      alert(`Report compilation failed: ${e.message}`);
    } finally {
      setIsGenerating(false);
      setGenStatus('');
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] py-12 relative overflow-hidden min-h-screen">
      {/* Background decorations */}
      <div className="absolute top-0 left-[20%] bg-glow-purple"></div>
      <div className="absolute bottom-0 right-[10%] bg-glow-purple" style={{ opacity: 0.3 }}></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Title Header Card */}
        <div className="rounded-2xl bg-gradient-to-br from-[#151521] via-[#1b1b2d] to-[#0A0A0F] border border-[#2A2A40] p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5CF6] flex items-center gap-1.5">
                <Sliders className="h-4 w-4" />
                Admissions Strategy Console
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Dream / Safe / Reach Planner
              </h1>
              <p className="text-sm text-[#B0B0C0] max-w-2xl font-light leading-relaxed">
                Build your college admission portfolio. Drag and drop colleges between lanes to align your rank cutoff probability, manage fee budgets, and download your comprehensive strategy PDF.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3 items-center">
              <button
                onClick={() => setShowProfileEditor(!showProfileEditor)}
                className="inline-flex items-center gap-2 rounded-xl bg-[#151521] border border-[#2A2A40] px-4.5 py-3 text-xs font-bold text-[#F5F5F5] hover:bg-[#1a1a2e] hover:border-[#8B5CF6]/50 transition-all cursor-pointer"
              >
                <User className="h-4 w-4 text-[#8B5CF6]" />
                {showProfileEditor ? 'Hide Stats Profile' : 'Tune Stats Profile'}
              </button>
              
              <button
                onClick={downloadReport}
                disabled={isGenerating || allPlannerColleges.length === 0}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-xs font-bold text-white shadow-lg transition-all cursor-pointer hover:scale-[1.01] ${
                  allPlannerColleges.length === 0
                    ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                    : 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 shadow-purple-500/20'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    <span>{genStatus || 'Processing...'}</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download Strategic PDF</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Stats overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 border-t border-[#2A2A40]/55 pt-6 text-xs">
            <div className="bg-[#0A0A0F]/30 p-3 rounded-xl border border-[#2A2A40]/30">
              <span className="text-[#B0B0C0]/50 block uppercase tracking-wider font-bold text-[9px]">Exam Target</span>
              <span className="font-extrabold text-[#F5F5F5] text-sm mt-0.5 block">{profile.exam}</span>
            </div>
            <div className="bg-[#0A0A0F]/30 p-3 rounded-xl border border-[#2A2A40]/30">
              <span className="text-[#B0B0C0]/50 block uppercase tracking-wider font-bold text-[9px]">Exam Score/Rank</span>
              <span className="font-extrabold text-[#F5F5F5] text-sm mt-0.5 block">{profile.rank.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-[#0A0A0F]/30 p-3 rounded-xl border border-[#2A2A40]/30">
              <span className="text-[#B0B0C0]/50 block uppercase tracking-wider font-bold text-[9px]">Annual Fee Budget</span>
              <span className="font-extrabold text-[#8B5CF6] text-sm mt-0.5 block">₹{profile.budget.toLocaleString('en-IN')}</span>
            </div>
            <div className="bg-[#0A0A0F]/30 p-3 rounded-xl border border-[#2A2A40]/30">
              <span className="text-[#B0B0C0]/50 block uppercase tracking-wider font-bold text-[9px]">Target Specialty</span>
              <span className="font-extrabold text-[#A855F7] text-sm mt-0.5 block truncate max-w-[150px]">{profile.branch}</span>
            </div>
          </div>
        </div>

        {/* Profile Settings Drawer (Toggled) */}
        {showProfileEditor && (
          <div className="mt-6 rounded-2xl border border-[#2A2A40] bg-[#151521]/60 p-6 backdrop-blur-md shadow-xl animate-fade-in space-y-6">
            <div className="flex items-center gap-2 border-b border-[#2A2A40]/60 pb-3">
              <Sliders className="h-5 w-5 text-[#8B5CF6]" />
              <h3 className="font-bold text-base text-white">Academic Profile Parameters</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">Entrance Exam</label>
                <select 
                  value={profile.exam}
                  onChange={(e) => saveProfile({ ...profile, exam: e.target.value })}
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                >
                  <option value="JEE Main">JEE Main (Rank-based)</option>
                  <option value="JEE Advanced">JEE Advanced (Rank-based)</option>
                  <option value="MHT CET">MHT CET (Rank-based)</option>
                  <option value="GATE">GATE (Score-based)</option>
                  <option value="CAT">CAT (Percentile-based)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">
                  {profile.exam.toUpperCase().includes('CAT') || profile.exam.toUpperCase().includes('MAT') ? 'Percentile Value' : 'Your Rank'}
                </label>
                <input 
                  type="number"
                  value={profile.rank}
                  onChange={(e) => saveProfile({ ...profile, rank: Math.max(1, Number(e.target.value)) })}
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">Annual Budget Cap (₹)</label>
                <input 
                  type="number"
                  step="25000"
                  value={profile.budget}
                  onChange={(e) => saveProfile({ ...profile, budget: Math.max(1, Number(e.target.value)) })}
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">Admissions Branch</label>
                <input 
                  type="text"
                  value={profile.branch}
                  onChange={(e) => saveProfile({ ...profile, branch: e.target.value })}
                  placeholder="e.g. Computer Science"
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 pt-1">
              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">Domicile State</label>
                <input 
                  type="text"
                  value={profile.state}
                  onChange={(e) => saveProfile({ ...profile, state: e.target.value })}
                  placeholder="e.g. Maharashtra"
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">Category</label>
                <select 
                  value={profile.category}
                  onChange={(e) => saveProfile({ ...profile, category: e.target.value })}
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                >
                  <option value="General">General</option>
                  <option value="EWS">EWS</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">Gender</label>
                <select 
                  value={profile.gender}
                  onChange={(e) => saveProfile({ ...profile, gender: e.target.value })}
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0] mb-1.5">Target Career Goal</label>
                <select 
                  value={profile.targetRole}
                  onChange={(e) => saveProfile({ ...profile, targetRole: e.target.value })}
                  className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] p-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] transition-colors"
                >
                  <option value="software-engineer">Software Engineer</option>
                  <option value="data-scientist">Data Scientist</option>
                  <option value="product-manager">Product Manager</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowProfileEditor(false)}
                className="rounded-lg bg-[#8B5CF6] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#7c4ee4] transition-colors cursor-pointer"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        )}

        {/* Advisor Health Warnings & Search Box row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Health Box */}
          <div className="lg:col-span-2 rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-5 backdrop-blur-sm shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-xs uppercase text-[#B0B0C0]/85 tracking-widest flex items-center gap-1.5 mb-2.5">
                <CheckCircle2 className={`h-4 w-4 ${allPlannerColleges.length === 0 ? 'text-[#B0B0C0]/50' : healthChecklist.hasSafe && healthChecklist.hasTarget && healthChecklist.underBudget ? 'text-emerald-500' : 'text-amber-500'}`} />
                Portfolio Health Tracker
              </h3>
              <p className="text-xs text-[#B0B0C0] leading-relaxed font-light">
                {getPortfolioAdvice()}
              </p>
            </div>

            {allPlannerColleges.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-bold">
                <div className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${healthChecklist.hasDream ? 'bg-emerald-500' : 'bg-neutral-600'}`}></span>
                  <span className="text-[#B0B0C0]">Dream Option</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${healthChecklist.hasTarget ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="text-[#B0B0C0]">Target Option</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${healthChecklist.hasSafe ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                  <span className="text-[#B0B0C0]">Safe Backup</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`h-2.5 w-2.5 rounded-full ${healthChecklist.underBudget ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                  <span className="text-[#B0B0C0]">Budget Check (Max {profile.budget / 100000}L)</span>
                </div>
              </div>
            )}
          </div>

          {/* College Search Box */}
          <div ref={searchContainerRef} className="lg:col-span-1 rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-5 backdrop-blur-sm shadow-sm relative flex flex-col justify-center">
            <label className="block text-[10px] uppercase font-bold tracking-widest text-[#B0B0C0] mb-2">Query Normalized College Directory</label>
            <div className="relative">
              <input 
                type="text"
                placeholder="Search colleges in India..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl bg-[#0A0A0F]/80 border border-[#2A2A40] pl-10 pr-4 py-3 text-xs font-semibold text-white focus:outline-none focus:border-[#8B5CF6] focus:shadow-purple-500/5 transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#B0B0C0]" />
              
              {isSearching && (
                <div className="absolute right-3.5 top-3.5 h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
              )}
            </div>

            {/* Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-[90%] left-0 right-0 z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-[#2A2A40] bg-[#151521] p-2 shadow-2xl backdrop-blur-lg">
                {searchResults.map((col) => {
                  const probObj = calculateProbability(col);
                  return (
                    <div 
                      key={`search-res-${col.id}`}
                      className="flex items-center justify-between p-2.5 rounded-lg hover:bg-[#0A0A0F]/45 transition-colors group"
                    >
                      <div className="overflow-hidden pr-2 flex-1">
                        <h4 className="font-bold text-[11px] text-white truncate">{col.name}</h4>
                        <p className="text-[9px] text-[#B0B0C0] truncate mt-0.5 flex items-center gap-1 font-light">
                          <MapPin className="h-3 w-3 text-[#8B5CF6]" />
                          {col.city}, {col.state}
                        </p>
                      </div>
                      
                      {/* Drop buttons */}
                      <div className="flex gap-1">
                        <button
                          onClick={() => addCollegeToLane(col, 'dream')}
                          title="Add to Dream Lane"
                          className="bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/30 rounded px-1.5 py-1 text-[9px] font-bold text-[#EF4444] transition-colors cursor-pointer"
                        >
                          + Dream
                        </button>
                        <button
                          onClick={() => addCollegeToLane(col, 'target')}
                          title="Add to Target Lane"
                          className="bg-[#F59E0B]/10 hover:bg-[#F59E0B]/20 border border-[#F59E0B]/30 rounded px-1.5 py-1 text-[9px] font-bold text-[#F59E0B] transition-colors cursor-pointer"
                        >
                          + Target
                        </button>
                        <button
                          onClick={() => addCollegeToLane(col, 'safe')}
                          title="Add to Safe Lane"
                          className="bg-[#10B981]/10 hover:bg-[#10B981]/20 border border-[#10B981]/30 rounded px-1.5 py-1 text-[9px] font-bold text-[#10B981] transition-colors cursor-pointer"
                        >
                          + Safe
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {showSearchResults && searchResults.length === 0 && (
              <div className="absolute top-[90%] left-0 right-0 z-50 mt-2 rounded-xl border border-[#2A2A40] bg-[#151521] p-4 text-center text-xs text-[#B0B0C0] font-light shadow-2xl">
                No matching colleges found. Try a different term.
              </div>
            )}
          </div>
        </div>

        {/* Kanban Board Lanes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          {/* DREAM LANE */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'dream')}
            className="rounded-2xl border border-[#2A2A40] bg-[#151521]/20 p-5 flex flex-col min-h-[50vh] transition-all hover:bg-[#151521]/30 hover:border-[#EF4444]/30"
          >
            <div className="flex items-center justify-between border-b border-[#2A2A40] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#EF4444] shadow-md shadow-red-500/30"></span>
                <h3 className="font-extrabold text-sm text-[#F5F5F5] uppercase tracking-wide">Dream</h3>
              </div>
              <span className="text-[10px] font-bold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25 rounded-lg px-2.5 py-0.5">
                {plannerColleges.dream.length} Colleges
              </span>
            </div>

            {/* Lane description */}
            <p className="text-[10px] text-[#B0B0C0]/70 mb-4 font-light leading-relaxed">
              Reach targets (10% - 40% admission probability). Highly selective campuses.
            </p>

            {/* Card stack */}
            <div className="space-y-4 flex-1">
              {plannerColleges.dream.length === 0 ? (
                <div className="h-full border border-dashed border-[#2A2A40]/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-[#B0B0C0]/40 text-xs font-light">
                  Drag colleges here or add from search
                </div>
              ) : (
                plannerColleges.dream.map((college) => {
                  const prob = calculateProbability(college);
                  return (
                    <div 
                      key={`dream-col-${college.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, college.id, 'dream')}
                      className="group p-4 rounded-xl border border-[#2A2A40] bg-[#151521]/70 hover:border-[#EF4444]/40 hover:bg-[#1a1a2e]/80 transition-all cursor-grab active:cursor-grabbing hover-lift shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="overflow-hidden flex-1">
                          <h4 className="font-bold text-xs text-white truncate group-hover:text-[#EF4444] transition-colors">{college.name}</h4>
                          <span className="text-[9px] text-[#B0B0C0] truncate block mt-0.5 font-light">{college.location}</span>
                        </div>
                        <button
                          onClick={() => removeCollege(college.id, 'dream')}
                          className="text-[#B0B0C0] hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#2A2A40]/40 text-[10px]">
                        <div>
                          <span className="text-[#B0B0C0]/50 block font-bold text-[8px] uppercase tracking-wider">Annual Fees</span>
                          <span className="font-bold text-white">₹{college.fees.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[#B0B0C0]/50 block font-bold text-[8px] uppercase tracking-wider">Avg Placement</span>
                          <span className="font-bold text-white">{college.averagePackage} LPA</span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-[#2A2A40]/40 flex justify-between items-center text-[10px]">
                        <span className="text-[#B0B0C0]/50 font-bold uppercase text-[8px] tracking-wider">Fit Probability</span>
                        <span className="font-extrabold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/25 px-2 py-0.5 rounded-md">
                          {prob}% Chance
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* TARGET LANE */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'target')}
            className="rounded-2xl border border-[#2A2A40] bg-[#151521]/20 p-5 flex flex-col min-h-[50vh] transition-all hover:bg-[#151521]/30 hover:border-[#F59E0B]/30"
          >
            <div className="flex items-center justify-between border-b border-[#2A2A40] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#F59E0B] shadow-md shadow-amber-500/30"></span>
                <h3 className="font-extrabold text-sm text-[#F5F5F5] uppercase tracking-wide">Target</h3>
              </div>
              <span className="text-[10px] font-bold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25 rounded-lg px-2.5 py-0.5">
                {plannerColleges.target.length} Colleges
              </span>
            </div>

            {/* Lane description */}
            <p className="text-[10px] text-[#B0B0C0]/70 mb-4 font-light leading-relaxed">
              Match targets (45% - 75% admission probability). Good fit scenarios.
            </p>

            {/* Card stack */}
            <div className="space-y-4 flex-1">
              {plannerColleges.target.length === 0 ? (
                <div className="h-full border border-dashed border-[#2A2A40]/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-[#B0B0C0]/40 text-xs font-light">
                  Drag colleges here or add from search
                </div>
              ) : (
                plannerColleges.target.map((college) => {
                  const prob = calculateProbability(college);
                  return (
                    <div 
                      key={`target-col-${college.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, college.id, 'target')}
                      className="group p-4 rounded-xl border border-[#2A2A40] bg-[#151521]/70 hover:border-[#F59E0B]/40 hover:bg-[#1a1a2e]/80 transition-all cursor-grab active:cursor-grabbing hover-lift shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="overflow-hidden flex-1">
                          <h4 className="font-bold text-xs text-white truncate group-hover:text-[#F59E0B] transition-colors">{college.name}</h4>
                          <span className="text-[9px] text-[#B0B0C0] truncate block mt-0.5 font-light">{college.location}</span>
                        </div>
                        <button
                          onClick={() => removeCollege(college.id, 'target')}
                          className="text-[#B0B0C0] hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#2A2A40]/40 text-[10px]">
                        <div>
                          <span className="text-[#B0B0C0]/50 block font-bold text-[8px] uppercase tracking-wider">Annual Fees</span>
                          <span className="font-bold text-white">₹{college.fees.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[#B0B0C0]/50 block font-bold text-[8px] uppercase tracking-wider">Avg Placement</span>
                          <span className="font-bold text-white">{college.averagePackage} LPA</span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-[#2A2A40]/40 flex justify-between items-center text-[10px]">
                        <span className="text-[#B0B0C0]/50 font-bold uppercase text-[8px] tracking-wider">Fit Probability</span>
                        <span className="font-extrabold text-[#F59E0B] bg-[#F59E0B]/10 border border-[#F59E0B]/25 px-2 py-0.5 rounded-md">
                          {prob}% Chance
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SAFE LANE */}
          <div 
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'safe')}
            className="rounded-2xl border border-[#2A2A40] bg-[#151521]/20 p-5 flex flex-col min-h-[50vh] transition-all hover:bg-[#151521]/30 hover:border-[#10B981]/30"
          >
            <div className="flex items-center justify-between border-b border-[#2A2A40] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#10B981] shadow-md shadow-emerald-500/30"></span>
                <h3 className="font-extrabold text-sm text-[#F5F5F5] uppercase tracking-wide">Safe</h3>
              </div>
              <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25 rounded-lg px-2.5 py-0.5">
                {plannerColleges.safe.length} Colleges
              </span>
            </div>

            {/* Lane description */}
            <p className="text-[10px] text-[#B0B0C0]/70 mb-4 font-light leading-relaxed">
              Backup safeguards (80% - 99% admission probability). Highly secure choices.
            </p>

            {/* Card stack */}
            <div className="space-y-4 flex-1">
              {plannerColleges.safe.length === 0 ? (
                <div className="h-full border border-dashed border-[#2A2A40]/50 rounded-2xl flex flex-col items-center justify-center p-8 text-center text-[#B0B0C0]/40 text-xs font-light">
                  Drag colleges here or add from search
                </div>
              ) : (
                plannerColleges.safe.map((college) => {
                  const prob = calculateProbability(college);
                  return (
                    <div 
                      key={`safe-col-${college.id}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, college.id, 'safe')}
                      className="group p-4 rounded-xl border border-[#2A2A40] bg-[#151521]/70 hover:border-[#10B981]/40 hover:bg-[#1a1a2e]/80 transition-all cursor-grab active:cursor-grabbing hover-lift shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="overflow-hidden flex-1">
                          <h4 className="font-bold text-xs text-white truncate group-hover:text-[#10B981] transition-colors">{college.name}</h4>
                          <span className="text-[9px] text-[#B0B0C0] truncate block mt-0.5 font-light">{college.location}</span>
                        </div>
                        <button
                          onClick={() => removeCollege(college.id, 'safe')}
                          className="text-[#B0B0C0] hover:text-red-400 p-0.5 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#2A2A40]/40 text-[10px]">
                        <div>
                          <span className="text-[#B0B0C0]/50 block font-bold text-[8px] uppercase tracking-wider">Annual Fees</span>
                          <span className="font-bold text-white">₹{college.fees.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="text-[#B0B0C0]/50 block font-bold text-[8px] uppercase tracking-wider">Avg Placement</span>
                          <span className="font-bold text-white">{college.averagePackage} LPA</span>
                        </div>
                      </div>

                      <div className="mt-3.5 pt-2.5 border-t border-[#2A2A40]/40 flex justify-between items-center text-[10px]">
                        <span className="text-[#B0B0C0]/50 font-bold uppercase text-[8px] tracking-wider">Fit Probability</span>
                        <span className="font-extrabold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/25 px-2 py-0.5 rounded-md">
                          {prob}% Chance
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
