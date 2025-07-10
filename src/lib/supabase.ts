import { createClient } from '@supabase/supabase-js'

// Ensure we always have a valid URL during build and runtime
const getSupabaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
  }
  // During build time, return a valid placeholder URL
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return 'https://placeholder-project.supabase.co'
  }
  return 'https://uydnxdxkjhrevyxajxya.supabase.co'
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5ZG54ZHhramhyZXZ5eGFqeHlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2NDM4ODAsImV4cCI6MjA2NzIxOTg4MH0.zaTeT6o2pSIIqTnl7dRBRzflhncgW9OjgjCG3FwYTiQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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