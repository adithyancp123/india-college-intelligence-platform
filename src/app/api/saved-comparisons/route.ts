import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-server';
import { getSavedComparisons, saveComparison, deleteComparison } from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const result = await getSavedComparisons(user.userId);
    return NextResponse.json({ comparisons: result.data, isFallback: result.isFallback });
  } catch (error) {
    console.error('Get comparisons API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { name, collegeIds } = await req.json();
    if (!name || !collegeIds || !Array.isArray(collegeIds) || collegeIds.length === 0) {
      return NextResponse.json({ error: 'Comparison name and a list of colleges are required.' }, { status: 400 });
    }

    const result = await saveComparison(user.userId, name, collegeIds);
    return NextResponse.json({ success: true, comparison: result.data, isFallback: result.isFallback });
  } catch (error) {
    console.error('Save comparison API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Comparison ID is required.' }, { status: 400 });
    }

    const result = await deleteComparison(user.userId, id);
    return NextResponse.json({ success: result.data.success, isFallback: result.isFallback });
  } catch (error) {
    console.error('Delete comparison API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
