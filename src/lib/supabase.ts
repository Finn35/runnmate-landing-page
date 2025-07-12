import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { authEmailTemplates } from './auth-email-templates';
import { sendEmail } from './email-service';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// Check environment variables
const missingVars = [];

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
} else {
  // Validate Supabase URL format
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    if (!url.hostname.includes('supabase.co')) {
      throw new Error('Invalid Supabase URL format');
    }
  } catch (error) {
    throw new Error(`Invalid NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}. Must be a valid URL like https://your-project.supabase.co`);
  }
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}

// TypeScript type assertion since we've checked these exist
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Supabase Configuration:', {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey
});

// Create the main client with anon key for regular user operations
export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
    }
  }
);

// Create a service role client for admin operations (like Strava callback)
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Custom email handler for magic link authentication
export async function sendMagicLink(email: string, redirectTo?: string) {
  try {
    // Get the redirect URL
    const finalRedirectTo = redirectTo || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`;

    // Generate OTP using Supabase
    // Note: Supabase email templates should be disabled in the dashboard to prevent duplicate emails
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: finalRedirectTo,
        shouldCreateUser: true
      }
    });

    if (error) throw error;

    // Debug: Log the response to see what we're getting
    console.log('Supabase OTP response:', JSON.stringify(data, null, 2));

    // Get the OTP token from the response - try different possible locations
    let emailOTP = (data as any)?.properties?.email_otp;
    
    // Alternative locations where the token might be
    if (!emailOTP) {
      emailOTP = (data as any)?.email_otp;
    }
    if (!emailOTP) {
      emailOTP = (data as any)?.session?.access_token;
    }
    if (!emailOTP) {
      emailOTP = (data as any)?.user?.email_confirmed_at;
    }
    
    // If still no token, we need to generate our own magic link differently
    if (!emailOTP) {
      console.error('No OTP token found in response. Available data:', data);
      throw new Error('No OTP received from Supabase - check console for response structure');
    }

    // Send custom email using Resend
    const magicLink = `${finalRedirectTo}?token_hash=${emailOTP}&type=email`;
    
    // Call our API endpoint to send email (to avoid client-side API key exposure)
    const response = await fetch('/api/auth/send-magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        magicLink
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send magic link email');
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error sending magic link:', error);
    return { data: null, error };
  }
}

// Alternative approach: Use Supabase's built-in flow but with custom email
export async function sendMagicLinkAlternative(email: string, redirectTo?: string) {
  try {
    // This approach lets Supabase handle the OTP generation completely
    // but we intercept it and send our own email
    
    // First, create a user session request without sending email
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo || `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`,
        shouldCreateUser: true
      }
    });

    if (error) throw error;

    // Instead of trying to extract the token, we'll create our own magic link
    // using a different approach - storing a temporary token in the database
    // and sending that via email
    
    // For now, let's just use the standard Supabase flow
    // The user will need to re-enable email templates temporarily
    
    return { data, error: null };
  } catch (error) {
    console.error('Error in alternative magic link flow:', error);
    return { data: null, error };
  }
}

// Test the connection
(async () => {
  try {
    const { error } = await supabase.from('listings').select('count').single();
    if (error) {
      console.error('Failed to connect to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase');
    }
  } catch (err: unknown) {
    console.error('Unexpected error testing Supabase connection:', err);
  }
})();

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