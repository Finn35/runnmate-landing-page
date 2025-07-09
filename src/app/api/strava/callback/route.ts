import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

interface StravaTokenResponse {
  access_token: string
  refresh_token: string
  expires_at: number
  athlete: {
    id: number
    firstname: string
    lastname: string
  }
}

interface StravaActivity {
  id: number
  name: string
  type: string
  distance: number
  moving_time: number
  start_date: string
  gear_id?: string
}

export async function GET(request: NextRequest) {
  let searchParams;
  try {
    const safeUrl = typeof request.url === 'string' && request.url.startsWith('/') ? request.url : '/';
    const url = new URL(safeUrl, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    searchParams = url.searchParams;
  } catch {
    // If the URL is invalid (e.g. during static build), return a safe response
    return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
  }
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  if (error) {
    return NextResponse.redirect(`/?strava_error=${error}`)
  }
  
  if (!code || !state) {
    return NextResponse.redirect('/?strava_error=missing_parameters')
  }
  
  try {
    // Parse state to get user information
    const stateData = JSON.parse(decodeURIComponent(state))
    const { userEmail } = stateData
    
    if (!userEmail) {
      return NextResponse.redirect('/?strava_error=invalid_state')
    }
    
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    })
    
    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token')
    }
    
    const tokenData: StravaTokenResponse = await tokenResponse.json()
    
    // Fetch athlete activities
    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=200',
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    )
    
    if (!activitiesResponse.ok) {
      throw new Error('Failed to fetch activities')
    }
    
    const activities: StravaActivity[] = await activitiesResponse.json()
    
    // Calculate total running distance (convert from meters to kilometers)
    const runningActivities = activities.filter(activity => 
      activity.type === 'Run' || activity.type === 'VirtualRun'
    )
    
    const totalDistanceKm = runningActivities.reduce((total, activity) => {
      return total + (activity.distance / 1000) // Convert meters to km
    }, 0)
    
    const totalActivities = runningActivities.length
    
    // Store Strava verification data in the database
    const { error: dbError } = await supabase
      .from('user_strava_verifications')
      .upsert([
        {
          user_email: userEmail,
          strava_athlete_id: tokenData.athlete.id,
          strava_athlete_name: `${tokenData.athlete.firstname} ${tokenData.athlete.lastname}`,
          total_distance_km: Math.round(totalDistanceKm),
          total_activities: totalActivities,
          access_token: tokenData.access_token, // In production, encrypt this
          refresh_token: tokenData.refresh_token, // In production, encrypt this
          token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
          verified_at: new Date().toISOString(),
          is_active: true
        }
      ])
    
    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect('/?strava_error=database_error')
    }
    
    // Redirect back to profile page with success message
    return NextResponse.redirect(`/profile?strava_success=true&distance=${Math.round(totalDistanceKm)}`)
    
  } catch (error) {
    console.error('Strava callback error:', error)
    return NextResponse.redirect('/?strava_error=processing_failed')
  }
} 