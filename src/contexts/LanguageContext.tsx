'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, getNestedTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load saved language from localStorage on client-side only
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && ['en', 'de', 'fr', 'it', 'es', 'nl'].includes(savedLanguage)) {
        setLanguage(savedLanguage);
      } else {
        // Set default language to Dutch if no saved language
        setLanguage('nl');
        localStorage.setItem('language', 'nl');
      }
      setIsLoaded(true);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
      // Force a small delay to ensure localStorage is written
      setTimeout(() => {
        window.dispatchEvent(new Event('storage'));
      }, 10);
    }
  };

  const t = (key: string) => {
    return getNestedTranslation(translations[language], key);
  };

  // Listen for storage changes to sync across tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && ['en', 'de', 'fr', 'it', 'es', 'nl'].includes(savedLanguage)) {
          setLanguage(savedLanguage);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  // Prevent hydration mismatch by not rendering until loaded
  if (!isLoaded) {
    return (
      <LanguageContext.Provider value={{ language: 'nl', setLanguage: handleSetLanguage, t }}>
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 