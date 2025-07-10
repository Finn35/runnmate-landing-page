import { createClient } from '@supabase/supabase-js'

// Create a dummy client for build time
const createDummyClient = () => {
  const dummyResponse = { data: null, error: null, count: 0 }
  const chainMethods = {
    select: () => ({ ...dummyResponse }),
    insert: () => ({ ...dummyResponse }),
    upsert: () => ({ ...dummyResponse }),
    update: () => ({ ...dummyResponse }),
    delete: () => ({ ...dummyResponse }),
    eq: () => chainMethods,
    neq: () => chainMethods,
    gt: () => chainMethods,
    gte: () => chainMethods,
    lt: () => chainMethods,
    lte: () => chainMethods,
    like: () => chainMethods,
    ilike: () => chainMethods,
    is: () => chainMethods,
    in: () => chainMethods,
    contains: () => chainMethods,
    containedBy: () => chainMethods,
    range: () => chainMethods,
    textSearch: () => chainMethods,
    match: () => chainMethods,
    not: () => chainMethods,
    or: () => chainMethods,
    filter: () => chainMethods,
    order: () => chainMethods,
    limit: () => chainMethods,
    offset: () => chainMethods,
    single: () => ({ ...dummyResponse }),
    maybeSingle: () => ({ ...dummyResponse })
  }

  return {
    from: () => chainMethods,
    rpc: () => ({ ...dummyResponse }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } }, error: null })
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        download: () => Promise.resolve({ data: null, error: null }),
        remove: () => Promise.resolve({ data: null, error: null }),
        list: () => Promise.resolve({ data: null, error: null })
      })
    }
  }
}

// Initialize Supabase client
const initSupabase = () => {
  // During build time, return a dummy client
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return createDummyClient()
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uydnxdxkjhrevyxajxya.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZG54ZHhramhyZXZ5eGFqeHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDM4ODAsImV4cCI6MjA2NzIxOTg4MH0.zaTeT6o2pSIIqTnl7dRBRzflhncgW9OjgjCG3FwYTiQ'
  return createClient(supabaseUrl, supabaseAnonKey)
}

export const supabase = initSupabase()

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