import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { handleBuildTimeRequest } from '@/lib/strava'
import { sendVerificationEmail } from '@/lib/email-service'
import config from '@/lib/config'

export async function GET(request: NextRequest) {
  // Skip during build time
  const buildTimeResponse = handleBuildTimeRequest()
  if (buildTimeResponse) return buildTimeResponse

  try {
    // Log environment for debugging
    console.log('Environment check:', {
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
      hasClientId: !!process.env.STRAVA_CLIENT_ID,
      hasClientSecret: !!process.env.STRAVA_CLIENT_SECRET
    })

    // Get the authorization code and state from the URL
    const searchParams = new URL(request.url).searchParams
    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')

    console.log('Received params:', { 
      hasCode: !!code,
      stateParam,
      fullUrl: request.url 
    })

    if (!code) {
      return NextResponse.redirect(`${config.baseUrl}/profile?strava_error=missing_code`)
    }

    // Parse state parameter
    let state
    try {
      state = JSON.parse(decodeURIComponent(stateParam || '{}'))
      console.log('Parsed state:', state)
    } catch (error) {
      console.error('State parsing error:', error)
      return NextResponse.redirect(`${config.baseUrl}/profile?strava_error=invalid_state`)
    }

    // Check for email in state
    if (!state.email) {
      return NextResponse.redirect(`${config.baseUrl}/profile?strava_error=missing_email`)
    }

    // Exchange the code for tokens
    console.log('Attempting token exchange...')
    const tokenResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code'
      })
    })

    const tokenData = await tokenResponse.json()
    console.log('Token exchange response:', {
      success: !!tokenData.access_token,
      error: tokenData.error,
      message: tokenData.message
    })

    if (!tokenData.access_token) {
      return NextResponse.redirect(`${config.baseUrl}/profile?strava_error=token_exchange_failed&reason=${encodeURIComponent(tokenData.message || 'unknown')}`)
    }

    // Get athlete data to verify it's a runner
    console.log('Fetching athlete data...')
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const athleteData = await athleteResponse.json()
    console.log('Athlete data received:', {
      hasEmail: !!athleteData.email,
      id: athleteData.id
    })

    // Get athlete's running stats
    console.log('Fetching athlete stats...')
    const statsResponse = await fetch('https://www.strava.com/api/v3/athletes/' + athleteData.id + '/stats', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const statsData = await statsResponse.json()

    // Calculate total running distance in km
    const totalDistanceKm = Math.round((
      (statsData.all_run_totals?.distance || 0) +
      (statsData.recent_run_totals?.distance || 0)
    ) / 1000)

    console.log('Stats calculated:', { totalDistanceKm })

    // Store verification in database
    console.log('Storing verification data...')
    const { error: dbError } = await supabase
      .from('user_strava_verifications')
      .upsert({
        user_email: state.email,
        strava_athlete_id: athleteData.id,
        strava_athlete_name: `${athleteData.firstname} ${athleteData.lastname}`,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        total_distance_km: totalDistanceKm,
        total_activities: statsData.all_run_totals?.count || 0,
        is_active: true,
        verified_at: new Date().toISOString()
      }, {
        onConflict: 'user_email',
        ignoreDuplicates: false
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.redirect(`${config.baseUrl}/profile?strava_error=database_error`)
    }

    // Send verification email using Resend
    await sendVerificationEmail(state.email, {
      name: `${athleteData.firstname} ${athleteData.lastname}`,
      totalDistance: totalDistanceKm
    })

    console.log('Verification complete, redirecting...')
    return NextResponse.redirect(
      `${config.baseUrl}/profile?strava_success=true&distance=${totalDistanceKm}`
    )

  } catch (error) {
    console.error('Strava callback error:', error)
    return NextResponse.redirect(`${config.baseUrl}/profile?strava_error=unknown_error`)
  }
} 