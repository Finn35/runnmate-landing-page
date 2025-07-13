'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
// Header is included in root layout

interface StravaVerification {
  strava_athlete_name: string
  total_distance_km: number
  total_activities: number
  verified_at: string
  is_active: boolean
}

function ProfileForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<{ email: string; user_metadata?: { name?: string } } | null>(null)
  const [stravaVerification, setStravaVerification] = useState<StravaVerification | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  useEffect(() => {
    // Check for Strava success/error messages
    const stravaSuccess = searchParams?.get('strava_success') || ''
    const stravaError = searchParams?.get('strava_error') || ''
    const distance = searchParams?.get('distance') || ''

    if (stravaSuccess) {
      setMessage({
        type: 'success',
        text: `Strava connected successfully! ${distance} km logged.`
      })
      // Clear URL parameters
      router.replace('/profile')
      // Reload Strava data
      loadStravaVerification()
    } else if (stravaError) {
      setMessage({
        type: 'error',
        text: `Failed to connect Strava: ${stravaError.replace(/_/g, ' ')}`
      })
      router.replace('/profile')
    }
  }, [searchParams, router])

  const checkAuthAndLoadData = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/login?message=login_required')
        return
      }
      
      setUser(currentUser)
      await loadStravaVerification()
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/login?message=session_expired')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStravaVerification = async () => {
    if (!user?.email) return

    try {
      const { data, error } = await supabase
        .from('user_strava_verifications')
        .select('*')
        .eq('user_email', user.email)
        .eq('is_active', true)
        .single()

      if (data && !error) {
        setStravaVerification(data)
      }
    } catch {
      console.error('Error loading Strava verification')
    }
  }

  const handleConnectStrava = () => {
    if (!user?.email) return
    
    // Redirect to Strava OAuth
    window.location.href = `/api/strava/auth?user_email=${encodeURIComponent(user.email)}`
  }

  const handleDisconnectStrava = async () => {
    if (!user?.email || !stravaVerification) return

    setIsDisconnecting(true)
    try {
      const response = await fetch('/api/strava/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: user.email }),
      })

      if (response.ok) {
        setStravaVerification(null)
        setMessage({
          type: 'success',
          text: 'Strava disconnected successfully'
        })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Failed to disconnect Strava. Please try again.'
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

      return (
      <div className="min-h-screen bg-gray-50">
        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
          <p className="text-gray-600">Manage your account and verification settings</p>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid gap-6">
          {/* Basic Profile Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <p className="mt-1 text-gray-900">{user?.user_metadata?.name || 'Not provided'}</p>
              </div>
            </div>
          </div>

          {/* Strava Verification */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Strava Verification</h2>
              {stravaVerification && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  ✅ Verified
                </span>
              )}
            </div>

            {stravaVerification ? (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <svg className="w-6 h-6 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
                    </svg>
                    <span className="font-medium text-gray-900">
                      Connected as {stravaVerification.strava_athlete_name}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Distance:</span>
                      <p className="font-semibold text-gray-900">{stravaVerification.total_distance_km} km</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Activities:</span>
                      <p className="font-semibold text-gray-900">{stravaVerification.total_activities} runs</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3">
                    Verified on {new Date(stravaVerification.verified_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-green-700">✅ Verified via Strava – {stravaVerification.total_distance_km} km logged</p>
                    <p className="mt-1">Your running activities are verified and visible to other users when you list shoes.</p>
                  </div>
                  <button
                    onClick={handleDisconnectStrava}
                    disabled={isDisconnecting}
                    className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                  >
                    {isDisconnecting ? 'Disconnecting...' : 'Disconnect'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-600">
                  Connect your Strava account to verify your running activities and build trust with fellow runners.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-blue-900 mb-2">Benefits of Strava Verification:</h3>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Build trust with verified running history</li>
                    <li>• Show total kilometers logged</li>
                    <li>• Highlight eco-conscious running habits</li>
                    <li>• Help others make informed decisions</li>
                  </ul>
                </div>

                <button
                  onClick={handleConnectStrava}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
                  </svg>
                  Connect Strava
                </button>
                
                <p className="text-xs text-gray-500">
                  Your data stays private – you control what&apos;s shared.
                </p>
              </div>
            )}
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Account Actions</h2>
            <div className="space-y-3">
              <Link 
                href="/sell"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                List Your Shoes
              </Link>
              <Link 
                href="/browse"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors ml-3"
              >
                Browse Shoes
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    }>
      <ProfileForm />
    </Suspense>
  )
}