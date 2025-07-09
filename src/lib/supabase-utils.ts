import { supabase } from './supabase'

// Upload images to Supabase Storage
export async function uploadImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map(async (file, index) => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${index}.${fileExt}`
    const filePath = `listings/${fileName}`

    const { error } = await supabase.storage
      .from('shoe-images')
      .upload(filePath, file)

    if (error) {
      throw new Error(`Failed to upload ${file.name}: ${error.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shoe-images')
      .getPublicUrl(filePath)

    return publicUrl
  })

  return Promise.all(uploadPromises)
}

// Save listing to database
export async function createListing(listingData: {
  title: string
  brand: string
  size: number
  condition: string
  price: number
  description?: string
  imageUrls: string[]
  cleaningStatus?: string
  country: string
  city?: string
  sellerEmail?: string
}) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .insert([
        {
          title: listingData.title,
          brand: listingData.brand,
          size: listingData.size,
          condition: listingData.condition,
          price: listingData.price,
          description: listingData.description,
          image_urls: listingData.imageUrls,
          cleaning_status: listingData.cleaningStatus,
          country: listingData.country,
          city: listingData.city,
          seller_email: listingData.sellerEmail,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to create listing')
    }

    return data
  } catch (error) {
    console.error('Error creating listing:', error)
    throw error
  }
}

// Fetch all listings for browse page
export async function fetchListings(filters?: {
  size?: number
  brand?: string
  country?: string
  onlyCleaned?: boolean
}) {
  try {
    let query = supabase
      .from('listings')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.size) {
      query = query.eq('size', filters.size)
    }
    if (filters?.brand) {
      query = query.eq('brand', filters.brand)
    }
    if (filters?.country) {
      query = query.eq('country', filters.country)
    }
    if (filters?.onlyCleaned) {
      query = query.eq('cleaning_status', 'cleaned')
    }

    const { data, error } = await query

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to fetch listings')
    }

    return data || []
  } catch (error) {
    console.error('Error fetching listings:', error)
    throw error
  }
}

// Create offer for a listing
export async function createOffer(offerData: {
  listingId: string
  buyerEmail: string
  buyerName?: string
  offerPrice: number
  message?: string
}) {
  try {
    const { data, error } = await supabase
      .from('offers')
      .insert([
        {
          listing_id: offerData.listingId,
          buyer_email: offerData.buyerEmail,
          buyer_name: offerData.buyerName,
          offer_price: offerData.offerPrice,
          message: offerData.message,
        }
      ])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to create offer')
    }

    return data
  } catch (error) {
    console.error('Error creating offer:', error)
    throw error
  }
}

// Get listing details by ID
export async function fetchListingById(listingId: string) {
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('id', listingId)
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to fetch listing')
    }

    return data
  } catch (error) {
    console.error('Error fetching listing:', error)
    throw error
  }
}

// Delete images from storage (in case of rollback)
export async function deleteImages(imageUrls: string[]): Promise<void> {
  const deletePromises = imageUrls.map(async (url) => {
    // Extract file path from URL
    const filePath = url.split('/').slice(-2).join('/')
    
    const { error } = await supabase.storage
      .from('shoe-images')
      .remove([filePath])

    if (error) {
      console.error(`Failed to delete image ${url}:`, error)
    }
  })

  await Promise.all(deletePromises)
} 