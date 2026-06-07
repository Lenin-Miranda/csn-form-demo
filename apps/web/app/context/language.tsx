"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALE_COOKIE_NAME,
  type Locale,
  resolveLocale,
} from "@/app/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [hasHydratedPreference, setHasHydratedPreference] = useState(false);

  useEffect(() => {
    const storedLocale = window.localStorage.getItem(LOCALE_COOKIE_NAME);
    const preferredLocale = storedLocale
      ? resolveLocale(storedLocale)
      : resolveLocale(window.navigator.language);

    setLocale((currentLocale) =>
      currentLocale === preferredLocale ? currentLocale : preferredLocale,
    );
    setHasHydratedPreference(true);
  }, []);

  useEffect(() => {
    if (!hasHydratedPreference) {
      return;
    }

    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  }, [hasHydratedPreference, locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }

  return context;
}
