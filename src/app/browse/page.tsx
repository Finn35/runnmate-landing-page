'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
// Removed direct email service import - using API route instead
import { LoadingCard, LoadingSection } from '@/components/ui/loading'
import { Search, SHOE_SUGGESTIONS } from '@/components/ui/search'
import { useToastHelpers } from '@/components/ui/toast'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
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

interface OfferModalProps {
  listing: Listing | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (offerData: {
    offerPrice: number
    message: string
    buyerName: string
    buyerEmail: string
  }) => void
}

function OfferModal({ listing, isOpen, onClose, onSubmit }: OfferModalProps) {
  const [offerPrice, setOfferPrice] = useState('')
  const [message, setMessage] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (listing && isOpen) {
      // Suggest 85% of asking price
      const suggestedPrice = Math.round(listing.price * 0.85)
      setOfferPrice(suggestedPrice.toString())
      setMessage(`Hi! I'm interested in your ${listing.title}. Would you consider €${suggestedPrice}?`)
    }
  }, [listing, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listing || !offerPrice || !buyerEmail) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        offerPrice: parseFloat(offerPrice),
        message,
        buyerName,
        buyerEmail
      })
      onClose()
      // Reset form
      setOfferPrice('')
      setMessage('')
      setBuyerName('')
      setBuyerEmail('')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !listing) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Make an Offer</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium">{listing.title}</h4>
          <p className="text-sm text-gray-600">Size {listing.size} • €{listing.price}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="buyerName"
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="buyerEmail" className="block text-sm font-medium text-gray-700 mb-1">
              Your Email
            </label>
            <input
              type="email"
              id="buyerEmail"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Your Offer (€)
            </label>
            <input
              type="number"
              id="offerPrice"
              value={offerPrice}
              onChange={(e) => setOfferPrice(e.target.value)}
              min="1"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Asking price: €{listing.price}
            </p>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message (optional)
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Add a personal message..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ListingCard({ listing, onSendOffer, onViewDetails, onBuyNow }: {
  listing: Listing
  onSendOffer: (listing: Listing) => void
  onViewDetails: (listing: Listing) => void
  onBuyNow: (listing: Listing) => void
}) {
  const { t } = useLanguage()
  const [imageError, setImageError] = useState(false)
  
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new': return 'bg-green-100 text-green-800'
      case 'excellent': return 'bg-blue-100 text-blue-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'used': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Log image URLs for debugging
  useEffect(() => {
    if (listing.image_urls && listing.image_urls.length > 0) {
      console.log('Image URLs for listing:', listing.title, listing.image_urls);
    }
  }, [listing]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      {!imageError && listing.image_urls && listing.image_urls.length > 0 && (
        <div className="relative w-full h-48">
          <Image
            src={listing.image_urls[0]}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={() => {
              console.error('Failed to load image:', listing.image_urls[0]);
              setImageError(true);
            }}
          />
        </div>
      )}
      
      {/* Fallback for missing/error images */}
      {(imageError || !listing.image_urls || listing.image_urls.length === 0) && (
        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1 flex items-center gap-2">
            {listing.title}
            {listing.seller_email && (
              <StravaVerificationBadge userEmail={listing.seller_email} iconOnly className="ml-2" />
            )}
          </h3>
          <p className="text-sm text-gray-600">
            {listing.brand} • Size {listing.size}
          </p>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(listing.condition)} mt-2`}>
            {listing.condition}
          </span>
        </div>

        {listing.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Buttons */}
        <div className="space-y-2">
          {/* Primary Action - Buy Now */}
          <button
            onClick={() => onBuyNow(listing)}
            className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            {t('browse.actions.buyNow')} - €{listing.price}
          </button>
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails(listing)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {t('browse.actions.details')}
            </button>
            <button
              onClick={() => onSendOffer(listing)}
              className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {t('browse.actions.makeOffer')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowsePage() {
  const router = useRouter()
  const { t, language } = useLanguage();
  const toast = useToastHelpers()
  
  const [listings, setListings] = useState<Listing[]>([])
  const [user, setUser] = useState<{ email: string; user_metadata?: { name?: string } } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    size: '',
    brand: '',
    country: '',
    gender: '',
    cleanedOnly: false,
    priceMin: '',
    priceMax: ''
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Offer modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [, setIsSubmittingOffer] = useState(false)

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    }
    checkAuth()

    // Listen for auth state changes (login, logout, magic link, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await checkAuth(); // Re-fetch user and Strava data
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    // Also re-check when page becomes visible (user returns from login/Strava)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAuth();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const loadListings = async () => {
    try {
      setIsLoading(true)
      
      console.log('Loading listings for user:', user);

      // First check if we can connect
      const { data: testData, error: testError } = await supabase
        .from('listings')
        .select('count');

      if (testError) {
        console.error('Database connection error:', testError);
        toast.error('Failed to connect to database', testError.message);
        return;
      }

      console.log('Database connection test successful, count:', testData);

      // Now get the actual listings
      const { data, error, status } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false });

      console.log('Listings fetch result:', { status, error, data });

      if (error) {
        // Handle invalid session: sign out and reload for public access
        if (status === 401 || status === 403) {
          toast.error('Session expired or invalid. Reloading as guest...');
          await supabase.auth.signOut();
          setTimeout(() => window.location.reload(), 1200); // Give user time to see toast
          return;
        }
        console.error('Error fetching listings:', error);
        toast.error('Failed to fetch listings', error.message);
        setListings([]); // Ensure listings is empty on error
        return;
      }

      if (!data || data.length === 0) {
        console.log('No listings found in database');
        setListings([]);
        return;
      }

      console.log('Successfully fetched listings:', {
        count: data.length,
        firstListing: data[0],
        lastListing: data[data.length - 1]
      });

      setListings(data);
    } catch (err) {
      console.error('Unexpected error in loadListings:', err);
      toast.error('Unexpected error', err instanceof Error ? err.message : 'Unknown error');
      setListings([]); // Ensure listings is empty on error
    } finally {
      setIsLoading(false);
    }
  }

  // Load listings on mount
  useEffect(() => {
    loadListings()
  }, [])

  // Debug: Timeout fallback for loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        toast.error('Loading is taking too long. Please refresh or try logging out and in again.');
        setIsLoading(false);
      }, 8000);
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Combined filtering logic
  const filteredListings = useMemo(() => {
    let filtered = listings

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(listing => 
        listing.title.toLowerCase().includes(query) ||
        listing.brand.toLowerCase().includes(query) ||
        listing.description?.toLowerCase().includes(query) ||
        listing.city?.toLowerCase().includes(query)
      )
    }

    // Size filter
    if (filters.size) {
      filtered = filtered.filter(listing => listing.size === parseFloat(filters.size))
    }

    // Brand filter
    if (filters.brand && filters.brand !== 'All') {
      filtered = filtered.filter(listing => listing.brand === filters.brand)
    }

    // Country filter
    if (filters.country && filters.country !== 'All') {
      filtered = filtered.filter(listing => listing.country === filters.country)
    }

    // Gender filter
    if (filters.gender && filters.gender !== 'All') {
      filtered = filtered.filter(listing => listing.gender === filters.gender)
    }

    // Price range filter
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin)
      filtered = filtered.filter(listing => listing.price >= minPrice)
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax)
      filtered = filtered.filter(listing => listing.price <= maxPrice)
    }

    // Cleaned only filter
    if (filters.cleanedOnly) {
      filtered = filtered.filter(listing => listing.cleaning_status === 'cleaned')
    }

    return filtered
  }, [listings, searchQuery, filters])

  // Paginated listings
  const paginatedListings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredListings.slice(startIndex, endIndex)
  }, [filteredListings, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredListings.length / itemsPerPage)

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters])

  const handleBuyNow = (listing: Listing) => {
    console.log('handleBuyNow called - user state:', user?.email || 'not authenticated')
    if (!user) {
      console.log('User not authenticated, redirecting to login')
      sessionStorage.setItem('auth_redirect', `/listing/${listing.id}`)
      router.push(`/login?message=login_to_buy`)
      return
    }

    console.log('User authenticated, proceeding with buy now')
    // Redirect directly to coming-soon page with shoe info
    router.push(`/coming-soon?shoe=${encodeURIComponent(listing.title)}`)
  }

  const handleOfferClick = (listing: Listing) => {
    if (!user) {
      sessionStorage.setItem('auth_redirect', `/listing/${listing.id}`)
      router.push(`/login?message=login_to_make_offer`)
      return
    }
    setSelectedListing(listing)
    setIsOfferModalOpen(true)
  }

  const handleOfferSubmit = async (offerData: {
    offerPrice: number
    message: string
    buyerName: string
    buyerEmail: string
  }) => {
    if (!selectedListing || !user) return

    setIsSubmittingOffer(true)

    try {
      const { error } = await supabase
        .from('offers')
        .insert([
          {
            listing_id: selectedListing.id,
            buyer_email: user.email,
            buyer_name: offerData.buyerName,
            offer_price: offerData.offerPrice,
            message: offerData.message,
            status: 'pending'
          }
        ])

      if (error) {
        console.error('Error submitting offer:', error)
        toast.error('Failed to submit offer', 'Please try again later.')
        return
      }

      // Send email notification to seller
      if (selectedListing.seller_email) {
        try {
          const response = await fetch('/api/send-offer', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sellerEmail: selectedListing.seller_email,
              buyerName: offerData.buyerName,
              buyerEmail: user.email,
              listingTitle: `${selectedListing.brand} ${selectedListing.title}`,
              listingPrice: selectedListing.price,
              listingSize: selectedListing.size,
              offerPrice: offerData.offerPrice,
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

      toast.success('Offer sent successfully!', 'The seller will receive an email with your offer.')
      setIsOfferModalOpen(false)
      setSelectedListing(null)
    } catch (error) {
      console.error('Error submitting offer:', error)
      toast.error('Failed to submit offer', 'Please try again later.')
    } finally {
      setIsSubmittingOffer(false)
    }
  }

  const handleViewDetails = (listing: Listing) => {
    router.push(`/listing/${listing.id}`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSection message="Loading running shoes..." />
      </div>
    )
  }

  if (!isLoading && listings.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('browse.filters.noShoesFound')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('browse.filters.beFirst')}
          </p>
          <Link
            href="/sell"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('browse.filters.sellYourShoes')}
          </Link>
        </div>
      </div>
    );
  }

  // Get unique values for filters
  const uniqueBrands = Array.from(new Set(listings.map(l => l.brand))).sort()
  const uniqueCountries = Array.from(new Set(listings.map(l => l.country))).sort()
  const uniqueSizes = Array.from(new Set(listings.map(l => l.size))).sort((a, b) => a - b)

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search */}
      <div className="mb-6">
        <Search
          placeholder={t('browse.search')}
          value={searchQuery}
          onSearch={setSearchQuery}
          className="w-full"
        />
      </div>

      {/* Filters */}
      <div className="mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Size Filter */}
          <div>
            <select
              value={filters.size}
              onChange={(e) => setFilters({ ...filters, size: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('browse.filters.allSizes')}</option>
              {Array.from({ length: 20 }, (_, i) => i + 35).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Brand Filter */}
          <div>
            <select
              value={filters.brand}
              onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('browse.filters.allBrands')}</option>
              <option value="Nike">Nike</option>
              <option value="Adidas">Adidas</option>
              <option value="ASICS">ASICS</option>
              <option value="Brooks">Brooks</option>
              <option value="Hoka">Hoka</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <select
              value={filters.country}
              onChange={(e) => setFilters({ ...filters, country: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('browse.filters.allCountries')}</option>
              <option value="NL">Netherlands</option>
              <option value="BE">Belgium</option>
              <option value="DE">Germany</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('browse.filters.allGenders')}</option>
              <option value="mens">Men&apos;s</option>
              <option value="womens">Women&apos;s</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
        </div>

        {/* Price Range and Cleaned Only */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
          <div>
            <input
              type="number"
              value={filters.priceMin}
              onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })}
              placeholder={t('browse.filters.minPrice')}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <input
              type="number"
              value={filters.priceMax}
              onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })}
              placeholder={t('browse.filters.maxPrice')}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {/* Cleaned Only Filter */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="cleanedOnly"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              checked={filters.cleanedOnly}
              onChange={(e) => setFilters({ ...filters, cleanedOnly: e.target.checked })}
            />
            <label htmlFor="cleanedOnly" className="ml-2">
              <span className="text-sm text-gray-700">{t('browse.filters.onlyCleanedShoes')}</span>
            </label>
          </div>
          <div className="text-right">
            <button
              onClick={() => setFilters({
                size: '',
                brand: '',
                country: '',
                gender: '',
                cleanedOnly: false,
                priceMin: '',
                priceMax: ''
              })}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {t('browse.filters.clearAll')}
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <h2 className="text-lg">
          {filteredListings.length} {t('browse.results.shoes')}
        </h2>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <LoadingSection />
      ) : (
        <>
          {paginatedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedListings.map(listing => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  onSendOffer={handleOfferClick}
                  onViewDetails={handleViewDetails}
                  onBuyNow={handleBuyNow}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('browse.filters.noShoesFound')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('browse.filters.beFirst')}
              </p>
              <Link
                href="/sell"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t('browse.filters.sellYourShoes')}
              </Link>
            </div>
          )}

          {/* Pagination */}
          {filteredListings.length > itemsPerPage && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Offer Modal */}
      <OfferModal
        listing={selectedListing}
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false)
          setSelectedListing(null)
        }}
        onSubmit={handleOfferSubmit}
      />
    </div>
  )
}