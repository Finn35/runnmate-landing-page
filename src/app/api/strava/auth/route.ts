import { NextRequest, NextResponse } from 'next/server'
import config from '@/lib/config'
import { handleBuildTimeRequest } from '@/lib/strava'

export async function GET(request: NextRequest) {
  // Skip during build time
  const buildTimeResponse = handleBuildTimeRequest()
  if (buildTimeResponse) return buildTimeResponse

  // Get the user's email or ID from search params to associate with the Strava account
  let searchParams;
  try {
    const url = new URL(request.url, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    searchParams = url.searchParams;
  } catch {
    return NextResponse.json({ error: 'Invalid request URL' }, { status: 400 });
  }
  const userEmail = searchParams.get('user_email')
  
  // Strava OAuth configuration
  const stravaClientId = process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID || process.env.STRAVA_CLIENT_ID
  
  if (!stravaClientId) {
    console.error('Strava OAuth not configured: Missing client ID')
    return NextResponse.json({ error: 'Strava OAuth not configured' }, { status: 500 })
  }
  
  // Generate state parameter for security (include user email)
  const state = JSON.stringify({ 
    userEmail,
    timestamp: Date.now(),
    nonce: Math.random().toString(36).substring(7)
  })
  
  // Strava OAuth authorization URL - uses environment-aware redirect URI
  const authUrl = new URL('https://www.strava.com/oauth/authorize')
  authUrl.searchParams.set('client_id', stravaClientId)
  authUrl.searchParams.set('redirect_uri', config.stravaRedirectUri) // Environment-aware
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('scope', 'read,activity:read')
  authUrl.searchParams.set('state', encodeURIComponent(state))
  
  return NextResponse.redirect(authUrl.toString())
} 