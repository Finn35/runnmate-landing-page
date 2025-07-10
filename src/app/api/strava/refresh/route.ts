import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

// Create a dummy client for build time
const createDummyClient = () => {
  const baseResponse = { 
    data: null, 
    error: null,
    status: 200,
    statusText: 'OK'
  };

  const createChainMethods = () => {
    const methods = {
      select: () => {
        const result = Promise.resolve(baseResponse);
        Object.assign(result, methods);
        return result;
      },
      eq: () => methods,
      neq: () => methods,
      gt: () => methods,
      gte: () => methods,
      lt: () => methods,
      lte: () => methods,
      in: () => methods,
      match: () => methods,
      single: () => Promise.resolve(baseResponse),
      update: () => Promise.resolve(baseResponse),
      upsert: () => Promise.resolve(baseResponse),
      delete: () => Promise.resolve(baseResponse),
      order: () => methods,
      limit: () => methods,
      from: () => methods
    };
    return methods;
  };

  return createChainMethods();
};

// Initialize Supabase client with runtime checks
const initSupabaseClient = () => {
  // During build time, return dummy client
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('Build time: Using dummy client');
    return createDummyClient() as unknown as ReturnType<typeof createClient<Database>>;
  }

  // Runtime environment validation
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL');
    throw new Error('Missing Supabase URL configuration');
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    throw new Error('Missing Supabase service role key configuration');
  }

  try {
    // Validate URL format
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    // Create and return real client
    console.log('Runtime: Creating Supabase client');
    return createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false }
      }
    );
  } catch (error) {
    console.error('Invalid Supabase URL format:', error);
    throw new Error('Invalid Supabase URL configuration');
  }
};

// Initialize client
const supabase = initSupabaseClient();

// Force Node.js runtime for proper environment variable access
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Strava token refresh...');

    // Validate Strava environment variables
    if (!process.env.STRAVA_CLIENT_ID || !process.env.STRAVA_CLIENT_SECRET) {
      console.error('Missing Strava credentials');
      return NextResponse.json(
        { error: 'Server configuration error: Missing Strava credentials' },
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
    let verification;
    try {
      const { data, error } = await supabase
        .from('user_strava_verifications')
        .select()
        .eq('user_email', userEmail)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Database error fetching verification:', error);
        return NextResponse.json(
          { error: 'Failed to fetch verification', details: error.message },
          { status: 500 }
        );
      }

      if (!data) {
        console.log('No active verification found for:', userEmail);
        return NextResponse.json(
          { error: 'No active Strava verification found' },
          { status: 404 }
        );
      }

      verification = data;
    } catch (error) {
      console.error('Error in Supabase query:', error);
      return NextResponse.json(
        { error: 'Database operation failed', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    console.log('Refreshing token for verification:', verification.id);

    // Refresh the Strava token
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
          refresh_token: verification.refresh_token,
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

    console.log('Token refreshed, updating verification');

    // Update the verification with new tokens
    try {
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
          { error: 'Failed to update verification', details: updateError.message },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error('Error updating verification:', error);
      return NextResponse.json(
        { error: 'Database update failed', details: error instanceof Error ? error.message : 'Unknown error' },
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
    console.error('Unhandled error in token refresh:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 