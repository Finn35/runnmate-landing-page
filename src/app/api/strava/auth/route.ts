import { NextRequest, NextResponse } from 'next/server'
import config from '@/lib/config'
import { handleBuildTimeRequest } from '@/lib/strava'

export async function GET(request: NextRequest) {
  // Skip during build time
  const buildTimeResponse = handleBuildTimeRequest()
  if (buildTimeResponse) return buildTimeResponse

  // Get the user's email from search params
  let searchParams;
  try {
    const url = new URL(request.url, config.baseUrl);
    searchParams = url.searchParams;
  } catch {
    return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
  }
  const userEmail = searchParams.get('user_email')

  if (!userEmail) {
    console.error('Missing user_email parameter')
    return NextResponse.redirect(`${config.baseUrl}/profile?strava_error=missing_email`)
  }
  
  // Strava OAuth configuration
  const stravaClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || process.env.STRAVA_CLIENT_ID
  
  if (!stravaClientId) {
    console.error('Strava OAuth not configured: Missing client ID')
    return NextResponse.json({ error: 'Strava OAuth not configured' }, { status: 500 })
  }
  
  // Generate state parameter with user email
  const state = JSON.stringify({ 
    email: userEmail, // Use 'email' key to match callback expectations
    timestamp: Date.now()
  })
  
  // Strava OAuth authorization URL with required scopes
  const authUrl = new URL('https://www.strava.com/oauth/authorize')
  authUrl.searchParams.set('client_id', stravaClientId)
  authUrl.searchParams.set('redirect_uri', config.stravaRedirectUri)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'read,activity:read,profile:read_all')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('approval_prompt', 'auto')
  
  return NextResponse.redirect(authUrl.toString())
} 