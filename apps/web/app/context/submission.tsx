"use client";

import { AxiosError } from "axios";
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { createSubmission } from "../api/submissions";
import { type Language } from "./language";

type LocalizedText = Record<Language, string>

const OPTION_LABELS: Record<Language, Record<string, string>> = {
  English: {
    Yes: "Yes",
    No: "No",
    Morning: "Morning",
    Afternoon: "Afternoon",
    Flexible: "Flexible",
    Referral: "Referral",
    "Social media": "Social media",
    Flyer: "Flyer",
    Other: "Other",
    ESL: "ESL",
    HSE: "HSE",
    "Career Pathways": "Career Pathways",
    Basic: "Basic",
    Intermediate: "Intermediate",
    Advanced: "Advanced",
    Listening: "Listening",
    Reading: "Reading",
    Writing: "Writing",
    Speaking: "Speaking",
    "Vocational English": "Vocational English",
    Math: "Math",
    Grammar: "Grammar",
    "Social Studies": "Social Studies",
    Science: "Science",
    Healthcare: "Healthcare",
    Manufacturing: "Manufacturing",
    Cybersecurity: "Cybersecurity",
    "Information Technology": "Information Technology",
  },
  Español: {
    Yes: "Sí",
    No: "No",
    Morning: "Mañana",
    Afternoon: "Tarde",
    Flexible: "Flexible",
    Referral: "Referencia",
    "Social media": "Redes sociales",
    Flyer: "Volante",
    Other: "Otro",
    ESL: "ESL",
    HSE: "HSE",
    "Career Pathways": "Career Pathways",
    Basic: "Básico",
    Intermediate: "Intermedio",
    Advanced: "Avanzado",
    Listening: "Escucha",
    Reading: "Lectura",
    Writing: "Escritura",
    Speaking: "Conversación",
    "Vocational English": "Inglés vocacional",
    Math: "Matemáticas",
    Grammar: "Gramática",
    "Social Studies": "Estudios Sociales",
    Science: "Ciencias",
    Healthcare: "Salud",
    Manufacturing: "Manufactura",
    Cybersecurity: "Ciberseguridad",
    "Information Technology": "Tecnología de la información",
  },
  Français: {
    Yes: "Oui",
    No: "Non",
    Morning: "Matin",
    Afternoon: "Après-midi",
    Flexible: "Flexible",
    Referral: "Référence",
    "Social media": "Réseaux sociaux",
    Flyer: "Prospectus",
    Other: "Autre",
    ESL: "ESL",
    HSE: "HSE",
    "Career Pathways": "Career Pathways",
    Basic: "Débutant",
    Intermediate: "Intermédiaire",
    Advanced: "Avancé",
    Listening: "Écoute",
    Reading: "Lecture",
    Writing: "Écriture",
    Speaking: "Expression orale",
    "Vocational English": "Anglais professionnel",
    Math: "Mathématiques",
    Grammar: "Grammaire",
    "Social Studies": "Sciences sociales",
    Science: "Sciences",
    Healthcare: "Santé",
    Manufacturing: "Fabrication",
    Cybersecurity: "Cybersécurité",
    "Information Technology": "Technologies de l'information",
  },
}

const BASE_STEPS = [
  {
    id: "name",
    question: {
      English: "What is your full name?",
      Español: "¿Cuál es tu nombre completo?",
      Français: "Quel est votre nom complet?",
    },
    placeholder: {
      English: "Jane Smith",
      Español: "Juan Pérez",
      Français: "Jean Dupont",
    },
    type: "text",
  },
  {
    id: "email",
    question: {
      English: "What is your email address?",
      Español: "¿Cuál es tu correo electrónico?",
      Français: "Quel est votre adresse e-mail?",
    },
    placeholder: {
      English: "jane@example.com",
      Español: "juan@ejemplo.com",
      Français: "jean@exemple.com",
    },
    type: "email",
  },
  {
    id: "phone",
    question: {
      English: "What is your phone number?",
      Español: "¿Cuál es tu número de teléfono?",
      Français: "Quel est votre numéro de téléphone?",
    },
    placeholder: {
      English: "(702) 555-0000",
      Español: "(702) 555-0000",
      Français: "(702) 555-0000",
    },
    type: "tel",
  },
  {
    id: "availability",
    question: {
      English: "What is your availability?",
      Español: "¿Cuál es tu disponibilidad?",
      Français: "Quelle est votre disponibilité?",
    },
    placeholder: {
      English: "Morning / Afternoon / Flexible",
      Español: "Mañana / Tarde / Flexible",
      Français: "Matin / Après-midi / Flexible",
    },
    type: "text",
    options: ["Morning", "Afternoon", "Flexible"] as const,
  },
  {
    id: "program",
    question: {
      English: "What program are you interested in?",
      Español: "¿En qué programa estás interesado?",
      Français: "Quel programme vous intéresse?",
    },
    placeholder: {
      English: "ESL / HSE / Career Pathways",
      Español: "ESL / HSE / Career Pathways",
      Français: "ESL / HSE / Career Pathways",
    },
    type: "text",
    options: ["ESL", "HSE", "Career Pathways"] as const,
  },
  {
    id: "location",
    question: {
      English: "What is your preferred location?",
      Español: "¿Cuál es tu ubicación preferida?",
      Français: "Quel est votre lieu préféré?",
    },
    placeholder: {
      English: "Enter city or campus",
      Español: "Ingresa ciudad o campus",
      Français: "Entrez la ville ou le campus",
    },
    type: "text",
  },
  {
    id: "csnBefore",
    question: {
      English: "Have you been a CSN student before?",
      Español: "¿Has sido estudiante de CSN antes?",
      Français: "Avez-vous déjà été étudiant de CSN?",
    },
    placeholder: {
      English: "Yes / No",
      Español: "Sí / No",
      Français: "Oui / Non",
    },
    type: "text",
    options: ["Yes", "No"] as const,
  },
  {
    id: "gedHiset",
    question: {
      English: "Do you have a GED or HiSET?",
      Español: "¿Tienes un GED o HiSET?",
      Français: "Avez-vous un GED ou un HiSET?",
    },
    placeholder: {
      English: "Yes / No",
      Español: "Sí / No",
      Français: "Oui / Non",
    },
    type: "text",
    options: ["Yes", "No"] as const,
  },
  {
    id: "heardAbout",
    question: {
      English: "How did you hear about us?",
      Español: "¿Cómo te enteraste de nosotros?",
      Français: "Comment avez-vous entendu parler de nous?",
    },
    placeholder: {
      English: "Referral / Social media / Flyer / Other",
      Español: "Referencia / Redes sociales / Volante / Otro",
      Français: "Référence / Réseaux sociaux / Prospectus / Autre",
    },
    type: "text",
    options: ["Referral", "Social media", "Flyer", "Other"] as const,
  },
  {
    id: "transportation",
    question: {
      English: "Do you have your own transportation?",
      Español: "¿Tienes tu propio transporte?",
      Français: "Avez-vous votre propre transport?",
    },
    placeholder: {
      English: "Yes / No",
      Español: "Sí / No",
      Français: "Oui / Non",
    },
    type: "text",
    options: ["Yes", "No"] as const,
  },
] as const;

const PROFILE_STEPS = {
  ESL: [
    {
      id: "level",
      question: {
        English: "What level do you consider yourself to be at?",
        Español: "¿En qué nivel te consideras?",
        Français: "À quel niveau vous situez-vous?",
      },
      placeholder: {
        English: "Basic / Intermediate / Advanced",
        Español: "Básico / Intermedio / Avanzado",
        Français: "Débutant / Intermédiaire / Avancé",
      },
      type: "text",
      options: ["Basic", "Intermediate", "Advanced"] as const,
    },
    {
      id: "improve",
      question: {
        English: "What would you like to improve?",
        Español: "¿Qué te gustaría mejorar?",
        Français: "Que souhaitez-vous améliorer?",
      },
      placeholder: {
        English: "Listening / Reading / Writing / Speaking / Vocational English",
        Español: "Escucha / Lectura / Escritura / Conversación / Inglés vocacional",
        Français: "Écoute / Lecture / Écriture / Expression orale / Anglais professionnel",
      },
      type: "text",
      options: ["Listening", "Reading", "Writing", "Speaking", "Vocational English"] as const,
    },
  ],
  HSE: [
    {
      id: "studiedBefore",
      question: {
        English: "Have you studied with us before?",
        Español: "¿Has estudiado con nosotros antes?",
        Français: "Avez-vous déjà étudié avec nous?",
      },
      placeholder: {
        English: "Yes / No",
        Español: "Sí / No",
        Français: "Oui / Non",
      },
      type: "text",
      options: ["Yes", "No"] as const,
    },
    {
      id: "passedSubjects",
      question: {
        English: "What subjects have you already passed?",
        Español: "¿Qué materias ya aprobaste?",
        Français: "Quelles matières avez-vous déjà réussies?",
      },
      placeholder: {
        English: "Math / Grammar / Social Studies / Science",
        Español: "Matemáticas / Gramática / Estudios Sociales / Ciencias",
        Français: "Mathématiques / Grammaire / Sciences sociales / Sciences",
      },
      type: "text",
    },
    {
      id: "supportSubject",
      question: {
        English: "What subject do you need the most support with?",
        Español: "¿En qué materia necesitas más apoyo?",
        Français: "Dans quelle matière avez-vous le plus besoin de soutien?",
      },
      placeholder: {
        English: "Math / Grammar / Social Studies / Science",
        Español: "Matemáticas / Gramática / Estudios Sociales / Ciencias",
        Français: "Mathématiques / Grammaire / Sciences sociales / Sciences",
      },
      type: "text",
      options: ["Math", "Grammar", "Social Studies", "Science"] as const,
    },
  ],
  "Career Pathways": [
    {
      id: "area",
      question: {
        English: "What area are you interested in?",
        Español: "¿En qué área estás interesado?",
        Français: "Quel domaine vous intéresse?",
      },
      placeholder: {
        English: "Healthcare / Manufacturing / Cybersecurity / Information Technology",
        Español: "Salud / Manufactura / Ciberseguridad / Tecnología de la información",
        Français: "Santé / Fabrication / Cybersécurité / Technologies de l'information",
      },
      type: "text",
      options: ["Healthcare", "Manufacturing", "Cybersecurity", "Information Technology"] as const,
    },
    {
      id: "priorExperience",
      question: {
        English: "Do you have prior experience in the area you are thinking of studying?",
        Español: "¿Tienes experiencia previa en el área que piensas estudiar?",
        Français: "Avez-vous une expérience préalable dans le domaine que vous pensez étudier?",
      },
      placeholder: {
        English: "Yes / No",
        Español: "Sí / No",
        Français: "Oui / Non",
      },
      type: "text",
      options: ["Yes", "No"] as const,
    },
    {
      id: "workAuthorization",
      question: {
        English: "Do you currently have work authorization in the United States?",
        Español: "¿Tienes autorización de trabajo en Estados Unidos?",
        Français: "Avez-vous actuellement une autorisation de travail aux États-Unis?",
      },
      placeholder: {
        English: "Yes / No",
        Español: "Sí / No",
        Français: "Oui / Non",
      },
      type: "text",
      options: ["Yes", "No"] as const,
    },
  ],
} as const;

const INITIAL_VALUES = {
  name: "",
  email: "",
  phone: "",
  availability: "",
  program: "",
  location: "",
  csnBefore: "",
  gedHiset: "",
  heardAbout: "",
  transportation: "",
  level: "",
  improve: "",
  studiedBefore: "",
  passedSubjects: "",
  supportSubject: "",
  area: "",
  priorExperience: "",
  workAuthorization: "",
};

type SubmissionValues = typeof INITIAL_VALUES;
type SubmissionField = keyof SubmissionValues;
type SubmissionStep = (typeof BASE_STEPS)[number] | (typeof PROFILE_STEPS)[keyof typeof PROFILE_STEPS][number];

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
  goBack: () => void;
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

  const steps = useMemo(() => {
    const program = values.program as keyof typeof PROFILE_STEPS;
    return [...BASE_STEPS, ...(PROFILE_STEPS[program] ?? [])];
  }, [values.program]);

  const current = steps[step];

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

  const goBack = () => {
    if (step === 0 || done) {
      return;
    }

    setError(null);
    setVisible(false);

    window.setTimeout(() => {
      setStep((currentStep) => Math.max(0, currentStep - 1));
      setVisible(true);
    }, 260);
  };

  const advance = () => {
    setError(null);
    setVisible(false);

    window.setTimeout(() => {
      if (step === steps.length - 1) {
        void submit();
        return;
      }

      setStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
      setVisible(true);
    }, 260);
  };

  return (
    <SubmissionContext.Provider
      value={{
        steps,
        step,
        current,
        values,
        visible,
        done,
        isSubmitting,
        error,
        setValue,
        advance,
        goBack,
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
