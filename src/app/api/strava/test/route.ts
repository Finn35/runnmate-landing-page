import { NextRequest, NextResponse } from 'next/server'

// This is a test endpoint to verify your Strava tokens work
// Remove this file after testing or secure it properly

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, userEmail } = await request.json()
    
    if (!accessToken) {
      return NextResponse.json({ error: 'Access token required' }, { status: 400 })
    }

    console.log('Testing Strava integration with provided tokens...')

    // 1. Test athlete data
    const athleteResponse = await fetch('https://www.strava.com/api/v3/athlete', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!athleteResponse.ok) {
      const errorText = await athleteResponse.text()
      console.error('Athlete API error:', errorText)
      return NextResponse.json({ 
        error: 'Failed to fetch athlete data', 
        details: errorText,
        status: athleteResponse.status 
      }, { status: 400 })
    }

    const athleteData = await athleteResponse.json()
    console.log('Athlete data:', athleteData)

    // 2. Test activities data (check if permission exists)
    const activitiesResponse = await fetch(
      'https://www.strava.com/api/v3/athlete/activities?per_page=50',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const stats: {
      athlete: {
        id: number
        name: string
        profile_medium: string
      }
      activities?: {
        error?: string
        message?: string
        missingScope?: string
        details?: string
        status?: number
        total?: number
        running?: number
        totalDistanceKm?: number
        recentRuns?: Array<{
          name: string
          distance: number
          date: string
          type: string
        }>
      }
      database?: {
        error?: string
        success?: boolean
        message?: string
      }
    } = {
      athlete: {
        id: athleteData.id,
        name: `${athleteData.firstname} ${athleteData.lastname}`,
        profile_medium: athleteData.profile_medium
      }
    }

    if (!activitiesResponse.ok) {
      const errorText = await activitiesResponse.text()
      console.error('Activities API error:', errorText)
      
      // Check if it's a permission error
      try {
        const errorData = JSON.parse(errorText)
        if (errorData.errors?.some((e: { field: string }) => e.field === 'activity:read_permission')) {
          stats.activities = {
            error: 'Missing activity:read permission',
            message: 'Token can access profile but not activities. Need to re-authorize with activity:read scope.',
            missingScope: 'activity:read'
          }
        } else {
          stats.activities = {
            error: 'API Error',
            details: errorText,
            status: activitiesResponse.status
          }
        }
      } catch {
        stats.activities = {
          error: 'Failed to fetch activities',
          details: errorText,
          status: activitiesResponse.status
        }
      }
    } else {
      const activities = await activitiesResponse.json()
      console.log(`Found ${activities.length} activities`)

      // 3. Calculate running stats
      const runningActivities = activities.filter((activity: { type: string }) => 
        activity.type === 'Run' || activity.type === 'VirtualRun'
      )

      const totalDistanceKm = runningActivities.reduce((total: number, activity: { distance: number }) => {
        return total + (activity.distance / 1000) // Convert meters to km
      }, 0)

      stats.activities = {
        total: activities.length,
        running: runningActivities.length,
        totalDistanceKm: Math.round(totalDistanceKm),
        recentRuns: runningActivities.slice(0, 5).map((activity: { name: string; distance: number; start_date: string; type: string }) => ({
          name: activity.name,
          distance: Math.round(activity.distance / 1000),
          date: activity.start_date,
          type: activity.type
        }))
      }

      // 4. Optionally save to database if userEmail provided and we have activity data
      if (userEmail) {
        const { supabase } = await import('@/lib/supabase')
        
        const { error: dbError } = await supabase
          .from('user_strava_verifications')
          .upsert([
            {
              user_email: userEmail,
              strava_athlete_id: athleteData.id,
              strava_athlete_name: `${athleteData.firstname} ${athleteData.lastname}`,
              total_distance_km: Math.round(totalDistanceKm),
              total_activities: runningActivities.length,
              access_token: accessToken,
              refresh_token: refreshToken || '',
              token_expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
              verified_at: new Date().toISOString(),
              is_active: true
            }
          ])
        
        if (dbError) {
          console.error('Database error:', dbError)
          stats.database = { error: dbError.message }
        } else {
          stats.database = { success: true, message: 'Data saved successfully' }
        }
      }
    }

    console.log('Calculated stats:', stats)

    // 5. Save basic profile to database if userEmail provided but no activity access
    if (userEmail && stats.activities?.error) {
      const { supabase } = await import('@/lib/supabase')
      
      // Save basic verification without activity data
      const { error: dbError } = await supabase
        .from('user_strava_verifications')
        .upsert([
          {
            user_email: userEmail,
            strava_athlete_id: athleteData.id,
            strava_athlete_name: `${athleteData.firstname} ${athleteData.lastname}`,
            total_distance_km: 0,
            total_activities: 0,
            access_token: accessToken,
            refresh_token: refreshToken || '',
            token_expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
            verified_at: new Date().toISOString(),
            is_active: true
          }
        ])
      
      if (dbError) {
        console.error('Database error:', dbError)
        stats.database = { error: dbError.message }
      } else {
        stats.database = { 
          success: true, 
          message: 'Profile saved (limited permissions - no activity data)' 
        }
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Test endpoint error:', error)
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
} 