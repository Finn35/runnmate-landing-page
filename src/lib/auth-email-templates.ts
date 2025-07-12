// Email templates for authentication with multi-language support
export const authEmailTemplates = {
  magicLink: {
    subject: {
      en: 'Your Runnmate Login Link',
      nl: 'Uw Runnmate Inloglink'
    },
    html: (link: string, email: string, lang: string = 'en') => {
      const content = {
        en: {
          title: 'Your Secure Login Link',
          welcome: 'Welcome to Runnmate!',
          instruction: 'Click the button below to securely sign in to your account:',
          button: 'Log in to Runnmate',
          altText: 'If the button doesn\'t work, copy and paste this link into your browser:',
          expire: 'This link will expire in 24 hours and can only be used once.',
          footer: 'Thanks for using Runnmate!',
          disclaimer: 'If you didn\'t request this login link, you can safely ignore this email.'
        },
        nl: {
          title: 'Uw Veilige Inloglink',
          welcome: 'Welkom bij Runnmate!',
          instruction: 'Klik op de knop hieronder om veilig in te loggen op uw account:',
          button: 'Inloggen bij Runnmate',
          altText: 'Als de knop niet werkt, kopieer en plak deze link in uw browser:',
          expire: 'Deze link verloopt over 24 uur en kan slechts één keer gebruikt worden.',
          footer: 'Bedankt voor het gebruik van Runnmate!',
          disclaimer: 'Als u deze inloglink niet heeft aangevraagd, kunt u deze e-mail veilig negeren.'
        }
      }
      
      const t = content[lang as keyof typeof content] || content.en
      
      return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${t.title}</title>
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
            <p style="margin: 8px 0 0 0;">${t.title}</p>
          </div>
          
          <div class="content">
            <h2>${t.welcome}</h2>
            <p>${t.instruction}</p>
            
            <div style="margin: 32px 0; text-align: center;">
              <a href="${link}" class="button">${t.button}</a>
            </div>

            <div style="margin-top: 24px;">
              <p style="color: #6b7280; font-size: 14px;">
                ${t.altText}
                <br>
                <a href="${link}" style="color: #2563eb; word-break: break-all;">${link}</a>
              </p>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px;">
              <p style="color: #6b7280; font-size: 14px;">
                🔒 <strong>${t.expire}</strong>
              </p>
              <p style="color: #6b7280; font-size: 14px;">
                ${t.disclaimer}
              </p>
            </div>
          </div>

          <div class="footer">
            <p>${t.footer}</p>
            <p>Questions? Contact us at admin@runnmate.com</p>
          </div>
        </div>
      </body>
      </html>
      `
    }
  }
} 