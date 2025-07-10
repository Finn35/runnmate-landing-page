'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, getNestedTranslation } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES: Language[] = ['en', 'nl'];
const DEFAULT_LANGUAGE: Language = 'nl';

// Helper to get initial language safely
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  const savedLanguage = localStorage.getItem('language') as Language;
  return savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage) ? savedLanguage : DEFAULT_LANGUAGE;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with default language to prevent hydration mismatch
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Update language after hydration
    const initialLang = getInitialLanguage();
    if (initialLang !== language) {
      setLanguage(initialLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string) => {
    try {
      const translation = getNestedTranslation(translations[language], key);
      if (!translation) {
        console.warn(`Missing translation for key: ${key} in language: ${language}`);
        // Fallback to English if translation is missing
        const fallback = getNestedTranslation(translations['en'], key);
        return fallback || key;
      }
      return translation;
    } catch (error) {
      console.error(`Error getting translation for key: ${key}`, error);
      return key;
    }
  };

  // Listen for storage changes to sync across tabs
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage)) {
          setLanguage(savedLanguage);
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const contextValue = {
    language,
    setLanguage: handleSetLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={contextValue}>
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