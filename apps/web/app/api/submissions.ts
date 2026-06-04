import { api } from './axios'

export interface CreateSubmissionPayload {
  name: string
  email: string
  phone: string
  program: string
}

export async function createSubmission(payload: CreateSubmissionPayload) {
  const response = await api.post('/submissions', payload)
  return response.data
}
