'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

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
}

export default function StravaVerificationBadge({ 
  userEmail, 
  variant = 'compact',
  className = '' 
}: StravaVerificationBadgeProps) {
  const [verification, setVerification] = useState<StravaVerification | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!userEmail) {
      setIsLoading(false)
      return
    }

    loadVerification()
  }, [userEmail])

  const loadVerification = async () => {
    if (!userEmail) return

    try {
      const { data, error } = await supabase
        .from('user_strava_verifications')
        .select('strava_athlete_name, total_distance_km, total_activities, verified_at, is_active')
        .eq('user_email', userEmail)
        .eq('is_active', true)
        .single()

      if (data && !error) {
        setVerification(data)
      }
    } catch (error) {
      console.error('Error loading Strava verification:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
      </div>
    )
  }

  if (!verification) {
    return null
  }

  if (variant === 'compact') {
    return (
      <div className={`inline-flex items-center space-x-1 text-sm ${className}`}>
        <span className="text-green-600">✅</span>
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