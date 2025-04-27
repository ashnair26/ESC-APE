import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// JWT secret key from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'esc-ape-admin-jwt-secret-key-change-in-production';

// Ensure JWT_SECRET is set
if (!JWT_SECRET) {
  console.error('JWT_SECRET environment variable is not set');
}

// Interface for the admin token payload
export interface AdminTokenPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat: number;
  exp?: number;
}

/**
 * Verify the admin token from the request
 * @param request The Next.js request object
 * @returns The admin token payload if valid, null otherwise
 */
export async function verifyAdminToken(request: NextRequest): Promise<AdminTokenPayload | null> {
  try {
    // Get the token from the cookie in the request
    const token = request.cookies.get('admin_token')?.value;

    // If no token, check the Authorization header
    const authHeader = request.headers.get('Authorization');
    const headerToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    // Use the token from the cookie or the header
    const finalToken = token || headerToken;

    if (!finalToken) {
      return null;
    }

    // Verify the token
    const decoded = jwt.verify(finalToken, JWT_SECRET) as AdminTokenPayload;

    // Check if the token is expired
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Error verifying admin token:', error);
    return null;
  }
}

/**
 * Create a new admin token
 * @param payload The admin token payload
 * @param expiresIn The token expiry time (default: 24h)
 * @returns The JWT token
 */
export function createAdminToken(
  payload: Omit<AdminTokenPayload, 'iat' | 'exp'>,
  expiresIn: string = '24h'
): string {
  return jwt.sign(
    {
      ...payload,
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn }
  );
}
