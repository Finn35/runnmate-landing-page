import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { handleBuildTimeRequest } from '@/lib/strava'

export async function GET(request: NextRequest) {
  // Skip during build time
  const buildTimeResponse = handleBuildTimeRequest()
  if (buildTimeResponse) return buildTimeResponse

  try {
    // Get the authorization code and state from the URL
    const searchParams = new URL(request.url).searchParams
    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_error=missing_code`)
    }

    // Parse state parameter
    let state
    try {
      state = JSON.parse(decodeURIComponent(stateParam || '{}'))
    } catch {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_error=invalid_state`)
    }

    // Exchange the code for tokens
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
    if (!tokenData.access_token) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_error=token_exchange_failed`)
    }

    // Get athlete data to verify it's a runner
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const athleteData = await athleteResponse.json()

    // Get user's email from Strava or state
    const userEmail = state.email || athleteData.email

    if (!userEmail) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_error=no_email_found`)
    }

    // If user isn't authenticated, create a magic link account
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { data: authData, error: authError } = await supabase.auth.signInWithOtp({
        email: userEmail,
        options: {
          emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?strava_success=true`
        }
      })

      if (authError) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_error=auth_failed`)
      }
    }

    // Get athlete's running stats
    const statsResponse = await fetch('https://www.strava.com/api/v3/athletes/' + athleteData.id + '/stats', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    })
    const statsData = await statsResponse.json()

    // Calculate total running distance in km
    const totalDistanceKm = Math.round((
      (statsData.all_run_totals?.distance || 0) +
      (statsData.recent_run_totals?.distance || 0)
    ) / 1000)

    // Store verification in database
    const { error: dbError } = await supabase
      .from('user_strava_verifications')
      .upsert({
        user_email: userEmail,
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
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_error=database_error`)
    }

    // If user is already authenticated, redirect to profile with success
    if (session) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_success=true&distance=${totalDistanceKm}`
      )
    }

    // Otherwise, show message about magic link email
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/login?message=check_email_strava_connected&distance=${totalDistanceKm}`
    )

  } catch (error) {
    console.error('Strava callback error:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/profile?strava_error=unknown_error`)
  }
} 