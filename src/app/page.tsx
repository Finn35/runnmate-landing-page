'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Logo from '@/components/Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/lib/supabase';

interface FeaturedListing {
  id: string;
  title: string;
  brand: string;
  size: number;
  condition: string;
  price: number;
  image_urls: string[];
  created_at: string;
}

export default function Home() {
  const { t, language } = useLanguage();
  
  // Email signup state
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Featured shoes state
  const [featuredShoes, setFeaturedShoes] = useState<FeaturedListing[]>([]);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(t('home.cta.form.emailRequired'));
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setEmail('');
      // Reset success state after 3 seconds
      setTimeout(() => setIsSuccess(false), 3000);
    }, 1000);
  };

  // Load featured shoes from database
  useEffect(() => {
    loadFeaturedShoes();
  }, []);

  const loadFeaturedShoes = async () => {
    try {
      setIsFeaturedLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, brand, size, condition, price, image_urls, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('Error loading featured shoes:', error);
        // Fall back to mock data if database fails
        setFeaturedShoes(getMockFeaturedShoes());
        return;
      }

      setFeaturedShoes(data || getMockFeaturedShoes());
    } catch (error) {
      console.error('Error loading featured shoes:', error);
      setFeaturedShoes(getMockFeaturedShoes());
    } finally {
      setIsFeaturedLoading(false);
    }
  };

  // Mock data fallback
  const getMockFeaturedShoes = (): FeaturedListing[] => [
    {
      id: 'mock-1',
      title: 'Nike Air Zoom Pegasus',
      brand: 'Nike',
      size: 42,
      condition: 'Like New',
      price: 89,
      image_urls: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-2', 
      title: 'Adidas Ultraboost 22',
      brand: 'Adidas',
      size: 40,
      condition: 'Good',
      price: 75,
      image_urls: [],
      created_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      title: 'ASICS Gel-Nimbus 24', 
      brand: 'ASICS',
      size: 44,
      condition: 'Very Good',
      price: 95,
      image_urls: [],
      created_at: new Date().toISOString()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-orange-50 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                {t('home.hero.title')}
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              {t('home.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="/browse" 
                className="bg-orange-500 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors shadow-lg w-full sm:w-auto"
              >
                {t('home.hero.browseShoes')}
              </a>
              <a 
                href="/sell" 
                className="bg-white border-2 border-blue-500 text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors w-full sm:w-auto"
              >
                {t('home.hero.listShoes')}
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-bounce">👟</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>🏃‍♂️</div>
        <div className="absolute top-40 right-20 text-3xl opacity-20 animate-pulse">♻️</div>
      </section>

      {/* Trust Banners */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌱</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">{t('home.features.sustainableCommunity')}</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">♻️</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">{t('home.features.circularRunning')}</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🌍</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">{t('home.features.planetFriendly')}</div>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🏃‍♀️</span>
              </div>
              <div className="text-sm font-semibold text-gray-800">{t('home.features.runnerToRunner')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Strava Verification Section */}
      <section className="py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {t('home.strava.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('home.strava.subtitle')}
            </p>
            
            <a 
              href="/profile"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169"/>
              </svg>
              {t('home.strava.connectButton')}
            </a>
            
            <p className="text-sm text-gray-500 mt-4">
              {t('home.strava.privacy')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('home.howItWorks.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.howItWorks.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('home.howItWorks.step1.title')}</h3>
              <p className="text-gray-600">
                {t('home.howItWorks.step1.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('home.howItWorks.step2.title')}</h3>
              <p className="text-gray-600">
                {t('home.howItWorks.step2.description')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🏃‍♂️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">{t('home.howItWorks.step3.title')}</h3>
              <p className="text-gray-600">
                {t('home.howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Shoes Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('home.featured.title')}
            </h2>
            <p className="text-xl text-gray-600">
              {t('home.featured.subtitle')}
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            {isFeaturedLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="h-48 bg-gray-200 animate-pulse"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-3/4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredShoes.map((shoe) => (
                <div key={shoe.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="h-48 bg-gray-100 flex items-center justify-center">
                    {shoe.image_urls && shoe.image_urls.length > 0 ? (
                      <img 
                        src={shoe.image_urls[0]} 
                        alt={shoe.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-6xl">👟</span>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg mb-2">{shoe.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {t('home.featured.size')} {shoe.size} • {shoe.condition} • 50{t('home.featured.kmRun')}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-orange-600">€{shoe.price}</span>
                      <span className="text-sm text-gray-500 line-through">€{Math.round(shoe.price * 1.8)} {t('home.featured.new')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="text-center">
            <a 
              href="/browse" 
              className="bg-orange-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-orange-600 transition-colors inline-block"
            >
              {t('home.featured.viewAll')}
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Email Signup Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 via-white to-orange-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-orange-500/5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Logo size="lg" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              <span 
                dangerouslySetInnerHTML={{
                  __html: t('home.cta.title').replace('{sustainable}', '<span class="text-blue-600">' + 
                    (language === 'en' ? 'sustainable' : 'duurzame') + '</span>')
                }}
              />
            </h2>
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
              {t('home.cta.subtitle')}
            </p>
            
            {/* Benefits */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-orange-500">💰</span>
                <span className="font-medium">{t('home.cta.benefits.save')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-blue-500">🌱</span>
                <span className="font-medium">{t('home.cta.benefits.reduce')}</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-sm">
                <span className="text-orange-500">⚡</span>
                <span className="font-medium">{t('home.cta.benefits.access')}</span>
              </div>
            </div>
          </div>
          
          {/* Email Form */}
          {!isSuccess ? (
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('home.cta.form.placeholder')}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('home.cta.form.joining')}</span>
                    </div>
                  ) : (
                    t('home.cta.form.joinWaitlist')
                  )}
                </button>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
              )}
            </form>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-lg">
                <span className="text-xl">✅</span>
                <span className="font-semibold">{t('home.cta.form.success')}</span>
              </div>
              <p className="text-gray-600 mt-3">{t('home.cta.form.notify')}</p>
            </div>
          )}
          
          <p className="text-xs text-gray-500 text-center mt-4">
            {t('home.cta.form.privacy')}
          </p>
        </div>
        
        {/* Floating decoration elements */}
        <div className="absolute top-10 left-10 text-2xl opacity-30 animate-float">👟</div>
        <div className="absolute bottom-10 right-10 text-2xl opacity-30 animate-float" style={{ animationDelay: '2s' }}>🌱</div>
        <div className="absolute top-20 right-20 text-xl opacity-30 animate-float" style={{ animationDelay: '1s' }}>♻️</div>
      </section>

      {/* Vision Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {t('home.mission.title')}
            </h2>
            <p className="text-xl text-gray-600">
              Join us in building Europe&apos;s most sustainable running community
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{t('home.mission.secondLife').split(' ')[0]} {t('home.mission.secondLife').split(' ')[1]}</div>
              <div className="text-gray-600">{t('home.mission.secondLife').split(' ').slice(2).join(' ')}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">{t('home.mission.qualityVerified').split(' ')[0]}</div>
              <div className="text-gray-600">{t('home.mission.qualityVerified').split(' ').slice(1).join(' ')}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{t('home.mission.fairPrices').split(' ').slice(0, 2).join(' ')}</div>
              <div className="text-gray-600">{t('home.mission.fairPrices').split(' ').slice(2).join(' ')}</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl font-bold text-orange-500 mb-2">{t('home.mission.communityFirst').split(' ')[0]}</div>
              <div className="text-gray-600">{t('home.mission.communityFirst').split(' ').slice(1).join(' ')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Logo and Description */}
            <div className="md:col-span-1">
              <div className="mb-4">
                <Logo size="lg" />
              </div>
              <p className="text-gray-400 text-sm max-w-md">
                {t('footer.description')}
              </p>
            </div>
            
            {/* Navigation Links */}
            <div className="md:col-span-2">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <ul className="space-y-3">
                    <li>
                      <a 
                        href="/browse" 
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {t('footer.browseShoes')}
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/sell" 
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {t('footer.sellYourShoes')}
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/contact" 
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {t('footer.contactUs')}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <ul className="space-y-3">
                    <li>
                      <a 
                        href={language === 'nl' ? '/privacybeleid' : '/privacy'} 
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {t('footer.privacyPolicy')}
                      </a>
                    </li>
                    <li>
                      <a 
                        href={language === 'nl' ? '/voorwaarden' : '/terms'} 
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {t('footer.termsOfService')}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

