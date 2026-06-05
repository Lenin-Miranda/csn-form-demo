"use client";

import { AxiosError } from "axios";
import { createContext, useContext, useState, type ReactNode } from "react";
import { createSubmission } from "../api/submissions";

const STEPS = [
  {
    id: "name",
    question: "What is your full name?",
    placeholder: "Jane Smith",
    type: "text",
  },
  {
    id: "email",
    question: "What is your email address?",
    placeholder: "jane@example.com",
    type: "email",
  },
  {
    id: "phone",
    question: "What is your phone number?",
    placeholder: "(702) 555-0000",
    type: "tel",
  },
  {
    id: "program",
    question: "Which program interests you?",
    placeholder: "e.g. Computer Science, Nursing...",
    type: "text",
  },
] as const;

const INITIAL_VALUES = {
  name: "",
  email: "",
  phone: "",
  program: "",
};

type SubmissionValues = typeof INITIAL_VALUES;
type SubmissionField = keyof SubmissionValues;
type SubmissionStep = (typeof STEPS)[number];

interface SubmissionContextValue {
  steps: readonly SubmissionStep[];
  step: number;
  current: SubmissionStep;
  values: SubmissionValues;
  visible: boolean;
  done: boolean;
  isSubmitting: boolean;
  error: string | null;
  setValue: (field: SubmissionField, value: string) => void;
  advance: () => void;
  reset: () => void;
}

const SubmissionContext = createContext<SubmissionContextValue | null>(null);

function getErrorMessage(error: unknown) {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(", ");
    }

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function SubmissionProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState(INITIAL_VALUES);
  const [visible, setVisible] = useState(true);
  const [done, setDone] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = STEPS[step];

  const setValue = (field: SubmissionField, value: string) => {
    setValues((currentValues) => ({ ...currentValues, [field]: value }));
  };

  const reset = () => {
    setStep(0);
    setValues(INITIAL_VALUES);
    setVisible(true);
    setDone(false);
    setIsSubmitting(false);
    setError(null);
  };

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await createSubmission(values);
      setDone(true);
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
      setVisible(true);
    }
  };

  const advance = () => {
    setError(null);
    setVisible(false);

    window.setTimeout(() => {
      if (step === STEPS.length - 1) {
        void submit();
        return;
      }

      setStep((currentStep) => currentStep + 1);
      setVisible(true);
    }, 260);
  };

  return (
    <SubmissionContext.Provider
      value={{
        steps: STEPS,
        step,
        current,
        values,
        visible,
        done,
        isSubmitting,
        error,
        setValue,
        advance,
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
