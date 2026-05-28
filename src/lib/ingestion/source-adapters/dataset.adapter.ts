import fs from 'fs';
import path from 'path';

export interface DataGovRecord {
  name: string;
  avgPackage: number;
  highestPackage: number;
  placementRate: number;
  fees: number;
}

const DATAGOV_URL = 'https://api.data.gov.in/resource/mock-education-statistics-json';

async function fetchWithTimeout(url: string, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function loadSimulationDataset(): any[] {
  try {
    const filePath = path.join(process.cwd(), 'prisma', 'india-colleges-raw.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')).colleges || [];
    }
  } catch (e) {
    console.error('Error loading simulation raw dataset in DataGov adapter:', e);
  }
  return [];
}

export async function fetchDataGovStats(): Promise<{ data: DataGovRecord[]; source: string; isFallback: boolean }> {
  let retries = 2;
  while (retries >= 0) {
    try {
      const res = await fetchWithTimeout(DATAGOV_URL);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          return { data: json.data, source: 'Data.gov.in Statistical API', isFallback: false };
        }
      }
      throw new Error('Invalid Data.gov.in payload received from server');
    } catch (e) {
      if (retries === 0) {
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
      retries--;
    }
  }
  return { data: [], source: 'Data.gov.in Statistical API (Empty)', isFallback: true };
}
