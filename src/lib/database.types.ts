export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          title: string;
          brand: string;
          size: number;
          condition: string;
          price: number;
          description?: string;
          image_urls: string[];
          created_at: string;
          cleaning_status?: string;
          country: string;
          city?: string;
          seller_email?: string;
          gender?: string;
        };
        Insert: {
          id?: string;
          title: string;
          brand: string;
          size: number;
          condition: string;
          price: number;
          description?: string;
          image_urls?: string[];
          created_at?: string;
          cleaning_status?: string;
          country?: string;
          city?: string;
          seller_email?: string;
          gender?: string;
        };
        Update: {
          id?: string;
          title?: string;
          brand?: string;
          size?: number;
          condition?: string;
          price?: number;
          description?: string;
          image_urls?: string[];
          created_at?: string;
          cleaning_status?: string;
          country?: string;
          city?: string;
          seller_email?: string;
          gender?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          listing_id: string;
          buyer_email: string;
          buyer_name?: string;
          offer_price: number;
          message?: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_email: string;
          buyer_name?: string;
          offer_price: number;
          message?: string;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_email?: string;
          buyer_name?: string;
          offer_price?: number;
          message?: string;
          status?: string;
          created_at?: string;
        };
      };
      launch_notifications: {
        Row: {
          id: string;
          email: string;
          lottery_consent?: boolean;
          shoe_interest?: string;
          signed_up_at?: string;
          is_active?: boolean;
          notified_at?: string;
          lottery_winner?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Insert: {
          id?: string;
          email: string;
          lottery_consent?: boolean;
          shoe_interest?: string;
          signed_up_at?: string;
          is_active?: boolean;
          notified_at?: string;
          lottery_winner?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          lottery_consent?: boolean;
          shoe_interest?: string;
          signed_up_at?: string;
          is_active?: boolean;
          notified_at?: string;
          lottery_winner?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
} 