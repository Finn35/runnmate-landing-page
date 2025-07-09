import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json()
    
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 400 })
    }

    // Get current verification data
    const { data: verification, error: fetchError } = await supabase
      .from('user_strava_verifications')
      .select('*')
      .eq('user_email', userEmail)
      .eq('is_active', true)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json({ error: 'Strava verification not found' }, { status: 404 })
    }

    // Check if token needs refresh (if expires within next hour)
    const expiresAt = new Date(verification.token_expires_at)
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000)
    
    if (expiresAt > oneHourFromNow) {
      return NextResponse.json({ 
        message: 'Token still valid', 
        expiresAt: verification.token_expires_at 
      })
    }

    console.log('Refreshing Strava token for user:', userEmail)

    // Refresh the access token
    const refreshResponse = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.STRAVA_CLIENT_ID,
        client_secret: process.env.STRAVA_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: verification.refresh_token,
      }),
    })

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text()
      console.error('Token refresh failed:', errorText)
      
      // If refresh fails, mark verification as inactive
      await supabase
        .from('user_strava_verifications')
        .update({ is_active: false, disconnected_at: new Date().toISOString() })
        .eq('user_email', userEmail)
      
      return NextResponse.json({ 
        error: 'Token refresh failed', 
        details: errorText 
      }, { status: 400 })
    }

    const tokenData = await refreshResponse.json()
    
    // Update the verification with new tokens
    const { error: updateError } = await supabase
      .from('user_strava_verifications')
      .update({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        token_expires_at: new Date(tokenData.expires_at * 1000).toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_email', userEmail)

    if (updateError) {
      console.error('Failed to update tokens:', updateError)
      return NextResponse.json({ error: 'Failed to save new tokens' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Token refreshed successfully',
      expiresAt: new Date(tokenData.expires_at * 1000).toISOString()
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 