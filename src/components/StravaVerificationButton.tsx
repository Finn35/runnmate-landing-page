import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from './ui/button'
import { useAuth } from '@/contexts/AuthContext'

export default function StravaVerificationButton() {
  const router = useRouter()
  const { user, isAuthLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)

  useEffect(() => {
    if (user?.email) {
      checkStravaVerification(user.email)
    } else {
      setIsVerified(false)
    }
    setIsLoading(false)
  }, [user?.email])

  const checkStravaVerification = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('user_strava_verifications')
        .select('is_active')
        .eq('user_email', email)
        .eq('is_active', true)
      setIsVerified(!!(data && data.length > 0))
    } catch (error) {
      console.error('Error checking Strava verification:', error)
    }
  }

  const handleStravaConnect = async () => {
    if (!user?.email) {
      // User not logged in, redirect to login
      const currentPath = window.location.pathname + window.location.search
      router.push(`/login?message=login_required&returnTo=${encodeURIComponent(currentPath)}`)
      return
    }
    // Use our auth route instead of going directly to Strava
    window.location.href = `/api/strava/auth?user_email=${encodeURIComponent(user.email)}`
  }

  if (isAuthLoading || isLoading) {
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