import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-server';
import { submitReview } from '@/lib/data-service';

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please login to review.' }, { status: 401 });
    }

    const { collegeId, rating, comment } = await req.json();

    if (!collegeId || rating === undefined || !comment) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    const ratingVal = parseFloat(rating);
    if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5.' }, { status: 400 });
    }

    const result = await submitReview({
      collegeId,
      userId: user.userId,
      userName: user.name,
      rating: ratingVal,
      comment,
    });

    return NextResponse.json({ success: true, review: result.data, isFallback: result.isFallback });
  } catch (error) {
    console.error('Submit review API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
