import axios from 'axios'
import type { ApiResponse } from '@/types'

const isApiResponse = (value: unknown): value is ApiResponse<unknown> => {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  return 'message' in value
}

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (!axios.isAxiosError(error)) {
    return fallback
  }

  const responseData: unknown = error.response?.data
  if (isApiResponse(responseData) && responseData.message) {
    return responseData.message
  }

  return fallback
}
