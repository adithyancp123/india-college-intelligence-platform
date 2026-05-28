import { NextResponse } from 'next/server';
import { getUserByEmail, createUser } from '@/lib/data-service';
import { hashPassword, signToken } from '@/lib/auth-server';

export async function POST(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name || !password) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    // Check if user exists
    const existing = await getUserByEmail(email);
    if (existing.data) {
      return NextResponse.json({ error: 'User with this email already exists.' }, { status: 400 });
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const createResult = await createUser(email, name, passwordHash);
    const user = createResult.data;

    // Sign JWT
    const token = signToken({ userId: user.id, email: user.email, name: user.name });

    // Set cookie
    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
      isFallback: createResult.isFallback
    });

    response.headers.set(
      'Set-Cookie',
      `college_auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
