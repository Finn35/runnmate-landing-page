import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { sendEmail } from '@/lib/email-service'
import { authEmailTemplates } from '@/lib/auth-email-templates'

export async function POST(request: Request) {
  try {
    const { email, redirectTo } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Generate magic link using Supabase
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true
      }
    })

    if (error) {
      console.error('Error generating OTP:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Get the email OTP token from the response
    const emailOTP = (data as any).properties?.email_otp

    if (!emailOTP) {
      console.error('No email OTP received')
      return NextResponse.json(
        { error: 'Failed to generate magic link' },
        { status: 500 }
      )
    }

    // Construct magic link URL
    const magicLink = `${redirectTo}?token_hash=${emailOTP}&type=email`

    // Send custom email using Resend
    await sendEmail({
      to: email,
      subject: authEmailTemplates.magicLink.subject,
      html: authEmailTemplates.magicLink.html(magicLink, email),
      from: 'Runnmate <admin@runnmate.com>'
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending magic link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 