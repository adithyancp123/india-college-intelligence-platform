'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  getSafeLogoSrc, 
  getSafeBannerSrc, 
  getFallbackLogoUrl, 
  getFallbackBannerUrl 
} from '@/lib/image-mapper';
import { 
  Search, 
  MapPin, 
  IndianRupee, 
  Star, 
  GitCompare, 
  Bookmark, 
  SlidersHorizontal, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Briefcase, 
  GraduationCap, 
  Sparkles, 
  TrendingUp, 
  History, 
  Trash2, 
  Command, 
  FileText, 
  Check, 
  MessageSquare, 
  Award, 
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Database,
  SearchCode,
  Gauge
} from 'lucide-react';

export default function DiscoverPage() {
  const router = useRouter();
  const { 
    user,
    addToComparison, 
    comparisonColleges, 
    toggleSaveCollege, 
    savedCollegeIds, 
    recentlyViewedIds, 
    addRecentlyViewed, 
    savedSearches, 
    saveSearch, 
    deleteSavedSearch 
  } = useApp();

  // State for colleges and metadata
  const [colleges, setColleges] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Advanced filters
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [ownership, setOwnership] = useState('all');
  const [feeRange, setFeeRange] = useState('all');
  const [minRating, setMinRating] = useState(0);
  const [minPlacementRate, setMinPlacementRate] = useState(0);
  const [minPackage, setMinPackage] = useState(0);
  const [nirfRankMax, setNirfRankMax] = useState('all');
  const [accreditation, setAccreditation] = useState('');
  const [course, setCourse] = useState('');
  const [selectedExams, setSelectedExams] = useState<string[]>([]);
  const [scholarshipFriendly, setScholarshipFriendly] = useState(false);
  const [trendingOnly, setTrendingOnly] = useState(false);
  const [roiScoreMin, setRoiScoreMin] = useState(0);

  const [sortBy, setSortBy] = useState<'rating' | 'fees' | 'averagePackage' | 'placementRate' | 'collegeIntelligenceScore' | 'roiScore'>('collegeIntelligenceScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // Trending & Recently Viewed Details
  const [trendingColleges, setTrendingColleges] = useState<any[]>([]);
  const [recentlyViewedColleges, setRecentlyViewedColleges] = useState<any[]>([]);
  const [isSavingSearch, setIsSavingSearch] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Memoized page numbers sliding window for India College catalog
  const pageNumbers = React.useMemo(() => {
    const current = page;
    const total = pages;
    const list: (number | string)[] = [];
    
    if (total <= 7) {
      for (let i = 1; i <= total; i++) {
        list.push(i);
      }
    } else {
      list.push(1);
      
      let start = Math.max(2, current - 1);
      let end = Math.min(total - 1, current + 1);
      
      if (current <= 3) {
        end = 4;
      } else if (current >= total - 2) {
        start = total - 3;
      }
      
      if (start > 2) {
        list.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        list.push(i);
      }
      
      if (end < total - 1) {
        list.push('...');
      }
      
      list.push(total);
    }
    return list;
  }, [page, pages]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Fetch colleges
  const fetchColleges = async () => {
    setLoading(true);
    try {
      let minFees = '';
      let maxFees = '';
      if (feeRange === 'under-2') {
        minFees = '0';
        maxFees = '200000';
      } else if (feeRange === '2-5') {
        minFees = '200000';
        maxFees = '500000';
      } else if (feeRange === 'over-5') {
        minFees = '500000';
        maxFees = '20000000';
      }

      const params = new URLSearchParams({
        search: debouncedSearch,
        state,
        city,
        ownership,
        minFees: minFees || '0',
        maxFees: maxFees || '20000000',
        minRating: minRating.toString(),
        minPlacementRate: minPlacementRate.toString(),
        minPackage: minPackage.toString(),
        roiScoreMin: roiScoreMin.toString(),
        scholarshipFriendly: scholarshipFriendly ? 'true' : 'false',
        trending: trendingOnly ? 'true' : 'false',
        sortBy,
        sortOrder,
        page: page.toString(),
        limit: '6',
      });

      if (nirfRankMax !== 'all') {
        params.append('nirfRankMax', nirfRankMax);
      }
      if (accreditation) {
        params.append('accreditation', accreditation);
      }
      if (course) {
        params.append('course', course);
      }
      if (selectedExams.length > 0) {
        params.append('exams', selectedExams.join(','));
      }

      const res = await fetch(`/api/colleges?${params.toString()}`);
      const data = await res.json();
      if (data.colleges) {
        setColleges(data.colleges);
        setTotal(data.total);
        setPages(data.pages);
      }
    } catch (e) {
      console.error('Error fetching colleges:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [
    debouncedSearch,
    state,
    city,
    ownership,
    feeRange,
    minRating,
    minPlacementRate,
    minPackage,
    nirfRankMax,
    accreditation,
    course,
    selectedExams,
    scholarshipFriendly,
    trendingOnly,
    roiScoreMin,
    sortBy,
    sortOrder,
    page
  ]);

  // Fetch Trending colleges
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch('/api/colleges?trending=true&limit=4');
        if (res.ok) {
          const data = await res.json();
          if (data.colleges) {
            setTrendingColleges(data.colleges);
          }
        }
      } catch (e) {
        console.error('Error fetching trending colleges:', e);
      }
    };
    fetchTrending();
  }, []);

  // Fetch Recently Viewed colleges
  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (recentlyViewedIds.length === 0) {
        setRecentlyViewedColleges([]);
        return;
      }
      try {
        const list = [];
        for (const id of recentlyViewedIds.slice(0, 4)) {
          const res = await fetch(`/api/colleges/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.college) {
              list.push(data.college);
            }
          }
        }
        setRecentlyViewedColleges(list);
      } catch (e) {
        console.error('Error fetching recently viewed details:', e);
      }
    };
    fetchRecentlyViewed();
  }, [recentlyViewedIds]);

  // Toggle sorting
  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const handleExamToggle = (examName: string) => {
    setSelectedExams(prev => {
      if (prev.includes(examName)) {
        return prev.filter(e => e !== examName);
      } else {
        return [...prev, examName];
      }
    });
    setPage(1);
  };

  const handleSaveSearch = () => {
    setIsSavingSearch(true);
    const filters = {
      state, city, ownership, feeRange, minRating, minPlacementRate, minPackage, nirfRankMax, accreditation, course, selectedExams, scholarshipFriendly, trendingOnly, roiScoreMin
    };
    saveSearch(search || 'Active Filter Configuration', filters);
    setTimeout(() => setIsSavingSearch(false), 800);
  };

  const handleLoadSearch = (saved: any) => {
    setSearch(saved.query);
    setState(saved.filters.state || '');
    setCity(saved.filters.city || '');
    setOwnership(saved.filters.ownership || 'all');
    setFeeRange(saved.filters.feeRange || 'all');
    setMinRating(saved.filters.minRating || 0);
    setMinPlacementRate(saved.filters.minPlacementRate || 0);
    setMinPackage(saved.filters.minPackage || 0);
    setNirfRankMax(saved.filters.nirfRankMax || 'all');
    setAccreditation(saved.filters.accreditation || '');
    setCourse(saved.filters.course || '');
    setSelectedExams(saved.filters.selectedExams || []);
    setScholarshipFriendly(saved.filters.scholarshipFriendly || false);
    setTrendingOnly(saved.filters.trendingOnly || false);
    setRoiScoreMin(saved.filters.roiScoreMin || 0);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch('');
    setState('');
    setCity('');
    setOwnership('all');
    setFeeRange('all');
    setMinRating(0);
    setMinPlacementRate(0);
    setMinPackage(0);
    setNirfRankMax('all');
    setAccreditation('');
    setCourse('');
    setSelectedExams([]);
    setScholarshipFriendly(false);
    setTrendingOnly(false);
    setRoiScoreMin(0);
    setSortBy('collegeIntelligenceScore');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-[-100px] left-[5%] bg-glow-purple"></div>
      <div className="absolute top-[500px] right-[5%] bg-glow-purple" style={{ animationDelay: '-4s' }}></div>

      {/* ==========================================
          1. HERO SECTION (Above the fold wow pass)
         ========================================== */}
      <section 
        className="relative pt-24 pb-20 sm:pt-32 sm:pb-24 lg:pt-36 lg:pb-28 text-center z-10 bg-[#0A0A0F] overflow-hidden"
        style={{ 
          backgroundImage: 'radial-gradient(rgba(139, 92, 246, 0.04) 1.5px, transparent 0)', 
          backgroundSize: '28px 28px' 
        }}
      >
        {/* Glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-r from-[#8B5CF6]/12 to-[#A855F7]/12 rounded-full blur-[90px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#8B5CF6]/10 px-4 py-1.5 text-[11px] font-extrabold text-[#C084FC] border border-[#8B5CF6]/20 mb-8 select-none animate-float shadow-lg shadow-purple-500/5">
            <Sparkles className="h-3.5 w-3.5 text-[#A855F7] animate-pulse shrink-0" />
            <span>India College Intelligence Platform &bull; Data Verified 2026</span>
          </div>
          
          {/* Recruiter psychology optimized headers */}
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-white via-purple-100 to-[#C084FC] bg-clip-text text-transparent leading-[1.15] max-w-5xl mx-auto drop-shadow-sm py-2 mb-6">
            Empowering Indian Admissions with Data Intelligence
          </h1>
          
          <p className="mx-auto mt-0 mb-10 max-w-3xl text-xs sm:text-sm md:text-base text-[#B0B0C0]/85 leading-relaxed font-light tracking-wide">
            Discover, compare, predict admissions, plan careers, explore scholarships, and make data-driven education decisions with our end-to-end verified analytics engine.
          </p>

          {/* Centered CTA row optimized for immediate recruiter engagement */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-0 mb-12 max-w-3xl mx-auto px-4">
            <button
              onClick={() => document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full sm:w-52 h-12 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Explore Colleges
            </button>
            <Link
              href="/college-predictor"
              className="w-full sm:w-52 h-12 rounded-xl bg-[#151521]/60 text-[#C084FC] text-xs sm:text-sm font-extrabold border border-[#8B5CF6]/30 hover:border-[#8B5CF6]/60 hover:bg-[#8B5CF6]/10 shadow-md hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              Predict Admissions
            </Link>
            <Link
              href="/chat-counselor"
              className="w-full sm:w-52 h-12 rounded-xl bg-transparent text-[#B0B0C0] text-xs sm:text-sm font-bold border border-[#2A2A40] hover:border-[#8B5CF6]/40 hover:text-[#F5F5F5] hover:bg-[#151521]/30 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="h-4 w-4 text-[#8B5CF6] shrink-0" />
              Talk to Counselor
            </Link>
          </div>

          {/* ==========================================
              2. QUICK SEARCH BAR
             ========================================== */}
          <div className="mx-auto mt-0 mb-3 max-w-2xl px-2 sm:px-0">
            <div className="relative flex items-center rounded-2xl bg-[#151521]/45 border border-[#2A2A40]/80 p-1.5 backdrop-blur-lg focus-within:border-[#8B5CF6] focus-within:shadow-[0_0_25px_rgba(139,92,246,0.12)] transition-all duration-300 shadow-xl shadow-purple-950/5">
              <Search className="ml-3.5 h-4.5 w-4.5 text-[#B0B0C0]/50 shrink-0" />
              <input
                type="text"
                placeholder="Search by college name, city, state, or exam (e.g. BITS, IIT, CAT)..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full border-none bg-transparent py-3.5 pl-3 pr-4 text-xs sm:text-sm text-[#F5F5F5] outline-none placeholder:text-[#B0B0C0]/35 font-light"
              />
              <div className="hidden sm:flex items-center gap-1 rounded-lg bg-[#0A0A0F]/90 px-2.5 py-1.5 text-[9px] font-extrabold text-[#B0B0C0] border border-[#2A2A40]/80 mr-1.5 shrink-0 select-none">
                <Command className="h-3 w-3 text-[#B0B0C0]/70" />
                <span>K</span>
              </div>
            </div>
          </div>
          <p className="text-[9px] sm:text-[10px] text-[#B0B0C0]/30 mt-0 mb-14 font-light">
            Press <kbd className="text-[#8B5CF6] font-bold">Ctrl + K</kbd> anywhere to trigger the fuzzy search palette instantly.
          </p>

          {/* High-trust metric trust signals */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-16 max-w-5xl mx-auto border-t border-[#2A2A40]/30 pt-10">
            {[
              { label: "257+ Normalized Colleges", sub: "Cleaned catalogs", icon: GraduationCap },
              { label: "Ingestion Architecture", sub: "PostgreSQL relational db", icon: Database },
              { label: "Predictor Probability", sub: "Confidence scoring bounds", icon: Sparkles },
              { label: "ROI Analytics", sub: "Annual cost-to-fees ratios", icon: TrendingUp },
              { label: "Verified Placements", sub: "LPA benchmarks mapped", icon: Briefcase },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} className="group p-4 rounded-xl border border-[#2A2A40]/50 bg-[#151521]/15 hover:border-[#8B5CF6]/30 hover:bg-[#151521]/30 hover-lift transition-all text-center">
                  <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] group-hover:scale-110 transition-transform">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h4 className="mt-3 text-xs font-bold text-[#F5F5F5]">{stat.label}</h4>
                  <p className="mt-0.5 text-[9px] text-[#B0B0C0]/50 font-light">{stat.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A40]/40 to-transparent"></div>

      {/* ==========================================
          2. FEATURE HIGHLIGHTS (Intelligence Suite)
         ========================================== */}
      <section className="relative py-16 sm:py-20 bg-[#0A0A0F] z-10 select-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#B0B0C0] mb-8 flex items-center gap-2">
            <Sparkles className="h-4.5 w-4.5 text-[#8B5CF6] animate-pulse" />
            Seeded Admissions Intelligence Suite
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                title: "Admissions Planner",
                desc: "Drag and drop dream, target, and safe campuses. Auto-calculate cutoff probabilities and compile professional custom portfolios.",
                link: "/planner",
                badge: "Kanban Board Advisor",
                icon: (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Sliders className="h-5 w-5" />
                  </div>
                )
              },
              {
                title: "AI Career Roadmaps",
                desc: "Compile custom 4-year timelines listing skills, projects, certifications, and expected LPA benchmarks based on your job goals.",
                link: "/career-roadmap",
                badge: "4-Year Curricula Planner",
                icon: (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                )
              },
              {
                title: "Scholarship Finder",
                desc: "Match state, categories, genders, annual incomes, and exam scores against active government financial aid registries.",
                link: "/scholarships",
                badge: "NSP Heuristic Matcher",
                icon: (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-500/10 text-pink-400">
                    <Award className="h-5 w-5" />
                  </div>
                )
              },
              {
                title: "Predictor Wizard",
                desc: "Convert your exact rankings or percentiles into stretch, target, and safe allocations with deep statistical confidence scores.",
                link: "/college-predictor",
                badge: "Cutoff Probability Matrix",
                icon: (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <SlidersHorizontal className="h-5 w-5" />
                  </div>
                )
              },
              {
                title: "AI Chat Counselor",
                desc: "Query budget thresholds, top placements, ROI scores, and state-wise listings in plain natural language.",
                link: "/chat-counselor",
                badge: "Natural Language Advice",
                icon: (
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                )
              }
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="group rounded-2xl border border-[#2A2A40] bg-[#151521]/30 p-5 flex flex-col justify-between hover:border-[#8B5CF6]/50 hover:bg-[#151521]/60 hover:shadow-lg hover:shadow-purple-500/5 hover-lift transition-all text-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    {item.icon}
                    <span className="text-[8px] uppercase font-bold tracking-wider text-[#B0B0C0]/50 bg-[#151521] border border-[#2A2A40] px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                  
                  <h4 className="text-xs font-extrabold text-[#F5F5F5] group-hover:text-[#8B5CF6] transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="text-[10px] text-[#B0B0C0] font-light leading-normal">
                    {item.desc}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-1.5 font-bold text-[#8B5CF6] group-hover:translate-x-1.5 transition-transform pt-2 text-[10px]">
                  Launch Tool
                  <ChevronRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A40]/40 to-transparent"></div>

      {/* ==========================================
          3. MAIN EXPLORATION SECTION & LISTINGS
         ========================================== */}
      <section id="explore-section" className="relative py-16 sm:py-20 bg-[#0A0A0F] z-10 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Trending Colleges slider layout */}
          {trendingColleges.length > 0 && !search && (
            <div className="mb-14">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B0B0C0] mb-6 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-[#A855F7] animate-pulse" />
                Trending Higher Institutions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {trendingColleges.map(col => (
                  <div
                    key={`trending-${col.id}`}
                    onClick={() => {
                      addRecentlyViewed(col.id);
                      router.push(`/college/${col.id}`);
                    }}
                    className="rounded-xl border border-[#2A2A40] bg-[#151521]/60 p-4 hover:border-[#8B5CF6]/50 hover:bg-[#151521] transition-all duration-300 cursor-pointer flex items-center gap-3 hover-lift"
                  >
                    <img 
                      src={getSafeLogoSrc(col)} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackLogoUrl();
                      }}
                      alt="" 
                      className="h-10 w-10 rounded-lg object-cover object-center border border-[#2A2A40]" 
                    />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-xs text-[#F5F5F5] truncate">{col.name}</h5>
                      <p className="text-[9px] text-[#B0B0C0] mt-0.5 flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 text-[#8B5CF6]" /> {col.city} &bull; {col.averagePackage} LPA
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Sidebar filters with elegant controls */}
            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/50 p-6 backdrop-blur-md shadow-sm sticky top-24 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-[#2A2A40]/60 pb-4">
                  <h3 className="font-bold text-[#F5F5F5] text-xs uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-[#8B5CF6]" />
                    Intelligence Filters
                  </h3>
                  <button
                    onClick={clearFilters}
                    className="text-[10px] font-bold text-[#B0B0C0] hover:text-[#8B5CF6] transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-4 pt-4 text-xs">
                  {/* Save search configuration */}
                  <button
                    onClick={handleSaveSearch}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-[#8B5CF6]/25 bg-[#8B5CF6]/5 py-2 text-[10px] font-bold text-[#8B5CF6] hover:bg-[#8B5CF6]/10 transition-colors cursor-pointer"
                  >
                    <Bookmark className="h-3.5 w-3.5" />
                    {isSavingSearch ? 'Saved!' : 'Save Active Search'}
                  </button>

                  {/* State selector */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#B0B0C0]/50">Preferred State</label>
                    <select
                      value={state}
                      onChange={e => { setState(e.target.value); setPage(1); }}
                      className="mt-1 w-full rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    >
                      <option value="">All States</option>
                      {Object.keys(statesAndCities).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  {/* City search */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#B0B0C0]/50">Preferred City</label>
                    <input
                      type="text"
                      placeholder="e.g. Mumbai, Bangalore"
                      value={city}
                      onChange={e => { setCity(e.target.value); setPage(1); }}
                      className="mt-1 w-full rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors placeholder:text-[#B0B0C0]/25"
                    />
                  </div>

                  {/* Branch selection */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#B0B0C0]/50">Course / Branch</label>
                    <select
                      value={course}
                      onChange={e => { setCourse(e.target.value); setPage(1); }}
                      className="mt-1 w-full rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-3 py-2 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    >
                      <option value="">All Courses</option>
                      <option value="Computer Science">Computer Science (CSE / IT)</option>
                      <option value="Electronics">Electronics (ECE / EE)</option>
                      <option value="Management">Management (MBA / PGDM)</option>
                      <option value="Commerce">Commerce & Economics</option>
                    </select>
                  </div>

                  {/* Exam pathways checks */}
                  <div>
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#B0B0C0]/50 block mb-1">Accepted Exams</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['JEE Main', 'JEE Advanced', 'BITSAT', 'CAT', 'CUET', 'GATE'].map(ex => {
                        const isSelected = selectedExams.includes(ex);
                        return (
                          <button
                            key={ex}
                            onClick={() => handleExamToggle(ex)}
                            className={`rounded px-2 py-1 text-[9px] font-bold border transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#8B5CF6]'
                                : 'border-[#2A2A40] bg-[#0A0A0F] text-[#B0B0C0] hover:border-[#8B5CF6]/30'
                            }`}
                          >
                            {ex}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial aid toggle */}
                  <div className="flex items-center justify-between border-t border-[#2A2A40]/40 pt-3.5">
                    <label className="text-[9px] font-bold uppercase tracking-wider text-[#B0B0C0]/60">Scholarship Friendly</label>
                    <input
                      type="checkbox"
                      checked={scholarshipFriendly}
                      onChange={e => { setScholarshipFriendly(e.target.checked); setPage(1); }}
                      className="h-3.5 w-3.5 rounded border-[#2A2A40] bg-[#0A0A0F] text-[#8B5CF6] focus:ring-[#8B5CF6]"
                    />
                  </div>

                  {/* ROI Slider filter */}
                  <div className="border-t border-[#2A2A40]/40 pt-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[9px] font-bold uppercase tracking-wider text-[#B0B0C0]/60">Min ROI Rating</label>
                      <span className="text-[10px] font-bold text-[#8B5CF6]">{roiScoreMin}x+</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={roiScoreMin}
                      onChange={e => { setRoiScoreMin(Number(e.target.value)); setPage(1); }}
                      className="w-full h-1 bg-[#0A0A0F] rounded-lg appearance-none cursor-pointer accent-[#8B5CF6]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* College catalog cards results */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Saved search profiles row */}
              {savedSearches.length > 0 && (
                <div className="rounded-xl border border-[#2A2A40] bg-[#151521]/30 p-4 text-xs backdrop-blur-sm">
                  <span className="text-[9px] text-[#B0B0C0]/50 font-bold uppercase tracking-wider block mb-2">Saved Search Profiles:</span>
                  <div className="flex flex-wrap gap-2">
                    {savedSearches.map(saved => (
                      <div
                        key={saved.id}
                        className="flex items-center gap-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A40] pl-2.5 pr-1.5 py-1 text-[10px] text-[#B0B0C0] hover:border-[#8B5CF6]/50 transition-colors"
                      >
                        <button onClick={() => handleLoadSearch(saved)} className="font-semibold text-[#F5F5F5] hover:text-[#8B5CF6] cursor-pointer">
                          {saved.query || 'Config Filter'}
                        </button>
                        <button
                          onClick={() => deleteSavedSearch(saved.id)}
                          className="rounded hover:bg-[#2A2A40] p-0.5 text-[#B0B0C0]/60 hover:text-red-400 cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Catalog header sorting controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-[#2A2A40] bg-[#151521]/40 px-5 py-3 shadow-sm text-xs backdrop-blur-sm">
                <span className="font-semibold text-[#B0B0C0]">
                  Found <span className="font-bold text-[#8B5CF6]">{total}</span> colleges matching criteria
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[9px] text-[#B0B0C0]/50 font-bold uppercase tracking-wider">Sort by:</span>
                  {[
                    { label: 'IQ Rating', value: 'collegeIntelligenceScore' },
                    { label: 'ROI Score', value: 'roiScore' },
                    { label: 'Rating', value: 'rating' },
                    { label: 'Fees', value: 'fees' },
                    { label: 'Avg Package', value: 'averagePackage' },
                  ].map(sortOption => (
                    <button
                      key={sortOption.value}
                      onClick={() => handleSortChange(sortOption.value as any)}
                      className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-[9px] font-bold border transition-all cursor-pointer ${
                        sortBy === sortOption.value
                          ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/40 text-[#8B5CF6]'
                          : 'border-[#2A2A40] bg-[#0A0A0F] text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5]'
                      }`}
                    >
                      {sortOption.label}
                      {sortBy === sortOption.value && (
                        <ArrowUpDown className={`h-2.5 w-2.5 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* List Result Cards */}
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-2xl border border-[#2A2A40] bg-[#151521]/40 animate-pulse h-[380px]"
                    >
                      <div className="h-32 bg-[#2A2A40]/40"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-5 w-2/3 bg-[#2A2A40]/40 rounded"></div>
                        <div className="h-4.5 w-1/2 bg-[#2A2A40]/40 rounded"></div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="h-9 bg-[#2A2A40]/40 rounded"></div>
                          <div className="h-9 bg-[#2A2A40]/40 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : colleges.length === 0 ? (
                /* Product-grade Empty State */
                <div className="rounded-2xl border border-dashed border-[#2A2A40] bg-[#151521]/30 p-16 text-center backdrop-blur-sm animate-fade-in flex flex-col items-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#8B5CF6] mb-5">
                    <GraduationCap className="h-7 w-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#F5F5F5]">Start building your dream college portfolio</h3>
                  <p className="mt-2 text-xs text-[#B0B0C0] max-w-sm leading-relaxed font-light">
                    We couldn't locate colleges matching your exact active filters. Adjust your budget boundaries or select other regional choices.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="mt-6 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-6 py-2.5 text-xs font-extrabold text-white hover:opacity-90 shadow-md shadow-purple-500/10 cursor-pointer"
                  >
                    Reset Active Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                  {colleges.map((college: any) => {
                    const isInCompare = comparisonColleges.some(c => c.id === college.id);
                    const isSaved = savedCollegeIds.includes(college.id);

                    return (
                      <div
                        key={college.id}
                        className="group flex flex-col overflow-hidden rounded-xl border border-[#2A2A40]/80 bg-[#151521]/50 shadow-premium hover:border-[#8B5CF6]/50 hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] hover-lift transition-all duration-300 transform backdrop-blur-sm animate-fade-in h-full"
                      >
                        {/* Banner Image */}
                        <div className="relative h-32 w-full overflow-hidden bg-[#0A0A0F] shrink-0">
                          <img
                            src={getSafeBannerSrc(college)}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = getFallbackBannerUrl(college.name, college.exams);
                            }}
                            alt={college.name}
                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 opacity-75"
                          />
                          
                          {/* NIRF Rank Capsule */}
                          {college.nirfRank && (
                            <div className="absolute top-3 left-3 flex items-center gap-1 rounded-lg bg-[#8B5CF6]/90 backdrop-blur px-2 py-0.5 text-[8px] font-extrabold text-white border border-[#2A2A40]">
                              NIRF #{college.nirfRank}
                            </div>
                          )}

                          {/* Save Button */}
                          <button
                            onClick={async () => {
                              if (!user) {
                                alert('Please log in to save colleges.');
                                return;
                              }
                              await toggleSaveCollege(college.id);
                            }}
                            className={`absolute top-3 right-3 flex h-7.5 w-7.5 items-center justify-center rounded-full bg-[#0A0A0F]/80 backdrop-blur border border-[#2A2A40] hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                              isSaved
                                ? 'text-pink-400 border-pink-500/35 bg-pink-500/10'
                                : 'text-[#B0B0C0] hover:text-[#F5F5F5]'
                            }`}
                          >
                            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
                          </button>

                          {/* Ownership & Accreditation Badge */}
                          <div className="absolute bottom-2.5 left-2.5 flex flex-wrap gap-1">
                            <span className="rounded bg-[#0A0A0F]/90 px-1.5 py-0.5 text-[7px] font-bold text-[#F5F5F5] border border-[#2A2A40]/70">
                              {college.ownership}
                            </span>
                            {college.accreditation && (
                              <span className="rounded bg-[#8B5CF6]/20 px-1.5 py-0.5 text-[7px] font-bold text-[#8B5CF6] border border-[#8B5CF6]/30">
                                {college.accreditation}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 p-4 flex flex-col justify-between">
                          <div>
                            {/* Name & Location */}
                            <div className="flex items-start gap-2.5">
                              <img
                                src={getSafeLogoSrc(college)}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getFallbackLogoUrl();
                                }}
                                alt=""
                                className="h-8 w-8 rounded-lg object-cover object-center border border-[#2A2A40] bg-[#0A0A0F]"
                              />
                              <div className="overflow-hidden">
                                <h4 className="font-extrabold text-[#F5F5F5] text-xs line-clamp-1 hover:text-[#8B5CF6] transition-colors">
                                  <Link 
                                    href={`/college/${college.id}`}
                                    onClick={() => addRecentlyViewed(college.id)}
                                  >
                                    {college.name}
                                  </Link>
                                </h4>
                                <p className="flex items-center gap-0.5 text-[8.5px] text-[#B0B0C0] mt-0.5">
                                  <MapPin className="h-2.5 w-2.5 text-[#8B5CF6]" />
                                  {college.location}
                                </p>
                              </div>
                            </div>

                            {/* Intelligence Stats Capsule */}
                            <div className="flex justify-between items-center rounded-xl bg-[#0A0A0F]/65 border border-[#2A2A40]/40 px-2.5 py-1.5 mt-3 text-[9px] shrink-0">
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                <span className="font-bold text-[#F5F5F5]">{college.rating}</span>
                                <span className="text-[#B0B0C0]/50">/5</span>
                              </div>
                              <div className="border-l border-[#2A2A40]/40 h-3"></div>
                              <div>
                                <span className="text-[#B0B0C0]/60">IQ Score:</span>{' '}
                                <span className="font-extrabold text-[#8B5CF6]">{college.collegeIntelligenceScore}</span>
                              </div>
                              <div className="border-l border-[#2A2A40]/40 h-3"></div>
                              <div>
                                <span className="text-[#B0B0C0]/60">ROI:</span>{' '}
                                <span className="font-extrabold text-[#A855F7]">{college.roiScore}x</span>
                              </div>
                            </div>

                            <p className="mt-3 text-[10px] text-[#B0B0C0] line-clamp-2 leading-relaxed font-light min-h-[30px]">
                              {college.description}
                            </p>

                            {/* Fees & Packages */}
                            <div className="grid grid-cols-2 gap-3 border-y border-[#2A2A40]/40 py-2.5 my-3 text-[11px] shrink-0">
                              <div className="space-y-0.5">
                                <span className="text-[#B0B0C0]/65 text-[8px] font-bold uppercase tracking-wider">Annual Cost</span>
                                <div className="flex items-center font-extrabold text-[#F5F5F5]">
                                  <IndianRupee className="h-3 w-3 text-[#8B5CF6]" />
                                  {college.fees.toLocaleString('en-IN')}
                                </div>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[#B0B0C0]/65 text-[8px] font-bold uppercase tracking-wider">Avg Package</span>
                                <div className="flex items-center gap-0.5 font-extrabold text-[#F5F5F5]">
                                  <Briefcase className="h-3 w-3 text-[#8B5CF6]" />
                                  <span>{college.averagePackage} LPA</span>
                                  <span className="text-[8px] text-[#B0B0C0]/60 font-normal">
                                    ({college.placementRate}%)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-1 shrink-0">
                            <button
                              onClick={() => {
                                const success = addToComparison(college);
                                if (!success) {
                                  alert('You can compare a maximum of 3 colleges. Remove another college to add this.');
                                }
                              }}
                              className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-2 text-[9.5px] font-bold border transition-all cursor-pointer ${
                                isInCompare
                                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#8B5CF6]'
                                  : 'border-[#2A2A40] text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5]'
                              }`}
                            >
                              <GitCompare className="h-3 w-3" />
                              {isInCompare ? 'In Comparison' : 'Compare'}
                            </button>
                            <Link
                              href={`/college/${college.id}`}
                              onClick={() => addRecentlyViewed(college.id)}
                              className="flex-1 flex items-center justify-center rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-3 py-2 text-[9.5px] font-bold text-white hover:opacity-95 text-center shadow transition-all shadow-purple-500/5"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination Controls */}
              {pages > 1 && !loading && (
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#2A2A40]/40 pt-6 gap-4">
                  <span className="text-[10px] text-[#B0B0C0] font-bold uppercase tracking-wider select-none order-2 sm:order-1">
                    Showing Page <span className="text-[#8B5CF6] font-extrabold">{page}</span> of <span className="text-[#F5F5F5] font-extrabold">{pages}</span>
                  </span>
                  
                  <div className="hidden sm:flex items-center gap-2 order-1 sm:order-2">
                    <button
                      disabled={page === 1}
                      onClick={() => {
                        setPage(prev => Math.max(prev - 1, 1));
                        document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A40] bg-[#151521]/60 text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 disabled:opacity-30 disabled:hover:text-[#B0B0C0] disabled:hover:border-[#2A2A40] disabled:hover:bg-[#151521]/60 disabled:cursor-not-allowed transition-all duration-250 cursor-pointer shadow-sm active:scale-95"
                      title="Previous Page"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>

                    {pageNumbers.map((p, i) => {
                      if (p === '...') {
                        return (
                          <span
                            key={`ellipsis-${i}`}
                            className="flex h-9 w-9 items-center justify-center text-[#B0B0C0]/50 text-xs font-bold select-none"
                          >
                            &bull;&bull;&bull;
                          </span>
                        );
                      }

                      const pageNum = p as number;
                      const isActive = page === pageNum;

                      return (
                        <button
                          key={`page-${pageNum}`}
                          onClick={() => {
                            setPage(pageNum);
                            document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-xs border transition-all duration-250 cursor-pointer active:scale-95 ${
                            isActive
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] border-transparent text-white shadow-lg shadow-purple-500/20 scale-105'
                              : 'border-[#2A2A40] bg-[#151521]/40 text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/35'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    <button
                      disabled={page === pages}
                      onClick={() => {
                        setPage(prev => Math.min(prev + 1, pages));
                        document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#2A2A40] bg-[#151521]/60 text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 disabled:opacity-30 disabled:hover:text-[#B0B0C0] disabled:hover:border-[#2A2A40] disabled:hover:bg-[#151521]/60 disabled:cursor-not-allowed transition-all duration-250 cursor-pointer shadow-sm active:scale-95"
                      title="Next Page"
                    >
                      <ChevronRight className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  <div className="flex sm:hidden items-center justify-between w-full order-1 gap-4">
                    <button
                      disabled={page === 1}
                      onClick={() => {
                        setPage(prev => Math.max(prev - 1, 1));
                        document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-[#2A2A40] bg-[#151521]/60 text-[#B0B0C0] hover:text-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-all active:scale-95"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span>Prev</span>
                    </button>
                    
                    <span className="text-xs font-bold text-[#F5F5F5] select-none bg-[#151521]/60 border border-[#2A2A40] px-4.5 py-2 rounded-xl">
                      {page} <span className="text-[#B0B0C0]/50 mx-1">/</span> {pages}
                    </span>

                    <button
                      disabled={page === pages}
                      onClick={() => {
                        setPage(prev => Math.min(prev + 1, pages));
                        document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 h-10 rounded-xl border border-[#2A2A40] bg-[#151521]/60 text-[#B0B0C0] hover:text-[#F5F5F5] disabled:opacity-30 disabled:cursor-not-allowed font-bold text-xs transition-all active:scale-95"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Recently viewed row list */}
          {recentlyViewedColleges.length > 0 && (
            <div className="mt-16 border-t border-[#2A2A40]/40 pt-12">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#B0B0C0] mb-6 flex items-center gap-2">
                <History className="h-4.5 w-4.5 text-[#8B5CF6]" />
                Recently Viewed Colleges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentlyViewedColleges.map(col => (
                  <div
                    key={`viewed-${col.id}`}
                    onClick={() => router.push(`/college/${col.id}`)}
                    className="rounded-xl border border-[#2A2A40] bg-[#151521]/30 p-4 hover:border-[#8B5CF6]/50 hover:bg-[#151521]/60 transition-all duration-300 cursor-pointer flex items-center gap-3 hover-lift animate-fade-in"
                  >
                    <img 
                      src={getSafeLogoSrc(col)} 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = getFallbackLogoUrl();
                      }}
                      alt="" 
                      className="h-8 w-8 rounded-lg object-cover object-center border border-[#2A2A40]" 
                    />
                    <div className="overflow-hidden">
                      <h5 className="font-bold text-[11px] text-[#F5F5F5] truncate">{col.name}</h5>
                      <p className="text-[9px] text-[#B0B0C0] mt-0.5 truncate">{col.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A40]/40 to-transparent"></div>

      {/* ==========================================
          4. TOP RECRUITERS SHOWCASE
         ========================================== */}
      <section className="py-16 sm:py-20 bg-[#0A0A0F] relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5CF6]">Global Placements</span>
            <h4 className="text-2xl font-black text-[#F5F5F5] mt-2">Recruiters Hiring from Top Colleges</h4>
            <p className="text-xs text-[#B0B0C0]/75 mt-1.5 font-light leading-relaxed">
              Top institutions place students into global technology, finance, consulting, and research companies.
            </p>
          </div>

          <div className="marquee-container relative py-4 bg-[#151521]/5 border-y border-[#2A2A40]/30 overflow-hidden">
            {/* Left and Right Fade Masking */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#0A0A0F] to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#0A0A0F] to-transparent z-10 pointer-events-none"></div>

            <div className="marquee-content flex gap-5 text-xs font-bold tracking-widest text-[#B0B0C0] uppercase select-none">
              {['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey', 'TATA', 'Reliance', 'JPMorgan', 'Adobe', 'BCG', 'ITC', 'Infosys'].map((brand, i) => (
                <span
                  key={i}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-[#2A2A40]/55 bg-[#151521]/35 text-[10px] font-bold text-[#B0B0C0]/90 hover:text-white hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 cursor-pointer whitespace-nowrap"
                >
                  {brand}
                </span>
              ))}
              {['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'McKinsey', 'TATA', 'Reliance', 'JPMorgan', 'Adobe', 'BCG', 'ITC', 'Infosys'].map((brand, i) => (
                <span
                  key={`dup-${i}`}
                  className="inline-flex items-center justify-center px-4 py-2.5 rounded-full border border-[#2A2A40]/55 bg-[#151521]/35 text-[10px] font-bold text-[#B0B0C0]/90 hover:text-white hover:border-[#8B5CF6]/50 hover:bg-[#8B5CF6]/5 hover:scale-[1.03] hover:shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all duration-300 cursor-pointer whitespace-nowrap"
                >
                  {brand}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A40]/40 to-transparent"></div>

      {/* ==========================================
          5. TRUST SIGNALS & SYSTEM TRANSPARENCY
         ========================================== */}
      <section className="py-16 sm:py-20 bg-[#0A0A0F] relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5CF6] flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Recruiter Auditable Standards
            </span>
            <h3 className="text-2xl font-black text-[#F5F5F5] mt-2">Engineered Admission Transparency</h3>
            <p className="text-xs text-[#B0B0C0]/75 mt-1.5 font-light leading-relaxed">
              We leverage strict mathematical models, JoSAA counseling data registers, and normalized ROI multipliers instead of sponsored bidding models.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl border border-[#2A2A40]/80 bg-[#151521]/30 text-left hover:border-[#8B5CF6]/30 transition-all hover-lift">
              <div className="h-10 w-10 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 text-[#8B5CF6] flex items-center justify-center font-bold">
                <SearchCode className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-[#F5F5F5] text-sm mt-4">1. How Recommendations Work</h4>
              <p className="text-xs text-[#B0B0C0]/85 mt-2 leading-relaxed font-light">
                Our matching filter checks user AIR exam score ranges against historical opening & closing ranks. Government data is dynamically scaled to match equivalent percentiles for VITEEE, SRM, and state counseling streams.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#2A2A40]/80 bg-[#151521]/30 text-left hover:border-[#8B5CF6]/30 transition-all hover-lift">
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/25 text-purple-400 flex items-center justify-center font-bold">
                <Database className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-[#F5F5F5] text-sm mt-4">2. Pure Data Transparency</h4>
              <p className="text-xs text-[#B0B0C0]/85 mt-2 leading-relaxed font-light">
                We maintain an open schema structure. Zero institution-sponsored sorting biases exist. Rankings correlate with verified NIRF parameters and validated average placement LPA outcomes.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#2A2A40]/80 bg-[#151521]/30 text-left hover:border-[#8B5CF6]/30 transition-all hover-lift">
              <div className="h-10 w-10 rounded-xl bg-pink-500/15 border border-pink-500/25 text-pink-400 flex items-center justify-center font-bold">
                <Gauge className="h-5 w-5" />
              </div>
              <h4 className="font-extrabold text-[#F5F5F5] text-sm mt-4">3. Confidence Scoring Algorithms</h4>
              <p className="text-xs text-[#B0B0C0]/85 mt-2 leading-relaxed font-light">
                Confidence meters assess placement ratios, budget thresholds, and local seat structures, categorizing targets into Safe (&gt;80%), Target (65%-79%), or Stretch (30%-64%) portfolios dynamically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A40]/40 to-transparent"></div>

      {/* ==========================================
          6. ALUMNI SUCCESS STORIES
         ========================================== */}
      <section className="py-16 sm:py-20 bg-[#0A0A0F] relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5CF6]">Testimonials</span>
            <h3 className="text-xl font-extrabold text-[#F5F5F5] mt-1">Student Success Stories</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { text: "The admissions predictor was spot on! It categorized IIT Bombay CSE as a Stretch option and IIT Madras as Target. Ended up getting Madras and the placement insights mapped directly to the recruiter offers.", author: "Piyush Sharma", info: "IIT Madras CSE '24" },
              { text: "Choosing between BITS Pilani and NIT Trichy was easy once I saw the fee-to-package ROI multiplier. The comparison matrix layout is a work of art for students who want to make data-backed career paths.", author: "Rhea Sen", info: "BITS Pilani ECE '25" },
              { text: "Predictor's percentile categorization for CAT helped me structure my admission round strategy. Mapped secure calls at IIM Bangalore based on the Safe thresholds predicted here.", author: "Arjun Nair", info: "IIM Bangalore MBA '23" }
            ].map((t, i) => (
              <div key={i} className="p-6 rounded-2xl border border-[#2A2A40] bg-[#151521]/30 text-left flex flex-col justify-between hover-lift">
                <p className="text-xs text-[#B0B0C0] italic leading-relaxed font-light">"{t.text}"</p>
                <div className="mt-5 pt-4 border-t border-[#2A2A40]/30 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] font-bold text-xs flex items-center justify-center">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-[#F5F5F5]">{t.author}</h5>
                    <span className="text-[9px] text-[#B0B0C0]/50">{t.info}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2A2A40]/40 to-transparent"></div>

      {/* ==========================================
          7. FAQ ACCORDION SECTION
         ========================================== */}
      <section className="py-16 sm:py-20 bg-[#0A0A0F] relative z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#8B5CF6]">FAQ Accordion</span>
            <h3 className="text-xl font-extrabold text-[#F5F5F5] mt-1">Frequently Asked Questions</h3>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {[
              {
                q: "How does the Admission Predictor calculate my options?",
                a: "Our engine analyzes years of historical cutoff data from JEE, CAT, and BITSAT. By calculating rank-to-cutoff ratios and percentile deviations, it classifies options into Safe, Target, or Stretch, with a dynamic confidence score updated by your budget and state choices."
              },
              {
                q: "What is the ROI Score and how is it calculated?",
                a: "The ROI (Return on Investment) Score is computed by dividing a college's Average Annual Placement Package by its Annual Fee. A higher multiplier signifies better financial returns. For instance, a college with a 15 LPA average package and 1.5 Lakh annual fees represents a 10.0x ROI factor."
              },
              {
                q: "Is my personal search and predictor history safe?",
                a: "Yes. All searches, comparison configurations, and predictor runs are stored locally in your browser's localStorage. If you choose to log in, bookmarks are synced securely to a database. Otherwise, all processing remains private in your device."
              },
              {
                q: "How frequently is the college ranking and placement data updated?",
                a: "We ingest verified educational data annually matching NIRF rankings release and colleges' official placement publications. You can trigger an ingestion run via our administrative endpoints at any time to sync with the latest reports."
              }
            ].map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="rounded-xl border border-[#2A2A40] bg-[#151521]/30 overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-4 text-left text-xs font-bold text-[#F5F5F5] hover:bg-[#2A2A40]/20 transition-colors cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <span className={`text-[#8B5CF6] font-bold text-base transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  <div className={`transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-48 border-t border-[#2A2A40]/40' : 'max-h-0'}`}>
                    <p className="p-4 text-xs text-[#B0B0C0]/85 font-light leading-relaxed bg-[#0A0A0F]/20">{faq.a}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

const statesAndCities: { [state: string]: string[] } = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur'],
  'Delhi': ['New Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Tiruchirappalli', 'Vellore'],
  'Karnataka': ['Bangalore', 'Mangalore', 'Manipal'],
  'Telangana': ['Hyderabad', 'Warangal'],
  'Uttar Pradesh': ['Noida', 'Kanpur', 'Lucknow', 'Varanasi', 'Allahabad'],
  'West Bengal': ['Kolkata', 'Kharagpur', 'Durgapur'],
  'Gujarat': ['Ahmedabad', 'Gandhinagar', 'Surat'],
  'Rajasthan': ['Pilani', 'Jaipur', 'Jodhpur'],
  'Kerala': ['Trivandrum', 'Kochi', 'Calicut'],
  'Madhya Pradesh': ['Bhopal', 'Indore'],
  'Punjab': ['Patiala', 'Jalandhar', 'Ropar'],
  'Bihar': ['Patna'],
  'Odisha': ['Bhubaneswar', 'Rourkela'],
  'Haryana': ['Gurgaon', 'Sonepat'],
  'Uttarakhand': ['Roorkee', 'Dehradun'],
  'Jharkhand': ['Ranchi', 'Jamshedpur'],
  'Assam': ['Guwahati', 'Silchar'],
  'Goa': ['Panaji', 'Vasco', 'Ponda'],
};
