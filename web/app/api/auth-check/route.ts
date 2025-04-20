import { NextRequest, NextResponse } from 'next/server';
import { PrivyClient } from '@privy-io/server-auth';
import { createAdminClient } from '@/utils/supabase'; // Use admin client for upsert

const privyAppId = process.env.NEXT_PUBLIC_PRIVY_APP_ID || '';
const privyAppSecret = process.env.PRIVY_APP_SECRET || ''; // Ensure this is set in your env

if (!privyAppId || !privyAppSecret) {
  console.error('Privy App ID or Secret is not configured for server-side verification.');
  // Handle error appropriately in production
}

// Log the loaded env vars to debug
console.log(`[Auth Check API] Loaded Privy App ID: ${privyAppId}`);
console.log(`[Auth Check API] Loaded Privy App Secret (first 5 chars): ${privyAppSecret.substring(0, 5)}...`);


const privyClient = new PrivyClient(privyAppId, privyAppSecret);
const supabaseAdmin = createAdminClient(); // Initialize Supabase admin client

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Auth token is required' }, { status: 400 });
    }

    // 1. Verify Privy Token to get the user's Privy ID (DID)
    const verifiedClaims = await privyClient.verifyAuthToken(token);
    const privyUserId = verifiedClaims.userId;
    console.log(`[Auth Check] Verified Privy User ID: ${privyUserId}`);

    // 2. Fetch the full user object from Privy using the DID
    const user = await privyClient.getUser(privyUserId);
    if (!user) {
      throw new Error(`Could not find user with Privy ID: ${privyUserId}`);
    }

    // 3. Extract user details from the fetched user object
    const userDetails = {
      privy_user_id: user.id, // Same as privyUserId
      wallet_address: user.wallet?.address || null,
      farcaster_fid: user.farcaster?.fid || null,
      twitter_handle: user.twitter?.username || null,
      // Add other fields as needed from the user object
    };

    // 4. Upsert User into Supabase `users` table
    // Use privy_user_id as the unique identifier for upserting
    // Let Supabase generate the primary key 'id' (UUID)
    const { data: upsertedUser, error: upsertError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          privy_user_id: userDetails.privy_user_id,
          wallet: userDetails.wallet_address,
          farcaster_fid: userDetails.farcaster_fid,
          twitter_handle: userDetails.twitter_handle,
          // last_login: new Date().toISOString(), // Optionally update last login
        },
        { onConflict: 'privy_user_id' } // Use privy_user_id for conflict resolution
      )
      .select('id') // Select the Supabase-generated UUID
      .single();

    if (upsertError) {
      console.error('[Auth Check] Supabase upsert error:', upsertError);
      throw new Error('Failed to sync user data');
    }
    console.log(`[Auth Check] User upserted/found in Supabase: ${upsertedUser?.id}`);


    // --- TODO: Implement Routing Logic based on PLANNING.md ---
    // This part needs the actual logic to check creator/member status

    // 3. Check if Creator (Placeholder - needs actual implementation)
    // Example: Check if user ID exists in a 'creators' table
    // const { data: creatorData, error: creatorError } = await supabaseAdmin
    //   .from('creators') // Assuming a 'creators' table linked to 'users'
    //   .select('id')
    //   .eq('user_id', privyUserId) // Assuming link via privyUserId/users.id
    //   .maybeSingle();
    // if (creatorData) {
    //   console.log('[Auth Check] User is a Creator. Redirecting to dashboard.');
    //   return NextResponse.json({ redirect: '/creator-dashboard' });
    // }

    // 4. Check if Member (Placeholder - needs actual implementation)
    // Example: Check 'community_members' table
    // const { data: memberData, error: memberError } = await supabaseAdmin
    //   .from('community_members') // Assuming this table exists
    //   .select('communities(slug)') // Assuming relation to get community slug
    //   .eq('user_id', privyUserId)
    //   .limit(1)
    //   .maybeSingle();
    // if (memberData && memberData.communities) {
    //   console.log(`[Auth Check] User is a Member of ${memberData.communities.slug}. Redirecting.`);
    //   return NextResponse.json({ redirect: `/community/${memberData.communities.slug}` });
    // }

    // 5. New User - Redirect to Onboarding
    console.log('[Auth Check] New user or no specific role found. Redirecting to onboarding.');
    return NextResponse.json({ redirect: '/onboarding/welcome' });
    // --- End of TODO ---

  } catch (error: any) {
    console.error('[Auth Check] Error:', error);
    // Handle specific Privy errors if needed
    if (error.message?.includes('invalid')) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
