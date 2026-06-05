"use client";

import FormStep from './FormStep'
import ProgressDots from './ProgressDots'
import { OPTION_LABELS, useLanguage } from '@/app/context/language'
import { useSubmission } from '@/app/context/submission'

export default function IntakeForm() {
  const {
    advance,
    current,
    done,
    error,
    goBack,
    isSubmitting,
    setValue,
    step,
    steps,
    values,
    visible,
  } = useSubmission()
  const { language, t } = useLanguage()

  const question = current.question[language]
  const placeholder = current.placeholder[language]
  const options = 'options' in current ? current.options?.map((option) => ({
    value: option,
    label: OPTION_LABELS[language]?.[option] ?? option,
  })) : undefined

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M4 17c3-2 5-10 10-10 4.666 0 6 8 10 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M4 13c3-2 5-6 10-6 4.666 0 6 4 10 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </div>
            <div className="space-y-1">
              <div className="text-sm uppercase tracking-[0.32em] text-slate-400">{t('headerSubtitle')}</div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">{t('headerTitle')}</h1>
            </div>
          </div>
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200">
            {done ? steps.length : step + 1} / {steps.length}
          </div>
        </div>

        <ProgressDots total={steps.length} current={step} done={done} />
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-400/10 bg-red-500/10 px-4 py-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      <div
        className={`transition-all duration-[260ms] ease-in-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5'
        }`}
      >
        {done ? (
          <div className="py-6 text-center space-y-3 card-clean">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: 'var(--fg)' }}>
                {t('allDone')}
              </h3>
              <p className="mt-1 text-sm" style={{ color: 'var(--muted)' }}>
                {t('thankYou')}
              </p>
            </div>
          </div>
        ) : (
          <FormStep
            stepNumber={step + 1}
            question={question}
            placeholder={placeholder}
            type={current.type}
            value={values[current.id]}
            onChange={(val) => setValue(current.id, val)}
            onNext={advance}
            onBack={goBack}
            options={options}
            isFirst={step === 0}
            isLast={step === steps.length - 1}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}
