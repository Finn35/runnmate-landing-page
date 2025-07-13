-- Listings RLS Policy Migration
-- Enables RLS and allows public read access to all listings

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view all listings"
  ON listings
  FOR SELECT
  USING (true); 