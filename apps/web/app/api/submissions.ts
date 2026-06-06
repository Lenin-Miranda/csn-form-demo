import { createLogger } from '@/lib/logger'
import { api } from './axios'

const logger = createLogger('SubmissionsApi')

export interface CreateSubmissionAnswerPayload {
  questionId: string
  value: string
}

export interface CreateSubmissionPayload {
  formSlug?: string
  name: string
  email: string
  phone: string
  program: string
  answers: CreateSubmissionAnswerPayload[]
}

export async function createSubmission(payload: CreateSubmissionPayload) {
  logger.log('Creating submission')

  try {
    const response = await api.post('/submissions', payload)
    logger.log('Submission created', { id: response.data?.id })
    return response.data
  } catch (error) {
    logger.error('Failed to create submission', error)
    throw error
  }
}
