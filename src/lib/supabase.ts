import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Check environment variables
const missingVars = [];

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
} else {
  // Validate Supabase URL format
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!url.hostname.includes('supabase.co')) {
      throw new Error('Invalid Supabase URL format');
    }
  } catch (error) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}. Must be a valid URL like https://your-project.supabase.co`);
  }
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// TypeScript type assertion since we've checked these exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey
});

// Create the main client with anon key for regular user operations
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Create a service role client for admin operations (like Strava callback)
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Test the connection
(async () => {
  try {
    const { error } = await supabase.from('listings').select('count').single();
    if (error) {
      console.error('Failed to connect to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase');
    }
  } catch (err: unknown) {
    console.error('Unexpected error testing Supabase connection:', err);
  }
})();

// Database types for TypeScript support
export interface Listing {
  id?: string
  title: string
  brand: string
  size: number
  condition: string
  price: number
  description?: string
  image_urls: string[]
  cleaning_status?: 'cleaned' | 'not_cleaned' | 'buyer_choice'
  country: string
  city?: string
  seller_email?: string
  created_at?: string
}

export interface Offer {
  id?: string
  listing_id: string
  buyer_email: string
  buyer_name?: string
  offer_price: number
  message?: string
  status: 'pending' | 'accepted' | 'declined'
  created_at?: string
} 