import { NextRequest, NextResponse } from 'next/server'
import { sendOfferNotification } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const offerData = await request.json()

    // Validation
    const { sellerEmail, listingTitle, listingPrice, listingSize, offerPrice, buyerName, buyerEmail, message } = offerData
    
    if (!sellerEmail || !listingTitle || !listingPrice || !listingSize || !offerPrice || !buyerName || !buyerEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sellerEmail) || !emailRegex.test(buyerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Price validation
    if (typeof offerPrice !== 'number' || offerPrice <= 0 || typeof listingPrice !== 'number' || listingPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid price values' },
        { status: 400 }
      )
    }

    // Send the offer notification
    const success = await sendOfferNotification({
      sellerEmail,
      listingTitle,
      listingPrice,
      listingSize,
      offerPrice,
      buyerName,
      buyerEmail,
      message: message || ''
    })

    if (success) {
      return NextResponse.json(
        { message: 'Offer sent successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { error: 'Failed to send offer' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Send offer error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 