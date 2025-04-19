import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// Use jose to verify the token, consistent with middleware and user route
import { jwtVerify } from 'jose';
const JWT_SECRET_STRING = process.env.JWT_SECRET || 'esc-ape-admin-jwt-secret-key-change-in-production';
const JWT_SECRET_UINT8ARRAY = new TextEncoder().encode(JWT_SECRET_STRING);

// Import Supabase client to delete session
import { createAdminClient } from '@/utils/supabase';

// Define expected payload structure
interface AdminJosePayload {
  sub?: string; // User ID
  sessionId?: string;
  // other fields aren't strictly needed for logout but might be present
}

export async function POST(request: NextRequest) {
  console.log('[API Logout] Received logout request.');
  try {
    // 1. Get token from cookie
    const token = request.cookies.get('admin_token')?.value;
    let sessionId: string | undefined;

    if (token) {
      // 2. Verify JWT to get session ID (optional but good practice)
      try {
        const verificationResult = await jwtVerify(token, JWT_SECRET_UINT8ARRAY);
        const payload = verificationResult.payload as AdminJosePayload;
        sessionId = payload.sessionId;
        console.log(`[API Logout] Token verified. Session ID: ${sessionId}`);
      } catch (jwtError) {
        // Token is invalid or expired, proceed to clear cookie anyway
        console.warn('[API Logout] Token verification failed during logout:', jwtError);
        // No need to throw error, just clear the potentially bad cookie
        sessionId = undefined; // Ensure we don't try to delete based on bad token
      }
    } else {
       console.log('[API Logout] No token found in request.');
    }

    // 3. Delete session from database if we have a valid session ID
    if (sessionId) {
      const supabase = createAdminClient();
      console.log(`[API Logout] Deleting session ${sessionId} from database...`);
      const { error: deleteError } = await supabase
        .from('admin_sessions')
        .delete()
        .eq('session_id', sessionId);

      if (deleteError) {
        // Log error but proceed to clear cookie anyway
        console.error('[API Logout] Error deleting session from database:', deleteError);
      } else {
         console.log(`[API Logout] Session ${sessionId} deleted successfully.`);
      }
    }

    // 4. Create response and clear the cookie
    console.log('[API Logout] Clearing admin_token cookie.');
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    response.cookies.set({
      name: 'admin_token',
      value: '', // Set value to empty
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1, // Expire immediately
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('[API Logout] Unexpected error during logout:', error);
    // Still try to clear the cookie even if other errors occur
    const response = NextResponse.json({ success: false, error: 'An error occurred during logout' }, { status: 500 });
     response.cookies.set({
      name: 'admin_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: -1,
      path: '/',
    });
    return response;
  }
}

// Ensure this route uses Node.js runtime for Supabase client
export const runtime = 'nodejs';
