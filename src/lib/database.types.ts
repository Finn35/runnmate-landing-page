export interface Database {
  public: {
    Tables: {
      user_strava_verifications: {
        Row: {
          id: string;
          user_email: string;
          access_token: string;
          refresh_token: string;
          token_expires_at: string;
          is_active: boolean;
          updated_at: string;
          created_at?: string;
          disconnected_at?: string;
        };
        Insert: {
          id?: string;
          user_email: string;
          access_token: string;
          refresh_token: string;
          token_expires_at: string;
          is_active?: boolean;
          updated_at?: string;
          created_at?: string;
          disconnected_at?: string;
        };
        Update: {
          id?: string;
          user_email?: string;
          access_token?: string;
          refresh_token?: string;
          token_expires_at?: string;
          is_active?: boolean;
          updated_at?: string;
          created_at?: string;
          disconnected_at?: string;
        };
      };
      // Add other tables here as needed
    };
  };
} 