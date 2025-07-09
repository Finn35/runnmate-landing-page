# 🏃‍♂️ Strava Implementation Guide

## Quick Start with Your Existing Tokens

Since you already have Strava access and refresh tokens, here's how to implement them in your RUNNMATE app:

### 1. Database Setup

First, run the database migration:

```sql
-- Run this in your Supabase SQL editor or database
-- File: database/strava_verification_migration.sql

CREATE TABLE IF NOT EXISTS user_strava_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  strava_athlete_id BIGINT NOT NULL,
  strava_athlete_name TEXT NOT NULL,
  total_distance_km DECIMAL(10,2) DEFAULT 0,
  total_activities INTEGER DEFAULT 0,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_email, strava_athlete_id)
);

-- Add RLS policies
ALTER TABLE user_strava_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own strava verifications" ON user_strava_verifications
  FOR SELECT USING (auth.email() = user_email);

CREATE POLICY "Users can update own strava verifications" ON user_strava_verifications
  FOR UPDATE USING (auth.email() = user_email);

CREATE POLICY "Users can insert own strava verifications" ON user_strava_verifications
  FOR INSERT WITH CHECK (auth.email() = user_email);
```

### 2. Environment Variables

Add these to your `.env.local`:

```bash
STRAVA_CLIENT_ID=your_strava_client_id
STRAVA_CLIENT_SECRET=your_strava_client_secret
STRAVA_REDIRECT_URI=http://localhost:3000/api/strava/callback
```

### 2.1. ⚠️ IMPORTANT: Token Permissions

Your Strava token **MUST** include `activity:read` permission! If you get an "Authorization Error" about missing `activity:read_permission`, your token only has basic `read` access.

**Fix this by:**
- **Option 1:** Use [Strava Playground](https://developers.strava.com/playground/) and check **"View data about your activities"**
- **Option 2:** Use the OAuth helper: `http://localhost:3000/strava-oauth-helper.html`
- **Option 3:** Manual OAuth URL with scope `read,activity:read`

### 3. Test Your Tokens

Visit the test page in your browser:
```
http://localhost:3000/strava-test.html
```

1. Enter your access token and refresh token
2. Enter your email address 
3. Click "Test Integration"
4. If successful, you'll see your running stats and data will be saved to the database

### 4. Using the Integration

Once your tokens are tested and saved:

#### View Your Profile
```
http://localhost:3000/profile
```

You should see your Strava verification badge with your total distance.

#### API Endpoints Available

- `POST /api/strava/test` - Test tokens (development only)
- `POST /api/strava/refresh` - Refresh expired tokens
- `GET /api/strava/auth` - Start OAuth flow (for new users)
- `GET /api/strava/callback` - OAuth callback handler
- `POST /api/strava/disconnect` - Disconnect Strava

### 5. Using the Strava Utility Functions

```typescript
import { getRunningStats, getAthleteProfile } from '@/lib/strava'

// Get user's running statistics
const stats = await getRunningStats('user@example.com')
console.log(`Total distance: ${stats.totalDistanceKm} km`)

// Get athlete profile info  
const profile = await getAthleteProfile('user@example.com')
console.log(`Athlete: ${profile.firstname} ${profile.lastname}`)
```

### 6. Verification Badge Component

The `StravaVerificationBadge` component automatically displays user verification:

```jsx
import StravaVerificationBadge from '@/components/StravaVerificationBadge'

// Shows badge if user has Strava verification
<StravaVerificationBadge userEmail="user@example.com" />
```

### 7. Token Refresh

Tokens are automatically refreshed when:
- Making API calls through the `makeStravaApiCall` function
- Using `getRunningStats` or `getAthleteProfile`
- Token expires within 5 minutes

Manual refresh:
```typescript
// POST to /api/strava/refresh
const response = await fetch('/api/strava/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userEmail: 'user@example.com' })
})
```

### 8. Security Notes

- Tokens are stored in your database - consider encryption for production
- The test endpoint (`/api/strava/test`) should be removed in production
- Never expose tokens in client-side code
- Use HTTPS in production

### 9. Troubleshooting

**❌ "Authorization Error: activity:read_permission missing"**
- Your token doesn't have `activity:read` scope
- **Solution:** Get a new token with correct permissions:
  1. Use `http://localhost:3000/strava-oauth-helper.html`
  2. Or visit [Strava Playground](https://developers.strava.com/playground/) and check "View data about your activities"
  3. Test again with the new token

**Token Invalid/Expired:**
- Try refreshing with the refresh endpoint
- Check token expiration time in database
- Re-authenticate if refresh token is invalid

**Database Errors:**
- Ensure migration was run successfully
- Check RLS policies are enabled
- Verify user email matches

**API Errors:**
- Check Strava API rate limits (200 requests per 15 minutes)
- Verify scopes include `read` and `activity:read`
- Check network connectivity

### 10. Next Steps

After successful testing:

1. Remove the test endpoint file: `src/app/api/strava/test/route.ts`
2. Remove the test HTML file: `public/strava-test.html` 
3. Set up proper user authentication
4. Add Strava verification to your listing creation flow
5. Display verification badges on user listings

---

## Need Help?

Check the full setup guide: `STRAVA_INTEGRATION_SETUP.md`

The integration includes:
- ✅ OAuth flow for new users
- ✅ Token refresh automation  
- ✅ Activity data fetching
- ✅ Verification badge display
- ✅ Database storage with RLS
- ✅ API routes for all operations 