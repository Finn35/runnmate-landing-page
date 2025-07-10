// Text content for easy internationalization later
export const SITE_CONTENT = {
  // Meta
  siteTitle: "Runnmate",
  siteDescription: "Netherlands' trusted marketplace for premium second-hand running shoes. Hygiene guaranteed, mileage verified.",
  
  // Trust signals
  trustBadges: {
    hygieneCertified: "Hygiene Certified",
    mileageVerified: "Mileage Verified",
    freeShipping: "Free shipping across Netherlands"
  },
  
  // Activity banner
  activity: {
    shoesSold: "12 shoes sold in the last hour",
    newArrivals: "New arrivals daily",
    amsterdamPickup: "Amsterdam pickup available"
  },
  
  // Hero section
  hero: {
    title: "Get premium running shoes for",
    titleHighlight: "40-60% less",
    subtitle: "Hygiene guaranteed, mileage verified. From PRs to easy runs — every step verified.",
    rating: "4.9/5 Rating",
    ctaPrimary: "Browse Collection",
    ctaSecondary: "Sell Your Shoes"
  },
  
  // Product card
  product: {
    hygieneCheck: "Hygiene ✓",
    lifeRemaining: "65% Life Left",
    trailTested: "Trail tested, road approved",
    freeShippingGuarantee: "Free shipping • 30-day return guarantee",
    buyNowUrgent: "Buy Now - Only 2 left in this size!",
    condition: "Excellent",
    size: "Size:",
    mileage: "Mileage:",
    seller: "Seller:"
  },
  
  // Stats
  stats: {
    pairsSold: "Pairs Sold This Month",
    averageRating: "Average Rating",
    commissionFee: "Commission Fee",
    happyRunners: "Happy Runners"
  },
  
  // Testimonials
  testimonials: {
    title: "What Runners Say",
    sarah: {
      text: "Finally found my perfect Hokas! Amazing condition and saved €80!",
      name: "Sarah, Amsterdam"
    },
    mark: {
      text: "Hygiene guarantee gives me confidence. These shoes are like new!",
      name: "Mark, Rotterdam"
    },
    lisa: {
      text: "Sold my old Nikes in 2 days. Super easy and got great price!",
      name: "Lisa, Utrecht"
    }
  },
  
  // Features
  features: {
    hygiene: {
      title: "Hygiene Guaranteed",
      description: "Professional cleaning and UV sanitization. Every pair hygiene certified before shipping."
    },
    mileage: {
      title: "Mileage Verified", 
      description: "Expert assessment of wear patterns and remaining life. Know exactly what you're buying."
    },
    fees: {
      title: "Zero Fees",
      description: "Early runners pay nothing. Keep 100% of your sale price. No hidden costs."
    }
  },
  
  // FAQ
  faq: {
    title: "Frequently Asked Questions",
    items: [
      {
        question: "How do you guarantee hygiene?",
        answer: "Every pair goes through professional cleaning, UV sanitization, and odor elimination. We guarantee hygiene or full refund."
      },
      {
        question: "How do you verify mileage?",
        answer: "Our experts examine wear patterns, sole condition, and upper materials to accurately estimate remaining life and kilometers run."
      },
      {
        question: "What if the shoes don't fit?",
        answer: "30-day return guarantee, no questions asked. Free return shipping across Netherlands. Your satisfaction is guaranteed."
      },
      {
        question: "How fast is delivery in Netherlands?",
        answer: "Free next-day delivery across Netherlands. Amsterdam/Rotterdam pickup available same day. Track your order in real-time."
      }
    ]
  },
  
  // CTA
  cta: {
    title: "Join 10,000+ Runners Already Saving Money",
    subtitle: "Get exclusive access to the best deals and be first to see new arrivals. Premium running shoes for less.",
    emailPlaceholder: "Enter your email",
    button: "Get Early Access"
  },
  
  // Recently sold
  recentlySold: {
    title: "Recently Sold",
    items: [
      { name: "Nike Air Zoom", price: "€75", time: "2min ago" },
      { name: "Adidas Ultraboost", price: "€95", time: "5min ago" },
      { name: "Hoka Clifton", price: "€110", time: "8min ago" },
      { name: "Brooks Ghost", price: "€65", time: "12min ago" },
      { name: "ASICS Gel", price: "€80", time: "15min ago" }
    ]
  },
  
  // Footer
  footer: {
    description: "Netherlands' trusted marketplace for premium second-hand running shoes. By runners, for runners.",
    sections: {
      marketplace: {
        title: "Marketplace",
        links: ["Browse Shoes", "Sell Your Shoes", "How It Works", "Size Guide"]
      },
      support: {
        title: "Support", 
        links: ["Help Center", "Hygiene Process", "Returns & Refunds", "Track Your Order"]
      },
      company: {
        title: "Company",
        links: ["About Us", "Privacy Policy", "Terms of Service", "Blog"]
      }
    },
    copyright: "© 2024 Runnmate. All rights reserved. 🇳🇱 Made in Netherlands",
    tagline: "Built with love ❤️ by runners, for runners."
  }
};

// Regional configurations for future use
export const REGIONS = {
  NL: {
    currency: "EUR",
    language: "nl",
    shipping: "Free shipping across Netherlands",
    pickup: "Amsterdam pickup available"
  },
  FR: {
    currency: "EUR", 
    language: "fr",
    shipping: "Livraison gratuite en France",
    pickup: "Retrait Paris disponible"
  },
  EN: {
    currency: "EUR",
    language: "en", 
    shipping: "Free shipping across Europe",
    pickup: "Local pickup available"
  }
} as const; 