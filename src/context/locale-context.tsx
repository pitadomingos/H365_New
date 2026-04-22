
"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Locale } from '@/lib/i18n';
import { defaultLocale, locales } from '@/lib/i18n';

interface LocaleContextType {
  currentLocale: Locale;
  setCurrentLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [currentLocale, setCurrentLocaleState] = useState<Locale>(defaultLocale);

  // Initialize from localStorage if available
  React.useEffect(() => {
    const savedLocale = localStorage.getItem('h365-locale') as Locale;
    if (savedLocale && locales.includes(savedLocale)) {
      setCurrentLocaleState(savedLocale);
    }
  }, []);

  const setCurrentLocale = (locale: Locale) => {
    if (locales.includes(locale)) {
      setCurrentLocaleState(locale);
      localStorage.setItem('h365-locale', locale);
    }
  };

  const toggleLocale = () => {
    setCurrentLocaleState((prevLocale) => {
      const newLocale = prevLocale === 'en' ? 'pt' : 'en';
      localStorage.setItem('h365-locale', newLocale);
      return newLocale;
    });
  };

  return (
    <LocaleContext.Provider value={{ currentLocale, setCurrentLocale, toggleLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
