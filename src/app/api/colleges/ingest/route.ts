import { NextResponse } from 'next/server';
import { runIngestion } from '@/lib/ingestion';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    let rawColleges: any[] = [];
    
    try {
      const body = await req.json();
      if (body && Array.isArray(body.colleges)) {
        rawColleges = body.colleges;
      }
    } catch (e) {
      // Ignore body parsing errors and try fallback file
    }

    if (rawColleges.length === 0) {
      const rawPath = path.join(process.cwd(), 'prisma', 'india-colleges-raw.json');
      if (fs.existsSync(rawPath)) {
        const fileContent = fs.readFileSync(rawPath, 'utf-8');
        const parsed = JSON.parse(fileContent);
        if (parsed && Array.isArray(parsed.colleges)) {
          rawColleges = parsed.colleges;
        }
      }
    }

    if (rawColleges.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No raw colleges dataset found to ingest.'
      }, { status: 400 });
    }

    const result = await runIngestion(rawColleges);

    return NextResponse.json({
      success: true,
      message: 'Ingestion completed successfully.',
      ...result
    });
  } catch (error: any) {
    console.error('Ingestion API error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error during ingestion'
    }, { status: 500 });
  }
}
