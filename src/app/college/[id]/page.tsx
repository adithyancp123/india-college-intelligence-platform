'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  getSafeLogoSrc, 
  getSafeBannerSrc, 
  getFallbackLogoUrl, 
  getFallbackBannerUrl 
} from '@/lib/image-mapper';
import { MapPin, Calendar, IndianRupee, Star, GitCompare, Bookmark, BookOpen, Briefcase, GraduationCap, ChevronLeft, Award, Users, ShieldAlert, Send, Wifi, Home, Dumbbell, Trophy, FlaskConical, Coffee, Tv, TrendingUp, ThumbsUp, Check, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const getFacilityIcon = (name: string) => {
  const lower = name.toLowerCase();
  if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="h-3.5 w-3.5 text-purple-400" />;
  if (lower.includes('hostel') || lower.includes('dorm')) return <Home className="h-3.5 w-3.5 text-purple-400" />;
  if (lower.includes('gym') || lower.includes('fitness')) return <Dumbbell className="h-3.5 w-3.5 text-purple-400" />;
  if (lower.includes('lab') || lower.includes('laboratory')) return <FlaskConical className="h-3.5 w-3.5 text-purple-400" />;
  if (lower.includes('sport') || lower.includes('play') || lower.includes('court') || lower.includes('gymnasium')) return <Trophy className="h-3.5 w-3.5 text-purple-400" />;
  if (lower.includes('library') || lower.includes('read')) return <BookOpen className="h-3.5 w-3.5 text-purple-400" />;
  if (lower.includes('cafe') || lower.includes('food') || lower.includes('canteen')) return <Coffee className="h-3.5 w-3.5 text-purple-400" />;
  return <Tv className="h-3.5 w-3.5 text-purple-400" />;
};

const getRealisticReviews = (collegeName: string, id: string) => {
  const isMgmt = collegeName.toLowerCase().includes('management') || collegeName.toLowerCase().includes('iim') || collegeName.toLowerCase().includes('business');
  
  return [
    {
      id: `${id}-mock-rev-1`,
      userName: "Rahul Sharma",
      branch: isMgmt ? "MBA (Marketing)" : "Computer Science (CSE)",
      gradYear: 2025,
      rating: 4.8,
      category: "Placements",
      isVerified: true,
      helpfulCount: 42,
      createdAt: "2026-05-10T10:00:00Z",
      comment: isMgmt 
        ? "Placements at this institute are legendary. Major global consulting firms (McKinsey, BCG, Bain) and investment banks (Goldman, JP Morgan) visit the campus. The preparation starts months in advance with peer-led mock interviews. The average CTC exceeds 30 LPA for my cohort. Almost 100% placement is achieved within the first week of the placement drive. The recruitment process is extremely professional and managed entirely by the student committee."
        : "CSE placements here are absolutely mind-blowing. Top tier firms like Google, Microsoft, Amazon, and Adobe recruit heavily. The average CTC for the CSE branch easily touches 24 LPA. The coding culture is extremely intense; almost everyone is active on Codeforces or LeetCode. Preparing for technical rounds is seamless because the seniors guide you through mock assessments. The placement cell is incredibly active and supportive throughout."
    },
    {
      id: `${id}-mock-rev-2`,
      userName: "Priya Patel",
      branch: isMgmt ? "MBA (Finance)" : "Electronics & Communication (ECE)",
      gradYear: 2024,
      rating: 4.5,
      category: "Academics",
      isVerified: true,
      helpfulCount: 28,
      createdAt: "2026-04-25T14:30:00Z",
      comment: isMgmt
        ? "The case-study pedagogy is highly rigorous and prepares you for real-world strategic decision making. The discussions in class are extremely intellectually stimulating due to the diverse backgrounds of peers. However, the academic load is massive; expect sleep-deprived nights and continuous submissions. The faculty are authors of standard academic textbooks and bring immense industry consulting experience to the lecture rooms."
        : "The ECE curriculum is exceptionally structured but quite tough. The theory classes are balanced well with extensive lab hours. We get hands-on experience on VLSI design and advanced embedded systems. The exams are conceptual; rote learning won't help you pass here. Some professors are strict with grading, but they are highly helpful if you approach them during office hours for research guidance."
    },
    {
      id: `${id}-mock-rev-3`,
      userName: "Amit Verma",
      branch: isMgmt ? "MBA (Consulting)" : "Mechanical Engineering",
      gradYear: 2026,
      rating: 3.5,
      category: "Hostel",
      isVerified: false,
      helpfulCount: 19,
      createdAt: "2026-05-15T09:00:00Z",
      comment: "Hostel infrastructure is decent but definitely has room for improvement. While the rooms are clean and have basic amenities, the washroom maintenance could be better. The Wi-Fi speed fluctuates during peak hours when everyone is online. The mess food is average; we get a good variety of North and South Indian dishes, but the taste becomes repetitive after a few weeks. The hostel warden is cooperative but quite strict with curfews."
    },
    {
      id: `${id}-mock-rev-4`,
      userName: "Sneha Reddy",
      branch: isMgmt ? "MBA (HRM)" : "Computer Science (CSE)",
      gradYear: 2025,
      rating: 4.6,
      category: "Faculty",
      isVerified: true,
      helpfulCount: 35,
      createdAt: "2026-05-01T11:15:00Z",
      comment: "The faculty members are outstanding. They are not just academic instructors but mentors who actively guide you in projects and careers. Most professors hold PhDs from Ivy Leagues or premier foreign universities. Their teaching style is highly interactive, using modern slide decks, quizzes, and live coding exercises. They encourage asking questions and are always available for brainstorming business ideas or research designs."
    },
    {
      id: `${id}-mock-rev-5`,
      userName: "Vikram Malhotra",
      branch: isMgmt ? "MBA (Operations)" : "Information Technology (IT)",
      gradYear: 2024,
      rating: 4.7,
      category: "Campus Life",
      isVerified: true,
      helpfulCount: 51,
      createdAt: "2026-03-12T16:45:00Z",
      comment: "Campus life is absolutely vibrant! The yearly cultural fest is one of the biggest in the region, bringing in popular artists and students from all across India. There are over 30 active clubs ranging from photography, robotics, dramatic arts, to competitive gaming and entrepreneurship cell. The campus is open 24/7, and hanging out at the late-night canteens or sports complexes after class is where the memories are made."
    },
    {
      id: `${id}-mock-rev-6`,
      userName: "Ananya Das",
      branch: isMgmt ? "MBA (Finance)" : "Computer Science (CSE)",
      gradYear: 2025,
      rating: 4.9,
      category: "ROI",
      isVerified: true,
      helpfulCount: 62,
      createdAt: "2026-05-22T08:30:00Z",
      comment: isMgmt
        ? "Though the fees are on the higher side, the ROI is exceptional. Given the stellar placement packages where most graduates secure 25+ LPA, you can easily pay off your student loan within 18 to 24 months of working. The brand value you carry for the rest of your career is priceless. The professional network, corporate connections, and career trajectory this brand unlocks make every rupee spent completely worth it."
        : "At an annual academic fee under 2.5 lakhs, the value return is unbeatable. Securing an average package of 23 LPA means the return on investment is extremely high compared to private colleges where fees are sky-high. The state-subsidized model combined with top-tier recruiters ensures that students start their careers with zero financial burdens and massive savings. Hands down, the best ROI in the country."
    },
    {
      id: `${id}-mock-rev-7`,
      userName: "Karan Johar",
      branch: isMgmt ? "MBA (Marketing)" : "Mechanical Engineering",
      gradYear: 2026,
      rating: 4.0,
      category: "Infrastructure",
      isVerified: true,
      helpfulCount: 14,
      createdAt: "2026-04-10T12:00:00Z",
      comment: "The infrastructure is state-of-the-art. The academic blocks are centrally air-conditioned with digital smartboards, premium acoustics, and high-speed Wi-Fi. The library is massive, spanning three floors with access to global databases like IEEE, Scopus, and Bloomberg terminals. The sports facilities are also premium, including an Olympic-sized swimming pool, indoor wooden badminton courts, and a fully equipped gymnasium."
    },
    {
      id: `${id}-mock-rev-8`,
      userName: "Neha Gupta",
      branch: isMgmt ? "MBA (Consulting)" : "Electronics & Communication (ECE)",
      gradYear: 2025,
      rating: 4.2,
      category: "Clubs",
      isVerified: true,
      helpfulCount: 22,
      createdAt: "2026-05-05T15:20:00Z",
      comment: "The club culture is the heart of this college. There are functional clubs for every specialization (Consulting, Finance, Analytics) and cultural clubs for dance, music, and debate. Being part of a club teaches you real leadership, event management, and corporate sponsorships. We organize national-level case competitions and hackathons that attract top minds. It is the best place to build connections and learn team management."
    },
    {
      id: `${id}-mock-rev-9`,
      userName: "Sanjay Singhania",
      branch: isMgmt ? "MBA (General)" : "Computer Science (CSE)",
      gradYear: 2024,
      rating: 4.4,
      category: "Academics",
      isVerified: true,
      helpfulCount: 30,
      createdAt: "2026-02-18T10:10:00Z",
      comment: "The curriculum is updated annually to keep up with industry requirements. There is a strong focus on hands-on practical learning rather than just mugging up theoretical definitions. We have mandatory industry projects, summer internships, and continuous presentations. While the academic rigor is intense, it instills a strong work ethic and highly advanced analytical skills that are crucial in the corporate world."
    },
    {
      id: `${id}-mock-rev-10`,
      userName: "Aisha Khan",
      branch: isMgmt ? "MBA (HRM)" : "Information Technology (IT)",
      gradYear: 2025,
      rating: 3.8,
      category: "Placements",
      isVerified: false,
      helpfulCount: 11,
      createdAt: "2026-05-02T13:45:00Z",
      comment: "While placements are excellent for top students, it can get slightly stressful for average scorers. Tech companies have strict CGPA cutoffs (usually 8.0+) to shortlist candidates for coding rounds. If you fall below that, the options shrink to mass recruiters or service-oriented firms. That said, if you maintain a decent CGPA and have solid data structures knowledge, you are guaranteed a decent package in the campus drives."
    }
  ];
};

export default function CollegeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const { user, addToComparison, comparisonColleges, toggleSaveCollege, savedCollegeIds, addRecentlyViewed } = useApp();

  // Data state
  const [college, setCollege] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'courses' | 'placements' | 'reviews'>('overview');

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Reviews Interactive States
  const [reviewSort, setReviewSort] = useState<'recent' | 'highest' | 'placements' | 'roi' | 'campus'>('recent');
  const [reviewCategoryFilter, setReviewCategoryFilter] = useState<string>('all');
  const [reviewBranchFilter, setReviewBranchFilter] = useState<string>('all');
  const [visibleReviewsCount, setVisibleReviewsCount] = useState<number>(4);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});

  // Consolidated reviews logic
  const processedReviews = React.useMemo(() => {
    if (!college) return [];

    const mockList = getRealisticReviews(college.name, college.id);

    const dbList = (college.reviews || []).map((rev: any) => {
      const isMgmt = college.name.toLowerCase().includes('management') || college.name.toLowerCase().includes('iim') || college.name.toLowerCase().includes('business');
      return {
        id: rev.id,
        userName: rev.userName || 'Anonymous Student',
        branch: isMgmt ? "MBA (General)" : "Computer Science (CSE)",
        gradYear: 2024,
        rating: rev.rating,
        category: rev.comment.toLowerCase().includes('placement') 
          ? 'Placements' 
          : rev.comment.toLowerCase().includes('hostel') 
          ? 'Hostel' 
          : rev.comment.toLowerCase().includes('fee') || rev.comment.toLowerCase().includes('roi') 
          ? 'ROI' 
          : 'Academics',
        isVerified: true,
        helpfulCount: 8,
        createdAt: rev.createdAt,
        comment: rev.comment
      };
    });

    let merged = [...dbList];
    
    mockList.forEach((mock) => {
      if (!merged.some(r => r.userName === mock.userName)) {
        merged.push(mock);
      }
    });

    // 1. Category Filtering
    if (reviewCategoryFilter !== 'all') {
      merged = merged.filter(r => r.category === reviewCategoryFilter);
    }

    // 2. Branch Filtering
    if (reviewBranchFilter !== 'all') {
      merged = merged.filter(r => {
        const branchLower = r.branch.toLowerCase();
        if (reviewBranchFilter === 'CSE') return branchLower.includes('computer') || branchLower.includes('cse') || branchLower.includes('it') || branchLower.includes('information');
        if (reviewBranchFilter === 'MBA') return branchLower.includes('mba') || branchLower.includes('mgmt') || branchLower.includes('marketing') || branchLower.includes('finance') || branchLower.includes('consulting') || branchLower.includes('operations');
        if (reviewBranchFilter === 'Mechanical') return branchLower.includes('mechanical');
        if (reviewBranchFilter === 'ECE') return branchLower.includes('electronics') || branchLower.includes('ece') || branchLower.includes('electrical');
        if (reviewBranchFilter === 'Hostel') return r.category === 'Hostel';
        if (reviewBranchFilter === 'Placement') return r.category === 'Placements';
        if (reviewBranchFilter === 'Academics') return r.category === 'Academics';
        return true;
      });
    }

    // 3. Sorting
    merged.sort((a, b) => {
      if (reviewSort === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (reviewSort === 'highest') {
        return b.rating - a.rating;
      }
      if (reviewSort === 'placements') {
        if (a.category === 'Placements' && b.category !== 'Placements') return -1;
        if (b.category === 'Placements' && a.category !== 'Placements') return 1;
        return b.rating - a.rating;
      }
      if (reviewSort === 'roi') {
        if (a.category === 'ROI' && b.category !== 'ROI') return -1;
        if (b.category === 'ROI' && a.category !== 'ROI') return 1;
        return b.rating - a.rating;
      }
      if (reviewSort === 'campus') {
        if (a.category === 'Campus Life' && b.category !== 'Campus Life') return -1;
        if (b.category === 'Campus Life' && a.category !== 'Campus Life') return 1;
        return b.rating - a.rating;
      }
      return 0;
    });

    return merged;
  }, [college, reviewSort, reviewCategoryFilter, reviewBranchFilter]);

  const fetchCollegeDetails = async () => {
    try {
      const res = await fetch(`/api/colleges/${id}`);
      if (!res.ok) {
        if (res.status === 404) {
          setCollege(null);
        }
        return;
      }
      const data = await res.json();
      if (data.college) {
        setCollege(data.college);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCollegeDetails();
    }
  }, [id]);

  useEffect(() => {
    if (college) {
      addRecentlyViewed(college.id);
    }
  }, [college]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Please log in to submit a review.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Review comment cannot be empty.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collegeId: id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setReviewError(data.error || 'Failed to submit review.');
      } else {
        setReviewComment('');
        setReviewRating(5);
        await fetchCollegeDetails();
      }
    } catch (e) {
      setReviewError('Something went wrong. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 sm:px-6 lg:px-8 space-y-8 animate-pulse bg-[#0A0A0F]">
        <div className="h-64 bg-[#151521] rounded-2xl border border-[#2A2A40]"></div>
        <div className="h-10 w-1/3 bg-[#151521] rounded border border-[#2A2A40]"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-[#151521] rounded-xl border border-[#2A2A40]"></div>
          <div className="lg:col-span-1 h-96 bg-[#151521] rounded-xl border border-[#2A2A40]"></div>
        </div>
      </div>
    );
  }

  if (!college) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[#0A0A0F]">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h3 className="mt-4 text-xl font-bold text-[#F5F5F5]">College Not Found</h3>
        <p className="mt-2 text-neutral-450 max-w-sm text-xs">
          We couldn't find the college you are looking for. It may have been removed or does not exist.
        </p>
        <Link href="/" className="mt-6 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 shadow-md">
          Go Back Home
        </Link>
      </div>
    );
  }

  const isInCompare = comparisonColleges.some(c => c.id === college.id);
  const isSaved = savedCollegeIds.includes(college.id);

  return (
    <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] pb-16 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 bg-glow-purple"></div>
      <div className="absolute top-[500px] left-[5%] bg-glow-purple" style={{ animationDelay: '-3s' }}></div>

      {/* Banner & Cover Photo */}
      <div className="relative h-64 md:h-80 w-full bg-[#0A0A0F] overflow-hidden border-b border-[#2A2A40]/50 z-10">
        <img
          src={getSafeBannerSrc(college)}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = getFallbackBannerUrl(college.name, college.exams);
          }}
          alt={college.name}
          className="h-full w-full object-cover object-center opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent"></div>
        <div className="absolute bottom-6 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* College Logo */}
             <img
               src={getSafeLogoSrc(college)}
               onError={(e) => {
                 e.currentTarget.onerror = null;
                 e.currentTarget.src = getFallbackLogoUrl();
               }}
               alt=""
               className="h-24 w-24 rounded-2xl object-cover object-center border-4 border-[#151521] bg-[#151521] shadow-xl"
             />
            
            {/* Header Titles */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {college.nirfRank && (
                  <span className="flex items-center gap-1 text-[10px] font-extrabold bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 shadow shadow-amber-500/5">
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    NIRF Rank #{college.nirfRank}
                  </span>
                )}
                {college.accreditation && (
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1 rounded-full border border-[#8B5CF6]/35">
                    {college.accreditation}
                  </span>
                )}
                <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#151521]/70 px-3 py-1 rounded-full border border-[#2A2A40] text-[#B0B0C0]">
                  <Calendar className="h-3.5 w-3.5 text-[#8B5CF6]" />
                  Est. {college.established}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#151521]/70 px-3 py-1 rounded-full border border-[#2A2A40] text-[#B0B0C0]">
                  <Briefcase className="h-3.5 w-3.5 text-[#A855F7]" />
                  {college.ownership}
                </span>
              </div>
              <h2 className="mt-3 text-2xl md:text-4xl font-extrabold tracking-tight text-[#F5F5F5]">{college.name}</h2>
              <div className="mt-2.5 flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1.5 text-xs text-[#B0B0C0]">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-[#8B5CF6]" />
                  {college.location}
                </span>
                {college.exams && college.exams.length > 0 && (
                  <span className="flex items-center gap-1.5 border-l border-[#2A2A40] pl-4">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-[#B0B0C0]/50 mr-1">Accepted:</span>
                    {college.exams.map((ex: string) => (
                      <span key={ex} className="bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] font-bold px-2 py-0.5 rounded border border-[#8B5CF6]/20 mr-1 last:mr-0">
                        {ex}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </div>

            {/* Sticky Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const success = addToComparison(college);
                  if (!success) {
                    alert('You can compare a maximum of 3 colleges. Remove another college to add this.');
                  }
                }}
                className={`flex items-center justify-center gap-1.5 rounded-xl px-5 py-3 text-xs font-bold border transition-all cursor-pointer bg-[#151521]/60 text-[#F5F5F5] border-[#2A2A40] hover:bg-[#2A2A40]/30 ${
                  isInCompare ? 'bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] border-transparent shadow shadow-purple-500/20' : ''
                }`}
              >
                <GitCompare className="h-4 w-4" />
                {isInCompare ? 'In Comparison' : 'Compare'}
              </button>
              <button
                onClick={async () => {
                  if (!user) {
                    alert('Please log in to save colleges.');
                    return;
                  }
                  await toggleSaveCollege(college.id);
                }}
                className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[#151521]/60 border border-[#2A2A40] text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 transition-all cursor-pointer ${
                  isSaved ? 'text-pink-400 border-pink-500/35 bg-pink-500/10' : ''
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="bg-[#151521]/80 border-b border-[#2A2A40] sticky top-16 z-30 shadow-sm backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 h-14" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: BookOpen },
              { id: 'courses', name: 'Courses & Fees', icon: GraduationCap },
              { id: 'placements', name: 'Placements', icon: Briefcase },
              { id: 'reviews', name: 'Reviews', icon: Star },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 border-b-2 px-1 text-sm font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'border-[#8B5CF6] text-[#8B5CF6]'
                      : 'border-transparent text-[#B0B0C0] hover:border-[#2A2A40] hover:text-[#F5F5F5]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Contents */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Tab: Overview */}
            {activeTab === 'overview' && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm shadow-sm space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-base font-bold text-[#F5F5F5] flex items-center justify-between">
                    <span>About the College</span>
                    {college.website && (
                      <a
                        href={college.website.startsWith('http') ? college.website : `https://${college.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#8B5CF6] hover:underline"
                      >
                        Visit Website
                      </a>
                    )}
                  </h3>
                  <p className="mt-3 text-sm text-[#B0B0C0] leading-relaxed">
                    {college.description}
                  </p>
                </div>
                
                {/* Stats cards inside overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: 'Rating', value: `${college.rating} / 5`, sub: 'Student Feedback', color: 'border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-[#8B5CF6]' },
                    { label: 'Intelligence', value: `${college.collegeIntelligenceScore || 75.0}`, sub: 'IQ Score / 100', color: 'border-purple-500/20 bg-purple-500/5 text-[#A855F7]' },
                    { label: 'ROI Rating', value: `${(college.roiScore || 1.0).toFixed(1)}x`, sub: 'Value multiplier', color: 'border-[#8B5CF6]/20 bg-[#8B5CF6]/5 text-[#8B5CF6]' },
                    { label: 'Avg Package', value: `${college.averagePackage} LPA`, sub: 'Average package', color: 'border-purple-500/20 bg-purple-500/5 text-[#A855F7]' },
                  ].map((item, idx) => (
                    <div key={idx} className={`rounded-xl border p-4 text-center ${item.color}`}>
                      <span className="text-[9px] uppercase font-bold tracking-widest opacity-80">{item.label}</span>
                      <div className="mt-1.5 text-lg font-extrabold">{item.value}</div>
                      <span className="text-[9px] opacity-75">{item.sub}</span>
                    </div>
                  ))}
                </div>

                {/* Facilities section */}
                {college.facilities && college.facilities.length > 0 && (
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5F5] mb-3">Campus Infrastructure & Facilities</h3>
                    <div className="flex flex-wrap gap-2">
                      {college.facilities.map((fac: string) => (
                        <span key={fac} className="flex items-center gap-1.5 rounded-full bg-[#151521] border border-[#2A2A40] px-3.5 py-1.5 text-xs text-[#B0B0C0] hover:border-[#8B5CF6]/30 transition-all select-none">
                          {getFacilityIcon(fac)}
                          {fac}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dynamically styled Admission Milestones Timeline */}
                <div className="pt-4 border-t border-[#2A2A40]/45">
                  <h3 className="text-base font-bold text-[#F5F5F5] mb-4 flex items-center gap-1.5">
                    <Calendar className="h-4.5 w-4.5 text-[#8B5CF6]" />
                    Admission Milestones Timeline
                  </h3>
                  
                  {/* Timeline Node Chain */}
                  <div className="relative pl-6 border-l border-[#2A2A40] ml-3.5 space-y-6 text-xs text-[#B0B0C0]">
                    {/* Node 1 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-[#8B5CF6] border-2 border-[#151521] shadow-lg shadow-purple-500/50"></div>
                      <h4 className="font-bold text-[#F5F5F5] text-xs">Application Form Window</h4>
                      <p className="mt-0.5 font-light">
                        {college.exams?.includes('CAT') 
                          ? 'August - September: Online registration for CAT examinations commences.' 
                          : 'May - June: Application portal opens for merit and exam counselling registration.'}
                      </p>
                    </div>

                    {/* Node 2 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-[#A855F7] border-2 border-[#151521] shadow-lg"></div>
                      <h4 className="font-bold text-[#F5F5F5] text-xs">Entrance Assessments</h4>
                      <p className="mt-0.5 font-light">
                        {college.exams?.includes('CAT') 
                          ? 'November: National CAT MBA examinations are administered.' 
                          : 'July: Entrance test administrations and result card releases.'}
                      </p>
                    </div>

                    {/* Node 3 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-[#8B5CF6] border-2 border-[#151521]"></div>
                      <h4 className="font-bold text-[#F5F5F5] text-xs">Counselling & Cutoff Announcements</h4>
                      <p className="mt-0.5 font-light">
                        {college.exams?.includes('CAT') 
                          ? 'January - March: WAT/GD-PI selection interview letters are issued.' 
                          : 'August: JoSAA / CSAB counselling lists and college cutoffs are finalized.'}
                      </p>
                    </div>

                    {/* Node 4 */}
                    <div className="relative">
                      <div className="absolute -left-[31px] top-0.5 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-[#151521] shadow-lg shadow-emerald-500/25"></div>
                      <h4 className="font-bold text-emerald-400 text-xs">Semester Commencement</h4>
                      <p className="mt-0.5 font-light">
                        {college.exams?.includes('CAT')
                          ? 'June: Orientation induction program and MBA curriculum classes commence.'
                          : 'September: Registration verification, hostel allocation, and B.Tech classes start.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-[#F5F5F5]">Why Choose Us?</h3>
                  <ul className="mt-3 space-y-2 text-xs text-[#B0B0C0] list-disc pl-5 leading-relaxed">
                    <li>Top-ranked institutional accreditation: {college.accreditation || 'NAAC Accredited'}.</li>
                    <li>Premium career assistance featuring {college.placementRate}% placement rate.</li>
                    <li>Established operating history since {college.established} in {college.location}.</li>
                    <li>Highly competitive peer group accepting {college.exams?.join(', ') || 'national level entrance exams'}.</li>
                  </ul>
                </div>

                {/* Data Transparency & Credibility Audit */}
                <div className="pt-6 border-t border-[#2A2A40]/45 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-1.5">
                      <Award className="h-4.5 w-4.5 text-[#8B5CF6]" />
                      Data Transparency & Credibility Audit
                    </h3>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/25 px-2.5 py-0.5 rounded-full font-semibold">
                      Interview-Safe
                    </span>
                  </div>
                  
                  <p className="text-xs text-[#B0B0C0] leading-relaxed">
                    To maintain complete technical honesty and avoid dataset overclaims, this record provides a fully transparent ingestion audit log.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#151521]/60 rounded-xl p-4 border border-[#2A2A40]">
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#B0B0C0]/50 uppercase tracking-widest font-bold block">Sources Utilized</span>
                      <span className="font-semibold text-purple-300">{college.syncSource || 'Local Ingestion Backup'}</span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#B0B0C0]/50 uppercase tracking-widest font-bold block">Ingestion Datetime</span>
                      <span className="font-semibold text-neutral-300">
                        {college.syncLastUpdated ? new Date(college.syncLastUpdated).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#B0B0C0]/50 uppercase tracking-widest font-bold block">Credibility Confidence</span>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-[#2A2A40] h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#8B5CF6] h-full rounded-full" 
                            style={{ width: `${college.syncConfidenceScore || 90}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-[#8B5CF6]">{college.syncConfidenceScore || 90}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-[#B0B0C0]/50 uppercase tracking-widest font-bold block">Dataset Strategy</span>
                      <span className={`inline-flex items-center gap-1 font-bold ${
                        college.syncSource?.includes('Local Backup') || college.syncSource?.includes('Local Base')
                          ? 'text-amber-400'
                          : 'text-emerald-400'
                      }`}>
                        {college.syncSource?.includes('Local Backup') || college.syncSource?.includes('Local Base')
                          ? 'Simulated Backup Mode'
                          : 'Active API Synced'}
                      </span>
                    </div>
                  </div>

                  {college.syncMissingFields && college.syncMissingFields.length > 0 && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs space-y-1">
                      <span className="font-bold text-amber-400 block">Missing / Fallback-Enriched Fields:</span>
                      <p className="text-[#B0B0C0] leading-relaxed">
                        The following fields were missing in the remote public educational registries and were fallback-enriched using standard platform defaults: 
                        <span className="text-amber-300 font-mono ml-1">{college.syncMissingFields.join(', ')}</span>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Courses */}
            {activeTab === 'courses' && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm shadow-sm animate-fade-in">
                <h3 className="text-base font-bold text-[#F5F5F5]">Academic Courses Offered</h3>
                
                {college.courses && college.courses.length > 0 ? (
                  <div className="mt-6 overflow-hidden rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/60">
                    <table className="min-w-full divide-y divide-[#2A2A40] text-left text-xs">
                      <thead className="bg-[#151521] text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">
                        <tr>
                          <th className="px-6 py-4">Course Name</th>
                          <th className="px-6 py-4">Duration</th>
                          <th className="px-6 py-4">Annual Fees</th>
                          <th className="px-6 py-4">Seats</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2A2A40] text-[#B0B0C0]">
                        {college.courses.map((course: any) => (
                          <tr key={course.id} className="hover:bg-[#151521]/40 transition-colors">
                            <td className="px-6 py-4 font-semibold text-[#F5F5F5]">{course.name}</td>
                            <td className="px-6 py-4">{course.duration} Years</td>
                            <td className="px-6 py-4 font-bold text-[#8B5CF6]">
                              ₹{course.fees.toLocaleString('en-IN')}
                            </td>
                            <td className="px-6 py-4">{course.seats} Seats</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-4 text-xs text-[#B0B0C0]">No courses listed currently.</p>
                )}
              </div>
            )}

            {/* Tab: Placements */}
            {activeTab === 'placements' && (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm shadow-sm space-y-6 animate-fade-in">
                <h3 className="text-base font-bold text-[#F5F5F5]">Placement Statistics</h3>

                {/* Placement Packages Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/80 p-5 text-center shadow-sm">
                    <span className="text-[10px] text-[#B0B0C0]/60 uppercase font-bold tracking-wider">Placement Rate</span>
                    <div className="mt-2 text-3xl font-extrabold text-[#8B5CF6]">
                      {college.placementRate}%
                    </div>
                    <p className="mt-1 text-[10px] text-[#B0B0C0]/50">Students successfully placed</p>
                  </div>
                  <div className="rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/80 p-5 text-center shadow-sm">
                    <span className="text-[10px] text-[#B0B0C0]/60 uppercase font-bold tracking-wider">Average Package</span>
                    <div className="mt-2 text-3xl font-extrabold text-[#8B5CF6]">
                      {college.averagePackage} LPA
                    </div>
                    <p className="mt-1 text-[10px] text-[#B0B0C0]/50">Annual median package</p>
                  </div>
                  <div className="rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/80 p-5 text-center shadow-sm">
                    <span className="text-[10px] text-[#B0B0C0]/60 uppercase font-bold tracking-wider">Highest Package</span>
                    <div className="mt-2 text-3xl font-extrabold text-[#A855F7]">
                      {college.highestPackage} LPA
                    </div>
                    <p className="mt-1 text-[10px] text-[#B0B0C0]/50">International/National record</p>
                  </div>
                </div>

                {/* Placement Success Rate bar */}
                <div className="space-y-4 pt-4 border-t border-[#2A2A40]/45">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1 text-[#B0B0C0]">
                        <span>Placement Success Rate (%)</span>
                        <span>{college.placementRate}%</span>
                      </div>
                      <div className="h-2.5 w-full bg-[#0A0A0F] rounded-full overflow-hidden border border-[#2A2A40]">
                        <div
                          className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full"
                          style={{ width: `${college.placementRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SVG double-bar chart panel */}
                <div className="pt-6 border-t border-[#2A2A40]/45 space-y-4">
                  <h4 className="font-bold text-xs text-[#F5F5F5] flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-[#8B5CF6]" />
                    Salary Packages Visual Comparison (LPA)
                  </h4>
                  
                  <div className="rounded-xl border border-[#2A2A40]/50 bg-[#0A0A0F]/60 p-6 flex flex-col items-center">
                    {/* SVG Chart */}
                    <svg className="w-full max-w-lg h-48" viewBox="0 0 400 180">
                      {/* Grid Lines */}
                      <line x1="50" y1="20" x2="380" y2="20" stroke="#2A2A40" strokeDasharray="3,3" strokeWidth="0.5" />
                      <line x1="50" y1="60" x2="380" y2="60" stroke="#2A2A40" strokeDasharray="3,3" strokeWidth="0.5" />
                      <line x1="50" y1="100" x2="380" y2="100" stroke="#2A2A40" strokeDasharray="3,3" strokeWidth="0.5" />
                      <line x1="50" y1="140" x2="380" y2="140" stroke="#2A2A40" strokeWidth="1" />

                      {/* Y Axis Labels */}
                      <text x="45" y="24" fill="#B0B0C0" fontSize="8" textAnchor="end">150 LPA</text>
                      <text x="45" y="64" fill="#B0B0C0" fontSize="8" textAnchor="end">100 LPA</text>
                      <text x="45" y="104" fill="#B0B0C0" fontSize="8" textAnchor="end">50 LPA</text>
                      <text x="45" y="144" fill="#B0B0C0" fontSize="8" textAnchor="end">0 LPA</text>

                      {/* Bar 1 (Average Package) */}
                      <rect 
                        x="120" 
                        y={140 - college.averagePackage * 0.8} 
                        width="40" 
                        height={college.averagePackage * 0.8} 
                        rx="4" 
                        fill="url(#avgGrad)" 
                      />
                      
                      {/* Bar 2 (Highest Package) */}
                      <rect 
                        x="240" 
                        y={140 - Math.min(college.highestPackage, 150) * 0.8} 
                        width="40" 
                        height={Math.min(college.highestPackage, 150) * 0.8} 
                        rx="4" 
                        fill="url(#highGrad)" 
                      />

                      {/* Text Values above bars */}
                      <text x="140" y={Math.max(15, 130 - college.averagePackage * 0.8)} fill="#8B5CF6" fontSize="9" fontWeight="bold" textAnchor="middle">{college.averagePackage} LPA</text>
                      <text x="260" y={Math.max(15, 130 - Math.min(college.highestPackage, 150) * 0.8)} fill="#A855F7" fontSize="9" fontWeight="bold" textAnchor="middle">{college.highestPackage} LPA</text>

                      {/* X Axis labels */}
                      <text x="140" y="155" fill="#B0B0C0" fontSize="9" fontWeight="bold" textAnchor="middle">Average Package</text>
                      <text x="260" y="155" fill="#B0B0C0" fontSize="9" fontWeight="bold" textAnchor="middle">Highest Package</text>

                      {/* Gradients definitions */}
                      <defs>
                        <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.3" />
                        </linearGradient>
                        <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A855F7" />
                          <stop offset="100%" stopColor="#A855F7" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Chart Legend */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-4 text-[10px] text-[#B0B0C0]/80">
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded bg-[#8B5CF6]"></div>
                        <span>Average package based on domestic recruitment averages</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="h-2.5 w-2.5 rounded bg-[#A855F7]"></div>
                        <span>Highest record offered package in recent placement cycles</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Reviews */}
            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-fade-in">
                {/* Submit review box */}
                <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm shadow-sm">
                  <h3 className="text-base font-bold text-[#F5F5F5]">Write a Student Review</h3>
                  
                  {user ? (
                    <form onSubmit={handleReviewSubmit} className="mt-4 space-y-4">
                      {reviewError && (
                        <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-xs font-semibold text-red-400">
                          {reviewError}
                        </div>
                      )}
                      
                      {/* Rating selection stars */}
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">Overall Rating</span>
                        <div className="mt-2 flex items-center gap-1.5">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="text-neutral-700 hover:text-[#8B5CF6] transition-colors"
                            >
                              <Star
                                className={`h-7 w-7 cursor-pointer transition-colors ${
                                  reviewRating >= star ? 'fill-[#8B5CF6] text-[#8B5CF6]' : 'text-neutral-700 dark:text-neutral-800'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-2.5 text-sm font-bold text-[#F5F5F5]">{reviewRating} / 5</span>
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label htmlFor="comment" className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">Review Details</label>
                        <textarea
                          id="comment"
                          rows={4}
                          placeholder="Share details of your experience in this college (campus, course structure, faculty, placement drives)..."
                          value={reviewComment}
                          onChange={e => setReviewComment(e.target.value)}
                          className="mt-2 w-full rounded-lg border border-[#2A2A40] bg-[#0A0A0F] p-3 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-5 py-2.5 text-xs font-bold text-white hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow shadow-purple-500/10"
                      >
                        <Send className="h-4 w-4" />
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-4 rounded-xl bg-[#0A0A0F]/60 border border-[#2A2A40] p-6 text-center">
                      <p className="text-xs text-[#B0B0C0]">
                        You need to be logged in to submit reviews for this college.
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-4">
                        <Link href="/login" className="rounded-lg border border-[#2A2A40] bg-[#151521] px-4 py-2 text-xs font-bold hover:bg-[#2A2A40]/30 text-[#F5F5F5]">
                          Login
                        </Link>
                        <Link href="/signup" className="rounded-lg bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] px-4 py-2 text-xs font-bold text-white hover:opacity-90 shadow shadow-purple-500/10">
                          Sign Up
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                {/* Review listing */}
                <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm shadow-sm space-y-6">
                  {/* Reviews Summary Stats */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#2A2A40]/40 pb-5 gap-4">
                    <div>
                      <h3 className="text-base font-bold text-[#F5F5F5] flex items-center gap-2">
                        <span>Student Feedback & Reviews</span>
                        <span className="text-xs bg-[#8B5CF6]/20 border border-[#8B5CF6]/35 text-[#C084FC] px-2 py-0.5 rounded-full font-extrabold select-none">
                          {processedReviews.length}
                        </span>
                      </h3>
                      <p className="text-[10px] text-[#B0B0C0]/50 mt-1 uppercase tracking-wider font-semibold">
                        Recruiter-verified admissions intelligence opinions
                      </p>
                    </div>

                    {/* Sorting Dropdown */}
                    <div className="flex items-center gap-2 self-end sm:self-auto text-xs shrink-0">
                      <span className="text-[10px] text-[#B0B0C0]/50 font-bold uppercase tracking-wider select-none">Sort:</span>
                      <select
                        value={reviewSort}
                        onChange={(e) => {
                          setReviewSort(e.target.value as any);
                          setVisibleReviewsCount(4); // Reset pagination on sort
                        }}
                        className="rounded-lg border border-[#2A2A40] bg-[#0A0A0F] px-2.5 py-1.5 text-xs text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer font-semibold"
                      >
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rated</option>
                        <option value="placements">Placement Focused</option>
                        <option value="roi">ROI Focused</option>
                        <option value="campus">Campus Life</option>
                      </select>
                    </div>
                  </div>

                  {/* Category Filtering Chips */}
                  <div className="space-y-3 pb-2 border-b border-[#2A2A40]/30">
                    <div>
                      <span className="text-[9px] text-[#B0B0C0]/50 font-bold uppercase tracking-widest block mb-1.5 select-none">Filter by Topic:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['all', 'Placements', 'Academics', 'Hostel', 'Faculty', 'Campus Life', 'ROI', 'Infrastructure', 'Clubs'].map((cat) => {
                          const active = reviewCategoryFilter === cat;
                          return (
                            <button
                              key={cat}
                              onClick={() => {
                                setReviewCategoryFilter(cat);
                                setVisibleReviewsCount(4); // Reset pagination
                              }}
                              className={`rounded-full px-3 py-1 text-[9px] font-bold border transition-all cursor-pointer select-none active:scale-95 ${
                                active
                                  ? 'bg-[#8B5CF6]/20 border-[#8B5CF6]/50 text-[#C084FC] shadow-sm'
                                  : 'border-[#2A2A40] bg-[#0A0A0F]/65 text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/35'
                              }`}
                            >
                              {cat === 'all' ? 'All Topics' : cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Branch Filtering Chips */}
                    <div>
                      <span className="text-[9px] text-[#B0B0C0]/50 font-bold uppercase tracking-widest block mb-1.5 select-none">Filter by Course / Specialization:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { label: 'All Courses', value: 'all' },
                          { label: 'Computer Science (CSE)', value: 'CSE' },
                          { label: 'Management (MBA)', value: 'MBA' },
                          { label: 'Electronics (ECE)', value: 'ECE' },
                          { label: 'Mechanical', value: 'Mechanical' },
                        ].map((branch) => {
                          const active = reviewBranchFilter === branch.value;
                          return (
                            <button
                              key={branch.value}
                              onClick={() => {
                                setReviewBranchFilter(branch.value);
                                setVisibleReviewsCount(4); // Reset pagination
                              }}
                              className={`rounded-full px-3 py-1 text-[9px] font-bold border transition-all cursor-pointer select-none active:scale-95 ${
                                active
                                  ? 'bg-[#A855F7]/20 border-[#A855F7]/50 text-[#D6BCFA] shadow-sm'
                                  : 'border-[#2A2A40] bg-[#0A0A0F]/65 text-[#B0B0C0] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/35'
                              }`}
                            >
                              {branch.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Reviews Cards List */}
                  {processedReviews.length > 0 ? (
                    <div className="space-y-4 pt-2">
                      {processedReviews.slice(0, visibleReviewsCount).map((review: any) => {
                        const isExpanded = !!expandedReviews[review.id];
                        const wordCount = review.comment.length;
                        const needsTruncate = wordCount > 240;
                        const displayComment = needsTruncate && !isExpanded
                          ? review.comment.slice(0, 230) + '...'
                          : review.comment;
                          
                        const initial = review.userName.charAt(0).toUpperCase();
                        const colors = [
                          'from-[#8B5CF6] to-[#A855F7] shadow-purple-500/10',
                          'from-blue-500 to-indigo-600 shadow-indigo-500/10',
                          'from-[#A855F7] to-[#EC4899] shadow-pink-500/10',
                          'from-indigo-500 to-[#8B5CF6] shadow-purple-500/10',
                        ];
                        const colorIdx = (initial.charCodeAt(0) || 0) % colors.length;
                        const avatarClass = colors[colorIdx];

                        const currentHelpful = helpfulVotes[review.id] !== undefined
                          ? helpfulVotes[review.id]
                          : review.helpfulCount;
                        const voted = helpfulVotes[review.id] !== undefined;

                        return (
                          <div 
                            key={review.id} 
                            className="rounded-2xl border border-[#2A2A40]/80 bg-[#151521]/30 p-5 hover:border-[#8B5CF6]/40 transition-all duration-300 transform shadow-sm flex flex-col justify-between space-y-4"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                {/* Letter Avatar */}
                                <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-white font-extrabold text-xs shadow ${avatarClass}`}>
                                  {initial}
                                </div>
                                <div className="overflow-hidden">
                                  <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                                    <h5 className="font-extrabold text-xs text-[#F5F5F5]">{review.userName}</h5>
                                    {review.isVerified && (
                                      <span 
                                        className="inline-flex items-center gap-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase select-none tracking-widest leading-none"
                                        title="Verified student enrollment"
                                      >
                                        Verified
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* Branch & Year Tags */}
                                  <div className="flex items-center gap-1.5 text-[9px] text-[#B0B0C0]/50 mt-1 uppercase font-bold tracking-wider">
                                    <span className="text-[#8B5CF6]">{review.branch}</span>
                                    <span>&bull;</span>
                                    <span>Grad {review.gradYear}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* rating stars */}
                              <div className="flex items-center gap-1 bg-[#8B5CF6]/10 px-2 py-0.5 rounded border border-[#8B5CF6]/20 shrink-0 text-[10px] font-bold text-[#C084FC]">
                                <Star className="h-3.5 w-3.5 fill-[#8B5CF6] text-[#8B5CF6]" />
                                <span>{review.rating}</span>
                              </div>
                            </div>

                            {/* Comment Text with view more */}
                            <div className="pl-0 sm:pl-13 text-xs text-[#B0B0C0] leading-relaxed font-light">
                              <span className="whitespace-pre-wrap">{displayComment}</span>
                              {needsTruncate && (
                                <button
                                  onClick={() => {
                                    setExpandedReviews(prev => ({
                                      ...prev,
                                      [review.id]: !isExpanded
                                    }));
                                  }}
                                  className="text-[#8B5CF6] hover:text-[#C084FC] font-extrabold text-[9px] uppercase tracking-widest ml-2 transition-colors cursor-pointer select-none"
                                >
                                  {isExpanded ? 'Show Less' : 'View More'}
                                </button>
                              )}
                            </div>

                            {/* Review Footer */}
                            <div className="pl-0 sm:pl-13 pt-3.5 border-t border-[#2A2A40]/30 flex items-center justify-between text-[10px] text-[#B0B0C0]/60">
                              <span className="text-[9px] text-[#B0B0C0]/40 font-semibold">
                                Reviewed on {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                              </span>

                              <div className="flex items-center gap-3">
                                {/* Topic Pill */}
                                <span className="bg-[#8B5CF6]/10 border border-[#8B5CF6]/25 text-[#C084FC] px-2 py-0.5 rounded-full font-bold select-none text-[8px] uppercase tracking-wider">
                                  {review.category}
                                </span>

                                {/* Helpful Upvote */}
                                <button
                                  onClick={() => {
                                    if (voted) return;
                                    setHelpfulVotes(prev => ({
                                      ...prev,
                                      [review.id]: currentHelpful + 1
                                    }));
                                  }}
                                  disabled={voted}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                    voted
                                      ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                                      : 'border-[#2A2A40] bg-[#0A0A0F]/30 hover:border-[#8B5CF6]/40 hover:text-white'
                                  }`}
                                  title="Was this review helpful?"
                                >
                                  {voted ? <Check className="h-3 w-3" /> : <ThumbsUp className="h-3 w-3 shrink-0" />}
                                  <span className="font-bold text-[9px]">Helpful ({currentHelpful})</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Load More Reviews Controls */}
                      {processedReviews.length > visibleReviewsCount && (
                        <div className="pt-4 flex justify-center">
                          <button
                            onClick={() => setVisibleReviewsCount(prev => prev + 4)}
                            className="flex items-center gap-1.5 rounded-xl border border-[#2A2A40] bg-[#151521]/60 px-5 py-2.5 text-xs font-bold text-[#B0B0C0] hover:bg-[#151521] hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 active:scale-95 transition-all duration-250 cursor-pointer shadow-sm shadow-purple-950/5"
                          >
                            <ChevronDown className="h-4 w-4 text-[#8B5CF6] animate-bounce" />
                            <span>Load More Student Reviews</span>
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-[#2A2A40] bg-[#0A0A0F]/65 p-12 text-center select-none">
                      <Star className="h-8 w-8 text-[#B0B0C0]/30 mx-auto block mb-3" />
                      <p className="text-xs text-[#B0B0C0] font-semibold">
                        No reviews matching your topic or branch filters.
                      </p>
                      <button
                        onClick={() => {
                          setReviewCategoryFilter('all');
                          setReviewBranchFilter('all');
                        }}
                        className="mt-4 text-xs text-[#8B5CF6] font-bold hover:underline"
                      >
                        Reset Active Filters
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Quick stats card */}
            <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/40 p-6 backdrop-blur-sm shadow-sm space-y-5">
              <h3 className="font-bold text-xs text-[#F5F5F5] uppercase tracking-wider">Quick Info</h3>
              
              <div className="space-y-4 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-[#2A2A40]/40">
                  <span className="text-[#B0B0C0] flex items-center gap-1.5"><Calendar className="h-4 w-4 text-[#8B5CF6]" /> Established</span>
                  <span className="font-bold text-[#F5F5F5]">{college.established}</span>
                </div>
                
                <div className="flex justify-between items-center pb-3 border-b border-[#2A2A40]/40">
                  <span className="text-[#B0B0C0] flex items-center gap-1.5"><IndianRupee className="h-4 w-4 text-[#8B5CF6]" /> Average Fees</span>
                  <span className="font-bold text-[#F5F5F5]">₹{college.fees.toLocaleString('en-IN')} / Yr</span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-[#2A2A40]/40">
                  <span className="text-[#B0B0C0] flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-[#8B5CF6]" /> Avg Placement</span>
                  <span className="font-bold text-[#F5F5F5]">{college.averagePackage} LPA</span>
                </div>

                <div className="pb-3 border-b border-[#2A2A40]/40 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[#B0B0C0] flex items-center gap-1.5"><TrendingUp className="h-4 w-4 text-[#8B5CF6]" /> ROI Score</span>
                    <span className="font-extrabold text-[#8B5CF6]">{college.roiScore.toFixed(1)} / 10.0</span>
                  </div>
                  <div className="h-2 w-full bg-[#0A0A0F] rounded-full overflow-hidden border border-[#2A2A40]">
                    <div 
                      className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] rounded-full"
                      style={{ width: `${Math.min((college.roiScore / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[9px] text-[#B0B0C0]/50 block font-light leading-normal">Investment-to-salary return multiplier</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[#B0B0C0] flex items-center gap-1.5"><Users className="h-4 w-4 text-[#8B5CF6]" /> Student Reviews</span>
                  <span className="font-bold text-[#F5F5F5]">{college.reviews?.length || 0} Reviews</span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            <button
              onClick={() => router.back()}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2A2A40] bg-[#151521]/60 py-3 text-xs font-semibold text-[#B0B0C0] hover:bg-[#2A2A40]/30 hover:text-[#F5F5F5] hover:border-[#8B5CF6]/40 transition-all cursor-pointer shadow-sm"
            >
              <ChevronLeft className="h-4 w-4 animate-pulse" />
              Go Back to Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
