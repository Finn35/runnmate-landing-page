'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface StravaVerification {
  strava_athlete_name: string
  total_distance_km: number
  total_activities: number
  verified_at: string
  is_active: boolean
}

interface StravaVerificationBadgeProps {
  userEmail?: string
  variant?: 'compact' | 'detailed'
  className?: string
  showConnectButton?: boolean
  iconOnly?: boolean // NEW PROP
}

export default function StravaVerificationBadge({ 
  userEmail, 
  variant = 'compact',
  className = '',
  showConnectButton = false,
  iconOnly = false // NEW PROP
}: StravaVerificationBadgeProps) {
  const router = useRouter()
  const [verification, setVerification] = useState<StravaVerification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    if (!userEmail) {
      setIsLoading(false)
      return
    }

    loadVerification()
  }, [userEmail])

  const loadVerification = async () => {
    if (typeof userEmail !== 'string') return

    try {
      const { data, error } = await supabase
        .from('user_strava_verifications')
        .select('strava_athlete_name, total_distance_km, total_activities, verified_at, is_active')
        .eq('user_email', userEmail)
        .eq('is_active', true)
      // Removed .single()

      if (data && data.length > 0 && !error) {
        setVerification(data[0])
      } else {
        setVerification(null)
      }
    } catch (error) {
      console.error('Error loading Strava verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Not logged in - redirect to login with returnTo
        const currentPath = window.location.pathname + window.location.search
        router.push(`/login?message=login_required&returnTo=${encodeURIComponent(currentPath)}`)
        return
      }

      // User is logged in - redirect to Strava auth
      if (session.user.email) {
        const stravaAuthUrl = `/api/strava/auth?user_email=${encodeURIComponent(session.user.email)}`
        window.location.href = stravaAuthUrl
      }
    } catch (error) {
      console.error('Error connecting to Strava:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (!verification && showConnectButton) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className={`inline-flex items-center space-x-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg shadow transition-colors ${className}`}
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
            <span>Connect Strava</span>
          </>
        )}
      </button>
    )
  }

  if (!verification) {
    return null
  }

  // NEW: iconOnly mode for minimal badge
  if (iconOnly) {
    return (
      <span className={`inline-flex items-center ${className}`} title="Seller is Strava Verified">
        <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
        </svg>
      </span>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center space-x-1 text-sm ${className}`}>
        <span className="text-green-600">✓</span>
        <span className="font-medium text-green-700">
          {verification.total_distance_km} km logged
        </span>
      </div>
    )
  }

  // Detailed variant
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
            </svg>
            <span className="font-medium text-green-900">Strava Verified</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {verification.total_distance_km} km logged • {verification.total_activities} activities
          </p>
          <p className="text-xs text-green-600 mt-1">
            Verified on {new Date(verification.verified_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  )
} 