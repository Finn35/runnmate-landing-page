// Environment-specific configuration for RUNNMATE

interface Config {
  stravaRedirectUri: string
  baseUrl: string
  isDevelopment: boolean
  isProduction: boolean
}

const isDevelopment = process.env.NODE_ENV === 'development'
const isProduction = process.env.NODE_ENV === 'production'

// Get base URL from environment or detect from deployment
const getBaseUrl = (): string => {
  // If explicitly set in environment
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL
  }
  
  // For development
  if (isDevelopment) {
    return 'http://localhost:3000'
  }
  
  // For production - you'll need to set this
  // Common patterns:
  // - Vercel: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://yourdomain.com'
  // - Netlify: process.env.URL || 'https://yourdomain.com' 
  // - Custom: 'https://yourdomain.com'
  
  return process.env.NEXT_PUBLIC_PRODUCTION_URL || 'https://yourdomain.com'
}

const baseUrl = getBaseUrl()

const config: Config = {
  stravaRedirectUri: `${baseUrl}/api/strava/callback`,
  baseUrl,
  isDevelopment,
  isProduction
}

export default config

// Helper functions
export const getStravaOAuthUrl = (clientId: string, state?: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: config.stravaRedirectUri,
    approval_prompt: 'force',
    scope: 'read,activity:read'
  })
  
  if (state) {
    params.append('state', state)
  }
  
  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

export const getConfig = () => config 