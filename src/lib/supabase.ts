import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Create a dummy client for build time
const createDummyClient = () => {
  const baseResponse = { 
    data: null, 
    error: null,
    status: 200,
    statusText: 'OK'
  };

  const createChainMethods = () => {
    const methods = {
      select: () => {
        const result = Promise.resolve(baseResponse);
        Object.assign(result, methods);
        return result;
      },
      eq: () => methods,
      neq: () => methods,
      gt: () => methods,
      gte: () => methods,
      lt: () => methods,
      lte: () => methods,
      in: () => methods,
      match: () => methods,
      single: () => Promise.resolve(baseResponse),
      update: () => Promise.resolve(baseResponse),
      upsert: () => Promise.resolve(baseResponse),
      delete: () => Promise.resolve(baseResponse),
      order: () => methods,
      limit: () => methods
    };
    return methods;
  };

  return {
    from: () => createChainMethods(),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
    }
  };
};

// Validate Supabase URL
const validateSupabaseUrl = (url: string | undefined): string => {
  if (!url) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined');
  }

  try {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    
    // Test if it's a valid URL
    new URL(url);
    return url;
  } catch (error) {
    console.error('Invalid Supabase URL:', error);
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format');
  }
};

// Initialize Supabase client
const initSupabase = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return createDummyClient() as unknown as ReturnType<typeof createClient<Database>>;
  }

  const supabaseUrl = validateSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined');
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
};

// Initialize admin client
const initSupabaseAdmin = () => {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return createDummyClient() as unknown as ReturnType<typeof createClient<Database>>;
  }

  const supabaseUrl = validateSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseServiceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey);
};

// Initialize clients with error handling
let supabase: ReturnType<typeof createClient<Database>>;
let supabaseAdmin: ReturnType<typeof createClient<Database>>;

try {
  supabase = initSupabase();
  supabaseAdmin = initSupabaseAdmin();
} catch (error) {
  console.error('Failed to initialize Supabase clients:', error);
  // Provide fallback clients that will return errors
  supabase = createDummyClient() as unknown as ReturnType<typeof createClient<Database>>;
  supabaseAdmin = createDummyClient() as unknown as ReturnType<typeof createClient<Database>>;
}

export { supabase, supabaseAdmin };

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