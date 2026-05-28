import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-server';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Auth me check error:', error);
    return NextResponse.json({ user: null });
  }
}
