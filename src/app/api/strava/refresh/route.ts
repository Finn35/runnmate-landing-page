import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { encryptToken, decryptToken } from '@/lib/token-encryption'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Strava token refresh...');

    // Validate Strava environment variables
    if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET || !process.env.ENCRYPTION_KEY) {
      console.error('Missing required environment variables');
      return NextResponse.json(
        { error: 'Server configuration error: Missing required credentials' },
        { status: 500 }
      );
    }

    // Parse and validate request body
    let userEmail: string;
    try {
      const body = await request.json();
      userEmail = body.userEmail;
      
      if (!userEmail) {
        console.error('Missing userEmail in request body');
        return NextResponse.json(
          { error: 'User email is required' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('Failed to parse request body:', error);
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      );
    }

    console.log('Fetching Strava verification for:', userEmail);

    // Get the user's Strava verification
    const { data, error: fetchError } = await supabase
      .from('user_strava_verifications')
      .select('refresh_token')
      .eq('user_email', userEmail)
      .eq('is_active', true)
    // Removed .single()

    const verification = data && data.length > 0 ? data[0] : null

    if (fetchError || !verification) {
      console.error('Failed to fetch Strava verification:', fetchError);
      return NextResponse.json(
        { error: 'Strava verification not found' },
        { status: 404 }
      );
    }

    // Decrypt the refresh token
    let refreshToken: string;
    try {
      const encryptedData = JSON.parse(verification.refresh_token);
      refreshToken = decryptToken(encryptedData);
    } catch (error) {
      console.error('Failed to decrypt refresh token:', error);
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 500 }
      );
    }

    // Exchange refresh token for new tokens
    let tokenData;
    try {
      const response = await fetch('https://www.strava.com/oauth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.STRAVA_CLIENT_ID,
          client_secret: process.env.STRAVA_CLIENT_SECRET,
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Strava token refresh failed:', errorText);
        return NextResponse.json(
          { error: 'Failed to refresh Strava token', details: errorText },
          { status: response.status }
        );
      }

      tokenData = await response.json();
    } catch (error) {
      console.error('Error calling Strava API:', error);
      return NextResponse.json(
        { error: 'Failed to communicate with Strava', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    console.log('Token refreshed, encrypting new tokens');

    // Encrypt new tokens
    const encryptedAccessToken = encryptToken(tokenData.access_token);
    const encryptedRefreshToken = encryptToken(tokenData.refresh_token);

    // Update tokens in database
    const { error: updateError } = await supabase
      .from('user_strava_verifications')
      .update({
        access_token: JSON.stringify(encryptedAccessToken),
        refresh_token: JSON.stringify(encryptedRefreshToken),
        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_email', userEmail);

    if (updateError) {
      console.error('Failed to update tokens:', updateError);
      return NextResponse.json(
        { error: 'Failed to save refreshed tokens' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      expires_at: new Date(tokenData.expires_at * 1000).toISOString()
    });

  } catch (error) {
    console.error('Unexpected error during token refresh:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 