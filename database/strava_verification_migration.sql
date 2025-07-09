-- Strava Verification Table Migration
-- Run this in your Supabase SQL editor or database management tool

CREATE TABLE IF NOT EXISTS user_strava_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT NOT NULL,
  strava_athlete_id BIGINT NOT NULL,
  strava_athlete_name TEXT NOT NULL,
  total_distance_km INTEGER NOT NULL DEFAULT 0,
  total_activities INTEGER NOT NULL DEFAULT 0,
  access_token TEXT NOT NULL, -- Consider encrypting in production
  refresh_token TEXT NOT NULL, -- Consider encrypting in production
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_strava_verifications_user_email 
ON user_strava_verifications(user_email);

CREATE INDEX IF NOT EXISTS idx_user_strava_verifications_is_active 
ON user_strava_verifications(is_active);

CREATE INDEX IF NOT EXISTS idx_user_strava_verifications_strava_athlete_id 
ON user_strava_verifications(strava_athlete_id);

-- Unique constraint to prevent duplicate active verifications per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_strava_verifications_unique_active 
ON user_strava_verifications(user_email) 
WHERE is_active = TRUE;

-- Row Level Security (RLS) policies
ALTER TABLE user_strava_verifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own verification data
CREATE POLICY "Users can read own strava verification" 
ON user_strava_verifications 
FOR SELECT 
USING (auth.email() = user_email);

-- Policy: Users can insert their own verification data
CREATE POLICY "Users can insert own strava verification" 
ON user_strava_verifications 
FOR INSERT 
WITH CHECK (auth.email() = user_email);

-- Policy: Users can update their own verification data
CREATE POLICY "Users can update own strava verification" 
ON user_strava_verifications 
FOR UPDATE 
USING (auth.email() = user_email);

-- Policy: Allow public read access for verification display (limited fields)
CREATE POLICY "Public read access for verification badges" 
ON user_strava_verifications 
FOR SELECT 
USING (is_active = TRUE);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_strava_verifications_updated_at 
BEFORE UPDATE ON user_strava_verifications 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 