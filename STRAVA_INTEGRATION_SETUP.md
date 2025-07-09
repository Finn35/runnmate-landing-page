# Strava Integration Setup Guide

This guide will help you set up the complete Strava OAuth integration for your RUNNMATE application.

## 📋 Overview

The Strava integration allows users to:
- Connect their Strava account to verify running activities
- Display verified mileage and activity count on their profile
- Show verification badges on listings to build trust
- Disconnect/revoke access at any time

## 🔧 Setup Steps

### 1. Create Strava Application

1. Go to [Strava Developers](https://developers.strava.com/)
2. Click "Create & Manage Your App"
3. Fill in the application details:
   - **Application Name**: RUNNMATE
   - **Category**: Data Importer
   - **Club**: Leave blank
   - **Website**: Your domain (e.g., https://runnmate.nl)
   - **Authorization Callback Domain**: Your domain (e.g., runnmate.nl or localhost for development)
4. After creation, note down your **Client ID** and **Client Secret**

### 2. Environment Variables

Create or update your `.env.local` file with the following variables:

```bash
# Strava OAuth Configuration
STRAVA_CLIENT_ID=your_actual_strava_client_id_here
STRAVA_CLIENT_SECRET=your_actual_strava_client_secret_here
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback

# For production, use your actual domain:
# STRAVA_REDIRECT_URI=https://yourdomain.com/api/strava/callback

# NextAuth/JWT Secret for securing tokens (generate a random string)
NEXTAUTH_SECRET=your-secure-random-string-here

# Application URL
NEXTAUTH_URL=http://localhost:3000
# For production: NEXTAUTH_URL=https://yourdomain.com
```

### 3. Database Setup

Run the SQL migration in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `database/strava_verification_migration.sql`

This will create:
- `user_strava_verifications` table
- Proper indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

### 4. Update Strava App Settings

In your Strava app settings, set the **Authorization Callback Domain** to:
- Development: `localhost`
- Production: `yourdomain.com` (without https://)

## 🚀 How It Works

### User Flow

1. **Connect**: User clicks "Connect Strava" button on profile page
2. **Authorize**: Redirected to Strava OAuth page
3. **Grant Permission**: User grants read access to activities
4. **Data Fetch**: System fetches running activities and calculates total distance
5. **Verification**: Data stored and verification badge appears on profile/listings

### API Endpoints

- `GET /api/strava/auth` - Initiates OAuth flow
- `GET /api/strava/callback` - Handles OAuth callback
- `POST /api/strava/disconnect` - Revokes access

### Components

- `src/app/profile/page.tsx` - User profile with Strava connection
- `src/components/StravaVerificationBadge.tsx` - Reusable verification badge
- Integration on listing pages for seller verification

## 🔒 Security Considerations

### Current Implementation
- Access tokens stored in database (encrypted recommended for production)
- Row Level Security (RLS) enabled
- State parameter for CSRF protection
- Proper OAuth scopes (read, activity:read)

### Production Recommendations
1. **Encrypt Tokens**: Encrypt access/refresh tokens before storing
2. **Token Refresh**: Implement automatic token refresh logic
3. **Rate Limiting**: Add rate limiting to API endpoints
4. **HTTPS Only**: Use HTTPS in production
5. **Environment Secrets**: Use secure environment variable management

## 🎨 Frontend Features

### Profile Page (`/profile`)
- Complete Strava connection interface
- Verification status display
- Disconnect functionality
- Success/error messaging

### Verification Badges
- Compact badge: "✅ 422 km logged"
- Detailed badge: Shows distance + activity count
- Automatically appears on listings from verified sellers

### Home Page Integration
- "Connect Strava" button now links to profile page
- Clean, minimal design consistent with site

## 🔍 Testing

### Development Testing
1. Start your development server: `npm run dev`
2. Navigate to `/profile`
3. Click "Connect Strava"
4. Complete OAuth flow with your Strava account
5. Verify data appears correctly

### Test Data
The system fetches:
- All running activities (`Run` and `VirtualRun` types)
- Total distance (converted from meters to kilometers)
- Activity count
- Athlete name for display

## 🐛 Troubleshooting

### Common Issues

**"Strava OAuth not configured"**
- Check environment variables are set correctly
- Restart your development server after adding .env.local

**"Invalid redirect URI"**
- Ensure callback domain matches in Strava app settings
- Check STRAVA_REDIRECT_URI environment variable

**"Database error"**
- Run the SQL migration in Supabase
- Check RLS policies are properly configured

**"No activities found"**
- User might not have any running activities in Strava
- Check that activities are public or user granted proper permissions

### Debug Mode
Add console logs in API routes to debug OAuth flow:
```javascript
console.log('Token response:', tokenData)
console.log('Activities count:', activities.length)
```

## 📊 Data Storage

### user_strava_verifications Table
```sql
- user_email: Links to user account
- strava_athlete_id: Strava user ID
- strava_athlete_name: Display name
- total_distance_km: Calculated running distance
- total_activities: Number of runs
- access_token: For API calls (encrypt in production)
- refresh_token: For token renewal
- is_active: Allow users to disconnect
```

## 🔄 Future Enhancements

### Potential Improvements
1. **Automatic Sync**: Periodically update activity data
2. **Gear Tracking**: Track shoe-specific mileage if user has gear data
3. **Activity Types**: Support for other activity types (cycling, etc.)
4. **Social Features**: Show recent activities or achievements
5. **Shoe Recommendations**: Suggest shoes based on running patterns

### Token Refresh Implementation
```javascript
// Implement automatic token refresh when tokens expire
const refreshStravaToken = async (refreshToken) => {
  // Call Strava token refresh endpoint
  // Update stored tokens in database
}
```

## 📞 Support

If you encounter issues:
1. Check this documentation
2. Verify environment variables
3. Review Supabase logs
4. Check browser console for errors
5. Test with a fresh Strava account

---

**Security Note**: Never commit your `.env.local` file to version control. The Strava Client Secret should be kept secure and never exposed in frontend code. 