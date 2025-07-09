import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  // Add other user properties as needed
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Error getting session:', error)
      return null
    }

    if (!session?.user) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
    }
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
} 