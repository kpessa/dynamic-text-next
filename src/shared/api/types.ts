/**
 * Shared API Types
 * Common types for API communication
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  metadata?: ResponseMetadata
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
}

export interface ResponseMetadata {
  timestamp: string
  version: string
  requestId?: string
}

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasNext: boolean
  hasPrevious: boolean
}