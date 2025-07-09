# Supabase Setup for RUNNMATE

This document explains how to set up Supabase for the RUNNMATE "Sell Your Shoes" feature.

## 1. Create a Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - Name: `runnmate`
   - Database Password: Choose a strong password
   - Region: Choose closest to your users (e.g., Europe West for Netherlands)
6. Click "Create new project"

## 2. Set Up Environment Variables

1. Create a `.env.local` file in your project root
2. Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

**To find these values:**
- Go to your Supabase dashboard
- Click on your project
- Go to Settings → API
- Copy "Project URL" and "anon public" key

## 3. Create the Database Table

1. In your Supabase dashboard, go to the SQL Editor
2. Run this SQL to create the listings table:

```sql
-- Create the listings table
CREATE TABLE public.listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    size INTEGER NOT NULL CHECK (size >= 35 AND size <= 50),
    condition TEXT NOT NULL CHECK (condition IN ('New', 'Excellent', 'Good', 'Used')),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    description TEXT,
    image_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access" ON public.listings
    FOR SELECT USING (true);

-- Create policy to allow public insert access
CREATE POLICY "Allow public insert access" ON public.listings
    FOR INSERT WITH CHECK (true);
```

## 4. Set Up Storage

1. In your Supabase dashboard, go to Storage
2. Create a new bucket:
   - Name: `shoe-images`
   - Public: ✅ Enabled
   - File size limit: 10MB
   - Allowed MIME types: `image/*`

3. Set up storage policies by running this SQL:

```sql
-- Allow public uploads to shoe-images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('shoe-images', 'shoe-images', true);

-- Policy to allow public uploads
CREATE POLICY "Allow public uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'shoe-images');

-- Policy to allow public access to images
CREATE POLICY "Allow public access" ON storage.objects
    FOR SELECT USING (bucket_id = 'shoe-images');
```

## 5. Test the Integration

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000/sell`
3. Fill out the form with test data
4. Upload 1-3 images
5. Submit the form
6. Check your Supabase dashboard:
   - Storage → shoe-images (should show uploaded images)
   - Table Editor → listings (should show your test listing)

## 6. Optional: Set Up Real-time Subscriptions

If you want real-time updates when new shoes are listed:

```sql
-- Enable real-time for the listings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.listings;
```

## 7. Production Considerations

### Security
- Set up proper RLS policies based on user authentication
- Consider adding user authentication before allowing listings
- Validate file types and sizes on the server side

### Performance
- Set up image optimization (Supabase automatically optimizes images)
- Consider adding database indexes for common queries
- Set up caching for frequently accessed data

### Monitoring
- Set up Supabase database monitoring
- Monitor storage usage and costs
- Set up alerts for errors

## Troubleshooting

### Common Issues

**Error: "Failed to upload images"**
- Check if the `shoe-images` bucket exists
- Verify storage policies are set correctly
- Check image file sizes (must be under 10MB)

**Error: "Failed to create listing"**
- Verify the listings table exists
- Check that all required fields are provided
- Ensure RLS policies allow inserts

**Error: "supabaseUrl and supabaseAnonKey are required"**
- Make sure `.env.local` file exists
- Verify environment variable names are correct
- Restart your development server after adding env vars

### Getting Help

- Supabase Documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
- GitHub Issues: Create an issue in your repository

## Database Schema

The listings table structure:

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | Primary Key | Auto-generated unique identifier |
| title | TEXT | NOT NULL | Shoe name/model |
| brand | TEXT | NOT NULL | Shoe brand |
| size | INTEGER | 35-50 | EU shoe size |
| condition | TEXT | Enum | New, Excellent, Good, or Used |
| price | DECIMAL | > 0 | Price in EUR |
| description | TEXT | Optional | Additional details |
| image_urls | TEXT[] | Array | URLs of uploaded images |
| cleaning_status | TEXT | Optional Enum | cleaned, not_cleaned, or buyer_choice |
| created_at | TIMESTAMP | Auto | When listing was created | 