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
        const tokenHash = searchParams?.get('token_hash') || ''
        const type = searchParams?.get('type') || ''
        const returnTo = searchParams?.get('returnTo') || '/'

        console.log('Callback parameters:', { tokenHash: !!tokenHash, type, returnTo })

        if (!tokenHash) {
          console.error('No token_hash in callback URL')
          setError('Invalid magic link - missing token')
          setStep('error')
          return
        }

        if (!type || (type !== 'email' && type !== 'magiclink')) {
          console.error('Invalid or missing type in callback URL:', type)
          setError('Invalid magic link - invalid type')
          setStep('error')
          return
        }

        console.log('Verifying token with type:', type)

        // Verify the token - handle both email OTP and magiclink types
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          type: 'email',
          token_hash: tokenHash
        })

        if (verifyError) {
          console.error('Error verifying token:', verifyError)
          
          // Provide more specific error messages
          if (verifyError.message?.includes('expired')) {
            setError('Your login link has expired. Please request a new one.')
          } else if (verifyError.message?.includes('invalid')) {
            setError('Invalid login link. Please request a new one.')
          } else {
            setError('Couldn\'t verify your login link. Please try again.')
          }
          setStep('error')
          return
        }

        // Wait for session to be established
        if (data.session) {
          console.log('Session established:', data.session.user.email)
          
          // Successfully verified
          setStep('success')
          
          // Force a session refresh to ensure it's properly established
          await supabase.auth.getSession()
          
          // Redirect after a short delay to show success message
          setTimeout(() => {
            router.push(returnTo)
          }, 1500)
        } else {
          // Sometimes session isn't immediately available, try to get it
          console.log('Session not in verification response, checking current session...')
          
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionData.session) {
            console.log('Session found:', sessionData.session.user.email)
            setStep('success')
            
            setTimeout(() => {
              router.push(returnTo)
            }, 1500)
          } else {
            console.error('No session created after verification', sessionError)
            setError('Authentication failed. Please try again.')
            setStep('error')
          }
        }

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