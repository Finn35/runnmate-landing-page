export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_strava_verifications: {
        Row: {
          id: string
          user_email: string
          strava_athlete_id: string
          strava_athlete_name: string
          access_token: {
            encrypted: string
            iv: string
            authTag: string
          }
          refresh_token: {
            encrypted: string
            iv: string
            authTag: string
          }
          token_expires_at: string
          total_distance_km: number
          total_activities: number
          is_active: boolean
          verified_at: string
          disconnected_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_email: string
          strava_athlete_id: string
          strava_athlete_name: string
          access_token: {
            encrypted: string
            iv: string
            authTag: string
          }
          refresh_token: {
            encrypted: string
            iv: string
            authTag: string
          }
          token_expires_at: string
          total_distance_km?: number
          total_activities?: number
          is_active?: boolean
          verified_at?: string
          disconnected_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_email?: string
          strava_athlete_id?: string
          strava_athlete_name?: string
          access_token?: {
            encrypted: string
            iv: string
            authTag: string
          }
          refresh_token?: {
            encrypted: string
            iv: string
            authTag: string
          }
          token_expires_at?: string
          total_distance_km?: number
          total_activities?: number
          is_active?: boolean
          verified_at?: string
          disconnected_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_valid_strava_verification: {
        Args: {
          p_user_email: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 