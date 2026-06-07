import type { IntakeFormResponse, IntakeQuestion } from "@/app/api/intake";

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE_NAME = "csn-intake-locale";

type UiCopy = {
  metadataTitle: string;
  metadataDescription: string;
  collegeName: string;
  pageTitle: string;
  pageSubtitle: string;
  footer: string;
  toggleLabel: string;
  languageNames: Record<Locale, string>;
  questionLabel: (stepNumber: number) => string;
  optional: string;
  back: string;
  continue: string;
  submit: string;
  submitting: string;
  skip: string;
  loadingQuestions: string;
  allDoneTitle: string;
  allDoneMessage: (name?: string) => string;
  noQuestionsTitle: string;
  noQuestionsFallback: string;
  genericError: string;
  loadFormError: string;
  completeQuestionError: (label: string) => string;
  answerBeforeContinueError: (label: string) => string;
  selectPlaceholder: string;
  datePlaceholder: string;
  booleanOptions: Array<{ label: string; value: string }>;
  textareaSupportText: string;
  textareaEmptyHint: string;
  textareaCharacterCount: (count: number) => string;
};

type QuestionTranslation = {
  label: string;
  placeholder?: string | null;
  options?: Record<string, string>;
};

type FormTranslation = {
  title: string;
  description: string;
};

export type DisplayOption = {
  value: string;
  label: string;
};

const uiCopy: Record<Locale, UiCopy> = {
  en: {
    metadataTitle: "CSN English Language Intake",
    metadataDescription:
      "Student intake flow for prospective English language students at CSN.",
    collegeName: "College of Southern Nevada",
    pageTitle: "English Language Intake",
    pageSubtitle: "Let's learn about your English study goals",
    footer: "© 2026 College of Southern Nevada",
    toggleLabel: "Choose language",
    languageNames: {
      en: "English",
      es: "Spanish",
    },
    questionLabel: (stepNumber) => `Question ${stepNumber}`,
    optional: "Optional",
    back: "Back",
    continue: "Continue",
    submit: "Submit",
    submitting: "Submitting...",
    skip: "Skip",
    loadingQuestions: "Loading your intake questions...",
    allDoneTitle: "All done!",
    allDoneMessage: (name) =>
      `Thank you${name ? `, ${name}` : ""}. We'll be in touch shortly about your English studies at CSN.`,
    noQuestionsTitle: "No intake questions available",
    noQuestionsFallback: "Please try again in a moment.",
    genericError: "Something went wrong. Please try again.",
    loadFormError: "Could not load the intake form.",
    completeQuestionError: (label) => `Please complete: ${label}`,
    answerBeforeContinueError: (label) =>
      `Please answer this question before continuing: ${label}`,
    selectPlaceholder: "Select an option",
    datePlaceholder: "MM/DD/YYYY",
    booleanOptions: [
      { label: "Yes", value: "true" },
      { label: "No", value: "false" },
    ],
    textareaSupportText: "Share your goals, plans, or timeline.",
    textareaEmptyHint: "A few sentences is enough",
    textareaCharacterCount: (count) => `${count} characters`,
  },
  es: {
    metadataTitle: "Formulario de admisión de inglés | CSN",
    metadataDescription:
      "Flujo de admisión para futuros estudiantes de inglés en CSN.",
    collegeName: "College of Southern Nevada",
    pageTitle: "Formulario de admisión de inglés",
    pageSubtitle: "Queremos conocer sus metas para estudiar inglés",
    footer: "© 2026 College of Southern Nevada",
    toggleLabel: "Elegir idioma",
    languageNames: {
      en: "Inglés",
      es: "Español",
    },
    questionLabel: (stepNumber) => `Pregunta ${stepNumber}`,
    optional: "Opcional",
    back: "Atrás",
    continue: "Continuar",
    submit: "Enviar",
    submitting: "Enviando...",
    skip: "Omitir",
    loadingQuestions: "Cargando sus preguntas de admisión...",
    allDoneTitle: "Todo listo",
    allDoneMessage: (name) =>
      `Gracias${name ? `, ${name}` : ""}. Muy pronto nos pondremos en contacto sobre sus estudios de inglés en CSN.`,
    noQuestionsTitle: "No hay preguntas disponibles",
    noQuestionsFallback: "Inténtelo de nuevo en unos momentos.",
    genericError: "Algo salió mal. Inténtelo de nuevo.",
    loadFormError: "No se pudo cargar el formulario de admisión.",
    completeQuestionError: (label) => `Por favor complete: ${label}`,
    answerBeforeContinueError: (label) =>
      `Por favor responda antes de continuar: ${label}`,
    selectPlaceholder: "Seleccione una opción",
    datePlaceholder: "MM/DD/AAAA",
    booleanOptions: [
      { label: "Sí", value: "true" },
      { label: "No", value: "false" },
    ],
    textareaSupportText: "Comparta sus metas, planes o fechas importantes.",
    textareaEmptyHint: "Unas cuantas frases bastan",
    textareaCharacterCount: (count) => `${count} caracteres`,
  },
};

const formTranslations: Record<string, Record<Locale, FormTranslation>> = {
  "student-intake": {
    en: {
      title: "CSN English Language Intake",
      description:
        "Questions for students who want to study English at the College of Southern Nevada.",
    },
    es: {
      title: "Formulario de admisión de inglés de CSN",
      description:
        "Preguntas para estudiantes que desean estudiar inglés en el College of Southern Nevada.",
    },
  },
};

const questionTranslations: Record<string, Record<Locale, QuestionTranslation>> = {
  name: {
    en: {
      label: "What is your full name?",
      placeholder: "Jane Smith",
    },
    es: {
      label: "¿Cuál es su nombre completo?",
      placeholder: "Ana Pérez",
    },
  },
  email: {
    en: {
      label: "What is your email address?",
      placeholder: "jane@example.com",
    },
    es: {
      label: "¿Cuál es su correo electrónico?",
      placeholder: "ana@example.com",
    },
  },
  phone: {
    en: {
      label: "What is your phone number?",
      placeholder: "(702) 555-0000",
    },
    es: {
      label: "¿Cuál es su número de teléfono?",
      placeholder: "(702) 555-0000",
    },
  },
  date_of_birth: {
    en: {
      label: "What is your date of birth?",
      placeholder: "MM/DD/YYYY",
    },
    es: {
      label: "¿Cuál es su fecha de nacimiento?",
      placeholder: "MM/DD/AAAA",
    },
  },
  program: {
    en: {
      label: "Which English program are you most interested in?",
      placeholder: "Choose a program",
      options: {
        "Intensive English Program": "Intensive English Program",
        "Academic English Preparation": "Academic English Preparation",
        "English Conversation and Pronunciation":
          "English Conversation and Pronunciation",
      },
    },
    es: {
      label: "¿Qué programa de inglés le interesa más?",
      placeholder: "Elija un programa",
      options: {
        "Intensive English Program": "Programa intensivo de inglés",
        "Academic English Preparation": "Preparación académica de inglés",
        "English Conversation and Pronunciation":
          "Conversación y pronunciación en inglés",
      },
    },
  },
  english_level: {
    en: {
      label: "How would you describe your current English level?",
      placeholder: "Choose your level",
      options: {
        Beginner: "Beginner",
        Elementary: "Elementary",
        Intermediate: "Intermediate",
        Advanced: "Advanced",
      },
    },
    es: {
      label: "¿Cómo describiría su nivel actual de inglés?",
      placeholder: "Elija su nivel",
      options: {
        Beginner: "Principiante",
        Elementary: "Básico",
        Intermediate: "Intermedio",
        Advanced: "Avanzado",
      },
    },
  },
  has_studied_english_before: {
    en: {
      label: "Have you studied English in a classroom before?",
    },
    es: {
      label: "¿Ha estudiado inglés antes en un salón de clases?",
    },
  },
  years_studying_english: {
    en: {
      label: "About how many years have you studied English?",
      placeholder: "0",
    },
    es: {
      label: "¿Aproximadamente cuántos años ha estudiado inglés?",
      placeholder: "0",
    },
  },
  preferred_start_date: {
    en: {
      label: "When would you like to start your English classes?",
      placeholder: "MM/DD/YYYY",
    },
    es: {
      label: "¿Cuándo le gustaría comenzar sus clases de inglés?",
      placeholder: "MM/DD/AAAA",
    },
  },
  preferred_schedule: {
    en: {
      label: "What class schedule works best for you?",
      placeholder: "Choose a schedule",
      options: {
        Morning: "Morning",
        Afternoon: "Afternoon",
        Evening: "Evening",
        Weekend: "Weekend",
      },
    },
    es: {
      label: "¿Qué horario le funciona mejor?",
      placeholder: "Elija un horario",
      options: {
        Morning: "Mañana",
        Afternoon: "Tarde",
        Evening: "Noche",
        Weekend: "Fin de semana",
      },
    },
  },
  needs_help_with_visa: {
    en: {
      label:
        "Will you need help understanding visa or international student requirements?",
    },
    es: {
      label:
        "¿Necesitará ayuda para entender los requisitos de visa o de estudiante internacional?",
    },
  },
  english_goals: {
    en: {
      label: "What do you hope to achieve by studying English at CSN?",
      placeholder: "Tell us about your goals, work plans, or academic plans.",
    },
    es: {
      label: "¿Qué espera lograr al estudiar inglés en CSN?",
      placeholder:
        "Cuéntenos sobre sus metas, planes de trabajo o planes académicos.",
    },
  },
};

const localizedErrorMessages: Record<string, Record<Locale, string>> = {
  "Something went wrong. Please try again.": {
    en: "Something went wrong. Please try again.",
    es: "Algo salió mal. Inténtelo de nuevo.",
  },
  "Could not load the intake form.": {
    en: "Could not load the intake form.",
    es: "No se pudo cargar el formulario de admisión.",
  },
  "Could not load intake questions": {
    en: "Could not load intake questions",
    es: "No se pudieron cargar las preguntas de admisión.",
  },
  "Intake form not found": {
    en: "Intake form not found",
    es: "No se encontró el formulario de admisión.",
  },
  "Could not create submission": {
    en: "Could not create submission",
    es: "No se pudo enviar el formulario.",
  },
};

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "es";
}

export function resolveLocale(value: string | null | undefined): Locale {
  const normalized = value?.toLowerCase().split("-")[0];

  return isSupportedLocale(normalized) ? normalized : DEFAULT_LOCALE;
}

function tryResolveLocale(value: string | null | undefined) {
  const normalized = value?.toLowerCase().split("-")[0];

  return isSupportedLocale(normalized) ? normalized : null;
}

export function resolvePreferredLocale({
  cookieLocale,
  acceptLanguage,
}: {
  cookieLocale?: string | null;
  acceptLanguage?: string | null;
}) {
  const localeFromCookie = tryResolveLocale(cookieLocale);

  if (localeFromCookie) {
    return localeFromCookie;
  }

  const headerLocales =
    acceptLanguage
      ?.split(",")
      .map((entry) => entry.split(";")[0]?.trim())
      .filter(Boolean) ?? [];

  for (const candidate of headerLocales) {
    const locale = tryResolveLocale(candidate);

    if (locale) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function getUiCopy(locale: Locale) {
  return uiCopy[locale];
}

export function getLocalizedQuestionLabel(
  fieldKey: string,
  locale: Locale,
  fallback?: string,
) {
  return questionTranslations[fieldKey]?.[locale]?.label ?? fallback ?? fieldKey;
}

export function localizeFormContent(
  form: IntakeFormResponse | null,
  locale: Locale,
) {
  if (!form) {
    return null;
  }

  const translation = formTranslations[form.slug]?.[locale];

  return {
    title: translation?.title ?? form.title,
    description: translation?.description ?? form.description,
  };
}

export function localizeQuestion(
  question: IntakeQuestion,
  locale: Locale,
): {
  label: string;
  placeholder: string;
  options: DisplayOption[];
} {
  const translation = questionTranslations[question.fieldKey]?.[locale];
  const options =
    question.options?.map((option) => ({
      value: option,
      label: translation?.options?.[option] ?? option,
    })) ?? [];

  return {
    label: translation?.label ?? question.label,
    placeholder: translation?.placeholder ?? question.placeholder ?? "",
    options,
  };
}

export function translateErrorMessage(message: string, locale: Locale) {
  return localizedErrorMessages[message]?.[locale] ?? message;
}
