'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { MapPin, Calendar, IndianRupee, Star, GitCompare, Bookmark, BookOpen, Briefcase, GraduationCap, ChevronLeft, Award, Users, ShieldAlert, Send, Wifi, Home, Dumbbell, Trophy, FlaskConical, Coffee, Tv, TrendingUp } from 'lucide-react';
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
          src={college.bannerUrl}
          alt={college.name}
          className="h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/30 to-transparent"></div>
        <div className="absolute bottom-6 left-0 right-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* College Logo */}
            <img
              src={college.logoUrl}
              alt=""
              className="h-24 w-24 rounded-2xl object-cover border-4 border-[#151521] bg-[#151521] shadow-xl"
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
                  <h3 className="text-base font-bold text-[#F5F5F5]">Student Feedback ({college.reviews?.length || 0})</h3>
                  
                  {college.reviews && college.reviews.length > 0 ? (
                    <div className="divide-y divide-[#2A2A40]/40 space-y-6">
                      {college.reviews.map((review: any) => (
                        <div key={review.id} className="pt-6 first:pt-0 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2A2A40] text-[#F5F5F5] font-bold text-xs">
                                {(review.userName || 'Anonymous').charAt(0)}
                              </div>
                              <div>
                                <h5 className="font-semibold text-xs text-[#F5F5F5]">{review.userName || 'Anonymous'}</h5>
                                <span className="text-[10px] text-[#B0B0C0]/60">
                                  Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {/* Stars */}
                            <div className="flex items-center gap-1.5 rounded bg-[#8B5CF6]/10 px-2 py-0.5 text-xs font-bold text-[#8B5CF6] border border-[#8B5CF6]/20">
                              <Star className="h-3.5 w-3.5 fill-[#8B5CF6] text-[#8B5CF6]" />
                              {review.rating}
                            </div>
                          </div>
                          <p className="text-xs text-[#B0B0C0] leading-relaxed font-light pl-11">
                            {review.comment}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#B0B0C0] text-center py-6">
                      No reviews yet. Be the first to share your experience!
                    </p>
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
