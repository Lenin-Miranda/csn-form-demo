import { api } from './axios'

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
  const response = await api.post('/submissions', payload)
  return response.data
}
