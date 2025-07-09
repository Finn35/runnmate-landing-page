// Advanced Price Intelligence Utilities
// These functions can be integrated with real Supabase data for production

export interface ListingData {
  brand: string
  condition: string
  size: number
  price: number
  created_at: string
  sold_at?: string
}

export interface PriceAnalysis {
  averagePrice: number
  medianPrice: number
  salesVelocity: number // days to sell on average
  competitorCount: number
  demandScore: number // 1-10 scale
}

// Simulate real market analysis with mock data
export async function analyzeMarketPrices(
  brand: string, 
  condition: string
): Promise<PriceAnalysis> {
  // In production, this would query your Supabase database:
  // const { data } = await supabase
  //   .from('listings')
  //   .select('*')
  //   .eq('brand', brand)
  //   .eq('condition', condition)
  //   .gte('size', size - 1)
  //   .lte('size', size + 1)
  //   .not('sold_at', 'is', null)
  //   .order('created_at', { ascending: false })
  //   .limit(50)

  // Mock analysis for demo
  const basePrices = {
    'Nike': { New: 120, Excellent: 80, Good: 50, Used: 25 },
    'Adidas': { New: 110, Excellent: 75, Good: 45, Used: 22 },
    'Hoka': { New: 140, Excellent: 95, Good: 60, Used: 30 },
    'ASICS': { New: 100, Excellent: 65, Good: 40, Used: 20 },
  }

  const brandPrices = basePrices[brand as keyof typeof basePrices] || basePrices['Nike']
  const conditionPrice = brandPrices[condition as keyof typeof brandPrices] || 50

  return {
    averagePrice: conditionPrice,
    medianPrice: conditionPrice * 0.95,
    salesVelocity: Math.random() * 14 + 3, // 3-17 days
    competitorCount: Math.floor(Math.random() * 20) + 5,
    demandScore: Math.floor(Math.random() * 6) + 5, // 5-10 for popular brands
  }
}

// Get price trend over time
export async function getPriceTrend(): Promise<{ month: string; avgPrice: number }[]> {
  // Mock 6-month trend
  const basePrice = 60
  const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan']
  
  return months.map((month, index) => ({
    month,
    avgPrice: Math.round(basePrice + (Math.random() - 0.5) * 20 + index * 2)
  }))
}

// Suggest optimal pricing strategy
export function suggestPricingStrategy(
  analysis: PriceAnalysis,
  targetSaleSpeed: 'fast' | 'balanced' | 'maximum'
): {
  recommendedPrice: number
  reasoning: string
  confidence: number
} {
  const { averagePrice, competitorCount, demandScore } = analysis

  let priceMultiplier = 1
  let reasoning = ''

  switch (targetSaleSpeed) {
    case 'fast':
      priceMultiplier = 0.85
      reasoning = 'Price 15% below average for quick sale within 1 week'
      break
    case 'balanced':
      priceMultiplier = 0.95
      reasoning = 'Price slightly below average for good balance of speed and value'
      break
    case 'maximum':
      priceMultiplier = 1.1
      reasoning = 'Price above average to maximize profit (may take longer to sell)'
      break
  }

  // Adjust based on market conditions
  if (competitorCount > 15) {
    priceMultiplier *= 0.95 // More competition = lower price
    reasoning += '. High competition detected.'
  }

  if (demandScore > 8) {
    priceMultiplier *= 1.05 // High demand = can charge more
    reasoning += '. High demand for this model.'
  }

  const confidence = Math.min(95, 60 + demandScore * 3.5)

  return {
    recommendedPrice: Math.round(averagePrice * priceMultiplier),
    reasoning,
    confidence
  }
} 