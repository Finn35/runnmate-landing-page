import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { handleBuildTimeRequest } from '@/lib/strava'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

interface StravaVerification {
  access_token: string
  strava_athlete_id: string
}

export async function POST(request: NextRequest) {
  // Skip during build time
  const buildTimeResponse = handleBuildTimeRequest()
  if (buildTimeResponse) return buildTimeResponse

  try {
    const { userEmail } = await request.json()
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }
    
    // Get the user's Strava data to revoke access token
    const { data: stravaData, error: fetchError } = await ((supabase
      .from('user_strava_verifications') as any)
      .select('access_token, strava_athlete_id')
      .eq('user_email', userEmail)
      .eq('is_active', true)
      .single() as Promise<PostgrestSingleResponse<StravaVerification>>)
    
    if (fetchError || !stravaData) {
      return NextResponse.json({ error: 'Strava verification not found' }, { status: 404 })
    }
    
    // Revoke access token with Strava (optional but recommended)
    try {
      await fetch('https://www.strava.com/oauth/deauthorize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${stravaData.access_token}`,
          'Content-Type': 'application/json',
        },
      })
    } catch (revokeError) {
      console.warn('Failed to revoke Strava token:', revokeError)
      // Continue anyway as we'll disable it in our database
    }
    
    // Deactivate the verification in our database
    const { error: updateError } = await ((supabase
      .from('user_strava_verifications') as any)
      .update({ 
        is_active: false,
        disconnected_at: new Date().toISOString()
      })
      .eq('user_email', userEmail))
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to disconnect Strava' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Strava disconnected successfully' })
    
  } catch (error) {
    console.error('Strava disconnect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 