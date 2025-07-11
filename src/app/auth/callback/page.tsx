'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const tokenHash = searchParams.get('token_hash')
        const type = searchParams.get('type')
        const returnTo = searchParams.get('returnTo') || '/'

        if (!tokenHash || type !== 'email') {
          console.error('Invalid callback URL')
          setError('Invalid magic link')
          setStep('error')
          return
        }

        // Verify the email OTP
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash: tokenHash
        })

        if (verifyError) {
          console.error('Error verifying OTP:', verifyError)
          setError('Couldn&apos;t verify your login link. Please try again.')
          setStep('error')
          return
        }

        // Successfully verified
        setStep('success')
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push(returnTo)
        }, 2000)

      } catch (err) {
        console.error('Error in auth callback:', err)
        setError('Something went wrong. Please try logging in again.')
        setStep('error')
      }
    }

    handleAuthCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        {step === 'verifying' && (
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Verifying your login...</p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center text-green-600">
            <p>Successfully logged in! Redirecting...</p>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center text-red-600">
            <p>{error || 'Something went wrong'}</p>
            <button 
              onClick={() => router.push('/login')}
              className="mt-4 text-blue-600 hover:text-blue-800"
            >
              Try logging in again
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 