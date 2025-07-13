import type { NextApiRequest, NextApiResponse } from 'next'
import { supabaseAdmin } from '@/lib/supabase'
import { sendEmail } from '@/lib/email-service'
import { authEmailTemplates } from '@/lib/auth-email-templates'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: 'Method Not Allowed' })
  }
  try {
    const { email, redirectTo, language } = req.body

    if (!email || !redirectTo) {
      return res.status(400).json({ error: 'Email and redirect URL are required' })
    }

    console.log('Generating magic link for:', email)
    console.log('Redirect URL:', redirectTo)

    if (!supabaseAdmin) {
      console.error('Supabase admin client not available - check SUPABASE_SERVICE_ROLE_KEY')
      return res.status(500).json({ error: 'Server configuration error' })
    }

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: email,
      options: {
        redirectTo: redirectTo
      }
    })

    if (error) {
      console.error('Error generating magic link:', error)
      return res.status(500).json({ error: 'Failed to generate magic link: ' + error.message })
    }

    if (!data?.properties?.action_link) {
      console.error('No action link in response')
      return res.status(500).json({ error: 'Invalid magic link response' })
    }

    const adminMagicLink = data.properties.action_link
    console.log('Admin magic link generated:', adminMagicLink)

    try {
      const linkUrl = new URL(adminMagicLink)
      const token = linkUrl.searchParams.get('token')
      const originalRedirectTo = linkUrl.searchParams.get('redirect_to')
      if (!token) {
        throw new Error('No token found in admin magic link')
      }
      const callbackUrl = new URL(redirectTo)
      callbackUrl.searchParams.set('token_hash', token)
      callbackUrl.searchParams.set('type', 'magiclink')
      if (originalRedirectTo) {
        const originalUrl = new URL(originalRedirectTo)
        const returnTo = originalUrl.searchParams.get('returnTo')
        if (returnTo) {
          callbackUrl.searchParams.set('returnTo', returnTo)
        }
      }
      const customMagicLink = callbackUrl.toString()
      console.log('Custom magic link created:', customMagicLink)
      const lang = String(language || 'en');
      const emailSent = await sendEmail({
        to: email,
        subject: authEmailTemplates.magicLink.subject[lang as 'en' | 'nl'] || authEmailTemplates.magicLink.subject.en,
        html: authEmailTemplates.magicLink.html(customMagicLink, email, lang),
        from: 'Runnmate <admin@runnmate.com>'
      })
      if (!emailSent) {
        console.error('Failed to send email via Resend')
        return res.status(500).json({ error: 'Failed to send magic link email' })
      }
      console.log('Magic link email sent successfully via Resend')
      return res.status(200).json({ success: true, message: 'Magic link sent successfully' })
    } catch (linkError) {
      console.error('Error processing admin magic link:', linkError)
      return res.status(500).json({ error: 'Failed to process magic link' })
    }
  } catch (error) {
    console.error('Error in generate-magic-link:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
} 