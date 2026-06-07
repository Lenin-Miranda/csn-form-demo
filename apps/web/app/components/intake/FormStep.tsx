'use client'

import { useEffect, useRef, useState } from 'react'
import type { IntakeQuestionType } from '@/app/api/intake'

interface Props {
  stepNumber: number
  question: string
  fieldKey: string
  placeholder: string
  type: IntakeQuestionType
  options: string[]
  value: string
  onChange: (value: string) => void
  onBack: () => void | Promise<void>
  onNext: () => void | Promise<void>
  onSkip: () => void | Promise<void>
  isLast: boolean
  isSubmitting?: boolean
  canGoBack: boolean
  canContinue: boolean
  canSkip: boolean
  isRequired: boolean
}

const fieldClassName =
  'w-full border-b-2 border-slate-200 bg-transparent pb-3 pt-1 text-lg text-csn-navy placeholder:text-slate-300 outline-none transition-colors duration-200 focus:border-csn-gold'

export default function FormStep({
  stepNumber,
  question,
  fieldKey,
  placeholder,
  type,
  options,
  value,
  onChange,
  onBack,
  onNext,
  onSkip,
  isLast,
  isSubmitting = false,
  canGoBack,
  canContinue,
  canSkip,
  isRequired,
}: Props) {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null>(null)
  const [dateInputType, setDateInputType] = useState<'date' | 'text'>(
    type === 'date' && !value ? 'text' : 'date',
  )
  const isBirthDate = fieldKey === 'date_of_birth'
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (type === 'boolean') {
      return
    }

    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    return () => window.clearTimeout(timer)
  }, [question, type])

  useEffect(() => {
    if (type !== 'date') {
      return
    }

    setDateInputType(value ? 'date' : 'text')
  }, [type, value, question])

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

    if (type === 'date') {
      return (
        <input
          ref={(element) => {
            inputRef.current = element
          }}
          type={dateInputType}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setDateInputType('date')}
          onBlur={(event) => {
            if (!event.target.value) {
              setDateInputType('text')
            }
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleEnter()
            }
          }}
          placeholder={
            placeholder || (isBirthDate ? 'MM/DD/YYYY' : 'Select a date')
          }
          max={isBirthDate ? today : undefined}
          min={!isBirthDate && fieldKey === 'preferred_start_date' ? today : undefined}
          autoComplete={isBirthDate ? 'bday' : 'off'}
          className={fieldClassName}
        />
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
        inputMode={type === 'number' ? 'numeric' : undefined}
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

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {canGoBack && (
            <button
              type="button"
              onClick={() => {
                void onBack()
              }}
              disabled={isSubmitting}
              className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-5 text-sm font-semibold text-slate-500 transition-all duration-150 hover:border-slate-300 hover:text-csn-navy active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
                className="opacity-70"
              >
                <path
                  d="M11 7H3M6.5 10.5 3 7l3.5-3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
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

          {canSkip && (
            <button
              type="button"
              onClick={() => {
                void onSkip()
              }}
              disabled={isSubmitting}
              className="text-sm font-semibold text-slate-400 transition-colors duration-150 hover:text-csn-navy disabled:cursor-not-allowed disabled:opacity-40"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
