'use client'

import { useEffect, useRef, useState } from 'react'
import type { IntakeQuestionType } from '@/app/api/intake'
import { getUiCopy, type DisplayOption, type Locale } from '@/app/lib/i18n'

interface Props {
  locale: Locale
  stepNumber: number
  question: string
  fieldKey: string
  placeholder: string
  type: IntakeQuestionType
  options: DisplayOption[]
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

function formatDateDisplayValue(value: string) {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (!isoMatch) {
    return value
  }

  const [, year, month, day] = isoMatch
  return `${month}/${day}/${year}`
}

function maskDateDisplayValue(value: string) {
  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  const digits = isoMatch
    ? `${isoMatch[2].padStart(2, '0')}${isoMatch[3].padStart(2, '0')}${isoMatch[1]}`
    : value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function parseDateInputValue(
  value: string,
  {
    minDate,
    maxDate,
  }: {
    minDate?: string
    maxDate?: string
  },
) {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)

  if (!match) {
    return ''
  }

  const [, month, day, year] = match
  const monthNumber = Number(month)
  const dayNumber = Number(day)
  const yearNumber = Number(year)
  const candidate = new Date(Date.UTC(yearNumber, monthNumber - 1, dayNumber))

  if (
    candidate.getUTCFullYear() !== yearNumber ||
    candidate.getUTCMonth() !== monthNumber - 1 ||
    candidate.getUTCDate() !== dayNumber
  ) {
    return ''
  }

  const isoValue = `${year}-${month}-${day}`

  if (minDate && isoValue < minDate) {
    return ''
  }

  if (maxDate && isoValue > maxDate) {
    return ''
  }

  return isoValue
}

export default function FormStep({
  locale,
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
  const isBirthDate = fieldKey === 'date_of_birth'
  const isPreferredStartDate = fieldKey === 'preferred_start_date'
  const [dateDisplayValue, setDateDisplayValue] = useState(() =>
    type === 'date' ? formatDateDisplayValue(value) : '',
  )
  const today = new Date().toISOString().split('T')[0]
  const copy = getUiCopy(locale)

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

    setDateDisplayValue(formatDateDisplayValue(value))
  }, [fieldKey, question, type])

  const handleEnter = () => {
    if (canContinue && !isSubmitting) {
      void onNext()
    }
  }

  const renderField = () => {
    if (type === 'boolean') {
      return (
        <div className="grid grid-cols-2 gap-3">
          {copy.booleanOptions.map((option) => {
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
        <div className="overflow-hidden rounded-[1.75rem] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(244,247,252,0.92)_0%,rgba(255,255,255,1)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.96)] transition-all duration-200 focus-within:border-csn-gold/70 focus-within:shadow-[0_0_0_4px_rgba(255,184,28,0.14)]">
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
            rows={5}
            className="min-h-44 w-full resize-none bg-transparent px-5 py-4 text-lg leading-8 text-csn-navy placeholder:text-slate-400 outline-none"
          />
          <div className="flex flex-col gap-1 border-t border-slate-200/80 px-5 py-3 text-xs font-medium text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>{copy.textareaSupportText}</span>
            <span className="sm:text-right">
              {value.length > 0
                ? copy.textareaCharacterCount(value.length)
                : copy.textareaEmptyHint}
            </span>
          </div>
        </div>
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
            <option value="">{placeholder || copy.selectPlaceholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
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
          type="text"
          value={dateDisplayValue}
          onChange={(event) => {
            const maskedValue = maskDateDisplayValue(event.target.value)

            setDateDisplayValue(maskedValue)
            onChange(
              parseDateInputValue(maskedValue, {
                minDate: isPreferredStartDate ? today : undefined,
                maxDate: isBirthDate ? today : undefined,
              }),
            )
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleEnter()
            }
          }}
          placeholder={placeholder || copy.datePlaceholder}
          inputMode="numeric"
          maxLength={10}
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
          {copy.questionLabel(stepNumber)}
        </span>
        <h2 className="text-[1.6rem] font-semibold leading-snug text-csn-navy">
          {question}
        </h2>
        {!isRequired && <p className="text-sm text-slate-400">{copy.optional}</p>}
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
              {copy.back}
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
            {isLast
              ? isSubmitting
                ? copy.submitting
                : copy.submit
              : copy.continue}
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
              {copy.skip}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
