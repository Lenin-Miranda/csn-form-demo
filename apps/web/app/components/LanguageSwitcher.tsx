'use client'

import { LANGUAGES, useLanguage } from '@/app/context/language'

export default function LanguageSwitcher() {
    const { language, setLanguage, t } = useLanguage()

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <div className="text-xs uppercase tracking-[0.32em] text-slate-400">{t('language')}</div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 p-1 shadow-inner shadow-black/10">
                {LANGUAGES.map((lang) => {
                    const selected = lang === language
                    return (
                        <button
                            key={lang}
                            type="button"
                            onClick={() => setLanguage(lang)}
                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selected ? 'bg-cyan-400/20 text-white shadow-lg shadow-cyan-500/20' : 'text-slate-300 hover:bg-white/10'}`}
                        >
                            {lang}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
