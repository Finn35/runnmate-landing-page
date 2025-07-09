'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcherDark } from './LanguageSwitcher';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-2 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Logo size="lg" className="h-8 sm:h-10" />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <a 
            href="/browse"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            {t('nav.browse')}
          </a>
          <a 
            href="/sell"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            {t('nav.sell')}
          </a>
          <LanguageSwitcherDark />
          <a 
            href="/login"
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
          >
            {t('nav.login')}
          </a>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            className="text-gray-600 hover:text-gray-900 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-2 space-y-2">
            <a 
              href="/browse"
              className="block py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              {t('nav.browse')}
            </a>
            <a 
              href="/sell"
              className="block py-2 text-gray-600 hover:text-gray-900 font-medium"
            >
              {t('nav.sell')}
            </a>
            <div className="py-2">
              <LanguageSwitcherDark />
            </div>
            <a 
              href="/login"
              className="block bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors text-center font-medium"
            >
              {t('nav.login')}
            </a>
          </div>
        </div>
      )}
    </header>
  );
} 