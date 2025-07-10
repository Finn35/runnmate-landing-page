import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

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
    const { data, error } = await supabase
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
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ 
        error: 'Failed to save signup',
        details: error.message 
      }, { status: 500 })
    }

    // TODO: In production, you might want to:
    // 1. Send a confirmation email
    // 2. Add to email marketing list (Resend, Mailchimp, etc.)
    // 3. Track analytics event

    return NextResponse.json({ 
      success: true, 
      message: lotteryConsent 
        ? 'Successfully entered in lottery and signed up for launch notifications'
        : 'Successfully signed up for launch notifications',
      data: data?.[0]
    })

  } catch (error) {
    console.error('Lottery signup error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 