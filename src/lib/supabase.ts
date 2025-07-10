import { createClient } from '@supabase/supabase-js'

// Create a dummy client for build time
const createDummyClient = () => {
  const dummyResponse = { data: null, error: null }
  return {
    from: () => ({
      select: () => ({ ...dummyResponse }),
      insert: () => ({ ...dummyResponse }),
      upsert: () => ({ ...dummyResponse }),
      update: () => ({ ...dummyResponse }),
      delete: () => ({ ...dummyResponse }),
      eq: () => ({ ...dummyResponse }),
      single: () => ({ ...dummyResponse })
    })
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