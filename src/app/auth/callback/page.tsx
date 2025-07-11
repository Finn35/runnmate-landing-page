'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState<'verifying' | 'success' | 'redirecting'>('verifying')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const returnTo = searchParams.get('returnTo')

        if (!tokenHash || type !== 'email') {
          console.error('Invalid callback URL')
          router.push('/login?error=invalid_link')
          return
        }

        // Verify the email OTP
        const { data, error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: 'email'
        })

        if (error) {
          console.error('Error verifying OTP:', error)
          router.push('/login?error=auth_failed')
          return
        }

        if (!data.user || !data.session) {
          console.error('No user or session data')
          router.push('/login?error=auth_failed')
          return
        }

        console.log('Successfully authenticated:', data.user.email)
        
        // Show success state
        setStep('success')
        await new Promise(resolve => setTimeout(resolve, 1500))
        
        // Show redirecting state
        setStep('redirecting')
        await new Promise(resolve => setTimeout(resolve, 800))

        // Handle redirect
        if (returnTo) {
          router.push(returnTo)
        } else {
          // Default redirect to lottery page
          router.push('/coming-soon')
        }
      } catch (error) {
        console.error('Auth callback error:', error)
        router.push('/login?error=auth_failed')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-md text-center">
        {step === 'verifying' && (
          <>
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Just a moment while we log you in</p>
          </>
        )}
        
        {step === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Successfully verified!</h2>
            <p className="text-gray-600">You're now logged in</p>
          </>
        )}
        
        {step === 'redirecting' && (
          <>
            <LoadingSpinner size="lg" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Redirecting...</h2>
            <p className="text-gray-600">Taking you to your destination</p>
          </>
        )}
      </div>
    </div>
  )
} 