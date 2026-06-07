"use client";

import { useEffect } from "react";
import LanguageToggle from "@/app/components/LanguageToggle";
import { LanguageProvider, useLanguage } from "@/app/context/language";
import { SubmissionProvider } from "@/app/context/submission";
import { getUiCopy, type Locale } from "@/app/lib/i18n";
import IntakeForm from "./IntakeForm";

export default function IntakeExperience({
  initialLocale,
}: {
  initialLocale: Locale;
}) {
  return (
    <LanguageProvider initialLocale={initialLocale}>
      <IntakeExperienceContent />
    </LanguageProvider>
  );
}

function IntakeExperienceContent() {
  const { locale } = useLanguage();
  const copy = getUiCopy(locale);

  useEffect(() => {
    document.title = copy.metadataTitle;
  }, [copy.metadataTitle]);

  return (
    <div className="min-h-screen bg-csn-navy px-6 py-16">
      <div className="mx-auto flex w-full max-w-md flex-col">
        <div className="mb-6 flex justify-end">
          <LanguageToggle />
        </div>

        <header className="mb-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-csn-gold">
            {copy.collegeName}
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {copy.pageTitle}
          </h1>
          <p className="mt-2 text-sm text-white/40">{copy.pageSubtitle}</p>
        </header>

        <div className="bg-white text-csn-navy rounded-2xl px-10 py-12 shadow-2xl ring-1 ring-black/5">
          <SubmissionProvider locale={locale}>
            <IntakeForm locale={locale} />
          </SubmissionProvider>
        </div>

        <footer className="mt-12 text-center">
          <p className="text-xs text-white/20">{copy.footer}</p>
        </footer>
      </div>
    </div>
  );
}
