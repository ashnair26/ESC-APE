import { NextRequest, NextResponse } from 'next/server';
// We need jose here to verify the token, as middleware uses it now
// And we need the secret key prepared the same way
import { jwtVerify } from 'jose';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'esc-ape-admin-jwt-secret-key-change-in-production';
const JWT_SECRET_UINT8ARRAY = new TextEncoder().encode(JWT_SECRET_STRING);

// Import Supabase client to check session table
import { createAdminClient } from '@/utils/supabase';

// Define expected payload structure from jose verification
interface AdminJosePayload {
  sub?: string; // User ID
  email?: string;
  name?: string;
  role?: string;
  sessionId?: string; // Expecting session ID from login route
  iat?: number;
  exp?: number;
}


export async function GET(request: NextRequest) {
  try {
    // 1. Get token from cookie
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No token' }, { status: 401 });
    }

    // 2. Verify JWT using jose
    let payload: AdminJosePayload;
    try {
      const verificationResult = await jwtVerify(token, JWT_SECRET_UINT8ARRAY);
      payload = verificationResult.payload;
    } catch (jwtError) {
      console.error('JWT verification failed in /api/admin/auth/user:', jwtError);
      // Clear potentially invalid cookie
       const response = NextResponse.json({ success: false, error: 'Unauthorized: Invalid token' }, { status: 401 });
       response.cookies.delete('admin_token');
       return response;
    }

    // 3. Extract necessary info from payload
    const adminId = payload.sub;
    const sessionId = payload.sessionId;
    const userRole = payload.role;

    if (!adminId || !sessionId || userRole !== 'admin') {
       console.error('Invalid payload data:', payload);
       return NextResponse.json({ success: false, error: 'Unauthorized: Invalid token payload' }, { status: 401 });
    }

    // 4. Check database session validity
    const supabase = createAdminClient();
    const now = new Date();

    const { data: sessionData, error: sessionError } = await supabase
      .from('admin_sessions')
      .select('expires_at')
      .eq('admin_id', adminId)
      .eq('session_id', sessionId)
      .single(); // Expect only one matching session

    if (sessionError || !sessionData) {
        console.error('Error fetching session or session not found:', sessionError);
        // Clear cookie if session doesn't exist in DB
        const response = NextResponse.json({ success: false, error: 'Unauthorized: Session not found' }, { status: 401 });
        response.cookies.delete('admin_token');
        return response;
    }

    // Check if the database session has expired
    const expiresAt = new Date(sessionData.expires_at);
    if (expiresAt <= now) {
        console.log('Session expired according to database.');
         // Clear cookie if session expired in DB
        const response = NextResponse.json({ success: false, error: 'Unauthorized: Session expired' }, { status: 401 });
        response.cookies.delete('admin_token');
        // Optionally: Clean up expired session from DB here or via a scheduled task
        // await supabase.from('admin_sessions').delete().match({ session_id: sessionId });
        return response;
    }

    // 5. If JWT is valid AND DB session is valid, return user data
    return NextResponse.json({
      success: true,
      user: {
        id: adminId,
        email: payload.email || '',
        name: payload.name || '',
        role: userRole,
      },
      source: 'token+db_session' // Indicate source
    });

  } catch (error) {
    console.error('Error fetching admin user data:', error);
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}

// Ensure this route uses Node.js runtime for Supabase client & crypto
export const runtime = 'nodejs';
