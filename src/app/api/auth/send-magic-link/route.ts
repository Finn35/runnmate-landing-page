import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email-service'
import { authEmailTemplates } from '@/lib/auth-email-templates'

export async function POST(request: Request) {
  try {
    const { email, magicLink } = await request.json()

    if (!email || !magicLink) {
      return NextResponse.json(
        { error: 'Email and magic link are required' },
        { status: 400 }
      )
    }

    // Send email using Resend
    const sent = await sendEmail({
      to: email,
      subject: authEmailTemplates.magicLink.subject,
      html: authEmailTemplates.magicLink.html(magicLink, email),
      from: 'Runnmate <admin@runnmate.com>'
    })

    if (!sent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending magic link email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 