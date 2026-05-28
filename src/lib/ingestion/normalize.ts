import { College, Course } from '../mock-data';

export const STATE_MAP: { [key: string]: string } = {
  'MH': 'Maharashtra',
  'DL': 'Delhi',
  'KA': 'Karnataka',
  'TN': 'Tamil Nadu',
  'TS': 'Telangana',
  'UP': 'Uttar Pradesh',
  'WB': 'West Bengal',
  'GJ': 'Gujarat',
  'RJ': 'Rajasthan',
  'KL': 'Kerala',
  'MP': 'Madhya Pradesh',
  'PB': 'Punjab',
  'BR': 'Bihar',
  'OD': 'Odisha',
  'HR': 'Haryana',
  'UK': 'Uttarakhand',
  'JH': 'Jharkhand',
  'AS': 'Assam',
  'GA': 'Goa',
  'AP': 'Andhra Pradesh',
};

export const FACILITY_MAP: { [key: string]: string } = {
  'wi-fi': 'Wifi',
  'wifi': 'Wifi',
  'internet': 'Wifi',
  'hostels': 'Hostel',
  'hostel': 'Hostel',
  'library': 'Library',
  'gym': 'Gym',
  'gymnasium': 'Gym',
  'laboratory': 'Labs',
  'laboratories': 'Labs',
  'labs': 'Labs',
  'cafeteria': 'Cafeteria',
  'canteen': 'Cafeteria',
  'sports': 'Sports Complex',
  'playground': 'Sports Complex',
  'auditorium': 'Auditorium',
  'medical': 'Medical Center',
  'hospital': 'Medical Center',
  'clinic': 'Medical Center'
};

export function normalizeCollege(raw: any): Partial<College> & { 
  courses?: Partial<Course>[];
  coordinates?: { lat: number; lng: number };
  source: string;
  lastUpdated: string;
  confidenceScore: number;
} {
  const name = String(raw.name || '').trim();
  
  let state = String(raw.state || '').trim();
  if (STATE_MAP[state.toUpperCase()]) {
    state = STATE_MAP[state.toUpperCase()];
  } else if (state) {
    state = state.charAt(0).toUpperCase() + state.slice(1).toLowerCase();
  }
  
  let city = String(raw.city || '').trim();
  if (city) {
    city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
  }

  let ownership = String(raw.ownership || 'Private').trim();
  if (/govt|government|public/i.test(ownership)) {
    ownership = 'Government';
  } else {
    ownership = 'Private';
  }

  const fees = Number(raw.fees || 0);
  const established = Number(raw.established || 2000);
  const rating = Number(raw.rating || 4.0);
  const placementRate = Number(raw.placementRate || 80.0);
  const averagePackage = Number(raw.averagePackage || 6.0);
  const highestPackage = Number(raw.highestPackage || averagePackage * 2.5);
  const nirfRank = raw.nirfRank ? Number(raw.nirfRank) : null;

  const roiScore = fees > 0 
    ? parseFloat(((averagePackage * 100000) / fees).toFixed(2)) 
    : 1.0;
  
  const intelligenceScore = Math.min(
    100,
    parseFloat(
      ((101 - (nirfRank || 150)) * 0.15 + (averagePackage * 1.5) + (rating * 7.5)).toFixed(1)
    )
  );

  const rawFacilities: string[] = Array.isArray(raw.facilities) ? raw.facilities : [];
  const facilities = Array.from(
    new Set(
      rawFacilities.map(f => {
        const clean = f.trim().toLowerCase();
        return FACILITY_MAP[clean] || (clean.charAt(0).toUpperCase() + clean.slice(1));
      })
    )
  );

  const exams = Array.isArray(raw.exams) 
    ? raw.exams.map((ex: any) => String(ex).trim()) 
    : [];

  const courses: Partial<Course>[] = Array.isArray(raw.courses) 
    ? raw.courses.map((crs: any, index: number) => ({
        id: crs.id || `course-gen-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`,
        name: String(crs.name || '').trim(),
        duration: Number(crs.duration || 4),
        fees: Number(crs.fees || fees),
        seats: Number(crs.seats || 60),
        cutoffRank: Number(crs.cutoffRank || 10000),
        exam: String(crs.exam || exams[0] || 'JEE Main').trim()
      }))
    : [];

  const missingFields: string[] = [];
  let confidence = 100;

  if (!nirfRank) {
    confidence -= 10;
    missingFields.push('nirfRank');
  }
  if (!raw.accreditation) {
    confidence -= 10;
    missingFields.push('accreditation');
  }
  if (fees <= 0) {
    confidence -= 15;
    missingFields.push('fees');
  }
  if (averagePackage <= 0) {
    confidence -= 15;
    missingFields.push('averagePackage');
  }
  if (!raw.website) {
    confidence -= 5;
    missingFields.push('website');
  }
  if (exams.length === 0) {
    confidence -= 10;
    missingFields.push('exams');
  }
  if (facilities.length === 0) {
    confidence -= 5;
    missingFields.push('facilities');
  }
  if (courses.length === 0) {
    confidence -= 15;
    missingFields.push('courses');
  }
  if (!raw.description || raw.description.includes('Established in') && raw.description.length < 100) {
    confidence -= 5;
    missingFields.push('description');
  }

  confidence = Math.max(30, confidence);

  const coordinates = raw.coordinates || {
    lat: 20.5937 + (Math.random() - 0.5) * 5,
    lng: 78.9629 + (Math.random() - 0.5) * 5
  };

  const syncSource = raw.syncSource || 'Local Dataset';
  const syncLastUpdated = raw.syncLastUpdated || new Date().toISOString();

  return {
    name,
    location: raw.location || (city && state ? `${city}, ${state}` : ''),
    state,
    city,
    ownership,
    nirfRank,
    fees,
    rating,
    description: raw.description || `Established in ${established}, ${name} offers top-tier academic and professional programs.`,
    established,
    logoUrl: raw.logoUrl || 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=128&h=128&fit=crop&q=80',
    bannerUrl: raw.bannerUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?w=1200&h=400&fit=crop&q=80',
    placementRate,
    averagePackage,
    highestPackage,
    accreditation: raw.accreditation || null,
    website: raw.website || null,
    exams,
    facilities,
    collegeIntelligenceScore: raw.collegeIntelligenceScore || intelligenceScore,
    roiScore: raw.roiScore || roiScore,
    scholarshipFriendly: !!raw.scholarshipFriendly,
    trending: !!raw.trending,
    syncSource,
    syncLastUpdated,
    syncConfidenceScore: confidence,
    syncMissingFields: missingFields,
    courses,
    coordinates,
    source: syncSource,
    lastUpdated: syncLastUpdated,
    confidenceScore: confidence
  };
}
