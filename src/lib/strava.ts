import { supabase } from './supabase'
import { NextResponse } from 'next/server'

interface StravaApiOptions {
  userEmail: string
  endpoint: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: Record<string, unknown>
}

interface StravaTokens {
  access_token: string
  refresh_token: string
  token_expires_at: string
}

/**
 * Helper function to handle build-time API route requests
 */
export function handleBuildTimeRequest() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Skipped during build phase' })
  }
  return null
}

/**
 * Makes authenticated requests to Strava API with automatic token refresh
 */
export async function makeStravaApiCall({ userEmail, endpoint, method = 'GET', body }: StravaApiOptions) {
  // Get current tokens
  let tokens = await getStravaTokens(userEmail)
  if (!tokens) {
    throw new Error('No Strava verification found for user')
  }

  // Check if token needs refresh
  const isExpired = new Date(tokens.token_expires_at) <= new Date(Date.now() + 5 * 60 * 1000) // 5 minutes buffer
  if (isExpired) {
    console.log('Token expired, refreshing...')
    tokens = await refreshStravaTokens(userEmail, tokens.refresh_token)
  }

  // Make the API call
  const response = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    throw new Error(`Strava API error: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Get user's Strava tokens from database
 */
async function getStravaTokens(userEmail: string): Promise<StravaTokens | null> {
  const { data, error } = await supabase
    .from('user_strava_verifications')
    .select('access_token, refresh_token, token_expires_at')
    .eq('user_email', userEmail)
    .eq('is_active', true)
    .single()

  if (error || !data) {
    return null
  }

  return data
}

/**
 * Refresh expired Strava tokens
 */
async function refreshStravaTokens(userEmail: string, refreshToken: string): Promise<StravaTokens> {
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
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Strava token')
  }

  const tokenData = await response.json()
  
  // Update tokens in database
  const { error } = await supabase
    .from('user_strava_verifications')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('user_email', userEmail)

  if (error) {
    throw new Error('Failed to save refreshed tokens')
  }

  return {
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    token_expires_at: new Date(tokenData.expires_at * 1000).toISOString()
  }
}

/**
 * Fetch and calculate user's running statistics
 */
export async function getRunningStats(userEmail: string) {
  try {
    // Fetch activities (limit to recent 200 for performance)
    const activities = await makeStravaApiCall({
      userEmail,
      endpoint: '/athlete/activities?per_page=200'
    })

    // Filter running activities
    const runningActivities = activities.filter((activity: { type: string }) => 
      activity.type === 'Run' || activity.type === 'VirtualRun'
    )

    // Calculate statistics
    const totalDistanceKm = runningActivities.reduce((total: number, activity: { distance: number }) => {
      return total + (activity.distance / 1000) // Convert meters to km
    }, 0)

    const totalElevationGain = runningActivities.reduce((total: number, activity: { total_elevation_gain?: number }) => {
      return total + (activity.total_elevation_gain || 0)
    }, 0)

    const totalMovingTime = runningActivities.reduce((total: number, activity: { moving_time?: number }) => {
      return total + (activity.moving_time || 0)
    }, 0)

    return {
      totalActivities: runningActivities.length,
      totalDistanceKm: Math.round(totalDistanceKm * 10) / 10, // Round to 1 decimal
      totalElevationGain: Math.round(totalElevationGain),
      totalMovingTimeHours: Math.round(totalMovingTime / 3600 * 10) / 10, // Convert seconds to hours
      averageDistanceKm: runningActivities.length > 0 ? Math.round((totalDistanceKm / runningActivities.length) * 10) / 10 : 0,
      recentActivities: runningActivities.slice(0, 5).map((activity: { id: number; name: string; distance: number; moving_time?: number; total_elevation_gain?: number; start_date: string; type: string }) => ({
        id: activity.id,
        name: activity.name,
        distance: Math.round(activity.distance / 1000 * 10) / 10,
        movingTime: activity.moving_time,
        elevationGain: activity.total_elevation_gain || 0,
        startDate: activity.start_date,
        type: activity.type
      }))
    }
  } catch (error) {
    console.error('Error fetching running stats:', error)
    throw error
  }
}

/**
 * Get athlete profile information
 */
export async function getAthleteProfile(userEmail: string) {
  try {
    const athlete = await makeStravaApiCall({
      userEmail,
      endpoint: '/athlete'
    })

    return {
      id: athlete.id,
      username: athlete.username,
      firstname: athlete.firstname,
      lastname: athlete.lastname,
      city: athlete.city,
      state: athlete.state,
      country: athlete.country,
      profile: athlete.profile,
      profileMedium: athlete.profile_medium,
      followerCount: athlete.follower_count,
      friendCount: athlete.friend_count
    }
  } catch (error) {
    console.error('Error fetching athlete profile:', error)
    throw error
  }
} 