import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminToken } from '@/utils/auth';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET - Get all settings
export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all settings
    const { data: settings, error } = await supabase
      .from('settings')
      .select('id, key, value, description, is_secret, created_at, updated_at')
      .order('key');

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
        { status: 500 }
      );
    }

    // Mask secret values
    const maskedSettings = settings.map(setting => {
      if (setting.is_secret && setting.value) {
        return {
          ...setting,
          value: '••••••••••••••••'
        };
      }
      return setting;
    });

    return NextResponse.json({ settings: maskedSettings });
  } catch (error) {
    console.error('Error in GET /api/admin/settings:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching settings' },
      { status: 500 }
    );
  }
}

// POST - Create or update a setting
export async function POST(request: NextRequest) {
  try {
    // Verify admin token
    const adminData = await verifyAdminToken(request);
    if (!adminData) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { key, value, description, is_secret } = await request.json();

    // Validate input
    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    // Check if setting already exists
    const { data: existingSetting } = await supabase
      .from('settings')
      .select('id')
      .eq('key', key)
      .single();

    let result;

    if (existingSetting) {
      // Update existing setting
      const { data, error } = await supabase
        .from('settings')
        .update({
          value,
          description,
          is_secret: is_secret !== undefined ? is_secret : false,
          updated_at: new Date().toISOString(),
          updated_by: adminData.sub
        })
        .eq('id', existingSetting.id)
        .select('id, key, description, is_secret, created_at, updated_at')
        .single();

      if (error) {
        console.error('Error updating setting:', error);
        return NextResponse.json(
          { error: 'Failed to update setting' },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new setting
      const { data, error } = await supabase
        .from('settings')
        .insert({
          key,
          value,
          description,
          is_secret: is_secret !== undefined ? is_secret : false,
          updated_by: adminData.sub
        })
        .select('id, key, description, is_secret, created_at, updated_at')
        .single();

      if (error) {
        console.error('Error creating setting:', error);
        return NextResponse.json(
          { error: 'Failed to create setting' },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json({
      success: true,
      setting: {
        ...result,
        value: is_secret ? '••••••••••••••••' : value
      }
    });
  } catch (error) {
    console.error('Error in POST /api/admin/settings:', error);
    return NextResponse.json(
      { error: 'An error occurred while saving setting' },
      { status: 500 }
    );
  }
}
