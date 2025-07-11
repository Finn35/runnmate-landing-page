-- Strava Verification Table Migration
-- Run this in your Supabase SQL editor or database management tool

-- Create Strava verification table
CREATE TABLE IF NOT EXISTS user_strava_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_email TEXT NOT NULL,
  strava_athlete_id TEXT NOT NULL,
  strava_athlete_name TEXT NOT NULL,
  access_token JSONB NOT NULL, -- Stores encrypted token data: { encrypted, iv, authTag }
  refresh_token JSONB NOT NULL, -- Stores encrypted token data: { encrypted, iv, authTag }
  token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  total_distance_km INTEGER NOT NULL DEFAULT 0,
  total_activities INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  disconnected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_email)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_strava_verifications_user_email ON user_strava_verifications(user_email);
CREATE INDEX IF NOT EXISTS idx_strava_verifications_athlete_id ON user_strava_verifications(strava_athlete_id);
CREATE INDEX IF NOT EXISTS idx_strava_verifications_is_active ON user_strava_verifications(is_active);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_strava_verification_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_strava_verification_timestamp
  BEFORE UPDATE ON user_strava_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_strava_verification_timestamp();

-- Add RLS policies
ALTER TABLE user_strava_verifications ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own verification
CREATE POLICY read_own_verification ON user_strava_verifications
  FOR SELECT
  USING (auth.jwt() ->> 'email' = user_email);

-- Allow users to update their own verification
CREATE POLICY update_own_verification ON user_strava_verifications
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = user_email);

-- Allow service role to manage all verifications
CREATE POLICY service_role_manage ON user_strava_verifications
  FOR ALL
  USING (auth.jwt() ->> 'role' = 'service_role');

-- Add comments for documentation
COMMENT ON TABLE user_strava_verifications IS 'Stores Strava verification data for users';
COMMENT ON COLUMN user_strava_verifications.access_token IS 'Encrypted Strava access token data in JSONB format: { encrypted, iv, authTag }';
COMMENT ON COLUMN user_strava_verifications.refresh_token IS 'Encrypted Strava refresh token data in JSONB format: { encrypted, iv, authTag }';
COMMENT ON COLUMN user_strava_verifications.token_expires_at IS 'When the access token expires';
COMMENT ON COLUMN user_strava_verifications.total_distance_km IS 'Total running distance in kilometers';
COMMENT ON COLUMN user_strava_verifications.total_activities IS 'Total number of running activities';
COMMENT ON COLUMN user_strava_verifications.is_active IS 'Whether the Strava connection is currently active';
COMMENT ON COLUMN user_strava_verifications.verified_at IS 'When the Strava account was first verified';
COMMENT ON COLUMN user_strava_verifications.disconnected_at IS 'When the Strava account was disconnected (if applicable)';

-- Add function to check if a user has a valid Strava verification
CREATE OR REPLACE FUNCTION has_valid_strava_verification(p_user_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_strava_verifications
    WHERE user_email = p_user_email
      AND is_active = true
      AND token_expires_at > NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 