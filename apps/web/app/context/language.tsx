'use client'

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'

export const LANGUAGES = ['English', 'Español', 'Français'] as const
export type Language = (typeof LANGUAGES)[number]

export const OPTION_LABELS = {
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

const TRANSLATIONS = {
    English: {
        language: 'Language',
        headerTitle: 'Student interest & classification',
        headerSubtitle: 'ABE Enrollment',
        progress: 'Progress',
        required: 'Required',
        back: 'Back',
        continue: 'Continue',
        allDone: 'All done',
        thankYou: "Thank you. We'll be in touch shortly.",
    },
    Español: {
        language: 'Idioma',
        headerTitle: 'Interés y clasificación estudiantil',
        headerSubtitle: 'Inscripción ABE',
        progress: 'Progreso',
        required: 'Requerido',
        back: 'Atrás',
        continue: 'Continuar',
        allDone: 'Todo listo',
        thankYou: 'Gracias. Nos pondremos en contacto pronto.',
    },
    Français: {
        language: 'Langue',
        headerTitle: "Intérêt et classification de l'étudiant",
        headerSubtitle: 'Inscription ABE',
        progress: 'Progression',
        required: 'Requis',
        back: 'Retour',
        continue: 'Continuer',
        allDone: 'Terminé',
        thankYou: 'Merci. Nous vous contacterons bientôt.',
    },
} as const

type TranslationKey = keyof typeof TRANSLATIONS['English']

type LanguageContextValue = {
    language: Language
    setLanguage: (language: Language) => void
    t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>('English')

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t: (key: TranslationKey) => TRANSLATIONS[language][key],
        }),
        [language],
    )

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
