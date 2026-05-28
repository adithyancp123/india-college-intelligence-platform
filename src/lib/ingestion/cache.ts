import fs from 'fs';
import path from 'path';
import { College } from '../mock-data';

const CACHE_DIR = path.join(process.cwd(), 'cache');
const CACHE_FILE = path.join(CACHE_DIR, 'normalized-colleges.json');

export interface CachePayload {
  lastUpdated: string;
  colleges: College[];
}

export function writeCollegesToCache(colleges: College[]): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const payload: CachePayload = {
      lastUpdated: new Date().toISOString(),
      colleges
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`Cache system: successfully cached ${colleges.length} colleges.`);
  } catch (e) {
    console.error('Cache system: failed to write to local cache file', e);
  }
}

export function readCollegesFromCache(): College[] {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const content = fs.readFileSync(CACHE_FILE, 'utf-8');
      const payload: CachePayload = JSON.parse(content);
      return payload.colleges || [];
    }
  } catch (e) {
    console.error('Cache system: failed to read from local cache file', e);
  }
  return [];
}

export function isCacheValid(maxAgeMs = 3600000): boolean {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const stats = fs.statSync(CACHE_FILE);
      const ageMs = Date.now() - stats.mtimeMs;
      return ageMs < maxAgeMs;
    }
  } catch (e) {
    console.error('Cache system: failed to determine cache age', e);
  }
  return false;
}
