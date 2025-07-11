// Email templates for authentication
export const authEmailTemplates = {
  magicLink: {
    subject: 'Your Runnmate Login Link',
    html: (link: string, email: string) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Runnmate Login Link</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background-color: #2563eb; color: white; padding: 24px; text-align: center; }
          .content { padding: 24px; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; }
          .footer { background-color: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">🏃‍♂️ Runnmate</h1>
            <p style="margin: 8px 0 0 0;">Your Secure Login Link</p>
          </div>
          
          <div class="content">
            <h2>Welcome to Runnmate!</h2>
            <p>Click the button below to securely sign in to your account. This link will expire in 24 hours.</p>
            
            <div style="margin: 32px 0; text-align: center;">
              <a href="${link}" class="button">Sign In to Runnmate</a>
            </div>

            <div style="margin-top: 24px;">
              <p style="color: #6b7280; font-size: 14px;">
                If the button doesn't work, copy and paste this link into your browser:
                <br>
                <a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a>
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
              <p style="color: #6b7280; font-size: 14px;">
                🔒 <strong>Security Note:</strong> This link was requested for ${email}. If you didn't request this link, you can safely ignore this email.
              </p>
            </div>
          </div>

          <div class="footer">
            <p>© 2024 Runnmate - Connecting runners across Europe</p>
            <p>Questions? Contact us at admin@runnmate.com</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}; 