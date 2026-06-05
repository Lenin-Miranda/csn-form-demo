'use client'

import { useRef, useEffect } from 'react'

interface Props {
  stepNumber: number
  question: string
  placeholder: string
  type: string
  value: string
  onChange: (value: string) => void
  onNext: () => void | Promise<void>
  isLast: boolean
  isSubmitting?: boolean
}

export default function FormStep({
  stepNumber,
  question,
  placeholder,
  type,
  value,
  onChange,
  onNext,
  isLast,
  isSubmitting = false,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(timer)
  }, [question])

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <span className="block text-xs font-bold tracking-[0.18em] uppercase text-csn-gold">
          Question {stepNumber}
        </span>
        <h2 className="text-[1.6rem] font-semibold leading-snug text-csn-navy">
          {question}
        </h2>
      </div>

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
        className="w-full border-b-2 border-slate-200 bg-transparent pb-3 pt-1 text-lg text-csn-navy placeholder:text-slate-300 outline-none focus:border-csn-gold transition-colors duration-200"
      />

      <button
        onClick={() => {
          void onNext()
        }}
        disabled={!value.trim() || isSubmitting}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-csn-gold px-7 text-sm font-bold text-csn-navy transition-all duration-150 hover:bg-csn-gold-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {isLast ? (isSubmitting ? 'Submitting...' : 'Submit') : 'Continue'}
        {!isLast && (
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="opacity-60"
          >
            <path
              d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </div>
  )
}
