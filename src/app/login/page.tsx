'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'

function LoginForm() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const returnTo = searchParams.get('returnTo')

  // Handle URL error parameters
  useEffect(() => {
    const urlError = searchParams.get('error')
    const urlMessage = searchParams.get('message')
    
    if (urlError) {
      switch (urlError) {
        case 'auth_failed':
          setError(t('login.errors.authFailed'))
          break
        case 'invalid_link':
          setError(t('login.errors.invalidLink'))
          break
        case 'expired':
          setError(t('login.errors.expired'))
          break
        default:
          setError(t('login.errors.generic'))
      }
    }
    
    if (urlMessage === 'login_required') {
      setMessage('To connect your Strava account, we first need to create your RUNNMATE account. This helps us maintain a trusted community of runners. After logging in, you\'ll be automatically redirected to complete your Strava verification.')
    } else if (urlMessage === 'login_to_make_offer') {
      setMessage(t('login.messages.loginToMakeOffer'))
    } else if (urlMessage === 'login_to_buy') {
      setMessage(t('login.messages.loginToBuy'))
    }
  }, [searchParams, t])

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous messages
    setMessage('')
    setError('')

    // Validate email
    if (!email.trim()) {
      setError(t('login.errors.emailRequired'))
      return
    }

    if (!validateEmail(email)) {
      setError(t('login.errors.invalidEmail'))
      return
    }

    setIsLoading(true)

    try {
      // Preserve returnTo in redirect URL
      const redirectParams = new URLSearchParams(searchParams.toString())
      if (returnTo) {
        redirectParams.set('returnTo', returnTo)
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?${redirectParams.toString()}`
        }
      })

      if (error) {
        throw error
      }

      setMessage(t('login.messages.magicLinkSent'))
      setEmail('') // Clear email after successful submission
    } catch (error) {
      console.error('Login error:', error)
      
      // Handle specific Supabase errors
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      if (errorMessage.includes('rate limit')) {
        setError(t('login.errors.rateLimit'))
      } else if (errorMessage.includes('invalid email')) {
        setError(t('login.errors.invalidEmail'))
      } else {
        setError(errorMessage || t('login.errors.generic'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          Welcome to RUNNMATE
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-6">
              <p className="text-green-800 text-sm font-medium">{message}</p>
              <p className="text-green-700 text-xs mt-1">
                {t('login.checkSpam')}
              </p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              No account needed! Just enter your email and we'll send you a secure login link.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="animate-pulse bg-gray-200 h-8 w-48 mx-auto rounded"></div>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
            <div className="animate-pulse bg-gray-200 h-10 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}