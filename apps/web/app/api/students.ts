import { createLogger } from '@/lib/logger'
import { api } from './axios'

const logger = createLogger('StudentsApi')

export interface CreateStudentPayload {
  name: string
  email: string
  phone: string
}

export async function createStudent(payload: CreateStudentPayload) {
  logger.log('Creating student')

  try {
    const response = await api.post('/students', payload)
    logger.log('Student created', { id: response.data?.id })
    return response.data
  } catch (error) {
    logger.error('Failed to create student', error)
    throw error
  }
}
