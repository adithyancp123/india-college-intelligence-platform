import { NextResponse } from 'next/server';
import { prisma, checkDatabaseConnection } from '@/lib/db';
import { readFallbackDb } from '@/lib/mock-data';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const isDbOnline = await checkDatabaseConnection();
    let colleges: any[] = [];
    
    if (isDbOnline && prisma) {
      colleges = await prisma.college.findMany();
    } else {
      const fallback = readFallbackDb();
      colleges = fallback.colleges;
    }

    // Cache Stats
    const cachePath = path.join(process.cwd(), 'cache', 'normalized-colleges.json');
    let cacheExists = false;
    let cacheSize = 0;
    let cacheLastUpdated = '';
    
    if (fs.existsSync(cachePath)) {
      cacheExists = true;
      const stats = fs.statSync(cachePath);
      cacheSize = stats.size;
      cacheLastUpdated = stats.mtime.toISOString();
    }

    // Compute metrics
    const total = colleges.length;
    let totalConfidence = 0;
    const missingCounts: { [key: string]: number } = {};
    const sourceCounts: { [key: string]: number } = {};

    colleges.forEach(c => {
      totalConfidence += c.syncConfidenceScore || 90;
      
      const missing = c.syncMissingFields || [];
      missing.forEach((f: string) => {
        missingCounts[f] = (missingCounts[f] || 0) + 1;
      });

      const sources = String(c.syncSource || 'Local Dataset').split(' + ');
      sources.forEach((s: string) => {
        sourceCounts[s] = (sourceCounts[s] || 0) + 1;
      });
    });

    const averageConfidence = total > 0 ? parseFloat((totalConfidence / total).toFixed(1)) : 100;
    
    const missingPercentages = Object.entries(missingCounts).map(([field, count]) => ({
      field,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
      count
    })).sort((a, b) => b.percentage - a.percentage);

    const sourcesSummary = Object.entries(sourceCounts).map(([source, count]) => ({
      source,
      percentage: parseFloat(((count / total) * 100).toFixed(1)),
      count
    }));

    return NextResponse.json({
      success: true,
      databaseOnline: isDbOnline,
      collegesProcessed: total,
      averageConfidence,
      sourcesSummary,
      missingPercentages,
      cacheHealth: {
        exists: cacheExists,
        sizeBytes: cacheSize,
        lastUpdated: cacheLastUpdated,
        isValid: cacheExists && (Date.now() - new Date(cacheLastUpdated).getTime() < 3600000)
      },
      lastSyncTimestamp: colleges.length > 0 && colleges[0].syncLastUpdated
        ? colleges[0].syncLastUpdated
        : new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Data health API error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
