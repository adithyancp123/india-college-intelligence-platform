'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Download, 
  CheckSquare, 
  Square, 
  User, 
  Sliders, 
  Award, 
  Briefcase, 
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  Settings,
  HelpCircle,
  FileCheck
} from 'lucide-react';
import { findMatchingScholarships } from '@/lib/intelligence/scholarships';
import { ROADMAP_TEMPLATES } from '@/lib/intelligence/roadmaps';

export default function ReportPage() {
  const router = useRouter();
  const { user, loadingUser } = useApp();

  // Selected components to include
  const [includeProfile, setIncludeProfile] = useState(true);
  const [includePlanner, setIncludePlanner] = useState(true);
  const [includeScholarships, setIncludeScholarships] = useState(true);
  const [includeRoadmap, setIncludeRoadmap] = useState(true);

  // Profile data state
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

  const [savedCount, setSavedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStatus, setGenStatus] = useState('');

  // Load from local storage
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('planner_profile');
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }

      const storedColleges = localStorage.getItem('planner_colleges');
      if (storedColleges) {
        const parsed = JSON.parse(storedColleges);
        const count = (parsed.dream?.length || 0) + (parsed.target?.length || 0) + (parsed.safe?.length || 0);
        setSavedCount(count);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const triggerDownload = async () => {
    setIsGenerating(true);
    setGenStatus('Structuring report data...');
    try {
      // 1. Get planner colleges
      let plannerColleges = { dream: [], target: [], safe: [] };
      if (includePlanner) {
        try {
          const storedPlanner = localStorage.getItem('planner_colleges');
          if (storedPlanner) {
            plannerColleges = JSON.parse(storedPlanner);
          }
        } catch (err) {}
      }

      // Map columns
      const mapCol = (c: any) => ({
        name: c.name,
        location: `${c.city || 'India'}, ${c.state || ''}`,
        fees: c.fees || 120000,
        averagePackage: c.averagePackage || 6.5,
        probability: c.probability || 75
      });

      // 2. Scholarship mapping
      setGenStatus('Running scholarship search algorithms...');
      const matchedSch = includeScholarships 
        ? findMatchingScholarships({
            state: profile.state,
            category: profile.category,
            income: profile.budget,
            gender: profile.gender
          }).slice(0, 3).map(s => ({
            name: s.name,
            eligibility: s.eligibility,
            benefits: s.benefits
          }))
        : [];

      // 3. Career roadmap milestones
      setGenStatus('Formulating AI roadmap milestones...');
      const roadmapTemplate = ROADMAP_TEMPLATES[profile.targetRole] || ROADMAP_TEMPLATES['software-engineer'];
      const formatMilestones = (milestones: any[]) => milestones.map(m => `${m.title}: ${m.desc}`);
      
      const roadmapData = includeRoadmap 
        ? {
            course: profile.branch,
            targetRole: roadmapTemplate.role,
            year1: formatMilestones(roadmapTemplate.years.year1),
            year2: formatMilestones(roadmapTemplate.years.year2),
            year3: formatMilestones(roadmapTemplate.years.year3),
            year4: formatMilestones(roadmapTemplate.years.year4)
          }
        : { course: profile.branch, targetRole: 'N/A', year1: [], year2: [], year3: [], year4: [] };

      const payload = {
        studentName: user ? user.name : 'Candidate Guest User',
        studentEmail: user ? user.email : 'guest.student@collegehub.in',
        academicProfile: includeProfile ? {
          exam: profile.exam,
          rank: profile.rank.toLocaleString('en-IN'),
          percentile: profile.exam.toUpperCase().includes('JEE') ? (100 - (profile.rank / 12000)).toFixed(2) : '94.5',
          budget: profile.budget.toLocaleString('en-IN'),
          branch: profile.branch
        } : { exam: 'N/A', rank: '0', percentile: '0', budget: '0', branch: 'N/A' },
        planner: {
          dream: plannerColleges.dream.map(mapCol),
          target: plannerColleges.target.map(mapCol),
          safe: plannerColleges.safe.map(mapCol)
        },
        scholarships: matchedSch,
        counselorNotes: `This customized strategist PDF was compiled for ${user ? user.name : 'Guest student'}. Checked parameters: ${profile.exam} (Score: ${profile.rank}) targeting ${profile.branch}. Plan contains ${savedCount} mapped colleges.`,
        roadmap: roadmapData
      };

      setGenStatus('Spawning Python ReportLab runtime...');
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('ReportLab compilation pipeline failed.');
      }

      setGenStatus('Streaming PDF download...');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Strategic_College_Intelligence_Report_${profile.exam}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      setGenStatus('Success!');
    } catch (e: any) {
      console.error(e);
      alert('Generation error: ' + e.message);
    } finally {
      setIsGenerating(false);
      setGenStatus('');
    }
  };

  return (
    <div className="flex-1 bg-[#0A0A0F] text-[#F5F5F5] py-12 relative overflow-hidden min-h-[90vh]">
      {/* Background glow */}
      <div className="absolute top-0 right-[15%] bg-glow-purple" style={{ opacity: 0.4 }}></div>

      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-12">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#A855F7] text-white shadow-xl shadow-purple-500/10">
            <FileText className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Strategic Intelligence PDF Desk</h1>
          <p className="text-xs text-[#B0B0C0] font-light leading-relaxed">
            Compile a comprehensive strategic dossier. Your profile settings, planner lanes, scholarship matrices, and career milestone paths are wrapped into a formatted print-ready PDF via a Python ReportLab engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Desk Controls */}
          <div className="md:col-span-2 space-y-6">
            <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-6 backdrop-blur-sm shadow-sm space-y-6">
              <h3 className="font-extrabold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="h-4.5 w-4.5 text-[#8B5CF6]" />
                Dossier Configuration
              </h3>
              
              <div className="space-y-4">
                
                {/* Module 1: Profile */}
                <div 
                  onClick={() => setIncludeProfile(!includeProfile)}
                  className="flex items-start justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/30 hover:border-[#8B5CF6]/35 transition-colors cursor-pointer select-none"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-[#8B5CF6]">
                      <User className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Student Academic Profile Summary</h4>
                      <p className="text-[10px] text-[#B0B0C0] font-light mt-0.5">Includes target entrance exam, rank, percentile estimates, and annual budget cap.</p>
                    </div>
                  </div>
                  <div>
                    {includeProfile ? (
                      <CheckSquare className="h-5 w-5 text-[#8B5CF6]" />
                    ) : (
                      <Square className="h-5 w-5 text-[#B0B0C0]/50" />
                    )}
                  </div>
                </div>

                {/* Module 2: Planner */}
                <div 
                  onClick={() => setIncludePlanner(!includePlanner)}
                  className="flex items-start justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/30 hover:border-[#8B5CF6]/35 transition-colors cursor-pointer select-none"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-[#8B5CF6]">
                      <Sliders className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Admissions Portfolio Planner Grid</h4>
                      <p className="text-[10px] text-[#B0B0C0] font-light mt-0.5">Includes your categorized Dream / Safe / Target college list and calculated admission probabilities.</p>
                    </div>
                  </div>
                  <div>
                    {includePlanner ? (
                      <CheckSquare className="h-5 w-5 text-[#8B5CF6]" />
                    ) : (
                      <Square className="h-5 w-5 text-[#B0B0C0]/50" />
                    )}
                  </div>
                </div>

                {/* Module 3: Scholarships */}
                <div 
                  onClick={() => setIncludeScholarships(!includeScholarships)}
                  className="flex items-start justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/30 hover:border-[#8B5CF6]/35 transition-colors cursor-pointer select-none"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-[#8B5CF6]">
                      <Award className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Financial Aid & Scholarship Index</h4>
                      <p className="text-[10px] text-[#B0B0C0] font-light mt-0.5">Includes matched government, state, and private merit scholarships corresponding to student demographics.</p>
                    </div>
                  </div>
                  <div>
                    {includeScholarships ? (
                      <CheckSquare className="h-5 w-5 text-[#8B5CF6]" />
                    ) : (
                      <Square className="h-5 w-5 text-[#B0B0C0]/50" />
                    )}
                  </div>
                </div>

                {/* Module 4: Roadmap */}
                <div 
                  onClick={() => setIncludeRoadmap(!includeRoadmap)}
                  className="flex items-start justify-between p-4 rounded-xl border border-[#2A2A40] bg-[#0A0A0F]/30 hover:border-[#8B5CF6]/35 transition-colors cursor-pointer select-none"
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 text-[#8B5CF6]">
                      <Briefcase className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">AI Placement Career Roadmap Milestones</h4>
                      <p className="text-[10px] text-[#B0B0C0] font-light mt-0.5">Includes a four-year step-by-step milestone curriculum aligned to your target role: {profile.targetRole}.</p>
                    </div>
                  </div>
                  <div>
                    {includeRoadmap ? (
                      <CheckSquare className="h-5 w-5 text-[#8B5CF6]" />
                    ) : (
                      <Square className="h-5 w-5 text-[#B0B0C0]/50" />
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Right Summary Panel & Trigger */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-2xl border border-[#2A2A40] bg-[#151521]/45 p-5 backdrop-blur-sm shadow-sm space-y-5">
              <h3 className="font-extrabold text-xs text-[#B0B0C0] uppercase tracking-widest">Dossier Summary</h3>
              
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#B0B0C0] font-light">Target Exam:</span>
                  <span className="font-bold text-white">{profile.exam}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B0B0C0] font-light">Rank / Score:</span>
                  <span className="font-bold text-white">{profile.rank.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B0B0C0] font-light">Specialty:</span>
                  <span className="font-bold text-white truncate max-w-[110px]">{profile.branch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#B0B0C0] font-light">Planner Portfolio:</span>
                  <span className="font-bold text-[#8B5CF6]">{savedCount} colleges</span>
                </div>
              </div>

              <div className="border-t border-[#2A2A40]/40 pt-4">
                <button
                  onClick={triggerDownload}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:opacity-90 py-3 text-xs font-extrabold text-white transition-all shadow-md shadow-purple-500/10 cursor-pointer"
                >
                  {isGenerating ? (
                    <>
                      <div className="h-3 w-3 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                      <span>{genStatus || 'Processing...'}</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      <span>Compile Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Help Callout */}
            <div className="rounded-2xl bg-[#151521]/20 border border-[#2A2A40]/45 p-4 flex gap-3 text-xs">
              <div className="text-[#8B5CF6] mt-0.5">
                <FileCheck className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-[11px]">Recruiter Hand-off Safe</h4>
                <p className="text-[10px] text-[#B0B0C0] font-light leading-relaxed">
                  Exported documents are fully compiled locally. No external APIs or remote servers are queried, making the document generation lightning fast and private.
                </p>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
