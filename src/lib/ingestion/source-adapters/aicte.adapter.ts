import fs from 'fs';
import path from 'path';

export interface AICTERecord {
  name: string;
  state: string;
  facilities?: string[];
  accreditation?: string;
}

const AICTE_URL = 'https://raw.githubusercontent.com/aditya-kumar-dev/education-datasets/main/aicte-approved.json';

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
    console.error('Error loading simulation raw dataset in AICTE adapter:', e);
  }
  return [];
}

export async function fetchAICTERegistry(): Promise<{ data: AICTERecord[]; source: string; isFallback: boolean }> {
  let retries = 2;
  while (retries >= 0) {
    try {
      const res = await fetchWithTimeout(AICTE_URL);
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          return { data: json.data, source: 'AICTE Approvals Register', isFallback: false };
        }
      }
      throw new Error('Invalid AICTE payload received from server');
    } catch (e) {
      if (retries === 0) {
        console.warn('AICTE approvals fetch offline, loading simulation data.');
        const simulation = loadSimulationDataset().map(c => ({
          name: c.name,
          state: c.state,
          facilities: c.facilities,
          accreditation: c.accreditation || undefined
        }));
        return { data: simulation, source: 'AICTE Approvals Register (Local Backup)', isFallback: true };
      }
      retries--;
    }
  }
  return { data: [], source: 'AICTE Approvals Register (Empty)', isFallback: true };
}
