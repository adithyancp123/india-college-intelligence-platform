import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'college-discovery-secret-key-12345';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: { userId: string; email: string; name: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string; email: string; name: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; email: string; name: string };
  } catch (error) {
    return null;
  }
}

export async function getUserFromRequest(req: Request): Promise<{ userId: string; email: string; name: string } | null> {
  try {
    // Read cookie from request
    const cookieHeader = req.headers.get('cookie') || '';
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const parts = cookie.split('=');
      const name = parts[0].trim();
      const val = parts.slice(1).join('=');
      acc[name] = val;
      return acc;
    }, {} as Record<string, string>);

    const token = cookies['college_auth_token'];
    if (!token) return null;

    return verifyToken(token);
  } catch (error) {
    return null;
  }
}
