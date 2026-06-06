'use client'

import { useEffect, useRef } from 'react'
import type { IntakeQuestionType } from '@/app/api/intake'

interface Props {
  stepNumber: number
  question: string
  placeholder: string
  type: IntakeQuestionType
  options: string[]
  value: string
  onChange: (value: string) => void
  onNext: () => void | Promise<void>
  isLast: boolean
  isSubmitting?: boolean
  canContinue: boolean
  isRequired: boolean
}

const fieldClassName =
  'w-full border-b-2 border-slate-200 bg-transparent pb-3 pt-1 text-lg text-csn-navy placeholder:text-slate-300 outline-none transition-colors duration-200 focus:border-csn-gold'

export default function FormStep({
  stepNumber,
  question,
  placeholder,
  type,
  options,
  value,
  onChange,
  onNext,
  isLast,
  isSubmitting = false,
  canContinue,
  isRequired,
}: Props) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null)

  useEffect(() => {
    if (type === 'boolean') {
      return
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [question, type])

  const handleEnter = () => {
    if (canContinue && !isSubmitting) {
      void onNext()
    }
  }

  const renderField = () => {
    if (type === 'boolean') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Yes', value: 'true' },
            { label: 'No', value: 'false' },
          ].map((option) => {
            const selected = value === option.value

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange(option.value)}
                className={`flex h-14 items-center justify-center rounded-2xl border text-base font-semibold transition-all duration-150 ${
                  selected
                    ? 'border-csn-gold bg-csn-gold/10 text-csn-navy shadow-[0_10px_30px_rgba(255,184,28,0.15)]'
                    : 'border-slate-200 bg-white text-slate-500 hover:border-csn-gold/50 hover:text-csn-navy'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )
    }

    if (type === 'textarea') {
      return (
        <textarea
          ref={(element) => {
            inputRef.current = element
          }}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              handleEnter()
            }
          }}
          placeholder={placeholder}
          rows={4}
          className={`${fieldClassName} min-h-32 resize-none`}
        />
      )
    }

    if (type === 'select') {
      return (
        <div className="relative">
          <select
            ref={(element) => {
              inputRef.current = element
            }}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`${fieldClassName} appearance-none pr-10`}
          >
            <option value="">{placeholder || 'Select an option'}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute right-1 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="m5 7.5 5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )
    }

    return (
      <input
        ref={(element) => {
          inputRef.current = element
        }}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            handleEnter()
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={fieldClassName}
      />
    )
  }

  return (
    <div className="space-y-7">
      <div className="space-y-1.5">
        <span className="block text-xs font-bold tracking-[0.18em] uppercase text-csn-gold">
          Question {stepNumber}
        </span>
        <h2 className="text-[1.6rem] font-semibold leading-snug text-csn-navy">
          {question}
        </h2>
        {!isRequired && (
          <p className="text-sm text-slate-400">Optional</p>
        )}
      </div>

      {renderField()}

      <button
        onClick={() => {
          void onNext()
        }}
        disabled={!canContinue || isSubmitting}
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
