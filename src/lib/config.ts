// Environment-aware configuration
const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    // Ensure no trailing slash
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  return 'http://localhost:3000'
}

const config = {
  // Base URL for the application
  baseUrl: getBaseUrl(),
  
  // Strava OAuth configuration
  stravaRedirectUri: `${getBaseUrl()}/api/strava/callback`,
  
  // Other configuration values...
}

export default config

// Helper functions
export const getStravaOAuthUrl = (clientId: string, state?: string): string => {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: config.stravaRedirectUri,
    approval_prompt: 'auto', // Changed from 'force' to 'auto' for better UX
    scope: 'read,activity:read,profile:read_all' // Added profile:read_all to ensure we get email
  })
  
  if (state) {
    params.append('state', state)
  }
  
  return `https://www.strava.com/oauth/authorize?${params.toString()}`
}

export const getConfig = () => config 