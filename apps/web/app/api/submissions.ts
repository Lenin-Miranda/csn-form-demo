import { createLogger } from '@/lib/logger'
import { api } from './axios'

const logger = createLogger('SubmissionsApi')

export interface CreateSubmissionPayload {
  name: string
  email: string
  phone: string
  program: string
  availability: string
  location: string
  csnBefore: string
  gedHiset: string
  heardAbout: string
  transportation: string
  level?: string
  improve?: string
  studiedBefore?: string
  passedSubjects?: string
  supportSubject?: string
  area?: string
  priorExperience?: string
  workAuthorization?: string
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
