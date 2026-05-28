import { NextResponse } from 'next/server';
import { parseAndAnswerQuery } from '@/lib/intelligence/counselor';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Query message is required.' }, { status: 400 });
    }
    
    const answer = await parseAndAnswerQuery(message);
    return NextResponse.json({ success: true, answer });
  } catch (error: any) {
    console.error('Counselor API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
  }
}
