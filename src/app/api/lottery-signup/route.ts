import { NextRequest, NextResponse } from 'next/server'
import { PostgrestSingleResponse } from '@supabase/supabase-js'

interface LaunchNotification {
  email: string
  lottery_consent: boolean
  shoe_interest: string | null
  signed_up_at: string
  is_active: boolean
}

// Only import supabase client if we're not in build phase
const supabase = process.env.NEXT_PHASE === 'phase-production-build' 
  ? null 
  : require('@/lib/supabase').supabase;

export async function POST(request: NextRequest) {
  // Skip processing during build phase
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.json({ message: 'Skipped during build phase' })
  }

  try {
    const { email, lotteryConsent, shoeInterest } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('Processing lottery signup:', { email, lotteryConsent, shoeInterest })

    // Store the signup in database
    const result = await supabase!
      .from('launch_notifications')
      .upsert([
        {
          email: email,
          lottery_consent: lotteryConsent || false,
          shoe_interest: shoeInterest || null,
          signed_up_at: new Date().toISOString(),
          is_active: true
        }
      ], {
        onConflict: 'email'
      }) as PostgrestSingleResponse<LaunchNotification>

    if (result.error) {
      console.error('Database error:', result.error)
      return NextResponse.json({ 
        error: 'Failed to save signup',
        details: result.error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: lotteryConsent 
        ? 'Successfully entered in lottery and signed up for launch notifications'
        : 'Successfully signed up for launch notifications',
      data: result.data
    })

  } catch (error) {
    console.error('Lottery signup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 