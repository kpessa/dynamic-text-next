export interface FunctionResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: unknown
  }
  timestamp: number
}

export interface FunctionMetadata {
  executionTime: number
  requestId: string
  version?: string
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface BatchOperationResult<T = unknown> {
  successful: T[]
  failed: Array<{
    item: T
    error: {
      code: string
      message: string
    }
  }>
  totalProcessed: number
  totalSuccessful: number
  totalFailed: number
}

export interface ValidationResult {
  isValid: boolean
  errors: Array<{
    field: string
    message: string
    code?: string
  }>
  warnings?: Array<{
    field: string
    message: string
  }>
}

export interface OperationStatus {
  operationId: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress?: {
    current: number
    total: number
    percentage: number
  }
  result?: unknown
  error?: {
    code: string
    message: string
  }
  startedAt: number
  completedAt?: number
}