"use client";

import FormStep from "./FormStep";
import ProgressDots from "./ProgressDots";
import { useSubmission } from "@/app/context/submission";
import {
  getUiCopy,
  localizeFormContent,
  localizeQuestion,
  type Locale,
} from "@/app/lib/i18n";

export default function IntakeForm({ locale }: { locale: Locale }) {
  const {
    back,
    advance,
    canGoBack,
    canAdvance,
    canSkip,
    current,
    done,
    error,
    form,
    isLoading,
    isSubmitting,
    setValue,
    skip,
    step,
    steps,
    values,
    visible,
  } = useSubmission();
  const copy = getUiCopy(locale);
  const localizedForm = localizeFormContent(form, locale);
  const localizedCurrent = current ? localizeQuestion(current, locale) : null;
  const firstName = values.name ? values.name.split(" ")[0] : undefined;

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
            <p className="text-sm text-slate-500">{copy.loadingQuestions}</p>
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
              <h3 className="text-xl font-semibold text-csn-navy">{copy.allDoneTitle}</h3>
              <p className="mt-1.5 text-sm text-slate-500">{copy.allDoneMessage(firstName)}</p>
            </div>
          </div>
        ) : !current ? (
          <div className="py-6 text-center space-y-3">
            <h3 className="text-xl font-semibold text-csn-navy">{copy.noQuestionsTitle}</h3>
            <p className="text-sm text-slate-500">
              {localizedForm?.description ?? copy.noQuestionsFallback}
            </p>
          </div>
        ) : (
          <FormStep
            key={current.questionId}
            stepNumber={step + 1}
            locale={locale}
            question={localizedCurrent?.label ?? current.label}
            fieldKey={current.fieldKey}
            placeholder={localizedCurrent?.placeholder ?? current.placeholder ?? ""}
            type={current.type}
            options={localizedCurrent?.options ?? []}
            value={values[current.fieldKey] ?? ""}
            onChange={(val) => setValue(current.fieldKey, val)}
            onBack={back}
            onNext={advance}
            onSkip={skip}
            isLast={step === steps.length - 1}
            isSubmitting={isSubmitting}
            canGoBack={canGoBack}
            canContinue={canAdvance}
            canSkip={canSkip}
            isRequired={current.isRequired}
          />
        )}
      </div>
    </div>
  );
}
