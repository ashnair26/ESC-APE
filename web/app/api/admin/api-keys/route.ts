import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Fallback file storage for development
const API_KEYS_FILE = path.join(process.cwd(), '.api-keys.json');

// JWT secret key - must match the one used for login
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Function to verify admin authentication
const verifyAdminAuth = async (request: NextRequest) => {
  // Get the token from the cookie
  const cookieStore = cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) {
    return false;
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    // Check if the user has admin role
    if (decoded.role !== 'admin') {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

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
      const keys = JSON.parse(data);
      console.log('Read API keys from file:', keys);
      return keys;
    }
  } catch (error) {
    console.error('Error reading API keys file:', error);
  }
  return {};
};

// Helper function to write API keys to file (fallback for development)
const writeApiKeysToFile = (keys: Record<string, string>): void => {
  try {
    console.log('Writing API keys to file:', keys);
    fs.writeFileSync(API_KEYS_FILE, JSON.stringify(keys, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing API keys file:', error);
    throw new Error('Failed to save API key');
  }
};

// GET handler to retrieve all API keys
export async function GET(request: NextRequest) {
  // Verify admin authentication
  const isAdmin = await verifyAdminAuth(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 401 }
    );
  }
  try {
    // Try to get Supabase client
    const supabaseClient = getSupabaseClient();

    // If Supabase client is available, use it
    if (supabaseClient) {
      try {
        // Query the settings table for all API keys
        const { data, error } = await supabaseClient
          .from('settings')
          .select('key, value')
          .in('key', [
            'privy_app_id',
            'klaviyo_public_key',
            'stripe_publishable_key',
            'ipfs_gateway',
            'supabase_anon_key',
            'sanity_project_id'
          ]);

        if (error) {
          console.error('Error retrieving API keys from Supabase:', error);
          // Fall back to file storage if Supabase query fails
          const keys = readApiKeysFromFile();
          // Map file storage keys to API keys
          return NextResponse.json({
            keys: {
              privy_app_id: keys.privyAppId || '',
              klaviyo_public_key: keys.klaviyoPublicKey || '',
              stripe_publishable_key: keys.stripePublishableKey || '',
              ipfs_gateway: keys.ipfsGateway || '',
              supabase_anon_key: keys.supabaseAnonKey || '',
              sanity_project_id: keys.sanityProjectId || ''
            },
            source: 'file',
          });
        }

        // Convert array of objects to a single object
        const apiKeys: Record<string, string> = {};
        data.forEach((item: { key: string; value: string }) => {
          apiKeys[item.key] = item.value;
        });

        return NextResponse.json({
          keys: apiKeys,
          source: 'supabase',
        });
      } catch (error) {
        console.error('Error retrieving API keys from Supabase:', error);
        // Fall back to file storage if Supabase throws an error
        const keys = readApiKeysFromFile();
        // Map file storage keys to API keys
        return NextResponse.json({
          keys: {
            privy_app_id: keys.privyAppId || '',
            klaviyo_public_key: keys.klaviyoPublicKey || '',
            stripe_publishable_key: keys.stripePublishableKey || '',
            ipfs_gateway: keys.ipfsGateway || '',
            supabase_anon_key: keys.supabaseAnonKey || '',
            sanity_project_id: keys.sanityProjectId || ''
          },
          source: 'file',
        });
      }
    } else {
      // If Supabase is not available, use file storage
      console.log('Supabase not available, using file storage for API keys');
      const keys = readApiKeysFromFile();
      // Map file storage keys to API keys
      return NextResponse.json({
        keys: {
          privy_app_id: keys.privyAppId || '',
          klaviyo_public_key: keys.klaviyoPublicKey || '',
          stripe_publishable_key: keys.stripePublishableKey || '',
          ipfs_gateway: keys.ipfsGateway || '',
          supabase_anon_key: keys.supabaseAnonKey || '',
          sanity_project_id: keys.sanityProjectId || ''
        },
        source: 'file',
      });
    }
  } catch (error) {
    console.error('Error retrieving API keys:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve API keys' },
      { status: 500 }
    );
  }
}

// POST handler to save an API key
export async function POST(request: NextRequest) {
  // Verify admin authentication
  const isAdmin = await verifyAdminAuth(request);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Unauthorized. Admin access required.' },
      { status: 401 }
    );
  }
  try {
    const { key, value } = await request.json();

    if (!key || !value) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Validate key name
    const validKeys = [
      'privy_app_id',
      'klaviyo_public_key',
      'stripe_publishable_key',
      'ipfs_gateway',
      'supabase_anon_key',
      'sanity_project_id'
    ];

    if (!validKeys.includes(key)) {
      return NextResponse.json(
        { error: 'Invalid key name' },
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
          .eq('key', key)
          .single();

        if (queryError && queryError.code !== 'PGRST116') { // PGRST116 is the error code for "not found"
          console.error(`Error checking for existing ${key}:`, queryError);
          // Fall back to file storage if Supabase query fails
          const keys = readApiKeysFromFile();

          // Map the key to the file storage key
          const fileKey = key === 'privy_app_id' ? 'privyAppId' :
                         key === 'klaviyo_public_key' ? 'klaviyoPublicKey' :
                         key === 'stripe_publishable_key' ? 'stripePublishableKey' :
                         key === 'ipfs_gateway' ? 'ipfsGateway' :
                         key === 'supabase_anon_key' ? 'supabaseAnonKey' :
                         key === 'sanity_project_id' ? 'sanityProjectId' : key;

          keys[fileKey] = value;
          writeApiKeysToFile(keys);

          return NextResponse.json({
            success: true,
            message: `${key} saved successfully to file (Supabase fallback)`,
            source: 'file'
          });
        }

        let result;

        if (existingData) {
          // Update existing setting
          result = await supabaseClient
            .from('settings')
            .update({ value: value, updated_at: new Date().toISOString() })
            .eq('key', key);
        } else {
          // Insert new setting
          result = await supabaseClient
            .from('settings')
            .insert({
              key: key,
              value: value,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
        }

        if (result.error) {
          console.error(`Error saving ${key} to Supabase:`, result.error);
          // Fall back to file storage if Supabase update/insert fails
          const keys = readApiKeysFromFile();

          // Map the key to the file storage key
          const fileKey = key === 'privy_app_id' ? 'privyAppId' :
                         key === 'klaviyo_public_key' ? 'klaviyoPublicKey' :
                         key === 'stripe_publishable_key' ? 'stripePublishableKey' :
                         key === 'ipfs_gateway' ? 'ipfsGateway' :
                         key === 'supabase_anon_key' ? 'supabaseAnonKey' :
                         key === 'sanity_project_id' ? 'sanityProjectId' : key;

          keys[fileKey] = value;
          writeApiKeysToFile(keys);

          return NextResponse.json({
            success: true,
            message: `${key} saved successfully to file (Supabase fallback)`,
            source: 'file'
          });
        }

        return NextResponse.json({
          success: true,
          message: `${key} saved successfully to Supabase`,
          source: 'supabase'
        });
      } catch (error) {
        console.error(`Error saving ${key} to Supabase:`, error);
        // Fall back to file storage if Supabase throws an error
        const keys = readApiKeysFromFile();

        // Map the key to the file storage key
        const fileKey = key === 'privy_app_id' ? 'privyAppId' :
                       key === 'klaviyo_public_key' ? 'klaviyoPublicKey' :
                       key === 'stripe_publishable_key' ? 'stripePublishableKey' :
                       key === 'ipfs_gateway' ? 'ipfsGateway' :
                       key === 'supabase_anon_key' ? 'supabaseAnonKey' : key;

        keys[fileKey] = value;
        writeApiKeysToFile(keys);

        return NextResponse.json({
          success: true,
          message: `${key} saved successfully to file (Supabase fallback)`,
          source: 'file'
        });
      }
    } else {
      // If Supabase is not available, use file storage
      console.log('Supabase not available, using file storage for API keys');
      const keys = readApiKeysFromFile();

      // Map the key to the file storage key
      const fileKey = key === 'privy_app_id' ? 'privyAppId' :
                     key === 'klaviyo_public_key' ? 'klaviyoPublicKey' :
                     key === 'stripe_publishable_key' ? 'stripePublishableKey' :
                     key === 'ipfs_gateway' ? 'ipfsGateway' :
                     key === 'supabase_anon_key' ? 'supabaseAnonKey' :
                     key === 'sanity_project_id' ? 'sanityProjectId' : key;

      keys[fileKey] = value;
      writeApiKeysToFile(keys);

      return NextResponse.json({
        success: true,
        message: `${key} saved successfully to file`,
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
