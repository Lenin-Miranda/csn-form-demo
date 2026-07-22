"use client";

import { AxiosError } from "axios";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { fetchIntake, type IntakeFormResponse, type IntakeQuestion } from "../api/intake";
import { createSubmission } from "../api/submissions";
import {
  getLocalizedQuestionLabel,
  getUiCopy,
  localizeQuestion,
  translateErrorMessage,
  type Locale,
} from "@/app/lib/i18n";

const REQUIRED_SUBMISSION_FIELDS = ["name", "email", "phone", "program"] as const;

type SubmissionValues = Record<string, string>;

interface SubmissionContextValue {
  form: IntakeFormResponse | null;
  steps: IntakeQuestion[];
  step: number;
  current: IntakeQuestion | null;
  values: SubmissionValues;
  visible: boolean;
  done: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  canGoBack: boolean;
  canAdvance: boolean;
  canSkip: boolean;
  setValue: (field: string, value: string) => void;
  back: () => void;
  advance: () => void;
  skip: () => void;
  reset: () => void;
}

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

function getErrorMessage(error: unknown, locale: Locale) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message
        .map((entry) =>
          typeof entry === "string" ? translateErrorMessage(entry, locale) : String(entry),
        )
        .join(", ");
    }

    if (typeof message === "string") {
      return translateErrorMessage(message, locale);
    }
  }

  if (error instanceof Error) {
    return translateErrorMessage(error.message, locale);
  }

  return getUiCopy(locale).genericError;
}

function buildInitialValues(questions: IntakeQuestion[]) {
  return questions.reduce<SubmissionValues>((accumulator, question) => {
    accumulator[question.fieldKey] = "";
    return accumulator;
  }, {});
}

function hasAnswerValue(question: IntakeQuestion | null, value: string) {
  if (!question) {
    return false;
  }

  if (question.type === "boolean") {
    return value === "true" || value === "false";
  }

  return value.trim().length > 0;
}

export function SubmissionProvider({
  children,
  locale,
}: {
  children: ReactNode;
  locale: Locale;
}) {
  const [form, setForm] = useState<IntakeFormResponse | null>(null);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<SubmissionValues>({});
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy = getUiCopy(locale);
  const localeRef = useRef(locale);

  const steps = form?.questions ?? [];
  const current = steps[step] ?? null;
  const canGoBack = step > 0;
  const canAdvance = hasAnswerValue(current, current ? values[current.fieldKey] ?? "" : "");
  const canSkip = Boolean(current && !current.isRequired);

  useEffect(() => {
    localeRef.current = locale;
  }, [locale]);

  useEffect(() => {
    let isMounted = true;

    async function loadForm() {
      setIsLoading(true);
      setError(null);

      try {
        const intakeForm = await fetchIntake();

        if (!isMounted) {
          return;
        }

        setForm(intakeForm);
        setValues(buildInitialValues(intakeForm.questions));
        setStep(0);
        setDone(false);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setError(getErrorMessage(loadError, localeRef.current));
      } finally {
        if (isMounted) {
          setIsLoading(false);
          setVisible(true);
        }
      }
    }

    void loadForm();

    return () => {
      isMounted = false;
    };
  }, []);

  const setValue = (field: string, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  };

  const reset = () => {
    setStep(0);
    setValues(buildInitialValues(steps));
    setVisible(true);
    setDone(false);
    setIsSubmitting(false);
    setError(null);
  };

  const submit = async () => {
    if (!form) {
      setError(copy.loadFormError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      for (const field of REQUIRED_SUBMISSION_FIELDS) {
        if (!values[field]?.trim()) {
          throw new Error(
            copy.completeQuestionError(getLocalizedQuestionLabel(field, locale, field)),
          );
        }
      }

      await createSubmission({
        formSlug: form.slug,
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        program: values.program.trim(),
        locale,
        answers: steps.map((question) => ({
          questionId: question.questionId,
          value: (values[question.fieldKey] ?? "").trim(),
        })),
      });

      setDone(true);
    } catch (submitError) {
      setError(getErrorMessage(submitError, locale));
    } finally {
      setIsSubmitting(false);
      setVisible(true);
    }
  };

  const moveForward = () => {
    setVisible(false);

    window.setTimeout(() => {
      if (step === steps.length - 1) {
        void submit();
        return;
      }

      setStep((currentStep) => currentStep + 1);
      setVisible(true);
    }, 260);
  };

  const advance = () => {
    if (!current || isLoading || isSubmitting) {
      return;
    }

    if (!canAdvance) {
      setError(copy.answerBeforeContinueError(localizeQuestion(current, locale).label));
      return;
    }

    setError(null);
    moveForward();
  };

  const back = () => {
    if (!canGoBack || isLoading || isSubmitting) {
      return;
    }

    setError(null);
    setVisible(false);

    window.setTimeout(() => {
      setStep((currentStep) => Math.max(0, currentStep - 1));
      setVisible(true);
    }, 260);
  };

  const skip = () => {
    if (!current || current.isRequired || isLoading || isSubmitting) {
      return;
    }

    setValues((currentValues) => ({
      ...currentValues,
      [current.fieldKey]: "",
    }));
    setError(null);
    moveForward();
  };

  return (
    <SubmissionContext.Provider
      value={{
        form,
        steps,
        step,
        current,
        values,
        visible,
        done,
        isLoading,
        isSubmitting,
        error,
        canGoBack,
        canAdvance,
        canSkip,
        setValue,
        back,
        advance,
        skip,
        reset,
      }}
    >
      {children}
    </SubmissionContext.Provider>
  );
}

export function useSubmission() {
  const context = useContext(SubmissionContext);

  if (!context) {
    throw new Error("useSubmission must be used within a SubmissionProvider");
  }

  return context;
}
