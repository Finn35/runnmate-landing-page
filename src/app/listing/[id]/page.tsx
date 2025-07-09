'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { sendOfferNotification } from '@/lib/email-service'
import { useLanguage } from '@/contexts/LanguageContext'
import Header from '@/components/Header'

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
  const listingId = params.id as string
  const { t } = useLanguage()
  
  const [listing, setListing] = useState<Listing | null>(null)
  const [user, setUser] = useState<{ email: string; user_metadata?: { name?: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [offerData, setOfferData] = useState({
    buyerName: '',
    buyerEmail: '',
    offerPrice: '',
    message: ''
  })
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    checkAuth()
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

    const confirmed = confirm(
      t('listing.buyConfirmation.message')
        .replace('{title}', listing?.title || '')
        .replace('{price}', listing?.price?.toString() || '')
    )
    
    if (confirmed) {
      alert(t('listing.buyConfirmation.success'))
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
        await sendOfferNotification({
          sellerEmail: listing.seller_email,
          buyerName: offerData.buyerName,
          buyerEmail: user.email,
          listingTitle: `${listing.brand} ${listing.title}`,
          offerPrice: parseFloat(offerData.offerPrice),
          message: offerData.message,
          listingPrice: listing.price,
          listingSize: listing.size
        })
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('listing.loading')}</p>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('listing.notFound')}</h1>
          <p className="text-gray-600 mb-6">{t('listing.notFoundDescription')}</p>
          <Link 
            href="/browse"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('listing.backToBrowse')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Back to Browse */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Link 
          href="/browse"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {t('listing.backToBrowse')}
        </Link>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden shadow-sm border border-gray-200 relative">
              {imageLoading && (
                <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
                  <div className="text-gray-400">{t('common.loading')}</div>
                </div>
              )}
              <Image
                src={listing.image_urls[currentImageIndex] || '/placeholder-shoe.jpg'}
                alt={`${listing.title} - Main photo`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                quality={95}
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                onLoad={() => setImageLoading(false)}
                onError={() => {
                  setImageError(true)
                  setImageLoading(false)
                }}
              />
              {imageError && (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">👟</div>
                    <div className="text-sm">{t('listing.imageUnavailable')}</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Thumbnail Images */}
            {listing.image_urls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {listing.image_urls.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square w-20 min-w-[80px] rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      currentImageIndex === index ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    } relative`}
                  >
                    <Image
                      src={url}
                      alt={`${listing.title} photo ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="80px"
                      quality={80}
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-bold text-blue-600">€{listing.price}</span>
                <span className="text-lg text-gray-600">{t('listing.sizeEU')} {listing.size}</span>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                {getConditionLabel(listing.condition)} {t('listing.condition')}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                {listing.brand}
              </span>
              {listing.gender && (
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                  {getGenderLabel(listing.gender)}
                </span>
              )}
              {listing.cleaning_status && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  {getCleaningIcon(listing.cleaning_status)} {getCleaningLabel(listing.cleaning_status)}
                </span>
              )}
            </div>

            {/* Location */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center text-gray-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">
                  {listing.city ? `${listing.city}, ${listing.country}` : listing.country}
                </span>
              </div>
              {listing.city && (
                <p className="text-sm text-green-600 mt-1 ml-7">
                  ✅ {t('listing.localPickupAvailable')}
                </p>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-2">{t('listing.description')}</h3>
                <p className="text-gray-700 leading-relaxed">{listing.description}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3 pt-4">
              {/* Primary Action - Buy Now */}
              <button
                onClick={handleBuyNow}
                className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors text-lg font-medium"
              >
                {t('listing.buyNow')} - €{listing.price}
              </button>
              
              {/* Secondary Action - Make Offer */}
              <button
                onClick={handleOfferClick}
                className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-lg font-medium"
              >
                {t('listing.makeOffer')}
              </button>
            </div>

            {/* Listing Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
              <p>{t('listing.listed')} {new Date(listing.created_at).toLocaleDateString()}</p>
              <p className="mt-1">{t('listing.listingId')}: {listing.id.slice(0, 8)}...</p>
            </div>
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{t('listing.offer.title')}</h2>
                <button
                  onClick={() => setIsOfferModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleOfferSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('listing.offer.yourName')}
                  </label>
                  <input
                    type="text"
                    value={offerData.buyerName}
                    onChange={(e) => setOfferData({...offerData, buyerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('listing.offer.yourEmail')}
                  </label>
                  <input
                    type="email"
                    value={offerData.buyerEmail}
                    onChange={(e) => setOfferData({...offerData, buyerEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('listing.offer.yourOffer')}
                  </label>
                  <input
                    type="number"
                    value={offerData.offerPrice}
                    onChange={(e) => setOfferData({...offerData, offerPrice: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    step="0.01"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Asking price: €{listing.price}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('listing.offer.message')}
                  </label>
                  <textarea
                    value={offerData.message}
                    onChange={(e) => setOfferData({...offerData, message: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Any questions or additional details..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingOffer}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmittingOffer ? t('listing.offer.submitting') : t('listing.offer.submit')}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 