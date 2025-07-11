'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase, sendMagicLink } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

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
      setMessage(t('login.messages.stravaLoginRequired'))
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
      // Build the redirect URL with all necessary parameters
      const redirectParams = new URLSearchParams()
      
      // Add returnTo if provided, otherwise default to coming-soon
      const finalReturnTo = returnTo || '/coming-soon'
      redirectParams.set('returnTo', finalReturnTo)

      // Add any message parameter if it exists
      const message = searchParams.get('message')
      if (message) {
        redirectParams.set('message', message)
      }

      const redirectTo = `${window.location.origin}/auth/callback?${redirectParams.toString()}`
      const { error } = await sendMagicLink(email.trim(), redirectTo)

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
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-2xl font-semibold text-center mb-6">
          {t('login.welcome')}
        </h1>
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
                {t('login.emailLabel')}
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
                  placeholder={t('login.emailPlaceholder')}
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
                {isLoading ? t('login.sending') : t('login.sendMagicLink')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-600">
              {t('login.noAccountNeeded')}
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

// Export the page component with Suspense
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginForm />
    </Suspense>
  )
}