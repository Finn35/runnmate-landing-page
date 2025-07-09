# 🚀 Deploy RUNNMATE to Netlify

## Quick Deployment Guide

Since your Strava app is already configured for the runnmate domain, let's deploy and test on production.

### 🔧 **Step 1: Environment Variables for Netlify**

In your Netlify dashboard, add these environment variables:

```bash
STRAVA_CLIENT_ID=your_runnmate_strava_client_id
STRAVA_CLIENT_SECRET=your_runnmate_strava_client_secret
NEXT_PUBLIC_PRODUCTION_URL=https://runnmate.com
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 🔧 **Step 2: Update Production Config**

The `src/lib/config.ts` file will automatically detect production and use the right URLs.

### 🔧 **Step 3: Database Setup**

Make sure your production Supabase database has the migration:

```sql
-- Run this in your production Supabase SQL editor
-- Copy from: database/strava_verification_migration.sql

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

### 🔧 **Step 4: Netlify Build Settings**

Make sure your `netlify.toml` or build settings use:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 🔧 **Step 5: Deploy and Test**

1. **Deploy to Netlify**
2. **Visit your live site:** `https://runnmate.com`
3. **Test Strava integration:** 
   - Go to `https://runnmate.com/profile`
   - Click "Connect Strava"
   - Should redirect to Strava OAuth
   - After authorization, should redirect back to your site
   - Should show verification badge

### 🔧 **Step 6: Get Proper Tokens on Production**

Once deployed, you can get proper tokens:

1. **Option A:** Use the live OAuth flow
   - Visit `https://runnmate.com/profile`
   - Click "Connect Strava" 
   - Complete OAuth flow

2. **Option B:** Use Strava Playground with production domain
   - Go to [Strava Playground](https://developers.strava.com/playground/)
   - Make sure "View data about your activities" is checked
   - Get tokens and test on production

### 🧪 **Testing on Production**

Your production URLs will be:
- **OAuth start:** `https://runnmate.com/api/strava/auth`
- **OAuth callback:** `https://runnmate.com/api/strava/callback`
- **Profile page:** `https://runnmate.com/profile`
- **Test endpoint:** `https://runnmate.com/api/strava/test` (remove after testing)

### 🚨 **Remove Development Tools**

After successful testing, remove these files from production:
- `public/strava-test.html`
- `public/strava-oauth-helper.html`
- `public/strava-setup.html`
- `src/app/api/strava/test/route.ts`

### ✅ **Success Checklist**

- [ ] Environment variables set in Netlify
- [ ] Database migration run on production Supabase
- [ ] Strava app configured for runnmate.com domain
- [ ] Site deployed and accessible
- [ ] OAuth flow working on production
- [ ] Verification badges showing on profile/listings
- [ ] Development tools removed

---

## 🎯 **This Should Fix Your Issue**

The reason your test is failing is the **domain mismatch**. Once you deploy to the runnmate domain and test there, the Strava OAuth should work perfectly! 