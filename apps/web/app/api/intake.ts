import { createLogger } from '@/lib/logger'
import { api } from './axios'

const logger = createLogger('IntakeApi')

export type IntakeQuestionType =
  | 'text'
  | 'email'
  | 'tel'
  | 'textarea'
  | 'select'
  | 'number'
  | 'date'
  | 'boolean'

export interface IntakeQuestion {
  questionId: string
  fieldKey: string
  label: string
  type: IntakeQuestionType
  placeholder: string | null
  isRequired: boolean
  position: number
  options: string[] | null
  createdAt: string
}

export interface IntakeFormResponse {
  id: string
  slug: string
  title: string
  description: string | null
  isActive: boolean
  questions: IntakeQuestion[]
}

export async function fetchIntake(formSlug?: string) {
  const path = formSlug ? `/intake/${formSlug}/questions` : '/intake'

  logger.log('Loading intake questions', { formSlug: formSlug ?? 'default' })

  try {
    const response = await api.get<IntakeFormResponse>(path)
    logger.log('Intake questions loaded', {
      formSlug: response.data.slug,
      questionCount: response.data.questions.length,
    })
    return response.data
  } catch (error) {
    logger.error('Failed to load intake questions', error)
    throw error
  }
}

export async function fetchPreviousIntakeQuestion(
  formSlug: string,
  questionId: string,
) {
  const path = `/intake/${formSlug}/questions/${questionId}/previous`

  logger.log('Loading previous intake question', { formSlug, questionId })

  try {
    const response = await api.get<IntakeQuestion | null>(path)
    return response.data
  } catch (error) {
    logger.error('Failed to load previous intake question', error)
    throw error
  }
}

export async function fetchNextIntakeQuestion(formSlug: string, questionId: string) {
  const path = `/intake/${formSlug}/questions/${questionId}/next`

  logger.log('Loading next intake question', { formSlug, questionId })

  try {
    const response = await api.get<IntakeQuestion | null>(path)
    return response.data
  } catch (error) {
    logger.error('Failed to load next intake question', error)
    throw error
  }
}
