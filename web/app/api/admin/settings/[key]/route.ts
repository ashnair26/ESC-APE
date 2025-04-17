import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '@/utils/auth';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get a specific setting
export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { key } = params;

    // Get the setting
    const { data: setting, error } = await supabase
      .from('settings')
      .select('id, key, value, description, is_secret, created_at, updated_at')
      .eq('key', key)
      .single();

    if (error) {
      console.error('Error fetching setting:', error);
      return NextResponse.json(
        { error: 'Failed to fetch setting' },
        { status: 500 }
      );
    }

    if (!setting) {
      return NextResponse.json(
        { error: 'Setting not found' },
        { status: 404 }
      );
    }

    // Mask secret value
    if (setting.is_secret && setting.value) {
      setting.value = '••••••••••••••••';
    }

    return NextResponse.json({ setting });
  } catch (error) {
    console.error(`Error in GET /api/admin/settings/${params.key}:`, error);
    return NextResponse.json(
      { error: 'An error occurred while fetching setting' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a specific setting
export async function DELETE(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { key } = params;

    // Delete the setting
    const { error } = await supabase
      .from('settings')
      .delete()
      .eq('key', key);

    if (error) {
      console.error('Error deleting setting:', error);
      return NextResponse.json(
        { error: 'Failed to delete setting' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    console.error(`Error in DELETE /api/admin/settings/${params.key}:`, error);
    return NextResponse.json(
      { error: 'An error occurred while deleting setting' },
      { status: 500 }
    );
  }
}
