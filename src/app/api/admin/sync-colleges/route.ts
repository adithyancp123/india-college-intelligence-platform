import { NextResponse } from 'next/server';
import { runSyncColleges } from '@/lib/ingestion';

export async function POST(req: Request) {
  try {
    console.log('API Request: Triggering modular real college database sync...');
    const result = await runSyncColleges(true);
    
    // Build active source breakdown
    const sourceBreakdown = {
      ugc: result.isFallback ? 'UGC Web Registry (Local Backup)' : 'UGC Web Registry (API)',
      nirf: result.isFallback ? 'NIRF Ranking Feed (Local Backup)' : 'NIRF Ranking Feed (API)',
      aicte: result.isFallback ? 'AICTE Approvals Register (Local Backup)' : 'AICTE Approvals Register (API)',
      datagov: result.isFallback ? 'Data.gov.in Statistical API (Local Backup)' : 'Data.gov.in Statistical API (API)'
    };

    return NextResponse.json({
      success: true,
      message: 'Dynamic dataset sync completed successfully.',
      processed: result.count,
      added: result.added,
      updated: result.updated,
      failed: result.failed || 0,
      skipped: result.skipped || 0,
      sourceBreakdown,
      databaseOfflineMode: result.isFallback,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('API Ingestion sync route error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Synchronization failed due to an internal server error.',
      processed: 0,
      added: 0,
      updated: 0,
      failed: 1,
      skipped: 0,
      sourceBreakdown: {}
    }, { status: 500 });
  }
}
