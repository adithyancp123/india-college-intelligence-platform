import { NextResponse } from 'next/server';
import { getCollegeById } from '@/lib/data-service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;

    if (!id) {
      return NextResponse.json({ error: 'College ID is required.' }, { status: 400 });
    }

    const result = await getCollegeById(id);
    const college = result.data;

    if (!college) {
      return NextResponse.json({ error: 'College not found.' }, { status: 404 });
    }

    return NextResponse.json({ college, isFallback: result.isFallback });
  } catch (error) {
    console.error('Fetch college detail API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
