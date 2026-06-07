"use client";

import { useLanguage } from "@/app/context/language";
import { LOCALES, getUiCopy } from "@/app/lib/i18n";

export default function LanguageToggle() {
  const { locale, setLocale } = useLanguage();
  const copy = getUiCopy(locale);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 text-white shadow-[0_12px_32px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <span className="sr-only">{copy.toggleLabel}</span>
      {LOCALES.map((option) => {
        const isActive = option === locale;

        return (
          <button
            key={option}
            type="button"
            onClick={() => setLocale(option)}
            aria-pressed={isActive}
            title={copy.languageNames[option]}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.18em] uppercase transition-all duration-150 ${
              isActive
                ? "bg-csn-gold text-csn-navy shadow-[0_8px_20px_rgba(255,184,28,0.28)]"
                : "text-white/74 hover:text-white"
            }`}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
