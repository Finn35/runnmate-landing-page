import { Resend } from 'resend'

// Email service for sending notifications
// Using Resend for production email sending

export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
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
      replyTo: emailData.replyTo || 'admin@runnmate.com'
    })
    
    console.log('✅ Email sent successfully:', result.data?.id)
    return true
  } catch (error) {
    console.error('❌ Failed to send email:', error)
    return false
  }
}

// Generate HTML email template for offer notifications
export function generateOfferEmailHtml(data: OfferEmailData): string {
  const discountPercentage = Math.round(((data.listingPrice - data.offerPrice) / data.listingPrice) * 100)
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Offer on Your Running Shoes</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #2563eb; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .offer-card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
        .price { font-size: 24px; font-weight: bold; color: #2563eb; }
        .discount { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
        .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; }
        .footer { background-color: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🏃‍♂️ RUNNMATE</h1>
          <p style="margin: 8px 0 0 0;">New Offer on Your Running Shoes!</p>
        </div>
        
        <div class="content">
          <h2>Great news! Someone wants to buy your shoes</h2>
          
          <div class="offer-card">
            <h3 style="margin: 0 0 8px 0;">${data.listingTitle}</h3>
            <p style="margin: 0; color: #6b7280;">Size EU ${data.listingSize}</p>
            
            <div style="margin: 16px 0;">
              <p style="margin: 0; color: #6b7280;">Your asking price: €${data.listingPrice}</p>
              <p style="margin: 4px 0 0 0;">
                <span class="price">€${data.offerPrice}</span>
                <span class="discount">${discountPercentage}% ${discountPercentage > 0 ? 'below' : 'above'} asking price</span>
              </p>
            </div>
          </div>

          <div style="margin: 24px 0;">
            <h3>From: ${data.buyerName}</h3>
            <p style="color: #6b7280;">Email: ${data.buyerEmail}</p>
            ${data.message ? `<p style="background-color: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #2563eb;">"${data.message}"</p>` : ''}
          </div>

          <div style="margin: 32px 0; text-align: center;">
            <a href="mailto:${data.buyerEmail}?subject=Re: Offer for ${data.listingTitle}&body=Hi ${data.buyerName},%0D%0A%0D%0AThank you for your interest in my ${data.listingTitle}!%0D%0A%0D%0A" class="button">
              Reply to Buyer
            </a>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
            <p style="color: #6b7280; font-size: 14px;">
              💡 <strong>Tip:</strong> Respond quickly! Buyers are more likely to complete the purchase when sellers are responsive.
            </p>
            <p style="color: #6b7280; font-size: 14px;">
              📧 <strong>Need help?</strong> Reply to this email to reach our admin team at admin@runnmate.com
            </p>
          </div>
        </div>

        <div class="footer">
          <p>You received this email because someone made an offer on your RUNNMATE listing.</p>
          <p>Questions? Reply to this email or contact us at admin@runnmate.com</p>
          <p>© 2024 RUNNMATE - Connecting runners across Europe</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Send offer notification email to seller
export async function sendOfferNotification(data: OfferEmailData): Promise<boolean> {
  const emailData: EmailData = {
    to: data.sellerEmail,
    subject: `💰 New €${data.offerPrice} offer on your ${data.listingTitle}`,
    html: generateOfferEmailHtml(data),
    from: 'admin@runnmate.com',
    replyTo: 'admin@runnmate.com'
  }

  return await sendEmail(emailData)
}

// Send general admin/support email
export async function sendAdminEmail(to: string, subject: string, message: string): Promise<boolean> {
  const emailData: EmailData = {
    to,
    subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #2563eb; color: white; padding: 24px; text-align: center; }
          .content { padding: 24px; line-height: 1.6; }
          .footer { background-color: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🏃‍♂️ RUNNMATE</h1>
            <p style="margin: 8px 0 0 0;">${subject}</p>
          </div>
          
          <div class="content">
            <div style="white-space: pre-line;">${message}</div>
          </div>

          <div class="footer">
            <p>Questions? Reply to this email or contact us at admin@runnmate.com</p>
            <p>© 2024 RUNNMATE - Connecting runners across Europe</p>
          </div>
        </div>
      </body>
      </html>
    `,
    from: 'admin@runnmate.com',
    replyTo: 'admin@runnmate.com'
  }

  return await sendEmail(emailData)
}

// Integration examples for popular email services:

/*
// RESEND (Recommended - simple and reliable)
npm install resend

import { Resend } from 'resend'
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    await resend.emails.send({
      from: emailData.from || 'noreply@runnmate.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
*/

/*
// SENDGRID
npm install @sendgrid/mail

import sgMail from '@sendgrid/mail'
sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    await sgMail.send({
      from: emailData.from || 'noreply@runnmate.com',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html
    })
    return true
  } catch (error) {
    console.error('Failed to send email:', error)
    return false
  }
}
*/ 