import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { decryptToken } from '@/lib/token-encryption'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Strava API test...')

    // Parse and validate request body
    let userEmail: string
    try {
      const body = await request.json()
      userEmail = body.userEmail

      if (!userEmail) {
        return NextResponse.json(
          { error: 'User email is required' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request format' },
        { status: 400 }
      )
    }

    // Get the user's Strava verification
    const { data, error: fetchError } = await supabase
      .from('user_strava_verifications')
      .select('access_token, strava_athlete_id')
      .eq('user_email', userEmail)
      .eq('is_active', true)

    const verification = data && data.length > 0 ? data[0] : null

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Strava verification not found' },
        { status: 404 }
      )
    }

    // Decrypt the access token
    let accessToken: string
    try {
      const encryptedData = JSON.parse(verification.access_token)
      accessToken = decryptToken(encryptedData)
    } catch (error) {
      console.error('Failed to decrypt access token:', error)
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 500 }
      )
    }

    // Test the Strava API
    const response = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json(
        { error: 'Strava API test failed', details: errorText },
        { status: response.status }
      )
    }

    const athleteData = await response.json()

    // Get athlete's running stats
    const statsResponse = await fetch(
      `https://www.strava.com/api/v3/athletes/${verification.strava_athlete_id}/stats`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    )

    if (!statsResponse.ok) {
      const errorText = await statsResponse.text()
      return NextResponse.json(
        { error: 'Failed to fetch athlete stats', details: errorText },
        { status: statsResponse.status }
      )
    }

    const statsData = await statsResponse.json()

    // Calculate total running distance
    const totalDistanceKm = Math.round((
      (statsData.all_run_totals?.distance || 0) +
      (statsData.recent_run_totals?.distance || 0)
    ) / 1000)

    // Update stats in database
    const { error: updateError } = await supabase
      .from('user_strava_verifications')
      .update({
        total_distance_km: totalDistanceKm,
        total_activities: statsData.all_run_totals?.count || 0,
        updated_at: new Date().toISOString()
      })
      .eq('user_email', userEmail)

    if (updateError) {
      console.error('Failed to update stats:', updateError)
      return NextResponse.json(
        { error: 'Failed to update stats' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      athlete: {
        id: athleteData.id,
        firstname: athleteData.firstname,
        lastname: athleteData.lastname,
        totalDistanceKm,
        totalActivities: statsData.all_run_totals?.count || 0
      }
    })

  } catch (error) {
    console.error('Unexpected error during Strava test:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 