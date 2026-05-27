'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { translations, TranslationKey } from '@/app/lib/locales/translations';

type Language = 'en' | 'th';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('th');

  useEffect(() => {
    document.documentElement.lang = language;
    if (language === 'th') {
      document.documentElement.style.setProperty('--font-body', 'Maitree');
      document.documentElement.style.setProperty('--font-headline', 'Chonburi');
    } else {
      document.documentElement.style.setProperty('--font-body', '"IM Fell English"');
      document.documentElement.style.setProperty('--font-headline', 'MedievalSharp');
    }
  }, [language]);


  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback((key: TranslationKey, params?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = translations[language];

    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if translation is missing
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        if (fallbackResult === undefined) {
            return key; // Return the key if no translation is found at all
        }
        result = fallbackResult;
        break;
      }
    }
    
    if (typeof result === 'string' && params) {
        return Object.entries(params).reduce((acc, [paramKey, value]) => {
            return acc.replace(`{${paramKey}}`, String(value));
        }, result);
    }

    return result || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
