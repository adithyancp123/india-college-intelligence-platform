'use client';

import React, { useState } from 'react';
import { generateRoadmap, CareerRoadmap, Milestone } from '@/lib/intelligence/roadmaps';
import { Sparkles, Calendar, BookOpen, Briefcase, Award, GraduationCap, CheckCircle2, ChevronRight, TrendingUp, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function CareerRoadmapPage() {
  const [college, setCollege] = useState('');
  const [branch, setBranch] = useState('Computer Science & Engineering');
  const [role, setRole] = useState('software-engineer');
  const [gradYear, setGradYear] = useState('2029');
  
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const generated = generateRoadmap(role, branch, college);
      setRoadmap(generated);
      setLoading(false);
    }, 600);
  };

  const getMilestoneBadge = (type: string) => {
    switch (type) {
      case 'Academic':
        return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Academic</span>;
      case 'Skill':
        return <span className="bg-[#8B5CF6]/10 text-purple-400 border border-[#8B5CF6]/25 px-2 py-0.5 rounded text-[10px] font-bold">Skills Expansion</span>;
      case 'Project':
        return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Portfolio Project</span>;
      case 'Internship':
        return <span className="bg-pink-500/10 text-pink-400 border border-pink-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Internship</span>;
      case 'Placement':
        return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-2 py-0.5 rounded text-[10px] font-bold">Placements Ready</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F5F5F5] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow elements */}
      <div className="absolute top-[-10%] right-[-5%] bg-glow-purple"></div>
      <div className="absolute bottom-[-10%] left-[-5%] bg-glow-purple" style={{ animationDelay: '-3s' }}></div>

      <div className="mx-auto max-w-7xl space-y-8 relative z-10 animate-fade-in">
        
        {/* Breadcrumb Header */}
        <div className="border-b border-[#2A2A40]/40 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-purple-500/15 text-purple-400 border border-purple-500/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                AI Career Advisor
              </span>
              <span className="text-[10px] bg-[#151521] text-[#B0B0C0] border border-[#2A2A40] px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                Dynamic Timelines
              </span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[#F5F5F5] flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-[#8B5CF6]" />
              AI Career Roadmap Generator
            </h1>
            <p className="mt-2 text-xs text-[#B0B0C0] max-w-2xl leading-relaxed">
              Design a chronological, year-wise strategic curriculum tailored directly to your college, branch, and target technology role. Exposes portfolio projects, certifications, and expected LPA benchmark payouts.
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
          
          {/* Inputs Section */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-6 space-y-6 backdrop-blur-sm shadow-sm">
              <h3 className="text-sm font-bold text-[#F5F5F5] flex items-center gap-2">
                <GraduationCap className="h-4.5 w-4.5 text-[#8B5CF6]" />
                Roadmap Parameters
              </h3>

              <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">1. Target College Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIT Bombay, BITS Pilani"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">2. Branch / Core Course</label>
                  <select
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="AI & Machine Learning">AI & Machine Learning / Data Science</option>
                    <option value="Electronics & Communication">Electronics & Communication (ECE)</option>
                    <option value="Electrical Engineering">Electrical & Electronics (EEE)</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">3. Target Career Goal</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6] transition-colors cursor-pointer"
                  >
                    <option value="software-engineer">Software Engineer (Web / Systems)</option>
                    <option value="data-scientist">Data Scientist / AI Engineer</option>
                    <option value="product-manager">Product Manager (PM)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[#B0B0C0] font-bold block">4. Target Graduation Year</label>
                  <input
                    type="number"
                    min="2026"
                    max="2032"
                    value={gradYear}
                    onChange={(e) => setGradYear(e.target.value)}
                    className="w-full bg-[#0A0A0F] border border-[#2A2A40] rounded-xl px-4 py-3 text-[#F5F5F5] focus:outline-none focus:border-[#8B5CF6] transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 font-bold py-3.5 text-white shadow shadow-purple-500/10 cursor-pointer flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  {loading ? 'Analyzing Syllabi...' : 'Compile AI Roadmap'}
                </button>
              </form>
            </div>

            {roadmap && (
              <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 space-y-4 backdrop-blur-sm text-xs">
                <h4 className="font-bold text-[#F5F5F5] flex items-center gap-1.5">
                  <TrendingUp className="h-4.5 w-4.5 text-[#8B5CF6]" />
                  Expected Salaries Benchmark (LPA)
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between border-b border-[#2A2A40]/40 pb-2">
                    <span className="text-[#B0B0C0]">Tier-1 Placements:</span>
                    <span className="font-bold text-purple-300">{roadmap.expectedSalaries.tier1}</span>
                  </div>
                  <div className="flex justify-between border-b border-[#2A2A40]/40 pb-2">
                    <span className="text-[#B0B0C0]">Tier-2 Placements:</span>
                    <span className="font-semibold text-purple-300">{roadmap.expectedSalaries.tier2}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#B0B0C0]">Tier-3 Placements:</span>
                    <span className="font-medium text-neutral-350">{roadmap.expectedSalaries.tier3}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Outputs Section */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/20 p-12 text-center flex flex-col items-center justify-center space-y-4 h-96">
                <RefreshCw className="h-10 w-10 text-[#8B5CF6] animate-spin" />
                <p className="text-xs text-[#B0B0C0] tracking-widest uppercase">Consulting AI Curriculum Maps...</p>
              </div>
            ) : roadmap ? (
              <div className="space-y-8">
                
                {/* Year 1 to Year 4 Roadmap Nodes */}
                {[
                  { id: 'year1', title: `Year 1 (Session: ${Number(gradYear) - 4} - ${Number(gradYear) - 3})`, data: roadmap.years.year1 },
                  { id: 'year2', title: `Year 2 (Session: ${Number(gradYear) - 3} - ${Number(gradYear) - 2})`, data: roadmap.years.year2 },
                  { id: 'year3', title: `Year 3 (Session: ${Number(gradYear) - 2} - ${Number(gradYear) - 1})`, data: roadmap.years.year3 },
                  { id: 'year4', title: `Year 4 (Session: ${Number(gradYear) - 1} - ${gradYear})`, data: roadmap.years.year4 }
                ].map((year, idx) => (
                  <div key={year.id} className="relative pl-8 border-l border-[#2A2A40]/60 ml-4 animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    {/* Circle Node indicator */}
                    <div className="absolute -left-[11px] top-1.5 h-5 w-5 rounded-full bg-[#151521] border-4 border-[#8B5CF6] shadow-lg shadow-purple-500/50 flex items-center justify-center">
                      <span className="h-1 w-1 bg-white rounded-full"></span>
                    </div>

                    <div className="space-y-4 mb-8">
                      <h3 className="text-base font-extrabold text-[#F5F5F5]">{year.title}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {year.data.map((milestone: Milestone, mIdx: number) => (
                          <div key={mIdx} className="rounded-xl border border-[#2A2A40] bg-[#151521]/30 p-5 backdrop-blur-sm hover:border-[#8B5CF6]/35 transition-all select-none space-y-3">
                            <div className="flex justify-between items-start gap-2">
                              <h4 className="font-bold text-[#F5F5F5] text-xs">{milestone.title}</h4>
                              {getMilestoneBadge(milestone.milestoneType)}
                            </div>
                            
                            <p className="text-[11px] text-[#B0B0C0] font-light leading-relaxed">{milestone.desc}</p>
                            
                            {milestone.skills.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-widest text-[#B0B0C0]/50 font-bold block">Skills to Learn</span>
                                <div className="flex flex-wrap gap-1">
                                  {milestone.skills.map((s) => (
                                    <span key={s} className="bg-[#8B5CF6]/10 text-[#8B5CF6] text-[9px] px-2 py-0.5 rounded font-bold border border-[#8B5CF6]/15">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {milestone.projects.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-widest text-amber-500/75 font-bold block">Projects to Build</span>
                                <ul className="text-[10px] text-[#B0B0C0] list-disc pl-4 space-y-0.5 font-light">
                                  {milestone.projects.map((p) => <li key={p}>{p}</li>)}
                                </ul>
                              </div>
                            )}

                            {milestone.certifications.length > 0 && (
                              <div className="space-y-1">
                                <span className="text-[9px] uppercase tracking-widest text-emerald-500/75 font-bold block">Certifications</span>
                                <div className="flex flex-wrap gap-1">
                                  {milestone.certifications.map((c) => (
                                    <span key={c} className="bg-emerald-500/10 text-emerald-400 text-[9px] px-2 py-0.5 rounded font-semibold border border-emerald-500/20">
                                      {c}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2A2A40]/80 bg-[#151521]/10 p-12 text-center flex flex-col items-center justify-center space-y-4 h-96 select-none backdrop-blur-md animate-fade-in">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#8B5CF6]">
                  <Sparkles className="h-6 w-6 shrink-0" />
                </div>
                <h3 className="text-base font-extrabold text-[#F5F5F5]">Generate a personalized roadmap to accelerate your career</h3>
                <p className="text-xs text-[#B0B0C0]/85 max-w-sm leading-relaxed font-light">
                  Input your matching college selection and target professional goals to generate custom 4-year timelines listing essential projects, certifications, and expected LPA benchmarks.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
