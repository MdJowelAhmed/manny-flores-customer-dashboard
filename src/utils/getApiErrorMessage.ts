import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

type ApiError = FetchBaseQueryError | SerializedError | unknown

export function getApiErrorMessage(error: ApiError, fallback: string): string {
  if (!error) return fallback

  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as FetchBaseQueryError).data
    if (data && typeof data === 'object') {
      const message = (data as { message?: string }).message
      if (message) return message
    }
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as SerializedError).message
    if (message) return message
  }

  return fallback
}
