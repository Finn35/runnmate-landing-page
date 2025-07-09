'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'en' ? 'nl' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all duration-200 text-white font-medium"
      title={language === 'en' ? 'Switch to Dutch' : 'Schakel naar Engels'}
    >
      <span className="text-sm">
        {language === 'en' ? '🇳🇱' : '🇬🇧'}
      </span>
      <span className="text-sm font-semibold">
        {language === 'en' ? 'NL' : 'EN'}
      </span>
    </button>
  );
}

// For use in non-white backgrounds
export function LanguageSwitcherDark() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLanguage: Language = language === 'en' ? 'nl' : 'en';
    setLanguage(newLanguage);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:border-blue-500 transition-all duration-200 text-gray-700 hover:text-blue-600 font-medium bg-white"
      title={language === 'en' ? 'Switch to Dutch' : 'Schakel naar Engels'}
    >
      <span className="text-sm">
        {language === 'en' ? '🇳🇱' : '🇬🇧'}
      </span>
      <span className="text-sm font-semibold">
        {language === 'en' ? 'NL' : 'EN'}
      </span>
    </button>
  );
} 