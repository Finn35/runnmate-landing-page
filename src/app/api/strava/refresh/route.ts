import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a server-side only client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Using service role key for admin operations
  {
    auth: { persistSession: false }
  }
);

// Force Node.js runtime for proper environment variable access
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) {
      console.error('Missing Strava credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const { userEmail } = await request.json();

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    console.log('Fetching Strava verification for:', userEmail);

    // Get the user's Strava verification
    const { data: verification, error: verificationError } = await supabase
      .from('user_strava_verifications')
      .select()
      .eq('user_email', userEmail)
      .eq('is_active', true)
      .single();

    if (verificationError) {
      console.error('Error fetching verification:', verificationError);
      return NextResponse.json(
        { error: 'Failed to fetch verification' },
        { status: 500 }
      );
    }

    if (!verification) {
      return NextResponse.json(
        { error: 'No active Strava verification found' },
        { status: 404 }
      );
    }

    console.log('Refreshing token for verification:', verification.id);

    // Refresh the Strava token
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: verification.refresh_token,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strava token refresh failed:', errorText);
      return NextResponse.json(
        { error: 'Failed to refresh Strava token' },
        { status: response.status }
      );
    }

    const tokenData = await response.json();

    console.log('Token refreshed, updating verification');

    // Update the verification with new tokens
    const { error: updateError } = await supabase
      .from('user_strava_verifications')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', verification.id);

    if (updateError) {
      console.error('Failed to update verification:', updateError);
      return NextResponse.json(
        { error: 'Failed to update verification' },
        { status: 500 }
      );
    }

    console.log('Token refresh completed successfully');

    return NextResponse.json(
      { 
        message: 'Token refreshed successfully',
        expires_at: new Date(tokenData.expires_at * 1000).toISOString()
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in token refresh:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 