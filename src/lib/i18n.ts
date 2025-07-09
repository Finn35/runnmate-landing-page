export type Language = 'en' | 'nl';

export const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      browse: 'Browse',
      sell: 'Sell',
      login: 'Login',
      profile: 'Profile'
    },
    
    // Header messages
    header: {
      home: 'Home',
      sell: 'Sell',
      browse: 'Browse',
      tagline: 'Give your shoes a second life'
    },
    
    // Home page
    home: {
      hero: {
        title: 'Give your running shoes a second life',
        subtitle: 'Join Europe\'s most sustainable running community. Save money, save the planet — one pair of running shoes at a time.',
        browseShoes: 'Browse Shoes',
        listShoes: 'List Your Shoes'
      },
      mission: {
        title: 'Our Mission',
        secondLife: 'Every Pair Deserves a Second Life',
        qualityVerified: 'Quality Verified by Runners',
        fairPrices: 'Fair Prices For Everyone',
        communityFirst: 'Community First Approach'
      },
      strava: {
        title: 'Verify with Strava',
        subtitle: 'Connect Strava to verify your shoe mileage and build trust with fellow runners.',
        connectButton: 'Connect Strava',
        privacy: 'Private by default – you control what\'s shared.'
      },
      howItWorks: {
        title: 'How It Works',
        subtitle: 'Giving your shoes a second life is simple',
        step1: {
          title: 'Browse & Choose',
          description: 'Discover quality pre-loved running shoes from fellow runners. Filter by brand, size, and condition.'
        },
        step2: {
          title: 'Connect & Deal',
          description: 'Message the seller directly. Negotiate price, ask questions, and arrange pickup or delivery.'
        },
        step3: {
          title: 'Run Happy',
          description: 'Get your shoes and start running! You\'ve saved money and helped the planet.'
        }
      },
      featured: {
        title: 'Featured Shoes',
        subtitle: 'Quality running shoes waiting for their next adventure',
        viewAll: 'View All Shoes',
        size: 'Size',
        condition: 'condition',
        kmRun: 'km run',
        new: 'new'
      },
      features: {
        sustainableCommunity: 'Sustainable Community',
        circularRunning: 'Circular Running',
        planetFriendly: 'Planet-Friendly Choice',
        runnerToRunner: 'Runner to Runner'
      },
      
      cta: {
        title: 'Join the {sustainable} running revolution',
        subtitle: 'Be the first to discover premium pre-loved running shoes, get exclusive deals, and help build Europe\'s largest sustainable running community.',
        benefits: {
          save: 'Save up to 60%',
          reduce: 'Reduce waste',
          access: 'First access'
        },
        form: {
          placeholder: 'Enter your email address',
          joining: 'Joining...',
          joinWaitlist: 'Join Waitlist',
          success: 'Welcome to the sustainable running community!',
          notify: 'We\'ll notify you when we launch in your area.',
          privacy: 'No spam, unsubscribe anytime. We respect your privacy.',
          emailRequired: 'Please enter your email address'
        }
      }
    },
    
    // Browse page
    browse: {
      title: 'Browse Shoes',
      search: 'Search shoes, brands, or locations...',
      filters: {
        allSizes: 'All Sizes',
        allBrands: 'All Brands',
        allCountries: 'All Countries',
        allGenders: 'All Genders',
        onlyCleaned: 'Only cleaned shoes',
        clearAll: 'Clear all',
        minPrice: 'Min €',
        maxPrice: 'Max €',
        searchPlaceholder: 'Search shoes, brands, or locations...',
        onlyCleanedShoes: 'Only cleaned shoes'
      },
      results: {
        found: 'found',
        shoe: 'shoe',
        shoes: 'shoes',
        for: 'for'
      },
      actions: {
        buyNow: 'Buy Now',
        makeOffer: 'Make Offer',
        details: 'Details'
      }
    },
    
    // Sell page
    sell: {
      title: 'Sell Your Running Shoes',
      subtitle: 'List your shoes and connect with fellow runners',
      form: {
        shoeName: 'Shoe Name',
        brand: 'Brand',
        size: 'Size (EU)',
        condition: 'Condition',
        price: 'Price (€)',
        cleaningStatus: 'Cleaning Status',
        description: 'Description',
        country: 'Country',
        city: 'City',
        sellerEmail: 'Your Email',
        images: 'Images',
        required: 'Required fields',
        submit: 'List Your Shoes'
      },
      placeholders: {
        shoeName: 'e.g., Nike Air Zoom Pegasus 39',
        selectBrand: 'Select brand',
        selectCondition: 'Select condition',
        selectCountry: 'Select country',
        price: '75',
        size: '42',
        description: 'Describe the condition, usage, any defects...',
        city: 'Amsterdam (optional)',
        email: 'your.email@example.com'
      },
      strava: {
        title: 'Boost Your Listing with Strava',
        subtitle: 'Connect Strava to verify your running activity and build trust',
        notConnected: 'Strava not connected',
        connectButton: 'Connect Strava',
        benefits: 'Show buyers you\'re a verified runner with real km logged',
        verified: 'Strava Verified',
        kmLogged: 'km logged',
        checking: 'Checking verification status...',
        activities: 'activities',
        badgeNote: 'This verification badge will appear on your listing to build buyer trust',
        benefit1: 'Show verified running distance',
        benefit2: 'Build trust with buyers', 
        benefit3: 'Stand out from other listings',
        privacy: 'Your data stays private – you control what\'s shared',
        enterEmail: 'Enter your email address above to check Strava verification status',
        optional: 'Optional'
      },
      location: {
        title: 'Location & Pickup',
        subtitle: 'Where are your shoes located?',
        pickupNote: 'Local pickup can increase buyer interest'
      },
      images: {
        uploadButton: 'Upload Images',
        fileTypes: 'JPG, PNG up to 10MB each',
        addMore: 'Add More Images',
        uploading: 'Uploading images...'
      },
      conditions: {
        new: 'New - Never worn',
        excellent: 'Excellent - Like new',
        good: 'Good - Some wear',
        used: 'Used - Well worn'
      },
      cleaning: {
        notSpecified: 'Not specified',
        cleaned: '✅ Cleaned & ready',
        notCleaned: '⭕ Not cleaned',
        buyerChoice: '🤝 Buyer\'s choice'
      }
    },
    
    // Login page
    login: {
      title: 'Welcome Back',
      subtitle: 'Sign in to buy and sell running shoes',
      emailPlaceholder: 'Enter your email',
      sendLink: 'Send Magic Link',
      checkEmail: 'Check your email for the magic link!',
      checkSpam: 'Don\'t forget to check your spam folder.',
      tagline: 'Europe\'s trusted running shoe marketplace',
      emailLabel: 'Email address',
      secureLink: 'We\'ll send a secure link to your email - no password needed',
      wantToSell: 'Want to sell instead?',
      listYourShoes: 'List your shoes',
      backToHome: '← Back to home',
      errors: {
        authFailed: 'Authentication failed. Please try requesting a new magic link.',
        invalidLink: 'Invalid or expired magic link. Please request a new one.',
        expired: 'Magic link has expired. Please request a new one.',
        generic: 'Something went wrong. Please try again.',
        emailRequired: 'Please enter your email address',
        invalidEmail: 'Please enter a valid email address',
        rateLimit: 'Too many requests. Please wait a few minutes before trying again.'
      },
      messages: {
        loginToBuy: 'Please sign in to buy shoes',
        loginToMakeOffer: 'Please sign in to make an offer',
        magicLinkSent: 'Magic link sent! Check your inbox and spam folder.'
      }
    },
    
    // Coming Soon page
    comingSoon: {
      almostHad: '👟 Almost had it!',
      almostThere: 'Almost There!',
      paymentSetup: 'You tried to buy "{shoe}" - we\'re still setting up payments',
      stillSetting: 'We\'re sorry - we\'re still setting up secure payments',
      registered: '✓ Successfully Registered',
      wantedToBuy: 'You wanted to buy:',
      launching: '🚀 Launching December 2024',
      workingHard: 'We\'re working hard to bring you secure payments and instant checkout. This shoe will be available to purchase as soon as we launch!',
      sorry: '🎉 Sorry for the Wait!',
      apologyCopy: 'We know you wanted to buy this shoe today. As an apology for the inconvenience, we\'d like to offer you:',
      voucher: '€25 Decathlon Voucher',
      voucherDisclaimer: 'We do not have an official partnership with Decathlon. Vouchers are individually purchased and distributed.',
      lotteryDetails: '2 winners • Drawn at launch • Our way of saying thanks for your patience',
      lotteryConsent: 'Yes, enter me in the lottery and send me launch updates via email',
      joinLottery: 'Join Lottery',
      skipLottery: 'Just Updates'
    },
    
    // Auth callback
    auth: {
      step1: 'Authenticating...',
      step2: 'Success! Welcome to Runnmate',
      step3: 'Redirecting to your destination...',
      error: 'Authentication failed. Please try again.',
      backToLogin: 'Back to Login'
    },
    
    // Common
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit'
    },
    
    // Footer
    footer: {
      description: 'Europe\'s leading marketplace for sustainable running shoes. Join our community of eco-conscious runners who believe in giving quality shoes a second life while saving money and protecting our planet.',
      browseShoes: 'Browse Shoes',
      sellYourShoes: 'Sell Your Shoes',
      contactUs: 'Contact Us',
      privacyPolicy: 'Privacy Policy',
      termsOfService: 'Terms of Service',
      copyright: '© 2024 RunnMate. All rights reserved. Made with ❤️ for sustainable running.'
    },
    
    // Listing detail page
    listing: {
      notFound: 'Listing not found',
      notFoundDescription: 'The listing you\'re looking for doesn\'t exist or has been removed.',
      backToBrowse: '← Back to Browse',
      loading: 'Loading listing...',
      imageUnavailable: 'Image unavailable',
      sizeEU: 'Size EU',
      condition: 'Condition',
      localPickupAvailable: 'Local pickup available',
      description: 'Description',
      listed: 'Listed',
      listingId: 'Listing ID',
      buyNow: 'Buy Now',
      makeOffer: 'Make an Offer',
      
      // Conditions
      conditions: {
        new: 'New',
        excellent: 'Excellent', 
        good: 'Good',
        used: 'Used'
      },
      
      // Cleaning status
      cleaning: {
        cleaned: 'Recently Cleaned',
        notCleaned: 'Not Cleaned',
        buyerChoice: 'Buyer Choice - Cleaning'
      },
      
      // Gender
      genders: {
        mens: 'Men\'s',
        womens: 'Women\'s'
      },
      
      // Buy now confirmation
      buyConfirmation: {
        title: 'Confirm Purchase',
        message: 'Are you sure you want to buy "{title}" for €{price}?\n\nThis will connect you directly with the seller for payment and pickup/shipping details.',
        success: 'Great! We\'ll connect you with the seller.\n\n📧 We\'ll send you the seller\'s contact information via email within a few minutes.\n\n💡 Tip: Most sellers prefer bank transfer or cash on pickup.'
      },
      
      // Offer modal
      offer: {
        title: 'Make an Offer',
        yourName: 'Your Name',
        yourEmail: 'Your Email',
        yourOffer: 'Your Offer (€)',
        message: 'Message',
        defaultMessage: 'Hi! I\'m interested in your {brand} {title}. Would you consider my offer?',
        submit: 'Send Offer',
        submitting: 'Sending...',
        success: 'Offer sent successfully! The seller will receive an email with your offer.',
        error: 'Failed to submit offer. Please try again.',
        close: 'Close'
      }
    }
  },
  
  nl: {
    // Navigation
    nav: {
      home: 'Home',
      browse: 'Schoenen',
      sell: 'Verkopen',
      login: 'Inloggen',
      profile: 'Profiel'
    },
    
    // Header messages
    header: {
      home: 'Home', // or 'Startpagina' if you prefer
      sell: 'Verkopen',
      browse: 'Bladeren',
      tagline: 'Geef je schoenen een tweede leven'
    },
    
    // Home page
    home: {
      hero: {
        title: 'Geef je hardloopschoenen een tweede leven',
        subtitle: 'Word lid van Europa\'s meest duurzame hardloopgemeenschap. Bespaar geld, red de planeet — één paar hardloopschoenen tegelijk.',
        browseShoes: 'Bekijk Schoenen',
        listShoes: 'Verkoop Je Schoenen'
      },
      mission: {
        title: 'Onze Missie',
        secondLife: 'Elk Paar Verdient Een Tweede Leven',
        qualityVerified: 'Kwaliteit Geverifieerd Door Hardlopers',
        fairPrices: 'Eerlijke Prijzen Voor Iedereen',
        communityFirst: 'Gemeenschap Staat Voorop'
      },
      strava: {
        title: 'Verifieer met Strava',
        subtitle: 'Verbind Strava om je schoenkilometers te verifiëren en vertrouwen op te bouwen met mede-hardlopers.',
        connectButton: 'Verbind Strava',
        privacy: 'Standaard privé – jij bepaalt wat je deelt.'
      },
      howItWorks: {
        title: 'Hoe Het Werkt',
        subtitle: 'Je schoenen een tweede leven geven is simpel',
        step1: {
          title: 'Zoeken & Kiezen',
          description: 'Ontdek kwaliteit tweedehands hardloopschoenen van mede-hardlopers. Filter op merk, maat en conditie.'
        },
        step2: {
          title: 'Contact & Afhandelen',
          description: 'Stuur direct een bericht naar de verkoper. Onderhandel over de prijs, stel vragen en regel ophalen of bezorging.'
        },
        step3: {
          title: 'Hardloop Gelukkig',
          description: 'Ontvang je schoenen en begin met hardlopen! Je hebt geld bespaard en de planeet geholpen.'
        }
      },
      featured: {
        title: 'Uitgelichte Schoenen',
        subtitle: 'Kwaliteit hardloopschoenen die wachten op hun volgende avontuur',
        viewAll: 'Bekijk Alle Schoenen',
        size: 'Maat',
        condition: 'conditie',
        kmRun: 'km gelopen',
        new: 'nieuw'
      },
      features: {
        sustainableCommunity: 'Duurzame Gemeenschap',
        circularRunning: 'Circulair Hardlopen',
        planetFriendly: 'Milieuvriendelijke Keuze',
        runnerToRunner: 'Loper tot Loper'
      },
      
      cta: {
        title: 'Word lid van de {sustainable} hardloop revolutie',
        subtitle: 'Ontdek als eerste premium gebruikte hardloopschoenen, krijg exclusieve deals en help Europa\'s grootste duurzame hardloopgemeenschap op te bouwen.',
        benefits: {
          save: 'Bespaar tot 60%',
          reduce: 'Verminder afval',
          access: 'Eerste toegang'
        },
        form: {
          placeholder: 'Voer je emailadres in',
          joining: 'Aanmelden...',
          joinWaitlist: 'Doe Mee',
          success: 'Welkom bij de duurzame hardloopgemeenschap!',
          notify: 'We laten je weten wanneer we in jouw gebied lanceren.',
          privacy: 'Geen spam, altijd afmelden mogelijk. We respecteren je privacy.',
          emailRequired: 'Voer je emailadres in'
        }
      }
    },
    
    // Browse page
    browse: {
      title: 'Schoenen Bekijken',
      search: 'Zoek schoenen, merken of locaties...',
      filters: {
        allSizes: 'Alle Maten',
        allBrands: 'Alle Merken',
        allCountries: 'Alle Landen',
        allGenders: 'Alle Geslachten',
        onlyCleaned: 'Alleen schone schoenen',
        clearAll: 'Alles wissen',
        minPrice: 'Min €',
        maxPrice: 'Max €',
        searchPlaceholder: 'Zoek schoenen, merken of locaties...',
        onlyCleanedShoes: 'Alleen schoongemaakte schoenen'
      },
      results: {
        found: 'gevonden',
        shoe: 'schoen',
        shoes: 'schoenen',
        for: 'voor'
      },
      actions: {
        buyNow: 'Nu Kopen',
        makeOffer: 'Bod Uitbrengen',
        details: 'Details'
      }
    },
    
    // Sell page
    sell: {
      title: 'Verkoop Je Hardloopschoenen',
      subtitle: 'Zet je schoenen online en verbind met mede-hardlopers',
      form: {
        shoeName: 'Schoennaam',
        brand: 'Merk',
        size: 'Maat (EU)',
        condition: 'Conditie',
        price: 'Prijs (€)',
        cleaningStatus: 'Schoonmaakstatus',
        description: 'Beschrijving',
        country: 'Land',
        city: 'Stad',
        sellerEmail: 'Jouw Email',
        images: 'Afbeeldingen',
        required: 'Verplichte velden',
        submit: 'Zet Je Schoenen Online'
      },
      placeholders: {
        shoeName: 'bijv., Nike Air Zoom Pegasus 39',
        selectBrand: 'Selecteer merk',
        selectCondition: 'Selecteer conditie',
        selectCountry: 'Selecteer land',
        price: '75',
        size: '42',
        description: 'Beschrijf de conditie, gebruik, eventuele gebreken...',
        city: 'Amsterdam (optioneel)',
        email: 'jouw.email@voorbeeld.nl'
      },
      strava: {
        title: 'Versterk Je Advertentie met Strava',
        subtitle: 'Verbind Strava om je hardloopactiviteit te verifiëren en vertrouwen op te bouwen',
        notConnected: 'Strava niet verbonden',
        connectButton: 'Verbind Strava',
        benefits: 'Laat kopers zien dat je een geverifieerde hardloper bent met echte kilometers',
        verified: 'Strava Geverifieerd',
        kmLogged: 'km gelopen',
        checking: 'Verificatiestatus controleren...',
        activities: 'activiteiten',
        badgeNote: 'Deze verificatiebadge verschijnt op je advertentie om vertrouwen bij kopers op te bouwen',
        benefit1: 'Toon geverifieerde hardloopafstand',
        benefit2: 'Bouw vertrouwen op bij kopers',
        benefit3: 'Val op tussen andere advertenties',
        privacy: 'Je gegevens blijven privé – jij bepaalt wat je deelt',
        enterEmail: 'Voer hierboven je emailadres in om je Strava verificatiestatus te controleren',
        optional: 'Optioneel'
      },
      location: {
        title: 'Locatie & Ophalen',
        subtitle: 'Waar bevinden je schoenen zich?',
        pickupNote: 'Lokale ophaling kan interesse van kopers verhogen'
      },
      images: {
        uploadButton: 'Afbeeldingen Uploaden',
        fileTypes: 'JPG, PNG tot 10MB elk',
        addMore: 'Meer Afbeeldingen Toevoegen',
        uploading: 'Afbeeldingen uploaden...'
      },
      conditions: {
        new: 'Nieuw - Nooit gedragen',
        excellent: 'Uitstekend - Als nieuw',
        good: 'Goed - Lichte gebruikssporen',
        used: 'Gebruikt - Duidelijke gebruikssporen'
      },
      cleaning: {
        notSpecified: 'Niet gespecificeerd',
        cleaned: '✅ Schoon & klaar',
        notCleaned: '⭕ Niet schoongemaakt',
        buyerChoice: '🤝 Keuze van koper'
      }
    },
    
    // Login page
    login: {
      title: 'Welkom Terug',
      subtitle: 'Log in om hardloopschoenen te kopen en verkopen',
      emailPlaceholder: 'Voer je email in',
      sendLink: 'Verstuur Magic Link',
      checkEmail: 'Controleer je email voor de magic link!',
      checkSpam: 'Vergeet niet je spam folder te controleren.',
      tagline: 'Europa\'s vertrouwde hardloopschoen marktplaats',
      emailLabel: 'Email adres',
      secureLink: 'We sturen een veilige link naar je email - geen wachtwoord nodig',
      wantToSell: 'Wil je liever verkopen?',
      listYourShoes: 'Zet je schoenen online',
      backToHome: '← Terug naar home',
      errors: {
        authFailed: 'Authenticatie mislukt. Probeer een nieuwe magic link aan te vragen.',
        invalidLink: 'Ongeldige of verlopen magic link. Vraag een nieuwe aan.',
        expired: 'Magic link is verlopen. Vraag een nieuwe aan.',
        generic: 'Er ging iets mis. Probeer opnieuw.',
        emailRequired: 'Voer je emailadres in',
        invalidEmail: 'Voer een geldig emailadres in',
        rateLimit: 'Te veel verzoeken. Wacht een paar minuten voordat je het opnieuw probeert.'
      },
      messages: {
        loginToBuy: 'Log in om schoenen te kopen',
        loginToMakeOffer: 'Log in om een bod uit te brengen',
        magicLinkSent: 'Magic link verzonden! Controleer je inbox en spam folder.'
      }
    },
    
    // Coming Soon page
    comingSoon: {
      almostHad: '👟 Bijna gelukt!',
      almostThere: 'Bijna Klaar!',
      paymentSetup: 'Je probeerde "{shoe}" te kopen - we zijn nog bezig met het opzetten van betalingen',
      stillSetting: 'Sorry - we zijn nog bezig met het opzetten van veilige betalingen',
      registered: '✓ Succesvol Geregistreerd',
      wantedToBuy: 'Je wilde kopen:',
      launching: '🚀 Lancering December 2024',
      workingHard: 'We werken hard om je veilige betalingen en directe checkout te brengen. Deze schoen zal beschikbaar zijn om te kopen zodra we lanceren!',
      sorry: '🎉 Sorry voor het Wachten!',
      apologyCopy: 'We weten dat je deze schoen vandaag wilde kopen. Als excuus voor het ongemak willen we je dit aanbieden:',
      voucher: '€25 Decathlon Cadeaubon',
      voucherDisclaimer: 'Wij hebben geen officiële samenwerking met Decathlon. Vouchers worden individueel aangeschaft en verstrekt.',
      lotteryDetails: '2 winnaars • Getrokken bij lancering • Onze manier om bedankt te zeggen voor je geduld',
      lotteryConsent: 'Ja, doe mij mee met de loterij en stuur me updates via email',
      joinLottery: 'Doe Mee',
      skipLottery: 'Alleen Updates'
    },
    
    // Auth callback
    auth: {
      step1: 'Authenticeren...',
      step2: 'Gelukt! Welkom bij Runnmate',
      step3: 'Doorverwijzen naar je bestemming...',
      error: 'Authenticatie mislukt. Probeer opnieuw.',
      backToLogin: 'Terug naar Inloggen'
    },
    
    // Common
    common: {
      loading: 'Laden...',
      error: 'Fout',
      success: 'Gelukt',
      close: 'Sluiten',
      cancel: 'Annuleren',
      confirm: 'Bevestigen',
      save: 'Opslaan',
      delete: 'Verwijderen',
      edit: 'Bewerken'
    },
    
    // Footer
    footer: {
      description: 'Europa\'s toonaangevende marktplaats voor duurzame hardloopschoenen. Sluit je aan bij onze gemeenschap van milieubewuste hardlopers die geloven in het geven van kwaliteitsschoenen een tweede leven terwijl je geld bespaart en onze planeet beschermt.',
      browseShoes: 'Schoenen Bekijken',
      sellYourShoes: 'Verkoop Je Schoenen',
      contactUs: 'Contact Opnemen',
      privacyPolicy: 'Privacybeleid',
      termsOfService: 'Algemene Voorwaarden',
      copyright: '© 2024 RunnMate. Alle rechten voorbehouden. Gemaakt met ❤️ voor duurzaam hardlopen.'
    },
    
    // Listing detail page
    listing: {
      notFound: 'Advertentie niet gevonden',
      notFoundDescription: 'De advertentie die je zoekt bestaat niet of is verwijderd.',
      backToBrowse: '← Terug naar Overzicht',
      loading: 'Advertentie laden...',
      imageUnavailable: 'Afbeelding niet beschikbaar',
      sizeEU: 'Maat EU',
      condition: 'Conditie',
      localPickupAvailable: 'Lokale ophaling mogelijk',
      description: 'Beschrijving',
      listed: 'Geplaatst',
      listingId: 'Advertentie ID',
      buyNow: 'Nu Kopen',
      makeOffer: 'Bod Uitbrengen',
      
      // Conditions
      conditions: {
        new: 'Nieuw',
        excellent: 'Uitstekend', 
        good: 'Goed',
        used: 'Gebruikt'
      },
      
      // Cleaning status
      cleaning: {
        cleaned: 'Recent Schoongemaakt',
        notCleaned: 'Niet Schoongemaakt',
        buyerChoice: 'Keuze Koper - Schoonmaken'
      },
      
      // Gender
      genders: {
        mens: 'Heren',
        womens: 'Dames'
      },
      
      // Buy now confirmation
      buyConfirmation: {
        title: 'Aankoop Bevestigen',
        message: 'Weet je zeker dat je "{title}" wilt kopen voor €{price}?\n\nWe verbinden je direct met de verkoper voor betaling en ophaal-/verzendgegevens.',
        success: 'Geweldig! We verbinden je met de verkoper.\n\n📧 We sturen je binnen enkele minuten de contactgegevens van de verkoper.\n\n💡 Tip: De meeste verkopers geven de voorkeur aan bankoverschrijving of contant bij ophaling.'
      },
      
      // Offer modal
      offer: {
        title: 'Bod Uitbrengen',
        yourName: 'Je Naam',
        yourEmail: 'Je Email',
        yourOffer: 'Je Bod (€)',
        message: 'Bericht',
        defaultMessage: 'Hoi! Ik ben geïnteresseerd in je {brand} {title}. Zou je mijn bod overwegen?',
        submit: 'Bod Versturen',
        submitting: 'Versturen...',
        success: 'Bod succesvol verzonden! De verkoper ontvangt een email met je bod.',
        error: 'Kon bod niet versturen. Probeer opnieuw.',
        close: 'Sluiten'
      }
    }
  }
};

export type TranslationKey = keyof typeof translations.en;

export function getNestedTranslation(translations: Record<string, unknown>, key: string): string {
  const keys = key.split('.');
  let result: unknown = translations;
  
  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  return typeof result === 'string' ? result : key;
} 