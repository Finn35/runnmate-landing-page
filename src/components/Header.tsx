'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import { useLanguage } from '@/contexts/LanguageContext';
import { LanguageSwitcherDark } from './LanguageSwitcher';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();

  const navLinks = [
    { href: '/browse', text: t('nav.browse') },
    { href: '/sell', text: t('nav.sell') },
    { href: '/login', text: t('nav.login') }
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Logo size="lg" className="h-8 sm:h-10 -ml-1" />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map(({ href, text }) => (
            <Link 
              key={href}
              href={href}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              {text}
            </Link>
          ))}
          <LanguageSwitcherDark />
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center">
          <LanguageSwitcherDark />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="ml-4 p-2 -mr-2 text-gray-600"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle menu"
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-2 pb-3 space-y-1">
            {navLinks.map(({ href, text }) => (
              <Link
                key={href}
                href={href}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                onClick={() => setMobileMenuOpen(false)}
              >
                {text}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
} 