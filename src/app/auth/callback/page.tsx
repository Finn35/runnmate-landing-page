'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'

export default function AuthCallback() {
  const router = useRouter()
  const [step, setStep] = useState<'authenticating' | 'success' | 'redirecting'>('authenticating')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (accessToken && refreshToken) {
          // Set the session in Supabase
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })

          if (error) {
            console.error('Error setting session:', error)
            router.push('/login?error=auth_failed')
            return
          }

          console.log('Successfully authenticated:', data.user?.email)
          
          // Show success state
          setStep('success')
          await new Promise(resolve => setTimeout(resolve, 1500))
          
          // Show redirecting state
          setStep('redirecting')
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Check if we need to continue with Strava verification
          const searchParams = new URLSearchParams(window.location.search)
          if (searchParams.get('message') === 'strava_verification_requires_login') {
            // Initiate Strava verification
            const state = encodeURIComponent(JSON.stringify({
              userEmail: data.user?.email,
              timestamp: Date.now()
            }))

            const stravaAuthUrl = `https://www.strava.com/oauth/authorize?` +
              `client_id=${process.env.NEXT_PUBLIC_STRAVA_CLIENT_ID}` +
              `&response_type=code` +
              `&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/api/strava/callback` +
              `&approval_prompt=auto` +
              `&scope=read,activity:read` +
              `&state=${state}`

            window.location.href = stravaAuthUrl
            return
          }
          
          // Check for redirect URL in sessionStorage (set when redirecting to login)
          const redirectUrl = sessionStorage.getItem('auth_redirect')
          if (redirectUrl) {
            sessionStorage.removeItem('auth_redirect')
            router.push(redirectUrl)
          } else {
            // Default redirect to browse page
            router.push('/browse')
          }
        } else {
          console.error('No access token found in URL')
          router.push('/login?error=invalid_link')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router])

  const getStepContent = () => {
    switch (step) {
      case 'authenticating':
        return {
          icon: (
            <svg 
              className="animate-spin h-6 w-6 text-blue-600" 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24"
            >
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          ),
          title: 'Signing you in...',
          subtitle: 'Verifying your magic link credentials',
          bgColor: 'bg-blue-100'
        }
      case 'success':
        return {
          icon: (
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          title: 'Success! 🎉',
          subtitle: new URLSearchParams(window.location.search).get('message') === 'strava_verification_requires_login'
            ? 'Now connecting to Strava...'
            : 'You\'re now signed in to RUNNMATE',
          bgColor: 'bg-green-100'
        }
      case 'redirecting':
        return {
          icon: (
            <svg 
              className="animate-bounce h-6 w-6 text-orange-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          ),
          title: new URLSearchParams(window.location.search).get('message') === 'strava_verification_requires_login'
            ? 'Connecting to Strava...'
            : 'Taking you to your shoes...',
          subtitle: new URLSearchParams(window.location.search).get('message') === 'strava_verification_requires_login'
            ? 'Almost there! Connecting to verify your running history'
            : 'Almost there! Redirecting to continue your purchase',
          bgColor: 'bg-orange-100'
        }
    }
  }

  const stepContent = getStepContent()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* RUNNMATE Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <Image src="/runnmate-logo.svg" alt="RUNNMATE" className="h-10" width={40} height={40} />
          </div>
        </div>

        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10 border border-gray-200">
          <div className="text-center">
            <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-full ${stepContent.bgColor} mb-4`}>
              {stepContent.icon}
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              {stepContent.title}
            </h2>
            <p className="text-sm text-gray-600">
              {stepContent.subtitle}
            </p>
            
            {/* Progress bar */}
            <div className="mt-6 w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className="bg-gradient-to-r from-blue-600 to-orange-500 h-1.5 rounded-full transition-all duration-1000 ease-in-out"
                style={{ 
                  width: step === 'authenticating' ? '33%' : step === 'success' ? '66%' : '100%' 
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 