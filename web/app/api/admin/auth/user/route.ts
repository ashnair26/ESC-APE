import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/utils/auth';
import { createAdminClient } from '@/utils/supabase';

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);

    if (!adminData) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For performance, we can return the token data directly
    // This avoids an extra database query on every auth check
    return NextResponse.json({
      success: true,
      user: {
        id: adminData.sub,
        email: adminData.email,
        name: adminData.name || '',
        role: adminData.role,
      },
      source: 'token' // Indicate data came from token
    });
  } catch (error) {
    console.error('Error fetching admin user data:', error); // Keep general error logging
    return NextResponse.json(
      { success: false, error: 'An error occurred while fetching user data' },
      { status: 500 }
    );
  }
}
