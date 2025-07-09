'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getCurrentUser } from '@/lib/auth'
import { sendOfferNotification } from '@/lib/email-service'
import { LoadingCard, LoadingSection } from '@/components/ui/loading'
import { Search, SHOE_SUGGESTIONS } from '@/components/ui/search'
import { useToastHelpers } from '@/components/ui/toast'
import { Pagination, PaginationInfo } from '@/components/ui/pagination'
import Logo from '@/components/Logo'
import { useLanguage } from '@/contexts/LanguageContext'

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

// Mock data for when Supabase is not available
const MOCK_LISTINGS = [
  {
    id: '1',
    title: 'Nike Air Zoom Pegasus 39',
    brand: 'Nike',
    size: 42,
    condition: 'Excellent',
    price: 85,
    country: 'Netherlands',
    city: 'Amsterdam',
    cleaning_status: 'cleaned',
    description: 'Great condition running shoes, barely used.',
    image_urls: ['https://via.placeholder.com/400x300?text=Nike+Pegasus'],
    seller_email: 'seller1@example.com',
    gender: 'Men',
    created_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Adidas Ultraboost 22',
    brand: 'Adidas',
    size: 41,
    condition: 'Good',
    price: 75,
    country: 'France',
    city: 'Paris',
    cleaning_status: 'not_cleaned',
    description: 'Comfortable shoes with some wear on the sole.',
    image_urls: ['https://via.placeholder.com/400x300?text=Adidas+Ultraboost'],
    seller_email: 'seller2@example.com',
    gender: 'Women',
    created_at: '2024-01-14T15:30:00Z'
  },
  {
    id: '3',
    title: 'Hoka Clifton 8',
    brand: 'Hoka',
    size: 44,
    condition: 'New',
    price: 120,
    country: 'Germany',
    city: 'Berlin',
    cleaning_status: 'cleaned',
    description: 'Brand new, never worn outside.',
    image_urls: ['https://via.placeholder.com/400x300?text=Hoka+Clifton'],
    seller_email: 'seller3@example.com',
    gender: 'Men',
    created_at: '2024-01-13T09:15:00Z'
  }
]

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
  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'new': return 'bg-green-100 text-green-800'
      case 'excellent': return 'bg-blue-100 text-blue-800'
      case 'good': return 'bg-yellow-100 text-yellow-800'
      case 'used': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="aspect-square relative bg-gray-100">
        <Image
          src={listing.image_urls[0] || '/placeholder-shoe.jpg'}
          alt={`${listing.title} - Size ${listing.size}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          quality={80}
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 space-y-1">
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getConditionColor(listing.condition)}`}>
            {listing.condition}
          </span>
          {listing.cleaning_status && (
            <div className="flex">
              <span className="bg-white bg-opacity-90 text-gray-800 text-xs px-2 py-1 rounded-full font-medium">
                {getCleaningIcon(listing.cleaning_status)} {listing.cleaning_status === 'cleaned' ? 'Clean' : listing.cleaning_status === 'not_cleaned' ? 'Not Cleaned' : 'Buyer Choice'}
              </span>
            </div>
          )}
        </div>

        {/* Price badge */}
        <div className="absolute top-2 right-2">
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            €{listing.price}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-lg leading-tight mb-1">
            {listing.title}
          </h3>
          <p className="text-sm text-gray-600">
            {listing.brand} • {listing.gender ? `${listing.gender}'s` : ''} Size {listing.size} • {listing.city}, {listing.country}
          </p>
        </div>

        {listing.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {listing.description}
          </p>
        )}

        {/* Seller Verification */}
        {/* Temporarily disabled 
        {listing.seller_email && (
          <div className="mb-3">
            <StravaVerificationBadge userEmail={listing.seller_email} />
          </div>
        )}
        */}

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
  const { t } = useLanguage()
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
  }, [])

  // Load listings
  useEffect(() => {
    loadListings()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const loadListings = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading listings:', error)
        toast.warning('Using demo data', 'Could not connect to database. Showing sample listings.')
        setListings(MOCK_LISTINGS)
        return
      }

      setListings(data || [])
    } catch (error) {
      console.error('Error loading listings:', error)
      toast.warning('Using demo data', 'Could not connect to database. Showing sample listings.')
      setListings(MOCK_LISTINGS)
    } finally {
      setIsLoading(false)
    }
  }

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
    if (!user) {
      sessionStorage.setItem('auth_redirect', `/listing/${listing.id}`)
      router.push(`/login?message=login_to_buy`)
      return
    }

    const confirmed = confirm(`Are you sure you want to buy ${listing.title} for €${listing.price}?`)
    if (confirmed) {
      toast.success('Purchase confirmed!', 'The seller will contact you soon.')
    }
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
        await sendOfferNotification({
          sellerEmail: selectedListing.seller_email,
          buyerName: offerData.buyerName,
          buyerEmail: user.email,
          listingTitle: `${selectedListing.brand} ${selectedListing.title}`,
          offerPrice: offerData.offerPrice,
          message: offerData.message,
          listingPrice: selectedListing.price,
          listingSize: selectedListing.size
        })
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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">{t('header.home')}</Link>
              <Link href="/sell" className="text-gray-700 hover:text-blue-600 transition-colors">{t('header.sell')}</Link>
              <Link href="/browse" className="text-blue-600 font-medium">{t('header.browse')}</Link>
            </nav>
          </div>
        </header>

        <LoadingSection message="Loading running shoes...">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            <LoadingCard count={8} />
          </div>
        </LoadingSection>
      </div>
    )
  }

  // Get unique values for filters
  const uniqueBrands = Array.from(new Set(listings.map(l => l.brand))).sort()
  const uniqueCountries = Array.from(new Set(listings.map(l => l.country))).sort()
  const uniqueSizes = Array.from(new Set(listings.map(l => l.size))).sort((a, b) => a - b)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 transition-colors">{t('header.home')}</Link>
            <Link href="/sell" className="text-gray-700 hover:text-blue-600 transition-colors">{t('header.sell')}</Link>
            <Link href="/browse" className="text-blue-600 font-medium">{t('header.browse')}</Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="max-w-2xl">
            <Search
              placeholder={t('browse.filters.searchPlaceholder')}
              onSearch={setSearchQuery}
              value={searchQuery}
              showSuggestions={true}
              suggestions={SHOE_SUGGESTIONS}
            />
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            {/* Size Filter */}
            <select
              value={filters.size}
              onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">{t('browse.filters.allSizes')}</option>
              {uniqueSizes.map(size => (
                <option key={size} value={size}>{t('browse.filters.size', { size })}</option>
              ))}
            </select>
            {/* Brand Filter */}
            <select
              value={filters.brand}
              onChange={(e) => setFilters(prev => ({ ...prev, brand: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">{t('browse.filters.allBrands')}</option>
              {uniqueBrands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {/* Country Filter */}
            <select
              value={filters.country}
              onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">{t('browse.filters.allCountries')}</option>
              {uniqueCountries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {/* Gender Filter */}
            <select
              value={filters.gender}
              onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="">{t('browse.filters.allGenders')}</option>
              <option value="Men">{t('browse.filters.mens')}</option>
              <option value="Women">{t('browse.filters.womens')}</option>
              <option value="Unisex">{t('browse.filters.unisex')}</option>
            </select>
            {/* Price Range Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder={t('browse.filters.priceMin')}
                value={filters.priceMin}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value }))}
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                min="0"
                step="5"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder={t('browse.filters.priceMax')}
                value={filters.priceMax}
                onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value }))}
                className="w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                min="0"
                step="5"
              />
            </div>
            {/* Cleaned Only Filter */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.cleanedOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, cleanedOnly: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{t('browse.filters.onlyCleanedShoes')}</span>
            </label>
            {/* Clear Filters */}
            {(searchQuery || filters.size || filters.brand || filters.country || filters.gender || filters.cleanedOnly || filters.priceMin || filters.priceMax) && (
              <button
                onClick={() => {
                  setSearchQuery('')
                  setFilters({ size: '', brand: '', country: '', gender: '', cleanedOnly: false, priceMin: '', priceMax: '' })
                  setCurrentPage(1)
                }}
                className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                {t('browse.filters.clearAll')}
              </button>
            )}
          </div>
          {/* Results count and pagination info */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {filteredListings.length} {filteredListings.length === 1 ? t('browse.filters.shoe') : t('browse.filters.shoes')} {searchQuery && `${t('browse.filters.foundFor')} "${searchQuery}"`}
            </div>
            {totalPages > 1 && (
              <PaginationInfo
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredListings.length}
                itemsPerPage={itemsPerPage}
              />
            )}
          </div>
        </div>
        {/* Listings Grid */}
        {paginatedListings.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-4">👟</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('browse.filters.noShoesFound')}</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.values(filters).some(f => typeof f === 'string' ? f !== '' : f === true)
                ? t('browse.filters.tryAdjusting')
                : t('browse.filters.beFirst')}
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('browse.filters.sellYourShoes')}
            </Link>
          </div>
        ) : (
          <>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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

             {/* Pagination */}
             {totalPages > 1 && (
               <div className="mt-8 flex flex-col items-center space-y-4">
                 <Pagination
                   currentPage={currentPage}
                   totalPages={totalPages}
                   onPageChange={setCurrentPage}
                 />
                 <PaginationInfo
                   currentPage={currentPage}
                   totalPages={totalPages}
                   totalItems={filteredListings.length}
                   itemsPerPage={itemsPerPage}
                 />
               </div>
             )}
           </>
         )}
      </main>

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