import fs from 'fs';
import path from 'path';

// Define typed data structures for each source
export interface UGCRecord {
  name: string;
  state: string;
  type: 'Central' | 'State' | 'Private' | 'Deemed';
  website?: string;
}

export interface NIRFRecord {
  name: string;
  rank: number;
  score: number;
  category: string;
}

export interface AICTERecord {
  name: string;
  state: string;
  facilities?: string[];
  accreditation?: string;
}

export interface DataGovRecord {
  name: string;
  avgPackage: number;
  highestPackage: number;
  placementRate: number;
  fees: number;
}

const REMOTE_SOURCES = {
  UGC: 'https://raw.githubusercontent.com/aditya-kumar-dev/education-datasets/main/ugc-universities.json',
  NIRF: 'https://raw.githubusercontent.com/aditya-kumar-dev/education-datasets/main/nirf-rankings.json',
  AICTE: 'https://raw.githubusercontent.com/aditya-kumar-dev/education-datasets/main/aicte-approved.json',
  DataGov: 'https://api.data.gov.in/resource/mock-education-statistics-json'
};

// Global timeout fetch helper (throws error if fetch takes > 2500ms)
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Adapter 1: UGC Recognized Universities
 */
export async function fetchUGCRegistry(): Promise<{ data: UGCRecord[]; source: string; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(REMOTE_SOURCES.UGC);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return { data: json.data, source: 'UGC Web Registry', isFallback: false };
      }
    }
    throw new Error('Invalid UGC response payload');
  } catch (e) {
    console.warn('UGC registry fetch offline, loading simulation data.');
    const simulation = loadSimulationDataset().map(c => ({
      name: c.name,
      state: c.state,
      type: (c.ownership === 'Government' ? 'Central' : 'Private') as any,
      website: c.website || undefined
    }));
    return { data: simulation, source: 'UGC Web Registry (Local Backup)', isFallback: true };
  }
}

/**
 * Adapter 2: NIRF Rankings List
 */
export async function fetchNIRFRankings(): Promise<{ data: NIRFRecord[]; source: string; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(REMOTE_SOURCES.NIRF);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return { data: json.data, source: 'NIRF Ranking Feed', isFallback: false };
      }
    }
    throw new Error('Invalid NIRF response payload');
  } catch (e) {
    console.warn('NIRF rankings fetch offline, loading simulation data.');
    const simulation = loadSimulationDataset()
      .filter(c => c.nirfRank !== null)
      .map(c => ({
        name: c.name,
        rank: c.nirfRank!,
        score: parseFloat((100 - c.nirfRank! * 0.25).toFixed(1)),
        category: c.name.includes('Management') || c.name.includes('IIM') ? 'Management' : 'Engineering'
      }));
    return { data: simulation, source: 'NIRF Ranking Feed (Local Backup)', isFallback: true };
  }
}

/**
 * Adapter 3: AICTE Approved Institutions
 */
export async function fetchAICTERecistry(): Promise<{ data: AICTERecord[]; source: string; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(REMOTE_SOURCES.AICTE);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return { data: json.data, source: 'AICTE Approvals Register', isFallback: false };
      }
    }
    throw new Error('Invalid AICTE response payload');
  } catch (e) {
    console.warn('AICTE approvals fetch offline, loading simulation data.');
    const simulation = loadSimulationDataset().map(c => ({
      name: c.name,
      state: c.state,
      facilities: c.facilities,
      accreditation: c.accreditation || undefined
    }));
    return { data: simulation, source: 'AICTE Approvals Register (Local Backup)', isFallback: true };
  }
}

/**
 * Adapter 4: Data.gov.in Education Statistics
 */
export async function fetchDataGovStats(): Promise<{ data: DataGovRecord[]; source: string; isFallback: boolean }> {
  try {
    const res = await fetchWithTimeout(REMOTE_SOURCES.DataGov);
    if (res.ok) {
      const json = await res.json();
      if (Array.isArray(json.data)) {
        return { data: json.data, source: 'Data.gov.in Statistical API', isFallback: false };
      }
    }
    throw new Error('Invalid Data.gov.in response');
  } catch (e) {
    console.warn('Data.gov.in statistics offline, loading simulation data.');
    const simulation = loadSimulationDataset().map(c => ({
      name: c.name,
      avgPackage: c.averagePackage,
      highestPackage: c.highestPackage,
      placementRate: c.placementRate,
      fees: c.fees
    }));
    return { data: simulation, source: 'Data.gov.in Statistical API (Local Backup)', isFallback: true };
  }
}

/**
 * Helper to parse the local raw JSON dataset
 */
function loadSimulationDataset(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'prisma', 'india-colleges-raw.json');
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(fileContent);
      return json.colleges || [];
    }
  } catch (e) {
    console.error('Error loading simulation raw dataset:', e);
  }
  return [];
}

/**
 * Fetches all source datasets in parallel, normalizing failures and returns a consolidated object
 */
export async function fetchHybridDataset() {
  console.log('Initiating parallel hybrid ingestion fetches...');
  const [ugc, nirf, aicte, datagov] = await Promise.all([
    fetchUGCRegistry(),
    fetchNIRFRankings(),
    fetchAICTERecistry(),
    fetchDataGovStats()
  ]);

  return {
    ugc: ugc.data,
    nirf: nirf.data,
    aicte: aicte.data,
    datagov: datagov.data,
    sources: [ugc.source, nirf.source, aicte.source, datagov.source],
    isFullFallback: ugc.isFallback && nirf.isFallback && aicte.isFallback && datagov.isFallback
  };
}
