import { College, Course, readFallbackDb, writeFallbackDb } from '../mock-data';
import { prisma, checkDatabaseConnection } from '../db';
import { fetchHybridDataset } from './source-adapters';
import { normalizeCollege } from './normalize';
import { deduplicateColleges } from './deduplicate';
import { writeCollegesToCache } from './cache';
import { validateRawCollege } from './validators';
import fs from 'fs';
import path from 'path';

export let collegeCache: College[] = [];
export let searchIndex: Map<string, Set<string>> = new Map();
export let indexInitialized = false;

export async function runIngestion(rawColleges: any[]): Promise<{
  count: number;
  added: number;
  updated: number;
  failed: number;
  skipped: number;
}> {
  console.log(`Starting dynamic sync engine ingestion for ${rawColleges.length} colleges.`);

  let added = 0;
  let updated = 0;
  let failed = 0;
  let skipped = 0;

  const normalizedColleges: any[] = [];
  
  for (const raw of rawColleges) {
    const errors = validateRawCollege(raw);
    if (errors.length > 0) {
      console.warn(`Validation failed for raw record "${raw.name}":`, errors);
      failed++;
      continue;
    }
    
    try {
      normalizedColleges.push(normalizeCollege(raw));
    } catch (e) {
      console.error(`Normalization failed for raw record "${raw.name}":`, e);
      failed++;
    }
  }

  const deduplicated = deduplicateColleges(normalizedColleges);
  const isDbOnline = await checkDatabaseConnection();

  if (isDbOnline && prisma) {
    for (const data of deduplicated) {
      const { courses, coordinates, source, lastUpdated, confidenceScore, ...fields } = data as any;
      
      try {
        const existing = await prisma.college.findFirst({
          where: {
            name: { equals: fields.name, mode: 'insensitive' },
            state: { equals: fields.state, mode: 'insensitive' }
          }
        });

        if (existing) {
          await prisma.college.update({
            where: { id: existing.id },
            data: {
              ...fields,
              syncLastUpdated: new Date(),
              updatedAt: new Date()
            }
          });
          
          if (courses && courses.length > 0) {
            await prisma.course.deleteMany({ where: { collegeId: existing.id } });
            await prisma.course.createMany({
              data: courses.map((crs: any) => ({
                name: crs.name,
                duration: crs.duration,
                fees: crs.fees,
                seats: crs.seats,
                cutoffRank: crs.cutoffRank,
                exam: crs.exam,
                collegeId: existing.id
              }))
            });
          }
          updated++;
        } else {
          await prisma.college.create({
            data: {
              ...fields,
              syncLastUpdated: new Date(),
              courses: {
                create: courses.map((crs: any) => ({
                  name: crs.name,
                  duration: crs.duration,
                  fees: crs.fees,
                  seats: crs.seats,
                  cutoffRank: crs.cutoffRank,
                  exam: crs.exam
                }))
              }
            }
          });
          added++;
        }
      } catch (err) {
        console.error(`Database transaction error during ingestion of "${fields.name}":`, err);
        failed++;
      }
    }
    
    try {
      const allColleges = await prisma.college.findMany();
      collegeCache = allColleges.map((c: any) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        syncLastUpdated: c.syncLastUpdated.toISOString()
      }));
      writeCollegesToCache(collegeCache);
    } catch (e) {
      console.error('Failed to update cache after sync', e);
    }
  } else {
    const fallbackDb = readFallbackDb();
    
    for (const data of deduplicated) {
      const { courses, coordinates, source, lastUpdated, confidenceScore, ...fields } = data as any;
      
      try {
        const existingIndex = fallbackDb.colleges.findIndex(
          c => c.name.toLowerCase() === fields.name.toLowerCase() && c.state.toLowerCase() === fields.state.toLowerCase()
        );

        if (existingIndex > -1) {
          const id = fallbackDb.colleges[existingIndex].id;
          fallbackDb.colleges[existingIndex] = {
            ...fallbackDb.colleges[existingIndex],
            ...fields,
            id,
            syncLastUpdated: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          if (courses && courses.length > 0) {
            fallbackDb.courses = fallbackDb.courses.filter(crs => crs.collegeId !== id);
            courses.forEach((crs: any) => {
              fallbackDb.courses.push({
                ...crs,
                id: crs.id || `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                collegeId: id
              });
            });
          }
          updated++;
        } else {
          const newId = `col-ingest-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          fallbackDb.colleges.push({
            ...fields,
            id: newId,
            syncLastUpdated: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          if (courses) {
            courses.forEach((crs: any) => {
              fallbackDb.courses.push({
                ...crs,
                id: crs.id || `course-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                collegeId: newId
              });
            });
          }
          added++;
        }
      } catch (err) {
        console.error(`Fallback JSON write error during ingestion of "${fields.name}":`, err);
        failed++;
      }
    }
    
    writeFallbackDb(fallbackDb);
    collegeCache = fallbackDb.colleges;
    writeCollegesToCache(collegeCache);
  }

  indexInitialized = false;
  searchIndex.clear();
  setTimeout(() => loadCacheAndIndex(), 100);

  return {
    count: deduplicated.length,
    added,
    updated,
    failed,
    skipped
  };
}

export async function runSyncColleges(force = false): Promise<{
  count: number;
  added: number;
  updated: number;
  failed: number;
  skipped: number;
  sources: string[];
  isFallback: boolean;
}> {
  console.log('Ingestion Sync Engine: starting dynamic runSyncColleges...');
  
  const remote = await fetchHybridDataset();
  
  const localRawPath = path.join(process.cwd(), 'prisma', 'india-colleges-raw.json');
  let baseColleges: any[] = [];
  try {
    if (fs.existsSync(localRawPath)) {
      baseColleges = JSON.parse(fs.readFileSync(localRawPath, 'utf-8')).colleges || [];
    }
  } catch (e) {
    console.error('Failed to load local base raw list:', e);
  }

  const mergedRawColleges = [...baseColleges];

  remote.ugc.forEach(ugc => {
    const stdUgcName = standardizeCollegeName(ugc.name);
    const exists = mergedRawColleges.some(c => standardizeCollegeName(c.name) === stdUgcName);
    if (!exists) {
      mergedRawColleges.push({
        name: ugc.name,
        state: ugc.state,
        ownership: ugc.type === 'Central' ? 'Government' : 'Private',
        website: ugc.website || null,
        fees: 0,
        averagePackage: 0,
        highestPackage: 0,
        placementRate: 0,
        rating: 4.0,
        established: 2005,
        facilities: [],
        exams: ['CUET'],
        courses: []
      });
    }
  });

  const enrichedColleges = mergedRawColleges.map(col => {
    const stdName = standardizeCollegeName(col.name);
    const sourcesUsed = ['Local Base Dataset'];

    const ugcMatch = remote.ugc.find(u => standardizeCollegeName(u.name) === stdName);
    if (ugcMatch) {
      col.ownership = ugcMatch.type === 'Central' ? 'Government' : 'Private';
      if (ugcMatch.website) col.website = ugcMatch.website;
      sourcesUsed.push('UGC Registry');
    }

    const nirfMatch = remote.nirf.find(n => standardizeCollegeName(n.name) === stdName);
    if (nirfMatch) {
      col.nirfRank = nirfMatch.rank;
      sourcesUsed.push('NIRF Rankings');
    }

    const aicteMatch = remote.aicte.find(a => standardizeCollegeName(a.name) === stdName);
    if (aicteMatch) {
      if (aicteMatch.facilities) {
        col.facilities = Array.from(new Set([...(col.facilities || []), ...aicteMatch.facilities]));
      }
      if (aicteMatch.accreditation) {
        col.accreditation = aicteMatch.accreditation;
      }
      sourcesUsed.push('AICTE approvals registry');
    }

    const dgMatch = remote.datagov.find(d => standardizeCollegeName(d.name) === stdName);
    if (dgMatch) {
      if (dgMatch.avgPackage) col.averagePackage = dgMatch.avgPackage;
      if (dgMatch.highestPackage) col.highestPackage = dgMatch.highestPackage;
      if (dgMatch.placementRate) col.placementRate = dgMatch.placementRate;
      if (dgMatch.fees) col.fees = dgMatch.fees;
      sourcesUsed.push('Data.gov.in statistics');
    }

    col.syncSource = Array.from(new Set(sourcesUsed)).join(' + ');
    return col;
  });

  const result = await runIngestion(enrichedColleges);

  return {
    ...result,
    sources: remote.sources,
    isFallback: remote.isFullFallback
  };
}

export async function loadCacheAndIndex() {
  if (collegeCache.length > 0 && indexInitialized) return;
  
  const isDbOnline = await checkDatabaseConnection();
  if (isDbOnline && prisma) {
    try {
      const dbColleges = await prisma.college.findMany();
      collegeCache = dbColleges.map((c: any) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        syncLastUpdated: c.syncLastUpdated.toISOString()
      }));
    } catch (e) {
      const db = readFallbackDb();
      collegeCache = db.colleges;
    }
  } else {
    const db = readFallbackDb();
    collegeCache = db.colleges;
  }

  searchIndex.clear();
  collegeCache.forEach(col => {
    const tokens = tokenizeText(`${col.name} ${col.city} ${col.state} ${col.exams.join(' ')}`);
    tokens.forEach(tok => {
      if (!searchIndex.has(tok)) {
        searchIndex.set(tok, new Set());
      }
      searchIndex.get(tok)!.add(col.id);
    });
  });

  indexInitialized = true;
  console.log(`Fuzzy search index initialized with ${collegeCache.length} colleges.`);
}

function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 1);
}

function getLevenshteinDistance(a: string, b: string): number {
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

export async function searchFuzzy(queryText: string, limit = 8): Promise<College[]> {
  await loadCacheAndIndex();
  const queryTokens = tokenizeText(queryText);
  if (queryTokens.length === 0) return [];

  const matchedCollegeIds = new Map<string, number>();

  queryTokens.forEach(qTok => {
    if (searchIndex.has(qTok)) {
      searchIndex.get(qTok)!.forEach(id => {
        matchedCollegeIds.set(id, (matchedCollegeIds.get(id) || 0) + 10);
      });
    }

    searchIndex.forEach((collegeSet, idxTok) => {
      if (idxTok === qTok) return;

      if (idxTok.startsWith(qTok)) {
        collegeSet.forEach(id => {
          matchedCollegeIds.set(id, (matchedCollegeIds.get(id) || 0) + 5);
        });
        return;
      }

      const limitDist = qTok.length > 4 ? 2 : 1;
      const distance = getLevenshteinDistance(qTok, idxTok);
      if (distance <= limitDist) {
        const score = distance === 1 ? 4 : 2;
        collegeSet.forEach(id => {
          matchedCollegeIds.set(id, (matchedCollegeIds.get(id) || 0) + score);
        });
      }
    });
  });

  const results = Array.from(matchedCollegeIds.entries())
    .map(([id, indexScore]) => {
      const college = collegeCache.find(c => c.id === id);
      if (!college) return null;

      let nameBoost = 0;
      const queryLower = queryText.toLowerCase();
      if (college.name.toLowerCase().includes(queryLower)) {
        nameBoost = 20;
      }

      const finalScore = indexScore + nameBoost;
      return { college, score: finalScore };
    })
    .filter((x): x is { college: College; score: number } => x !== null);

  results.sort((a, b) => b.score - a.score);
  return results.map(r => r.college).slice(0, limit);
}

export async function getSearchSuggestions(queryText: string): Promise<string[]> {
  const matches = await searchFuzzy(queryText, 5);
  const suggestions: string[] = [];
  matches.forEach(m => {
    suggestions.push(m.name);
    suggestions.push(`${m.city}, ${m.state}`);
  });
  return Array.from(new Set(suggestions)).slice(0, 5);
}

function standardizeCollegeName(name: string): string {
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
