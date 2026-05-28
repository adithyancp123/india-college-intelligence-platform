import fs from 'fs';
import path from 'path';

export interface UGCRecord {
  name: string;
  state: string;
  type: 'Central' | 'State' | 'Private' | 'Deemed';
  website?: string;
}

const UGC_URL = 'https://raw.githubusercontent.com/aditya-kumar-dev/education-datasets/main/ugc-universities.json';

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
    console.error('Error loading simulation raw dataset in UGC adapter:', e);
  }
  return [];
}

export async function fetchUGCRegistry(): Promise<{ data: UGCRecord[]; source: string; isFallback: boolean }> {
  let retries = 2;
  while (retries >= 0) {
    try {
      const res = await fetchWithTimeout(UGC_URL);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          return { data: json.data, source: 'UGC Web Registry', isFallback: false };
        }
      }
      throw new Error('Invalid UGC payload received from server');
    } catch (e) {
      if (retries === 0) {
        console.warn('UGC registry fetch offline, loading simulation data.');
        const simulation = loadSimulationDataset().map(c => ({
          name: c.name,
          state: c.state,
          type: (c.ownership === 'Government' ? 'Central' : 'Private') as any,
          website: c.website || undefined
        }));
        return { data: simulation, source: 'UGC Web Registry (Local Backup)', isFallback: true };
      }
      retries--;
    }
  }
  return { data: [], source: 'UGC Web Registry (Empty)', isFallback: true };
}
