import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { decryptToken } from '@/lib/token-encryption'

export async function POST(request: NextRequest) {
  try {
    console.log('Starting Strava disconnect...')

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
      .select('access_token')
      .eq('user_email', userEmail)
      .eq('is_active', true)
    // Removed .single()

    const verification = data && data.length > 0 ? data[0] : null

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Strava verification not found' },
        { status: 404 }
      )
    }

    // Decrypt the access token
    let accessToken: string | undefined
    try {
      const encryptedData = JSON.parse(verification.access_token)
      accessToken = decryptToken(encryptedData)
    } catch (error) {
      console.error('Failed to decrypt access token:', error)
      // Continue with deauthorization even if decryption fails
    }

    // Attempt to deauthorize with Strava if we have a valid token
    if (accessToken) {
      try {
        const response = await fetch('https://www.strava.com/oauth/deauthorize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        })

        if (!response.ok) {
          console.warn('Strava deauthorization failed:', await response.text())
          // Continue with local disconnection even if Strava API call fails
        }
      } catch (error) {
        console.warn('Error calling Strava deauthorize endpoint:', error)
        // Continue with local disconnection even if Strava API call fails
      }
    }

    // Mark verification as inactive in database
    const { error: updateError } = await supabase
      .from('user_strava_verifications')
      .update({
        is_active: false,
        disconnected_at: new Date().toISOString()
      })
      .eq('user_email', userEmail)

    if (updateError) {
      console.error('Failed to update verification:', updateError)
      return NextResponse.json(
        { error: 'Failed to disconnect' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully disconnected from Strava'
    })

  } catch (error) {
    console.error('Unexpected error during Strava disconnect:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
} 