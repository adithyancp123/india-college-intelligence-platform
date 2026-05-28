import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-server';
import { getSavedColleges, toggleSavedCollege } from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const result = await getSavedColleges(user.userId);
    return NextResponse.json({ savedColleges: result.data, isFallback: result.isFallback });
  } catch (error) {
    console.error('Get saved colleges API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { collegeId } = await req.json();
    if (!collegeId) {
      return NextResponse.json({ error: 'College ID is required.' }, { status: 400 });
    }

    const result = await toggleSavedCollege(user.userId, collegeId);
    return NextResponse.json({ success: true, saved: result.data.saved, isFallback: result.isFallback });
  } catch (error) {
    console.error('Toggle saved college API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
