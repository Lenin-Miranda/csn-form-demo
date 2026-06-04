import axios from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_URL

if (!baseURL) {
  throw new Error('Missing NEXT_PUBLIC_API_URL')
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})
