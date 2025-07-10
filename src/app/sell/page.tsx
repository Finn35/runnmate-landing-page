'use client'

import { useState, useEffect } from 'react'
// import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LoadingSpinner } from '@/components/ui/loading'
import { useToastHelpers } from '@/components/ui/toast'
// import Logo from '@/components/Logo'
import { useLanguage } from '@/contexts/LanguageContext'

export default function SellPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const toast = useToastHelpers()
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    size: '',
    condition: '',
    price: '',
    description: '',
    country: '',
    city: '',
    sellerEmail: '',
    cleaningStatus: ''
  })
  
  const [images, setImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const [uploadProgress, setUploadProgress] = useState(0)

  // Strava verification state
  const [stravaVerification, setStravaVerification] = useState<{ strava_athlete_name: string; total_distance_km: number; total_activities: number } | null>(null)
  const [isCheckingStrava, setIsCheckingStrava] = useState(false)

  // Check Strava verification when email changes
  useEffect(() => {
    if (formData.sellerEmail) {
      checkStravaVerification(formData.sellerEmail)
    } else {
      setStravaVerification(null)
    }
  }, [formData.sellerEmail])

  const checkStravaVerification = async (email: string) => {
    setIsCheckingStrava(true)
    try {
      const { data, error } = await supabase
        .from('user_strava_verifications')
        .select('total_distance_km, total_activities, strava_athlete_name, verified_at')
        .eq('user_email', email)
        .eq('is_active', true)
        .single()

      if (data && !error) {
        setStravaVerification(data)
      } else {
        setStravaVerification(null)
      }
    } catch {
      setStravaVerification(null)
    } finally {
      setIsCheckingStrava(false)
    }
  }

  const handleConnectStrava = () => {
    if (!formData.sellerEmail) {
      toast.warning('Email required', 'Please enter your email first to connect Strava.')
      return
    }
    
    // Open Strava OAuth in a new window
    const authUrl = `/api/strava/auth?user_email=${encodeURIComponent(formData.sellerEmail)}`
    const popup = window.open(authUrl, 'strava-auth', 'width=600,height=700,scrollbars=yes,resizable=yes')
    
    // Listen for popup close (user completed or cancelled auth)
    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed)
        // Recheck verification status after popup closes
        setTimeout(() => {
          checkStravaVerification(formData.sellerEmail)
        }, 1000)
      }
    }, 1000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    
    if (files.length + images.length > 3) {
      toast.warning('Too many images', 'You can upload up to 3 images maximum.')
      return
    }

    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/')
      const isValidSize = file.size <= 10 * 1024 * 1024 // 10MB

      if (!isValidType) {
        toast.error('Invalid file type', `"${file.name}" is not an image file.`)
        return false
      }

      if (!isValidSize) {
        toast.error('File too large', `"${file.name}" is larger than 10MB.`)
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setImages(prev => [...prev, ...validFiles])

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const uploadImages = async () => {
    if (images.length === 0) return []

    const imageUrls = []
    const totalImages = images.length

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `listings/${fileName}`

      const { error } = await supabase.storage
        .from('shoe-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('Error uploading image:', error)
        throw new Error(`Failed to upload image: ${file.name}`)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('shoe-images')
        .getPublicUrl(filePath)

      imageUrls.push(publicUrl)
      setUploadProgress(Math.round(((i + 1) / totalImages) * 100))
    }

    return imageUrls
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.brand || !formData.size || !formData.condition || !formData.price || !formData.sellerEmail) {
      toast.error('Missing required fields', 'Please fill in all required fields.')
      return
    }

    if (images.length === 0) {
      toast.error('Images required', 'Please upload at least one image of your shoes.')
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    try {
      // Upload images
      const imageUrls = await uploadImages()

      // Save listing to database
      const { error } = await supabase
        .from('listings')
        .insert([
          {
            title: formData.title,
            brand: formData.brand,
            size: parseFloat(formData.size),
            condition: formData.condition,
            price: parseFloat(formData.price),
            description: formData.description,
            country: formData.country,
            city: formData.city,
            seller_email: formData.sellerEmail,
            cleaning_status: formData.cleaningStatus || null,
            image_urls: imageUrls,
            created_at: new Date().toISOString()
          }
        ])

      if (error) {
        console.error('Error saving listing:', error)
        toast.error('Failed to save listing', 'Please try again later.')
        return
      }

      // Success!
      toast.success('Listing created successfully!', 'Your shoes are now available for sale.')
      
      // Reset form
      setFormData({
        title: '',
        brand: '',
        size: '',
        condition: '',
        price: '',
        description: '',
        country: '',
        city: '',
        sellerEmail: '',
        cleaningStatus: ''
      })
      setImages([])
      setImagePreview([])
      setUploadProgress(0)

      // Redirect to browse page after short delay
      setTimeout(() => {
        router.push('/browse')
      }, 2000)

    } catch (error) {
      console.error('Error submitting listing:', error)
      toast.error('Failed to create listing', 'Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('sell.title')}</h1>
          <p className="text-gray-600">{t('sell.subtitle')}</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.shoeName')} *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('sell.placeholders.shoeName')}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.brand')} *
                </label>
                <select
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">{t('sell.placeholders.selectBrand')}</option>
                  <option value="Nike">Nike</option>
                  <option value="Adidas">Adidas</option>
                  <option value="ASICS">ASICS</option>
                  <option value="Hoka">Hoka</option>
                  <option value="New Balance">New Balance</option>
                  <option value="Brooks">Brooks</option>
                  <option value="Salomon">Salomon</option>
                  <option value="Mizuno">Mizuno</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.size')} *
                </label>
                <input
                  type="number"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('sell.placeholders.size')}
                  min="35"
                  max="50"
                  step="0.5"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.condition')} *
                </label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">{t('sell.placeholders.selectCondition')}</option>
                  <option value="New">{t('sell.conditions.new')}</option>
                  <option value="Excellent">{t('sell.conditions.excellent')}</option>
                  <option value="Good">{t('sell.conditions.good')}</option>
                  <option value="Used">{t('sell.conditions.used')}</option>
                </select>
              </div>

              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.price')} *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('sell.placeholders.price')}
                  min="1"
                  step="0.01"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label htmlFor="cleaningStatus" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.cleaningStatus')}
                </label>
                <select
                  id="cleaningStatus"
                  name="cleaningStatus"
                  value={formData.cleaningStatus}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">{t('sell.cleaning.notSpecified')}</option>
                  <option value="cleaned">{t('sell.cleaning.cleaned')}</option>
                  <option value="not_cleaned">{t('sell.cleaning.notCleaned')}</option>
                  <option value="buyer_choice">{t('sell.cleaning.buyerChoice')}</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('sell.form.description')}
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('sell.placeholders.description')}
                disabled={isSubmitting}
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.country')} *
                </label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">{t('sell.placeholders.selectCountry')}</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Italy">Italy</option>
                  <option value="Spain">Spain</option>
                  <option value="Other EU">Other EU</option>
                </select>
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('sell.form.city')}
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('sell.placeholders.city')}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Contact */}
            <div>
              <label htmlFor="sellerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                {t('sell.form.sellerEmail')} *
              </label>
              <input
                type="email"
                id="sellerEmail"
                name="sellerEmail"
                value={formData.sellerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('sell.placeholders.email')}
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sell.form.images')} *
              </label>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                  disabled={isSubmitting || images.length >= 3}
                />
                
                {images.length === 0 ? (
                  <div>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          {t('sell.images.uploadButton')}
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        {t('sell.images.fileTypes')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-white bg-opacity-90 text-gray-600 rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors"
                            disabled={isSubmitting}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    {images.length < 3 && (
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <span className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                          {t('sell.images.addMore')} ({images.length}/3)
                        </span>
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Upload Progress */}
            {isSubmitting && uploadProgress > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">
                    {t('sell.images.uploading')}
                  </span>
                  <span className="text-sm text-blue-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Strava Verification (Optional) */}
            <div className="bg-gradient-to-br from-orange-50 to-blue-50 border border-orange-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-orange-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900">{t('sell.strava.title')}</h3>
                </div>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                  {t('sell.strava.optional')}
                </span>
              </div>

              <p className="text-gray-600 mb-4">
                {t('sell.strava.subtitle')}
              </p>

              {formData.sellerEmail ? (
                <div>
                  {isCheckingStrava ? (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      <span className="text-sm">{t('sell.strava.checking')}</span>
                    </div>
                  ) : stravaVerification ? (
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-green-900">✅ {t('sell.strava.verified')}</p>
                          <p className="text-sm text-green-700">
                            {stravaVerification.total_distance_km} {t('sell.strava.kmLogged')} • {stravaVerification.total_activities} {t('sell.strava.activities')}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        {t('sell.strava.badgeNote')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <div className="text-sm text-gray-600 space-y-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✓</span>
                            <span>{t('sell.strava.benefit1')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✓</span>
                            <span>{t('sell.strava.benefit2')}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600">✓</span>
                            <span>{t('sell.strava.benefit3')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleConnectStrava}
                        disabled={isSubmitting}
                        className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
                        </svg>
                        {t('sell.strava.connectButton')}
                      </button>
                      
                      <p className="text-xs text-gray-500 text-center">
                        {t('sell.strava.privacy')}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-gray-600 text-sm">
                    {t('sell.strava.enterEmail')}
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <LoadingSpinner size="sm" color="white" className="mr-2" />
                    {t('sell.form.submit')}...
                  </>
                ) : (
                  t('sell.form.submit')
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
