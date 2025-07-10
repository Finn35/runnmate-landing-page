import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    // Ensure request URL is valid during build time
    try {
      new URL(request.url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    } catch {
      // Silently handle invalid URLs during build
    }

    const { userEmail } = await request.json()
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }
    
    // Get the user's Strava data to revoke access token
    const { data: stravaData, error: fetchError } = await supabase
      .from('user_strava_verifications')
      .select('access_token, strava_athlete_id')
      .eq('user_email', userEmail)
      .eq('is_active', true)
      .single()
    
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
    const { error: updateError } = await supabase
      .from('user_strava_verifications')
      .update({ 
        is_active: false,
        disconnected_at: new Date().toISOString()
      })
      .eq('user_email', userEmail)
    
    if (updateError) {
      return NextResponse.json({ error: 'Failed to disconnect Strava' }, { status: 500 })
    }
    
    return NextResponse.json({ success: true, message: 'Strava disconnected successfully' })
    
  } catch (error) {
    console.error('Strava disconnect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 