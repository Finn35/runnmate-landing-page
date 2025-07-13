-- Strava Verification Public Badge Policy Migration
-- Allows public read access to active Strava verifications for badge display

ALTER TABLE user_strava_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for verification badges"
  ON user_strava_verifications
  FOR SELECT
  USING (is_active = true); 