"use client";

import FormStep from "./FormStep";
import ProgressDots from "./ProgressDots";
import { useSubmission } from "@/app/context/submission";

export default function IntakeForm() {
  const {
    advance,
    canAdvance,
    current,
    done,
    error,
    form,
    isLoading,
    isSubmitting,
    setValue,
    step,
    steps,
    values,
    visible,
  } = useSubmission();

  return (
    <div className="space-y-8">
      <ProgressDots total={Math.max(steps.length, 1)} current={step} done={done} />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div
        className={`transition-all duration-260 ease-in-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1.5"
        }`}
      >
        {isLoading ? (
          <div className="py-6 text-center space-y-3">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-csn-gold" />
            <p className="text-sm text-slate-500">Loading your intake questions...</p>
          </div>
        ) : done ? (
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
                Thank you{values.name ? `, ${values.name.split(" ")[0]}` : ""}.
                We&apos;ll be in touch shortly about your English studies at CSN.
              </p>
            </div>
          </div>
        ) : !current ? (
          <div className="py-6 text-center space-y-3">
            <h3 className="text-xl font-semibold text-csn-navy">
              No intake questions available
            </h3>
            <p className="text-sm text-slate-500">
              {form?.description ?? "Please try again in a moment."}
            </p>
          </div>
        ) : (
          <FormStep
            stepNumber={step + 1}
            question={current.label}
            placeholder={current.placeholder ?? ""}
            type={current.type}
            options={current.options ?? []}
            value={values[current.fieldKey] ?? ""}
            onChange={(val) => setValue(current.fieldKey, val)}
            onNext={advance}
            isLast={step === steps.length - 1}
            isSubmitting={isSubmitting}
            canContinue={canAdvance}
            isRequired={current.isRequired}
          />
        )}
      </div>
    </div>
  );
}
