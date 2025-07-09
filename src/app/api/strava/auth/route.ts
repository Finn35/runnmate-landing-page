import { NextRequest, NextResponse } from 'next/server'
import config from '@/lib/config'

export async function GET(request: NextRequest) {
  // Get the user's email or ID from search params to associate with the Strava account
  const { searchParams } = new URL(request.url)
  const userEmail = searchParams.get('user_email')
  
  // Strava OAuth configuration
  const stravaClientId = process.env.STRAVA_CLIENT_ID
  
  if (!stravaClientId) {
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