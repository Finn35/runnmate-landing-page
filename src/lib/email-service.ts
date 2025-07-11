import { Resend } from 'resend'
import { stravaVerificationTemplate, offerNotificationTemplate } from './email-templates'

// Only initialize Resend on the server-side
const getResendClient = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Resend client can only be used on the server-side')
  }
  
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }
  
  return new Resend(apiKey)
}

interface VerificationEmailData {
  name: string
  totalDistance: number
}

// Email service for sending notifications
// Using Resend for production email sending

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
  reply_to?: string
}

export interface OfferEmailData {
  sellerEmail: string
  buyerName: string
  buyerEmail: string
  listingTitle: string
  offerPrice: number
  message?: string
  listingPrice: number
  listingSize: number
}

// Production email sender using Resend
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const result = await resend.emails.send({
      from: emailData.from || 'admin@runnmate.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      reply_to: emailData.reply_to || 'admin@runnmate.com'
    })
    
    console.log('✅ Email sent successfully:', result.data?.id)
    return true
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return false
  }
}

// Send offer notification email to seller
export async function sendOfferNotification(data: OfferEmailData): Promise<boolean> {
  const emailData: EmailData = {
    to: data.sellerEmail,
    subject: offerNotificationTemplate.subject(data.listingTitle, data.offerPrice),
    html: offerNotificationTemplate.html(data),
    from: 'Runnmate <admin@runnmate.com>',
    reply_to: 'admin@runnmate.com'
  }

  return await sendEmail(emailData)
}

// Send general admin/support email
export async function sendAdminEmail(to: string, subject: string, htmlContent: string) {
  try {
    const resend = getResendClient()
    
    const result = await resend.emails.send({
      from: 'Runnmate <admin@runnmate.com>',
      to,
      subject,
      html: htmlContent
    })
    
    console.log('Admin email sent successfully:', result)
    return true
  } catch (error) {
    console.error('Failed to send admin email:', error)
    return false
  }
}

// Send Strava verification email
export async function sendVerificationEmail(email: string, data: VerificationEmailData) {
  try {
    const resend = getResendClient()
    
    const result = await resend.emails.send({
      from: 'Runnmate <verification@runnmate.com>',
      to: email,
      subject: stravaVerificationTemplate.subject,
      html: stravaVerificationTemplate.html(data.name, data.totalDistance)
    })
    
    console.log('Verification email sent successfully:', result)
    return true
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return false
  }
} 