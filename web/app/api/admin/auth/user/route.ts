import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// JWT secret key - must match the one used for login
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
  try {
    // Get the token from the cookie
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
      }, { status: 401 });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
      
      // Return the user information
      return NextResponse.json({
        success: true,
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          role: decoded.role,
        },
      });
    } catch (error) {
      // If token verification fails, clear the cookie
      cookieStore.delete('admin_token');
      
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred during authentication verification',
    }, { status: 500 });
  }
}
