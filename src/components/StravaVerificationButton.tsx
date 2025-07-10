import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/button'

export default function StravaVerificationButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Check authentication and verification status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.email) {
        checkStravaVerification(session.user.email)
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        checkStravaVerification(session.user.email)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const checkStravaVerification = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_strava_verifications')
        .select('is_active')
        .eq('user_email', email)
        .eq('is_active', true)
        .single()

      setIsVerified(!!data)
    } catch (error) {
      console.error('Error checking Strava verification:', error)
    }
  }

  const handleStravaConnect = async () => {
    // Generate a unique state parameter
    const state = encodeURIComponent(JSON.stringify({
      timestamp: Date.now(),
      email: session?.user?.email || null
    }))

    // Redirect to Strava OAuth directly
    const stravaAuthUrl = `https://www.strava.com/oauth/authorize?` +
      `client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}` +
      `&response_type=code` +
      `&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/api/strava/callback` +
      `&approval_prompt=auto` +
      `&scope=read,activity:read` +
      `&state=${state}`

    window.location.href = stravaAuthUrl
  }

  if (isLoading) {
    return (
      <Button disabled variant="outline" className="w-full h-12 text-base">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </Button>
    )
  }

  if (isVerified) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full h-12 text-base bg-green-600 hover:bg-green-600/90 flex items-center justify-center gap-2">
          <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Strava Connected
        </Button>
        <p className="text-sm text-green-700 text-center">
          Your running history is verified ✓
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleStravaConnect}
        className="w-full h-12 text-base bg-[#FC4C02] hover:bg-[#FC4C02]/90 flex items-center justify-center gap-2 shadow-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
        </svg>
        Connect with Strava
      </Button>
      <p className="text-sm text-gray-600 text-center">
        Connect your Strava to verify your running history
      </p>
    </div>
  )
} 