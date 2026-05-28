import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/data-service';
import { comparePassword, signToken } from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    // Get user
    const userResult = await getUserByEmail(email);
    const user = userResult.data;

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
    }

    // Sign JWT
    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.name, name: user.name },
      isFallback: userResult.isFallback
    });

    response.headers.set(
      'Set-Cookie',
      `college_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
