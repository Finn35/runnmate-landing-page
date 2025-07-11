// Email templates for notifications
export const stravaVerificationTemplate = {
  subject: 'Your Strava Account is Now Verified! 🏃‍♂️',
  html: (name: string, totalDistance: number) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Strava Verification Complete</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #fc5200; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .stats { background-color: #f9fafb; padding: 16px; margin: 16px 0; border-radius: 8px; }
        .footer { background-color: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🏃‍♂️ Runnmate</h1>
          <p style="margin: 8px 0 0 0;">Strava Verification Complete</p>
        </div>
        
        <div class="content">
          <h2>Congratulations, ${name}! 🎉</h2>
          <p>Your Strava account has been successfully verified with Runnmate. Your running achievements are now visible to other users!</p>
          
          <div class="stats">
            <h3 style="margin-top: 0;">Your Running Stats</h3>
            <p style="font-size: 24px; font-weight: bold; color: #fc5200;">
              ${totalDistance} km
            </p>
            <p style="color: #6b7280;">Total Distance Logged</p>
          </div>

          <p>What this means for you:</p>
          <ul>
            <li>Your running distance is now verified</li>
            <li>Other users can see your verified runner status</li>
            <li>Build trust in the Runnmate community</li>
          </ul>

          <p style="margin-top: 24px;">
            Ready to start browsing? Check out the latest listings from fellow runners!
          </p>
        </div>

        <div class="footer">
          <p>© 2024 Runnmate - Connecting runners across Europe</p>
          <p>Questions? Contact us at admin@runnmate.com</p>
        </div>
      </div>
    </body>
    </html>
  `
};

export const offerNotificationTemplate = {
  subject: (listingTitle: string, offerPrice: number) => 
    `New Offer: ${listingTitle} - €${offerPrice}`,
  html: (data: {
    buyerName: string;
    buyerEmail: string;
    listingTitle: string;
    offerPrice: number;
    message?: string;
    listingPrice: number;
    listingSize: number;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Offer Received</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f3f4f6; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background-color: #2563eb; color: white; padding: 24px; text-align: center; }
        .content { padding: 24px; }
        .offer-details { background-color: #f9fafb; padding: 16px; margin: 16px 0; border-radius: 8px; }
        .price { font-size: 24px; font-weight: bold; color: #2563eb; }
        .footer { background-color: #f9fafb; padding: 16px; text-align: center; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🏃‍♂️ Runnmate</h1>
          <p style="margin: 8px 0 0 0;">New Offer Received</p>
        </div>
        
        <div class="content">
          <h2>You've Received a New Offer! 🎉</h2>
          <p>${data.buyerName} is interested in your listing:</p>
          
          <div class="offer-details">
            <h3 style="margin-top: 0;">${data.listingTitle}</h3>
            <p class="price">€${data.offerPrice}</p>
            <p style="color: #6b7280;">Original price: €${data.listingPrice}</p>
            <p style="color: #6b7280;">Size: ${data.listingSize}</p>
            ${data.message ? `
              <div style="margin-top: 16px;">
                <p style="font-style: italic;">"${data.message}"</p>
              </div>
            ` : ''}
          </div>

          <p>To respond to this offer:</p>
          <ol>
            <li>Log in to your Runnmate account</li>
            <li>Go to your listings</li>
            <li>Find this offer under "Pending Offers"</li>
            <li>Choose to accept or decline</li>
          </ol>

          <p style="margin-top: 24px; color: #6b7280;">
            <strong>Note:</strong> You can reply directly to this email to contact ${data.buyerName}.
          </p>
        </div>

        <div class="footer">
          <p>© 2024 Runnmate - Connecting runners across Europe</p>
          <p>Questions? Contact us at admin@runnmate.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}; 