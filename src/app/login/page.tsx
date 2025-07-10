'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

function LoginForm() {
  const { t } = useLanguage()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const searchParams = useSearchParams()

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
    
    if (urlMessage === 'login_to_make_offer') {
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
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
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
        {/* Clean Login Card */}
        <div className="bg-white py-8 px-6 shadow-lg sm:rounded-xl sm:px-10">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t('login.title')}
            </h2>
            <p className="text-gray-600">
              {t('login.subtitle')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.emailLabel')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder={t('login.emailPlaceholder')}
                disabled={isLoading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
                <p className="text-green-800 text-sm font-medium">{message}</p>
                <p className="text-green-700 text-xs mt-1">
                  {t('login.checkSpam')}
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-colors ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? `${t('login.sendLink')}...` : t('login.sendLink')}
            </button>
          </form>

          {/* Simple Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center space-y-3">
            <p className="text-xs text-gray-500">
              {t('login.secureLink')}
            </p>
            <div className="text-sm text-gray-600">
              {t('login.wantToSell')} <a href="/sell" className="text-blue-600 hover:text-blue-800 font-medium">{t('login.listYourShoes')}</a>
            </div>
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              {t('login.backToHome')}
            </Link>
          </div>
        </div>
      </div>


    </div>
  )
}

export default function LoginPage() {
  const { t } = useLanguage()
  
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-32 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}