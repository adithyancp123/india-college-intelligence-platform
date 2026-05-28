import { NextResponse } from 'next/server';
import { getColleges } from '@/lib/data-service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const state = searchParams.get('state') || undefined;
    const city = searchParams.get('city') || undefined;
    const ownership = searchParams.get('ownership') || undefined;
    const minFees = searchParams.get('minFees') ? parseInt(searchParams.get('minFees')!) : undefined;
    const maxFees = searchParams.get('maxFees') ? parseInt(searchParams.get('maxFees')!) : undefined;
    const minRating = searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined;
    const minPlacementRate = searchParams.get('minPlacementRate') ? parseFloat(searchParams.get('minPlacementRate')!) : undefined;
    const minPackage = searchParams.get('minPackage') ? parseFloat(searchParams.get('minPackage')!) : undefined;
    const nirfRankMax = searchParams.get('nirfRankMax') ? parseInt(searchParams.get('nirfRankMax')!) : undefined;
    const accreditation = searchParams.get('accreditation') || undefined;
    const course = searchParams.get('course') || undefined;
    const roiScoreMin = searchParams.get('roiScoreMin') ? parseFloat(searchParams.get('roiScoreMin')!) : undefined;
    const scholarshipFriendly = searchParams.get('scholarshipFriendly') === 'true' ? true : undefined;
    const trending = searchParams.get('trending') === 'true' ? true : undefined;

    const examsParam = searchParams.get('exams');
    const exams = examsParam ? examsParam.split(',').map(e => e.trim()).filter(Boolean) : undefined;

    const sortBy = (searchParams.get('sortBy') as any) || undefined;
    const sortOrder = (searchParams.get('sortOrder') as any) || undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const result = await getColleges({
      search,
      state,
      city,
      ownership,
      minFees,
      maxFees,
      minRating,
      minPlacementRate,
      minPackage,
      nirfRankMax,
      exams,
      accreditation,
      course,
      roiScoreMin,
      scholarshipFriendly,
      trending,
      sortBy,
      sortOrder,
      page,
      limit,
    });

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Fetch colleges API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
