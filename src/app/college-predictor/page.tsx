'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp, College } from '@/context/AppContext';
import { getSafeLogoSrc, getFallbackLogoUrl } from '@/lib/image-mapper';
import { 
  GraduationCap, 
  Sparkles, 
  Sliders, 
  Briefcase, 
  Award, 
  TrendingUp, 
  MapPin, 
  IndianRupee, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  HelpCircle, 
  Check, 
  GitCompare, 
  Bookmark, 
  Search, 
  ChevronDown, 
  X,
  AlertCircle
} from 'lucide-react';

// ==========================================
// Static Configuration & Data Structures
// ==========================================

interface ExamMeta {
  label: string;
  placeholder: string;
  min: number;
  max: number;
  defaultValue: number;
  hint: string;
}

// Generates dynamic ranges, labels, and helper guidelines based on selected pathway
export function getExamInputMeta(examName: string): ExamMeta {
  const nameUpper = examName.toUpperCase();
  
  if (nameUpper.includes('CAT') || nameUpper.includes('XAT') || nameUpper.includes('SNAP') || nameUpper.includes('NMAT') || nameUpper.includes('MAT') || nameUpper.includes('ATMA') || nameUpper.includes('CMAT')) {
    return {
      label: `${examName} Percentile`,
      placeholder: 'Enter Percentile (e.g. 95.8)',
      min: 0,
      max: 100,
      defaultValue: 95,
      hint: 'Enter your total percentile score from 0.0 to 100.0.'
    };
  }
  
  if (nameUpper === 'NEET UG') {
    return {
      label: 'NEET UG Score (out of 720)',
      placeholder: 'Enter NEET UG Score (e.g. 620)',
      min: 0,
      max: 720,
      defaultValue: 550,
      hint: 'Enter your raw score out of 720.'
    };
  }

  if (nameUpper === 'NEET PG') {
    return {
      label: 'NEET PG Score (out of 800)',
      placeholder: 'Enter NEET PG Score (e.g. 580)',
      min: 0,
      max: 800,
      defaultValue: 500,
      hint: 'Enter your cumulative score out of 800.'
    };
  }

  if (nameUpper.startsWith('CUET')) {
    return {
      label: `${examName} Normalized Score`,
      placeholder: 'Enter CUET Score (e.g. 650)',
      min: 0,
      max: 800,
      defaultValue: 600,
      hint: 'Enter your normalized score out of 800.'
    };
  }

  if (nameUpper === 'GATE') {
    return {
      label: 'GATE Score (out of 1000)',
      placeholder: 'Enter GATE Score (e.g. 720)',
      min: 0,
      max: 1000,
      defaultValue: 650,
      hint: 'Enter your normalized GATE score out of 1000.'
    };
  }

  if (nameUpper === 'TNEA') {
    return {
      label: 'TNEA Cutoff Score (out of 200)',
      placeholder: 'Enter TNEA Cutoff (e.g. 185.5)',
      min: 0,
      max: 200,
      defaultValue: 160,
      hint: 'Enter your normalized engineering admission cutoff out of 200.'
    };
  }

  if (nameUpper.includes('CA FOUNDATION') || nameUpper.includes('CMA') || nameUpper.includes('CS EXECUTIVE')) {
    return {
      label: `${examName} Percentage`,
      placeholder: 'Enter Percentage (e.g. 75)',
      min: 0,
      max: 100,
      defaultValue: 70,
      hint: 'Enter your average percentage score (0-100).'
    };
  }

  // Engineering & Architecture Pathways using AIR Rank
  let maxRank = 2000000;
  let defaultRank = 12000;
  if (nameUpper.includes('ADVANCED')) {
    maxRank = 200000;
    defaultRank = 8000;
  } else if (nameUpper.includes('BITSAT')) {
    return {
      label: 'BITSAT Score (out of 450)',
      placeholder: 'Enter BITSAT Score (e.g. 310)',
      min: 0,
      max: 450,
      defaultValue: 280,
      hint: 'Enter your BITSAT cumulative score out of 450.'
    };
  }

  return {
    label: `${examName} All India Rank (AIR)`,
    placeholder: `Enter your ${examName} AIR (e.g. ${defaultRank})`,
    min: 1,
    max: maxRank,
    defaultValue: defaultRank,
    hint: `Enter your overall All India General or Category Rank (1 to ${maxRank.toLocaleString()}).`
  };
}

// 30+ Categorized pathways
const EXAM_CATEGORIES = [
  {
    category: 'Engineering Pathways',
    items: [
      { value: 'JEE Main', label: 'JEE Main (B.Tech - NITs/IIITs/State)' },
      { value: 'JEE Advanced', label: 'JEE Advanced (B.Tech - IITs)' },
      { value: 'BITSAT', label: 'BITSAT (B.Tech - BITS Campuses)' },
      { value: 'VITEEE', label: 'VITEEE (Vellore Institute)' },
      { value: 'SRMJEEE', label: 'SRMJEEE (SRM Universities)' },
      { value: 'COMEDK', label: 'COMEDK UGET (Karnataka Private)' },
      { value: 'WBJEE', label: 'WBJEE (West Bengal Engg)' },
      { value: 'MHT CET', label: 'MHT CET (Maharashtra State)' },
      { value: 'KCET', label: 'KCET (Karnataka State)' },
      { value: 'KEAM', label: 'KEAM (Kerala State)' },
      { value: 'AP EAMCET', label: 'AP EAMCET (Andhra State)' },
      { value: 'TS EAMCET', label: 'TS EAMCET (Telangana State)' },
      { value: 'GUJCET', label: 'GUJCET (Gujarat State)' },
      { value: 'TNEA', label: 'TNEA Cutoff (Tamil Nadu Counseling)' },
      { value: 'GATE', label: 'GATE Score (M.Tech - IITs/NITs)' }
    ]
  },
  {
    category: 'Medical / Health Pathways',
    items: [
      { value: 'NEET UG', label: 'NEET UG (MBBS/BDS/Aayush)' },
      { value: 'NEET PG', label: 'NEET PG (MD/MS Specialist)' }
    ]
  },
  {
    category: 'Management / PG Business',
    items: [
      { value: 'CAT', label: 'CAT (IIMs & Top Business Schools)' },
      { value: 'XAT', label: 'XAT (XLRI & Associate Schools)' },
      { value: 'MAT', label: 'MAT (Management Aptitude Test)' },
      { value: 'CMAT', label: 'CMAT (AICTE PG Management)' },
      { value: 'SNAP', label: 'SNAP (Symbiosis Institutes)' },
      { value: 'NMAT', label: 'NMAT by GMAC (NMIMS & Partner)' },
      { value: 'ATMA', label: 'ATMA (PG Management)' }
    ]
  },
  {
    category: 'Science & Undergrad (CUET)',
    items: [
      { value: 'CUET UG', label: 'CUET UG (Central Universities)' },
      { value: 'CUET PG', label: 'CUET PG (Postgraduate Science/Arts)' }
    ]
  },
  {
    category: 'Law Pathways',
    items: [
      { value: 'CLAT', label: 'CLAT (National Law Universities)' },
      { value: 'AILET', label: 'AILET (NLU Delhi)' }
    ]
  },
  {
    category: 'Design Pathways',
    items: [
      { value: 'NID DAT', label: 'NID DAT (National Inst of Design)' },
      { value: 'UCEED', label: 'UCEED (IIT Design Undergrad)' },
      { value: 'CEED', label: 'CEED (IIT PG Design)' }
    ]
  },
  {
    category: 'Commerce & Professional',
    items: [
      { value: 'CA Foundation', label: 'CA Foundation (Chartered Accountancy)' },
      { value: 'CMA', label: 'CMA (Cost & Management Accounting)' },
      { value: 'CS Executive', label: 'CS Executive (Company Secretary)' }
    ]
  }
];

// Complete Alphabetical list of States & UTs (36 items)
const INDIAN_STATES_AND_UTS = [
  { value: 'All', label: 'All States & Union Territories' },
  { value: 'Andaman & Nicobar Islands', label: 'Andaman & Nicobar Islands' },
  { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
  { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
  { value: 'Assam', label: 'Assam' },
  { value: 'Bihar', label: 'Bihar' },
  { value: 'Chandigarh', label: 'Chandigarh' },
  { value: 'Chhattisgarh', label: 'Chhattisgarh' },
  { value: 'Dadra & Nagar Haveli and Daman & Diu', label: 'Dadra & Nagar Haveli and Daman & Diu' },
  { value: 'Delhi', label: 'Delhi' },
  { value: 'Goa', label: 'Goa' },
  { value: 'Gujarat', label: 'Gujarat' },
  { value: 'Haryana', label: 'Haryana' },
  { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  { value: 'Jammu & Kashmir', label: 'Jammu & Kashmir' },
  { value: 'Jharkhand', label: 'Jharkhand' },
  { value: 'Karnataka', label: 'Karnataka' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Ladakh', label: 'Ladakh' },
  { value: 'Lakshadweep', label: 'Lakshadweep' },
  { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
  { value: 'Maharashtra', label: 'Maharashtra' },
  { value: 'Manipur', label: 'Manipur' },
  { value: 'Meghalaya', label: 'Meghalaya' },
  { value: 'Mizoram', label: 'Mizoram' },
  { value: 'Nagaland', label: 'Nagaland' },
  { value: 'Odisha', label: 'Odisha' },
  { value: 'Puducherry', label: 'Puducherry' },
  { value: 'Punjab', label: 'Punjab' },
  { value: 'Rajasthan', label: 'Rajasthan' },
  { value: 'Sikkim', label: 'Sikkim' },
  { value: 'Tamil Nadu', label: 'Tamil Nadu' },
  { value: 'Telangana', label: 'Telangana' },
  { value: 'Tripura', label: 'Tripura' },
  { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
  { value: 'Uttarakhand', label: 'Uttarakhand' },
  { value: 'West Bengal', label: 'West Bengal' }
];

// Expanded grouped courses/branches
const BRANCH_CATEGORIES = [
  {
    category: 'Engineering Specialties',
    items: [
      { value: 'All', label: 'All Branches' },
      { value: 'Computer Science', label: 'Computer Science (CSE / IT)' },
      { value: 'AI & ML', label: 'Artificial Intelligence & Machine Learning' },
      { value: 'Data Science', label: 'Data Science & Big Data' },
      { value: 'IT', label: 'Information Technology' },
      { value: 'Electronics', label: 'Electronics & Communication (ECE / EEE)' },
      { value: 'Mechanical', label: 'Mechanical Engineering' },
      { value: 'Civil', label: 'Civil Engineering' },
      { value: 'Chemical', label: 'Chemical Engineering' },
      { value: 'Aerospace', label: 'Aerospace Engineering' },
      { value: 'Robotics', label: 'Robotics & Automation' },
      { value: 'Mechatronics', label: 'Mechatronics' },
      { value: 'Biotechnology', label: 'Biotechnology Engineering' },
      { value: 'Production', label: 'Production Engineering' },
      { value: 'Automobile', label: 'Automobile Engineering' },
      { value: 'Petroleum', label: 'Petroleum Engineering' },
      { value: 'Mining', label: 'Mining Engineering' },
      { value: 'Metallurgy', label: 'Metallurgical Engineering' },
      { value: 'Industrial', label: 'Industrial & Systems' }
    ]
  },
  {
    category: 'Medical / Health Sciences',
    items: [
      { value: 'MBBS', label: 'MBBS (Medicine)' },
      { value: 'BDS', label: 'BDS (Dental)' },
      { value: 'BAMS', label: 'BAMS (Ayurveda)' },
      { value: 'BHMS', label: 'BHMS (Homeopathy)' },
      { value: 'Nursing', label: 'Nursing Science' },
      { value: 'Pharmacy', label: 'Pharmacy (B.Pharm)' }
    ]
  },
  {
    category: 'Management & Business Studies',
    items: [
      { value: 'Management', label: 'Management (MBA / PGDM)' },
      { value: 'Finance', label: 'Finance Management' },
      { value: 'Marketing', label: 'Marketing Management' },
      { value: 'HR', label: 'Human Resource Management' },
      { value: 'Operations', label: 'Operations & Supply Chain' },
      { value: 'Business Analytics', label: 'Business Analytics' }
    ]
  },
  {
    category: 'Commerce & Financial Sciences',
    items: [
      { value: 'Commerce', label: 'Commerce (B.Com)' },
      { value: 'Economics', label: 'Economics & Policy' },
      { value: 'Accounting', label: 'Accountancy & Audit' }
    ]
  },
  {
    category: 'Pure & Applied Sciences',
    items: [
      { value: 'Physics', label: 'Physics (B.Sc / M.Sc)' },
      { value: 'Chemistry', label: 'Chemistry' },
      { value: 'Mathematics', label: 'Mathematics' },
      { value: 'Science Biotech', label: 'Biotechnology Science' }
    ]
  },
  {
    category: 'Arts, Law & Creative Design',
    items: [
      { value: 'Arts', label: 'Arts & Humanities (B.A.)' },
      { value: 'Law', label: 'Law (L.L.B. / Integrated)' },
      { value: 'Design', label: 'Design (B.Des / M.Des)' }
    ]
  }
];

// ==========================================
// Custom Searchable Dropdown UI Component
// ==========================================

interface SearchableDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { category: string; items: { value: string; label: string }[] }[] | { value: string; label: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
  searchPlaceholder?: string;
}

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option',
  icon,
  searchPlaceholder = 'Search...'
}: SearchableDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isGrouped = Array.isArray(options) && options.length > 0 && 'category' in options[0];
  
  const getSelectedLabel = () => {
    if (isGrouped) {
      for (const group of (options as any[])) {
        const found = group.items.find((item: any) => item.value === value);
        if (found) return found.label;
      }
    } else {
      const found = (options as any[]).find((item: any) => item.value === value);
      if (found) return found.label;
    }
    return value || placeholder;
  };

  const filteredOptions = React.useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return options;

    if (isGrouped) {
      return (options as any[])
        .map(group => {
          const matchedItems = group.items.filter((item: any) => 
            item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query)
          );
          return { ...group, items: matchedItems };
        })
        .filter(group => group.items.length > 0);
    } else {
      return (options as any[]).filter((item: any) => 
        item.label.toLowerCase().includes(query) || item.value.toLowerCase().includes(query)
      );
    }
  }, [options, search, isGrouped]);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">{label}</label>
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none hover:border-[#8B5CF6]/40 focus:border-[#8B5CF6]/50 transition-all text-left"
      >
        <div className="flex items-center gap-2.5 truncate">
          {icon && <span className="text-[#8B5CF6] shrink-0">{icon}</span>}
          <span className="truncate font-medium">{getSelectedLabel()}</span>
        </div>
        <ChevronDown className={`h-4 w-4 text-[#B0B0C0] transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180 text-[#8B5CF6]' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-[#2A2A40] bg-[#0D0D15]/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200 max-h-[300px] overflow-hidden flex flex-col">
          <div className="p-2 border-b border-[#2A2A40]/50 flex items-center gap-2 bg-[#0A0A0F]/50">
            <Search className="h-3.5 w-3.5 text-[#B0B0C0] shrink-0 ml-1.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent border-none text-xs text-[#F5F5F5] outline-none placeholder:text-[#B0B0C0]/30 py-1.5 pr-2"
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="p-1 hover:bg-[#2A2A40]/30 rounded text-[#B0B0C0]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1 custom-scrollbar py-2">
            {isGrouped ? (
              (filteredOptions as any[]).length === 0 ? (
                <div className="py-6 text-center text-xs text-[#B0B0C0]/50 font-medium">No matches found</div>
              ) : (
                (filteredOptions as any[]).map((group, gIdx) => (
                  <div key={gIdx} className="mb-3 last:mb-0">
                    <div className="px-3.5 py-1 text-[9px] font-bold text-[#8B5CF6]/85 uppercase tracking-wider bg-[#8B5CF6]/5 mb-1.5">
                      {group.category}
                    </div>
                    <div className="space-y-0.5 px-1.5">
                      {group.items.map((item: any) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            onChange(item.value);
                            setIsOpen(false);
                            setSearch('');
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                            value === item.value
                              ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                              : 'text-[#B0B0C0] hover:text-[#F5F5F5] hover:bg-[#151521]/70'
                          }`}
                        >
                          <span className="truncate">{item.label}</span>
                          {value === item.value && <Check className="h-3.5 w-3.5 text-[#8B5CF6] shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )
            ) : (
              (filteredOptions as any[]).length === 0 ? (
                <div className="py-6 text-center text-xs text-[#B0B0C0]/50 font-medium">No matches found</div>
              ) : (
                <div className="space-y-0.5 px-1.5">
                  {(filteredOptions as any[]).map((item: any) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => {
                        onChange(item.value);
                        setIsOpen(false);
                        setSearch('');
                      }}
                      className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                        value === item.value
                          ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                          : 'text-[#B0B0C0] hover:text-[#F5F5F5] hover:bg-[#151521]/70'
                      }`}
                    >
                      <span className="truncate">{item.label}</span>
                      {value === item.value && <Check className="h-3.5 w-3.5 text-[#8B5CF6] shrink-0" />}
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Main CollegePredictor Wizard Page Component
// ==========================================

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

      setStep(3); // Jump to step 3
    }
  }, []);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleExamChange = (selectedExam: string) => {
    setExam(selectedExam);
    const meta = getExamInputMeta(selectedExam);
    setRank(meta.defaultValue);
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

  const activeMeta = getExamInputMeta(exam);
  const isInputOutOfRange = rank < activeMeta.min || rank > activeMeta.max;

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
          <div className="mb-12 max-w-xl mx-auto relative px-4">
            <div className="flex items-center justify-between relative z-10">
              {[
                { number: 1, label: 'Score Details', desc: 'Exam & score' },
                { number: 2, label: 'Branch & Fees', desc: 'Course & budget' },
                { number: 3, label: 'Location & Packages', desc: 'State & placements' }
              ].map((s) => {
                const isActive = step === s.number;
                const isCompleted = step > s.number;
                
                return (
                  <button
                    key={s.number}
                    disabled={s.number > step}
                    onClick={() => setStep(s.number)}
                    className="flex flex-col items-center group cursor-pointer disabled:cursor-not-allowed"
                  >
                    <div
                      className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 shadow-md ${
                        isActive
                          ? 'bg-[#8B5CF6] border-[#8B5CF6] text-white shadow-purple-500/20 ring-4 ring-[#8B5CF6]/15 scale-110'
                          : isCompleted
                          ? 'bg-[#151521] border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6]/10'
                          : 'bg-[#0A0A0F] border-[#2A2A40] text-[#B0B0C0]'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : s.number}
                    </div>
                    <span
                      className={`mt-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors duration-300 ${
                        isActive ? 'text-[#8B5CF6]' : 'text-[#B0B0C0] group-hover:text-[#F5F5F5]'
                      }`}
                    >
                      {s.label}
                    </span>
                    <span className="text-[9px] text-[#B0B0C0]/40 font-medium hidden sm:block">
                      {s.desc}
                    </span>
                  </button>
                );
              })}
            </div>
            
            {/* Connecting lines */}
            <div className="absolute top-4.5 left-10 right-10 h-0.5 bg-[#151521] border-b border-[#2A2A40]/40 z-0">
              <div
                className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] transition-all duration-500"
                style={{ width: `${((step - 1) / 2) * 100}%` }}
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
                  Enter Exam & Score Details
                </h3>
                <div className="space-y-6">
                  {/* Categorized Exam Pathway Dropdown */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0] mb-2">Select Admission Pathway</label>
                    <select
                      value={exam}
                      onChange={e => handleExamChange(e.target.value)}
                      className="w-full rounded-xl border border-[#2A2A40] bg-[#0A0A0F] px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#8B5CF6]/50 transition-colors"
                    >
                      {EXAM_CATEGORIES.map((cat, idx) => (
                        <optgroup key={idx} label={cat.category} className="bg-[#0D0D15] text-[#F5F5F5]">
                          {cat.items.map(item => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>

                  {/* Dynamic Score / Rank Input */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#B0B0C0]">
                        {activeMeta.label}
                      </label>
                      <span className="text-[10px] font-bold text-[#8B5CF6]/80 bg-[#8B5CF6]/10 px-2 py-0.5 rounded border border-[#8B5CF6]/20">
                        Range: {activeMeta.min} - {activeMeta.max.toLocaleString()}
                      </span>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        placeholder={activeMeta.placeholder}
                        value={rank}
                        onChange={e => setRank(Number(e.target.value))}
                        className={`w-full rounded-xl border px-4 py-3 text-sm text-[#F5F5F5] outline-none transition-colors bg-[#0A0A0F] ${
                          isInputOutOfRange 
                            ? 'border-red-500/50 focus:border-red-500 focus:ring-1 focus:ring-red-500/35' 
                            : 'border-[#2A2A40] focus:border-[#8B5CF6]/50'
                        }`}
                      />
                    </div>
                    
                    {/* Error indicator / Dynamic Hint */}
                    {isInputOutOfRange ? (
                      <p className="text-[11px] text-red-400 mt-2 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="h-3.5 w-3.5 text-red-400 shrink-0" />
                        Values must fall strictly within valid parameters ({activeMeta.min} to {activeMeta.max.toLocaleString()}).
                      </p>
                    ) : (
                      <p className="text-[10px] text-[#B0B0C0]/50 mt-2">
                        {activeMeta.hint}
                      </p>
                    )}
                  </div>

                  <button
                    disabled={isInputOutOfRange}
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] py-3 text-xs font-bold text-white hover:opacity-90 shadow-md shadow-purple-500/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                  {/* Custom Searchable grouped branch select */}
                  <SearchableDropdown
                    label="Select Target Discipline / Branch"
                    value={branch}
                    onChange={setBranch}
                    options={BRANCH_CATEGORIES}
                    icon={<Sliders className="h-4 w-4" />}
                    searchPlaceholder="Search branch (e.g. AI, Biotechnology, MBA...)"
                  />

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
                  {/* Custom Searchable State selector with all 36 States/UTs */}
                  <SearchableDropdown
                    label="Preferred State / UT"
                    value={preferredState}
                    onChange={setPreferredState}
                    options={INDIAN_STATES_AND_UTS}
                    icon={<MapPin className="h-4 w-4" />}
                    searchPlaceholder="Search states & UTs (e.g. Kerala, Ladakh...)"
                  />

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
                  <span className="text-xs text-[#B0B0C0] bg-[#151521] border border-[#2A2A40] px-3.5 py-1.5 rounded-full font-medium shadow-inner">
                    Found <span className="font-bold text-[#8B5CF6]">{predictionData.count}</span> matching courses
                  </span>
                </div>

                {/* Outcome Explanation Legend */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl border border-[#2A2A40]/60 bg-[#151521]/30 backdrop-blur-md shadow-xl text-xs">
                  <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-[#2A2A40]/40 pb-4 sm:pb-0 sm:pr-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50"></span>
                      <h4 className="font-extrabold text-[#F5F5F5]">🟢 Safe Match</h4>
                    </div>
                    <p className="text-[#B0B0C0] text-[11px] leading-relaxed font-light">
                      High probability of admission (**80%+ confidence**). Your score/rank sits comfortably above historical cutoff marks. Excellent backup choice!
                    </p>
                  </div>

                  <div className="space-y-2 border-b sm:border-b-0 sm:border-r border-[#2A2A40]/40 py-4 sm:py-0 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#8B5CF6] shadow-md shadow-purple-500/50"></span>
                      <h4 className="font-extrabold text-[#F5F5F5]">🟣 Target Match</h4>
                    </div>
                    <p className="text-[#B0B0C0] text-[11px] leading-relaxed font-light">
                      Highly realistic admission probability (**65%–79% confidence**). Your score aligns directly with median historical trends. Highly balanced fit!
                    </p>
                  </div>

                  <div className="space-y-2 pt-4 sm:pt-0 sm:pl-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-md shadow-amber-400/50"></span>
                      <h4 className="font-extrabold text-[#F5F5F5]">🟡 Stretch Match</h4>
                    </div>
                    <p className="text-[#B0B0C0] text-[11px] leading-relaxed font-light">
                      Competitive reach option (**30%–64% confidence**). Your score is slightly below cutoff guidelines. Feasible in subsequent allotments or spot counselling.
                    </p>
                  </div>
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
                          ? 'bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/40 shadow-sm shadow-purple-500/5'
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {getResultList().map((rec: any, idx: number) => {
                      const isSaved = savedCollegeIds.includes(rec.collegeId);
                      const isInCompare = comparisonColleges.some(c => c.id === rec.collegeId);

                      return (
                        <div
                          key={`${rec.collegeId}-${rec.courseName}-${idx}`}
                          className="group rounded-xl border border-[#2A2A40] bg-[#151521]/45 p-4 flex flex-col justify-between hover:border-[#8B5CF6]/50 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300"
                        >
                          <div>
                            {/* Card Header (Category Badge + Confidence visual gauge) */}
                            <div className="flex items-center justify-between mb-3.5">
                              <span
                                className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider border ${
                                  rec.category === 'Safe'
                                    ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-400'
                                    : rec.category === 'Target'
                                    ? 'bg-purple-500/10 border-[#8B5CF6]/35 text-[#8B5CF6]'
                                    : 'bg-amber-500/10 border-amber-500/35 text-amber-400'
                                }`}
                              >
                                {rec.category} Match
                              </span>
                              
                              <div className="text-[9px] font-bold text-[#B0B0C0] flex flex-col items-end gap-0.5">
                                <span className="flex items-center gap-1 font-semibold">
                                  Match: <span className="text-[#8B5CF6] text-xs font-extrabold">{rec.confidenceScore}%</span>
                                </span>
                                <div className="h-1 w-16 bg-[#0A0A0F] rounded-full overflow-hidden border border-[#2A2A40]/40">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      rec.category === 'Safe' 
                                        ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' 
                                        : rec.category === 'Target' 
                                        ? 'bg-[#8B5CF6] shadow-sm shadow-purple-500/50' 
                                        : 'bg-amber-400 shadow-sm shadow-amber-400/50'
                                    }`}
                                    style={{ width: `${rec.confidenceScore}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>

                            {/* College Logo and Name */}
                            <div className="flex items-start gap-2.5">
                              <img
                                src={getSafeLogoSrc(rec)}
                                onError={(e) => {
                                  e.currentTarget.onerror = null;
                                  e.currentTarget.src = getFallbackLogoUrl();
                                }}
                                alt=""
                                className="h-8 w-8 rounded-lg object-cover object-center border border-[#2A2A40]"
                              />
                              <div>
                                <h4 className="font-extrabold text-[#F5F5F5] text-xs line-clamp-1 hover:text-[#8B5CF6] transition-colors">
                                  <Link href={`/college/${rec.collegeId}`}>{rec.collegeName}</Link>
                                </h4>
                                <p className="text-[9px] text-[#B0B0C0] flex items-center gap-0.5 mt-0.5">
                                  <MapPin className="h-2.5 w-2.5 text-[#8B5CF6]" />
                                  {rec.location}
                                </p>
                              </div>
                            </div>

                            {/* Recommended Course & Fees */}
                            <div className="mt-3 bg-[#0A0A0F]/60 border border-[#2A2A40]/40 rounded-xl p-3 space-y-1.5 text-xs">
                              <div className="flex justify-between items-start">
                                <span className="text-[#B0B0C0]/85 font-medium max-w-[70%] line-clamp-1 text-[11px]">{rec.courseName}</span>
                                <span className="font-bold text-[#8B5CF6] text-[11px]">₹{rec.courseFees.toLocaleString('en-IN')}/yr</span>
                              </div>
                              <div className="flex justify-between text-[9px] border-t border-[#2A2A40]/30 pt-1.5 text-[#B0B0C0]">
                                <span>Cutoff: <strong className="text-[#F5F5F5] font-semibold">{rec.courseCutoff}</strong></span>
                                <span>Exam: <strong className="text-[#F5F5F5] font-semibold">{rec.exam}</strong></span>
                              </div>
                            </div>

                            {/* Explanation Paragraphs */}
                            <p className="mt-3 text-[10px] text-[#B0B0C0]/90 leading-relaxed font-light line-clamp-2">
                              {rec.explanation}
                            </p>

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2 border-t border-[#2A2A40]/40 pt-3 mt-3 text-[9px] text-center">
                              <div>
                                <span className="block text-[#B0B0C0]/50 font-bold uppercase tracking-wider text-[8px]">Avg LPA</span>
                                <span className="font-extrabold text-[#F5F5F5] text-[10px]">{rec.averagePackage} LPA</span>
                              </div>
                              <div>
                                <span className="block text-[#B0B0C0]/50 font-bold uppercase tracking-wider text-[8px]">NIRF Rank</span>
                                <span className="font-extrabold text-[#F5F5F5] text-[10px]">{rec.nirfRank || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-[#B0B0C0]/50 font-bold uppercase tracking-wider text-[8px]">ROI Rating</span>
                                <span className="font-extrabold text-[#8B5CF6] text-[10px]">{rec.roiScore}/10</span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 pt-4 border-t border-[#2A2A40]/30 mt-4">
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
