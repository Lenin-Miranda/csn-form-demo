'use client'

import { useRef, useEffect } from 'react'
import { useLanguage } from '@/app/context/language'

interface Option {
  value: string
  label: string
}

interface Props {
  stepNumber: number
  question: string
  placeholder: string
  type: string
  value: string
  onChange: (value: string) => void
  onNext: () => void | Promise<void>
  onBack: () => void
  isFirst: boolean
  isLast: boolean
  isSubmitting?: boolean
  options?: readonly Option[]
}

export default function FormStep({
  stepNumber,
  question,
  placeholder,
  type,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  isSubmitting = false,
  options,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(timer)
  }, [question])

  const { t } = useLanguage()

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-sm font-semibold" style={{ color: 'var(--accent-start)' }}>
          <span>{String(stepNumber).padStart(2, '0')}</span>
          <span className="h-px flex-1 bg-slate-400/20" />
          <span className="text-cyan-200">{t('required')}</span>
        </div>
        <h2 className="text-5xl font-extrabold leading-tight tracking-tight" style={{ color: 'var(--fg)' }}>
          {question}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-slate-300">
          {placeholder}
        </p>
      </div>

      <div>
        {options?.length ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {options.map((option) => {
              const selected = value === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onChange(option.value)}
                  className={`rounded-3xl border px-4 py-4 text-left text-sm font-semibold transition ${selected ? 'border-cyan-300 bg-cyan-400/15 text-white shadow-lg shadow-cyan-500/10' : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/40'}`}
                >
                  {option.label}
                </button>
              )
            })}
          </div>
        ) : (
          <input
            ref={inputRef}
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && value.trim() && !isSubmitting) {
                void onNext()
              }
            }}
            placeholder={placeholder}
            autoComplete="off"
            className="w-full rounded-[30px] border border-white/10 bg-white/5 px-6 py-4 text-lg text-white placeholder:text-slate-400 outline-none shadow-inner shadow-black/20 transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => {
            void onBack()
          }}
          disabled={isFirst || isSubmitting}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('back')}
        </button>

        <button
          type="button"
          onClick={() => {
            void onNext()
          }}
          disabled={!value.trim() || isSubmitting}
          className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#7dd3fc] to-[#06b6d4] text-slate-950 shadow-[0_20px_60px_rgba(14,165,233,0.18)] transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={t('continue')}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
