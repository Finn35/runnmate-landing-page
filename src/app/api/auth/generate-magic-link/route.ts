import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/email-service'
import { authEmailTemplates } from '@/lib/auth-email-templates'

export async function POST(request: Request) {
  try {
    const { email, redirectTo, language } = await request.json()

    if (!email || !redirectTo) {
      return NextResponse.json(
        { error: 'Email and redirect URL are required' },
        { status: 400 }
      )
    }

    console.log('Generating magic link for:', email)
    console.log('Redirect URL:', redirectTo)

    // Check if admin client is available
    if (!supabaseAdmin) {
      console.error('Supabase admin client not available - check SUPABASE_SERVICE_ROLE_KEY')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Use Supabase admin API to generate magic link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirectTo
      }
    })

    if (error) {
      console.error('Error generating magic link:', error)
      return NextResponse.json(
        { error: 'Failed to generate magic link: ' + error.message },
        { status: 500 }
      )
    }

    if (!data?.properties?.action_link) {
      console.error('No action link in response')
      return NextResponse.json(
        { error: 'Invalid magic link response' },
        { status: 500 }
      )
    }

    const adminMagicLink = data.properties.action_link
    console.log('Admin magic link generated:', adminMagicLink)

    // Convert admin magic link to our callback format
    // Admin links look like: https://project.supabase.co/auth/v1/verify?token=...&type=magiclink&redirect_to=...
    // We need: /auth/callback?token_hash=...&type=magiclink&returnTo=...
    
    try {
      const linkUrl = new URL(adminMagicLink)
      const token = linkUrl.searchParams.get('token')
      const originalRedirectTo = linkUrl.searchParams.get('redirect_to')
      
      if (!token) {
        throw new Error('No token found in admin magic link')
      }

      // Create our custom callback URL
      const callbackUrl = new URL(redirectTo)
      callbackUrl.searchParams.set('token_hash', token)
      callbackUrl.searchParams.set('type', 'magiclink') // Use 'magiclink' instead of 'email'
      
      // Preserve the returnTo parameter if it exists in original redirectTo
      if (originalRedirectTo) {
        const originalUrl = new URL(originalRedirectTo)
        const returnTo = originalUrl.searchParams.get('returnTo')
        if (returnTo) {
          callbackUrl.searchParams.set('returnTo', returnTo)
        }
      }

      const customMagicLink = callbackUrl.toString()
      console.log('Custom magic link created:', customMagicLink)

      // Send our custom email with the converted link
      const lang = String(language || 'en');
      const emailSent = await sendEmail({
        to: email,
        subject: authEmailTemplates.magicLink.subject(lang),
        html: authEmailTemplates.magicLink.html(customMagicLink, email, lang),
        from: 'Runnmate <admin@runnmate.com>'
      })

      if (!emailSent) {
        console.error('Failed to send email via Resend')
        return NextResponse.json(
          { error: 'Failed to send magic link email' },
          { status: 500 }
        )
      }

      console.log('Magic link email sent successfully via Resend')

      return NextResponse.json({ 
        success: true,
        message: 'Magic link sent successfully' 
      })

    } catch (linkError) {
      console.error('Error processing admin magic link:', linkError)
      return NextResponse.json(
        { error: 'Failed to process magic link' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in generate-magic-link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 