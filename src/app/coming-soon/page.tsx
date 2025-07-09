'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { useLanguage } from '@/contexts/LanguageContext'
import Link from 'next/link'

function ComingSoonForm() {
  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const [userEmail, setUserEmail] = useState<string>('')
  const [shoeTitle, setShoeTitle] = useState<string>('')
  const [isLotteryConsent, setIsLotteryConsent] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    try {
      // Get user from auth
      const user = await getCurrentUser()
      if (user?.email) {
        setUserEmail(user.email)
      }

      // Get shoe details from URL params
      const shoe = searchParams.get('shoe')
      if (shoe) {
        setShoeTitle(decodeURIComponent(shoe))
      }
    } catch (error) {
      console.error('Error initializing page:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleLotteryButtons = () => {
    setIsLotteryConsent(!isLotteryConsent)
  }

  const joinLottery = async () => {
    if (!isLotteryConsent) return

    try {
      // Store lottery consent in database
      await fetch('/api/lottery-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          lotteryConsent: true,
          shoeInterest: shoeTitle
        })
      })

      setConfirmationMessage(`Lottery entry confirmed! We'll notify you at: ${userEmail}`)
      setShowConfirmation(true)
    } catch (error) {
      console.error('Error joining lottery:', error)
    }
  }

  const skipLottery = async () => {
    try {
      // Store email for updates only
      await fetch('/api/lottery-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail,
          lotteryConsent: false,
          shoeInterest: shoeTitle
        })
      })

      setConfirmationMessage(`We'll notify you at: ${userEmail}`)
      setShowConfirmation(true)
    } catch (error) {
      console.error('Error signing up for updates:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium opacity-90">Setting up your purchase details...</p>
          <p className="text-sm opacity-70 mt-2">Almost ready!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      {/* Navigation Header */}
      <nav className="flex items-center justify-between p-4 text-white">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <div className="relative flex items-center">
            <span className="text-2xl font-semibold text-white tracking-tight">
              Ru
            </span>
            <div className="relative">
              <span className="text-2xl font-semibold text-white tracking-tight">
                nn
              </span>
              <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 text-sm text-orange-300">
                ♥
              </div>
            </div>
            <span className="text-2xl font-semibold text-white tracking-tight">
              mate
            </span>
          </div>
        </Link>
        <div className="flex items-center space-x-6 text-sm">
          <Link href="/" className="hover:text-orange-300 transition-colors">Home</Link>
          <Link href="/browse" className="hover:text-orange-300 transition-colors">Browse</Link>
          <Link href="/sell" className="hover:text-orange-300 transition-colors">Sell</Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex items-center justify-center p-5 min-h-[calc(100vh-80px)]">
        <div className="bg-white rounded-3xl max-w-lg overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white text-center relative">
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
              }}
            />
            <div className="w-16 h-16 mx-auto mb-4 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative z-10">
              <span className="text-lg font-extrabold text-white tracking-tight">R</span>
            </div>
            <h1 className="text-2xl font-bold mb-2 relative z-10">
              {shoeTitle ? t('comingSoon.almostHad') : t('comingSoon.almostThere')}
            </h1>
            <p className="opacity-90 relative z-10">
              {shoeTitle 
                ? t('comingSoon.paymentSetup').replace('{shoe}', shoeTitle)
                : t('comingSoon.stillSetting')
              }
            </p>
          </div>

        {/* Content */}
        <div className="p-8">
          <div className="inline-block bg-green-100 text-green-800 px-5 py-2 rounded-full text-sm font-semibold mb-6">
            {t('comingSoon.registered')}
          </div>

          {shoeTitle && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-600 font-medium">{t('comingSoon.wantedToBuy')}</p>
              <p className="text-blue-900 font-semibold">{shoeTitle}</p>
            </div>
          )}

          <div className="bg-gray-50 rounded-xl p-6 mb-8 border-2 border-gray-200">
            <div className="text-blue-600 font-bold text-lg mb-2">{t('comingSoon.launching')}</div>
            <div className="text-gray-600 text-sm leading-relaxed mb-4">
              {t('comingSoon.workingHard')}
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"
                style={{ width: '25%' }}
              />
            </div>
          </div>

          {!showConfirmation ? (
            <div className="bg-gradient-to-br from-red-500 to-red-400 rounded-2xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 text-5xl opacity-30">🎁</div>
              
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-3">{t('comingSoon.sorry')}</h3>
                <p className="text-sm leading-relaxed mb-4 opacity-95">
                  {t('comingSoon.apologyCopy')}
                </p>
                <div className="bg-white bg-opacity-25 rounded-full px-6 py-3 text-lg font-bold mb-2 inline-block">
                  {t('comingSoon.voucher')}
                </div>
                <p className="text-xs opacity-70 mb-5 text-center">
                  {t('comingSoon.voucherDisclaimer')}
                </p>
                <p className="text-sm opacity-90 mb-5">
                  {t('comingSoon.lotteryDetails')}
                </p>

                <div className="bg-white bg-opacity-15 rounded-xl p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="lottery-consent"
                      checked={isLotteryConsent}
                      onChange={toggleLotteryButtons}
                      className="w-4 h-4 mt-1 cursor-pointer"
                    />
                    <label htmlFor="lottery-consent" className="text-sm leading-relaxed cursor-pointer flex-1">
                      {t('comingSoon.lotteryConsent')}
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={joinLottery}
                      disabled={!isLotteryConsent}
                      className={`flex-1 py-3 px-6 rounded-full font-semibold text-sm transition-all ${
                        isLotteryConsent
                          ? 'bg-white text-red-500 hover:bg-gray-50 hover:-translate-y-0.5'
                          : 'bg-white bg-opacity-50 text-red-300 cursor-not-allowed'
                      }`}
                    >
🎯 {t('comingSoon.joinLottery')}
                    </button>
                    <button
                      onClick={skipLottery}
                      className="flex-1 py-3 px-6 rounded-full font-semibold text-sm bg-transparent border-2 border-white border-opacity-50 text-white hover:bg-white hover:bg-opacity-10 hover:border-opacity-100 transition-all"
                    >
📧 {t('comingSoon.skipLottery')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 text-blue-900">
                <span className="text-green-600 text-xl">✓</span>
                <span className="font-medium">{confirmationMessage}</span>
              </div>
            </div>
          )}

          <div className="text-gray-600 text-sm leading-relaxed mt-8 text-center">
            <p className="font-semibold text-gray-900 mb-2">We&apos;ll make this right!</p>
            <p>The shoe you wanted will be available for purchase the moment we launch. We&apos;ll send you a direct link when it&apos;s ready to buy.</p>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default function ComingSoonPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-lg font-medium opacity-90">Loading...</p>
        </div>
      </div>
    }>
      <ComingSoonForm />
    </Suspense>
  )
}