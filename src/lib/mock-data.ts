import fs from 'fs';
import path from 'path';

// Define TS Types for our application
export interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  city: string;
  ownership: string;
  nirfRank: number | null;
  fees: number;
  rating: number;
  description: string;
  established: number;
  logoUrl: string;
  bannerUrl: string;
  placementRate: number;
  averagePackage: number;
  highestPackage: number;
  accreditation: string | null;
  website: string | null;
  exams: string[];
  facilities: string[];
  collegeIntelligenceScore: number;
  roiScore: number;
  scholarshipFriendly: boolean;
  trending: boolean;
  syncSource: string;
  syncLastUpdated: string;
  syncConfidenceScore: number;
  syncMissingFields: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Course {
  id: string;
  name: string;
  duration: number; // in years
  fees: number;     // annual fee
  seats: number;
  cutoffRank: number;
  exam: string;
  collegeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  userName: string;
  collegeId: string;
  createdAt: string;
}

export interface SavedCollege {
  id: string;
  userId: string;
  collegeId: string;
  createdAt: string;
}

export interface SavedComparison {
  id: string;
  name: string;
  collegeIds: string[];
  userId: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

interface FallbackDatabase {
  users: User[];
  colleges: College[];
  courses: Course[];
  reviews: Review[];
  savedColleges: SavedCollege[];
  savedComparisons: SavedComparison[];
}

const FALLBACK_DB_PATH = path.join(process.cwd(), 'prisma', 'fallback-db.json');

const DEFAULT_USER: User = {
  id: 'demo-user-1',
  email: 'student@example.com',
  name: 'Aditya Kumar',
  passwordHash: '$2a$10$TqyUfQ/UfQ1u0Q3.vO11ze/Wj2bZ464i6N.p013zXU90J4hZ2bU7W' // 'password123'
};

function getInitialData(): FallbackDatabase {
  const users = [DEFAULT_USER];
  const colleges: College[] = [];
  const courses: Course[] = [];
  
  try {
    const rawPath = path.join(process.cwd(), 'prisma', 'india-colleges-raw.json');
    if (fs.existsSync(rawPath)) {
      const rawData = JSON.parse(fs.readFileSync(rawPath, 'utf-8'));
      if (rawData.colleges) {
        rawData.colleges.forEach((col: any) => {
          const { courses: colCourses, ...collegeFields } = col;
          colleges.push({
            ...collegeFields,
            website: collegeFields.website || null,
            accreditation: collegeFields.accreditation || null,
            syncSource: collegeFields.syncSource || 'Local Dataset',
            syncLastUpdated: collegeFields.syncLastUpdated || new Date().toISOString(),
            syncConfidenceScore: collegeFields.syncConfidenceScore || 90.0,
            syncMissingFields: collegeFields.syncMissingFields || [],
            createdAt: collegeFields.createdAt || new Date().toISOString(),
            updatedAt: collegeFields.updatedAt || new Date().toISOString()
          });
          
          if (colCourses) {
            colCourses.forEach((c: any, index: number) => {
              courses.push({
                ...c,
                id: c.id || `${col.id}-course-${index}`,
                collegeId: col.id
              });
            });
          }
        });
      }
    }
  } catch (e) {
    console.error('Failed to load initial data from raw json:', e);
  }
  
  return {
    users,
    colleges,
    courses,
    reviews: [
      {
        id: 'rev-1',
        rating: 5,
        comment: 'Absolutely unmatched academic rigor and peer group. The campus life at IIT Bombay is incredible, and the coding culture is world-class.',
        userId: 'demo-user-1',
        userName: 'Aditya Kumar',
        collegeId: 'col-1',
        createdAt: '2026-05-20T12:00:00Z'
      },
      {
        id: 'rev-2',
        rating: 4.8,
        comment: 'BITS Pilani offers complete flexibility with its zero-attendance policy and dual degree options. Very high quality placement companies.',
        userId: 'demo-user-1',
        userName: 'Aditya Kumar',
        collegeId: 'col-2',
        createdAt: '2026-05-18T10:00:00Z'
      }
    ],
    savedColleges: [],
    savedComparisons: [
      {
        id: 'comp-seed-1',
        name: 'Top Tier Engineering Choices',
        collegeIds: ['col-1', 'col-2', 'col-3'],
        userId: 'demo-user-1',
        createdAt: '2026-05-28T16:30:00Z'
      }
    ]
  };
}

const INITIAL_DATA = getInitialData();

// Thread-safe read/write sync helpers for fallback database
export function readFallbackDb(): FallbackDatabase {
  try {
    if (!fs.existsSync(FALLBACK_DB_PATH)) {
      // Ensure the directory exists
      const dir = path.dirname(FALLBACK_DB_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const dataStr = fs.readFileSync(FALLBACK_DB_PATH, 'utf-8');
    return JSON.parse(dataStr);
  } catch (error) {
    console.error('Error reading fallback database file:', error);
    return INITIAL_DATA;
  }
}

export function writeFallbackDb(data: FallbackDatabase): void {
  try {
    const dir = path.dirname(FALLBACK_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing fallback database file:', error);
  }
}
