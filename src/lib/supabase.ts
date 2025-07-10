import { createClient } from '@supabase/supabase-js'

// Create a dummy client for build time
const createDummyClient = () => {
  // Base response without count
  const baseResponse = { 
    data: null, 
    error: null,
    status: 200,
    statusText: 'OK'
  }
  
  const createChainMethods = () => {
    const methods = {
      select: (columns?: string, options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }) => {
        // Only add count if requested
        const response = options?.count 
          ? { ...baseResponse, count: 0 }
          : { ...baseResponse }

        // Create a Promise-like object that is also thenable
        const result = Promise.resolve(response)
        Object.assign(result, methods)
        return result
      },
      insert: () => Promise.resolve({ ...baseResponse }),
      upsert: () => Promise.resolve({ ...baseResponse }),
      update: () => Promise.resolve({ ...baseResponse }),
      delete: () => Promise.resolve({ ...baseResponse }),
      eq: () => methods,
      neq: () => methods,
      gt: () => methods,
      gte: () => methods,
      lt: () => methods,
      lte: () => methods,
      like: () => methods,
      ilike: () => methods,
      is: () => methods,
      in: () => methods,
      contains: () => methods,
      containedBy: () => methods,
      range: () => methods,
      textSearch: () => methods,
      match: () => methods,
      not: () => methods,
      or: () => methods,
      filter: () => methods,
      order: () => methods,
      limit: () => methods,
      offset: () => methods,
      single: () => Promise.resolve({ ...baseResponse }),
      maybeSingle: () => Promise.resolve({ ...baseResponse })
    }

    return methods
  }

  return {
    from: () => createChainMethods(),
    rpc: () => Promise.resolve({ ...baseResponse }),
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