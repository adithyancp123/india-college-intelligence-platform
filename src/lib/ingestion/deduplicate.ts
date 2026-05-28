import { College, Course } from '../mock-data';

export type IngestionCollege = Partial<College> & { 
  courses?: Partial<Course>[];
  coordinates?: { lat: number; lng: number };
  source: string;
  lastUpdated: string;
  confidenceScore: number;
};

export function standardizeCollegeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\biit\b/g, 'indian institute of technology')
    .replace(/\bnit\b/g, 'national institute of technology')
    .replace(/\biiit\b/g, 'indian institute of information technology')
    .replace(/\bbits\b/g, 'birla institute of technology and science')
    .replace(/\buniversity\b/g, '')
    .replace(/\bcollege\b/g, '')
    .replace(/\binstitute\b/g, '')
    .replace(/\btechnology\b/g, '')
    .replace(/\bscience\b/g, '')
    .replace(/\bengineering\b/g, '')
    .replace(/\bmanagement\b/g, '')
    .replace(/\bof\b/g, '')
    .replace(/\band\b/g, '')
    .replace(/\s+/g, '')
    .trim();
}

export function getLevenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[a.length][b.length];
}

export function mergeColleges(existing: IngestionCollege, incoming: IngestionCollege): IngestionCollege {
  const merged = { ...existing };
  
  if (incoming.nirfRank && (!existing.nirfRank || incoming.nirfRank < existing.nirfRank)) {
    merged.nirfRank = incoming.nirfRank;
  }
  if (incoming.averagePackage && (!existing.averagePackage || incoming.averagePackage > existing.averagePackage)) {
    merged.averagePackage = incoming.averagePackage;
  }
  if (incoming.highestPackage && (!existing.highestPackage || incoming.highestPackage > existing.highestPackage)) {
    merged.highestPackage = incoming.highestPackage;
  }
  if (incoming.fees && (!existing.fees || existing.fees === 0 || incoming.fees < existing.fees)) {
    merged.fees = incoming.fees;
  }
  if (incoming.accreditation && !existing.accreditation) {
    merged.accreditation = incoming.accreditation;
  }
  if (incoming.website && !existing.website) {
    merged.website = incoming.website;
  }
  if (incoming.facilities) {
    merged.facilities = Array.from(new Set([...(existing.facilities || []), ...(incoming.facilities || [])]));
  }
  if (incoming.exams) {
    merged.exams = Array.from(new Set([...(existing.exams || []), ...(incoming.exams || [])]));
  }
  
  if (incoming.courses && incoming.courses.length > 0) {
    const existingC = existing.courses || [];
    const incomingC = incoming.courses || [];
    const mergedC = [...existingC];
    
    incomingC.forEach((inC: any) => {
      if (!mergedC.some((exC: any) => exC.name.toLowerCase() === inC.name.toLowerCase())) {
        mergedC.push(inC);
      }
    });
    merged.courses = mergedC;
  }

  const existingSources = String(existing.syncSource || 'Local Dataset').split(' + ');
  const incomingSources = String(incoming.syncSource || 'Local Dataset').split(' + ');
  merged.syncSource = Array.from(new Set([...existingSources, ...incomingSources])).join(' + ');
  merged.source = merged.syncSource;

  return merged;
}

export function deduplicateColleges(colleges: IngestionCollege[]): IngestionCollege[] {
  const result: IngestionCollege[] = [];
  
  for (const item of colleges) {
    const stdName = standardizeCollegeName(item.name || '');
    const itemState = String(item.state || '').toLowerCase().trim();
    
    let isDuplicate = false;
    for (let i = 0; i < result.length; i++) {
      const existing = result[i];
      const existingStdName = standardizeCollegeName(existing.name || '');
      const existingState = String(existing.state || '').toLowerCase().trim();
      
      if (itemState === existingState || !itemState || !existingState) {
        if (stdName === existingStdName && stdName.length > 0) {
          isDuplicate = true;
          result[i] = mergeColleges(existing, item);
          break;
        }

        if (stdName.length > 5 && existingStdName.length > 5) {
          const dist = getLevenshteinDistance(stdName, existingStdName);
          const maxLen = Math.max(stdName.length, existingStdName.length);
          if (1 - dist / maxLen >= 0.85) {
            isDuplicate = true;
            result[i] = mergeColleges(existing, item);
            break;
          }
        }
      }
    }
    
    if (!isDuplicate) {
      result.push(item);
    }
  }
  
  return result;
}
