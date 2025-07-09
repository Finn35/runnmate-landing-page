-- Launch Notifications Table Migration
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS launch_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  lottery_consent BOOLEAN DEFAULT FALSE,
  shoe_interest TEXT, -- The specific shoe they were interested in buying
  signed_up_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  notified_at TIMESTAMP WITH TIME ZONE, -- When we sent launch notification
  lottery_winner BOOLEAN DEFAULT FALSE, -- Mark lottery winners
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_launch_notifications_email 
ON launch_notifications(email);

CREATE INDEX IF NOT EXISTS idx_launch_notifications_lottery_consent 
ON launch_notifications(lottery_consent);

CREATE INDEX IF NOT EXISTS idx_launch_notifications_is_active 
ON launch_notifications(is_active);

CREATE INDEX IF NOT EXISTS idx_launch_notifications_signed_up_at 
ON launch_notifications(signed_up_at);

-- Row Level Security (RLS) policies
ALTER TABLE launch_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own notification preferences
CREATE POLICY "Users can read own launch notifications" 
ON launch_notifications 
FOR SELECT 
USING (auth.email() = email);

-- Policy: Users can insert their own notification preferences
CREATE POLICY "Users can insert own launch notifications" 
ON launch_notifications 
FOR INSERT 
WITH CHECK (auth.email() = email);

-- Policy: Users can update their own notification preferences
CREATE POLICY "Users can update own launch notifications" 
ON launch_notifications 
FOR UPDATE 
USING (auth.email() = email);

-- Policy: Allow public insert for MVP (since users might not be authenticated yet)
CREATE POLICY "Allow public insert for launch notifications" 
ON launch_notifications 
FOR INSERT 
WITH CHECK (true);

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_launch_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_launch_notifications_updated_at 
BEFORE UPDATE ON launch_notifications 
FOR EACH ROW EXECUTE FUNCTION update_launch_notifications_updated_at();

-- Create a view for lottery statistics (useful for admin dashboard)
CREATE VIEW lottery_stats AS
SELECT 
  COUNT(*) as total_signups,
  COUNT(*) FILTER (WHERE lottery_consent = true) as lottery_entries,
  COUNT(*) FILTER (WHERE lottery_consent = false) as updates_only,
  COUNT(DISTINCT shoe_interest) as unique_shoes_interested,
  MIN(signed_up_at) as first_signup,
  MAX(signed_up_at) as latest_signup
FROM launch_notifications 
WHERE is_active = true; 