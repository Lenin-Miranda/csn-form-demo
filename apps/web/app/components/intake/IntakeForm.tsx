'use client'

import { useState } from 'react'
import FormStep from './FormStep'
import ProgressDots from './ProgressDots'

const STEPS = [
  {
    id: 'name',
    question: 'What is your full name?',
    placeholder: 'Jane Smith',
    type: 'text',
  },
  {
    id: 'email',
    question: 'What is your email address?',
    placeholder: 'jane@example.com',
    type: 'email',
  },
  {
    id: 'phone',
    question: 'What is your phone number?',
    placeholder: '(702) 555-0000',
    type: 'tel',
  },
  {
    id: 'program',
    question: 'Which program interests you?',
    placeholder: 'e.g. Computer Science, Nursing...',
    type: 'text',
  },
] as const

export default function IntakeForm() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [visible, setVisible] = useState(true)
  const [done, setDone] = useState(false)

  const advance = () => {
    setVisible(false)
    setTimeout(() => {
      if (step === STEPS.length - 1) {
        setDone(true)
      } else {
        setStep(s => s + 1)
      }
      setVisible(true)
    }, 260)
  }

  const current = STEPS[step]

  return (
    <div className="space-y-8">
      <ProgressDots total={STEPS.length} current={step} done={done} />

      <div
        className={`transition-all duration-[260ms] ease-in-out ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1.5'
        }`}
      >
        {done ? (
          <div className="py-6 text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-csn-gold/10 ring-1 ring-csn-gold/25">
              <svg
                className="h-6 w-6 text-csn-gold"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-csn-navy">All done!</h3>
              <p className="mt-1.5 text-sm text-slate-500">
                Thank you{values.name ? `, ${values.name.split(' ')[0]}` : ''}. We&apos;ll be in touch shortly.
              </p>
            </div>
          </div>
        ) : (
          <FormStep
            stepNumber={step + 1}
            question={current.question}
            placeholder={current.placeholder}
            type={current.type}
            value={values[current.id] ?? ''}
            onChange={val => setValues(v => ({ ...v, [current.id]: val }))}
            onNext={advance}
            isLast={step === STEPS.length - 1}
          />
        )}
      </div>
    </div>
  )
}
