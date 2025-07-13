'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
// Removed direct email service import - using API route instead
import { useLanguage } from '@/contexts/LanguageContext'
import StravaVerificationBadge from '@/components/StravaVerificationBadge'

interface Listing {
  id: string
  title: string
  brand: string
  size: number
  condition: string
  price: number
  country: string
  city?: string
  cleaning_status?: string
  description?: string
  image_urls: string[]
  seller_email?: string
  gender?: string
  created_at: string
}

export default function ListingDetailPage() {
  const params = useParams()
  const listingId = params?.id as string || ''
  const { t } = useLanguage()
  
  const [listing, setListing] = useState<Listing | null>(null)
  const [user, setUser] = useState<{ email: string; user_metadata?: { name?: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const [offerData, setOfferData] = useState({
    buyerName: '',
    buyerEmail: '',
    offerPrice: '',
    message: ''
  })
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = useCallback(() => {
    if (!listing?.image_urls.length) return

    const minSwipeDistance = 50
    const swipeDistance = touchStart - touchEnd

    if (Math.abs(swipeDistance) > minSwipeDistance) {
      if (swipeDistance > 0) {
        // Swipe left
        setCurrentImageIndex(prev => 
          prev === listing.image_urls.length - 1 ? 0 : prev + 1
        )
      } else {
        // Swipe right
        setCurrentImageIndex(prev => 
          prev === 0 ? listing.image_urls.length - 1 : prev - 1
        )
      }
    }
  }, [touchStart, touchEnd, listing?.image_urls.length])

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    checkAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const currentUser = await getCurrentUser()
          setUser(currentUser)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )

    // Also check auth when page becomes visible (user returns from login)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    if (listingId) {
      loadListing()
    }
  }, [listingId])

  const loadListing = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single()

      if (error) {
        console.error('Error loading listing:', error)
        return
      }

      setListing(data)
    } catch (error) {
      console.error('Error loading listing:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuyNow = () => {
    if (!user) {
      sessionStorage.setItem('auth_redirect', window.location.href)
      window.location.href = `/login?message=login_to_buy`
      return
    }

    if (listing) {
      // Redirect directly to coming-soon page with shoe info
      window.location.href = `/coming-soon?shoe=${encodeURIComponent(listing.title)}`
    }
  }

  const handleOfferClick = () => {
    if (!user) {
      sessionStorage.setItem('auth_redirect', window.location.href)
      window.location.href = `/login?message=login_to_make_offer`
      return
    }

    if (!listing) return

    setOfferData({
      buyerName: user.user_metadata?.name || '',
      buyerEmail: user.email || '',
      offerPrice: Math.round(listing.price * 0.85).toString(),
      message: t('listing.offer.defaultMessage')
        .replace('{brand}', listing.brand)
        .replace('{title}', listing.title)
    })
    setIsOfferModalOpen(true)
  }

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listing || !user) return

    setIsSubmittingOffer(true)

    try {
      const { error } = await supabase
        .from('offers')
        .insert([
          {
            listing_id: listing.id,
            buyer_email: user.email,
            buyer_name: offerData.buyerName,
            offer_price: parseFloat(offerData.offerPrice),
            message: offerData.message,
            status: 'pending'
          }
        ])

      if (error) {
        console.error('Error submitting offer:', error)
        alert(t('listing.offer.error'))
        return
      }

      // Send email notification to seller
      if (listing.seller_email) {
        try {
          const response = await fetch('/api/send-offer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sellerEmail: listing.seller_email,
              buyerName: offerData.buyerName,
              buyerEmail: user.email,
              listingTitle: `${listing.brand} ${listing.title}`,
              listingPrice: listing.price,
              listingSize: listing.size,
              offerPrice: parseFloat(offerData.offerPrice),
              message: offerData.message
            })
          })

          if (!response.ok) {
            console.error('Failed to send offer notification email')
          }
        } catch (error) {
          console.error('Error sending offer notification:', error)
        }
      }

      alert(t('listing.offer.success'))
      setIsOfferModalOpen(false)
    } catch (error) {
      console.error('Error submitting offer:', error)
      alert(t('listing.offer.error'))
    } finally {
      setIsSubmittingOffer(false)
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'new': 
      case 'nieuw': 
        return 'bg-green-100 text-green-800'
      case 'excellent': 
      case 'uitstekend':
        return 'bg-blue-100 text-blue-800'
      case 'good': 
      case 'goed':
        return 'bg-yellow-100 text-yellow-800'
      case 'used': 
      case 'gebruikt':
        return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getConditionLabel = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'new': 
      case 'nieuw': 
        return t('listing.conditions.new')
      case 'excellent': 
      case 'uitstekend':
        return t('listing.conditions.excellent')
      case 'good': 
      case 'goed':
        return t('listing.conditions.good')
      case 'used': 
      case 'gebruikt':
        return t('listing.conditions.used')
      default: return condition
    }
  }

  const getCleaningIcon = (status?: string) => {
    switch (status) {
      case 'cleaned': return '✅'
      case 'not_cleaned': return '⭕'
      case 'buyer_choice': return '🤝'
      default: return ''
    }
  }

  const getCleaningLabel = (status?: string) => {
    switch (status) {
      case 'cleaned': return t('listing.cleaning.cleaned')
      case 'not_cleaned': return t('listing.cleaning.notCleaned')
      case 'buyer_choice': return t('listing.cleaning.buyerChoice')
      default: return ''
    }
  }

  const getGenderLabel = (gender?: string) => {
    switch (gender?.toLowerCase()) {
      case 'men':
      case 'male':
      case 'heren':
        return t('listing.genders.mens')
      case 'women':
      case 'female':
      case 'dames':
        return t('listing.genders.womens')
      default: return gender
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">{t('listing.notFound')}</h1>
        <Link href="/browse" className="text-blue-500 hover:underline">
          {t('common.backToBrowse')}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <div className="md:grid md:grid-cols-2 md:gap-8">
          {/* Image Gallery - Left Column */}
          <div className="md:sticky md:top-24">
            <div 
              className={`relative ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'w-full'}`}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden">
                <Image
                  src={listing.image_urls[currentImageIndex]}
                  alt={`${listing.brand} ${listing.title}`}
                  fill
                  className={`object-cover ${isFullscreen ? 'object-contain' : ''} hover:scale-105 transition-transform duration-300`}
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  onLoadingComplete={() => setImageLoading(false)}
                  onError={() => setImageError(true)}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
              
              {/* Image Navigation */}
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {listing.image_urls.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentImageIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>

              {/* Image Counter */}
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                {currentImageIndex + 1}/{listing.image_urls.length}
              </div>
            </div>

            {/* Thumbnail Strip - Desktop Only */}
            <div className="hidden md:grid grid-flow-col gap-2 mt-4 overflow-x-auto">
              {listing.image_urls.map((url, index) => (
                <button
                  key={index}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden ${
                    index === currentImageIndex ? 'ring-2 ring-blue-500' : 'hover:opacity-80'
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                >
                  <Image
                    src={url}
                    alt={`${listing.brand} ${listing.title} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details - Right Column */}
          <div className="mt-8 md:mt-0">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="space-y-6">
                {/* Title and Price */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{listing.brand}</h1>
                    <p className="text-xl text-gray-600 mt-1">{listing.title}</p>
                  </div>
                  <div className="text-3xl font-bold text-gray-900">€{listing.price}</div>
                </div>

                {/* Seller verification */}
                {listing.seller_email && (
                  <div className="flex items-center space-x-2">
                    <StravaVerificationBadge 
                      userEmail={listing.seller_email} 
                      variant="detailed"
                      className="w-full"
                    />
                  </div>
                )}

                {/* Product Badges */}
                <div className="flex flex-wrap gap-2">
                  <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                    {getConditionLabel(listing.condition)}
                  </span>
                  {listing.cleaning_status && (
                    <span className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-purple-100 text-purple-800 text-sm font-medium">
                      {getCleaningIcon(listing.cleaning_status)}
                      {getCleaningLabel(listing.cleaning_status)}
                    </span>
                  )}
                  {listing.gender && (
                    <span className="px-4 py-1.5 rounded-full bg-pink-100 text-pink-800 text-sm font-medium">
                      {getGenderLabel(listing.gender)}
                    </span>
                  )}
                </div>

                {/* Product Information */}
                <div className="space-y-6 divide-y divide-gray-100">
                  <div className="grid grid-cols-2 gap-6 py-4">
                    <div>
                      <p className="text-sm text-gray-500">{t('listing.size')}</p>
                      <p className="text-lg font-medium text-gray-900 mt-1">EU {listing.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('listing.location')}</p>
                      <p className="text-lg font-medium text-gray-900 mt-1">{listing.city || listing.country}</p>
                    </div>
                  </div>
                  
                  {listing.description && (
                    <div className="py-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">{t('listing.description')}</h2>
                      <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
                  >
                    {t('listing.buyNow')}
                  </button>
                  <button
                    onClick={handleOfferClick}
                    className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                  >
                    {t('listing.makeOffer')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{t('listing.offer.title')}</h2>
            <form onSubmit={handleOfferSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('listing.offer.name')}
                </label>
                <input
                  type="text"
                  value={offerData.buyerName}
                  onChange={(e) => setOfferData({ ...offerData, buyerName: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('listing.offer.price')}
                </label>
                <input
                  type="number"
                  value={offerData.offerPrice}
                  onChange={(e) => setOfferData({ ...offerData, offerPrice: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('listing.offer.message')}
                </label>
                <textarea
                  value={offerData.message}
                  onChange={(e) => setOfferData({ ...offerData, message: e.target.value })}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOfferModalOpen(false)}
                  className="flex-1 bg-gray-100 text-gray-800 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {isSubmittingOffer ? t('common.submitting') : t('common.submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 