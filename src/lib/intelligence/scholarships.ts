export interface Scholarship {
  id: string;
  name: string;
  eligibility: string;
  benefits: string;
  deadline: string;
  applyLink: string;
  category: string[];
  states: string[];
  maxIncome: number; // annual family income limit
  examScoreMin?: number;
  genderRestrictions?: 'Female' | 'None';
  confidenceScore: number;
}

export const SCHOLARSHIPS_DATA: Scholarship[] = [
  {
    id: 'sch-1',
    name: 'Central Sector Scheme of Scholarship for College and University Students',
    eligibility: 'Above 80th percentile in class 12th state/central board boards, pursuing regular B.Tech/B.Sc/MBA.',
    benefits: '₹12,000 per annum for graduation years, ₹20,000 for post-graduation.',
    deadline: 'December 31 annually',
    applyLink: 'https://scholarships.gov.in',
    category: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    states: ['All States'],
    maxIncome: 450000,
    confidenceScore: 98
  },
  {
    id: 'sch-2',
    name: 'AICTE Pragati Scholarship Scheme for Girl Students (Technical Degree)',
    eligibility: 'Female student admitted to 1st year B.Tech degree through state/central counseling, maximum 2 girls per family.',
    benefits: '₹50,000 per annum directly for tuition fees, computer purchase, or hostel charges.',
    deadline: 'November 30 annually',
    applyLink: 'https://www.aicte-india.org',
    category: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    states: ['All States'],
    maxIncome: 800000,
    genderRestrictions: 'Female',
    confidenceScore: 95
  },
  {
    id: 'sch-3',
    name: 'OP Jindal Engineering and Management Scholarships (OPJEMS)',
    eligibility: 'Merit-based matching for top rankers in engineering colleges (IITs, NITs, BITS) based on JEE cutoff rank or academic performance.',
    benefits: '₹80,000 per annum for engineering scholars, ₹1,500,000 for management students.',
    deadline: 'October 15 annually',
    applyLink: 'https://www.opjems.com',
    category: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    states: ['All States'],
    maxIncome: 2000000,
    examScoreMin: 90,
    confidenceScore: 92
  },
  {
    id: 'sch-4',
    name: 'MahaDBT Rajarshi Chhatrapati Shahu Maharaj Fee Reimbursement',
    eligibility: 'Domicile of Maharashtra state, pursuing technical degree courses (B.Tech/B.Pharma) with admission through CAP rounds.',
    benefits: '50% tuition fees and development fees reimbursement across government and private technical institutions.',
    deadline: 'March 31 annually',
    applyLink: 'https://mahadbt.maharashtra.gov.in',
    category: ['OBC', 'EWS', 'General'],
    states: ['Maharashtra'],
    maxIncome: 800000,
    confidenceScore: 96
  },
  {
    id: 'sch-5',
    name: 'e-Kalyan Post-Matric Scholarship Scheme (Jharkhand)',
    eligibility: 'Domicile of Jharkhand state, SC/ST/OBC category students pursuing higher technical courses.',
    benefits: '100% tuition fee reimbursement and maintenance allowance depending on hostel status.',
    deadline: 'February 20 annually',
    applyLink: 'https://ekalyan.cgg.gov.in',
    category: ['SC', 'ST', 'OBC'],
    states: ['Jharkhand'],
    maxIncome: 250000,
    confidenceScore: 94
  },
  {
    id: 'sch-6',
    name: 'Prime Minister Scholarship Scheme (PMSS)',
    eligibility: 'Wards/widows of deceased/ex-servicemen of Armed Forces, pursuing B.Tech, BDS, or B.Pharma.',
    benefits: '₹3,000 per month for girls, ₹2,500 per month for boys.',
    deadline: 'November 15 annually',
    applyLink: 'https://www.desw.gov.in',
    category: ['General', 'OBC', 'SC', 'ST', 'EWS'],
    states: ['All States'],
    maxIncome: 1200000,
    confidenceScore: 97
  }
];

export interface MatchFilters {
  state: string;
  category: string;
  income: number;
  gender: string;
  examScore?: number;
}

export function findMatchingScholarships(filters: MatchFilters): Scholarship[] {
  return SCHOLARSHIPS_DATA.filter(sch => {
    // 1. Domicile state check
    const matchesState = 
      sch.states.includes('All States') || 
      sch.states.some(s => s.toLowerCase() === filters.state.toLowerCase());
    if (!matchesState) return false;

    // 2. Category check
    const matchesCategory = sch.category.some(c => c.toLowerCase() === filters.category.toLowerCase());
    if (!matchesCategory) return false;

    // 3. Income limit check
    if (filters.income > sch.maxIncome) return false;

    // 4. Gender restriction check
    if (sch.genderRestrictions === 'Female' && filters.gender.toLowerCase() !== 'female') {
      return false;
    }

    // 5. Exam score check (optional)
    if (sch.examScoreMin && filters.examScore) {
      if (filters.examScore < sch.examScoreMin) return false;
    }

    return true;
  });
}
