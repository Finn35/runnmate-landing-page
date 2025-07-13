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
      // Sometimes sessions take a moment to establish, try once more
      await new Promise(resolve => setTimeout(resolve, 100))
      const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession()
      
      if (retryError || !retrySession?.user) {
        return null
      }
      
      return {
        id: retrySession.user.id,
        email: retrySession.user.email || '',
      }
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