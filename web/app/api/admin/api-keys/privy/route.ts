import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Fallback file storage for development
const API_KEYS_FILE = path.join(process.cwd(), '.api-keys.json');

// Initialize Supabase client only if we have valid credentials
let supabase: any = null;

// We'll initialize Supabase lazily when needed to avoid errors at module load time
const getSupabaseClient = () => {
  if (supabase) return supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Check if we have valid Supabase credentials
  if (supabaseUrl && supabaseServiceKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
      return supabase;
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
      return null;
    }
  }

  return null;
};

// Helper function to read API keys from file (fallback for development)
const readApiKeysFromFile = (): Record<string, string> => {
  try {
    if (fs.existsSync(API_KEYS_FILE)) {
      const data = fs.readFileSync(API_KEYS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading API keys file:', error);
  }
  return {};
};

// Helper function to write API keys to file (fallback for development)
const writeApiKeysToFile = (keys: Record<string, string>): void => {
  try {
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing API keys file:', error);
    throw new Error('Failed to save API key');
  }
};

// GET handler to retrieve the Privy App ID
export async function GET(request: NextRequest) {
  try {
    // Try to get Supabase client
    const supabaseClient = getSupabaseClient();

    // If Supabase client is available, use it
    if (supabaseClient) {
      try {
        // Query the settings table for the Privy App ID
        const { data, error } = await supabaseClient
          .from('settings')
          .select('value')
          .eq('key', 'privy_app_id')
          .single();

        if (error) {
          console.error('Error retrieving Privy App ID from Supabase:', error);
          // Fall back to file storage if Supabase query fails
          const keys = readApiKeysFromFile();
          return NextResponse.json({
            apiKey: keys.privyAppId || '',
            source: 'file',
          });
        }

        return NextResponse.json({
          apiKey: data?.value || '',
          source: 'supabase',
        });
      } catch (error) {
        console.error('Error retrieving API key from Supabase:', error);
        // Fall back to file storage if Supabase throws an error
        const keys = readApiKeysFromFile();
        return NextResponse.json({
          apiKey: keys.privyAppId || '',
          source: 'file',
        });
      }
    } else {
      // If Supabase is not available, use file storage
      console.log('Supabase not available, using file storage for API keys');
      const keys = readApiKeysFromFile();
      return NextResponse.json({
        apiKey: keys.privyAppId || '',
        source: 'file',
      });
    }
  } catch (error) {
    console.error('Error retrieving API key:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API key' },
      { status: 500 }
    );
  }
}

// POST handler to save the Privy App ID
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      );
    }

    // Try to get Supabase client
    const supabaseClient = getSupabaseClient();

    // If Supabase client is available, use it
    if (supabaseClient) {
      try {
        // Check if the setting already exists
        const { data: existingData, error: queryError } = await supabaseClient
          .from('settings')
          .select('id')
          .eq('key', 'privy_app_id')
          .single();

        if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is the error code for "not found"
          console.error('Error checking for existing Privy App ID:', queryError);
          // Fall back to file storage if Supabase query fails
          const keys = readApiKeysFromFile();
          keys.privyAppId = apiKey;
          writeApiKeysToFile(keys);

          return NextResponse.json({
            success: true,
            message: 'API key saved successfully to file (Supabase fallback)',
            source: 'file'
          });
        }

        let result;

        if (existingData) {
          // Update existing setting
          result = await supabaseClient
            .from('settings')
            .update({ value: apiKey, updated_at: new Date().toISOString() })
            .eq('key', 'privy_app_id');
        } else {
          // Insert new setting
          result = await supabaseClient
            .from('settings')
            .insert({
              key: 'privy_app_id',
              value: apiKey,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
        }

        if (result.error) {
          console.error('Error saving Privy App ID to Supabase:', result.error);
          // Fall back to file storage if Supabase update/insert fails
          const keys = readApiKeysFromFile();
          keys.privyAppId = apiKey;
          writeApiKeysToFile(keys);

          return NextResponse.json({
            success: true,
            message: 'API key saved successfully to file (Supabase fallback)',
            source: 'file'
          });
        }

        return NextResponse.json({
          success: true,
          message: 'API key saved successfully to Supabase',
          source: 'supabase'
        });
      } catch (error) {
        console.error('Error saving API key to Supabase:', error);
        // Fall back to file storage if Supabase throws an error
        const keys = readApiKeysFromFile();
        keys.privyAppId = apiKey;
        writeApiKeysToFile(keys);

        return NextResponse.json({
          success: true,
          message: 'API key saved successfully to file (Supabase fallback)',
          source: 'file'
        });
      }
    } else {
      // If Supabase is not available, use file storage
      console.log('Supabase not available, using file storage for API keys');
      const keys = readApiKeysFromFile();
      keys.privyAppId = apiKey;
      writeApiKeysToFile(keys);

      return NextResponse.json({
        success: true,
        message: 'API key saved successfully to file',
        source: 'file'
      });
    }
  } catch (error) {
    console.error('Error saving API key:', error);
    return NextResponse.json(
      { error: 'Failed to save API key' },
      { status: 500 }
    );
  }
}
