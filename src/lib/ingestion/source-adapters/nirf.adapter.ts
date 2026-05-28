import fs from 'fs';
import path from 'path';

export interface NIRFRecord {
  name: string;
  rank: number;
  score: number;
  category: string;
}

const NIRF_URL = 'https://raw.githubusercontent.com/aditya-kumar-dev/education-datasets/main/nirf-rankings.json';

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
    console.error('Error loading simulation raw dataset in NIRF adapter:', e);
  }
  return [];
}

export async function fetchNIRFRankings(): Promise<{ data: NIRFRecord[]; source: string; isFallback: boolean }> {
  let retries = 2;
  while (retries >= 0) {
    try {
      const res = await fetchWithTimeout(NIRF_URL);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          return { data: json.data, source: 'NIRF Ranking Feed', isFallback: false };
        }
      }
      throw new Error('Invalid NIRF payload received from server');
    } catch (e) {
      if (retries === 0) {
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
      retries--;
    }
  }
  return { data: [], source: 'NIRF Ranking Feed (Empty)', isFallback: true };
}
