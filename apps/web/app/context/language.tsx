"use client";

import {
  createContext,
  useContext,
  useEffect,
  useCallback,
  useSyncExternalStore,
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
const LOCALE_CHANGE_EVENT = "csn-intake-locale-change";

function readBrowserLocale(initialLocale: Locale): Locale {
  if (typeof window === "undefined") {
    return initialLocale;
  }

  const storedLocale = window.localStorage.getItem(LOCALE_COOKIE_NAME);
  return storedLocale
    ? resolveLocale(storedLocale)
    : resolveLocale(window.navigator.language);
}

function subscribeToLocaleChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(LOCALE_CHANGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(LOCALE_CHANGE_EVENT, onStoreChange);
  };
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: ReactNode;
  initialLocale: Locale;
}) {
  const locale = useSyncExternalStore(
    subscribeToLocaleChanges,
    () => readBrowserLocale(initialLocale),
    () => initialLocale,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; path=/; max-age=31536000; samesite=lax`;
    window.localStorage.setItem(LOCALE_COOKIE_NAME, locale);
  }, [locale]);

  const setLocale = useCallback((nextLocale: Locale) => {
    window.localStorage.setItem(LOCALE_COOKIE_NAME, nextLocale);
    window.dispatchEvent(new Event(LOCALE_CHANGE_EVENT));
  }, []);

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
